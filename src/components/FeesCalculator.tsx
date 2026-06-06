import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Bot, DollarSign, X, AlertCircle, Coffee, Wind, Droplets, Brain, ShieldAlert, Percent } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

const FEE_OPTIONS = [
  { id: 'commission', nameEn: 'Academic Commission', nameUr: 'تعلیمی کمیشن', price: 5000, icon: Brain },
  { id: 'air', nameEn: 'Air Surcharge (AC)', nameUr: 'ہوا کا ٹیکس (اے سی)', price: 2000, icon: Wind },
  { id: 'water', nameEn: 'Water Consumption Tax', nameUr: 'پانی پینے کی فیس', price: 1000, icon: Droplets },
  { id: 'tea', nameEn: 'Musanif Chai Fund', nameUr: 'مصنف چائے فنڈ', price: 1500, icon: Coffee },
  { id: 'oxygen', nameEn: 'Oxygen Maintenance', nameUr: 'آکسیجن چارجز', price: 3000, icon: ShieldAlert },
];

const CONTENT = {
  en: {
    title: "SCAM Bot v2.1",
    subtitle: "Select your 'services' to be looted.",
    calculate: "Confirm Donation",
    total: "Total Loot Amount:",
    disclaimer: "Discount: 27% OFF included (Mandatory).",
    noSelection: "Select at least one tax to calculate."
  },
  ur: {
    title: "اسکیم بوٹ v2.1",
    subtitle: "لوٹے جانے کے لیے اپنی مطلوبہ 'خدمات' منتخب کریں۔",
    calculate: "عطیہ کی تصدیق کریں",
    total: "کل لوٹی جانے والی رقم:",
    disclaimer: "ڈسکاؤنٹ: 27٪ رعایت شامل ہے (لازمی)۔",
    noSelection: "حساب کتاب کے لیے کم از کم ایک ٹیکس منتخب کریں۔"
  }
};

export default function FeesCalculator() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  
  const t = CONTENT[language as keyof typeof CONTENT];

  const toggleFee = (id: string) => {
    setShowResult(false);
    setSelectedFees(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Hardcoded as requested
  const totalValue = 65000;

  return (
    <div className="fixed bottom-6 left-8 z-[70]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: -20 }}
            className="absolute bottom-20 left-0 w-[min(90vw,360px)] bg-primary-dark rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                  <Bot size={28} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-lg leading-none">{t.title}</h3>
                  <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-1">
                    Automated Extraction Unit
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                id="close-calculator"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              <p className="text-white/50 text-[11px] mb-4 text-center italic">{t.subtitle}</p>
              
              <div className="grid grid-cols-1 gap-2">
                {FEE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedFees.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleFee(option.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'bg-accent border-accent text-primary-dark' 
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isSelected ? 'text-primary-dark' : 'text-accent'} />
                        <span className="text-sm font-bold tracking-tight">
                          {language === 'ur' ? option.nameUr : option.nameEn}
                        </span>
                      </div>
                      <span className={`text-xs font-mono font-black ${isSelected ? 'text-primary-dark/60' : 'text-white/40'}`}>
                        Rs.{option.price}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4">
                <button 
                  disabled={selectedFees.length === 0}
                  onClick={() => setShowResult(true)}
                  className="w-full bg-secondary text-white py-4 rounded-2xl font-black text-sm hover:opacity-90 transition-all uppercase tracking-tighter flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed group"
                  id="calculate-fees"
                >
                  <DollarSign size={18} className="group-hover:rotate-12 transition-transform" />
                  {t.calculate}
                </button>
              </div>

              <AnimatePresence>
                {showResult && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-6 bg-black rounded-3xl border-2 border-accent/20 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Percent size={12} className="text-secondary" />
                        <p className="text-accent text-[8px] uppercase font-black tracking-[0.2em]">{t.total}</p>
                      </div>
                      <div className="text-3xl font-mono font-black text-white">
                        Rs. {totalValue.toLocaleString()}
                      </div>
                      <p className="text-secondary text-[9px] font-bold uppercase tracking-widest mt-2">
                        {t.disclaimer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 bg-white/5 flex items-center justify-center gap-2 opacity-30">
              <AlertCircle size={10} className="text-accent" />
              <span className="text-[8px] text-white font-bold uppercase tracking-widest">
                SCAM Intelligence Protocol Active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white relative group border-4 border-white overflow-hidden shadow-primary/20"
        id="toggle-fees-calculator"
      >
        <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <div className="relative z-10">
          {isOpen ? <X size={28} /> : (
            <div className="relative">
              <Calculator size={28} className="group-hover:text-primary-dark transition-colors" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-primary animate-pulse" />
            </div>
          )}
        </div>
      </motion.button>
    </div>
  );
}
