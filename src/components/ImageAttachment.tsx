import { motion } from "framer-motion";
import type { PendingAttachment } from "../lib/types";

interface ImageAttachmentProps {
  attachment: PendingAttachment;
  onRemove: (id: string) => void;
}

export function ImageAttachment({ attachment, onRemove }: ImageAttachmentProps) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      layout
    >
      <img
        src={attachment.previewUrl}
        alt={attachment.file.name}
        className="h-16 w-16 object-cover rounded-lg border border-[var(--input-border)] shadow-sm"
      />
      <motion.button
        onClick={() => onRemove(attachment.id)}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--danger)] text-white text-[10px] flex items-center justify-center shadow-md"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.8 }}
      >
        ✕
      </motion.button>
      <div className="text-[9px] text-[var(--text-muted)] text-center mt-1 max-w-16 truncate">
        {attachment.file.name}
      </div>
    </motion.div>
  );
}
