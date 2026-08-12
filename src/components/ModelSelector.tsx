import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listModels } from "../lib/commands";
import type { ModelEntry } from "../lib/types";

interface ModelSelectorProps {
  selectedModel: string | null;
  onModelChange: (model: string | null) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Preload models on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const result = await listModels();
        if (!cancelled) setModels(result);
      } catch (err) {
        console.error("Failed to load models:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay so the modal is mounted first
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    if (isOpen) setSearchQuery("");
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return models;
    const q = searchQuery.toLowerCase();
    return models.filter(
      (m) =>
        m.display_name.toLowerCase().includes(q) ||
        m.model_id.toLowerCase().includes(q) ||
        m.provider_id.toLowerCase().includes(q)
    );
  }, [models, searchQuery]);

  const grouped = useMemo(() => {
    return filteredModels.reduce<Record<string, ModelEntry[]>>((acc, model) => {
      if (!acc[model.provider_id]) acc[model.provider_id] = [];
      acc[model.provider_id].push(model);
      return acc;
    }, {});
  }, [filteredModels]);

  const handleSelect = useCallback(
    (model: ModelEntry) => {
      onModelChange(`${model.provider_id}/${model.model_id}`);
      setIsOpen(false);
    },
    [onModelChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onModelChange(null);
    },
    [onModelChange]
  );

  const displayName = selectedModel
    ? selectedModel.split("/").pop() || selectedModel
    : "Default";

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] hover:border-[var(--input-focus)] transition-colors"
        title={selectedModel || "Select model"}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-[var(--accent)]">⚡</span>
        <span className="text-[var(--text-primary)] truncate max-w-[120px]">
          {displayName}
        </span>
        {selectedModel && (
          <span
            onClick={handleClear}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] ml-0.5"
            title="Reset to default"
          >
            ✕
          </span>
        )}
      </motion.button>

      {/* Modal popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-2xl shadow-2xl w-[480px] max-h-[70vh] flex flex-col overflow-hidden"
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 20 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sidebar-border)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--accent)] text-base">⚡</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      Select Model
                    </span>
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)] transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>

                {/* Search */}
                <div className="px-5 pt-3 pb-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search by name, provider, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--input-bg)] text-sm text-[var(--text-primary)] rounded-xl px-4 py-2.5 outline-none border border-[var(--input-border)] focus:border-[var(--input-focus)] placeholder:text-[var(--text-muted)] transition-colors"
                  />
                </div>

                {/* Model list */}
                <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)] text-sm gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="text-lg"
                      >
                        ⏳
                      </motion.div>
                      <span>Loading models...</span>
                    </div>
                  ) : filteredModels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)] text-sm">
                      <span className="text-lg mb-1">🔍</span>
                      <span>No models found</span>
                    </div>
                  ) : (
                    Object.entries(grouped).map(([providerId, providerModels]) => (
                      <div key={providerId} className="mb-2">
                        <div className="px-2 py-1.5 text-[10px] text-[var(--accent)] font-semibold uppercase tracking-wider">
                          {providerId}
                        </div>
                        {providerModels.map((model) => {
                          const fullId = `${model.provider_id}/${model.model_id}`;
                          const isSelected = selectedModel === fullId;
                          return (
                            <button
                              key={fullId}
                              onClick={() => handleSelect(model)}
                              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
                                isSelected
                                  ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30"
                                  : "hover:bg-[var(--sidebar-hover)] border border-transparent"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-primary)] font-medium">
                                  {model.display_name}
                                </span>
                                {isSelected && (
                                  <span className="text-[var(--accent)] text-xs">✓</span>
                                )}
                              </div>
                              {model.description && (
                                <div className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-1">
                                  {model.description}
                                </div>
                              )}
                              <div className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono opacity-60">
                                {fullId}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-2.5 border-t border-[var(--sidebar-border)] text-[10px] text-[var(--text-muted)]">
                  {models.length} models available
                  {searchQuery && filteredModels.length !== models.length &&
                    ` · ${filteredModels.length} matched`
                  }
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
