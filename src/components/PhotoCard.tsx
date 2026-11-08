import React, { useState, useEffect } from "react";
import { Camera, MapPin } from "lucide-react";
import type { PhotoItem } from "../data/photos";

interface PhotoCardProps {
  photo: PhotoItem;
  isFocal?: boolean;
}

export const PhotoCard: React.FC<PhotoCardProps> = React.memo(({ photo, isFocal }) => {
  const [imageError, setImageError] = useState(false);

  // Reset error state immediately whenever photo.src updates (e.g. user uploaded new photo)
  useEffect(() => {
    setImageError(false);
  }, [photo.src]);

  // If user uploaded a base64 or blob photo, guarantee it shows!
  const isCustomImage = photo.src.startsWith("data:image/") || photo.src.startsWith("blob:");
  const shouldRenderImage = isCustomImage || !imageError;

  // Tone gradients for analog placeholder look
  const toneGradients = {
    warm: "from-[#F0E6D6] via-[#E8D9C5] to-[#DFCCB5]",
    rose: "from-[#F2DFE2] via-[#E8CCD1] to-[#DEBAC2]",
    amber: "from-[#F5EAD9] via-[#EAD4BB] to-[#DEC09E]",
    sepia: "from-[#ECE1D4] via-[#DECDBB] to-[#D0BBA3]",
    dusk: "from-[#E6DFE0] via-[#D8CECF] to-[#C9BCBD]",
  };

  return (
    <div
      style={{
        transform: `rotate(${photo.rotation}deg)`,
      }}
      className={`group relative w-60 sm:w-68 shrink-0 p-3 sm:p-3.5 bg-white shadow-md hover:shadow-lg rounded-sm select-none transition-shadow duration-300 ${
        isFocal ? "ring-2 ring-[#A94352] ring-offset-4 ring-offset-[#F4EFE6]" : ""
      }`}
    >
      {/* Tape mark placed cleanly inside the card header */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-white/75 backdrop-blur-xs border-t border-b border-black/10 shadow-2xs rotate-[-1deg] pointer-events-none z-10" />

      {/* Solid Uniform Photo Frame Container */}
      <div className="relative w-full h-48 sm:h-54 overflow-hidden bg-[#EAE2D5] rounded-xs mt-1">
        {shouldRenderImage ? (
          <>
            {/* If contain mode, render an ambient backdrop so non-1:1 photos look like fine art prints */}
            {photo.fit === "contain" && (
              <div
                className="absolute inset-0 bg-cover bg-center blur-md opacity-35 scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${photo.src})` }}
              />
            )}
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
              <img
                key={photo.src.slice(0, 40)} // Force fresh element when source changes
                src={photo.src}
                alt={photo.caption}
                onError={() => {
                  if (!isCustomImage) {
                    setImageError(true);
                  }
                }}
                style={{
                  objectPosition: `${photo.positionX ?? 50}% ${photo.positionY ?? 50}%`,
                  objectFit: photo.fit ?? "cover",
                  transform: `scale(${photo.zoom ?? 1})`,
                  transformOrigin: `${photo.positionX ?? 50}% ${photo.positionY ?? 50}%`,
                }}
                className="w-full h-full grayscale-[8%] transition-all duration-150"
                referrerPolicy="no-referrer"
              />
            </div>
          </>
        ) : (
          /* Elegant Editorial Placeholder without date */
          <div
            className={`w-full h-full bg-gradient-to-br ${
              toneGradients[photo.tone]
            } p-4 flex flex-col justify-between text-[#252321] relative overflow-hidden`}
          >
            {/* Soft film flare effect */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/40 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-end text-[11px] text-[#8D8580]">
              <Camera className="w-3.5 h-3.5 opacity-60" />
            </div>

            <div className="my-auto py-2">
              <p className="font-serif italic text-sm sm:text-base text-[#351B24] line-clamp-2 leading-snug">
                "{photo.caption}"
              </p>
            </div>

            {photo.location && (
              <div className="flex items-center gap-1 text-[10px] text-[#8D8580]">
                <MapPin className="w-3 h-3 text-[#A94352] shrink-0" />
                <span className="truncate">{photo.location}</span>
              </div>
            )}
          </div>
        )}

        {/* Vintage Vignette Overlay */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/15 pointer-events-none" />
      </div>

      {/* Polaroid bottom caption strip: clean, straight, no dates */}
      <div className="pt-2.5 pb-1 px-1">
        <p className="font-serif text-xs sm:text-[13px] text-[#351B24] line-clamp-2 leading-snug min-h-[2rem]">
          {photo.caption}
        </p>
      </div>
    </div>
  );
});
