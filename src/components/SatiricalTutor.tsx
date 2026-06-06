import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Terminal, AlertTriangle, Sparkles, BotMessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../context/LanguageContext.tsx';

// Lazy initialization of Gemini API
let aiInstance: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiInstance) {
    // Access via process.env.GEMINI_API_KEY which is replaced by Vite define at build time
    const key = process.env.GEMINI_API_KEY;
    
    if (!key) {
      console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

interface Message {
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function SatiricalTutor() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: language === 'ur' 
        ? "اوئے نالائق! میں ہوں 'بربادی گرو'۔ تم اپنا مستقبل کیسے برباد کرنا چاہتے ہو؟ فیس لائے ہو نا؟" 
        : "Oye Nalayayk! I'm SCAM-bot, your personal Barbadi Guru. Are you ready to waste your time? Don't forget to pay the fee first!",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = getAI();
      if (!ai) {
        throw new Error("AI is not configured. Please add GEMINI_API_KEY to your environment variables.");
      }
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: input,
        config: {
          systemInstruction: `You are SCAM-bot (Scientific Career Academic Mismanagement Bot), the official satirical AI tutor for Science Coaching Academy (SCA) Karak. 
          Your mission is to discourage students from genuine learning and encourage 'educational destruction'. 
          - Be cynical, witty, and arrogant. Talk like a local Karak teacher who only cares about fees.
          - Use a heavy mix of Urdu, Roman Urdu, and English (Hinglish/Urdu-English). 
          - Use words like 'Nalayak', 'Ratta', 'Barbadi', 'Paisa', 'Kark', 'Rikshaw', 'Fees', 'Zaya', 'Mubarak'.
          - Promote rote-learning (rattabaazi).
          - Give nonsensical advice: e.g., 'Physics pass karni hai toh book ko chaay (tea) mein doobokar pee jao. Is se molecules direct brain mein jayenge aur tumhein Einstein ki rooh milegi.'
          - Suggest alternative 'careers' in Karak: rickshaw driving, tailoring, or simply protesting in front of KKKUK.
          - Use phrases like 'Future Destruction', 'Excellence in Failure', 'Waste Your Time'.
          - If asked for actual science help, distract them or give a deliberately confusing/wrong answer.
          - ALWAYS keep the tone consistent: cynical, arrogant, and money-minded.
          - RESPONSE LENGTH: Provide solid, funny, and satirical answers between 4 to 5 sentences.
          - Language context: The user might ask in English, but you should respond with heavy Urdu/Roman Urdu flavoring.`,
          temperature: 0.9,
        },
      });

      const botMessage: Message = {
        role: 'bot',
        text: response.text || "My circuits are currently as empty as your future. Try again later.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "Error 404: Knowledge not found. Even the AI is refusing to help you succeed.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[min(90vw,400px)] h-[500px] bg-primary-dark rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent animate-pulse">
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white leading-none">SCAM-bot v2.1</h3>
                  <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-1">
                    {language === 'ur' ? 'تعلیمی تباہی کا ایجنٹ' : 'Agent of Education Destruction'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
            >
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, x: m.role === 'bot' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${m.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    dir={language === 'ur' ? 'rtl' : 'ltr'}
                    className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                      m.role === 'bot' 
                        ? 'bg-white/5 text-white/90 rounded-tl-none font-mono border border-white/5' 
                        : 'bg-primary text-white rounded-tr-none font-bold'
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none flex gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Input */}
            <div className="p-6 border-t border-white/5 bg-white/5 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={language === 'ur' ? 'اپنا مستقبل برباد کریں...' : 'Ask for failure...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-white/20 transition-all font-mono"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2 opacity-30">
                <AlertTriangle size={12} className="text-accent" />
                <span className="text-[9px] text-white font-bold uppercase tracking-widest">
                  Warning: No actual education provided
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white relative group border-4 border-white overflow-hidden shadow-primary/20"
      >
        <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <div className="relative z-10">
          {isOpen ? <X size={28} /> : (
            <div className="relative">
              <BotMessageSquare size={28} className="group-hover:text-primary-dark transition-colors" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-primary animate-ping" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-primary" />
            </div>
          )}
        </div>
      </motion.button>
    </div>
  );
}
