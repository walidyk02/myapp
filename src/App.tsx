import React, { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { ScriptGenerator } from './components/ScriptGenerator';
import { ScriptOutput } from './components/ScriptOutput';
import { PDFViewer } from './components/PDFViewer';
import { GenerateReport } from './components/GenerateReport';
import { supabase } from './lib/supabase.ts';
import type { ScriptForm, OllamaStatus } from './types';



function App() {
  const [form, setForm] = useState<ScriptForm>({ name: '', description: '' });
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/status`);
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
    
    console.log('Form data being sent:', form); // Log les données envoyées
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
  
      if (!response.ok) {
        const data = await response.json();
        console.log('Error response:', data); // Log la réponse d'erreur
        throw new Error(data.message || 'Failed to generate script');
      }
  
      const data = await response.json();
      console.log('Success response:', data); // Log la réponse en cas de succès
      setGeneratedScript(data.script);
  
      // Save to Supabase
      const { error: saveError } = await supabase
        .from('scenarios')
        .insert({
          name: form.name,
          description: form.description,
          status: 'completed',
          created_at: new Date().toISOString(),
        });
  
      if (saveError) throw saveError;
      
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
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <Code2 className="w-10 h-10 text-blue-400" />
              <h1 className="text-3xl font-bold">Script Generator AI</h1>
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