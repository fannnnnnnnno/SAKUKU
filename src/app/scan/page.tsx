"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, AlertCircle, FlipVertical2, Zap, ZapOff, CameraOff } from "lucide-react";
import { parseReceiptText } from "@/lib/receiptParser";

type ScanState = "requesting" | "camera" | "processing" | "error";
type FacingMode = "environment" | "user";

export default function ScanStrukScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scanState, setScanState] = useState<ScanState>("requesting");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (facing: FacingMode = "environment") => {
    stopCamera();
    setScanState("requesting");
    setErrorMsg("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanState("camera");

      const devices = await navigator.mediaDevices.enumerateDevices();
      setHasMultipleCameras(devices.filter((d) => d.kind === "videoinput").length > 1);
    } catch (err) {
      const e = err as DOMException;
      let msg = "Kamera tidak dapat diakses.";

      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        msg = "Izin kamera ditolak. Izinkan akses kamera di pengaturan browser lalu muat ulang halaman.";
      } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
        msg = "Kamera tidak ditemukan. Gunakan tombol galeri untuk upload foto struk.";
      } else if (e.name === "NotReadableError" || e.name === "TrackStartError") {
        msg = "Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain lalu coba lagi.";
      } else if (e.name === "OverconstrainedError") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = stream;
          if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
          setScanState("camera");
          return;
        } catch {
          msg = "Kamera tidak kompatibel. Gunakan galeri untuk upload foto.";
        }
      }

      setErrorMsg(msg);
      setScanState("error");
    }
  }, [stopCamera]);

  // Auto-start kamera saat halaman dibuka
  useEffect(() => {
    startCamera("environment");
    return () => stopCamera();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flipCamera = useCallback(async () => {
    const next: FacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    await startCamera(next);
  }, [facingMode, startCamera]);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      // @ts-ignore
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn((v) => !v);
    } catch { /* torch tidak didukung */ }
  }, [torchOn]);

  const processDataUrl = useCallback(async (dataUrl: string) => {
    setScanState("processing");
    setProgress(0);

    try {
      const compressed = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ratio = Math.min(1, 1400 / img.width);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.88));
        };
        img.onerror = () => reject(new Error("Gagal membaca gambar"));
        img.src = dataUrl;
      });

      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("ind+eng", 1, {
        logger: (m) => { if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100)); },
      });
      const { data } = await worker.recognize(compressed);
      await worker.terminate();

      if (!data.text || data.text.trim().length < 5) {
        throw new Error("Teks tidak terbaca. Coba foto ulang dengan pencahayaan lebih baik.");
      }

      const parsed = parseReceiptText(data.text);
      sessionStorage.setItem("scan-result", JSON.stringify({
        merchant: parsed.merchant || "",
        total: parsed.total || 0,
        date: parsed.date || new Date().toISOString(),
        rawText: data.text,
      }));

      router.push("/scan/hasil");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memproses struk.");
      setScanState("error");
    }
  }, [router]);

  const captureFromCamera = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    stopCamera();
    setImagePreview(dataUrl);
    await processDataUrl(dataUrl);
  }, [stopCamera, processDataUrl]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) { setErrorMsg("File harus berupa gambar"); setScanState("error"); return; }
    if (file.size > 15 * 1024 * 1024) { setErrorMsg("Gambar terlalu besar (max 15MB)"); setScanState("error"); return; }
    stopCamera();
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    await processDataUrl(url);
    URL.revokeObjectURL(url);
  }, [stopCamera, processDataUrl]);

  return (
    <main className="min-h-screen bg-black flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-3 z-20 relative">
        <button onClick={() => { stopCamera(); router.back(); }} className="p-1.5 rounded-full bg-black/40">
          <ArrowLeft size={22} color="white" />
        </button>
        <h1 className="text-base font-bold text-white flex-1">Scan Struk</h1>
        {scanState === "camera" && (
          <div className="flex items-center gap-2">
            <button onClick={toggleTorch} className="p-2 rounded-full bg-white/15 border border-white/20">
              {torchOn ? <Zap size={18} color="#FEE440" fill="#FEE440" /> : <ZapOff size={18} color="white" />}
            </button>
            {hasMultipleCameras && (
              <button onClick={flipCamera} className="p-2 rounded-full bg-white/15 border border-white/20">
                <FlipVertical2 size={18} color="white" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Requesting */}
      {scanState === "requesting" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Meminta akses kamera...</p>
        </div>
      )}

      {/* Camera live view */}
      {scanState === "camera" && (
        <div className="flex-1 relative">
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/35 pointer-events-none" />
          {/* Guide frame */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-80 md:w-80 md:h-96">
              <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-[3px] border-l-[3px] border-green-400 rounded-tl-xl" />
              <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-[3px] border-r-[3px] border-green-400 rounded-tr-xl" />
              <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-[3px] border-l-[3px] border-green-400 rounded-bl-xl" />
              <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-[3px] border-r-[3px] border-green-400 rounded-br-xl" />
              <div className="absolute inset-0 border border-white/10 rounded-xl" />
              {/* Scan line */}
              <div className="absolute left-2 right-2 h-0.5 bg-green-400/70 rounded animate-bounce" style={{ top: "40%" }} />
            </div>
          </div>
          <p className="absolute bottom-32 left-0 right-0 text-center text-white/70 text-sm pointer-events-none">
            Posisikan struk di dalam bingkai
          </p>
        </div>
      )}

      {/* Processing */}
      {scanState === "processing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          {imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="Preview" className="w-full max-w-xs rounded-xl object-contain max-h-56 opacity-60" />
          )}
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white font-medium text-sm">Memproses... {progress}%</p>
            <p className="text-white/40 text-xs mt-1">Jangan tutup halaman ini</p>
            <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden w-48 mx-auto">
              <div className="h-full bg-green-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {scanState === "error" && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <CameraOff size={28} color="#FF584F" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold mb-2">Kamera Tidak Tersedia</p>
            <p className="text-white/60 text-sm leading-relaxed">{errorMsg}</p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button onClick={() => startCamera(facingMode)} className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-full">
              Coba Lagi
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-white/10 text-white text-sm font-medium rounded-full border border-white/20 flex items-center justify-center gap-2">
              <ImageIcon size={16} />
              Upload dari Galeri
            </button>
          </div>
        </div>
      )}

      {/* Bottom shutter controls */}
      {scanState === "camera" && (
        <div className="relative z-10 pb-8 pt-4 flex items-center justify-around px-8">
          <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
              <ImageIcon size={20} color="white" />
            </div>
            <span className="text-[10px] text-white/60 tracking-wide">GALERI</span>
          </button>

          {/* Shutter */}
          <button onClick={captureFromCamera} className="relative active:scale-95 transition-transform" style={{ width: 76, height: 76 }}>
            <div className="absolute inset-0 rounded-full border-4 border-white/50" />
            <div className="absolute inset-2 rounded-full bg-white shadow-lg" />
          </button>

          <div className="w-12 h-12" />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </main>
  );
}
