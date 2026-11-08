import React, { useState, useEffect } from "react";
import { appConfig } from "../data/config";
import { finalEndingLines } from "../data/story";
import type { PhotoItem } from "../data/photos";
import { RotateCcw } from "lucide-react";
import { useInView } from "../hooks/useInView";

interface FinalSceneProps {
  photo: PhotoItem;
  onReplay: () => void;
}

export const FinalScene: React.FC<FinalSceneProps> = ({ photo, onReplay }) => {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [photo.src]);

  const isCustomImage = photo.src.startsWith("data:image/") || photo.src.startsWith("blob:");
  const shouldRenderImage = isCustomImage || !imageError;

  return (
    <section
      id="chapter-final"
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 sm:py-32 bg-[#0E0B0C] text-[#F4EFE6] select-none overflow-hidden"
    >
      {/* Cinematic subtle light vignette */}
      <div className="absolute inset-0 bg-radial from-[#351B24]/30 via-[#140D10]/50 to-black pointer-events-none" />

      <div
        className={`relative z-10 max-w-xl w-full text-center flex flex-col items-center transition-all duration-1000 ease-out transform ${
          isInView
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        {/* Single Centerpiece Photo with vintage film frame */}
        <div className="relative p-3 bg-white/95 rounded-xs shadow-2xl max-w-xs sm:max-w-sm w-full mb-12 transform -rotate-1 hover:rotate-0 transition-transform duration-700">
          <div className="w-full h-64 sm:h-80 overflow-hidden bg-[#252321] relative rounded-2xs">
            {shouldRenderImage ? (
              <>
                {photo.fit === "contain" && (
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-md opacity-35 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${photo.src})` }}
                  />
                )}
                <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                  <img
                    key={photo.src.slice(0, 40)}
                    src={photo.src}
                    alt={photo.caption}
                    onError={() => {
                      if (!isCustomImage) setImageError(true);
                    }}
                    style={{
                      objectPosition: `${photo.positionX ?? 50}% ${photo.positionY ?? 50}%`,
                      objectFit: photo.fit ?? "cover",
                      transform: `scale(${photo.zoom ?? 1})`,
                      transformOrigin: `${photo.positionX ?? 50}% ${photo.positionY ?? 50}%`,
                    }}
                    className="w-full h-full grayscale-[8%] transition-all duration-150"
                  />
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#351B24] to-[#1c0f13] flex flex-col items-center justify-center p-6 text-center">
                <span className="font-handwriting text-3xl text-[#D8B8B2] mb-2">
                  Forever in My Heart
                </span>
                <p className="font-serif italic text-sm text-[#F4EFE6]/80">
                  "{photo.caption}"
                </p>
              </div>
            )}
            {/* Film grain vignette */}
            <div className="absolute inset-0 bg-radial from-transparent to-black/30 pointer-events-none" />
          </div>

          <div className="pt-2 text-center">
            <span className="font-handwriting text-lg text-[#351B24]">
              {appConfig.recipientName}
            </span>
          </div>
        </div>

        {/* Narrative Text Sequence */}
        <div className="space-y-5 max-w-lg">
          <p className="font-serif italic text-xl sm:text-2xl text-[#F4EFE6] leading-relaxed">
            "{finalEndingLines.quote1}"
          </p>

          <p className="font-serif italic text-lg sm:text-xl text-[#D8B8B2] leading-relaxed">
            "{finalEndingLines.quote2}"
          </p>

          <p className="font-serif text-xl sm:text-2xl text-[#F4EFE6] font-light leading-relaxed">
            {finalEndingLines.quote3}
          </p>

          <div className="pt-6">
            <p className="font-serif italic text-2xl sm:text-3xl text-[#A94352] mb-3">
              {finalEndingLines.closing}
            </p>
            <div className="mt-4">
              <span className="font-sans text-xs tracking-widest text-white/50 uppercase block">
                {finalEndingLines.signOff}
              </span>
              <span className="font-handwriting text-3xl sm:text-4xl text-[#F4EFE6] block mt-1">
                — {appConfig.senderName}
              </span>
            </div>
          </div>
        </div>

        {/* Replay Button */}
        <div className="mt-16 pb-8">
          <button
            onClick={onReplay}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all hover:scale-105"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D8B8B2]" />
            <span>Experience it again</span>
          </button>
        </div>
      </div>
    </section>
  );
};
