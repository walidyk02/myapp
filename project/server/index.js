import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Utilise la variable d'environnement si définie
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

const OLLAMA_URL = 'http://localhost:11434';

// Function to check if Ollama is running and model is available
async function checkOllamaStatus() {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/version`);
    return {
      status: 'running',
      version: response.data.version
    };
  } catch (error) {
    console.error('Ollama connection error:', error.message);
    return {
      status: 'not_running',
      error: 'Ollama is not running. Please start Ollama first.'
    };
  }
}

app.get('/api/status', async (req, res) => {
  const status = await checkOllamaStatus();
  res.json(status);
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'codellama',
      prompt,
      stream: false
    });

    res.json({ 
      completion: response.data.response,
      status: 'success'
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      details: error.message
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Checking Ollama connection...');
  
  checkOllamaStatus().then(status => {
    if (status.status === 'running') {
      console.log(`✓ Connected to Ollama (version ${status.version})`);
    } else {
      console.log(`\n✗ ${status.error}`);
      console.log('\nTo fix this:');
      console.log('1. Open a new terminal');
      console.log('2. Run: ollama serve');
      console.log('3. Run: ollama pull codellama');
    }
  });
});