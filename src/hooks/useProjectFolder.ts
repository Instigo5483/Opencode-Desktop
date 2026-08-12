import { useState, useCallback } from "react";

const PROJECT_FOLDER_KEY = "opencode-desktop-project-folder";

export function useProjectFolder() {
  const [selectedFolder, setSelectedFolderState] = useState<string | null>(() => {
    return localStorage.getItem(PROJECT_FOLDER_KEY);
  });

  const setSelectedFolder = useCallback((folder: string | null) => {
    setSelectedFolderState(folder);
    if (folder) {
      localStorage.setItem(PROJECT_FOLDER_KEY, folder);
    } else {
      localStorage.removeItem(PROJECT_FOLDER_KEY);
    }
  }, []);

  const clearFolder = useCallback(() => {
    setSelectedFolderState(null);
    localStorage.removeItem(PROJECT_FOLDER_KEY);
  }, []);

  return {
    selectedFolder,
    setSelectedFolder,
    clearFolder,
  };
}
