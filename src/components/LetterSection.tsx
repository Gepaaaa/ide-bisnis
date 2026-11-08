import React from "react";
import { appConfig } from "../data/config";
import { Heart } from "lucide-react";
import { useInView } from "../hooks/useInView";

export const LetterSection: React.FC = () => {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  const paragraphs = [
    "Kalau ada satu hal yang ingin aku sampaikan, itu adalah terima kasih.",
    "Terima kasih karena sudah hadir di hidupku. Terima kasih untuk setiap hal kecil, setiap cerita, setiap tawa, bahkan untuk setiap perbedaan yang pernah membuat kita belajar.",
    "Aku mungkin tidak selalu bisa menyampaikan apa yang aku rasakan dengan sempurna. Sometimes I don't even know how to put my feelings into words.",
    "Tapi aku ingin kamu tahu bahwa aku bersyukur pernah dipertemukan dengan kamu.",
    "Dan sampai hari ini, aku masih ingin terus mengenal kamu, memahami kamu, dan tumbuh bersama kamu.",
  ];

  return (
    <section
      id="chapter-06"
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 py-24 sm:py-32 bg-[#F4EFE6]"
    >
      {/* Paper texture overlay */}
      <div className="absolute inset-0 paper-texture opacity-80 pointer-events-none" />

      {/* Love Letter Paper Canvas */}
      <div
        className={`relative z-10 max-w-2xl w-full bg-[#FAF6F0] border border-[#D8B8B2]/40 rounded-sm shadow-xl p-8 sm:p-14 text-[#252321] transition-all duration-1000 ease-out transform ${
          isInView
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-10 scale-98"
        }`}
      >
        {/* Wax Seal Accent at Top */}
        <div className="flex items-center justify-end pb-6 mb-8 border-b border-[#D8B8B2]/40">
          <div className="w-9 h-9 rounded-full bg-[#A94352] text-white flex items-center justify-center shadow-md rotate-3">
            <Heart className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Salutation */}
        <div className="mb-8">
          <h3 className="font-handwriting text-3xl sm:text-4xl text-[#351B24]">
            Untuk {appConfig.recipientName},
          </h3>
        </div>

        {/* All paragraphs readable directly via natural scrolling */}
        <div className="space-y-6 font-serif text-lg sm:text-xl text-[#252321] leading-relaxed">
          {paragraphs.map((text, idx) => (
            <p key={idx} className="leading-relaxed">
              {text}
            </p>
          ))}
        </div>

        {/* Signature & Closing */}
        <div className="mt-14 pt-8 border-t border-[#D8B8B2]/40 flex flex-col sm:flex-row sm:items-end justify-end text-right">
          <div>
            <span className="font-sans text-xs tracking-widest text-[#8D8580] uppercase block">
              With all my love,
            </span>
            <span className="font-handwriting text-3xl sm:text-4xl text-[#351B24] block mt-1">
              — {appConfig.senderName}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
