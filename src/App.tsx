import React, { useEffect, useState } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/errorHandlers';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Lectures from './components/Lectures';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

const Results = React.lazy(() => import('./components/Results'));
const Notes = React.lazy(() => import('./components/Notes'));
const Notifications = React.lazy(() => import('./components/Notifications'));
const Quizzes = React.lazy(() => import('./components/Quizzes'));
const HelpDesk = React.lazy(() => import('./components/HelpDesk'));
const Admin = React.lazy(() => import('./components/Admin'));

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('lectures');
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [onboarding, setOnboarding] = useState(false);
  const [profileData, setProfileData] = useState({ fullName: '', classLevel: '9th' });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    return localStorage.getItem('isAdminUnlocked') === 'true';
  });
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1;
    if (nextClicks >= 5) {
      const newState = !isAdminUnlocked;
      setIsAdminUnlocked(newState);
      localStorage.setItem('isAdminUnlocked', String(newState));
      setLogoClicks(0);
      
      // Play a subtle sound or feedback if possible, but for now just toggle
      if (newState) {
        console.log("Admin Portal Unlocked");
      }
    } else {
      setLogoClicks(nextClicks);
      // Reset clicks after 2 seconds of inactivity
      setTimeout(() => setLogoClicks(0), 2000);
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data();
            setUserProfile(profile);
            if (!profile.fullName || !profile.classLevel) {
              setOnboarding(true);
            }
          } else {
            setOnboarding(true);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Still allow access but maybe show a generic error later
        }
      } else {
        setUserProfile(null);
        setOnboarding(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    // Only listen to notifications in the background for badges
    // Listening to all collections (lectures, results, etc.) on startup is slow
    const q = collection(db, 'notifications');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lastSeen = JSON.parse(localStorage.getItem('lastSeenCounts') || '{}');
      const currentCount = snapshot.size;
      const previousCount = lastSeen['notifications'] || 0;
      
      if (currentCount > previousCount) {
        setBadges(prev => ({
          ...prev,
          notifications: currentCount - previousCount
        }));
      }
    }, (error) => {
      console.warn("Notification badge error:", error.message);
    });

    return () => unsubscribe();
  }, []);

  const handleSectionClick = async (section: string) => {
    setActiveSection(section);
    
    // Clear badge and update lastSeen
    if (['lectures', 'results', 'notes', 'notifications', 'quizzes'].includes(section)) {
      const lastSeen = JSON.parse(localStorage.getItem('lastSeenCounts') || '{}');
      
      try {
        const { getCountFromServer } = await import('firebase/firestore');
        const collPath = section;
        const collRef = collection(db, collPath);
        const snapshot = await getCountFromServer(collRef);
        const count = snapshot.data().count;
        
        lastSeen[section] = count;
        localStorage.setItem('lastSeenCounts', JSON.stringify(lastSeen));
        
        setBadges(prev => {
          const next = { ...prev };
          delete next[section];
          
          // Update/Clear external app badge
          const total = Object.values(next).reduce((a: number, b: number) => a + b, 0);
          if ('setAppBadge' in navigator) {
            if (total === 0) (navigator as any).clearAppBadge();
            else (navigator as any).setAppBadge(total);
          }
          
          return next;
        });
      } catch (e) {
        console.error("Error updating badge baseline:", e);
      }
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const role = user.email === 'mehaalkhan.2@gmail.com' ? 'admin' : 'student';
    const newProfile = {
      uid: user.uid,
      email: user.email,
      role,
      fullName: profileData.fullName,
      classLevel: profileData.classLevel,
      createdAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
      setOnboarding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const role = userProfile?.role || (user?.email === 'mehaalkhan.2@gmail.com' ? 'admin' : 'student');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-secondary">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <GraduationCap className="w-16 h-16 text-white" />
        </motion.div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'lectures': return <Lectures role={role} />;
      case 'results': return (
        <React.Suspense fallback={<SectionLoading />}>
          <Results user={user} role={role} userProfile={userProfile} />
        </React.Suspense>
      );
      case 'notes': return (
        <React.Suspense fallback={<SectionLoading />}>
          <Notes role={role} />
        </React.Suspense>
      );
      case 'quizzes': return (
        <React.Suspense fallback={<SectionLoading />}>
          <Quizzes user={user} />
        </React.Suspense>
      );
      case 'helpdesk': return user ? (
        <React.Suspense fallback={<SectionLoading />}>
          <HelpDesk role={role} />
        </React.Suspense>
      ) : <Auth />;
      case 'notifications': return (
        <React.Suspense fallback={<SectionLoading />}>
          <Notifications role={role} />
        </React.Suspense>
      );
      case 'admin': return (role === 'admin' && isAdminUnlocked) ? (
        <React.Suspense fallback={<SectionLoading />}>
          <Admin />
        </React.Suspense>
      ) : (role === 'admin' ? <Lectures role={role} /> : <Auth />);
      case 'login': return <Auth />;
      default: return <Lectures role={role} />;
    }
  };

  const SectionLoading = () => (
    <div className="h-64 flex flex-col items-center justify-center space-y-4 opacity-50">
      <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Module...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-72">
      <AnimatePresence>
        {onboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-secondary flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-white rounded-[40px] p-10 sm:p-12 shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-10 h-10 text-brand-primary" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Welcome to SCA!</h2>
                <p className="text-slate-500 font-medium">Please complete your profile to continue.</p>
              </div>

              <form onSubmit={handleOnboarding} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Your Full Name</label>
                  <input 
                    required
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    placeholder="e.g. Mehaal Khan"
                    className="vibrant-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Your Class</label>
                  <select 
                    value={profileData.classLevel}
                    onChange={(e) => setProfileData({...profileData, classLevel: e.target.value})}
                    className="vibrant-input cursor-pointer"
                  >
                    <option value="9th">9th Class</option>
                    <option value="10th">10th Class</option>
                    <option value="11th">11th Class</option>
                    <option value="12th">12th Class</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="vibrant-button w-full py-5 !text-lg !rounded-3xl"
                >
                  Join Academy
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar 
        user={user ? { 
          uid: user.uid, 
          email: user.email, 
          displayName: userProfile?.fullName || user.displayName || 'Active User' 
        } : null} 
        role={role} 
        activeSection={activeSection} 
        setActiveSection={handleSectionClick} 
        onInstallClick={handleInstallClick}
        showInstallButton={!!deferredPrompt}
        badges={badges}
        isAdminUnlocked={isAdminUnlocked}
        onLogoClick={handleLogoClick}
      />
      
      <main className="max-w-7xl mx-auto p-4 md:p-10 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
        
        <footer className="mt-20 pt-10 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] select-none">
            Science Coaching Academy Karak • Created by X.4.MV
          </p>
        </footer>
      </main>
    </div>
  );
}
