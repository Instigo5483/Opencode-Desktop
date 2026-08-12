export interface Session {
  id: string;
  project_id: string;
  title: string;
  directory: string;
  model: string | null;
  agent: string | null;
  cost: number;
  tokens_input: number;
  tokens_output: number;
  time_created: number;
  time_updated: number;
  parent_id: string | null;
  share_url: string | null;
}

export interface Project {
  id: string;
  worktree: string;
  vcs: string | null;
  name: string | null;
  time_created: number;
  time_updated: number;
}

export interface Message {
  id: string;
  session_id: string;
  data: string;
  time_created: number;
  time_updated: number;
}

export interface Part {
  id: string;
  message_id: string;
  session_id: string;
  data: string;
  time_created: number;
  time_updated: number;
}

export interface MessageData {
  role: "user" | "assistant" | "system";
  content?: string | Array<{ type: string; text?: string; image?: string }>;
  toolInvocations?: ToolInvocation[];
}

export interface ToolInvocation {
  state: "call" | "result";
  toolCallId: string;
  toolName: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

export interface SessionStats {
  total_tokens_input: number;
  total_tokens_output: number;
  total_cost: number;
  message_count: number;
}

export interface AttachmentInfo {
  id: string;
  path: string;
  filename: string;
  size: number;
}

export interface FolderInfo {
  path: string;
  name: string;
  is_git: boolean;
  has_opencode_config: boolean;
}

export interface DbStatus {
  available: boolean;
  path: string;
}

export interface SpawnResult {
  success: boolean;
  exit_code: number;
  output: string;
}

export interface PendingAttachment {
  id: string;
  file: File;
  previewUrl: string;
  savedPath?: string;
}

export interface ModelEntry {
  provider_id: string;
  model_id: string;
  display_name: string;
  description: string;
}
