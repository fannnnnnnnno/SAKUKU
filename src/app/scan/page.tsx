"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, Camera, Circle, AlertCircle } from "lucide-react";
import { parseReceiptText } from "@/lib/receiptParser";

type ScanState = "idle" | "camera" | "preview" | "processing" | "error";

export default function ScanStrukScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const startCamera = useCallback(async () => {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanState("camera");
    } catch {
      openFilePicker();
    }
  }, [openFilePicker]);

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    stopCamera();

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      processImage(file);
    }, "image/jpeg", 0.85);
  }

  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX_WIDTH = 1200;
        const ratio = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Gagal membaca gambar"));
      };

      img.src = url;
    });
  }, []);

  const processImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("File harus berupa gambar (JPG, PNG, dll)");
      setScanState("error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Ukuran gambar terlalu besar (maksimal 10MB)");
      setScanState("error");
      return;
    }

    setScanState("preview");
    setProgress(0);
    setErrorMsg("");

    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
      setScanState("processing");

      const { createWorker } = await import("tesseract.js");

      const worker = await createWorker("ind+eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data } = await worker.recognize(compressed);
      await worker.terminate();

      if (!data.text || data.text.trim().length < 10) {
        throw new Error(
          "Teks pada struk tidak terbaca. Coba foto ulang dengan pencahayaan lebih baik."
        );
      }

      const parsed = parseReceiptText(data.text);

      sessionStorage.setItem(
        "scan-result",
        JSON.stringify({
          merchant: parsed.merchant || "",
          total: parsed.total || 0,
          date: parsed.date || new Date().toISOString(),
          rawText: data.text,
        })
      );

      router.push("/scan/hasil");
    } catch (err) {
      console.error("OCR error:", err);
      const msg =
        err instanceof Error ? err.message : "Gagal memproses struk.";
      setErrorMsg(msg + " Coba lagi atau isi manual.");
      setScanState("error");
    }
  }, [compressImage, router]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      await processImage(file);
    },
    [processImage]
  );

  const handleReset = () => {
    stopCamera();
    setImagePreview(null);
    setScanState("idle");
    setProgress(0);
    setErrorMsg("");
  };

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <div className="flex items-center gap-4 px-5 pt-6 pb-4">
        <button onClick={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </button>
        <h1 className="text-lg font-bold text-white">Scan Struk</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {scanState === "idle" && (
          <>
            <div className="w-full max-w-xs aspect-[3/4] border-2 border-white/40 rounded-2xl relative">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary-container rounded-tl-2xl" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary-container rounded-tr-2xl" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary-container rounded-bl-2xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary-container rounded-br-2xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/50 text-sm text-center px-4">
                  Arahkan kamera ke struk belanja
                </p>
              </div>
            </div>
            <p className="text-white/70 text-sm mt-4 text-center">
              Posisikan struk di dalam kotak
            </p>
          </>
        )}

        {scanState === "camera" && (
          <div className="w-full max-w-xs relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-[3/4] object-cover rounded-2xl"
            />
            <div className="absolute inset-0 rounded-2xl border-2 border-primary-container pointer-events-none" />
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary-container rounded-tl-2xl" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary-container rounded-tr-2xl" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary-container rounded-bl-2xl" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary-container rounded-br-2xl" />
          </div>
        )}

        {(scanState === "preview" || scanState === "processing") &&
          imagePreview && (
            <div className="w-full max-w-xs">
              <img
                src={imagePreview}
                alt="Preview struk"
                className="w-full rounded-xl object-contain max-h-96"
              />
              {scanState === "processing" && (
                <div className="mt-6 text-center">
                  <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white text-sm font-medium">
                    Memproses... {progress}%
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    Mohon tunggu, jangan tutup halaman ini
                  </p>
                  <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden max-w-[200px] mx-auto">
                    <div
                      className="h-full bg-primary-container rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        {scanState === "error" && (
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} color="#FF584F" />
            </div>
            <p className="text-white text-sm font-medium mb-2">
              Gagal Memproses
            </p>
            <p className="text-white/60 text-xs mb-6">{errorMsg}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-white/10 text-white text-sm rounded-full border border-white/20"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      {scanState === "idle" && (
        <div className="pb-10 pt-6 flex items-center justify-center gap-12">
          <button
            onClick={openFilePicker}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
              <ImageIcon size={20} color="white" />
            </div>
            <span className="text-[10px] text-white/70 font-medium tracking-wide">
              GALERI
            </span>
          </button>
          <button
            onClick={startCamera}
            className="rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            style={{ width: 72, height: 72 }}
          >
            <Camera size={28} color="black" />
          </button>
          <div className="w-12 h-12" />
        </div>
      )}

      {scanState === "camera" && (
        <div className="pb-10 pt-6 flex items-center justify-center">
          <button
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform"
          >
            <Circle size={36} color="white" fill="white" />
          </button>
        </div>
      )}

      {scanState === "error" && (
        <div className="pb-10 pt-6 flex items-center justify-center gap-12">
          <button
            onClick={openFilePicker}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
              <ImageIcon size={20} color="white" />
            </div>
            <span className="text-[10px] text-white/70 font-medium tracking-wide">
              GALERI
            </span>
          </button>
          <button
            onClick={startCamera}
            className="rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            style={{ width: 72, height: 72 }}
          >
            <Camera size={28} color="black" />
          </button>
          <div className="w-12 h-12" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
