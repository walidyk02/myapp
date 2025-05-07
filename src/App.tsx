import React, { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { ScriptGenerator } from './components/ScriptGenerator';
import { ScriptOutput } from './components/ScriptOutput';
import { PDFViewer } from './components/PDFViewer';
import { GenerateReport } from './components/GenerateReport';
import type { ScriptForm, OllamaStatus } from './types';

function App() {
  const [form, setForm] = useState<ScriptForm>({ name: '', description: '' });
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    checkOllamaStatus();
  }, []);

  useEffect(() => {
    if (!backendUrl) {
      toast.error('VITE_API_URL is not defined!');
    }
  }, []);
  
  useEffect(() => {
    const pingBackend = async () => {
      try {
        const res = await fetch(`${backendUrl}/ping`);
        if (res.ok) {
          console.log('✅ Backend is reachable');
        } else {
          toast.error('⚠️ Backend reachable but returned an error');
        }
      } catch (err) {
        toast.error('❌ Could not reach backend at ' + backendUrl);
      }
    };
  
    if (backendUrl) pingBackend();
  }, [backendUrl]);

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/status`);
      const data: OllamaStatus = await response.json();

      if (data.status === 'not_running') {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Failed to check Ollama status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Form data being sent:', form);

    try {
      const response = await fetch(`${backendUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        console.log('Error response:', data);
        throw new Error(data.message || 'Failed to generate script');
      }

      const data = await response.json();
      console.log('Success response:', data);
      setGeneratedScript(data.script);

      toast.success('Script generated and saved successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
      setGeneratedScript('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-2">
            <div className="flex items-center gap-3">
              <Code2 className="w-10 h-10 text-blue-400" />
              <h1 className="text-3xl font-bold">Script Generator AI</h1>
            </div>
            <div className="text-sm text-gray-400">
              Backend connecté : <span className="text-green-400">{backendUrl}</span>
            </div>
            <GenerateReport script={generatedScript} form={form} />
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <ScriptGenerator
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
              />
              <PDFViewer />
            </div>
            <ScriptOutput script={generatedScript} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
