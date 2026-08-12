import { motion, AnimatePresence } from "framer-motion";
import type { SessionStats } from "../lib/types";
import { formatCost, formatTokens } from "../lib/utils";

interface StatusBarProps {
  stats: SessionStats | null;
  model: string | null;
  messageCount: number;
  isSending: boolean;
}

export function StatusBar({ stats, model, messageCount, isSending }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 border-t border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[10px] text-[var(--text-muted)]">
      <div className="flex items-center gap-3">
        <AnimatePresence>
          {model && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
            >
              Model: <span className="text-[var(--accent)]">{model}</span>
            </motion.span>
          )}
        </AnimatePresence>
        <span>{messageCount} messages</span>
      </div>

      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          {isSending && (
            <motion.span
              key="sending"
              className="text-[var(--accent)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Sending...
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {stats && (
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span>
                Tokens: <span className="text-[var(--text-secondary)]">{formatTokens(stats.total_tokens_input + stats.total_tokens_output)}</span>
              </span>
              <span>
                Cost: <span className="text-[var(--text-secondary)]">{formatCost(stats.total_cost)}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
