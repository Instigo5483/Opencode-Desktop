import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ContextMenuItem {
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
  onClick?: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ items, x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const adjustedX = Math.min(x, window.innerWidth - 180);
  const adjustedY = Math.min(y, window.innerHeight - (items.length * 36 + 16));

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
        className="fixed z-[100] min-w-[170px] rounded-xl border border-[var(--sidebar-border)] bg-[var(--bg-surface0)]/95 backdrop-blur-xl shadow-2xl shadow-black/30 py-1.5"
        style={{ left: adjustedX, top: adjustedY }}
      >
        {items.map((item, index) => {
          if (item.separator) {
            return (
              <div
                key={index}
                className="my-1 mx-2 border-t border-[var(--sidebar-border)]"
              />
            );
          }

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.15 }}
              onClick={() => {
                if (!item.disabled && item.onClick) item.onClick();
                onClose();
              }}
              disabled={item.disabled}
              className={`w-full text-left px-3 py-2 mx-1 rounded-lg text-[13px] flex items-center gap-2.5 transition-colors duration-100 ${
                item.danger
                  ? "text-[var(--danger)] hover:bg-[var(--danger)]/10"
                  : item.disabled
                  ? "text-[var(--text-muted)] cursor-not-allowed"
                  : "text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)]"
              }`}
              style={{ width: "calc(100% - 8px)" }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              {item.icon && (
                <span className="w-4 text-center text-[13px]">{item.icon}</span>
              )}
              {item.label}
            </motion.button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
