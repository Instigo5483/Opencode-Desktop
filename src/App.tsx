import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { InputBar } from "./components/InputBar";
import { StatusBar } from "./components/StatusBar";
import { useSessions } from "./hooks/useSessions";
import { useMessages } from "./hooks/useMessages";
import { useClipboardImage } from "./hooks/useClipboardImage";
import { useDragDrop } from "./hooks/useDragDrop";
import { useProjectFolder } from "./hooks/useProjectFolder";
import { sendPrompt } from "./lib/commands";

export default function App() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState<string | null>(null);
  const [selectedSessionModel, setSelectedSessionModel] = useState<string | null>(null);
  const [userSelectedModel, setUserSelectedModel] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ sessionId: string; title: string } | null>(null);

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    dbAvailable,
    searchQuery,
    setSearchQuery,
    recentSessionIds,
    markRecent,
    refresh: refreshSessions,
    rename: renameSession,
    remove: deleteSession,
  } = useSessions();

  const { messages, loading: messagesLoading, error: messagesError, refresh: refreshMessages } =
    useMessages(selectedSessionId);

  const {
    pendingImages,
    addImageFromFile,
    addImageFromBytes,
    removeImage,
    clearAll: clearPendingImages,
    saveAllPending,
  } = useClipboardImage();

  const { isDragging, droppedFiles, clearDroppedFiles } = useDragDrop();

  const { selectedFolder, setSelectedFolder } = useProjectFolder();

  const effectiveModel = userSelectedModel || selectedSessionModel;

  useEffect(() => {
    if (droppedFiles.length > 0) {
      for (const file of droppedFiles) {
        if (file.savedPath) {
          addImageFromBytes([], file.file.name).then((pending) => {
            pending.savedPath = file.savedPath;
          });
        }
      }
      clearDroppedFiles();
    }
  }, [droppedFiles, clearDroppedFiles, addImageFromBytes]);

  const handleSessionSelect = useCallback(
    (sessionId: string) => {
      setSelectedSessionId(sessionId);
      markRecent(sessionId);
      setUserSelectedModel(null);

      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setSelectedSessionTitle(session.title);
        setSelectedSessionModel(session.model);
      }
    },
    [sessions, markRecent]
  );

  const handleSessionRename = useCallback(
    async (sessionId: string, newTitle: string) => {
      await renameSession(sessionId, newTitle);
      if (sessionId === selectedSessionId) {
        setSelectedSessionTitle(newTitle);
      }
    },
    [renameSession, selectedSessionId]
  );

  const handleSessionDelete = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setDeleteConfirm({ sessionId, title: session.title });
      }
    },
    [sessions]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;

    await deleteSession(deleteConfirm.sessionId);

    if (deleteConfirm.sessionId === selectedSessionId) {
      setSelectedSessionId(null);
      setSelectedSessionTitle(null);
      setSelectedSessionModel(null);
      setUserSelectedModel(null);
    }

    setDeleteConfirm(null);
  }, [deleteConfirm, deleteSession, selectedSessionId]);

  const handleSend = useCallback(
    async (text: string, _images: string[]) => {
      if (sending) return;
      if (!text && pendingImages.length === 0) return;

      try {
        setSending(true);

        const imagePaths = await saveAllPending();
        clearPendingImages();

        await sendPrompt(
          text,
          imagePaths,
          selectedFolder || undefined,
          effectiveModel || undefined,
          selectedSessionId || undefined
        );

        if (selectedSessionId) {
          refreshMessages();
        }

        refreshSessions();
      } catch (err) {
        console.error("Failed to send prompt:", err);
      } finally {
        setSending(false);
      }
    },
    [
      sending,
      pendingImages,
      selectedFolder,
      effectiveModel,
      selectedSessionId,
      saveAllPending,
      clearPendingImages,
      refreshMessages,
      refreshSessions,
    ]
  );

  useEffect(() => {
    if (selectedSessionId) {
      const session = sessions.find((s) => s.id === selectedSessionId);
      if (session?.directory) {
        setSelectedFolder(session.directory);
      }
    }
  }, [selectedSessionId, sessions, setSelectedFolder]);

  return (
    <div
      className={`flex h-screen bg-[var(--chat-bg)] relative ${
        isDragging ? "ring-2 ring-[var(--accent)] ring-inset" : ""
      }`}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[var(--accent)]/10 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--sidebar-bg)] rounded-2xl px-10 py-6 shadow-2xl border border-[var(--accent)]"
            >
              <motion.p
                className="text-[var(--text-primary)] text-base font-medium"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                📎 Drop images here
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-[var(--sidebar-bg)] rounded-2xl border border-[var(--sidebar-border)] shadow-2xl p-6 w-[400px]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Delete Session
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Are you sure you want to delete this session?
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-4 truncate font-mono">
                "{deleteConfirm.title}"
              </p>
              <p className="text-[10px] text-[var(--danger)] mb-5">
                This will permanently remove all messages, parts, and related data.
              </p>
              <div className="flex justify-end gap-2.5">
                <motion.button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm rounded-xl bg-[var(--input-bg)] text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)] border border-[var(--input-border)]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm rounded-xl bg-[var(--danger)] text-white hover:opacity-90"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        loading={sessionsLoading}
        error={sessionsError}
        dbAvailable={dbAvailable}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSessionId={selectedSessionId}
        onSessionSelect={handleSessionSelect}
        onSessionRename={handleSessionRename}
        onSessionDelete={handleSessionDelete}
        recentSessionIds={recentSessionIds}
        onRefresh={refreshSessions}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea
          messages={messages}
          loading={messagesLoading}
          error={messagesError}
          sessionTitle={selectedSessionTitle}
        />

        <StatusBar
          stats={null}
          model={effectiveModel}
          messageCount={messages.length}
          isSending={sending}
        />

        <InputBar
          onSend={handleSend}
          sending={sending}
          selectedFolder={selectedFolder}
          onFolderChange={setSelectedFolder}
          selectedModel={effectiveModel}
          onModelChange={setUserSelectedModel}
          pendingImages={pendingImages}
          onAddImage={addImageFromFile}
          onRemoveImage={removeImage}
        />
      </div>
    </div>
  );
}
