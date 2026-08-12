import { useState, useCallback } from "react";
import type { PendingAttachment } from "../lib/types";
import { saveImageAttachment } from "../lib/commands";

export function useClipboardImage() {
  const [pendingImages, setPendingImages] = useState<PendingAttachment[]>([]);

  const addImageFromFile = useCallback(async (file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const previewUrl = URL.createObjectURL(file);

    const pending: PendingAttachment = {
      id,
      file,
      previewUrl,
    };

    setPendingImages((prev) => [...prev, pending]);
    return pending;
  }, []);

  const addImageFromPath = useCallback(
    (filename: string, savedPath: string, previewUrl: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const pending: PendingAttachment = {
        id,
        file: new File([], filename),
        previewUrl,
        savedPath,
      };
      setPendingImages((prev) => [...prev, pending]);
      return pending;
    },
    []
  );

  const removeImage = useCallback((id: string) => {
    setPendingImages((prev) => {
      const img = prev.find((p) => p.id === id);
      if (img) {
        URL.revokeObjectURL(img.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setPendingImages([]);
  }, [pendingImages]);

  const saveAllPending = useCallback(async (): Promise<string[]> => {
    const paths: string[] = [];

    for (const pending of pendingImages) {
      if (pending.savedPath) {
        paths.push(pending.savedPath);
        continue;
      }

      try {
        const bytes = Array.from(new Uint8Array(await pending.file.arrayBuffer()));
        const info = await saveImageAttachment(bytes, pending.file.name);
        paths.push(info.path);
      } catch (err) {
        console.error("Failed to save attachment:", err);
      }
    }

    return paths;
  }, [pendingImages]);

  return {
    pendingImages,
    addImageFromFile,
    addImageFromPath,
    removeImage,
    clearAll,
    saveAllPending,
  };
}
