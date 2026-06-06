import React from 'react';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import musanifImg from '../assets/images/regenerated_image_1778053842480.png';

export default function Leadership() {
  const { language } = useLanguage();

  const content = {
    en: {
      tag: "Mockery Leadership",
      title: "Our Destructive Mission",
      quote: "It is our responsibility to make your child incompetent, our duty to loot your fees, and our promise to lead your son to fields like rickshaw driving, tailoring, or crime.",
      description: "We proudly say that no child succeeds here. Our curriculum is completely substandard and teachers only run after fees.",
      ig: "Follow the Scammer on Instagram"
    },
    ur: {
      tag: "ہمارا غیر حقیقی نظریہ",
      title: "تباہی کی جانب",
      quote: "آپ کے بچے کو نالائق بننا ہماری ذمہ داری ہے، آپ کی فیس لوٹنا ہمارا فرض ہے، آپ کے بیٹے کو رکشہ ڈرائیور، درزی، نائی، موچی، منشی، چور، ڈاکو جیسے فیلڈ میں لے جانا ہمارا وعدہ ہے۔",
      description: "ہم فخر سے کہتے ہیں کہ یہاں کوئی بچہ بھی کامیاب نہیں ہوتا۔ ہمارا نصاب مکمل طور پر غیر معیاری ہے اور اساتذہ صرف فیسوں کے پیچھے بھاگتے ہیں۔",
      ig: "انسٹاگرام پر فالو کریں"
    }
  };

  const t = language === 'ur' ? content.ur : content.en;

  return (
    <section className="py-24 bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          <div className="lg:w-1/2 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square bg-base-dark rounded-[4rem] overflow-hidden border border-border shadow-2xl z-10"
            >
              <img 
                src={musanifImg} 
                alt="Musanif Thor Larram" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544717305-2a3dd8371131?q=80&w=300&auto=format&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/30 to-transparent" />
            </motion.div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10" />
          </div>
          
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">{t.tag}</h2>
              <h3 className="text-4xl md:text-5xl font-serif text-primary-dark mb-10 leading-tight">
                 {t.title}
              </h3>
              
              <div className="relative pt-10 mb-12">
                <Quote className="absolute top-0 left-0 text-accent/30" size={64} />
                <p className={`text-xl md:text-3xl font-serif text-text-light italic leading-relaxed relative z-10 pl-4 border-l-4 border-accent/20 ${language === 'ur' ? 'dir-rtl text-right' : 'text-left'}`}>
                  "{t.quote}"
                </p>
              </div>
              
              <div className={`space-y-6 text-text-light leading-relaxed text-lg mb-10 ${language === 'ur' ? 'dir-rtl text-right' : 'text-left'}`}>
                <p>
                  {t.description}
                </p>
              </div>

              <a 
                href="https://www.instagram.com/musannif.shehzad?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-3 bg-white border border-border rounded-2xl text-primary font-bold shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white">
                  <span className="text-[10px]">IG</span>
                </div>
                {t.ig}
              </a>
              
              <div className="mt-14" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
