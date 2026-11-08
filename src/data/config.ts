/**
 * Central Configuration for "A Letter for Her"
 * 
 * You can customize the sender name, recipient name, audio file path,
 * and key settings directly here without modifying core components.
 */

export interface AppConfig {
  recipientName: string;
  senderName: string;
  websiteTitle: string;
  subtitle: string;
  audio: {
    src: string;
    title: string;
    artist: string;
    enableFallbackSynth: boolean;
  };
  colors: {
    warmIvory: string;
    deepBurgundy: string;
    dustyRose: string;
    softBlush: string;
    warmCharcoal: string;
    mutedGray: string;
  };
}

export const appConfig: AppConfig = {
  // Ganti nama penerima dan pengirim di sini
  recipientName: "Kamu",
  senderName: "Aku",
  websiteTitle: "A Letter for Her",
  subtitle: "Before You, After You.",
  
  audio: {
    src: "/assets/audio/her.mp3",
    title: "her",
    artist: "JVKE",
    // Menyalakan melodi piano romantis otomatis jika file her.mp3 belum dimasukkan
    enableFallbackSynth: true,
  },

  colors: {
    warmIvory: "#F4EFE6",
    deepBurgundy: "#351B24",
    dustyRose: "#A94352",
    softBlush: "#D8B8B2",
    warmCharcoal: "#252321",
    mutedGray: "#8D8580",
  },
};
