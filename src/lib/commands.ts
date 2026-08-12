import { invoke } from "@tauri-apps/api/core";
import type {
  Session,
  Message,
  Part,
  SessionStats,
  Project,
  DbStatus,
  FolderInfo,
  AttachmentInfo,
  SpawnResult,
  ModelEntry,
} from "./types";

export async function listSessions(): Promise<Session[]> {
  return invoke<Session[]>("list_sessions");
}

export async function getSession(sessionId: string): Promise<Session> {
  return invoke<Session>("get_session", { sessionId });
}

export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  return invoke<Message[]>("get_session_messages", { sessionId });
}

export async function getMessageParts(sessionId: string): Promise<Part[]> {
  return invoke<Part[]>("get_message_parts", { sessionId });
}

export async function getSessionStats(sessionId: string): Promise<SessionStats> {
  return invoke<SessionStats>("get_session_stats", { sessionId });
}

export async function searchSessions(query: string): Promise<Session[]> {
  return invoke<Session[]>("search_sessions", { query });
}

export async function listProjects(): Promise<Project[]> {
  return invoke<Project[]>("list_projects");
}

export async function checkDbStatus(): Promise<DbStatus> {
  return invoke<DbStatus>("check_db_status");
}

export async function renameSession(sessionId: string, newTitle: string): Promise<void> {
  return invoke<void>("rename_session", { sessionId, newTitle });
}

export async function deleteSession(sessionId: string): Promise<void> {
  return invoke<void>("delete_session", { sessionId });
}

export async function selectFolder(): Promise<string | null> {
  return invoke<string | null>("select_folder");
}

export async function createProjectFolder(path: string): Promise<string> {
  return invoke<string>("create_project_folder", { path });
}

export async function validateFolder(path: string): Promise<FolderInfo> {
  return invoke<FolderInfo>("validate_folder", { path });
}

export async function saveImageAttachment(
  data: number[],
  filename: string
): Promise<AttachmentInfo> {
  return invoke<AttachmentInfo>("save_image_attachment", {
    data,
    filename,
  });
}

export async function listAttachments(): Promise<AttachmentInfo[]> {
  return invoke<AttachmentInfo[]>("list_attachments");
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  return invoke<void>("delete_attachment", { attachmentId });
}

export async function cleanupOldAttachments(maxAgeHours: number): Promise<number> {
  return invoke<number>("cleanup_old_attachments", { maxAgeHours });
}

export async function imageToBase64(path: string): Promise<string> {
  return invoke<string>("image_to_base64", { path });
}

export async function sendPrompt(
  text: string,
  images: string[],
  projectDir?: string,
  model?: string,
  sessionId?: string,
  agent?: string
): Promise<SpawnResult> {
  return invoke<SpawnResult>("send_prompt", {
    text,
    images,
    projectDir: projectDir || null,
    model: model || null,
    sessionId: sessionId || null,
    agent: agent || null,
  });
}

export async function spawnOpencodeTui(projectDir?: string): Promise<void> {
  return invoke<void>("spawn_opencode_tui", {
    projectDir: projectDir || null,
  });
}

export async function listModels(): Promise<ModelEntry[]> {
  return invoke<ModelEntry[]>("list_models");
}

export async function getCurrentModel(): Promise<string | null> {
  return invoke<string | null>("get_current_model");
}

export async function getModelsForProvider(providerId: string): Promise<ModelEntry[]> {
  return invoke<ModelEntry[]>("get_models_for_provider", { providerId });
}
