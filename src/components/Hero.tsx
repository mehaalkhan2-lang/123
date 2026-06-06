import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Binary, Atom, Beaker } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

export default function Hero() {
  const { language } = useLanguage();

  const content = {
    en: {
      admission: "Admissions Closed: Complete Destruction of Future",
      title1: "Science Coaching",
      title2: "Academy (SCA) Karak",
      description: "Our goal is to waste your time and hollow out the roots of the education system. Special 'No Education' session for SSC & FSc students.",
      explore: "Waste Your Time",
      merit: "View Our Failures",
      math: "Rote-Learning Maths",
      physics: "Physics Confusion",
      chemistry: "Chemistry Smoke",
      biology: "Biology Ruin"
    },
    ur: {
      admission: "داخلے بند ہیں: مستقبل کی مکمل تباہی",
      title1: "سائنس کوچنگ",
      title2: "اکیڈمی (SCA) کرک",
      description: "ہمارا مقصد آپ کے وقت کا ضیاع اور تعلیمی نظام کی جڑوں کو کھوکھلا کرنا ہے۔ میٹرک اور ایف ایس سی کے طلباء کے لیے خصوصی 'کوئی تعلیم نہیں' سیشن۔",
      explore: "وقت ضائع کریں",
      merit: "ہماری ناکامیاں دیکھیں",
      math: "میتھ کا رٹا",
      physics: "فزکس کی پریشانی",
      chemistry: "کیمسٹری کا دھواں",
      biology: "بیالوجی کی بربادی"
    }
  };

  const t = language === 'ur' ? content.ur : content.en;

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-gradient-to-br from-base to-base-dark">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-border/40 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-border text-text-muted rounded-full text-[10px] font-bold mb-8 uppercase tracking-widest"
          >
            <Sparkles size={14} />
            <span>{t.admission}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-primary-dark mb-8 leading-[1.1]"
          >
            {t.title1} <br /> 
            <span className="text-primary italic">{t.title2}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-text-light mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => document.getElementById('enrollment-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all hover:-translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
            >
              {t.explore}
              <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-primary border-2 border-primary hover:bg-white/50 transition-all font-serif italic cursor-pointer"
            >
              {t.merit}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 opacity-30 translate-y-4"
          >
            <div className="flex flex-col items-center gap-2">
              <Binary size={40} className="text-primary-dark" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">{t.math}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Atom size={40} className="text-primary-dark" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">{t.physics}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Beaker size={40} className="text-primary-dark" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">{t.chemistry}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Sparkles size={40} className="text-primary-dark" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">{t.biology}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
