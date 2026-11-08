/**
 * Scene timeline and audio synchronization cues.
 * 
 * Timestamps in seconds can be calibrated to your exact audio file length.
 * The browser reads real `currentTime` and `duration` from the HTML5 audio element.
 * If audio is not playing or user wants manual control, full manual navigation is provided.
 */

export interface TimelineCue {
  id: string;
  sceneIndex: number;
  label: string;
  // Suggested timestamp in seconds (editable when audio is calibrated)
  startTime: number;
}

export const defaultTimelineCues: TimelineCue[] = [
  { id: "cue-ch1", sceneIndex: 2, label: "01. Before You", startTime: 0 },
  { id: "cue-ch2", sceneIndex: 3, label: "02. Then There Was You", startTime: 25 },
  { id: "cue-ch3", sceneIndex: 4, label: "03. We Grew", startTime: 55 },
  { id: "cue-ch4", sceneIndex: 5, label: "04. A Thousand Moments", startTime: 88 },
  { id: "cue-ch5", sceneIndex: 6, label: "05. How Lucky Am I", startTime: 125 },
  { id: "cue-ch6", sceneIndex: 7, label: "06. A Letter For You", startTime: 160 },
  { id: "cue-end", sceneIndex: 8, label: "Epilogue", startTime: 200 },
];

export const SCENE_NAMES = [
  "Opening",
  "Countdown",
  "Chapter 01 — Before You",
  "Chapter 02 — Then There Was You",
  "Chapter 03 — We Grew",
  "Chapter 04 — Photo Wall",
  "Chapter 05 — How Lucky Am I",
  "Chapter 06 — Letter",
  "Final — The Last Page",
] as const;
