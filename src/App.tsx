/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { appConfig } from "./data/config";
import { storyChapters } from "./data/story";
import { initialPhotos, type PhotoItem } from "./data/photos";
import { audioManager } from "./utils/audioManager";
import { Sparkles } from "lucide-react";

import { OpeningScreen } from "./components/OpeningScreen";
import { StoryChapterScene } from "./components/StoryChapterScene";
import { InfinitePhotoWall } from "./components/InfinitePhotoWall";
import { LetterSection } from "./components/LetterSection";
import { FinalScene } from "./components/FinalScene";
import { PhotoEditorModal } from "./components/PhotoEditorModal";

const STORAGE_KEY = "letter_photos_custom_data";

export default function App() {
  const [hasCompletedCountdown, setHasCompletedCountdown] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Initialize photos from localStorage if user previously customized them, else fallback to initialPhotos
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return initialPhotos;
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

  // Update a single photo slot (image, caption, position, fit, zoom, etc.)
  const handleUpdatePhoto = (id: string, updates: Partial<PhotoItem>) => {
    setPhotos((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...updates,
          };
        }
        return p;
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save to localStorage (quota reached?):", err);
      }

      return updated;
    });
  };

  // Reset photos back to original defaults
  const handleResetPhotos = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPhotos(initialPhotos);
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
        <>
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

            {/* Chapter 04 — A Thousand Little Moments & Infinite Photo Wall */}
            <InfinitePhotoWall photos={photos} />

            {/* Chapter 05 — How Lucky Am I */}
            <StoryChapterScene
              chapter={storyChapters[4]}
              photos={photos}
            />

            {/* Chapter 06 — A Letter for You */}
            <LetterSection />

            {/* Chapter 07 / Final — The Last Page */}
            <FinalScene
              photo={photos[5] || photos[0]}
              onReplay={handleReplay}
            />
          </main>

          {/* Floating Discreet Button for Customizing Photos & Captions */}
          <button
            onClick={() => setIsEditorOpen(true)}
            aria-label="Sesuaikan Foto & Caption"
            className="fixed bottom-4 right-4 z-40 px-3.5 py-1.5 rounded-full bg-[#351B24]/85 hover:bg-[#351B24] text-white text-xs font-sans tracking-wide backdrop-blur-xs shadow-lg transition-all flex items-center gap-1.5 opacity-70 hover:opacity-100 hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D8B8B2]" />
            <span>Sesuaikan Foto & Caption</span>
          </button>
        </>
      )}

      {/* Photo & Caption Customizer Modal */}
      <PhotoEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        photos={photos}
        onUpdatePhoto={handleUpdatePhoto}
        onResetPhotos={handleResetPhotos}
      />
    </div>
  );
}
