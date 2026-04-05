import { useState, useRef } from "react";
import { Copy, Check, Languages, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranslationPanelProps {
  translation: string;
  isLoading: boolean;
  error: string | null;
  sourceLanguage: string;
  targetLanguage: string;
}

export function TranslationPanel({
  translation,
  isLoading,
  error,
  sourceLanguage,
  targetLanguage,
}: TranslationPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!translation) return;
    navigator.clipboard.writeText(translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/50 shrink-0">
        <div className="flex items-center gap-2">
          <Languages size={14} className="text-primary" />
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{sourceLanguage}</span>
            <span className="mx-1.5">→</span>
            <span className="font-medium text-foreground">{targetLanguage}</span>
          </span>
        </div>
        {translation && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4" style={{ scrollbarWidth: "thin" }}>
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-sm">Translating...</p>
              <p className="text-xs text-muted-foreground mt-1">AI is processing your document</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle size={24} className="text-destructive" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-sm">Translation Failed</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && !translation && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground select-none p-8">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <Languages size={36} className="text-muted-foreground/60" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Translation will appear here</p>
              <p className="text-sm mt-1">Upload a PDF and click Translate</p>
            </div>
          </div>
        )}

        {!isLoading && !error && translation && (
          <div className="prose prose-sm max-w-none text-foreground">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed break-words bg-transparent p-0 m-0 border-none text-black">
              {translation}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
