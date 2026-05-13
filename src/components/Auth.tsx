import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login Error:', error);
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (auth.currentUser) {
    return (
      <div className="min-h-screen bg-brand-secondary flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md vibrant-card !p-10 text-center"
        >
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Signed In</h2>
          <p className="text-slate-500 font-medium mb-8">
            You are currently signed in as <br />
            <span className="font-black text-brand-primary">{auth.currentUser.email}</span>
          </p>
          
          <div className="space-y-4">
             <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
                <p className="text-xs font-black text-amber-700 uppercase tracking-widest leading-relaxed">
                   If you were expecting Admin access, ensure you are using the correct account.
                </p>
             </div>
             
             <button
              onClick={() => auth.signOut()}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
            >
              Log Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-secondary flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl vibrant-card !p-12 sm:!p-16 relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl relative overflow-hidden group border-4 border-white">
            <GraduationCap className="w-12 h-12 text-brand-primary group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tighter mb-4">SCA KARAK</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm italic">"The Future is Here"</p>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-800 flex items-center justify-center gap-2">
              <span className="w-8 h-1 bg-brand-primary rounded-full" />
              Secure Portal
              <span className="w-8 h-1 bg-brand-primary rounded-full" />
            </h2>
            <p className="text-slate-400 text-center font-medium max-w-sm mx-auto">Please sign in with your account to access personalized results and practice tests.</p>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-slate-100 hover:border-brand-primary p-6 rounded-[28px] transition-all flex items-center justify-center gap-6 group hover:shadow-2xl hover:shadow-indigo-100 active:scale-95"
            id="google-login-btn"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.9 0 3.63.65 5 1.91l3.75-3.75C18.49 1.24 15.48 0 12 0 7.31 0 3.26 2.69 1.25 6.64L5.16 9.7C6.07 6.94 8.79 5.04 12 5.04z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.51 12.3c0-.82-.07-1.61-.21-2.37H12v4.51h6.47c-.28 1.49-1.13 2.76-2.4 3.6l3.72 2.89c2.18-2.01 3.44-4.97 3.44-8.63z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.16 14.3c-.23-.69-.36-1.44-.36-2.3s.13-1.61.36-2.3L1.25 6.64c-.81 1.6-1.25 3.39-1.25 5.36s.44 3.76 1.25 5.36L5.16 14.3z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.72-2.89c-1.11.75-2.52 1.19-4.23 1.19-3.21 0-5.93-2.16-6.9-5.11L1.25 17.36C3.26 21.31 7.31 24 12 24z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-black text-slate-800 tracking-tight">Login with Google</span>
              </>
            )}
          </button>

          <footer className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Secure Access Verified</p>
            </div>
            <p className="text-[10px] text-slate-400 text-center font-bold">
              Account verification based on academy records.
            </p>
          </footer>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
         <p className="text-indigo-300 font-bold text-xs uppercase tracking-widest">© 2024 Science Coaching Academy Karak • Created by X.4.MV</p>
      </div>
    </div>
  );
}
