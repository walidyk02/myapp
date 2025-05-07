import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { supabase } from './supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
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
    // 1. Récupère le core code
    const coreCode = await getCoreCode();

    // 2. Récupère les exemples de scripts
    const { data, error } = await supabase
      .from('manual_scripts')
      .select('name, description, script')
      .limit(3);

    if (error) throw error;

    const examples = data || [];

    const formatted = examples.map((ex) => (
      `---\nName: ${ex.name}\nDescription: ${ex.description}\nScript:\n${ex.script}\n---`
    )).join('\n\n');

    // 3. Assemble le prompt complet
    const prompt = `
You are a JavaScript expert using the WP framework.

Here are utility functions you can use:
\`\`\`javascript
${coreCode}
\`\`\`

Here are example scripts:
${formatted || '// No examples found.'}

Now, generate a new script based on the following request:

Name: ${name}
Description: ${description}

Script:
`.trim();

    console.log('🧪 Prompt généré :\n', prompt);

    return { prompt, examples };
  } catch (error) {
    console.error('❌ Erreur lors de la génération du prompt :', error.message);
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
  const status = await checkOllamaStatus();
  if (!status.running || status.error) {
    return res.status(503).json({ error: 'Service Ollama indisponible', message: status.error });
  }

  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({
      error: 'Champs requis manquants',
      message: 'Les champs "name" et "description" sont requis.',
    });
  }

  // ❗️ Nouveau : récupère prompt + exemples utilisés
const { prompt, examples } = await generatePrompt(name, description);
if (!prompt) {
  return res.status(500).json({ error: 'Erreur lors de la génération du prompt.' });
}

  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL_NAME,
      prompt,
      stream: false,
      options: {
        temperature: 0.5,
        top_p: 0.9,
        stop: ["```"]
      },
    });

    const generatedScript = response.data?.response;
    if (!generatedScript) throw new Error('Aucune réponse reçue du modèle.');

    // Enregistrement dans Supabase
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
      console.error('❌ Erreur insertion Supabase :', insertError.message);
    }

    res.json({
      script: generatedScript,
      metadata: {
        model: MODEL_NAME,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors de l’appel à Ollama :', error);
    res.status(500).json({
      error: error.message || 'Erreur de génération',
      details: error.response?.data || null,
    });
  }
});

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
