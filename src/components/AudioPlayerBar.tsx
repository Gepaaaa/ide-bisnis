import React, { useState } from "react";
import { Volume2, VolumeX, Play, Pause, Music, Info } from "lucide-react";
import { useAudio } from "../hooks/useAudio";
import { appConfig } from "../data/config";

export const AudioPlayerBar: React.FC = () => {
  const {
    isPlaying,
    isMuted,
    currentTime,
    duration,
    hasError,
    togglePlay,
    toggleMute,
    seek,
  } = useAudio();

  const [showInfo, setShowInfo] = useState(false);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Floating Bottom Audio Player (Mobile Safe-Area aware) */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] sm:w-auto min-w-[280px] max-w-md select-none transition-all duration-300">
        <div className="relative overflow-hidden rounded-full bg-[#FAF6F0]/90 dark:bg-[#1C1417]/90 backdrop-blur-md border border-[#351B24]/15 shadow-lg px-4 py-2 flex items-center justify-between gap-3 text-[#252321]">
          {/* Subtle Progress Bar as top hairline */}
          {duration > 0 && (
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = clickX / rect.width;
                seek(ratio * duration);
              }}
              className="absolute top-0 left-0 right-0 h-1 bg-black/5 cursor-pointer"
            >
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-[#A94352] transition-all"
              />
            </div>
          )}

          {/* Left: Music icon & Track info */}
          <div className="flex items-center gap-2.5 min-w-0 pr-1">
            <div className="w-7 h-7 rounded-full bg-[#A94352]/10 flex items-center justify-center shrink-0">
              <Music className={`w-3.5 h-3.5 text-[#A94352] ${isPlaying ? "animate-pulse" : ""}`} />
            </div>

            <div className="min-w-0">
              <p className="font-serif italic text-xs sm:text-sm text-[#351B24] truncate leading-tight">
                {appConfig.audio.artist} — {appConfig.audio.title}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-[#8D8580]">
                {hasError ? (
                  <span className="text-[#A94352] font-medium">Acoustic Piano Synth</span>
                ) : (
                  <span>Soundtrack</span>
                )}
                {duration > 0 && (
                  <>
                    <span>·</span>
                    <span className="font-mono tabular-nums">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause music" : "Play music"}
              className="p-2 rounded-full text-[#351B24] hover:bg-[#351B24]/10 transition-colors focus:outline-none"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Mute / Unmute */}
            <button
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute music" : "Mute music"}
              className="p-2 rounded-full text-[#351B24] hover:bg-[#351B24]/10 transition-colors focus:outline-none"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#A94352]" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Info modal toggle */}
            <button
              onClick={() => setShowInfo(true)}
              aria-label="Soundtrack info"
              className="p-1.5 text-[#8D8580] hover:text-[#351B24] transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Asset Guide Modal */}
      {showInfo && (
        <div
          onClick={() => setShowInfo(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-[#F4EFE6] rounded-xs shadow-2xl p-6 border border-[#D8B8B2]/50 text-[#252321]"
          >
            <h3 className="font-serif text-2xl text-[#351B24] mb-2">
              Panduan Menambahkan Lagu & Foto
            </h3>
            <p className="text-xs text-[#8D8580] mb-4">
              Website ini sudah sepenuhnya siap dibaca dengan scrolling. Untuk mempersonalisasi file media Anda:
            </p>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-white/70 rounded-xs border border-black/5">
                <span className="font-semibold text-[#351B24] block mb-1">
                  🎵 Menambahkan Lagu JVKE — "her":
                </span>
                <p className="text-[#8D8580]">
                  Salin file MP3 Anda ke folder:
                  <code className="block mt-1 font-mono text-[11px] bg-black/5 p-1 rounded-2xs text-[#A94352]">
                    /public/assets/audio/her.mp3
                  </code>
                  Saat ini melodi piano ambient romantis sedang diputar otomatis sebagai fallback.
                </p>
              </div>

              <div className="p-3 bg-white/70 rounded-xs border border-black/5">
                <span className="font-semibold text-[#351B24] block mb-1">
                  📷 Menambahkan Foto Kenangan:
                </span>
                <p className="text-[#8D8580]">
                  Letakkan foto Anda di folder:
                  <code className="block mt-1 font-mono text-[11px] bg-black/5 p-1 rounded-2xs text-[#A94352]">
                    /public/assets/photos/foto1.jpg, foto2.jpg ...
                  </code>
                  Anda dapat mengedit caption & tanggal di <span className="font-mono text-[#351B24]">src/data/photos.ts</span>.
                </p>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowInfo(false)}
                className="px-5 py-2 rounded-full text-xs font-medium text-white bg-[#351B24] hover:bg-[#A94352] transition-colors"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
