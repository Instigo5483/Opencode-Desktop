import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectFolderPicker } from "./ProjectFolderPicker";
import { ModelSelector } from "./ModelSelector";
import { ImageAttachment } from "./ImageAttachment";
import type { PendingAttachment } from "../lib/types";

interface InputBarProps {
  onSend: (text: string, images: string[]) => void;
  sending: boolean;
  selectedFolder: string | null;
  onFolderChange: (folder: string | null) => void;
  selectedModel: string | null;
  onModelChange: (model: string | null) => void;
  pendingImages: PendingAttachment[];
  onAddImage: (file: File) => void;
  onRemoveImage: (id: string) => void;
}

export function InputBar({
  onSend,
  sending,
  selectedFolder,
  onFolderChange,
  selectedModel,
  onModelChange,
  pendingImages,
  onAddImage,
  onRemoveImage,
}: InputBarProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (!text.trim() && pendingImages.length === 0) return;
    onSend(text.trim(), []);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, pendingImages, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      const ta = e.target;
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        for (const file of Array.from(files)) {
          if (file.type.startsWith("image/")) {
            onAddImage(file);
          }
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onAddImage]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items);
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            onAddImage(file);
          }
        }
      }
    },
    [onAddImage]
  );

  const canSend = text.trim().length > 0 || pendingImages.length > 0;

  return (
    <div className="border-t border-[var(--sidebar-border)] bg-[var(--chat-bg)]">
      {/* Project Folder + Model Selector */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
              Project
            </span>
            <ProjectFolderPicker
              selectedFolder={selectedFolder}
              onFolderChange={onFolderChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
              Model
            </span>
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
            />
          </div>
        </div>
      </div>

      {/* Image Attachments */}
      <AnimatePresence>
        {pendingImages.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-2 flex gap-2 flex-wrap overflow-hidden"
          >
            {pendingImages.map((img) => (
              <ImageAttachment
                key={img.id}
                attachment={img}
                onRemove={onRemoveImage}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="px-4 pb-3">
        <div className="flex items-end gap-2 bg-[var(--input-bg)] rounded-xl border border-[var(--input-border)] px-3 py-2.5 transition-all focus-within:border-[var(--input-focus)] focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_15%,transparent)]">
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] text-lg shrink-0 mb-0.5 transition-colors"
            title="Attach image"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            📎
          </motion.button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type a message... (Ctrl+V to paste images, Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none resize-none placeholder:text-[var(--text-muted)] min-h-[24px] max-h-[200px] py-0.5"
            disabled={sending}
          />

          <AnimatePresence mode="wait">
            <motion.button
              key={canSend ? "send" : "idle"}
              onClick={handleSend}
              disabled={sending || !canSend}
              className={`text-lg shrink-0 mb-0.5 transition-colors ${
                canSend && !sending
                  ? "text-[var(--accent)] hover:text-[var(--accent-hover)]"
                  : "text-[var(--text-muted)] opacity-30"
              }`}
              title={sending ? "Sending..." : "Send message"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={canSend && !sending ? { scale: 1.15 } : {}}
              whileTap={canSend && !sending ? { scale: 0.9 } : {}}
            >
              {sending ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⏳
                </motion.span>
              ) : (
                "▶"
              )}
            </motion.button>
          </AnimatePresence>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
