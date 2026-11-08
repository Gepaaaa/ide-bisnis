import { useState, useEffect } from "react";
import { appConfig } from "./data/config";
import { storyChapters } from "./data/story";
import {
  initialPhotos,
  chapter5PhotoDefault,
  endingPhotoDefault,
  type PhotoItem,
} from "./data/photos";
import { audioManager } from "./utils/audioManager";

import { OpeningScreen } from "./components/OpeningScreen";
import { StoryChapterScene } from "./components/StoryChapterScene";
import { InfinitePhotoWall } from "./components/InfinitePhotoWall";
import { LetterSection } from "./components/LetterSection";
import { FinalScene } from "./components/FinalScene";

const STORAGE_KEY = "letter_photos_custom_data";
const STORAGE_KEY_CHAPTER5 = "letter_chapter5_custom_photo";
const STORAGE_KEY_ENDING = "letter_ending_custom_photo";

export default function App() {
  const [hasCompletedCountdown, setHasCompletedCountdown] = useState(false);

  // Load photos (all 16 photos are permanently stored in /public/assets/photos/ and configured in initialPhotos)
  const [photos] = useState<PhotoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return initialPhotos.map((initial) => {
            const savedItem = parsed.find((p: any) => p && p.id === initial.id);
            if (!savedItem) return initial;
            return {
              ...initial,
              ...(savedItem.caption ? { caption: savedItem.caption } : {}),
              ...(savedItem.positionX !== undefined ? { positionX: savedItem.positionX } : {}),
              ...(savedItem.positionY !== undefined ? { positionY: savedItem.positionY } : {}),
              ...(savedItem.fit ? { fit: savedItem.fit } : {}),
              ...(savedItem.zoom ? { zoom: savedItem.zoom } : {}),
            };
          });
        }
      }
    } catch {}
    return initialPhotos;
  });

  // Dedicated photo for Chapter 05 (permanently stored at /public/assets/photos/chapter5.jpg)
  const [chapter5Photo] = useState<PhotoItem>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAPTER5);
      if (saved) return JSON.parse(saved);
    } catch {}
    return chapter5PhotoDefault;
  });

  // Dedicated photo for Final Ending scene (permanently stored at /public/assets/photos/ending.jpg)
  const [endingPhoto] = useState<PhotoItem>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENDING);
      if (saved) return JSON.parse(saved);
    } catch {}
    return endingPhotoDefault;
  });

  // Initialize audio manager on app mount
  useEffect(() => {
    audioManager.init(appConfig.audio.src);
  }, []);

  // Called when initial countdown completes
  const handleCountdownComplete = async () => {
    setHasCompletedCountdown(true);
    try {
      await audioManager.play();
    } catch (e) {
      console.warn("Audio playback notice:", e);
    }
  };

  // Replay function: resets audio, sets countdown state back to false, scrolls to top
  const handleReplay = () => {
    audioManager.reset();
    setHasCompletedCountdown(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#252321] relative selection:bg-[#A94352] selection:text-white">
      {/* Subtle Analog Film Grain Overlay */}
      <div className="film-grain" />

      {/* Initial Opening Slides & Countdown Transition */}
      {!hasCompletedCountdown && (
        <OpeningScreen onComplete={handleCountdownComplete} />
      )}

      {/* Main Long Vertical Scrolling Experience */}
      {hasCompletedCountdown && (
        <main className="w-full">
          {/* Chapter 01 — Before You */}
          <StoryChapterScene
            chapter={storyChapters[0]}
            photos={photos}
          />

          {/* Chapter 02 — Then There Was You */}
          <StoryChapterScene
            chapter={storyChapters[1]}
            photos={photos}
          />

          {/* Chapter 03 — We Grew */}
          <StoryChapterScene
            chapter={storyChapters[2]}
            photos={photos}
          />

          {/* Chapter 04 — A Thousand Little Moments & Infinite Photo Wall (16 Galeri Foto) */}
          <InfinitePhotoWall photos={photos} />

          {/* Chapter 05 — Out of all the people (Foto Khusus Chapter 05, Berbeda dari Galeri Wall) */}
          <StoryChapterScene
            chapter={storyChapters[4]}
            photos={photos}
            specialPhoto={chapter5Photo}
          />

          {/* Chapter 06 — A Letter for You */}
          <LetterSection />

          {/* Chapter 07 / Final — The Last Page (Foto Khusus Ending, Berbeda dari Galeri Wall) */}
          <FinalScene
            photo={endingPhoto}
            onReplay={handleReplay}
          />
        </main>
      )}
    </div>
  );
}
