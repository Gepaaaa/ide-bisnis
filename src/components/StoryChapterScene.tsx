import React from "react";
import type { ChapterData } from "../data/story";
import type { PhotoItem } from "../data/photos";
import { PhotoCard } from "./PhotoCard";
import { useInView } from "../hooks/useInView";

interface StoryChapterSceneProps {
  chapter: ChapterData;
  photos: PhotoItem[];
  specialPhoto?: PhotoItem;
}

export const StoryChapterScene: React.FC<StoryChapterSceneProps> = ({
  chapter,
  photos,
  specialPhoto,
}) => {
  const { ref, isInView } = useInView({ threshold: 0.18 });

  // Select context-appropriate photos for each chapter
  // Chapter 05 uses its own dedicated photo, distinct from the 16 gallery photos
  const featuredPhoto =
    chapter.id === "chapter-02"
      ? photos[1] || photos[0]
      : chapter.id === "chapter-03"
      ? photos[2] || photos[0]
      : chapter.id === "chapter-05"
      ? specialPhoto || null
      : null;

  const secondaryPhoto =
    chapter.id === "chapter-03" ? photos[6] || photos[1] : null;

  // Chapter-specific backgrounds
  const themeClasses = {
    ivory: "bg-[#F4EFE6] text-[#252321]",
    warm: "bg-[#EFE8DD] text-[#252321]",
    rose: "bg-[#F3E7E8] text-[#351B24]",
    burgundy: "bg-[#351B24] text-[#F4EFE6]",
    dark: "bg-[#181214] text-[#F4EFE6]",
  };

  const isBurgundy = chapter.theme === "burgundy";

  return (
    <section
      id={chapter.id}
      ref={ref}
      className={`relative min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-center px-6 sm:px-12 py-20 sm:py-28 transition-colors duration-1000 ${
        themeClasses[chapter.theme]
      }`}
    >
      {/* Background paper texture for light chapters */}
      {!isBurgundy && (
        <div className="absolute inset-0 paper-texture opacity-70 pointer-events-none" />
      )}

      {/* Subtle cinematic glow for deep burgundy chapter */}
      {isBurgundy && (
        <div className="absolute inset-0 bg-radial from-[#A94352]/20 via-transparent to-black/40 pointer-events-none" />
      )}

      <div
        className={`relative z-10 max-w-4xl mx-auto w-full transition-all duration-1000 ease-out transform ${
          isInView
            ? "opacity-100 translate-y-0 blur-0"
            : "opacity-0 translate-y-8 blur-2xs"
        }`}
      >
        {/* Chapter number kicker */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <span
            className={`font-handwriting text-2xl sm:text-3xl ${
              isBurgundy ? "text-[#D8B8B2]" : "text-[#A94352]"
            }`}
          >
            {chapter.number}
          </span>
          <span
            className={`h-px w-12 ${
              isBurgundy ? "bg-white/20" : "bg-black/15"
            }`}
          />
        </div>

        {/* Title */}
        <h2
          className={`font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight mb-8 sm:mb-12 leading-tight ${
            isBurgundy ? "text-[#F4EFE6]" : "text-[#351B24]"
          }`}
        >
          {chapter.title}
        </h2>

        {/* Main Content Layout (Grid if photo exists, clean single column if Chapter 1) */}
        <div
          className={`grid gap-8 sm:gap-14 items-center ${
            featuredPhoto ? "lg:grid-cols-12" : "max-w-2xl"
          }`}
        >
          {/* Narrative text block */}
          <div
            className={`space-y-6 ${
              featuredPhoto ? "lg:col-span-7" : "w-full"
            }`}
          >
            {chapter.lead && (
              <p
                className={`font-serif italic text-xl sm:text-2xl leading-relaxed ${
                  isBurgundy ? "text-[#D8B8B2]" : "text-[#A94352]"
                }`}
              >
                "{chapter.lead}"
              </p>
            )}

            {chapter.narrative.map((para, i) => (
              <p
                key={i}
                className={`text-base sm:text-lg lg:text-xl font-light leading-relaxed ${
                  isBurgundy ? "text-[#F4EFE6]/90" : "text-[#252321]/90"
                }`}
              >
                {para}
              </p>
            ))}

            {chapter.accent && (
              <div
                className={`pt-6 border-t ${
                  isBurgundy ? "border-white/15" : "border-black/10"
                }`}
              >
                <p
                  className={`font-serif italic text-lg sm:text-xl ${
                    isBurgundy ? "text-[#D8B8B2]" : "text-[#A94352]"
                  }`}
                >
                  "{chapter.accent}"
                </p>
              </div>
            )}
          </div>

          {/* Photo Column if present */}
          {featuredPhoto && (
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-6 pt-4 lg:pt-0">
              <div className="transform hover:scale-102 transition-transform duration-500">
                <PhotoCard photo={featuredPhoto} />
              </div>

              {secondaryPhoto && (
                <div className="transform -rotate-2 hover:rotate-0 transition-transform duration-500 hidden sm:block">
                  <PhotoCard photo={secondaryPhoto} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
