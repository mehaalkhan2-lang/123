import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

const SCRIPTS = {
  en: [
    "🚨 EMERGENCY: Musanif has run out of Chai. Academic session suspended until further notice.",
    "📢 NOTICE: Thinking during lectures is now a fineable offense (Rs. 500 per thought).",
    "🎓 SUCCESS: 99% of our students successfully avoided their homework this week!",
    "🍕 CAUTION: Samosas in the canteen are now being classified as biological weapons.",
    "🎒 ALERT: Heavy school bags are now required for weightlifting training. No gym needed.",
    "🕯️ NEWS: Exams will be held in complete darkness to save electricity (and hope).",
    "📚 UPDATE: New textbook released: 'How to Fail Gracefully by SCA Karak'.",
  ],
  ur: [
    "🚨 ہنگامی اطلاع: مصنف کی چائے ختم ہو گئی۔ تعلیم کا رابطہ بحال ہونے تک چھٹی!",
    "📢 نوٹس: لیکچر کے دوران سوچنا منع ہے (فی سوچ 500 روپے جرمانہ)۔",
    "🎓 کامیابی: ہمارے 99٪ طلباء اس ہفتے ہوم ورک سے بچنے میں کامیاب رہے!",
    "🍕 خبردار: کینٹین کے سموسے اب ’حیاتیاتی ہتھیار‘ قرار دے دیے گئے ہیں۔",
    "📚 اپڈیٹ: نئی کتاب: ’SCA کرک کے ذریعے عزت کے ساتھ فیل ہونے کا طریقہ‘۔",
  ]
};

export default function FunnyNewsTicker() {
  const { language } = useLanguage();
  const messages = SCRIPTS[language as keyof typeof SCRIPTS];

  return (
    <div className="bg-primary-dark text-white py-2 overflow-hidden whitespace-nowrap border-b border-primary/20 sticky top-0 z-50">
      <div className="flex animate-marquee items-center space-x-12">
        {messages.map((msg, idx) => (
          <span key={idx} className="text-sm font-medium tracking-wide flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-accent mr-3 animate-pulse"></span>
            {msg}
          </span>
        ))}
        {/* Duplicate for seamless scrolling */}
        {messages.map((msg, idx) => (
          <span key={`dup-${idx}`} className="text-sm font-medium tracking-wide flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-accent mr-3 animate-pulse"></span>
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
