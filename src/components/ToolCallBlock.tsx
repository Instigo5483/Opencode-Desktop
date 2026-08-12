import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ToolInvocation } from "../lib/types";

interface ToolCallBlockProps {
  invocation: ToolInvocation;
}

export function ToolCallBlock({ invocation }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false);

  const isComplete = invocation.state === "result";

  return (
    <div className="rounded-xl border border-[var(--sidebar-border)] bg-[var(--chat-tool)] overflow-hidden">
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[var(--sidebar-hover)] transition-colors"
        whileTap={{ scale: 0.99 }}
      >
        <div
          className={`w-4 h-4 rounded-full flex items-center justify-center ${
            isComplete ? "bg-[var(--success)]/15" : "bg-[var(--warning)]/15"
          }`}
        >
          {isComplete ? (
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
        <span className="text-[12px] font-mono text-[var(--text-secondary)]">
          {invocation.toolName}
        </span>
        <motion.svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="ml-auto"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-[var(--sidebar-border)]">
              {invocation.args && Object.keys(invocation.args).length > 0 && (
                <div className="mt-2.5">
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
                    Args
                  </span>
                  <pre className="mt-1.5 text-[11px] text-[var(--text-secondary)] font-mono overflow-x-auto max-h-40 overflow-y-auto bg-[var(--bg-crust)]/50 rounded-lg p-2.5 border border-[var(--sidebar-border)]">
                    {JSON.stringify(invocation.args, null, 2)}
                  </pre>
                </div>
              )}

              {invocation.result !== undefined && invocation.result !== null && (
                <div className="mt-2.5">
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
                    Result
                  </span>
                  <pre className="mt-1.5 text-[11px] text-[var(--text-secondary)] font-mono overflow-x-auto max-h-60 overflow-y-auto bg-[var(--bg-crust)]/50 rounded-lg p-2.5 border border-[var(--sidebar-border)]">
                    {typeof invocation.result === "string"
                      ? invocation.result
                      : JSON.stringify(invocation.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
