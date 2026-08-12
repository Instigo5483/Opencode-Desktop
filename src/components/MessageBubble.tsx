import { useState } from "react";
import { motion } from "framer-motion";
import { ToolCallBlock } from "./ToolCallBlock";
import type { ParsedMessage } from "../hooks/useMessages";
import { formatTimestamp } from "../lib/utils";

interface MessageBubbleProps {
  message: ParsedMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [expandedTools, setExpandedTools] = useState(false);
  const isUser = message.role === "user";

  return (
    <motion.div
      className={`mb-5 ${isUser ? "pl-12" : "pr-12"}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      layout
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
            isUser
              ? "bg-[var(--accent)]/15 text-[var(--accent)]"
              : "bg-[var(--green)]/15 text-[var(--green)]"
          }`}
        >
          {isUser ? "U" : "A"}
        </div>
        <span
          className={`text-[11px] font-semibold ${
            isUser ? "text-[var(--accent)]" : "text-[var(--green)]"
          }`}
        >
          {isUser ? "You" : "Assistant"}
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>

      <motion.div
        className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed border ${
          isUser
            ? "bg-[var(--chat-user)] text-[var(--text-primary)] border-[var(--sidebar-border)]"
            : "bg-[var(--chat-assistant)] text-[var(--text-primary)] border-[var(--sidebar-border)]"
        }`}
        whileHover={{ borderColor: "var(--bg-surface1)" }}
        transition={{ duration: 0.15 }}
      >
        {message.content && (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        )}

        {message.toolInvocations && message.toolInvocations.length > 0 && (
          <div className="mt-3">
            <motion.button
              onClick={() => setExpandedTools(!expandedTools)}
              className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] flex items-center gap-1.5 font-medium"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                className="text-[8px]"
                animate={{ rotate: expandedTools ? 90 : 0 }}
                transition={{ duration: 0.15 }}
              >
                ▶
              </motion.span>
              {message.toolInvocations.length} tool call
              {message.toolInvocations.length !== 1 ? "s" : ""}
            </motion.button>
            <motion.div
              initial={false}
              animate={{
                height: expandedTools ? "auto" : 0,
                opacity: expandedTools ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-2">
                {message.toolInvocations.map((invocation) => (
                  <ToolCallBlock key={invocation.toolCallId} invocation={invocation} />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
