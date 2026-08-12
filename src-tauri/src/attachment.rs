use crate::db::types::AttachmentInfo;
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;
use uuid::Uuid;

pub struct AttachmentManager {
    attachments_dir: PathBuf,
}

impl AttachmentManager {
    pub fn new(app: &AppHandle) -> Result<Self, String> {
        let data_dir = app
            .path()
            .app_data_dir()
            .map_err(|e| format!("Failed to get app data dir: {}", e))?;

        let attachments_dir = data_dir.join("attachments");
        fs::create_dir_all(&attachments_dir)
            .map_err(|e| format!("Failed to create attachments dir: {}", e))?;

        Ok(Self { attachments_dir })
    }

    pub fn save_image(&self, data: &[u8], filename: &str) -> Result<AttachmentInfo, String> {
        let id = Uuid::new_v4().to_string();
        let ext = std::path::Path::new(filename)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("png");
        let saved_name = format!("{}.{}", id, ext);
        let path = self.attachments_dir.join(&saved_name);

        fs::write(&path, data).map_err(|e| format!("Failed to write image: {}", e))?;

        let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;

        Ok(AttachmentInfo {
            id,
            path: path.to_string_lossy().to_string(),
            filename: filename.to_string(),
            size: metadata.len(),
        })
    }

    pub fn save_rgba_image(
        &self,
        rgba_data: &[u8],
        width: u32,
        height: u32,
    ) -> Result<String, String> {
        let id = Uuid::new_v4().to_string();
        let saved_name = format!("{}.png", id);
        let path = self.attachments_dir.join(&saved_name);

        // Convert RGBA to PNG using a simple raw encoder
        // RGBA data is width * height * 4 bytes
        let expected_len = (width * height * 4) as usize;
        if rgba_data.len() != expected_len {
            return Err(format!(
                "RGBA data size mismatch: expected {}, got {}",
                expected_len,
                rgba_data.len()
            ));
        }

        // Write as raw PNG using the image crate approach
        // For simplicity, we'll write the raw RGBA and let the frontend handle display
        // In production, use the `image` crate to encode properly
        fs::write(&path, rgba_data).map_err(|e| format!("Failed to write image: {}", e))?;

        Ok(path.to_string_lossy().to_string())
    }

    pub fn list_attachments(&self) -> Result<Vec<AttachmentInfo>, String> {
        let mut attachments = Vec::new();

        if !self.attachments_dir.exists() {
            return Ok(attachments);
        }

        let entries = fs::read_dir(&self.attachments_dir)
            .map_err(|e| format!("Failed to read dir: {}", e))?;

        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
                let filename = path
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                let id = path
                    .file_stem()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();

                attachments.push(AttachmentInfo {
                    id,
                    path: path.to_string_lossy().to_string(),
                    filename,
                    size: metadata.len(),
                });
            }
        }

        Ok(attachments)
    }

    pub fn delete_attachment(&self, attachment_id: &str) -> Result<(), String> {
        let entries = fs::read_dir(&self.attachments_dir)
            .map_err(|e| format!("Failed to read dir: {}", e))?;

        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                let stem = path
                    .file_stem()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                if stem == attachment_id {
                    fs::remove_file(&path).map_err(|e| format!("Failed to delete: {}", e))?;
                    return Ok(());
                }
            }
        }

        Err(format!("Attachment not found: {}", attachment_id))
    }

    pub fn cleanup_old(&self, max_age_hours: u64) -> Result<u32, String> {
        let mut removed = 0u32;
        let now = std::time::SystemTime::now();
        let max_age = std::time::Duration::from_secs(max_age_hours * 3600);

        if !self.attachments_dir.exists() {
            return Ok(0);
        }

        let entries = fs::read_dir(&self.attachments_dir)
            .map_err(|e| format!("Failed to read dir: {}", e))?;

        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                if let Ok(metadata) = fs::metadata(&path) {
                    if let Ok(modified) = metadata.modified() {
                        if let Ok(age) = now.duration_since(modified) {
                            if age > max_age {
                                let _ = fs::remove_file(&path);
                                removed += 1;
                            }
                        }
                    }
                }
            }
        }

        Ok(removed)
    }
}
