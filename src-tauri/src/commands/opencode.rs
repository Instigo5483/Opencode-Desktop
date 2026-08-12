use std::process::Stdio;
use tauri::Emitter;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

#[tauri::command]
pub async fn send_prompt(
    app: tauri::AppHandle,
    text: String,
    images: Vec<String>,
    project_dir: Option<String>,
    model: Option<String>,
    session_id: Option<String>,
    agent: Option<String>,
) -> Result<SpawnResult, String> {
    let mut args = vec!["run".to_string()];

    if let Some(dir) = &project_dir {
        args.push("--dir".to_string());
        args.push(dir.clone());
    }

    if let Some(sid) = &session_id {
        args.push("--session".to_string());
        args.push(sid.clone());
    }

    if let Some(m) = &model {
        args.push("--model".to_string());
        args.push(m.clone());
    }

    if let Some(a) = &agent {
        args.push("--agent".to_string());
        args.push(a.clone());
    }

    for img in &images {
        args.push("--file".to_string());
        args.push(img.clone());
    }

    args.push("--format".to_string());
    args.push("json".to_string());

    if !text.is_empty() {
        args.push(text.clone());
    }

    let opencode_bin = find_opencode_binary()?;

    let mut cmd = Command::new(&opencode_bin);
    cmd.args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    if let Some(dir) = &project_dir {
        cmd.current_dir(dir);
    }

    let mut child = cmd
        .spawn()
        .map_err(|e| format!("Failed to spawn opencode: {}", e))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let reader = BufReader::new(stdout);
    let mut lines = reader.lines();

    let mut output_lines: Vec<String> = Vec::new();

    while let Some(line) = lines.next_line().await.unwrap_or(None) {
        output_lines.push(line.clone());
        app.emit("opencode-output", line).ok();
    }

    let status = child
        .wait()
        .await
        .map_err(|e| format!("Process error: {}", e))?;

    Ok(SpawnResult {
        success: status.success(),
        exit_code: status.code().unwrap_or(-1),
        output: output_lines.join("\n"),
    })
}

#[tauri::command]
pub async fn spawn_opencode_tui(project_dir: Option<String>) -> Result<(), String> {
    let opencode_bin = find_opencode_binary()?;

    let mut cmd = Command::new(&opencode_bin);

    if let Some(dir) = &project_dir {
        cmd.arg(dir);
        cmd.current_dir(dir);
    }

    cmd.spawn()
        .map_err(|e| format!("Failed to spawn opencode TUI: {}", e))?;

    Ok(())
}

#[derive(serde::Serialize)]
pub struct SpawnResult {
    pub success: bool,
    pub exit_code: i32,
    pub output: String,
}

fn find_opencode_binary() -> Result<String, String> {
    let candidates = [
        "/usr/local/bin/opencode".to_string(),
        "/usr/bin/opencode".to_string(),
        dirs::home_dir()
            .map(|h| h.join(".local/bin/opencode").to_string_lossy().to_string())
            .unwrap_or_default(),
    ];

    for candidate in &candidates {
        if std::path::Path::new(candidate).exists() {
            return Ok(candidate.clone());
        }
    }

    // Try to find via which/path lookup
    if let Ok(output) = std::process::Command::new("which").arg("opencode").output() {
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path.is_empty() {
                return Ok(path);
            }
        }
    }

    Err("opencode binary not found. Please install OpenCode or set PATH.".to_string())
}
