use super::types::*;
use super::Database;

impl Database {
    pub fn list_sessions(&self) -> Result<Vec<Session>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare(
                "SELECT s.id, s.project_id, s.title, s.directory,
                        s.model, s.agent, COALESCE(s.cost, 0.0),
                        COALESCE(s.tokens_input, 0), COALESCE(s.tokens_output, 0),
                        s.time_created, s.time_updated,
                        s.parent_id, s.share_url
                 FROM session s
                 WHERE s.parent_id IS NULL OR s.parent_id = ''
                 ORDER BY s.time_updated DESC",
            )
            .map_err(|e| e.to_string())?;

        let sessions = stmt
            .query_map([], |row| {
                Ok(Session {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    title: row.get(2)?,
                    directory: row.get(3)?,
                    model: row.get(4)?,
                    agent: row.get(5)?,
                    cost: row.get(6)?,
                    tokens_input: row.get(7)?,
                    tokens_output: row.get(8)?,
                    time_created: row.get(9)?,
                    time_updated: row.get(10)?,
                    parent_id: row.get(11)?,
                    share_url: row.get(12)?,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(sessions)
    }

    pub fn get_session(&self, session_id: &str) -> Result<Session, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT s.id, s.project_id, s.title, s.directory,
                    s.model, s.agent, COALESCE(s.cost, 0.0),
                    COALESCE(s.tokens_input, 0), COALESCE(s.tokens_output, 0),
                    s.time_created, s.time_updated,
                    s.parent_id, s.share_url
             FROM session s WHERE s.id = ?1",
            [session_id],
            |row| {
                Ok(Session {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    title: row.get(2)?,
                    directory: row.get(3)?,
                    model: row.get(4)?,
                    agent: row.get(5)?,
                    cost: row.get(6)?,
                    tokens_input: row.get(7)?,
                    tokens_output: row.get(8)?,
                    time_created: row.get(9)?,
                    time_updated: row.get(10)?,
                    parent_id: row.get(11)?,
                    share_url: row.get(12)?,
                })
            },
        )
        .map_err(|e| format!("Session not found: {}", e))
    }

    pub fn get_session_messages(&self, session_id: &str) -> Result<Vec<Message>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare(
                "SELECT id, session_id, data, time_created, time_updated
                 FROM message
                 WHERE session_id = ?1
                 ORDER BY time_created ASC",
            )
            .map_err(|e| e.to_string())?;

        let messages = stmt
            .query_map([session_id], |row| {
                Ok(Message {
                    id: row.get(0)?,
                    session_id: row.get(1)?,
                    data: row.get(2)?,
                    time_created: row.get(3)?,
                    time_updated: row.get(4)?,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(messages)
    }

    pub fn get_message_parts(&self, session_id: &str) -> Result<Vec<Part>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare(
                "SELECT id, message_id, session_id, data, time_created, time_updated
                 FROM part
                 WHERE session_id = ?1
                 ORDER BY time_created ASC",
            )
            .map_err(|e| e.to_string())?;

        let parts = stmt
            .query_map([session_id], |row| {
                Ok(Part {
                    id: row.get(0)?,
                    message_id: row.get(1)?,
                    session_id: row.get(2)?,
                    data: row.get(3)?,
                    time_created: row.get(4)?,
                    time_updated: row.get(5)?,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(parts)
    }

    pub fn get_session_stats(&self, session_id: &str) -> Result<SessionStats, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT
                COALESCE(SUM(tokens_input), 0),
                COALESCE(SUM(tokens_output), 0),
                COALESCE(SUM(cost), 0.0),
                (SELECT COUNT(*) FROM message WHERE session_id = ?1)
             FROM session WHERE id = ?1",
            [session_id],
            |row| {
                Ok(SessionStats {
                    total_tokens_input: row.get(0)?,
                    total_tokens_output: row.get(1)?,
                    total_cost: row.get(2)?,
                    message_count: row.get(3)?,
                })
            },
        )
        .map_err(|e| format!("Failed to get stats: {}", e))
    }

    pub fn list_projects(&self) -> Result<Vec<Project>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare(
                "SELECT id, worktree, vcs, name, time_created, time_updated
                 FROM project
                 ORDER BY time_updated DESC",
            )
            .map_err(|e| e.to_string())?;

        let projects = stmt
            .query_map([], |row| {
                Ok(Project {
                    id: row.get(0)?,
                    worktree: row.get(1)?,
                    vcs: row.get(2)?,
                    name: row.get(3)?,
                    time_created: row.get(4)?,
                    time_updated: row.get(5)?,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(projects)
    }

    pub fn rename_session(&self, session_id: &str, new_title: &str) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;

        let rows = conn
            .execute(
                "UPDATE session SET title = ?1, time_updated = ?2 WHERE id = ?3",
                rusqlite::params![new_title, now, session_id],
            )
            .map_err(|e| e.to_string())?;

        if rows == 0 {
            return Err(format!("Session not found: {}", session_id));
        }

        Ok(())
    }

    pub fn delete_session(&self, session_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        // Delete parts first (child rows)
        conn.execute("DELETE FROM part WHERE session_id = ?1", [session_id])
            .map_err(|e| e.to_string())?;

        // Delete messages
        conn.execute("DELETE FROM message WHERE session_id = ?1", [session_id])
            .map_err(|e| e.to_string())?;

        // Delete todos
        conn.execute("DELETE FROM todo WHERE session_id = ?1", [session_id])
            .map_err(|e| e.to_string())?;

        // Delete session shares
        conn.execute(
            "DELETE FROM session_share WHERE session_id = ?1",
            [session_id],
        )
        .map_err(|e| e.to_string())?;

        // Delete session context epoch
        conn.execute(
            "DELETE FROM session_context_epoch WHERE session_id = ?1",
            [session_id],
        )
        .map_err(|e| e.to_string())?;

        // Delete session input
        conn.execute(
            "DELETE FROM session_input WHERE session_id = ?1",
            [session_id],
        )
        .map_err(|e| e.to_string())?;

        // Delete session messages (v2)
        conn.execute(
            "DELETE FROM session_message WHERE session_id = ?1",
            [session_id],
        )
        .map_err(|e| e.to_string())?;

        // Delete the session itself
        let rows = conn
            .execute("DELETE FROM session WHERE id = ?1", [session_id])
            .map_err(|e| e.to_string())?;

        if rows == 0 {
            return Err(format!("Session not found: {}", session_id));
        }

        Ok(())
    }

    pub fn search_sessions(&self, query: &str) -> Result<Vec<Session>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let search_pattern = format!("%{}%", query);
        let mut stmt = conn
            .prepare(
                "SELECT s.id, s.project_id, s.title, s.directory,
                        s.model, s.agent, COALESCE(s.cost, 0.0),
                        COALESCE(s.tokens_input, 0), COALESCE(s.tokens_output, 0),
                        s.time_created, s.time_updated,
                        s.parent_id, s.share_url
                 FROM session s
                 WHERE s.title LIKE ?1
                 ORDER BY s.time_updated DESC",
            )
            .map_err(|e| e.to_string())?;

        let sessions = stmt
            .query_map([&search_pattern], |row| {
                Ok(Session {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    title: row.get(2)?,
                    directory: row.get(3)?,
                    model: row.get(4)?,
                    agent: row.get(5)?,
                    cost: row.get(6)?,
                    tokens_input: row.get(7)?,
                    tokens_output: row.get(8)?,
                    time_created: row.get(9)?,
                    time_updated: row.get(10)?,
                    parent_id: row.get(11)?,
                    share_url: row.get(12)?,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(sessions)
    }
}
