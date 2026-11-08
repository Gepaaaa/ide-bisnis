import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import type { PhotoItem } from "../data/photos";

interface PhotoLightboxProps {
  photo: PhotoItem | null;
  photos: PhotoItem[];
  onClose: () => void;
  onSelectPhoto: (photo: PhotoItem) => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photo,
  photos,
  onClose,
  onSelectPhoto,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [photo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (!photo) return;
      const currentIndex = photos.findIndex((p) => p.id === photo.id);
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        onSelectPhoto(photos[currentIndex - 1]);
      } else if (e.key === "ArrowRight" && currentIndex < photos.length - 1) {
        onSelectPhoto(photos[currentIndex + 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photo, photos, onClose, onSelectPhoto]);

  if (!photo) return null;

  const currentIndex = photos.findIndex((p) => p.id === photo.id);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      onSelectPhoto(photos[currentIndex - 1]);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < photos.length - 1) {
      onSelectPhoto(photos[currentIndex + 1]);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 z-50 p-2.5 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D8B8B2]"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          aria-label="Previous memory"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors hidden sm:flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={handleNext}
          aria-label="Next memory"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors hidden sm:flex items-center justify-center"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Lightbox content card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full bg-[#F4EFE6] rounded-xs shadow-2xl p-4 sm:p-6 text-[#252321] overflow-hidden"
      >
        {/* Subtle vintage tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/80 backdrop-blur-xs border-t border-b border-black/10 rotate-1 pointer-events-none" />

        {/* Image wrapper */}
        <div className="relative w-full max-h-[60vh] sm:max-h-[68vh] overflow-hidden rounded-xs bg-[#E8D9C5] flex items-center justify-center">
          {!imageFailed ? (
            <img
              src={photo.src}
              alt={photo.caption}
              onError={() => setImageFailed(true)}
              className="max-h-[60vh] sm:max-h-[68vh] w-auto max-w-full object-contain mx-auto"
            />
          ) : (
            <div className="w-full py-20 px-8 text-center bg-gradient-to-br from-[#F5EAD9] via-[#EAD4BB] to-[#DEBAC2]">
              <span className="font-handwriting text-3xl sm:text-4xl text-[#A94352] block mb-2">
                A Precious Memory
              </span>
              <p className="font-serif italic text-xl sm:text-2xl text-[#351B24] max-w-lg mx-auto leading-relaxed">
                "{photo.caption}"
              </p>
              <p className="mt-4 text-xs font-mono text-[#8D8580] tracking-wider uppercase">
                File: {photo.src}
              </p>
            </div>
          )}
        </div>

        {/* Narrative & metadata footer */}
        <div className="mt-4 sm:mt-5 pt-3 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-serif italic text-lg sm:text-xl text-[#351B24]">
              "{photo.caption}"
            </p>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-[#8D8580]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#A94352]" />
                {photo.date}
              </span>
              {photo.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#A94352]" />
                  {photo.location}
                </span>
              )}
            </div>
          </div>

          <div className="text-right text-xs text-[#8D8580] shrink-0 font-mono">
            <span>{currentIndex + 1}</span> / <span>{photos.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
