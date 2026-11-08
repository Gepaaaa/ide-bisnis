import React, { useState, useEffect, useRef } from "react";

interface OpeningScreenProps {
  onComplete: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({ onComplete }) => {
  // Slide 0: "aku gatau harus mulai dari mana"
  // Slide 1: "tapi semoga kamu suka"
  const [slideIndex, setSlideIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | string>(3);
  const [isLoaded, setIsLoaded] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const startCountdown = () => {
    setIsCountingDown(true);
    let count = 3;
    setCountdownValue(count);

    const interval = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownValue(count);
      } else if (count === 0) {
        setCountdownValue("For you.");
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 700);
      }
    }, 750);

    timerRef.current = interval;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTap = () => {
    if (isCountingDown || isTransitioning) return;

    if (slideIndex === 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSlideIndex(1);
        setIsTransitioning(false);
      }, 350);
    } else if (slideIndex === 1) {
      startCountdown();
    }
  };

  return (
    <div
      onClick={handleTap}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 sm:p-14 select-none cursor-pointer bg-[#F4EFE6] text-[#252321] transition-colors duration-700"
    >
      {/* Subtle paper texture overlay */}
      <div className="absolute inset-0 paper-texture opacity-70 pointer-events-none" />

      {/* Top Title */}
      <div className="w-full flex justify-center pt-2">
        <span
          className={`font-serif italic text-xs tracking-widest uppercase transition-opacity duration-700 ${
            isLoaded && !isCountingDown ? "opacity-40" : "opacity-0"
          }`}
        >
          For You
        </span>
      </div>

      {/* Main Centerpiece Sentences */}
      {!isCountingDown ? (
        <div
          className={`relative z-10 max-w-2xl w-full text-center my-auto transition-all duration-500 ease-out transform ${
            isLoaded && !isTransitioning
              ? "opacity-100 translate-y-0 blur-0 scale-100"
              : "opacity-0 translate-y-3 blur-xs scale-98"
          }`}
        >
          {slideIndex === 0 ? (
            <h1 className="font-serif italic text-4xl sm:text-6xl lg:text-7xl text-[#351B24] tracking-tight font-light leading-tight">
              "aku gatau harus mulai dari mana"
            </h1>
          ) : (
            <h1 className="font-serif italic text-4xl sm:text-6xl lg:text-7xl text-[#351B24] tracking-tight font-light leading-tight">
              "tapi semoga kamu suka"
            </h1>
          )}
        </div>
      ) : (
        /* Cinematic Warm Countdown & "For you." */
        <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
          <div
            key={String(countdownValue)}
            className="animate-in zoom-in-90 fade-in duration-500 ease-out flex flex-col items-center"
          >
            {typeof countdownValue === "number" ? (
              <span className="font-serif text-8xl sm:text-9xl font-light text-[#351B24] tracking-tighter drop-shadow-xs">
                {countdownValue}
              </span>
            ) : (
              <div className="space-y-3">
                <span className="font-serif italic text-5xl sm:text-7xl text-[#A94352] tracking-wide block">
                  For you.
                </span>
                <span className="font-sans text-xs tracking-widest text-[#8D8580] uppercase block">
                  Beginning our story...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Instruction: "ketuk untuk lanjut" */}
      <div
        className={`relative z-10 flex items-center justify-center gap-2 transition-all duration-700 ${
          isLoaded && !isCountingDown ? "opacity-60" : "opacity-0 pointer-events-none"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#A94352] animate-ping" />
        <span className="font-sans text-xs tracking-widest text-[#8D8580] uppercase">
          ketuk untuk lanjut
        </span>
      </div>
    </div>
  );
};
