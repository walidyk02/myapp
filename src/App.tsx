import React, { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import { ScriptGenerator } from './components/ScriptGenerator';
import { ScriptOutput } from './components/ScriptOutput';
import { GenerateReport } from './components/GenerateReport';
import { ScriptHistory } from './components/ScriptHistory';
import { useScriptHistory } from './hooks/useScriptHistory';
import type { ScriptForm, OllamaStatus } from './types';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState<ScriptForm>({ name: '', description: '' });
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const backendUrl = import.meta.env.VITE_API_URL;
  const { history, addToHistory, removeFromHistory, clearHistory } = useScriptHistory();

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success response:', data);
      const script = data.script;
      setGeneratedScript(script);
      setIsLoading(false);
      
      // Ajouter à l'historique avec le script généré
      if (script) {
        addToHistory(script, form);
      }
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
      <div className="min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <ScriptHistory
          items={history.items}
          onSelect={(item) => {
            // Mettre à jour le formulaire
            setForm({
              name: item.name,
              description: item.description
            });
            // Restaurer le script
            if (item.script) {
              setGeneratedScript(item.script);
              console.log('Script restauré:', item.script);
            }
          }}
          onDelete={removeFromHistory}
          onClear={clearHistory}
        />
        <div className="flex-1 p-8 space-y-8">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-2">
            <div className="flex items-center gap-3">
              <Code2 className="w-10 h-10 text-blue-400" />
              <h1 className="text-2xl font-bold">Script Generator</h1>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
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

            </div>
            <ScriptOutput script={generatedScript} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
