import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { supabase } from './supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const OLLAMA_URL = 'http://localhost:11434';
const MODEL_NAME = 'script-generator';

// Vérification des variables d'environnement
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('⚠️ Variables Supabase manquantes. Vérifiez votre fichier .env.');
}

// Middlewares
app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});


// 🔍 Vérifie l’état d’Ollama et du modèle
async function checkOllamaStatus() {
  try {
    const versionRes = await axios.get(`${OLLAMA_URL}/api/version`);
    const modelRes = await axios.post(`${OLLAMA_URL}/api/show`, { name: MODEL_NAME });

    return {
      running: true,
      version: versionRes.data.version,
      model: modelRes.data ? 'available' : 'not found',
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return {
        running: false,
        error: 'Ollama n’est pas lancé. Utilisez : ollama serve',
      };
    }
    if (error.response?.status === 404) {
      return {
        running: true,
        error: `Modèle "${MODEL_NAME}" introuvable. Utilisez : ollama pull ${MODEL_NAME}`,
      };
    }
    return {
      running: false,
      error: `Erreur inattendue : ${error.message}`,
    };
  }
}

// 🔧 Récupère le core code depuis Supabase
async function getCoreCode() {
  const { data, error } = await supabase
    .from('core_code')
    .select('content')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data?.[0]?.content) {
    console.warn('⚠️ Core code manquant ou erreur :', error?.message);
    return '// Core code indisponible';
  }

  return data[0].content;
}

// 🧠 Génère le prompt en se basant sur les exemples stockés
async function generatePrompt(name, description) {
  try {
    const coreCode = await getCoreCode();

    const { data, error } = await supabase
      .from('manual_scripts')
      .select('name, description, script')
      .limit(6);

    if (error) throw error;

    const examples = data || [];

    const formatted = examples.map(ex => (
      `---\nName: ${ex.name}\nDescription: ${ex.description}\nScript:\n${ex.script}\n---`
    )).join('\n\n');

    const prompt = `
You are a JavaScript expert specialized in web automation scripts for the WP framework.

⚠️ STRICT RULES:
- Do NOT declare any classes or import/require statements.
- Write ONLY the script logic inside the main script block.
- Use ONLY the WP.* and utilities.* functions listed below.
- Wrap your code in try/catch blocks and use WP.logMessage() for logging.
- Support both XPath and CSS selectors.
- Use scrolling and waiting utilities to mimic human behavior.
- Always validate elements before interaction.

Available utility functions:
\`\`\`javascript
// ...
\`\`\`
${coreCode}

Example scripts:
${formatted || '// No example scripts found.'}

INSTRUCTIONS:
Generate ONLY the JavaScript code that belongs inside the script block.
Return the entire output as a single JavaScript code block, without explanations or extra text.

Request:

Name: ${name}
Description: ${description}

Script:
`.trim();

    console.log('🧪 Generated prompt:\n', prompt);

    return { prompt, examples };
  } catch (error) {
    console.error('❌ Error generating prompt:', error.message);
    return { prompt: null, examples: [] };
  }
}


// 🌐 Routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Script Generator API is running',
    endpoints: {
      '/api/status': 'Check Ollama status',
      '/api/generate': 'Generate JS script (POST)',
      '/api/healthcheck': 'Basic health check',
    },
  });
});

app.get('/api/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/status', async (req, res) => {
  const status = await checkOllamaStatus();
  res.json({
    status: status.running ? 'running' : 'not_running',
    message: status.error || `Ollama is running (v${status.version}, model: ${status.model})`,
    details: status,
  });
});

// 🚀 Génération de script JS via Ollama
app.post('/api/generate', async (req, res) => {
  console.log('--- /api/generate called ---');
  try {
    let generatedScript = ''; // Declare at top of try block

    // 1. Vérifier status Ollama
    const status = await checkOllamaStatus();
    console.log('Ollama status:', status);
    if (!status.running || status.error) {
      console.error('Ollama service unavailable:', status.error);
      return res.status(503).json({ error: 'Service Ollama indisponible', message: status.error });
    }

    // 2. Vérifier présence des champs name et description
    const { name, description } = req.body;
    console.log('Request body:', req.body);
    if (!name || !description) {
      console.error('Missing required fields: name or description');
      return res.status(400).json({
        error: 'Champs requis manquants',
        message: 'Les champs "name" et "description" sont requis.',
      });
    }

    // 3. Générer prompt
    const { prompt, examples } = await generatePrompt(name, description);
    console.log('Generated prompt:', prompt);
    if (!prompt) {
      console.error('Prompt generation failed');
      return res.status(500).json({ error: 'Erreur lors de la génération du prompt.' });
    }

    // 4. Appeler Ollama API
    console.log('Calling Ollama API...');
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL_NAME,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
        top_p: 0.9,
        // stop: ['```'],
      },
    });
    console.log('Ollama API response received');
    console.log('Ollama raw response:', response.data);

    // 5. Récupération du script généré
    generatedScript = response.data?.response || ''; // Assign here

    // 6. (Optionnel) Validation simple
    // if (!generatedScript.includes('WP')) {
    //   console.warn('Generated script does not include "WP" keyword');
    //   throw new Error('Le script généré ne semble pas valide.');
    // }

    // 7. Insertion dans Supabase
    const { error: insertError } = await supabase
      .from('scenarios')
      .insert([{
        name,
        description,
        model_data: {
          prompt,
          script: generatedScript,
          examples_used: examples.map(e => ({
            name: e.name,
            description: e.description,
          })),
        },
      }]);

    if (insertError) {
      console.error('Supabase insertion error:', insertError.message);
      // Tu peux ici retourner une réponse 207 ou juste continuer
    }

    // 8. Répondre au client
    return res.status(200).json({
      script: generatedScript.trim(),
      metadata: {
        model: MODEL_NAME,
        generated_at: new Date().toISOString(),
        examples,
      },
    });

  } catch (error) {
    console.error('❌ Error in /api/generate:', error.message);
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Timeout', message: 'Le service est trop lent à répondre.' });
    }
    if (error.response) {
      console.error('Ollama error details:', error.response.data);
    }
    return res.status(500).json({
      error: error.message || 'Erreur de génération',
      details: error.response?.data || null,
    });
  }
});
        top_p: 0.9,



// ▶️ Lancer le serveur
app.listen(PORT, async () => {
  console.log(`🚀 Serveur opérationnel sur http://localhost:${PORT}`);
  const status = await checkOllamaStatus();
  if (status.running && !status.error) {
    console.log(`✅ Ollama connecté (v${status.version}, modèle: ${MODEL_NAME})`);
  } else {
    console.warn(`⚠️ ${status.error}`);
  }
});