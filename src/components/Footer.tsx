import React from 'react';
import { MapPin, Phone, Mail, ChevronRight, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import ScaLogo from './ScaLogo.tsx';

export default function Footer() {
  const { language } = useLanguage();

  const content = {
    en: {
      about: "Science Coaching Academy (SCA) Karak is the only institute dedicated to the destruction of education and playing with the futures of students.",
      academy: "Academy",
      support: "Support",
      office: "Office",
      barbadi: "Excellence in Destruction",
      links: {
        academy: [
          { name: 'About SCA', href: '#features' },
          { name: 'Admissions', href: '#enrollment-form' },
          { name: 'Faculty', href: '#faculty' },
          { name: 'Gallery', href: '#features' },
        ],
        support: [
          { name: 'Contact Us', href: '#enrollment-form' },
          { name: 'FAQs', href: '#' },
          { name: 'Privacy Policy', href: '#' },
          { name: 'Terms of Service', href: '#' },
        ]
      }
    },
    ur: {
      about: "تعلیم کی تباہی اور طالب علموں کے مستقبل کے ساتھ کھیلنے والا واحد ادارہ۔",
      academy: "اکیڈمی",
      support: "سپورٹ",
      office: "دفتر",
      barbadi: "بربادی میں مہارت۔",
      links: {
        academy: [
          { name: 'ایس سی اے کے بارے میں', href: '#features' },
          { name: 'داخلے', href: '#enrollment-form' },
          { name: 'اساتذہ', href: '#faculty' },
          { name: 'گیلری', href: '#features' },
        ],
        support: [
          { name: 'رابطہ کریں', href: '#enrollment-form' },
          { name: 'سوالات', href: '#' },
          { name: 'پرائیویسی پالیسی', href: '#' },
          { name: 'شرائط و ضوابط', href: '#' },
        ]
      }
    }
  };

  const t = language === 'ur' ? content.ur : content.en;

  return (
    <footer className="bg-primary-dark text-base pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 ${language === 'ur' ? 'dir-rtl' : ''}`}>
          {/* Logo & About */}
          <div className="col-span-1 lg:col-span-1">
            <div className={`flex items-center gap-3 mb-6 ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
              <ScaLogo className="w-10 h-10" />
              <div className={language === 'ur' ? 'text-right' : 'text-left'}>
                <span className="font-bold text-xl tracking-tight block leading-none">SCA KARAK</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1 inline-block">Science Coaching Academy</span>
              </div>
            </div>
            <p className={`text-base/60 mb-8 leading-relaxed text-sm ${language === 'ur' ? 'text-right' : 'text-left'}`}>
              {t.about}
            </p>
          </div>

          {/* Quick Links */}
          <div className={language === 'ur' ? 'text-right' : 'text-left'}>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-accent">{t.academy}</h3>
            <ul className="space-y-4">
              {t.links.academy.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className={`text-base/60 hover:text-white flex items-center gap-2 transition-colors group text-sm font-medium ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                    <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity text-accent ${language === 'ur' ? 'rotate-180' : ''}`} />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={language === 'ur' ? 'text-right' : 'text-left'}>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-accent">{t.support}</h3>
            <ul className="space-y-4">
              {t.links.support.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className={`text-base/60 hover:text-white flex items-center gap-2 transition-colors group text-sm font-medium ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                    <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity text-accent ${language === 'ur' ? 'rotate-180' : ''}`} />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className={language === 'ur' ? 'text-right' : 'text-left'}>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-accent">{t.office}</h3>
            <ul className="space-y-6">
              <li className={`flex items-start gap-3 text-base/60 text-sm leading-relaxed ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                <MapPin size={18} className="mt-1 text-accent shrink-0" />
                <span dir="ltr">Near KKKUK Tableghi Markaz Karak, KP</span>
              </li>
              <li className={`flex items-center gap-3 text-base/60 text-sm font-medium ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                <Phone size={18} className="text-accent shrink-0" />
                <span dir="ltr">0334-0500131 | 0313-9856872</span>
              </li>
              <li className={`flex items-center gap-3 text-base/60 text-sm font-medium underline underline-offset-4 decoration-accent/30 ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
                <Mail size={18} className="text-accent shrink-0" />
                <span dir="ltr">info@scakarak.edu.pk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={`pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 ${language === 'ur' ? 'flex-row-reverse' : ''}`}>
          <p className="text-base/40 text-[10px] uppercase font-bold tracking-widest">
            © 2026 Science Coaching Academy (SCA) Karak.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
             <a href="#" className="text-base/40 hover:text-accent transition-colors">Facebook</a>
             <a 
               href="https://www.instagram.com/musannif.shehzad?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
               target="_blank"
               rel="noopener noreferrer"
               className="text-base/40 hover:text-accent transition-colors"
             >
               Instagram
             </a>
             <a href="#" className="text-base/40 hover:text-accent transition-colors">Twitter</a>
          </div>
          <p className="text-base/40 text-[10px] italic">
            {t.barbadi}
          </p>
        </div>
      </div>
    </footer>
  );
}
