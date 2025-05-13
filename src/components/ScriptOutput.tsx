import { useState } from 'react';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface ScriptOutputProps {
  script: string;
}

export function ScriptOutput({ script }: ScriptOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      toast.success("✅ Script copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("❌ Erreur lors de la copie");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl relative">
      <h2 className="text-xl font-semibold mb-4 text-white">Generated Script</h2>

      <button
        onClick={handleCopy}
        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded flex items-center text-sm"
        title="Copier le script"
      >
        <Copy className="h-4 w-4 mr-1" />
        {copied ? "Copié" : "Copier"}
      </button>

      <pre className="bg-gray-900 p-4 rounded-md overflow-auto h-[calc(100%-4rem)]">
        <code className="text-sm font-mono text-gray-300">
          {script || '// Your generated script will appear here'}
        </code>
      </pre>
    </div>
  );
}
