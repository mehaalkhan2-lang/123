import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, ShieldAlert, Coffee, Brain, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface Message {
  id: number;
  title: { en: string; ur: string };
  body: { en: string; ur: string };
  type: 'alert' | 'info' | 'funny';
  time: string;
}

const MESSAGES: Message[] = [
  {
    id: 1,
    title: { en: "Fee Hike Alert", ur: "فیس میں اضافے کی اطلاع" },
    body: { en: "Your fees have been increased because Musanif likes expensive tea. Pay up or get out.", ur: "مصنف کو مہنگی چائے پسند ہے، اس لیے آپ کی فیس بڑھا دی گئی ہے۔ پیسے دیں یا گھر جائیں۔" },
    type: 'alert',
    time: '2 mins ago'
  },
  {
    id: 2,
    title: { en: "Oxygen Tax", ur: "آکسیجن ٹیکس" },
    body: { en: "New 'Breathing while studying' tax implemented. 500 PKR per deep breath.", ur: "تعلیم کے دوران سانس لینے پر نیا ٹیکس نافذ کر دیا گیا ہے۔ ہر گہرے سانس پر 500 روپے۔" },
    type: 'funny',
    time: '1 hour ago'
  },
  {
    id: 3,
    title: { en: "Brain Repair", ur: "دماغ کی مرمت" },
    body: { en: "Weekly confusion maintenance will occur tonight. Expect 100% misunderstanding.", ur: "آج رات دماغی الجھن کی ہفتہ وار مینٹیننس ہوگی۔ مکمل غلط فہمی کی توقع رکھیں۔" },
    type: 'info',
    time: '5 hours ago'
  }
];

export default function MessageCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[101] flex flex-col ${language === 'ur' ? 'text-right' : 'text-left'}`}
          >
            <div className="p-8 border-b border-border flex justify-between items-center bg-primary text-white">
              <div className="flex items-center gap-3">
                <Bell size={24} />
                <h2 className="text-xl font-black uppercase tracking-widest">
                  {language === 'ur' ? 'پیغامات' : 'MESSAGES'}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {MESSAGES.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-base rounded-3xl border border-border relative group hover:border-primary/30 transition-all hover:bg-white shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-xl ${
                      msg.type === 'alert' ? 'bg-accent/10 text-accent' : 
                      msg.type === 'funny' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                    }`}>
                      {msg.type === 'alert' ? <ShieldAlert size={20} /> : 
                       msg.type === 'funny' ? <Coffee size={20} /> : <Info size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-primary-dark">{msg.title[language]}</h4>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{msg.time}</span>
                      </div>
                      <p className="text-sm text-text-light leading-relaxed">
                        {msg.body[language]}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-8 border-t border-border bg-base/50">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest text-center">
                {language === 'ur' ? '* مزید بربادی جلد آ رہی ہے *' : '* MORE DISASTER COMING SOON *'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
