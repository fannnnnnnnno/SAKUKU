"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, Camera, Circle } from "lucide-react";
import { parseReceiptText } from "@/lib/receiptParser";

type ScanState = "idle" | "camera" | "captured";

export default function ScanStrukScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePreview]);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setScanState("camera");
    } catch (err: unknown) {
      const message =
        err instanceof DOMException
          ? err.name === "NotAllowedError"
            ? "Izin kamera ditolak. Izinkan akses kamera di pengaturan browser."
            : err.name === "NotFoundError"
              ? "Kamera tidak ditemukan di perangkat ini."
              : err.message
          : "Gagal mengakses kamera.";
      setCameraError(message);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setImagePreview(dataUrl);
    stopCamera();
    setScanState("captured");
    processImage(dataUrl);
  }

  async function processImage(imageSrc: string) {
    setIsProcessing(true);
    setProgress(0);

    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

      const Tesseract = await import("tesseract.js");

      const result = await Tesseract.recognize(file, "ind+eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const parsed = parseReceiptText(result.data.text);

      sessionStorage.setItem(
        "scan-result",
        JSON.stringify({
          merchant: parsed.merchant || "",
          total: parsed.total || 0,
          date: parsed.date || new Date().toISOString(),
          rawText: result.data.text,
        })
      );

      router.push("/scan/hasil");
    } catch {
      alert("Gagal memproses gambar. Coba lagi atau isi manual.");
      setIsProcessing(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setScanState("captured");
    processImage(previewUrl);
  };

  function handleBackToIdle() {
    stopCamera();
    setScanState("idle");
    setImagePreview(null);
    setCameraError(null);
  }

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <div className="flex items-center gap-4 px-5 pt-6 pb-4">
        <button onClick={scanState === "idle" ? () => router.back() : handleBackToIdle}>
          <ArrowLeft size={24} color="white" />
        </button>
        <h1 className="text-lg font-bold text-white">Scan Struk</h1>
      </div>

      {/* Viewfinder / Preview */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {scanState === "idle" && (
          <>
            <div className="w-full aspect-[3/4] max-w-xs border-2 border-white rounded-2xl relative flex items-center justify-center">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary-container rounded-tl-2xl" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary-container rounded-tr-2xl" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary-container rounded-bl-2xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary-container rounded-br-2xl" />
              <Camera size={48} className="text-white/30" />
            </div>
            <p className="text-white text-sm mt-4 text-center">
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

        {(scanState === "captured" || isProcessing) && imagePreview && (
          <div className="w-full max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview struk"
              className="w-full rounded-xl object-contain max-h-96"
            />
            {isProcessing && (
              <div className="mt-6 text-center">
                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white text-sm">Memproses... {progress}%</p>
              </div>
            )}
          </div>
        )}

        {cameraError && (
          <p className="text-red-400 text-sm text-center mt-4">{cameraError}</p>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-gradient-to-t from-black/60 to-transparent pb-8 pt-6 flex items-center justify-center gap-10">
        {scanState === "idle" && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <ImageIcon size={20} color="white" />
              </div>
              <span className="text-[10px] text-white">GALERI</span>
            </button>

            <button
              onClick={startCamera}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
            >
              <Camera size={26} color="black" />
            </button>

            <div className="w-12 h-12" />
          </>
        )}

        {scanState === "camera" && !isProcessing && (
          <button
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
          >
            <Circle size={36} color="white" fill="white" />
          </button>
        )}
      </div>

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
