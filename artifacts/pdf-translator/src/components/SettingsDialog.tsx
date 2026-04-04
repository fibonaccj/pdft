import { useState, useEffect } from "react";
import { Settings } from "@/hooks/useSettings";
import { X, Eye, EyeOff, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_LANGUAGES = [
  "Auto Detect",
  "English",
  "Vietnamese",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Japanese",
  "Korean",
  "French",
  "German",
  "Spanish",
  "Portuguese",
  "Italian",
  "Russian",
  "Arabic",
  "Thai",
  "Indonesian",
  "Malay",
  "Hindi",
];

const SUGGESTED_MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
];

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
  isFirstVisit?: boolean;
}

export function SettingsDialog({ isOpen, onClose, settings, onSave, isFirstVisit }: SettingsDialogProps) {
  const [form, setForm] = useState<Settings>(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customModel, setCustomModel] = useState(false);

  useEffect(() => {
    setForm(settings);
    setCustomModel(!SUGGESTED_MODELS.includes(settings.model));
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("0x8813ba5c0dd30c9e84ba343212293ae5936a0b64");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={isFirstVisit ? undefined : onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-transparent p-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isFirstVisit ? "Welcome to PDF Translator" : "Settings"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                This website lets you use your free Gemini API key to translate PDFs for free. Your API key is stored locally on your device — we never collect or store any customer data.
              </p>
            </div>
            {!isFirstVisit && (
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors ml-4 shrink-0">
                <X size={18} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Gemini API Key <span className="text-destructive">*</span></label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder="AIza..."
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your free key at{" "}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                aistudio.google.com
              </a>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Source Language</label>
              <select
                value={form.sourceLanguage}
                onChange={(e) => setForm({ ...form, sourceLanguage: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                {POPULAR_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Target Language</label>
              <select
                value={form.targetLanguage}
                onChange={(e) => setForm({ ...form, targetLanguage: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                {POPULAR_LANGUAGES.filter(l => l !== "Auto Detect").map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Gemini Model</label>
            <div className="space-y-2">
              <select
                value={customModel ? "__custom__" : form.model}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setCustomModel(true);
                  } else {
                    setCustomModel(false);
                    setForm({ ...form, model: e.target.value });
                  }
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                {SUGGESTED_MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="__custom__">Custom model...</option>
              </select>
              {customModel && (
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="e.g. gemini-2.0-flash-lite"
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">Default: gemini-2.0-flash-lite (free tier). Models may change over time.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Translation Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Keep technical terms in English, use formal tone..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
            />
          </div>

          <div className="mt-2 rounded-xl border border-border bg-muted/30 overflow-hidden">
            <div className="p-4 text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Support the Author</p>
              <img
                src="/bnb_qr.jpg"
                alt="BNB QR Code"
                className="w-36 h-36 mx-auto rounded-lg object-cover shadow-sm"
              />
              <p className="text-xs text-muted-foreground mt-3 font-medium">BNB Smart Chain (BEP20)</p>
              <div className="flex items-center gap-2 mt-1.5 bg-background rounded-lg px-3 py-2">
                <span className="text-xs text-foreground font-mono break-all leading-relaxed flex-1">
                  0x8813ba5c0dd30c9e84ba343212293ae5936a0b64
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Copy address"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 pt-0 flex gap-3">
          {!isFirstVisit && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!form.apiKey.trim()}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              form.apiKey.trim()
                ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isFirstVisit ? "Get Started" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
