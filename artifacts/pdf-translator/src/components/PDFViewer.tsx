import { useState, useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

interface PDFViewerProps {
  file: File | null;
  onPageChange?: (page: number) => void;
  viewerRef?: React.RefObject<HTMLDivElement | null>;
}

export function PDFViewer({ file, onPageChange, viewerRef }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const [pageInput, setPageInput] = useState<string>("1");

  useEffect(() => {
    if (!file) return;

    const loadPDF = async () => {
      setLoading(true);
      setError(null);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
      } catch (e) {
        setError("Failed to load PDF. Please check the file and try again.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [file]);

  const renderPage = useCallback(async (pageNum: number, doc: pdfjsLib.PDFDocumentProxy, sc: number) => {
    if (!canvasRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: sc });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;
      await task.promise;
      renderTaskRef.current = null;
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "RenderingCancelledException") {
        console.error("Render error:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage, pdfDoc, scale);
      onPageChange?.(currentPage);
      setPageInput(String(currentPage));
    }
  }, [pdfDoc, currentPage, scale, renderPage, onPageChange]);

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const zoomIn = () => setScale((s) => Math.min(3, parseFloat((s + 0.2).toFixed(1))));
  const zoomOut = () => setScale((s) => Math.max(0.4, parseFloat((s - 0.2).toFixed(1))));
  const resetZoom = () => setScale(1.2);
  const jumpToPage = () => {
    if (!totalPages) return;
    const parsed = parseInt(pageInput, 10);
    if (Number.isNaN(parsed)) {
      setPageInput(String(currentPage));
      return;
    }
    const clamped = Math.min(Math.max(parsed, 1), totalPages);
    setCurrentPage(clamped);
  };

  if (!file) {
    return (
      <div ref={viewerRef} className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground select-none p-8">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
          <FileText size={36} className="text-muted-foreground/60" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">No PDF loaded</p>
          <p className="text-sm mt-1">Upload a PDF file to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={viewerRef} className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/50 shrink-0 gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Zoom out">
            <ZoomOut size={15} />
          </button>
          <span className="text-xs text-muted-foreground min-w-[42px] text-center font-mono">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Zoom in">
            <ZoomIn size={15} />
          </button>
          <button onClick={resetZoom} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Reset zoom">
            <RotateCcw size={13} />
          </button>
        </div>

        {totalPages > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrev}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={jumpToPage}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    jumpToPage();
                  }
                }}
                min={1}
                max={totalPages}
                className="w-16 px-2 py-1 rounded-md border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring text-center"
                aria-label="Current page"
              />
              <span className="text-xs text-muted-foreground px-1">/ {totalPages}</span>
            </div>
            <button
              onClick={goToNext}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/30 flex justify-center p-4"
        style={{ scrollbarWidth: "thin" }}
      >
        {loading && (
          <div className="flex items-center justify-center w-full">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading PDF...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center w-full">
            <div className="text-destructive text-sm text-center px-4">{error}</div>
          </div>
        )}
        {!loading && !error && (
          <canvas
            ref={canvasRef}
            className="shadow-lg rounded max-w-full"
            style={{ display: "block" }}
          />
        )}
      </div>
    </div>
  );
}
