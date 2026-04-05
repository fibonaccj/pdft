import { useState, useEffect } from "react";
import { Settings } from "@/hooks/useSettings";
import { X, Copy, Check } from "lucide-react";
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

// Model selection removed; model is configured on the server side.

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
  isFirstVisit?: boolean;
}

export function SettingsDialog({ isOpen, onClose, settings, onSave, isFirstVisit }: SettingsDialogProps) {
  const [form, setForm] = useState<Settings>(settings);
  const [copied, setCopied] = useState(false);
  const [customModel] = useState(false);

  useEffect(() => {
    setForm(settings);
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
              Customize the language source/destination and add notes to your translation.
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

          {/* Model selection removed from UI */}

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
              <p className="text-xs text-muted-foreground tracking-wider mb-3">congcuonghero@gmail.com</p>
              
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
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
            )}
          >
            {isFirstVisit ? "Get Started" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
