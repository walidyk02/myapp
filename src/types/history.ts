export interface ScriptHistoryItem {
  id: string;
  name: string;
  description: string;
  script: string;
  createdAt: string;
}

export interface ScriptHistory {
  items: ScriptHistoryItem[];
}
