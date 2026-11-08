import { useEffect, useState } from "react";
import { audioManager } from "../utils/audioManager";

export function useAudio() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = audioManager.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    isPlaying: audioManager.isPlaying,
    isMuted: audioManager.isMuted,
    currentTime: audioManager.currentTime,
    duration: audioManager.duration,
    hasError: audioManager.hasError,
    isLoaded: audioManager.isLoaded,
    volume: audioManager.volume,
    play: () => audioManager.play(),
    pause: () => audioManager.pause(),
    togglePlay: () => audioManager.togglePlay(),
    toggleMute: () => audioManager.toggleMute(),
    seek: (time: number) => audioManager.seek(time),
    setVolume: (vol: number) => audioManager.setVolume(vol),
    reset: () => audioManager.reset(),
  };
}
