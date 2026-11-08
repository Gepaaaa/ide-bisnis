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
  ZoomIn,
  Trash2,
  Eye,
  Minimize2,
  Maximize2,
} from "lucide-react";
import type { PhotoItem } from "../data/photos";

interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoItem[];
  onUpdatePhoto: (id: string, updates: Partial<PhotoItem>) => void;
  onResetPhotos: () => void;
}

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  isOpen,
  onClose,
  photos,
  onUpdatePhoto,
  onResetPhotos,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const currentPhoto = photos[activeTab] || photos[0];
  const isCustomUploaded =
    Boolean(currentPhoto?.src?.startsWith("data:image/") || currentPhoto?.src?.startsWith("blob:"));

  // Compress & resize image to max 850px for crisp retina display while staying lightweight
  const handleImageUpload = (id: string, file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
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
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);

            // Default focus to 35% (face height for portraits) if not previously set
            onUpdatePhoto(id, {
              src: compressedDataUrl,
              positionY: currentPhoto.positionY ?? 35,
              positionX: currentPhoto.positionX ?? 50,
              fit: currentPhoto.fit ?? "cover",
              zoom: currentPhoto.zoom ?? 1,
            });

            setUploadSuccess(`Foto Slot ${activeTab + 1} berhasil dipasang!`);
            setTimeout(() => setUploadSuccess(null), 3000);
          }
        } catch (err) {
          console.error("Gagal memproses gambar:", err);
        } finally {
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        setIsProcessing(false);
        alert("Gagal membaca file gambar. Coba format JPG atau PNG.");
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveCustomPhoto = (id: string) => {
    // Revert to original placeholder photo
    onUpdatePhoto(id, {
      src: `/assets/photos/foto${activeTab + 1}.jpg`,
      positionY: 50,
      positionX: 50,
      fit: "cover",
      zoom: 1,
    });
  };

  const handleCopyData = () => {
    const exportData = photos.map((p, idx) => ({
      slot: idx + 1,
      id: p.id,
      caption: p.caption,
      positionY: p.positionY ?? 50,
      positionX: p.positionX ?? 50,
      fit: p.fit ?? "cover",
      zoom: p.zoom ?? 1,
      hasCustomImage: p.src.startsWith("data:image/") || p.src.startsWith("blob:"),
    }));

    const formatted = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Minimized widget floating at the bottom right so user can peek at the site
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#351B24] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/20 animate-in fade-in slide-in-from-bottom-3">
        <span className="text-xs font-medium flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#D8B8B2]" />
          <span>Panel Editor Diminimalkan (Slot {activeTab + 1})</span>
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
        <div className="p-4 sm:p-5 border-b border-[#351B24]/10 flex items-center justify-between bg-[#F4EFE6]">
          <div className="flex-1 pr-4">
            <h3 className="font-serif text-lg sm:text-2xl text-[#351B24] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#A94352] shrink-0" />
              <span>Penyesuaian Foto & Framing (Rasio Apapun)</span>
            </h3>
            <p className="text-xs text-[#8D8580] mt-0.5">
              Geser fokus wajah/posisi foto, pilih rasio utuh atau isi bingkai, dan ubah caption secara instan.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMinimized(true)}
              title="Intip Website (Minimalkan Panel)"
              className="p-1.5 rounded-full hover:bg-black/5 text-[#351B24] transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="p-1.5 rounded-full hover:bg-black/5 text-[#351B24] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar (Copy Export, Peek, Reset) */}
        <div className="px-4 py-2 bg-white border-b border-[#351B24]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
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
                  <span>Salin Data Hasil Edit</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-[#8D8580] hidden md:inline">
              (Bisa kamu kirim ke chat jika sudah selesai semua)
            </span>
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

        {/* Success toast notification */}
        {uploadSuccess && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 text-center animate-in fade-in flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Slot navigation buttons */}
        <div className="flex gap-1.5 p-2.5 overflow-x-auto no-scrollbar bg-[#F4EFE6]/60 border-b border-black/5 shrink-0">
          {photos.map((p, idx) => {
            const hasCustom = p.src.startsWith("data:image/") || p.src.startsWith("blob:");
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors flex items-center gap-1 ${
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
        </div>

        {/* Active Slot Editor Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {currentPhoto && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Instant Live Polaroid Card Preview */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#351B24]">
                    Pratinjau Langsung (Slot {activeTab + 1}):
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
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
                          Klik tombol unggah foto di samping untuk memasang
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
                      onClick={() => handleRemoveCustomPhoto(currentPhoto.id)}
                      className="text-[11px] text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Framing Controls & Photo Adjustment */}
              <div className="md:col-span-7 space-y-5 bg-white p-4 sm:p-5 rounded-sm border border-black/5">
                {/* 1. Upload Button */}
                <div>
                  <label className="text-xs font-semibold text-[#351B24] block mb-1.5">
                    1. Unggah Foto (Format Apapun: 9:16, 3:4, 16:9, dll):
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
                        ? "Ganti Foto Slot Ini"
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
                          handleImageUpload(currentPhoto.id, file);
                        }
                      }}
                    />
                  </label>
                  <p className="text-[11px] text-[#8D8580] mt-1">
                    Bisa foto potret vertikal HP, foto selfie berdua, atau foto pemandangan lebar.
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
                      onClick={() => onUpdatePhoto(currentPhoto.id, { fit: "cover" })}
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
                      onClick={() => onUpdatePhoto(currentPhoto.id, { fit: "contain" })}
                      className={`p-2.5 rounded-sm border text-left transition-all ${
                        currentPhoto.fit === "contain"
                          ? "bg-[#351B24] text-white border-[#351B24] shadow-xs"
                          : "bg-[#FAF6F0] text-[#252321] border-[#D8B8B2]/60 hover:bg-[#F4EFE6]"
                      }`}
                    >
                      <span className="text-xs font-semibold block">Foto Utuh (Contain)</span>
                      <span className="text-[10px] opacity-80 block mt-0.5">
                        100% foto tampak utuh tanpa terpotong sama sekali.
                      </span>
                    </button>
                  </div>
                </div>

                {/* 3. Framing Adjustments (Pan Y, Pan X, Zoom) */}
                <div className="pt-2 border-t border-black/5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#351B24] block">
                      3. Penyesuaian Posisi / Fokus:
                    </label>
                    <span className="text-[11px] text-[#8D8580]">
                      Geser slider untuk melihat perubahan langsung
                    </span>
                  </div>

                  {/* Vertical Position (Pan Y) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#351B24] font-medium">
                        Posisi Atas / Bawah (Fokus Wajah):
                      </span>
                      <span className="text-[11px] text-[#A94352] font-semibold">
                        {currentPhoto.positionY ?? 50}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={currentPhoto.positionY ?? 50}
                      onChange={(e) =>
                        onUpdatePhoto(currentPhoto.id, {
                          positionY: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#A94352] cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-[#8D8580]">
                      <button
                        type="button"
                        onClick={() => onUpdatePhoto(currentPhoto.id, { positionY: 15 })}
                        className="hover:text-[#A94352] underline"
                      >
                        [Atas / Wajah (15%)]
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdatePhoto(currentPhoto.id, { positionY: 50 })}
                        className="hover:text-[#A94352] underline"
                      >
                        [Tengah (50%)]
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdatePhoto(currentPhoto.id, { positionY: 85 })}
                        className="hover:text-[#A94352] underline"
                      >
                        [Bawah / Kaki (85%)]
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Position (Pan X) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#351B24] font-medium">
                        Posisi Kiri / Kanan:
                      </span>
                      <span className="text-[11px] text-[#A94352] font-semibold">
                        {currentPhoto.positionX ?? 50}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={currentPhoto.positionX ?? 50}
                      onChange={(e) =>
                        onUpdatePhoto(currentPhoto.id, {
                          positionX: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#A94352] cursor-pointer"
                    />
                  </div>

                  {/* Zoom / Scale */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#351B24] font-medium flex items-center gap-1">
                        <ZoomIn className="w-3.5 h-3.5 text-[#A94352]" />
                        <span>Skala / Perbesar Foto (Zoom):</span>
                      </span>
                      <span className="text-[11px] text-[#A94352] font-semibold">
                        {Math.round((currentPhoto.zoom ?? 1) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="1.6"
                      step="0.05"
                      value={currentPhoto.zoom ?? 1}
                      onChange={(e) =>
                        onUpdatePhoto(currentPhoto.id, {
                          zoom: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#A94352] cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-[#8D8580]">
                      <span>100% (Normal)</span>
                      <button
                        type="button"
                        onClick={() => onUpdatePhoto(currentPhoto.id, { zoom: 1 })}
                        className="hover:text-[#A94352] underline"
                      >
                        Reset Zoom
                      </button>
                      <span>160% (Dekat)</span>
                    </div>
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
                      onUpdatePhoto(currentPhoto.id, {
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
            Slot {activeTab + 1} dari {photos.length}
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
              onClick={() =>
                setActiveTab((prev) => Math.min(photos.length - 1, prev + 1))
              }
              disabled={activeTab === photos.length - 1}
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
      </div>
    </div>
  );
};
