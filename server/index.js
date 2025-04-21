import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA_URL = 'http://localhost:11434';

// Function to check if Ollama is running and model is available
async function checkOllamaStatus() {
  try {
    // Check if Ollama is running
    const versionResponse = await axios.get(`${OLLAMA_URL}/api/version`);
    
    // Check if CodeLlama model is available
    const modelResponse = await axios.post(`${OLLAMA_URL}/api/show`, {
      name: 'codellama'
    });
    
    return { 
      running: true, 
      version: versionResponse.data.version,
      model: modelResponse.data ? 'available' : 'not found'
    };
  } catch (error) {
    console.error('Ollama connection error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return { 
        running: false, 
        error: 'Ollama is not running. Please start Ollama using: ollama serve'
      };
    }
    
    if (error.response?.status === 404) {
      return { 
        running: true, 
        error: 'CodeLlama model not found. Please install it using: ollama pull codellama'
      };
    }
    
    return { 
      running: false, 
      error: `Unexpected error: ${error.message}`
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

// Default route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Script Generator API is running',
    endpoints: {
      '/': 'API status',
      '/api/status': 'Ollama status',
      '/api/generate': 'Generate script (POST)'
    }
  });
});

app.get('/api/status', async (req, res) => {
  try {
    const status = await checkOllamaStatus();
    res.json({ 
      status: status.running ? 'running' : 'not_running',
      message: status.running 
        ? status.error || `Ollama is running (version ${status.version}, model: ${status.model})`
        : status.error || 'Ollama is not running. Please start Ollama first.',
      details: status
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to check Ollama status',
      error: error.message
    });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    // Check if Ollama is running
    const status = await checkOllamaStatus();
    if (!status.running || status.error) {
      return res.status(503).json({ 
        error: 'Ollama service unavailable',
        message: status.error || 'Please make sure Ollama is running and the CodeLlama model is installed.',
        details: status
      });
    }

    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both name and description are required'
      });
    }

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Checking Ollama connection...`);
  checkOllamaStatus().then(status => {
    if (status.running && !status.error) {
      console.log(`✓ Connected to Ollama (version ${status.version})`);
      console.log(`✓ Server ready at http://localhost:${PORT}`);
    } else {
      console.log(`✗ ${status.error || 'Could not connect to Ollama'}`);
      if (!status.running) {
        console.log('Run: ollama serve');
      } else if (status.error?.includes('not found')) {
        console.log('Run: ollama pull codellama');
      }
    }
  });
});