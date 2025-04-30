import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { supabase } from './supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const OLLAMA_URL = 'http://localhost:11434';

// Vérification des variables d'environnement
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('⚠️ Variables Supabase manquantes. Vérifiez .env');
}

app.use(cors());
app.use(express.json());

// Vérifie si Ollama est actif et si le modèle est chargé
async function checkOllamaStatus() {
  try {
    const versionRes = await axios.get(`${OLLAMA_URL}/api/version`);
    const modelRes = await axios.post(`${OLLAMA_URL}/api/show`, { name: 'codellama' });

    return {
      running: true,
      version: versionRes.data.version,
      model: modelRes.data ? 'available' : 'not found',
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return {
        running: false,
        error: 'Ollama n\'est pas lancé. Exécutez : ollama serve',
      };
    }
    if (error.response?.status === 404) {
      return {
        running: true,
        error: 'Le modèle CodeLlama est introuvable. Exécutez : ollama pull codellama',
      };
    }
    console.error('Erreur inattendue lors de la connexion à Ollama :', error);
    return {
      running: false,
      error: `Erreur inattendue : ${error.message}`,
    };
  }
}

async function generatePrompt(name, description) {
  const { data: manualScripts, error } = await supabase
    .from('manual_scripts')
    .select('name, description, script')
    .limit(3); // tu peux augmenter ce nombre si besoin

  if (error) {
    console.error('Erreur lors de la récupération des scripts :', error.message);
  }

  const examples = manualScripts?.length
    ? manualScripts.map((s, i) => `
Example ${i + 1}
Name: ${s.name}
Description: ${s.description}
Script:
${s.script}
`).join('\n\n')
    : '// Aucun exemple trouvé.';

  return `Generate a JavaScript script based on the following requirements:
Name: ${name}
Description: ${description}

Here are some example scripts to guide you:
${examples}

Please provide a complete, working JavaScript implementation that fulfills these requirements.
Include comments explaining the code.`;
}


// Route par défaut
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Script Generator API is running',
    endpoints: {
      '/api/status': 'Ollama status',
      '/api/generate': 'Generate script (POST)',
      '/api/healthcheck': 'Basic health check'
    }
  });
});

// Vérification de l'état d'Ollama
app.get('/api/status', async (req, res) => {
  const status = await checkOllamaStatus();
  res.json({
    status: status.running ? 'running' : 'not_running',
    message: status.error || `Ollama is running (version ${status.version}, model: ${status.model})`,
    details: status
  });
});

// Health check simple
app.get('/api/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

// Génération de script
app.post('/api/generate', async (req, res) => {
  const status = await checkOllamaStatus();
  if (!status.running || status.error) {
    return res.status(503).json({
      error: 'Service Ollama indisponible',
      message: status.error,
    });
  }

  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      error: 'Champs requis manquants',
      message: 'Le nom et la description sont obligatoires',
    });
  }

  const prompt = await generatePrompt(name, description);

  try {
    const ollamaRes = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'codellama',
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      }
    });

    if (!ollamaRes.data.response) throw new Error('Aucune réponse d\'Ollama');

    const { error: insertError } = await supabase
      .from('scenarios')
      .insert([{
        name,
        description,
        model_data: {
          prompt,
          script: ollamaRes.data.response
        }
      }]);

    if (insertError) {
      console.error('Erreur lors de l\'insertion dans `scenarios` :', insertError.message);
    }

    res.json({
      script: ollamaRes.data.response,
      metadata: {
        model: 'codellama',
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération ou de l\'insertion :', error);
    res.status(500).json({
      error: error.response?.data?.error || error.message || 'Échec de la génération du script',
      details: {
        code: error.code,
        message: error.message,
        response: error.response?.data,
      }
    });
  }
});

// Démarrage du serveur
app.listen(PORT, async () => {
  console.log(`🚀 Serveur en cours d'exécution : http://localhost:${PORT}`);
  const status = await checkOllamaStatus();

  if (status.running && !status.error) {
    console.log(`✅ Connecté à Ollama (version : ${status.version})`);
  } else {
    console.warn(`⚠️ ${status.error}`);
    if (!status.running) {
      console.warn('👉 Commande à exécuter : ollama serve');
    } else if (status.error?.includes('not found')) {
      console.warn('👉 Commande à exécuter : ollama pull codellama');
    }
  }
});
