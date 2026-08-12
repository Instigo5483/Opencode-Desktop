pub mod models;
pub mod queries;
pub mod types;

use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new() -> Result<Self, String> {
        let db_path = Self::db_path()?;
        Self::from_path(&db_path)
    }

    pub fn from_path(db_path: &PathBuf) -> Result<Self, String> {
        if !db_path.exists() {
            return Err(format!(
                "OpenCode database not found at: {}",
                db_path.display()
            ));
        }

        let conn = Connection::open_with_flags(
            db_path,
            rusqlite::OpenFlags::SQLITE_OPEN_READ_WRITE | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX,
        )
        .map_err(|e| format!("Failed to open database: {}", e))?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn db_path() -> Result<PathBuf, String> {
        if let Ok(custom_path) = std::env::var("OPENCODE_DB") {
            if custom_path != ":memory:" {
                return Ok(PathBuf::from(custom_path));
            }
        }

        let data_dir = dirs::data_dir().ok_or("Could not determine data directory")?;
        let db_path = data_dir.join("opencode").join("opencode.db");

        if db_path.exists() {
            return Ok(db_path);
        }

        // Fallback: check home directory
        let home = dirs::home_dir().ok_or("Could not determine home directory")?;
        let fallback = home.join(".local/share/opencode/opencode.db");
        if fallback.exists() {
            return Ok(fallback);
        }

        Err(format!(
            "OpenCode database not found. Checked:\n  {}\n  {}",
            db_path.display(),
            fallback.display()
        ))
    }
}
