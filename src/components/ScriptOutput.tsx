

interface ScriptOutputProps {
  script: string;
}

export function ScriptOutput({ script }: ScriptOutputProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-xl font-semibold mb-4">Generated Script</h2>
      <pre className="bg-gray-900 p-4 rounded-md overflow-auto h-[calc(100%-4rem)]">
        <code className="text-sm font-mono text-gray-300">
          {script || '// Your generated script will appear here'}
        </code>
      </pre>
    </div>
  );
}