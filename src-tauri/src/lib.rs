mod attachment;
mod commands;
mod db;

use db::Database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let database = match Database::new() {
        Ok(db) => Some(db),
        Err(e) => {
            eprintln!("Warning: Could not open OpenCode database: {}", e);
            None
        }
    };

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init());

    if let Some(db) = database {
        builder = builder.manage(db);
    }

    builder
        .invoke_handler(tauri::generate_handler![
            // Session commands
            commands::sessions::list_sessions,
            commands::sessions::get_session,
            commands::sessions::get_session_messages,
            commands::sessions::get_message_parts,
            commands::sessions::get_session_stats,
            commands::sessions::search_sessions,
            commands::sessions::list_projects,
            commands::sessions::rename_session,
            commands::sessions::delete_session,
            commands::sessions::check_db_status,
            // Project commands
            commands::projects::select_folder,
            commands::projects::create_project_folder,
            commands::projects::validate_folder,
            // Image commands
            commands::images::save_image_attachment,
            commands::images::save_clipboard_image,
            commands::images::list_attachments,
            commands::images::delete_attachment,
            commands::images::cleanup_old_attachments,
            commands::images::image_to_base64,
            commands::images::pick_image_files,
            // Model commands
            commands::models::list_models,
            commands::models::get_current_model,
            commands::models::get_models_for_provider,
            // OpenCode CLI commands
            commands::opencode::send_prompt,
            commands::opencode::spawn_opencode_tui,
        ])
        .run(tauri::generate_context!())
        .expect("error while running opencode-desktop");
}
