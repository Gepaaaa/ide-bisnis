/**
 * Story chapters and narrative text for "A Letter for Her"
 * 
 * You can customize the Indonesian narrative and English accents here.
 * Pronouns used: "Aku" & "Kamu".
 */

export interface ChapterData {
  id: string;
  number: string;
  title: string;
  lead?: string;
  narrative: string[];
  accent?: string;
  theme: 'ivory' | 'warm' | 'rose' | 'burgundy' | 'dark';
}

export const openingConfessionLines = [
  "aku gatau harus mulai dari mana",
  "tapi semoga kamu suka",
];

export const storyChapters: ChapterData[] = [
  {
    id: "chapter-01",
    number: "Chapter 01",
    title: "Before I knew you...",
    narrative: [
      "Dulu, aku menjalani hari-hariku seperti biasa. Bertemu banyak orang, mengenal banyak perempuan, dan mungkin tidak pernah benar-benar berpikir bahwa suatu hari seseorang bisa membuatku memandang semuanya dengan cara yang berbeda.",
    ],
    accent: "Life was just life. Until you became part of it.",
    theme: "ivory",
  },
  {
    id: "chapter-02",
    number: "Chapter 02",
    title: "And then, there was you.",
    narrative: [
      "Lucunya, setelah mengenal kamu, aku seperti kehilangan semua cara yang dulu kupunya untuk mendekati seseorang.",
      "Bukan karena aku tidak tahu bagaimana caranya lagi, tapi karena untuk pertama kalinya, aku tidak sedang memikirkan bagaimana caranya mendapatkan perhatian perempuan lain.",
    ],
    accent: "My mind was already occupied by someone. And that someone was you.",
    theme: "warm",
  },
  {
    id: "chapter-03",
    number: "Chapter 03",
    title: "Not always easy, but always meaningful.",
    narrative: [
      "Aku tahu perjalanan kita tidak selalu berjalan mulus. Ada perbedaan pendapat, perselisihan, dan hal-hal yang mungkin dulu terasa sulit untuk kita pahami.",
      "Tapi tanpa semua itu, mungkin kita tidak akan menjadi diri kita yang sekarang. Bahkan sampai hari ini, kita masih bisa berbeda pendapat. Kita masih bisa berselisih. And I think that's part of being two different people learning to understand each other.",
    ],
    accent: "Learning, growing, and choosing each other every day.",
    theme: "rose",
  },
  {
    id: "chapter-04",
    number: "Chapter 04",
    title: "A thousand little moments.",
    lead: "Funny how the smallest moments become the memories I never want to lose.",
    narrative: [
      "Hal-hal sederhana yang mungkin waktu itu terlihat biasa saja, ternyata menjadi sesuatu yang selalu ingin aku ingat.",
    ],
    accent: "Every smile, every quiet gaze, every conversation that carried us late into the night.",
    theme: "ivory",
  },
  {
    id: "chapter-05",
    number: "Chapter 05",
    title: "Out of all the people...",
    narrative: [
      "Terkadang aku benar-benar bertanya-tanya, sebelum kamu hadir, apa saja yang sebenarnya aku lakukan? Bagaimana rasanya menjalani hari tanpa memikirkan seseorang yang sekarang begitu berarti?",
      "Out of all the people I could've met, somehow, I got to meet you.",
      "Dan dari sekian banyak kemungkinan yang bisa terjadi, aku bersyukur salah satunya adalah mengenal kamu.",
    ],
    accent: "Sometimes I wonder, what was I even doing before I met you?",
    theme: "burgundy",
  },
  {
    id: "chapter-06",
    number: "Chapter 06",
    title: "A letter for you.",
    narrative: [
      "Kalau ada satu hal yang ingin aku sampaikan, itu adalah terima kasih.",
      "Terima kasih karena sudah hadir di hidupku. Terima kasih untuk setiap hal kecil, setiap cerita, setiap tawa, bahkan untuk setiap perbedaan yang pernah membuat kita belajar.",
      "Aku mungkin tidak selalu bisa menyampaikan apa yang aku rasakan dengan sempurna. Sometimes I don't even know how to put my feelings into words.",
      "Tapi aku ingin kamu tahu bahwa aku bersyukur pernah dipertemukan dengan kamu.",
      "Dan sampai hari ini, aku masih ingin terus mengenal kamu, memahami kamu, dan tumbuh bersama kamu.",
    ],
    accent: "With all my heart.",
    theme: "ivory",
  },
];

export const finalEndingLines = {
  quote1: "Sometimes I wonder what life was like before you.",
  quote2: "But I don't really need to remember.",
  quote3: "I'm just grateful that I get to know you now.",
  closing: "Thank you for being you.",
  signOff: "With love,",
};
