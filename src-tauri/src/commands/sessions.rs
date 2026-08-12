use crate::db::types::Session;
use crate::db::Database;

#[tauri::command]
pub fn list_sessions(state: tauri::State<'_, Database>) -> Result<Vec<Session>, String> {
    state.list_sessions()
}

#[tauri::command]
pub fn get_session(
    state: tauri::State<'_, Database>,
    session_id: String,
) -> Result<Session, String> {
    state.get_session(&session_id)
}

#[tauri::command]
pub fn get_session_messages(
    state: tauri::State<'_, Database>,
    session_id: String,
) -> Result<Vec<crate::db::types::Message>, String> {
    state.get_session_messages(&session_id)
}

#[tauri::command]
pub fn get_message_parts(
    state: tauri::State<'_, Database>,
    session_id: String,
) -> Result<Vec<crate::db::types::Part>, String> {
    state.get_message_parts(&session_id)
}

#[tauri::command]
pub fn get_session_stats(
    state: tauri::State<'_, Database>,
    session_id: String,
) -> Result<crate::db::types::SessionStats, String> {
    state.get_session_stats(&session_id)
}

#[tauri::command]
pub fn search_sessions(
    state: tauri::State<'_, Database>,
    query: String,
) -> Result<Vec<Session>, String> {
    state.search_sessions(&query)
}

#[tauri::command]
pub fn list_projects(
    state: tauri::State<'_, Database>,
) -> Result<Vec<crate::db::types::Project>, String> {
    state.list_projects()
}

#[tauri::command]
pub fn rename_session(
    state: tauri::State<'_, Database>,
    session_id: String,
    new_title: String,
) -> Result<(), String> {
    state.rename_session(&session_id, &new_title)
}

#[tauri::command]
pub fn delete_session(state: tauri::State<'_, Database>, session_id: String) -> Result<(), String> {
    state.delete_session(&session_id)
}

#[tauri::command]
pub fn check_db_status() -> Result<DbStatus, String> {
    let path = Database::db_path()?;
    Ok(DbStatus {
        available: true,
        path: path.to_string_lossy().to_string(),
    })
}

#[derive(serde::Serialize)]
pub struct DbStatus {
    pub available: bool,
    pub path: String,
}
