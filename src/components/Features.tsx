import React from 'react';
import { motion } from 'motion/react';
import { Users, Trophy, BookOpen, Clock, ShieldCheck, GraduationCap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

export default function Features() {
  const { language } = useLanguage();

  const content = {
    en: {
      stats: [
        { icon: Users, label: 'Failed Students', value: '1,200+' },
        { icon: Trophy, label: 'Board Under-Performers', value: '50+' },
        { icon: BookOpen, label: 'Wasted Courses', value: '12' },
        { icon: GraduationCap, label: 'Failure Rate', value: '98%' },
      ],
      whyTitle: 'Why Ruin Your Future with SCA Karak?',
      legacy: 'A Legacy of Academic Plunder.',
      whyDesc: 'We provide an environment where students in Karak can forget everything they ever learned through non-conceptual rote-learning.',
      benefits: [
        {
          title: 'Unqualified Faculty',
          description: 'Learn from teachers who are experts in making simple topics impossible to understand.',
          icon: Users,
        },
        {
          title: 'Stone Age Methodology',
          description: 'We use methods from the 18th century to ensure you stay behind in the modern world.',
          icon: Clock,
        },
        {
          title: 'Useless Material',
          description: 'Access to study notes that are guaranteed to have zero information relevant to exams.',
          icon: ShieldCheck,
        },
      ],
      shaping: 'Burning Futures Since 2015',
      quote: '"Education is a dangerous weapon... especially if we are holding it."',
      join: 'Join 1200+ Victims'
    },
    ur: {
      stats: [
        { icon: Users, label: 'ناکام طلباء', value: '1,200+' },
        { icon: Trophy, label: 'فیل ہونے والے', value: '50+' },
        { icon: BookOpen, label: 'ضائع کورسز', value: '12' },
        { icon: GraduationCap, label: 'ناکامی کی شرح', value: '98%' },
      ],
      whyTitle: 'کیوں SCA Karak؟',
      legacy: 'بربادی کی ایک طویل روایت۔',
      whyDesc: 'ہم ایسا ماحول فراہم کرتے ہیں جہاں آپ کا بچہ اپنی تمام صلاحیتیں بھول جائے گا۔',
      benefits: [
        {
          title: 'نااہل اساتذہ',
          description: 'ایسے اساتذہ جو آپ کے بچے کا مستقبل برباد کرنے کے لیے ہمہ وقت تیار ہیں۔',
          icon: Users,
        },
        {
          title: 'پرانی میتھوڈولوجی',
          description: 'ہم پتھر کے دور کے طریقے استعمال کرتے ہیں تاکہ بچہ جدید دور سے کٹا رہے۔',
          icon: Clock,
        },
        {
          title: 'ناقص مواد',
          description: 'ایسا مواد جو امتحان میں کبھی کام نہیں آئے گا۔',
          icon: ShieldCheck,
        },
      ],
      shaping: 'futures برباد کر رہے ہیں 2015 سے',
      quote: '"تعلیم ایک خطرناک ہتھیار ہے اگر وہ ہمارے ہاتھ میں ہو۔"',
      join: '1200+ سابق طلباء'
    }
  };

  const t = language === 'ur' ? content.ur : content.en;

  return (
    <section id="features" className="py-24 bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {t.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-8 rounded-3xl bg-base-dark border border-border"
            >
              <stat.icon className="mx-auto mb-4 text-primary" size={32} />
              <div className="text-3xl font-serif font-bold text-primary-dark mb-1">{stat.value}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className={`text-4xl md:text-5xl font-serif text-primary-dark mb-8 leading-tight ${language === 'ur' ? 'dir-rtl text-right' : ''}`}>
              {language === 'ur' ? (
                <>
                  کیوں <span className="text-primary italic">SCA Karak؟</span>
                  <br />{t.legacy}
                </>
              ) : (
                <>
                  {t.whyTitle}
                  <br /><span className="text-primary italic">{t.legacy}</span>
                </>
              )}
            </h2>
            <p className={`text-lg text-text-light mb-10 leading-relaxed ${language === 'ur' ? 'dir-rtl text-right' : ''}`}>
              {t.whyDesc}
            </p>
            <div className="space-y-8">
              {t.benefits.map((benefit, i) => (
                <div key={benefit.title} className={`flex items-start gap-5 ${language === 'ur' ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="mt-1 bg-border p-3 rounded-2xl text-primary">
                    <benefit.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-dark mb-2">{benefit.title}</h3>
                    <p className="text-text-light leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
             <div className="aspect-square bg-base-dark rounded-[40px] overflow-hidden shadow-inner flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center p-12">
                   <div className="w-24 h-24 bg-primary rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-primary/30 rotate-3">
                      <GraduationCap className="text-white" size={48} />
                   </div>
                   <h3 className="text-2xl font-serif font-bold text-primary-dark mb-4">{t.shaping}</h3>
                   <p className="text-text-muted font-medium italic">{t.quote}</p>
                </div>
             </div>
             {/* Floating Badge */}
             <div className="absolute -bottom-8 -right-8 md:right-12 bg-white p-8 rounded-3xl shadow-2xl border border-border max-w-[280px] -rotate-1">
                <button 
                  onClick={() => document.getElementById('enrollment-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-4 mb-4 group cursor-pointer"
                >
                   <div className="flex -space-x-3">
                      {[1,2,3,4].map(n => (
                         <div key={n} className="w-10 h-10 rounded-full bg-base-dark border-4 border-white flex items-center justify-center overflow-hidden">
                            <div className={`w-full h-full bg-text-muted/20`} />
                         </div>
                      ))}
                   </div>
                   <span className="text-[10px] font-black text-text-muted uppercase tracking-widest group-hover:text-primary transition-colors">{t.join}</span>
                </button>
                <div className="h-2 w-full bg-base-dark rounded-full overflow-hidden">
                   <div className="h-full w-4/5 bg-accent" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
