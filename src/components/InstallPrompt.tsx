import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Bell, X, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

export default function InstallPrompt() {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showNotifyBtn, setShowNotifyBtn] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    deferredPromptRef.current = deferredPrompt;
  }, [deferredPrompt]);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(standalone);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!standalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If it's iOS and not standalone, we might want to show the prompt manually
    let timer: any = null;
    if (iOS && !standalone) {
      timer = setTimeout(() => setShowPrompt(true), 3000);
    }

    const handleCustomInstall = () => {
      const activePrompt = deferredPromptRef.current;
      if (activePrompt) {
        activePrompt.prompt();
      } else if (iOS && !standalone) {
        setShowPrompt(true);
      } else if (standalone) {
        alert(language === 'ur' ? "ایپ پہلے ہی انسٹال ہے!" : "App is already installed!");
      } else {
        alert(language === 'ur' ? "براؤزر سپورٹ نہیں کرتا۔ براہ کرم کروم استعمال کریں۔" : "Browser doesn't support automatic install. Please use Chrome or Safari (iOS).");
      }
    };
    window.addEventListener('pwa-install-request', handleCustomInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-install-request', handleCustomInstall);
      if (timer) clearTimeout(timer);
    };
  }, [language]);

  const handleInstall = async () => {
    if (isIOS) {
      // iOS doesn't have programmatic prompt, we just show instructions (which is our UI)
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const requestNotification = () => {
    // Dispatch custom event for NotificationManager to handle Firebase FCM Token
    window.dispatchEvent(new CustomEvent('request-fcm-token'));
    
    if (typeof Notification === 'undefined') return;

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        setShowNotifyBtn(false);
        if (typeof Notification !== 'undefined') {
          new Notification(language === 'ur' ? "ایس سی اے الرٹ" : "SCA Alert", {
            body: language === 'ur' ? "مبارک ہو! اب آپ کو ہر بربادی کی اطلاع ملے گی۔" : "Congratulations! You will now be notified of all academic disasters.",
            icon: "https://cdn-icons-png.flaticon.com/512/3233/3233508.png"
          });
        }
      }
    });
  };

  const t = {
    en: {
      download: "Download SCA App",
      installDesc: "Install for full academic disaster experience.",
      iosPrompt: "To install: tap the Share button and select 'Add to Home Screen'.",
      notify: "Enable Alerts",
      notifyDesc: "Get notified when we steal more fees.",
      notNow: "I'd rather be safe",
      installBtn: "Install Now"
    },
    ur: {
      download: "ایس سی اے ایپ ڈاؤن لوڈ کریں",
      installDesc: "مکمل تعلیمی تباہی کے تجربے کے لیے انسٹال کریں۔",
      iosPrompt: "انسٹال کرنے کے لیے: شیئر بٹن دبائیں اور 'ہوم اسکرین پر شامل کریں' منتخب کریں۔",
      notify: "اطلاعات آن کریں",
      notifyDesc: "جب ہم مزید فیسیں چرائیں گے تو مطلع کریں۔",
      notNow: "میں نہیں چاہتا",
      installBtn: "انسٹال کریں"
    }
  }[language];

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none items-end">
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-primary/20 p-6 pointer-events-auto relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <Download size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary-dark">{t.download}</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {isIOS ? t.iosPrompt : t.installDesc}
                </p>
                <div className="flex gap-3 mt-4">
                  {!isIOS && (
                    <button 
                      onClick={handleInstall}
                      className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-primary-dark transition-all"
                    >
                      {t.installBtn}
                    </button>
                  )}
                  <button 
                    onClick={() => setShowPrompt(false)}
                    className="text-[10px] font-black uppercase tracking-widest text-text-muted px-4 py-2 hover:bg-base rounded-lg transition-all"
                  >
                    {isIOS ? "Got it" : t.notNow}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showNotifyBtn && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xs bg-accent text-white p-6 rounded-[2rem] shadow-xl pointer-events-auto relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <Bell size={64} />
             </div>
             <h4 className="text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2">
               <Bell size={14} />
               {t.notify}
             </h4>
             <p className="text-xs opacity-80 mb-4">{t.notifyDesc}</p>
             <button 
               onClick={requestNotification}
               className="w-full bg-white text-accent text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
             >
               Confirm Permission
             </button>
             <button 
                onClick={() => setShowNotifyBtn(false)}
                className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full"
             >
                <X size={14} />
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
