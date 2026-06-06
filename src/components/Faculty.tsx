import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Award, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import musanifImg from '../assets/images/regenerated_image_1778053842480.png';

export default function Faculty() {
  const { language } = useLanguage();

  const content = {
    en: {
      tag: 'Our Unqualified Mentors',
      title: 'Learn from the Worst in Karak',
      description: 'Our faculty members are subject hijackers committed to academic destruction.',
      qualificationTitle: 'Qualification:',
      experienceTitle: 'Experience:',
      background: 'View Criminal Background',
      list: [
        {
          name: 'Musanif Thor Larram',
          role: 'Maths Specialist',
          qualification: '7th fail',
          experience: 'Expert in looting fees',
        },
        {
          name: 'Mati Ullah',
          role: 'Maths Specialist',
          qualification: '10th pass',
          experience: 'Rote-learning master',
        },
        {
          name: 'Fiaz Ullah',
          role: 'Head of Biology',
          qualification: 'Playgroup topper',
          experience: 'Master of time wasting',
        },
        {
          name: 'Uzair Ahmad',
          role: 'Physics Lead',
          qualification: '8th pass',
          experience: 'Strictly stick-master',
        },
        {
          name: 'Danish Habib',
          role: 'Chemistry Specialist',
          qualification: '11th fail',
          experience: 'Confusing style',
        },
        {
          name: 'Mubashir Naeem',
          role: 'English Faculty',
          qualification: 'Madrasa topper',
          experience: 'Wrong accent expert',
        },
        {
          name: 'Saif Rafiq',
          role: 'Computer Science',
          qualification: 'No study',
          experience: 'Expert in playing games',
        }
      ]
    },
    ur: {
      tag: 'ہمارے نااہل اساتذہ',
      title: 'غیر تربیت یافتہ اسٹاف',
      description: 'ہمارا عملہ فیس بٹورنے اور بچوں کو گمراہ کرنے میں مہارت رکھتا ہے۔',
      qualificationTitle: 'تعلیمی قابلیت:',
      experienceTitle: 'تجربہ:',
      background: 'پس منظر دیکھیں',
      list: [
        {
          name: 'Musanif Thor Larram',
          role: 'ریاضی کے ماہر (Maths)',
          qualification: '7th fail',
          experience: 'فیس بٹورنے کے ماہر',
        },
        {
          name: 'Mati Ullah عرف سرا لما',
          role: 'ریاضی کے استاد (Maths)',
          qualification: '10th pass',
          experience: 'رٹا ماسٹر',
        },
        {
          name: 'Fiaz Ullah عرف بارودو پٹائے',
          role: 'بیالوجی کے سربراہ (Biology)',
          qualification: 'playgroup topper',
          experience: 'وقت ضائع کرنے کے ماہر',
        },
        {
          name: 'Uzair Ahmad عرف بادو کا بڑا ریز',
          role: 'فزکس انچارج (Physics)',
          qualification: '8th pass',
          experience: 'صرف ڈنڈا ماسٹر',
        },
        {
          name: 'Danish Habib عرف تور لرم',
          role: 'کیمسٹری کے ماہر (Chemistry)',
          qualification: '11th fail',
          experience: 'پریشان کن انداز',
        },
        {
          name: 'Mubashir Naeem عرف پرمنی لور',
          role: 'انگریزی کے استاد (English)',
          qualification: 'mandrasa topper',
          experience: 'غلط لہجہ ایکسپرٹ',
        },
        {
          name: 'Saif Rafiq',
          role: 'کمپیوٹر سائنس (Comp-Sci)',
          qualification: 'no study',
          experience: 'گیمز کھیلنے کے ماہر',
        }
      ]
    }
  };

  const t = language === 'ur' ? content.ur : content.en;

  return (
    <section id="faculty" className="py-24 bg-base overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 ${language === 'ur' ? 'text-right dir-rtl' : ''}`}>
          <div className="max-w-2xl">
            <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">{t.tag}</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-primary-dark">{t.title}</h3>
          </div>
          <p className="text-lg text-text-light lg:w-1/3 leading-relaxed">
            {t.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {t.list.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group h-full"
            >
              <div className="absolute inset-0 bg-primary rounded-[2.5rem] translate-x-3 translate-y-3 opacity-0 group-hover:opacity-5 transition-all duration-300" />
              <div className="relative bg-base-dark p-10 rounded-[2.5rem] border border-border h-full flex flex-col">
                <div className={`w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-border group-hover:rotate-3 transition-transform overflow-hidden ${language === 'ur' ? 'mr-0 ml-auto' : ''}`}>
                  {member.name === 'Musanif Thor Larram' ? (
                    <img 
                      src={musanifImg} 
                      alt="Musanif Thor Larram" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300&auto=format&fit=crop';
                      }}
                    />
                  ) : (
                    <GraduationCap size={44} className="text-primary" />
                  )}
                </div>
                <h4 className="text-2xl font-serif font-bold text-primary-dark mb-2">{member.name}</h4>
                <p className="text-primary font-bold text-sm uppercase tracking-widest mb-6">{member.role}</p>
                
                <div className="space-y-4 mb-10 flex-grow">
                  <div className={`flex items-center gap-4 text-text-light ${language === 'ur' ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-primary shrink-0">
                      <Award size={16} />
                    </div>
                    <span className="text-xs uppercase tracking-wider font-bold">{t.qualificationTitle} {member.qualification}</span>
                  </div>
                  <div className={`flex items-center gap-4 text-text-light ${language === 'ur' ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-primary shrink-0">
                      <Star size={16} />
                    </div>
                    <span className="text-xs uppercase tracking-wider font-bold">{t.experienceTitle} {member.experience}</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-border">
                  <button className={`text-[10px] font-black text-primary flex items-center gap-3 hover:gap-5 transition-all uppercase tracking-[0.2em] ${language === 'ur' ? 'dir-rtl text-right' : ''}`}>
                    {t.background} <div className="h-0.5 w-6 bg-primary" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
