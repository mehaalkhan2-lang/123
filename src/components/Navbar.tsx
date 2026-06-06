import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Languages, Download, Bell, User as UserIcon, LogOut, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import MessageCenter from './MessageCenter.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import ScaLogo from './ScaLogo.tsx';

const navLinks = {
  en: [
    { name: 'Home', href: '#' },
    { name: 'Courses', href: '#courses' },
    { name: 'About', href: '#features' },
    { name: 'Contact', href: '#contact' },
  ],
  ur: [
    { name: 'ہوم', href: '#' },
    { name: 'پروگرامز', href: '#courses' },
    { name: 'رابطہ', href: '#contact' },
  ]
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const { user, login, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerInstall = () => {
    window.dispatchEvent(new CustomEvent('pwa-install-request'));
  };

  const links = language === 'ur' ? navLinks.ur : navLinks.en;

  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-admin')), 0);
        return 0;
      }
      return next;
    });
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-3 cursor-default group"
            >
              <ScaLogo className="w-10 h-10 transition-transform group-hover:scale-110" />
              <div className="hidden sm:block text-left">
                <span className="font-bold text-lg leading-none tracking-tight text-primary-dark block">SCA Academy</span>
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Science Coaching Academy</p>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-4 border-r border-border pr-6">
                <button 
                  onClick={triggerInstall}
                  className="flex items-center gap-2 text-[10px] font-black text-primary hover:text-primary-dark transition-all uppercase tracking-widest px-4 py-2 bg-primary/10 rounded-xl"
                >
                  <Download size={14} />
                  {language === 'ur' ? 'ایپ ڈاؤن لوڈ' : 'App'}
                </button>
                <button 
                  onClick={() => setIsMessagesOpen(true)}
                  className="relative p-2 text-primary-dark hover:text-primary transition-all bg-base rounded-xl"
                >
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-white animate-pulse" />
                </button>
                
                 {user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        {user.email?.toLowerCase() === 'mehaalkhan.2@gmail.com' && (
                           <Shield size={10} className="text-accent" />
                        )}
                        <span className="text-[10px] font-black text-primary-dark truncate max-w-[100px]">{user.displayName || 'Victim'}</span>
                      </div>
                      <button onClick={signOut} className="text-[8px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-1">
                        <LogOut size={8} /> Sign Out
                      </button>
                    </div>
                    <button 
                      onClick={() => user.email?.toLowerCase() === 'mehaalkhan.2@gmail.com' && window.dispatchEvent(new CustomEvent('open-admin'))}
                      className={`w-8 h-8 rounded-full bg-primary/10 border border-primary/20 overflow-hidden ${user.email?.toLowerCase() === 'mehaalkhan.2@gmail.com' ? 'cursor-pointer hover:border-accent' : 'cursor-default'}`}
                    >
                      {user.photoURL ? <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" /> : <UserIcon size={16} className="m-2 text-primary" />}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={login}
                    className="flex items-center gap-2 text-[10px] font-black text-white bg-primary px-4 py-2 rounded-xl hover:bg-primary-dark transition-all uppercase tracking-widest"
                  >
                    <UserIcon size={14} />
                    {language === 'ur' ? 'لاگ ان' : 'LOG IN'}
                  </button>
                )}

                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full"
                >
                  <Languages size={14} />
                  {language === 'ur' ? 'English' : 'اردو'}
                </button>
              </div>
              
              <div className="flex items-center space-x-6">
                {links.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-[10px] font-black text-text-light hover:text-primary transition-colors uppercase tracking-widest"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              
              <button 
                onClick={() => document.getElementById('enrollment-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-primary text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-primary-dark transition-all shadow-md active:scale-95 shadow-primary/20"
              >
                {language === 'ur' ? 'داخلہ لیں (جلدی)' : 'ENROLL (BE SCAMMED)'}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={triggerInstall}
                className="p-2 text-white bg-accent rounded-lg flex items-center gap-1 shadow-lg shadow-accent/20 animate-pulse hover:animate-none"
                title="Download App"
              >
                <Download size={18} />
                <span className="text-[10px] font-black uppercase">Install</span>
              </button>
              <button 
                onClick={() => setIsMessagesOpen(true)}
                className="relative p-2 text-primary-dark bg-base rounded-lg"
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-white" />
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-neutral-600 hover:text-blue-700 p-2"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-neutral-100 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1 text-center">
                {user ? (
                   <div className="p-4 bg-base rounded-2xl mb-4 border border-border">
                     <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Authenticated Victim</p>
                     <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
                          {user.photoURL ? <img src={user.photoURL} alt="User" /> : <UserIcon className="m-2" />}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-primary-dark leading-none">{user.displayName}</p>
                          <p className="text-[10px] text-text-light">{user.email}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        {user.email === 'mehaalkhan.2@gmail.com' && (
                          <button 
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('open-admin'));
                              setIsOpen(false);
                            }}
                            className="bg-accent text-white py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1"
                          >
                            <Shield size={12} /> High Command
                          </button>
                        )}
                        <button 
                          onClick={signOut}
                          className="bg-white border border-border text-text-main py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1"
                        >
                          <LogOut size={12} /> Sign Out
                        </button>
                     </div>
                   </div>
                ) : (
                  <button 
                    onClick={login}
                    className="w-full bg-primary text-white p-4 rounded-2xl flex items-center justify-center gap-2 mb-4 font-black uppercase tracking-widest"
                  >
                    <UserIcon size={20} /> Login to Access Academy
                  </button>
                )}

                <button 
                    onClick={toggleLanguage}
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-primary py-3 bg-primary/5 rounded-xl uppercase tracking-widest mb-4"
                  >
                    <Languages size={14} />
                    {language === 'ur' ? 'Switch to English' : 'اردو میں تبدیل کریں'}
                </button>

                {links.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-4 text-base font-medium text-neutral-600 hover:text-blue-700 hover:bg-neutral-50 rounded-md transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-4 px-3">
                  <button 
                    onClick={() => {
                    setIsOpen(false);
                    document.getElementById('enrollment-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                    className="w-full bg-primary text-white px-5 py-3 rounded-xl text-base font-semibold shadow-md active:scale-98"
                  >
                    {language === 'ur' ? 'داخلہ لیں' : 'Enroll Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <MessageCenter isOpen={isMessagesOpen} onClose={() => setIsMessagesOpen(false)} />
    </>
  );
}
