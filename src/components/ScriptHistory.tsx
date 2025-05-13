
import { Trash2, Clock, X } from 'lucide-react';
import type { ScriptHistoryItem } from '../types/history';

interface ScriptHistoryProps {
  items: ScriptHistoryItem[];
  onSelect: (item: ScriptHistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function ScriptHistory({ items, onSelect, onDelete, onClear }: ScriptHistoryProps) {
  return (
    <div className="w-64 h-full bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col">
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Historique
        </h2>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Vider l'historique"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-4 text-gray-400 text-sm text-center">
            Aucun script dans l'historique
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {items.map(item => (
              <div
                key={item.id}
                className="group relative p-4 hover:bg-[var(--bg-primary)] cursor-pointer transition-colors"
                onClick={() => onSelect(item)}
              >
                <h3 className="font-medium mb-1 pr-6 truncate">{item.name}</h3>
                <p className="text-sm text-gray-400 truncate">{item.description}</p>
                <time className="text-xs text-gray-500 mt-1 block">
                  {new Date(item.createdAt).toLocaleString()}
                </time>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                  title="Supprimer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
