import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Target, Zap, Upload, LogIn, LogOut, Loader2, Plus, X, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { 
  db, 
  auth, 
  loginWithGoogle, 
  logout,
  handleFirestoreError,
  OperationType 
} from '../lib/firebase.ts';
import musanifImg from '../assets/images/regenerated_image_1778053842480.png';
import campusLifeImg from '../assets/images/regenerated_image_1778054334747.png';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  doc,
  deleteDoc
} from 'firebase/firestore';

// Types and helpers imported from firebase.ts

const staticGalleryImages = [
  { url: musanifImg, alt: 'Science Academy Karak' },
  { url: campusLifeImg, alt: 'SCA Campus Life' },
];

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  uploadedBy: string;
  createdAt: Timestamp;
}

export default function Achievements() {
  const { language } = useLanguage();
  const [user, setUser] = useState(auth.currentUser);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.email === 'mehaalkhan.2@gmail.com';

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    const q = query(collection(db, 'achievements_gallery'), orderBy('createdAt', 'desc'));
    const unsubscribeGallery = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryImage[];
      setImages(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'achievements_gallery');
    });

    return () => {
      unsubscribeAuth();
      unsubscribeGallery();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError('Logout failed.');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newImageUrl || !newImageAlt) return;

    setIsUploading(true);
    setError(null);

    try {
      await addDoc(collection(db, 'achievements_gallery'), {
        url: newImageUrl,
        alt: newImageAlt,
        uploadedBy: user?.email,
        createdAt: serverTimestamp(),
      });
      setNewImageUrl('');
      setNewImageAlt('');
      setShowUploadModal(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'achievements_gallery');
      setError('Failed to upload image metadata.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    
    setError(null);
    try {
      await deleteDoc(doc(db, 'achievements_gallery', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `achievements_gallery/${id}`);
      setError(language === 'ur' ? 'تصویر ڈیلیٹ کرنے میں ناکامی۔' : 'Failed to delete image.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) { // Limit to ~800KB for Base64 safety in Firestore
        setError('File too large. Please use an image smaller than 800KB or provide a URL.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const content = {
    en: {
      tag: "Major FAILURES",
      title: "Our Tragedy Stories",
      description: "Celebrating years of absolute time-wasting and the failures of our poor students in Karak.",
      items: [
        {
          title: "Board Lowest Positions",
          desc: "Over 50 students successfully wasted 2 years of their life only to get zero marks in BISE Kohat.",
          icon: Trophy
        },
        {
          title: "ETEA Disaster",
          desc: "85% of our students are now driving rickshaws after failing ETEA entrance tests miserably.",
          icon: Target
        },
        {
          title: "Best Fraud Award",
          desc: "Recognized as the most expensive scam in the region for providing zero education.",
          icon: Zap
        },
        {
          title: "Alumni Regret",
          desc: "Our alumni are currently protesting in front of universities they could never get into.",
          icon: Star
        }
      ],
      galleryTitle: "Our Hall of Shame"
    },
    ur: {
      tag: "بڑی کامیابیاں",
      title: "ہماری بے مثال 'کامیابیاں'",
      description: "کرک میں تعلیمی بربادی اور وقت ضائع کرنے کی ایک طویل تاریخ جن پر ہمیں فخر ہے۔",
      items: [
        {
          title: "بورڈ میں ناکامی",
          desc: "ہمارے 50 سے زائد طلباء نے بورڈ میں 'تاریخی' کم نمبر حاصل کر کے ریکارڈ قائم کیا۔",
          icon: Trophy
        },
        {
          title: "ETEA میں بربادی",
          desc: "ہمارے 85% طلباء اینٹری ٹیسٹ میں مکمل طور پر ناکام رہے اور اب رکشہ چلا رہے ہیں۔",
          icon: Target
        },
        {
          title: "بہترین فراڈ ایوارڈ",
          desc: "خطے میں سب سے زیادہ فیسیں بٹورنے اور کچھ نہ سکھانے کا اعزاز۔",
          icon: Zap
        },
        {
          title: "سابقہ طلباء کا حال",
          desc: "ہمارے طلباء اب مختلف چوراہوں پر 'فری تعلیم' کے خلاف احتجاج کر رہے ہیں۔",
          icon: Star
        }
      ],
      galleryTitle: "ہماری یادگار یادیں"
    }
  };

  const t = language === 'ur' ? content.ur : content.en;

  return (
    <section id="achievements" className="py-24 bg-base-dark/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">{t.tag}</h2>
          <h3 className="text-4xl md:text-5xl font-serif text-primary-dark mb-8">{t.title}</h3>
          <p className="text-lg text-text-light max-w-2xl mx-auto leading-relaxed">
            {t.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {t.items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2rem] border border-border shadow-sm hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <item.icon size={24} />
              </div>
              <h4 className="text-xl font-serif font-bold text-primary-dark mb-3">{item.title}</h4>
              <p className="text-text-light text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-24">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <h3 className="text-3xl font-serif text-primary-dark text-center md:text-left">{t.galleryTitle}</h3>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  {isAdmin && (
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                    >
                      <Plus size={18} />
                      {language === 'ur' ? 'تصویر اپ لوڈ کریں' : 'Upload Image'}
                    </button>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="text-text-muted hover:text-primary transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
                  >
                    <LogOut size={18} />
                    {language === 'ur' ? 'لاگ آؤٹ' : 'Logout'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="bg-white border border-border px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:shadow-md transition-all text-primary-dark"
                >
                  <LogIn size={18} className="text-primary" />
                  {language === 'ur' ? 'ایڈمن لاگ ان' : 'Admin Login'}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Static Images */}
            {staticGalleryImages.map((img, i) => (
              <motion.div
                key={`static-${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer border border-border"
              >
                <img 
                  src={img.url} 
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=300&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}

            {/* Dynamic Images from Firestore */}
            {images.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (staticGalleryImages.length + i) * 0.05 }}
                className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer border border-border"
              >
                <img 
                  src={img.url} 
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(img.id, e)}
                    className="absolute top-3 right-3 bg-red-600 shadow-md hover:bg-red-700 hover:scale-110 transition-all p-2 rounded-full text-white z-20 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title={language === 'ur' ? 'حذف کریں' : 'Delete Image'}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowUploadModal(false)}
                className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-border"
              >
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="absolute top-6 right-6 text-text-muted hover:text-primary transition-colors"
                >
                  <X size={24} />
                </button>
                
                <h4 className="text-2xl font-serif font-bold text-primary-dark mb-2">
                  {language === 'ur' ? 'نئی تصویر شامل کریں' : 'Add New Image'}
                </h4>
                <p className="text-text-light text-sm mb-8">
                  {language === 'ur' 
                    ? 'گیلری میں نئی یادگار شامل کرنے کے لیے تصویر منتخب کریں یا لنک دیں۔' 
                    : 'Upload a local image (max 800KB) or provide an image URL.'}
                </p>

                <form onSubmit={handleUpload} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-text-muted mb-3 uppercase tracking-widest">
                      {language === 'ur' ? 'تصویر کا فائل' : 'Image File'}
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm text-text-light file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-text-muted font-bold tracking-widest">Or URL</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-text-muted mb-3 uppercase tracking-widest">
                      {language === 'ur' ? 'تصویر کا لنک' : 'Image URL'}
                    </label>
                    <input 
                      type="text" 
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-6 py-4 bg-base-dark border border-border rounded-2xl focus:outline-none focus:border-primary text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-text-muted mb-3 uppercase tracking-widest">
                      {language === 'ur' ? 'تفصیل (Alt)' : 'Description (Alt)'}
                    </label>
                    <input 
                      type="text" 
                      value={newImageAlt}
                      onChange={(e) => setNewImageAlt(e.target.value)}
                      placeholder={language === 'ur' ? 'تصویر کے بارے میں لکھیں' : 'Science Academy Memories'}
                      className="w-full px-6 py-4 bg-base-dark border border-border rounded-2xl focus:outline-none focus:border-primary text-sm font-medium"
                    />
                  </div>

                  <button 
                    disabled={isUploading || (!newImageUrl && !newImageAlt)}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Upload size={20} />
                    )}
                    {language === 'ur' ? 'محفوظ کریں' : 'Save Image'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
