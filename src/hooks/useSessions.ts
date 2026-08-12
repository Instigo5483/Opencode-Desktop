import { useState, useEffect, useCallback } from "react";
import type { Session } from "../lib/types";
import {
  listSessions,
  searchSessions,
  checkDbStatus,
  renameSession,
  deleteSession,
} from "../lib/commands";

const RECENT_SESSION_KEY = "opencode-desktop-recent-sessions";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbAvailable, setDbAvailable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSessionIds, setRecentSessionIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SESSION_KEY);
    if (stored) {
      try {
        setRecentSessionIds(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const status = await checkDbStatus();
      setDbAvailable(status.available);

      if (!status.available) {
        setError("OpenCode database not found");
        setSessions([]);
        return;
      }

      let result: Session[];
      if (searchQuery.trim()) {
        result = await searchSessions(searchQuery.trim());
      } else {
        result = await listSessions();
      }
      setSessions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const markRecent = useCallback((sessionId: string) => {
    setRecentSessionIds((prev) => {
      const filtered = prev.filter((id) => id !== sessionId);
      const updated = [sessionId, ...filtered].slice(0, 10);
      localStorage.setItem(RECENT_SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refresh = useCallback(() => {
    loadSessions();
  }, [loadSessions]);

  const rename = useCallback(
    async (sessionId: string, newTitle: string) => {
      try {
        await renameSession(sessionId, newTitle);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, title: newTitle } : s
          )
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to rename session"
        );
      }
    },
    []
  );

  const remove = useCallback(
    async (sessionId: string) => {
      try {
        await deleteSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setRecentSessionIds((prev) => {
          const filtered = prev.filter((id) => id !== sessionId);
          localStorage.setItem(RECENT_SESSION_KEY, JSON.stringify(filtered));
          return filtered;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete session"
        );
      }
    },
    []
  );

  return {
    sessions,
    loading,
    error,
    dbAvailable,
    searchQuery,
    setSearchQuery,
    recentSessionIds,
    markRecent,
    refresh,
    rename,
    remove,
  };
}
