use crate::attachment::AttachmentManager;
use crate::db::types::AttachmentInfo;
use base64::Engine;

#[tauri::command]
pub async fn save_image_attachment(
    app: tauri::AppHandle,
    data: Vec<u8>,
    filename: String,
) -> Result<AttachmentInfo, String> {
    let manager = AttachmentManager::new(&app)?;
    let info = manager.save_image(&data, &filename)?;
    Ok(info)
}

#[tauri::command]
pub async fn save_clipboard_image(
    app: tauri::AppHandle,
    rgba_data: Vec<u8>,
    width: u32,
    height: u32,
) -> Result<String, String> {
    let manager = AttachmentManager::new(&app).map_err(|e| e.to_string())?;
    let path = manager
        .save_rgba_image(&rgba_data, width, height)
        .map_err(|e| e.to_string())?;
    Ok(path)
}

#[tauri::command]
pub async fn list_attachments(
    app: tauri::AppHandle,
) -> Result<Vec<crate::db::types::AttachmentInfo>, String> {
    let manager = AttachmentManager::new(&app).map_err(|e| e.to_string())?;
    manager.list_attachments().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_attachment(app: tauri::AppHandle, attachment_id: String) -> Result<(), String> {
    let manager = AttachmentManager::new(&app).map_err(|e| e.to_string())?;
    manager
        .delete_attachment(&attachment_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cleanup_old_attachments(
    app: tauri::AppHandle,
    max_age_hours: u64,
) -> Result<u32, String> {
    let manager = AttachmentManager::new(&app).map_err(|e| e.to_string())?;
    manager
        .cleanup_old(max_age_hours)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn image_to_base64(path: String) -> Result<String, String> {
    let data = std::fs::read(&path).map_err(|e| format!("Failed to read image: {}", e))?;
    let encoded = base64::engine::general_purpose::STANDARD.encode(&data);

    let mime = match path
        .rsplit('.')
        .next()
        .unwrap_or("")
        .to_lowercase()
        .as_str()
    {
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        "svg" => "image/svg+xml",
        _ => "image/png",
    };

    Ok(format!("data:{};base64,{}", mime, encoded))
}
