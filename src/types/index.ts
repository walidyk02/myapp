export interface ScriptForm {
  name: string;
  description: string;
  temperature?: number;
  top_p?: number;
}

export interface Script {
  id: string;
  name: string;
  description: string;
  code: string;
  created_at: string;
}

export interface OllamaStatus {
  status: 'running' | 'not_running';
  message: string;
}