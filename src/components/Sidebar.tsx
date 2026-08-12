import { motion, AnimatePresence } from "framer-motion";
import { SessionItem } from "./SessionItem";
import type { Session } from "../lib/types";

interface SidebarProps {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  dbAvailable: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onSessionRename: (sessionId: string, newTitle: string) => void;
  onSessionDelete: (sessionId: string) => void;
  recentSessionIds: string[];
  onRefresh: () => void;
}

export function Sidebar({
  sessions,
  loading,
  error,
  dbAvailable,
  searchQuery,
  onSearchChange,
  selectedSessionId,
  onSessionSelect,
  onSessionRename,
  onSessionDelete,
  recentSessionIds,
  onRefresh,
}: SidebarProps) {
  return (
    <div className="w-[280px] min-w-[280px] h-full flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center">
              <span className="text-[var(--accent)] text-xs font-bold">&gt;_</span>
            </div>
            <h1 className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">
              OpenCode
            </h1>
          </div>
          <motion.button
            onClick={onRefresh}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)] transition-colors"
            title="Refresh sessions"
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
              <path d="M21 3v5h-5" />
            </svg>
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative group">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[var(--bg-surface0)]/60 text-[13px] text-[var(--text-primary)] rounded-xl pl-8 pr-8 py-2 outline-none border border-transparent focus:border-[var(--accent)]/30 focus:bg-[var(--bg-surface0)] transition-all duration-200 placeholder:text-[var(--text-muted)]"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)] transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto">
        {!dbAvailable ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[var(--bg-surface0)] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] font-medium">No database found</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Install OpenCode first</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 text-center"
          >
            <p className="text-[13px] text-[var(--danger)]">{error}</p>
            <motion.button
              onClick={onRefresh}
              className="mt-2 text-[11px] text-[var(--accent)] hover:underline"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Try again
            </motion.button>
          </motion.div>
        ) : loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-3/4 rounded-lg animate-shimmer" />
                <div className="h-2 w-1/2 rounded-lg animate-shimmer" />
                <div className="h-2 w-1/3 rounded-lg animate-shimmer" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 text-center"
          >
            <p className="text-[13px] text-[var(--text-muted)]">
              {searchQuery ? "No matching sessions" : "No sessions yet"}
            </p>
          </motion.div>
        ) : (
          <div className="py-2 px-2">
            <AnimatePresence mode="popLayout">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.2,
                    delay: Math.min(index * 0.03, 0.15),
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  layout
                >
                  <SessionItem
                    session={session}
                    isSelected={session.id === selectedSessionId}
                    isRecent={recentSessionIds.includes(session.id)}
                    onClick={() => onSessionSelect(session.id)}
                    onRename={(newTitle) => onSessionRename(session.id, newTitle)}
                    onDelete={() => onSessionDelete(session.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-[var(--sidebar-border)] flex items-center justify-center">
        <span className="text-[10px] text-[var(--text-muted)]/60 font-mono">v0.1.0</span>
      </div>
    </div>
  );
}
