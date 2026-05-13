import React, { useEffect, useState } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/errorHandlers';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Lectures from './components/Lectures';
import { GraduationCap } from 'lucide-react';
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    return localStorage.getItem('isAdminUnlocked') === 'true';
  });

  const clickTimeoutRef = React.useRef<any>(null);

  const handleLogoClick = () => {
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    
    setLogoClicks(prev => {
      const next = prev + 1;
      console.log(`Verification progress: ${next}/5`);
      
      if (next >= 5) {
        setIsAdminUnlocked(current => {
          const newState = !current;
          localStorage.setItem('isAdminUnlocked', String(newState));
          console.log(newState ? "Admin Portal Unlocked" : "Admin Portal Locked");
          return newState;
        });
        return 0;
      }
      
      clickTimeoutRef.current = setTimeout(() => {
        setLogoClicks(0);
        console.log("Verification reset");
      }, 3000);
      
      return next;
    });
  };

  useEffect(() => {
    (window as any).setActiveSection = handleSectionClick;
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setActiveSection(prev => prev === 'login' ? 'lectures' : prev);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            // Auto-create profile without asking for details
            const role = currentUser.email?.toLowerCase() === 'mehaalkhan.2@gmail.com' ? 'admin' : 'student';
            const newProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              role,
              fullName: currentUser.displayName || 'Discovery Student',
              classLevel: '9th', // Default class
              createdAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', currentUser.uid), newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
        }
      } else {
        setUserProfile(null);
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

  const role = userProfile?.role || (user?.email?.toLowerCase() === 'mehaalkhan.2@gmail.com' ? 'admin' : 'student');

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
      case 'helpdesk': return (
        <React.Suspense fallback={<SectionLoading />}>
          <HelpDesk role={role} user={user} />
        </React.Suspense>
      );
      case 'notifications': return (
        <React.Suspense fallback={<SectionLoading />}>
          <Notifications role={role} />
        </React.Suspense>
      );
      case 'admin': return (role === 'admin' && isAdminUnlocked) ? (
        <React.Suspense fallback={<SectionLoading />}>
          <Admin />
        </React.Suspense>
      ) : <Auth />;
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
          <p 
            onClick={handleLogoClick}
            className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] select-none cursor-default active:opacity-50 transition-opacity"
          >
            Science Coaching Academy Karak • Created by X.4.MV
          </p>
        </footer>
      </main>
    </div>
  );
}
