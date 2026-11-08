import React, { useMemo } from "react";
import type { PhotoItem } from "../data/photos";
import { PhotoCard } from "./PhotoCard";

interface InfinitePhotoWallProps {
  photos: PhotoItem[];
}

interface MarqueeRowProps {
  items: PhotoItem[];
  animationClass: string;
  rowId: string;
}

// Declared at top level and wrapped in React.memo so React NEVER unmounts or resets animations on parent renders!
const MarqueeRow: React.FC<MarqueeRowProps> = React.memo(({ items, animationClass, rowId }) => {
  // 8 items per track ensures it spans wider than any viewport width
  const trackSet = useMemo(() => [...items, ...items], [items]);

  return (
    <div className={`flex w-max ${animationClass} py-4 sm:py-5 select-none`}>
      {/* Track 1 */}
      <div className="flex gap-6 sm:gap-8 pr-6 sm:pr-8 shrink-0">
        {trackSet.map((photo, index) => (
          <PhotoCard
            key={`${rowId}-a-${photo.id}-${index}`}
            photo={photo}
          />
        ))}
      </div>

      {/* Track 2 (Mathematically identical duplicate) */}
      <div className="flex gap-6 sm:gap-8 pr-6 sm:pr-8 shrink-0" aria-hidden="true">
        {trackSet.map((photo, index) => (
          <PhotoCard
            key={`${rowId}-b-${photo.id}-${index}`}
            photo={photo}
          />
        ))}
      </div>
    </div>
  );
});

export const InfinitePhotoWall: React.FC<InfinitePhotoWallProps> = React.memo(({ photos }) => {
  // Split photos into 4 diverse rows stably
  const row1 = useMemo(() => photos.filter((_, idx) => idx % 4 === 0), [photos]);
  const row2 = useMemo(() => photos.filter((_, idx) => idx % 4 === 1), [photos]);
  const row3 = useMemo(() => photos.filter((_, idx) => idx % 4 === 2), [photos]);
  const row4 = useMemo(() => photos.filter((_, idx) => idx % 4 === 3), [photos]);

  return (
    <section id="chapter-04" className="relative w-full overflow-hidden py-16 sm:py-24 bg-[#F4EFE6]">
      {/* Chapter header intro */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-10 sm:mb-14">
        <span className="font-handwriting text-2xl sm:text-3xl text-[#A94352] block mb-1">
          Memories in Motion
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-[#351B24] tracking-tight mb-3">
          A Thousand Little Moments
        </h2>
        <p className="font-serif italic text-[#8D8580] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          "Funny how the smallest moments become the memories I never want to lose."
        </p>
      </div>

      {/* Edge Fades / Vignette Masks on Left & Right */}
      <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-32 bg-gradient-to-r from-[#F4EFE6] via-[#F4EFE6]/80 to-transparent pointer-events-none z-20" />
      <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-32 bg-gradient-to-l from-[#F4EFE6] via-[#F4EFE6]/80 to-transparent pointer-events-none z-20" />

      {/* 4 Continuous Seamless Animated Rows (Generous padding to prevent any cropping on row 1 and row 4) */}
      <div className="flex flex-col gap-8 sm:gap-10 py-8 sm:py-10 overflow-hidden">
        {/* ROW 1: Scrolls Left */}
        <MarqueeRow items={row1} animationClass="animate-marquee-left-slow" rowId="row1" />

        {/* ROW 2: Scrolls Right */}
        <MarqueeRow items={row2} animationClass="animate-marquee-right-fast" rowId="row2" />

        {/* ROW 3: Scrolls Left */}
        <MarqueeRow items={row3} animationClass="animate-marquee-left-fast" rowId="row3" />

        {/* ROW 4: Scrolls Right */}
        <MarqueeRow items={row4} animationClass="animate-marquee-right-slow" rowId="row4" />
      </div>
    </section>
  );
});
