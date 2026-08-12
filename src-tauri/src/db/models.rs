use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Provider {
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub models: HashMap<String, Model>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Model {
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelEntry {
    pub provider_id: String,
    pub model_id: String,
    pub display_name: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelState {
    pub recent: Vec<RecentModel>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecentModel {
    #[serde(rename = "providerID")]
    pub provider_id: String,
    #[serde(rename = "modelID")]
    pub model_id: String,
}

pub fn models_cache_path() -> Result<std::path::PathBuf, String> {
    let cache_dir = dirs::cache_dir().ok_or("Could not determine cache directory")?;
    Ok(cache_dir.join("opencode").join("models.json"))
}

pub fn model_state_path() -> Result<std::path::PathBuf, String> {
    let state_dir = dirs::state_dir().ok_or("Could not determine state directory")?;
    Ok(state_dir.join("opencode").join("model.json"))
}

pub fn list_available_models() -> Result<Vec<ModelEntry>, String> {
    let path = models_cache_path()?;

    if !path.exists() {
        return Err(format!("Models cache not found at: {}", path.display()));
    }

    let content =
        std::fs::read_to_string(&path).map_err(|e| format!("Failed to read models cache: {}", e))?;

    let providers: HashMap<String, Provider> =
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse models cache: {}", e))?;

    let mut models: Vec<ModelEntry> = Vec::new();

    for (provider_id, provider) in &providers {
        for (model_id, model) in &provider.models {
            models.push(ModelEntry {
                provider_id: provider_id.clone(),
                model_id: model_id.clone(),
                display_name: if model.name.is_empty() {
                    model_id.clone()
                } else {
                    model.name.clone()
                },
                description: model.description.clone(),
            });
        }
    }

    models.sort_by(|a, b| a.display_name.cmp(&b.display_name));

    Ok(models)
}

pub fn get_current_model() -> Result<Option<String>, String> {
    let path = model_state_path()?;

    if !path.exists() {
        return Ok(None);
    }

    let content =
        std::fs::read_to_string(&path).map_err(|e| format!("Failed to read model state: {}", e))?;

    let state: ModelState =
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse model state: {}", e))?;

    Ok(state.recent.first().map(|m| {
        format!("{}/{}", m.provider_id, m.model_id)
    }))
}

pub fn get_models_for_provider(provider_id: &str) -> Result<Vec<ModelEntry>, String> {
    let path = models_cache_path()?;

    if !path.exists() {
        return Err(format!("Models cache not found at: {}", path.display()));
    }

    let content =
        std::fs::read_to_string(&path).map_err(|e| format!("Failed to read models cache: {}", e))?;

    let providers: HashMap<String, Provider> =
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse models cache: {}", e))?;

    let mut models: Vec<ModelEntry> = Vec::new();

    if let Some(provider) = providers.get(provider_id) {
        for (model_id, model) in &provider.models {
            models.push(ModelEntry {
                provider_id: provider_id.to_string(),
                model_id: model_id.clone(),
                display_name: if model.name.is_empty() {
                    model_id.clone()
                } else {
                    model.name.clone()
                },
                description: model.description.clone(),
            });
        }
    }

    models.sort_by(|a, b| a.display_name.cmp(&b.display_name));

    Ok(models)
}
