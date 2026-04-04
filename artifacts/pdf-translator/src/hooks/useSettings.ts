import { useState, useEffect } from "react";

export interface Settings {
  apiKey: string;
  sourceLanguage: string;
  targetLanguage: string;
  model: string;
  notes: string;
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
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
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return !parsed.apiKey;
      }
    } catch {
    }
    return true;
  });

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      if (newSettings.apiKey) {
        setIsFirstVisit(false);
      }
    } catch {
    }
  };

  return { settings, saveSettings, isFirstVisit, setIsFirstVisit };
}
