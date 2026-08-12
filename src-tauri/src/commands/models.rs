use crate::db::models;

#[tauri::command]
pub fn list_models() -> Result<Vec<models::ModelEntry>, String> {
    models::list_available_models()
}

#[tauri::command]
pub fn get_current_model() -> Result<Option<String>, String> {
    models::get_current_model()
}

#[tauri::command]
pub fn get_models_for_provider(provider_id: String) -> Result<Vec<models::ModelEntry>, String> {
    models::get_models_for_provider(&provider_id)
}
