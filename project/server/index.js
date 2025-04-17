import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA_URL = 'http://localhost:11434';

// Function to check if Ollama is running
async function checkOllamaStatus() {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/version`);
    return { running: true, version: response.data.version };
  } catch (error) {
    console.error('Ollama connection error:', error.message);
    return { 
      running: false, 
      error: error.code === 'ECONNREFUSED' 
        ? 'Cannot connect to Ollama. Please make sure Ollama is running on port 11434'
        : error.message 
    };
  }
}

// Function to generate prompt
function generatePrompt(name, description) {
  return `Generate a JavaScript script based on the following requirements:
Name: ${name}
Description: ${description}

Please provide a complete, working JavaScript implementation that fulfills these requirements.
Include comments explaining the code.`;
}

app.get('/api/status', async (req, res) => {
  const status = await checkOllamaStatus();
  res.json({ 
    status: status.running ? 'running' : 'not_running',
    message: status.running 
      ? `Ollama is running (version ${status.version})`
      : status.error || 'Ollama is not running. Please start Ollama first.',
    details: status
  });
});

app.post('/api/generate', async (req, res) => {
  try {
    // Check if Ollama is running
    const status = await checkOllamaStatus();
    if (!status.running) {
      return res.status(503).json({ 
        error: 'Ollama service unavailable',
        message: status.error || 'Please make sure Ollama is running and the CodeLlama model is installed.',
        details: status
      });
    }

    const { name, description } = req.body;

    // Generate prompt
    const prompt = generatePrompt(name, description);

    // Call Ollama API using the correct format
    const ollamaResponse = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'codellama',
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9
      }
    });

    if (!ollamaResponse.data.response) {
      throw new Error('No response from Ollama');
    }

    // Save the generated script to Supabase via the frontend
    res.json({ 
      script: ollamaResponse.data.response,
      metadata: {
        model: 'codellama',
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Generation error:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Failed to generate script';
    res.status(500).json({ 
      error: errorMessage,
      details: {
        code: error.code,
        message: error.message,
        response: error.response?.data
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Checking Ollama connection...`);
  checkOllamaStatus().then(status => {
    if (status.running) {
      console.log(`✓ Connected to Ollama (version ${status.version})`);
      console.log(`✓ Server ready at http://localhost:${PORT}`);
    } else {
      console.log(`✗ ${status.error || 'Could not connect to Ollama'}`);
      console.log('Please make sure Ollama is running and the CodeLlama model is installed');
      console.log('Run: ollama pull codellama');
    }
  });
});