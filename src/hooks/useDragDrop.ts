import { useState, useEffect, useCallback } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import type { PendingAttachment } from "../lib/types";

export function useDragDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<PendingAttachment[]>([]);

  useEffect(() => {
    const webview = getCurrentWebview();

    const unlisten = webview.onDragDropEvent(async (event) => {
      if (event.payload.type === "enter") {
        setIsDragging(true);
      } else if (event.payload.type === "leave") {
        setIsDragging(false);
      } else if (event.payload.type === "drop") {
        setIsDragging(false);

        const imageExts = /\.(png|jpe?g|gif|webp|bmp)$/i;

        for (const filePath of event.payload.paths) {
          if (imageExts.test(filePath)) {
            const filename = filePath.split("/").pop() || "image.png";
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

            // Create a preview URL from the file path
            const previewUrl = `asset://localhost/${filePath}`;

            const pending: PendingAttachment = {
              id,
              file: new File([], filename),
              previewUrl,
              savedPath: filePath,
            };

            setDroppedFiles((prev) => [...prev, pending]);
          }
        }
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const clearDroppedFiles = useCallback(() => {
    setDroppedFiles([]);
  }, []);

  return {
    isDragging,
    droppedFiles,
    clearDroppedFiles,
  };
}
