import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTimestamp, formatCost, formatTokens, truncateText, shortenPath } from "../lib/utils";
import { ContextMenu, type ContextMenuItem } from "./ContextMenu";
import type { Session } from "../lib/types";

interface SessionItemProps {
  session: Session;
  isSelected: boolean;
  isRecent: boolean;
  onClick: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

export function SessionItem({
  session,
  isSelected,
  isRecent,
  onClick,
  onRename,
  onDelete,
}: SessionItemProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleRename = useCallback(() => {
    setRenameValue(session.title);
    setIsRenaming(true);
    setContextMenu(null);
  }, [session.title]);

  const handleRenameConfirm = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== session.title) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  }, [renameValue, session.title, onRename]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleRenameConfirm();
      else if (e.key === "Escape") setIsRenaming(false);
    },
    [handleRenameConfirm]
  );

  const handleDelete = useCallback(() => {
    setContextMenu(null);
    onDelete();
  }, [onDelete]);

  const contextMenuItems: ContextMenuItem[] = [
    { label: "Rename", icon: "✏️", onClick: handleRename },
    { separator: true, label: "" },
    { label: "Delete", icon: "🗑️", danger: true, onClick: handleDelete },
  ];

  return (
    <>
      <motion.button
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className={`w-full text-left px-3 py-2.5 rounded-xl mb-0.5 transition-colors duration-100 ${
          isSelected
            ? "bg-[var(--accent)]/10 border border-[var(--accent)]/20"
            : "hover:bg-[var(--sidebar-hover)] border border-transparent"
        }`}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.99 }}
        layout
      >
        <div className="flex items-center gap-2">
          {isRecent && (
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameConfirm}
              onKeyDown={handleRenameKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-[var(--bg-surface0)] text-[13px] text-[var(--text-primary)] outline-none border border-[var(--accent)] rounded-lg px-2 py-0.5 min-w-0 ring-1 ring-[var(--accent)]/20"
            />
          ) : (
            <span className="text-[13px] text-[var(--text-primary)] truncate flex-1 font-medium">
              {truncateText(session.title, 32)}
            </span>
          )}
        </div>

        {session.directory && (
          <div className="flex items-center gap-1.5 mt-1.5 ml-3.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            <span className="text-[10px] text-[var(--text-muted)]">
              {shortenPath(session.directory, 22)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-1.5 ml-3.5 text-[10px] text-[var(--text-muted)]">
          <span>{formatTimestamp(session.time_updated)}</span>
          {session.cost > 0 && (
            <>
              <span className="opacity-40">·</span>
              <span>{formatCost(session.cost)}</span>
            </>
          )}
          {session.tokens_input > 0 && (
            <>
              <span className="opacity-40">·</span>
              <span>{formatTokens(session.tokens_input + session.tokens_output)}</span>
            </>
          )}
        </div>

        {session.model && (
          <div className="mt-1.5 ml-3.5">
            <span className="text-[10px] text-[var(--accent)] bg-[var(--accent)]/8 px-1.5 py-0.5 rounded-md font-mono">
              {session.model.split("/").pop()}
            </span>
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            items={contextMenuItems}
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
