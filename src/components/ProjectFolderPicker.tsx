import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { selectFolder, createProjectFolder, validateFolder } from "../lib/commands";
import type { FolderInfo } from "../lib/types";

interface ProjectFolderPickerProps {
  selectedFolder: string | null;
  onFolderChange: (folder: string | null) => void;
}

export function ProjectFolderPicker({
  selectedFolder,
  onFolderChange,
}: ProjectFolderPickerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParent, setNewFolderParent] = useState(
    selectedFolder || ""
  );
  const [folderInfo, setFolderInfo] = useState<FolderInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectExisting = useCallback(async () => {
    try {
      const folder = await selectFolder();
      if (folder) {
        onFolderChange(folder);
        const info = await validateFolder(folder);
        setFolderInfo(info);
      }
    } catch (err) {
      console.error("Failed to select folder:", err);
    }
  }, [onFolderChange]);

  const handleCreateNew = useCallback(async () => {
    if (!newFolderName.trim()) return;

    try {
      setLoading(true);
      const parentDir = newFolderParent || "/home";
      const fullPath = `${parentDir}/${newFolderName.trim()}`;

      await createProjectFolder(fullPath);
      onFolderChange(fullPath);

      const info = await validateFolder(fullPath);
      setFolderInfo(info);

      setIsCreating(false);
      setNewFolderName("");
    } catch (err) {
      console.error("Failed to create folder:", err);
    } finally {
      setLoading(false);
    }
  }, [newFolderName, newFolderParent, onFolderChange]);

  const handleClear = useCallback(() => {
    onFolderChange(null);
    setFolderInfo(null);
  }, [onFolderChange]);

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div
            key="creating"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] overflow-hidden"
          >
            <span className="text-[var(--text-muted)] text-sm shrink-0">📁</span>
            <input
              type="text"
              placeholder="Parent directory"
              value={newFolderParent}
              onChange={(e) => setNewFolderParent(e.target.value)}
              className="w-24 bg-transparent text-xs text-[var(--text-primary)] outline-none min-w-0 placeholder:text-[var(--text-muted)]"
            />
            <span className="text-[var(--text-muted)] text-sm shrink-0">/</span>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateNew()}
              className="w-24 bg-transparent text-xs text-[var(--text-primary)] outline-none min-w-0 placeholder:text-[var(--text-muted)]"
              autoFocus
            />
            <motion.button
              onClick={handleCreateNew}
              disabled={!newFolderName.trim() || loading}
              className="text-[10px] px-2 py-1 rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? "..." : "Create"}
            </motion.button>
            <motion.button
              onClick={() => setIsCreating(false)}
              className="text-[10px] px-2 py-1 rounded-md hover:bg-[var(--sidebar-hover)] text-[var(--text-muted)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </motion.div>
        ) : selectedFolder ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] max-w-[300px]"
          >
            <span className="text-[var(--text-muted)] text-sm shrink-0">📁</span>
            <span
              className="text-xs text-[var(--text-primary)] truncate flex-1"
              title={selectedFolder}
            >
              {selectedFolder.split("/").slice(-2).join("/")}
            </span>
            <AnimatePresence>
              {folderInfo?.is_git && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="text-xs text-green-500 shrink-0"
                  title="Git repository"
                >
                  ⎇
                </motion.span>
              )}
            </AnimatePresence>
            <motion.button
              onClick={handleClear}
              className="text-[var(--text-muted)] hover:text-[var(--accent)] text-xs shrink-0"
              title="Clear selection"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {!isCreating && (
        <>
          <motion.button
            onClick={handleSelectExisting}
            className="text-xs px-2 py-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)] border border-[var(--input-border)] transition-colors"
            title="Select existing folder"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Browse
          </motion.button>
          <motion.button
            onClick={() => setIsCreating(true)}
            className="text-xs px-2 py-1.5 rounded-lg hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)] border border-[var(--input-border)] transition-colors"
            title="Create new folder"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            + New
          </motion.button>
        </>
      )}
    </div>
  );
}
