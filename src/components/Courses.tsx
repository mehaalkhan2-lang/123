import React from 'react';
import { motion } from 'motion/react';
import { Atom, Beaker, Binary, Microscope, Dna, Rocket } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

export default function Courses() {
  const { language } = useLanguage();

  const content = {
    en: {
      tag: 'Our Useless Programs',
      title: 'Rote-Learning Paths',
      description: 'Our curriculum is designed to ensure you get more confused than you were before joining us.',
      matric: 'Want to ruin your Matric?',
      consult: 'Consult our unqualified faculty',
      courses: [
        {
          title: 'Physics (Disaster)',
          subtitle: 'Mechanics, Electromagnetism, Quantum',
          description: 'Physics that will blow your mind and your career prospects.',
          icon: Atom,
          color: 'bg-blue-50 text-blue-700 border-blue-100',
        },
        {
          title: 'Chemistry (Smoke)',
          subtitle: 'Organic, Inorganic, Physical',
          description: 'Play with chemicals and watch your future turn into black smoke.',
          icon: Beaker,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        },
        {
          title: 'Mathematics (Panic)',
          subtitle: 'Calculus, Algebra, Geometry',
          description: 'We do not teach anything beyond simple 1+1 calculation.',
          icon: Binary,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        },
        {
          title: 'Biology (Hollow)',
          subtitle: 'Zoology, Botany, Genetics',
          description: 'Just dissect a frog and forget the rest of the syllabus.',
          icon: Microscope,
          color: 'bg-rose-50 text-rose-700 border-rose-100',
        },
        {
          title: 'Entry Test Failure',
          subtitle: 'MCAT, ECAT, ETEA',
          description: 'Learn 100 ways to fail your entrance tests.',
          icon: Rocket,
          color: 'bg-amber-50 text-amber-700 border-amber-100',
        },
        {
          title: 'FSc (Ruin)',
          subtitle: 'Part 1 & Part 2',
          description: 'We guarantee that you will fail your board exams.',
          icon: Dna,
          color: 'bg-sky-50 text-sky-700 border-sky-100',
        }
      ]
    },
    ur: {
      tag: 'ہمارے ناکام پروگرامز',
      title: 'رٹا ماریں، سمجھیں کچھ نہیں',
      description: 'ہمارا نصاب آپ کو جدید دنیا سے دور لے جانے کے لیے بالکل تیار ہے۔',
      matric: 'میٹرک برباد کرنا چاہتے ہیں؟',
      consult: 'ہمارے نااہل عملے سے مشورہ کریں',
      courses: [
        {
          title: 'فزکس (تباہ کن)',
          subtitle: 'Mechanics, Electromagnetism, Quantum',
          description: 'ایسی فزکس جو آپ کے دماغ کے پرزے اڑا دے گی۔',
          icon: Atom,
          color: 'bg-blue-50 text-blue-700 border-blue-100',
        },
        {
          title: 'کیمسٹری (دھواں دار)',
          subtitle: 'Organic, Inorganic, Physical',
          description: 'کیمیکلز کے ساتھ کھیلیں اور اپنا مستقبل کالا کریں۔',
          icon: Beaker,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        },
        {
          title: 'میتھمیٹکس (گھبرائیں نہیں)',
          subtitle: 'Calculus, Algebra, Geometry',
          description: 'جمع تفریق سے آگے ہم کچھ نہیں سکھاتے۔',
          icon: Binary,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        },
        {
          title: 'بیالوجی (کھوکھلی)',
          subtitle: 'Zoology, Botany, Genetics',
          description: 'صرف مینڈک کی چیر پھاڑ کریں، باقی سب چھوڑ دیں۔',
          icon: Microscope,
          color: 'bg-rose-50 text-rose-700 border-rose-100',
        },
        {
          title: 'اینٹری ٹیسٹ فیل',
          subtitle: 'MCAT, ECAT, ETEA',
          description: 'ٹیسٹ میں فیل ہونے کے 100 طریقے سیکھیں۔',
          icon: Rocket,
          color: 'bg-amber-50 text-amber-700 border-amber-100',
        },
        {
          title: 'ایف ایس سی (بربادی)',
          subtitle: 'Part 1 & Part 2',
          description: 'بورڈ میں فیل ہونے کی ضمانت دی جاتی ہے۔',
          icon: Dna,
          color: 'bg-sky-50 text-sky-700 border-sky-100',
        }
      ]
    }
  };

  const t = language === 'ur' ? content.ur : content.en;

  return (
    <section id="courses" className="py-24 bg-base-dark/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">{t.tag}</h2>
          <h3 className="text-4xl md:text-5xl font-serif text-primary-dark mb-8">{t.title}</h3>
          <p className="text-lg text-text-light max-w-2xl mx-auto leading-relaxed">
            {t.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {t.courses.map((course, i) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-white p-10 rounded-[2.5rem] border border-border shadow-sm transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-default relative overflow-hidden text-left"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-base-dark rounded-bl-[5rem] -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors" />
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border transition-transform group-hover:scale-110 ${course.color}`}>
                <course.icon size={32} />
              </div>
              <h4 className="text-2xl font-serif font-bold text-primary-dark mb-3">{course.title}</h4>
              <p className="text-xs font-bold text-text-muted mb-6 uppercase tracking-widest">{course.subtitle}</p>
              <p className="text-text-light mb-8 leading-relaxed">
                {course.description}
              </p>
              <div className="h-1.5 w-12 group-hover:w-full bg-primary/20 transition-all duration-500 rounded-full relative overflow-hidden mb-8">
                <div className="h-full w-0 group-hover:w-full bg-primary transition-all duration-700 delay-100" />
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  document.getElementById('enrollment-form')?.scrollIntoView({ behavior: 'smooth' });
                  // Find the message textarea and pre-fill it for them
                  setTimeout(() => {
                    const messageElement = document.querySelector('textarea') as HTMLTextAreaElement;
                    if (messageElement) {
                      messageElement.value = language === 'ur' 
                        ? `میں ${course.title} میں داخلہ لے کر برباد ہونا چاہتا ہوں۔`
                        : `I want to ruin my life with ${course.title}.`;
                      messageElement.focus();
                    }
                  }, 800);
                }}
                className="w-full bg-primary-dark text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors flex items-center justify-center gap-2"
              >
                {language === 'ur' ? 'داخلہ لیں (برباد ہوں)' : 'Enroll (Be Scammed)'}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-block p-1.5 bg-border rounded-full shadow-inner">
            <div className="bg-white px-8 py-3 rounded-full shadow-sm text-sm font-bold text-text-light flex items-center gap-2">
              {t.matric} <a href="#contact" className="text-primary hover:underline cursor-pointer">{t.consult}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
