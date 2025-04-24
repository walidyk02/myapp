export interface ScriptForm {
  name: string;
  description: string;
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