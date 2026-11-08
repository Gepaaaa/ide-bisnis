/**
 * Photo Gallery Configuration
 * 
 * Each photo is loaded from /assets/photos/fotoX.jpg
 * If the image file has not been added yet, a graceful romantic visual placeholder
 * is automatically rendered so the infinite scrolling wall is immediately gorgeous!
 * 
 * To add your real photos:
 * Put your pictures in public/assets/photos/ named foto1.jpg, foto2.jpg, etc.
 * Or update the `src` attribute below.
 */

export interface PhotoItem {
  id: string;
  src: string;
  caption: string;
  date: string;
  location?: string;
  aspect: 'portrait' | 'landscape' | 'square';
  rotation: number; // degrees (-3 to 3) for authentic scrapbook feel
  tone: 'warm' | 'rose' | 'amber' | 'sepia' | 'dusk';
  focal?: boolean;
  positionX?: number; // 0% (left) to 100% (right), default 50%
  positionY?: number; // 0% (top/face) to 100% (bottom), default 50%
  fit?: 'cover' | 'contain'; // 'cover' fills frame, 'contain' shows entire uncropped photo
  zoom?: number;      // 1.0 to 1.8, default 1.0
}

export const initialPhotos: PhotoItem[] = [
  {
    id: "photo-1",
    src: "/assets/photos/foto1.jpg",
    caption: "Matahari sore dan tawamu yang selalu menenangkan.",
    date: "14 Oktober",
    location: "Sudut kafe favorit",
    aspect: "portrait",
    rotation: -1.8,
    tone: "warm",
  },
  {
    id: "photo-2",
    src: "/assets/photos/foto2.jpg",
    caption: "The first day I knew you were someone special.",
    date: "28 November",
    location: "Tepi jendela hujan",
    aspect: "landscape",
    rotation: 1.5,
    tone: "amber",
  },
  {
    id: "photo-3",
    src: "/assets/photos/foto3.jpg",
    caption: "Berbagi cerita sampai lupa waktu.",
    date: "12 Desember",
    location: "Malam di pinggir kota",
    aspect: "square",
    rotation: -0.8,
    tone: "rose",
  },
  {
    id: "photo-4",
    src: "/assets/photos/foto4.jpg",
    caption: "Your quiet smile that melts every worry.",
    date: "04 Januari",
    location: "Langkah tanpa tujuan",
    aspect: "portrait",
    rotation: 2.2,
    tone: "sepia",
  },
  {
    id: "photo-5",
    src: "/assets/photos/foto5.jpg",
    caption: "Gelas kopi kedua dan candaan kecil kita.",
    date: "19 Januari",
    location: "Kopi sore",
    aspect: "landscape",
    rotation: -2.1,
    tone: "dusk",
  },
  {
    id: "photo-6",
    src: "/assets/photos/foto6.jpg",
    caption: "Even in silence, being with you feels like home.",
    date: "02 Februari",
    location: "Senja di jalan pulang",
    aspect: "square",
    rotation: 1.1,
    tone: "warm",
    focal: true,
  },
  {
    id: "photo-7",
    src: "/assets/photos/foto7.jpg",
    caption: "Momen saat kita saling mengerti tanpa bicara.",
    date: "14 Februari",
    location: "Buku dan musik",
    aspect: "portrait",
    rotation: -1.4,
    tone: "rose",
  },
  {
    id: "photo-8",
    src: "/assets/photos/foto8.jpg",
    caption: "Lampu jalanan temaram dan langkah kaki kita berdua.",
    date: "27 Februari",
    location: "Trotoar malam",
    aspect: "landscape",
    rotation: 1.8,
    tone: "amber",
  },
  {
    id: "photo-9",
    src: "/assets/photos/foto9.jpg",
    caption: "You make ordinary days feel like poetry.",
    date: "10 Maret",
    location: "Angin sejuk",
    aspect: "square",
    rotation: -2.4,
    tone: "sepia",
  },
  {
    id: "photo-10",
    src: "/assets/photos/foto10.jpg",
    caption: "Wajah cemberut lucumu saat kamu pura-pura ngambek.",
    date: "22 Maret",
    location: "Siang santai",
    aspect: "portrait",
    rotation: 1.6,
    tone: "warm",
  },
  {
    id: "photo-11",
    src: "/assets/photos/foto11.jpg",
    caption: "Tangan yang saling menggenggam saat menyeberang jalan.",
    date: "05 April",
    location: "Di tengah keramaian",
    aspect: "landscape",
    rotation: -1.2,
    tone: "rose",
  },
  {
    id: "photo-12",
    src: "/assets/photos/foto12.jpg",
    caption: "Holding onto every little memory with you.",
    date: "18 April",
    location: "Pagi yang tenang",
    aspect: "square",
    rotation: 2.0,
    tone: "dusk",
  },
  {
    id: "photo-13",
    src: "/assets/photos/foto13.jpg",
    caption: "Momen sederhana yang tidak akan pernah kutukar dengan apapun.",
    date: "01 Mei",
    location: "Taman kecil",
    aspect: "portrait",
    rotation: -1.9,
    tone: "amber",
  },
  {
    id: "photo-14",
    src: "/assets/photos/foto14.jpg",
    caption: "Your eyes when you talk about things you love.",
    date: "15 Mei",
    location: "Bawah payung",
    aspect: "landscape",
    rotation: 1.3,
    tone: "warm",
  },
  {
    id: "photo-15",
    src: "/assets/photos/foto15.jpg",
    caption: "Satu dari ribuan alasan kenapa aku bersyukur.",
    date: "02 Juni",
    location: "Bintang malam",
    aspect: "square",
    rotation: -0.9,
    tone: "sepia",
  },
  {
    id: "photo-16",
    src: "/assets/photos/foto16.jpg",
    caption: "Every frame with you is my favorite memory.",
    date: "20 Juni",
    location: "Sudut kenangan",
    aspect: "portrait",
    rotation: 2.5,
    tone: "rose",
  },
];
