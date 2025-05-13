import { useState, useEffect } from 'react';
import type { ScriptHistoryItem, ScriptHistory } from '../types/history';
import type { ScriptForm } from '../types';

const STORAGE_KEY = 'script_history';

export function useScriptHistory() {
  const [history, setHistory] = useState<ScriptHistory>({ items: [] });

  // Charger l'historique au démarrage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  // Sauvegarder l'historique quand il change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // Ajouter un nouveau script à l'historique
  const addToHistory = (script: string, form: ScriptForm) => {
    const newItem: ScriptHistoryItem = {
      id: crypto.randomUUID(),
      name: form.name,
      description: form.description,
      script,
      createdAt: new Date().toISOString(),
    };

    setHistory(prev => ({
      items: [newItem, ...prev.items].slice(0, 50), // Garder les 50 derniers scripts
    }));
  };

  // Supprimer un script de l'historique
  const removeFromHistory = (id: string) => {
    setHistory(prev => ({
      items: prev.items.filter(item => item.id !== id),
    }));
  };

  // Vider l'historique
  const clearHistory = () => {
    setHistory({ items: [] });
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
