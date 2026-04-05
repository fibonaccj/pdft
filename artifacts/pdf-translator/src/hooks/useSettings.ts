import { useState, useEffect } from "react";

export interface Settings {
  sourceLanguage: string;
  targetLanguage: string;
  model: string;
  notes: string;
}

const DEFAULT_SETTINGS: Settings = {
  sourceLanguage: "Auto Detect",
  targetLanguage: "Vietnamese",
  model: "gemini-3.1-flash-lite-preview",
  notes: "",
};

const STORAGE_KEY = "pdf-translator-settings";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
    }
    return DEFAULT_SETTINGS;
  });

  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
    // No longer gating by API key; default to not first visit unless no settings exist
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return false;
      }
    } catch {
    }
    return false;
  });

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setIsFirstVisit(false);
    } catch {
    }
  };

  return { settings, saveSettings, isFirstVisit, setIsFirstVisit };
}
