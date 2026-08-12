use std::path::PathBuf;

#[tauri::command]
pub async fn select_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let folder = app
        .dialog()
        .file()
        .set_title("Select Project Folder")
        .blocking_pick_folder();

    Ok(folder.map(|p| p.to_string()))
}

#[tauri::command]
pub async fn create_project_folder(path: String) -> Result<String, String> {
    let pb = PathBuf::from(&path);
    std::fs::create_dir_all(&pb).map_err(|e| format!("Failed to create folder: {}", e))?;
    Ok(pb.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn validate_folder(path: String) -> Result<FolderInfo, String> {
    let pb = PathBuf::from(&path);

    if !pb.exists() {
        return Err(format!("Folder does not exist: {}", path));
    }

    if !pb.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    let is_git = pb.join(".git").exists();
    let has_opencode = pb.join("opencode.json").exists() || pb.join("opencode.jsonc").exists();

    let name = pb
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.clone());

    Ok(FolderInfo {
        path: pb.to_string_lossy().to_string(),
        name,
        is_git,
        has_opencode_config: has_opencode,
    })
}

#[derive(serde::Serialize)]
pub struct FolderInfo {
    pub path: String,
    pub name: String,
    pub is_git: bool,
    pub has_opencode_config: bool,
}
