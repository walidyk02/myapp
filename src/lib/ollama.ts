import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA_URL = 'http://localhost:11434';

type OllamaStatus =
  | { status: 'running'; version: string }
  | { status: 'not_running'; error: string };

// Route pour le chemin racine
app.get('/', (_req: Request, res: Response) => {
  res.send('Bienvenue sur le serveur Ollama');
});

// Fonction pour vérifier si Ollama est en cours d'exécution et si le modèle est disponible
async function checkOllamaStatus(): Promise<OllamaStatus> {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/version`);
    return {
      status: 'running',
      version: response.data.version,
    };
  } catch (error: any) {
    console.error('Erreur de connexion à Ollama :', error.message);
    return {
      status: 'not_running',
      error: 'Ollama n\'est pas en cours d\'exécution. Veuillez démarrer Ollama d\'abord.',
    };
  }
}

app.get('/api/status', async (_req: Request, res: Response) => {
  const status = await checkOllamaStatus();
  res.json(status);
});

app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'codellama',
      prompt,
      stream: false,
    });

    res.json({
      completion: response.data.response,
      status: 'success',
    });
  } catch (error: any) {
    console.error('Erreur de génération :', error.message);
    res.status(500).json({
      error: 'Échec de la génération de la réponse',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 300;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
  console.log('Vérification de la connexion à Ollama...');

  checkOllamaStatus().then((status) => {
    if (status.status === 'running') {
      console.log(`✓ Connecté à Ollama (version ${status.version})`);
    } else {
      console.log(`\n✗ ${status.error}`);
      console.log('\nPour résoudre ce problème :');
      console.log('1. Ouvrez un nouveau terminal');
      console.log('2. Exécutez : ollama serve');
      console.log('3. Exécutez : ollama pull codellama');
    }
  });
});
