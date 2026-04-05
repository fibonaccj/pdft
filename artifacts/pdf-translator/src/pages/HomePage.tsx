import { useState, useRef, useCallback } from "react";
import { Upload, Settings, ArrowRight, X, FileText } from "lucide-react";
import { PDFViewer } from "@/components/PDFViewer";
import { TranslationPanel } from "@/components/TranslationPanel";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useSettings } from "@/hooks/useSettings";
import { translateWithGemini } from "@/services/gemini";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { settings, saveSettings, isFirstVisit, setIsFirstVisit } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(isFirstVisit);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfViewerRef = useRef<HTMLDivElement>(null);
  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    setPdfFile(file);
    setTranslation("");
    setTranslationError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleTranslate = useCallback(async () => {
    if (!pdfFile) return;

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const canvas = pdfViewerRef.current?.querySelector("canvas") as HTMLCanvasElement | null;

      if (!canvas) {
        throw new Error("Could not find the PDF canvas. Please make sure the PDF is loaded and try again.");
      }

      const imageBase64 = canvas.toDataURL("image/png").split(",")[1];

      const result = await translateWithGemini({
        model: settings.model,
        imageBase64,
        sourceLanguage: settings.sourceLanguage,
        targetLanguage: settings.targetLanguage,
        notes: settings.notes,
      });

      setTranslation(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setTranslationError(msg);
    } finally {
      setIsTranslating(false);
    }
  }, [pdfFile, settings]);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <FileText size={16} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-none">PDF Translator</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Read Any Book In Any Language With AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!pdfFile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              <Upload size={13} />
              Upload PDF
            </button>
          ) : (
            <button
              onClick={() => { setPdfFile(null); setTranslation(""); setTranslationError(null); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-foreground text-xs font-medium hover:bg-muted transition-all"
            >
              <X size={13} />
              Clear
            </button>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="Settings"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {!pdfFile ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full max-w-md aspect-[4/3] rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-4 transition-all",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Upload size={28} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Drop your PDF here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className="flex-1 min-w-0 border-r border-border bg-card overflow-hidden">
            <PDFViewer
              file={pdfFile}
              viewerRef={pdfViewerRef}
            />
          </div>

          <div className="flex items-center justify-center shrink-0 relative z-10" style={{ width: 0 }}>
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !pdfFile}
              className={cn(
                "absolute flex flex-col items-center gap-1.5 rounded-2xl shadow-lg transition-all duration-200 py-4 px-2.5",
                "border-2 -translate-x-1/2",
                isTranslating
                  ? "bg-muted border-border text-muted-foreground cursor-wait"
                  : "bg-primary border-primary/20 text-primary-foreground hover:scale-105 hover:shadow-xl active:scale-95"
              )}
              title="Translate current page"
              style={{ width: "40px" }}
            >
              {isTranslating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mb-1" />
                  <span className="text-[9px] font-bold leading-none tracking-wider uppercase" style={{ writingMode: "vertical-lr" }}>
                    ...
                  </span>
                </>
              ) : (
                <>
                  <ArrowRight size={16} />
                  <span className="text-[9px] font-bold leading-none tracking-wider uppercase mt-0.5" style={{ writingMode: "vertical-lr" }}>
                    Translate
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 min-w-0 bg-card overflow-hidden">
            <TranslationPanel
              translation={translation}
              isLoading={isTranslating}
              error={translationError}
              sourceLanguage={settings.sourceLanguage}
              targetLanguage={settings.targetLanguage}
            />
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = "";
        }}
      />

      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setIsFirstVisit(false);
        }}
        settings={settings}
        onSave={(s) => {
          saveSettings(s);
          setIsFirstVisit(false);
        }}
        isFirstVisit={isFirstVisit}
      />
    </div>
  );
}
