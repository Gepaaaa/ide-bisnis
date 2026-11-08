import React, { useState } from "react";
import {
  X,
  Upload,
  Copy,
  Check,
  RotateCcw,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Trash2,
  Eye,
  Maximize2,
  FileCode,
  Save,
} from "lucide-react";
import type { PhotoItem } from "../data/photos";

interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoItem[];
  chapter5Photo: PhotoItem;
  endingPhoto: PhotoItem;
  onUpdatePhoto: (id: string, updates: Partial<PhotoItem>) => void;
  onUpdateChapter5Photo: (updates: Partial<PhotoItem>) => void;
  onUpdateEndingPhoto: (updates: Partial<PhotoItem>) => void;
  onResetPhotos: () => void;
  onSaveToServer: () => Promise<{ success: boolean; count?: number; error?: string }>;
}

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  isOpen,
  onClose,
  photos,
  chapter5Photo,
  endingPhoto,
  onUpdatePhoto,
  onUpdateChapter5Photo,
  onUpdateEndingPhoto,
  onResetPhotos,
  onSaveToServer,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewImageError, setPreviewImageError] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const totalTabs = photos.length + 2; // 16 gallery + 1 Chapter 5 + 1 Ending = 18

  // Identify active item
  const isSpecialChapter5 = activeTab === 16;
  const isSpecialEnding = activeTab === 17;
  const isGallerySlot = activeTab < 16;

  const currentPhoto: PhotoItem = isSpecialChapter5
    ? chapter5Photo
    : isSpecialEnding
    ? endingPhoto
    : photos[activeTab] || photos[0];

  const currentSlotTitle = isSpecialChapter5
    ? "Foto Khusus Chapter 05 (Out of all the people)"
    : isSpecialEnding
    ? "Foto Khusus Ending (The Last Page)"
    : `Foto Slot ${activeTab + 1} (Galeri Wall)`;

  // Accurate check for whether photo is actually present
  const isCustomUploaded = Boolean(
    !previewImageError[currentPhoto?.id] &&
      (currentPhoto?.src?.startsWith("data:image/") ||
        currentPhoto?.src?.startsWith("blob:") ||
        (isGallerySlot && currentPhoto?.src?.includes("/assets/photos/foto")) ||
        currentPhoto?.src?.includes("?t="))
  );

  const handleUpdateCurrentPhoto = (updates: Partial<PhotoItem>) => {
    if (isSpecialChapter5) {
      onUpdateChapter5Photo(updates);
    } else if (isSpecialEnding) {
      onUpdateEndingPhoto(updates);
    } else {
      onUpdatePhoto(currentPhoto.id, updates);
    }
  };

  // Compress & resize image, then save directly to server endpoint
  const handleImageUpload = (file: File) => {
    setIsProcessing(true);
    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 850;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Gagal mengolah canvas gambar.");

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);

          // Clear any error state for this slot
          setPreviewImageError((prev) => ({ ...prev, [currentPhoto.id]: false }));

          // 1. Immediately update UI state with local dataUrl
          handleUpdateCurrentPhoto({
            src: compressedDataUrl,
            positionY: currentPhoto.positionY ?? 35,
            positionX: currentPhoto.positionX ?? 50,
            fit: currentPhoto.fit ?? (isSpecialChapter5 || isSpecialEnding ? "contain" : "cover"),
            zoom: currentPhoto.zoom ?? 1,
          });

          setUploadSuccess(`${currentSlotTitle} berhasil dipasang! Menyimpan permanen ke disk project...`);

          // 2. Direct single-photo API call
          const type = isSpecialChapter5 ? "chapter5" : isSpecialEnding ? "ending" : "gallery";
          const slot = activeTab + 1;

          const res = await fetch("/api/save-single-photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: currentPhoto.id,
              type,
              slot,
              src: compressedDataUrl,
            }),
          });

          const data = await res.json();
          if (data.success && data.url) {
            handleUpdateCurrentPhoto({
              src: data.url,
            });
            setUploadSuccess(`✅ ${currentSlotTitle} tersimpan permanen di folder project!`);
          } else {
            setUploadSuccess(`${currentSlotTitle} terpasang di preview!`);
          }
          setTimeout(() => setUploadSuccess(null), 3500);
        } catch (err: any) {
          console.error("Gagal memproses gambar:", err);
          setUploadError("Gagal menyimpan gambar: " + (err.message || "Unknown error"));
        } finally {
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        setIsProcessing(false);
        setUploadError("Gagal membaca file gambar. Pastikan format JPG, PNG, atau WebP.");
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setUploadError("Gagal membaca file dari perangkat.");
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveCustomPhoto = () => {
    let fallbackSrc = `/assets/photos/foto${activeTab + 1}.jpg`;
    if (isSpecialChapter5) fallbackSrc = `/assets/photos/chapter5.jpg`;
    if (isSpecialEnding) fallbackSrc = `/assets/photos/ending.jpg`;

    handleUpdateCurrentPhoto({
      src: fallbackSrc,
      positionY: 50,
      positionX: 50,
      fit: "contain",
      zoom: 1,
    });
  };

  const handleCopyData = () => {
    const exportData = [
      ...photos.map((p, idx) => ({
        slot: idx + 1,
        id: p.id,
        caption: p.caption,
        positionY: p.positionY ?? 50,
        positionX: p.positionX ?? 50,
        fit: p.fit ?? "cover",
        zoom: p.zoom ?? 1,
        hasCustomImage: p.src.startsWith("data:image/") || p.src.startsWith("blob:"),
      })),
      {
        slot: 17,
        id: "photo-chapter-5",
        special: "chapter-05",
        caption: chapter5Photo.caption,
        positionY: chapter5Photo.positionY ?? 50,
        positionX: chapter5Photo.positionX ?? 50,
        fit: chapter5Photo.fit ?? "contain",
        zoom: chapter5Photo.zoom ?? 1,
        hasCustomImage:
          chapter5Photo.src.startsWith("data:image/") || chapter5Photo.src.startsWith("blob:"),
      },
      {
        slot: 18,
        id: "photo-ending",
        special: "ending",
        caption: endingPhoto.caption,
        positionY: endingPhoto.positionY ?? 50,
        positionX: endingPhoto.positionX ?? 50,
        fit: endingPhoto.fit ?? "contain",
        zoom: endingPhoto.zoom ?? 1,
        hasCustomImage:
          endingPhoto.src.startsWith("data:image/") || endingPhoto.src.startsWith("blob:"),
      },
    ];

    const formatted = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleApplyImport = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        throw new Error("Format JSON harus berupa array daftar foto.");
      }
      parsed.forEach((item: any, idx: number) => {
        if (item.special === "chapter-05" || item.id === "photo-chapter-5" || item.slot === 17) {
          onUpdateChapter5Photo({
            ...(typeof item.caption === "string" ? { caption: item.caption } : {}),
            ...(typeof item.positionX === "number" ? { positionX: item.positionX } : {}),
            ...(typeof item.positionY === "number" ? { positionY: item.positionY } : {}),
            ...(item.fit === "cover" || item.fit === "contain" ? { fit: item.fit } : {}),
            ...(typeof item.zoom === "number" ? { zoom: item.zoom } : {}),
          });
        } else if (item.special === "ending" || item.id === "photo-ending" || item.slot === 18) {
          onUpdateEndingPhoto({
            ...(typeof item.caption === "string" ? { caption: item.caption } : {}),
            ...(typeof item.positionX === "number" ? { positionX: item.positionX } : {}),
            ...(typeof item.positionY === "number" ? { positionY: item.positionY } : {}),
            ...(item.fit === "cover" || item.fit === "contain" ? { fit: item.fit } : {}),
            ...(typeof item.zoom === "number" ? { zoom: item.zoom } : {}),
          });
        } else {
          const targetId = item.id || `photo-${item.slot || idx + 1}`;
          onUpdatePhoto(targetId, {
            ...(typeof item.caption === "string" ? { caption: item.caption } : {}),
            ...(typeof item.positionX === "number" ? { positionX: item.positionX } : {}),
            ...(typeof item.positionY === "number" ? { positionY: item.positionY } : {}),
            ...(item.fit === "cover" || item.fit === "contain" ? { fit: item.fit } : {}),
            ...(typeof item.zoom === "number" ? { zoom: item.zoom } : {}),
          });
        }
      });
      setShowImportDialog(false);
      setImportJsonText("");
      setUploadSuccess("Data konfigurasi foto berhasil diimpor!");
      setTimeout(() => setUploadSuccess(null), 3500);
    } catch (err: any) {
      setImportError(err.message || "Gagal membaca format JSON.");
    }
  };

  // Patenkan foto langsung ke coding/server
  const handlePatenkanSemua = async () => {
    setIsSavingToServer(true);
    setSaveBanner(null);
    try {
      const res = await onSaveToServer();
      if (res.success) {
        setSaveBanner(
          `✅ Berhasil! Semua foto (${res.count ?? 16} file) telah dipatenkan & tersimpan permanen di folder /public/assets/photos/!`
        );
        setTimeout(() => setSaveBanner(null), 6000);
      } else {
        alert("Gagal mematenkan foto: " + (res.error || "Terjadi kesalahan server."));
      }
    } finally {
      setIsSavingToServer(false);
    }
  };

  // Minimized widget floating at the bottom right
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#351B24] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/20 animate-in fade-in slide-in-from-bottom-3">
        <span className="text-xs font-medium flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#D8B8B2]" />
          <span>Panel Editor Diminimalkan ({currentSlotTitle})</span>
        </span>
        <button
          onClick={() => setIsMinimized(false)}
          className="px-3 py-1 bg-white text-[#351B24] rounded-full text-xs font-semibold hover:bg-[#F4EFE6] transition-colors flex items-center gap-1"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Buka Panel Kembali</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full max-h-[92vh] bg-[#FAF6F0] rounded-sm shadow-2xl border border-[#D8B8B2]/60 flex flex-col text-[#252321] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#F4EFE6] border-b border-[#351B24]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A94352]" />
            <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#351B24]">
              Sesuaikan Foto & Caption
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-sm text-[#8D8580] hover:text-[#351B24] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar (Patenkan ke Coding, Copy Export, Import, Peek, Reset) */}
        <div className="px-4 py-2.5 bg-white border-b border-[#351B24]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tombol Patenkan ke Coding */}
            <button
              onClick={handlePatenkanSemua}
              disabled={isSavingToServer}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-2xs disabled:opacity-50"
            >
              {isSavingToServer ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mematenkan ke Coding...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-white" />
                  <span>Patenkan Foto ke Coding</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-white bg-[#351B24] hover:bg-[#A94352] transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Data Berhasil Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Konfigurasi JSON</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setShowImportDialog(true);
                setImportError(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-[#351B24] bg-white border border-black/10 hover:bg-black/5 transition-colors shadow-2xs"
            >
              <FileCode className="w-3.5 h-3.5 text-[#A94352]" />
              <span>Impor Data JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-sm border border-black/10 bg-[#F4EFE6] hover:bg-black/5 text-[#351B24] transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#A94352]" />
              <span>Intip Tampilan Web</span>
            </button>
            <button
              onClick={onResetPhotos}
              className="inline-flex items-center gap-1 text-[11px] text-[#8D8580] hover:text-[#A94352] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Semua</span>
            </button>
          </div>
        </div>

        {/* Persistence Banner */}
        {saveBanner && (
          <div className="bg-emerald-700 text-white text-xs px-4 py-2 text-center animate-in fade-in flex items-center justify-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{saveBanner}</span>
          </div>
        )}

        {/* Success toast notification */}
        {uploadSuccess && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center animate-in fade-in flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Slot navigation buttons (16 Galeri Wall + Chapter 5 + Ending) */}
        <div className="flex gap-1.5 p-2.5 overflow-x-auto no-scrollbar bg-[#F4EFE6]/60 border-b border-black/5 shrink-0 items-center">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8D8580] pl-1 pr-1.5 shrink-0">
            Galeri Wall:
          </span>

          {photos.map((p, idx) => {
            const hasCustom =
              p.src.startsWith("data:image/") ||
              p.src.startsWith("blob:") ||
              p.src.includes("/assets/photos/foto");
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
                  activeTab === idx
                    ? "bg-[#351B24] text-white font-medium"
                    : "bg-white text-[#8D8580] hover:text-[#351B24] border border-black/5"
                }`}
              >
                <span>Foto {idx + 1}</span>
                {hasCustom && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>
            );
          })}

          <div className="h-5 w-px bg-black/15 mx-1.5 shrink-0" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A94352] px-1 shrink-0">
            Foto Khusus:
          </span>

          {/* Chapter 05 Dedicated Photo Tab */}
          <button
            onClick={() => setActiveTab(16)}
            className={`px-3.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 16
                ? "bg-[#A94352] text-white font-medium shadow-xs"
                : "bg-[#F3E7E8] text-[#351B24] hover:bg-[#A94352]/20 border border-[#A94352]/40"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Chapter 05 (Khusus)</span>
          </button>

          {/* Ending Scene Dedicated Photo Tab */}
          <button
            onClick={() => setActiveTab(17)}
            className={`px-3.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 17
                ? "bg-[#252321] text-white font-medium shadow-xs"
                : "bg-stone-200 text-[#252321] hover:bg-stone-300 border border-black/15"
            }`}
          >
            <Sparkles className="w-3 h-3 text-rose-300" />
            <span>Ending (The Last Page)</span>
          </button>
        </div>

        {/* Active Slot Editor Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {currentPhoto && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Instant Live Polaroid Card Preview */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#351B24] truncate">
                    {currentSlotTitle}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 ml-1">
                    Live 60fps
                  </span>
                </div>

                {/* The Exact Polaroid Card Component */}
                <div className="relative w-64 sm:w-72 p-3 sm:p-3.5 bg-white shadow-xl rounded-sm border border-black/10 select-none transition-all">
                  {/* Tape mark */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-white/80 border-t border-b border-black/10 shadow-2xs rotate-[-1deg] pointer-events-none z-10" />

                  {/* Frame */}
                  <div className="relative w-full h-48 sm:h-54 overflow-hidden bg-[#EAE2D5] rounded-xs mt-1">
                    {isCustomUploaded ? (
                      <>
                        {/* Ambient blurred backdrop for contain mode */}
                        {currentPhoto.fit === "contain" && (
                          <div
                            className="absolute inset-0 bg-cover bg-center blur-md opacity-35 scale-110 pointer-events-none"
                            style={{ backgroundImage: `url(${currentPhoto.src})` }}
                          />
                        )}
                        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                          <img
                            key={currentPhoto.src.slice(0, 50)}
                            src={currentPhoto.src}
                            alt={currentPhoto.caption}
                            onError={() => {
                              setPreviewImageError((prev) => ({
                                ...prev,
                                [currentPhoto.id]: true,
                              }));
                            }}
                            style={{
                              objectPosition: `${currentPhoto.positionX ?? 50}% ${currentPhoto.positionY ?? 50}%`,
                              objectFit: currentPhoto.fit ?? "cover",
                              transform: `scale(${currentPhoto.zoom ?? 1})`,
                              transformOrigin: `${currentPhoto.positionX ?? 50}% ${currentPhoto.positionY ?? 50}%`,
                            }}
                            className="w-full h-full grayscale-[8%] transition-all duration-75"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-[#EAE2D5] flex flex-col items-center justify-center p-4 text-center text-[#8D8580]">
                        <ImageIcon className="w-10 h-10 text-[#A94352]/40 mb-2" />
                        <span className="text-xs font-medium text-[#351B24]">
                          Belum Ada Foto Terpasang
                        </span>
                        <span className="text-[11px] text-[#8D8580] mt-1">
                          Klik tombol &quot;Pilih Foto dari HP/Laptop&quot; di samping untuk memasang
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/15 pointer-events-none" />
                  </div>

                  {/* Polaroid bottom caption strip */}
                  <div className="pt-2.5 pb-1 px-1">
                    <p className="font-serif text-xs text-[#351B24] line-clamp-2 leading-snug min-h-[2rem]">
                      {currentPhoto.caption || "(Belum ada caption)"}
                    </p>
                  </div>
                </div>

                {isCustomUploaded && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Foto Terpasang
                    </span>
                    <button
                      onClick={handleRemoveCustomPhoto}
                      className="text-[11px] text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Framing Controls & Photo Adjustment */}
              <div className="md:col-span-7 space-y-5 bg-white p-4 sm:p-5 rounded-sm border border-black/5">
                {/* Notice for distinct photos */}
                {(isSpecialChapter5 || isSpecialEnding) && (
                  <div className="p-3 bg-[#FAF6F0] rounded-xs border border-[#A94352]/20 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#A94352] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#351B24]">
                      <strong className="block mb-0.5">
                        {isSpecialChapter5 ? "Foto Khusus Chapter 05" : "Foto Khusus Ending"}
                      </strong>
                      Foto ini berdiri sendiri dan tidak akan tercampur dengan 16 foto di galeri
                      Infinite Photo Wall.
                    </p>
                  </div>
                )}

                {/* Upload Error Alert */}
                {uploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm animate-in fade-in">
                    <span className="font-semibold block mb-0.5">Terjadi Kendala:</span>
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* 1. Upload Button */}
                <div>
                  <label className="text-xs font-semibold text-[#351B24] block mb-1.5">
                    1. Unggah Foto ({isSpecialChapter5 ? "Khusus Chapter 5" : isSpecialEnding ? "Khusus Ending" : `Slot ${activeTab + 1}`}):
                  </label>
                  <label
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-sm border text-xs font-medium transition-colors shadow-2xs cursor-pointer ${
                      isProcessing
                        ? "bg-black/5 text-[#8D8580] border-black/10 cursor-wait"
                        : "border-[#D8B8B2] hover:border-[#A94352] bg-[#FAF6F0] hover:bg-[#F4EFE6] text-[#351B24]"
                    }`}
                  >
                    <Upload className="w-4 h-4 text-[#A94352]" />
                    <span>
                      {isProcessing
                        ? "Sedang Memproses Foto..."
                        : isCustomUploaded
                        ? "Ganti Foto Ini"
                        : "Pilih Foto dari HP/Laptop"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isProcessing}
                      className="hidden"
                      onClick={(e) => {
                        (e.currentTarget as HTMLInputElement).value = "";
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                    />
                  </label>
                  <p className="text-[11px] text-[#8D8580] mt-1">
                    Foto yang diunggah akan langsung dipatenkan ke file project secara otomatis.
                  </p>
                </div>

                {/* 2. Fit Mode Selection (Cover vs Contain) */}
                <div className="pt-2 border-t border-black/5">
                  <label className="text-xs font-semibold text-[#351B24] block mb-1.5 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#A94352]" />
                    <span>2. Mode Tampilan Rasio Foto:</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateCurrentPhoto({ fit: "cover" })}
                      className={`p-2.5 rounded-sm border text-left transition-all ${
                        (currentPhoto.fit ?? "cover") === "cover"
                          ? "bg-[#351B24] text-white border-[#351B24] shadow-xs"
                          : "bg-[#FAF6F0] text-[#252321] border-[#D8B8B2]/60 hover:bg-[#F4EFE6]"
                      }`}
                    >
                      <span className="text-xs font-semibold block">Isi Bingkai (Cover)</span>
                      <span className="text-[10px] opacity-80 block mt-0.5">
                        Foto memenuhi seluruh bingkai (bisa geser fokus wajah di bawah).
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateCurrentPhoto({ fit: "contain" })}
                      className={`p-2.5 rounded-sm border text-left transition-all ${
                        currentPhoto.fit === "contain"
                          ? "bg-[#351B24] text-white border-[#351B24] shadow-xs"
                          : "bg-[#FAF6F0] text-[#252321] border-[#D8B8B2]/60 hover:bg-[#F4EFE6]"
                      }`}
                    >
                      <span className="text-xs font-semibold block">Utuh (Contain)</span>
                      <span className="text-[10px] opacity-80 block mt-0.5">
                        Menampilkan seluruh isi foto tanpa terpotong sama sekali.
                      </span>
                    </button>
                  </div>
                </div>

                {/* 3. Framing Position Controls */}
                <div className="pt-2 border-t border-black/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#351B24]">
                      3. Posisi Fokus Foto (Vertikal & Horizontal):
                    </label>
                    <span className="text-[11px] font-mono text-[#8D8580]">
                      Y: {currentPhoto.positionY ?? 50}% | X: {currentPhoto.positionX ?? 50}%
                    </span>
                  </div>

                  {/* Vertical Slider */}
                  <div>
                    <div className="flex justify-between text-[11px] text-[#8D8580] mb-1">
                      <span>Atas (Fokus Wajah)</span>
                      <span>Tengah</span>
                      <span>Bawah</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={currentPhoto.positionY ?? 50}
                      onChange={(e) =>
                        handleUpdateCurrentPhoto({
                          positionY: Number(e.target.value),
                        })
                      }
                      className="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#A94352]"
                    />
                  </div>

                  {/* Horizontal Slider */}
                  <div>
                    <div className="flex justify-between text-[11px] text-[#8D8580] mb-1">
                      <span>Kiri</span>
                      <span>Tengah</span>
                      <span>Kanan</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={currentPhoto.positionX ?? 50}
                      onChange={(e) =>
                        handleUpdateCurrentPhoto({
                          positionX: Number(e.target.value),
                        })
                      }
                      className="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#A94352]"
                    />
                  </div>

                  {/* Zoom Slider */}
                  <div>
                    <div className="flex justify-between text-[11px] text-[#8D8580] mb-1">
                      <span>Ukuran Normal (100%)</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateCurrentPhoto({ zoom: 1 })}
                        className="hover:text-[#A94352] underline"
                      >
                        Reset Zoom
                      </button>
                      <span>160% (Dekat)</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={1.6}
                      step={0.05}
                      value={currentPhoto.zoom ?? 1}
                      onChange={(e) =>
                        handleUpdateCurrentPhoto({
                          zoom: Number(e.target.value),
                        })
                      }
                      className="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#A94352]"
                    />
                  </div>
                </div>

                {/* 4. Caption Input */}
                <div className="pt-2 border-t border-black/5">
                  <label className="text-xs font-semibold text-[#351B24] block mb-1">
                    4. Ubah Caption Kenangan:
                  </label>
                  <textarea
                    rows={2}
                    value={currentPhoto.caption}
                    onChange={(e) =>
                      handleUpdateCurrentPhoto({
                        caption: e.target.value,
                      })
                    }
                    placeholder="Tulis kalimat kenangan untuk foto ini..."
                    className="w-full text-xs font-serif p-2.5 rounded-sm border border-[#D8B8B2] focus:outline-none focus:ring-1 focus:ring-[#A94352] bg-[#FAF6F0]/50 text-[#252321]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F4EFE6] border-t border-[#351B24]/10 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#8D8580]">
            {isGallerySlot && `Slot ${activeTab + 1} dari 16 (Galeri Wall)`}
            {isSpecialChapter5 && "Slot 17 dari 18 (Foto Khusus Chapter 05)"}
            {isSpecialEnding && "Slot 18 dari 18 (Foto Khusus Ending)"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
              disabled={activeTab === 0}
              className="px-3 py-1.5 rounded-sm text-xs border border-black/10 bg-white hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={() => setActiveTab((prev) => Math.min(totalTabs - 1, prev + 1))}
              disabled={activeTab === totalTabs - 1}
              className="px-3 py-1.5 rounded-sm text-xs border border-black/10 bg-white hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Berikutnya →
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-sm text-xs font-medium bg-[#351B24] text-white hover:bg-[#A94352] transition-colors ml-2"
            >
              Lihat di Website
            </button>
          </div>
        </div>

        {/* Import JSON Dialog */}
        {showImportDialog && (
          <div
            onClick={() => setShowImportDialog(false)}
            className="absolute inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full bg-[#FAF6F0] rounded-sm shadow-2xl border border-[#D8B8B2] p-5 text-[#252321]"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-serif text-lg font-semibold text-[#351B24] flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-[#A94352]" />
                  <span>Impor Konfigurasi Foto (JSON)</span>
                </h4>
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="p-1 text-[#8D8580] hover:text-[#351B24]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#8D8580] mb-3">
                Tempelkan array JSON yang berisi data slot, caption, positionX, positionY, fit, atau zoom di bawah ini:
              </p>

              <textarea
                rows={9}
                value={importJsonText}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  setImportError(null);
                }}
                placeholder='[&#10;  {&#10;    "slot": 1,&#10;    "id": "photo-1",&#10;    "caption": "...",&#10;    "positionY": 55,&#10;    "positionX": 50,&#10;    "fit": "contain",&#10;    "zoom": 1.5&#10;  }&#10;]'
                className="w-full font-mono text-[11px] p-2.5 rounded-sm border border-[#D8B8B2] bg-white focus:outline-none focus:ring-1 focus:ring-[#A94352] text-[#252321]"
              />

              {importError && (
                <p className="text-[11px] text-red-600 mt-1.5 font-medium">{importError}</p>
              )}

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="px-3.5 py-1.5 rounded-sm text-xs border border-black/10 bg-white hover:bg-black/5 text-[#8D8580]"
                >
                  Batal
                </button>
                <button
                  onClick={handleApplyImport}
                  disabled={!importJsonText.trim()}
                  className="px-4 py-1.5 rounded-sm text-xs font-medium bg-[#351B24] text-white hover:bg-[#A94352] disabled:opacity-40 transition-colors"
                >
                  Terapkan Konfigurasi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
