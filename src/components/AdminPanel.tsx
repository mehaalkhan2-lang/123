import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Send, Users, BellRing, X, LogIn, 
  Monitor, Smartphone, Tablet, Globe, Clock, 
  Cpu, Layout, ChevronDown, ChevronUp, Search, RefreshCw,
  Bug, Volume2, Upload, Trash2
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.tsx';

export default function AdminPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, login, isAdmin, loading } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Visitor Tracking States
  const [visitors, setVisitors] = useState<any[]>([]);
  const [visitorsLoading, setVisitorsLoading] = useState(true);
  const [visitorsError, setVisitorsError] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [deviceFilter, setDeviceFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Bug Custom Audio Link State
  const [soundUrl, setSoundUrl] = useState(() => {
    return localStorage.getItem('sca_bug_sound_url') || '';
  });
  const [crawlSoundUrl1, setCrawlSoundUrl1] = useState(() => {
    return localStorage.getItem('sca_bug_crawl_sound_url_1') || localStorage.getItem('sca_bug_crawl_sound_url') || '';
  });
  const [crawlSoundUrl2, setCrawlSoundUrl2] = useState(() => {
    return localStorage.getItem('sca_bug_crawl_sound_url_2') || '';
  });
  const [crawlSoundUrl3, setCrawlSoundUrl3] = useState(() => {
    return localStorage.getItem('sca_bug_crawl_sound_url_3') || '';
  });

  const handleSoundUrlChange = (url: string) => {
    setSoundUrl(url);
    localStorage.setItem('sca_bug_sound_url', url);
    window.dispatchEvent(new CustomEvent('sca-bug-sound-updated'));
  };

  const handleCrawlSoundUrlChange = (url: string, index: 1 | 2 | 3) => {
    if (index === 1) {
      setCrawlSoundUrl1(url);
      localStorage.setItem('sca_bug_crawl_sound_url_1', url);
      localStorage.setItem('sca_bug_crawl_sound_url', url); // fallback
    } else if (index === 2) {
      setCrawlSoundUrl2(url);
      localStorage.setItem('sca_bug_crawl_sound_url_2', url);
    } else if (index === 3) {
      setCrawlSoundUrl3(url);
      localStorage.setItem('sca_bug_crawl_sound_url_3', url);
    }
    window.dispatchEvent(new CustomEvent('sca-bug-sound-updated'));
  };

  const handleSoundFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'crawl1' | 'crawl2' | 'crawl3' | 'squish') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.2 * 1024 * 1024) {
        alert("The selected audio file is too large! Please utilize a file under 2.2 MB to guarantee optimal browser performance and space.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          if (type === 'crawl1') {
            handleCrawlSoundUrlChange(base64, 1);
          } else if (type === 'crawl2') {
            handleCrawlSoundUrlChange(base64, 2);
          } else if (type === 'crawl3') {
            handleCrawlSoundUrlChange(base64, 3);
          } else {
            handleSoundUrlChange(base64);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch visitors
  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    setVisitorsLoading(true);
    const path = 'visitors';
    const q = query(collection(db, path), orderBy('lastActive', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVisitors(data);
      setVisitorsLoading(false);
      setVisitorsError(null);
    }, (error) => {
      console.error('Failed to fetch visitors:', error);
      setVisitorsLoading(false);
      setVisitorsError(error.message);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        // Suppress or handle JSON structured error
      }
    });

    return unsubscribe;
  }, [isOpen, isAdmin]);

  const sendNotification = async () => {
    if (!title || !body) return;
    setIsSending(true);
    setStatus('Sending to victims...');

    const path = 'broadcasts';
    try {
      await addDoc(collection(db, path), {
        title,
        body,
        sentAt: new Date().toISOString(),
        sender: user?.email
      });

      setStatus('Successfully broadcasted to Hall of Regrets!');
      setTimeout(() => {
        setStatus(null);
        setTitle('');
        setBody('');
      }, 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSending(false);
    }
  };

  // Stats derivation
  const totalVisitors = visitors.length;
  const mobileCount = visitors.filter(v => v.device?.toLowerCase() === 'mobile').length;
  const tabletCount = visitors.filter(v => v.device?.toLowerCase() === 'tablet').length;
  const desktopCount = visitors.filter(v => v.device?.toLowerCase() === 'desktop').length;

  const osMap = visitors.reduce((acc: Record<string, number>, v) => {
    const os = v.os || 'Unknown OS';
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {});

  const browserMap = visitors.reduce((acc: Record<string, number>, v) => {
    const b = v.browser || 'Unknown Browser';
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});

  // Sortable maps
  const osSorted = (Object.entries(osMap) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const browserSorted = (Object.entries(browserMap) as [string, number][]).sort((a, b) => b[1] - a[1]);

  // Filter visitors
  const filteredVisitors = visitors.filter(v => {
    const matchesDevice = deviceFilter === 'ALL' || v.device?.toUpperCase() === deviceFilter;
    const searchString = `${v.os} ${v.browser} ${v.userAgent} ${v.language} ${v.screenResolution}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesDevice && matchesSearch;
  });

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile':
        return <Smartphone size={16} className="text-accent" />;
      case 'tablet':
        return <Tablet size={16} className="text-secondary" />;
      default:
        return <Monitor size={16} className="text-blue-400" />;
    }
  };

  if (isOpen && loading) {
    return (
      <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (isOpen && !user) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 text-center"
        >
           <div className="max-w-md">
             <Shield size={64} className="mx-auto text-primary mb-6" />
             <h2 className="text-3xl font-serif font-black text-white mb-4 italic">IDENTIFICATION REQUIRED</h2>
             <p className="text-white/60 mb-8">You must be logged in to access the High Command panel. Only authorized SCA staff can broadcast chaos.</p>
             <div className="flex flex-col gap-4">
               <button 
                 onClick={login}
                 className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark transition-all"
               >
                 <LogIn size={18} />
                 Sign in with Google
               </button>
               <button onClick={onClose} className="px-8 py-3 text-white/40 hover:text-white font-black uppercase tracking-widest transition-colors">Abort Mission</button>
             </div>
           </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (isOpen && !isAdmin) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 text-center"
        >
           <div className="max-w-md">
             <Shield size={64} className="mx-auto text-primary mb-6" />
             <h2 className="text-3xl font-serif font-black text-white mb-4 italic">ACCESS DENIED</h2>
             <p className="text-white/60 mb-2">Authenticated as: <span className="text-white font-bold">{user?.email}</span></p>
             <p className="text-white/60 mb-8">This account is not in the SCA High Command list. Only the specified admin ({'mehaalkhan.2@gmail.com'}) can perform this action.</p>
             <button onClick={onClose} className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl">Go back to your misery</button>
           </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          className="fixed inset-y-0 left-0 w-full max-w-xl bg-primary-dark text-white shadow-2xl z-[200] p-8 md:p-12 overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>

          <header className="mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4 mb-2">
              <Shield className="text-accent" size={32} />
              <h2 className="text-2xl font-serif font-black uppercase tracking-tight">SCA High Command</h2>
            </div>
            <p className="text-white/40 text-sm">Broadcasting confusion & tracking active devices.</p>
          </header>

          <div className="space-y-6">
            {/* BROADCAST CONNOTATION BLOCK */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <BellRing size={18} className="text-accent" />
                Broadcast Notification
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5">Message Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. FEE HIKE INBOUND!"
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5">Detailed Confusion</label>
                  <textarea 
                    rows={3}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Describe the disaster..."
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>

                <button 
                  onClick={sendNotification}
                  disabled={isSending || !title || !body}
                  className="w-full bg-accent text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSending ? 'Transmitting Chaos...' : 'Dispatch Disaster'}
                  <Send size={14} />
                </button>

                {status && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-[10px] font-bold text-accent tracking-widest"
                  >
                    {status}
                  </motion.p>
                )}
              </div>
            </div>

            {/* VISITOR INTELLIGENCE OVERVIEW */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Users size={18} className="text-accent" />
                  Visitor Intelligence
                </h3>
                {visitorsLoading && (
                  <RefreshCw size={14} className="text-white/40 animate-spin" />
                )}
              </div>

              {visitorsError ? (
                <p className="text-red-400 text-xs">Error loading visitors: {visitorsError}</p>
              ) : (
                <div className="space-y-6">
                  {/* Summary Metric Bento Row */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center col-span-1">
                      <span className="block text-[9px] font-black uppercase tracking-widest text-white/40">Total</span>
                      <span className="text-xl font-bold font-mono text-accent">{totalVisitors}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center col-span-1">
                      <span className="block text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center justify-center gap-0.5"><Monitor size={10} /> Desk</span>
                      <span className="text-lg font-bold font-mono text-blue-400">{desktopCount}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center col-span-1">
                      <span className="block text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center justify-center gap-0.5"><Smartphone size={10} /> Mob</span>
                      <span className="text-lg font-bold font-mono text-accent">{mobileCount}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center col-span-1">
                      <span className="block text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center justify-center gap-0.5"><Tablet size={10} /> Tab</span>
                      <span className="text-lg font-bold font-mono text-secondary">{tabletCount}</span>
                    </div>
                  </div>

                  {/* Device share bar */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Device Share Distribution</span>
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex text-center font-mono text-[8px] font-bold">
                      {totalVisitors === 0 ? (
                        <div className="h-full w-full bg-white/20 flex items-center justify-center text-white/40">No tracked telemetry</div>
                      ) : (
                        <>
                          {desktopCount > 0 && (
                            <div 
                              style={{ width: `${(desktopCount / totalVisitors) * 100}%` }}
                              className="bg-blue-500 h-full flex items-center justify-center text-white"
                              title={`Desktop: ${desktopCount}`}
                            >
                              {Math.round((desktopCount / totalVisitors) * 100)}%
                            </div>
                          )}
                          {mobileCount > 0 && (
                            <div 
                              style={{ width: `${(mobileCount / totalVisitors) * 100}%` }}
                              className="bg-accent h-full flex items-center justify-center text-white"
                              title={`Mobile: ${mobileCount}`}
                            >
                              {Math.round((mobileCount / totalVisitors) * 100)}%
                            </div>
                          )}
                          {tabletCount > 0 && (
                            <div 
                              style={{ width: `${(tabletCount / totalVisitors) * 100}%` }}
                              className="bg-secondary h-full flex items-center justify-center text-white"
                              title={`Tablet: ${tabletCount}`}
                            >
                              {Math.round((tabletCount / totalVisitors) * 100)}%
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Operational Systems & Browser Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* OS List */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1">
                        <Cpu size={12} /> Operating Systems
                      </span>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {osSorted.length === 0 ? (
                          <div className="text-xs text-white/40 italic">Waiting...</div>
                        ) : (
                          osSorted.slice(0, 5).map(([os, count]) => {
                            const percent = totalVisitors ? Math.round((count / totalVisitors) * 100) : 0;
                            return (
                              <div key={os} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-white/80">{os}</span>
                                  <span className="font-mono text-white/40">{count} ({percent}%)</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    style={{ width: `${percent}%` }}
                                    className="bg-blue-400 h-full rounded-full"
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Browsers list */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1">
                        <Layout size={12} /> Browsers
                      </span>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {browserSorted.length === 0 ? (
                          <div className="text-xs text-white/40 italic">Waiting...</div>
                        ) : (
                          browserSorted.slice(0, 5).map(([browser, count]) => {
                            const percent = totalVisitors ? Math.round((count / totalVisitors) * 100) : 0;
                            return (
                              <div key={browser} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-white/80">{browser}</span>
                                  <span className="font-mono text-white/40">{count} ({percent}%)</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    style={{ width: `${percent}%` }}
                                    className="bg-accent h-full rounded-full"
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Logs section */}
                  <div className="pt-2 border-t border-white/10">
                    <button 
                      onClick={() => setShowLog(!showLog)}
                      className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-accent hover:text-white transition-colors"
                    >
                      <span>Show Decrypted Tracker Logs ({filteredVisitors.length} / {totalVisitors})</span>
                      {showLog ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    <AnimatePresence>
                      {showLog && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4 space-y-4"
                        >
                          {/* Search and Filters */}
                          <div className="flex flex-col gap-2 md:flex-row">
                            <div className="relative flex-1">
                              <span className="absolute inset-y-0 left-3 flex items-center text-white/40">
                                <Search size={12} />
                              </span>
                              <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search logs..."
                                className="w-full bg-white/10 border border-white/10 rounded-xl pl-8 pr-4 py-1.5 text-xs focus:outline-none focus:border-accent"
                              />
                            </div>
                            <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                              {['ALL', 'DESKTOP', 'MOBILE', 'TABLET'].map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setDeviceFilter(cat)}
                                  className={`px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all ${
                                    deviceFilter === cat 
                                      ? 'bg-accent text-white' 
                                      : 'text-white/40 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* List of visitors */}
                          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {filteredVisitors.length === 0 ? (
                              <p className="text-center text-xs text-white/40 italic py-4">No matching victims spotted.</p>
                            ) : (
                              filteredVisitors.map((v) => {
                                const formattedLastActive = new Date(v.lastActive).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });
                                return (
                                  <div key={v.id} className="bg-white/5 hover:bg-white/10 border border-white/5 p-3.5 rounded-2xl space-y-2 text-xs transition-colors">
                                    <div className="flex items-center justify-between gap-1">
                                      <div className="flex items-center gap-2">
                                        {getDeviceIcon(v.device)}
                                        <span className="font-bold text-white/90">{v.browser} on {v.os}</span>
                                      </div>
                                      <span className="font-mono text-[9px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                                        {v.id.slice(0, 10)}...
                                      </span>
                                    </div>

                                    {/* Tech details */}
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-white/50 border-t border-white/5 pt-1.5">
                                      <span className="flex items-center gap-1">
                                        <Globe size={10} className="text-white/30" />
                                        {v.language} | {v.screenResolution}
                                      </span>
                                      <span className="flex items-center gap-1 justify-end text-right">
                                        <Clock size={10} className="text-white/30" />
                                        Active: {formattedLastActive}
                                      </span>
                                    </div>
                                    <div className="text-[9px] font-mono text-white/30 truncate" title={v.userAgent}>
                                      UA: {v.userAgent}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* ACADEMIC INFESTATION CONTROL */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                <Bug size={18} className="text-accent animate-pulse" />
                Academic Infestation Control
              </h3>
              <p className="text-white/40 text-xs mb-5">Configure custom pest vector audio effects for crawling bugs.</p>

              <div className="space-y-6">
                {/* 1. Crawl Sounds (Sound 1) - 3 customizable slots */}
                <div className="space-y-4 border-b border-white/5 pb-5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-[#E11D48] flex items-center gap-1.5 animate-pulse">
                      <Volume2 size={13} /> Sound 1: Insect Entrance & Crawling Sound (3 Slots)
                    </label>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed -mt-2">
                    Upload or specify up to 3 separate crawling sounds. Crawling pests will automatically choose one of the active slots at random!
                  </p>

                  <div className="space-y-3.5">
                    {/* Slot 1 */}
                    <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-white/60">🔊 Sound 1 - Slot A</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="relative">
                          <input 
                            type="file"
                            id="crawl-sound-upload-1"
                            accept="audio/*"
                            onChange={(e) => handleSoundFileUpload(e, 'crawl1')}
                            className="sr-only"
                          />
                          <label 
                            htmlFor="crawl-sound-upload-1"
                            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-white/20 hover:border-accent/50 rounded-xl bg-white/5 hover:bg-white/15 cursor-pointer transition-all text-[11px] text-white/80 font-bold"
                          >
                            <Upload size={12} className="text-accent" />
                            Choose Audio...
                          </label>
                        </div>
                        <input 
                          type="url" 
                          value={crawlSoundUrl1.startsWith('data:') ? '' : crawlSoundUrl1}
                          onChange={(e) => handleCrawlSoundUrlChange(e.target.value, 1)}
                          placeholder="Or paste sound link..."
                          disabled={crawlSoundUrl1.startsWith('data:')}
                          className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-accent disabled:opacity-50 transition-colors"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-medium p-1.5 rounded-lg bg-black/25">
                        <span className="truncate pr-2 max-w-[85%] text-[10px]">
                          {crawlSoundUrl1 ? (
                            crawlSoundUrl1.startsWith('data:') ? (
                              <span className="text-accent flex items-center gap-1">📂 Device Audio File Loaded</span>
                            ) : (
                              <span className="text-blue-400 flex items-center gap-1 truncate">🔗 {crawlSoundUrl1}</span>
                            )
                          ) : (
                            <span className="text-white/30">⚪ Slot Empty (Silent)</span>
                          )}
                        </span>
                        {crawlSoundUrl1 && (
                          <button 
                            type="button"
                            onClick={() => handleCrawlSoundUrlChange('', 1)}
                            className="text-white/40 hover:text-red-400 p-1 rounded hover:bg-white/10 transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Slot 2 */}
                    <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-white/60">🔊 Sound 1 - Slot B</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="relative">
                          <input 
                            type="file"
                            id="crawl-sound-upload-2"
                            accept="audio/*"
                            onChange={(e) => handleSoundFileUpload(e, 'crawl2')}
                            className="sr-only"
                          />
                          <label 
                            htmlFor="crawl-sound-upload-2"
                            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-white/20 hover:border-accent/50 rounded-xl bg-white/5 hover:bg-white/15 cursor-pointer transition-all text-[11px] text-white/80 font-bold"
                          >
                            <Upload size={12} className="text-accent" />
                            Choose Audio...
                          </label>
                        </div>
                        <input 
                          type="url" 
                          value={crawlSoundUrl2.startsWith('data:') ? '' : crawlSoundUrl2}
                          onChange={(e) => handleCrawlSoundUrlChange(e.target.value, 2)}
                          placeholder="Or paste sound link..."
                          disabled={crawlSoundUrl2.startsWith('data:')}
                          className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-accent disabled:opacity-50 transition-colors"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-medium p-1.5 rounded-lg bg-black/25">
                        <span className="truncate pr-2 max-w-[85%] text-[10px]">
                          {crawlSoundUrl2 ? (
                            crawlSoundUrl2.startsWith('data:') ? (
                              <span className="text-accent flex items-center gap-1">📂 Device Audio File Loaded</span>
                            ) : (
                              <span className="text-blue-400 flex items-center gap-1 truncate">🔗 {crawlSoundUrl2}</span>
                            )
                          ) : (
                            <span className="text-white/30">⚪ Slot Empty (Silent)</span>
                          )}
                        </span>
                        {crawlSoundUrl2 && (
                          <button 
                            type="button"
                            onClick={() => handleCrawlSoundUrlChange('', 2)}
                            className="text-white/40 hover:text-red-400 p-1 rounded hover:bg-white/10 transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Slot 3 */}
                    <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-white/60">🔊 Sound 1 - Slot C</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="relative">
                          <input 
                            type="file"
                            id="crawl-sound-upload-3"
                            accept="audio/*"
                            onChange={(e) => handleSoundFileUpload(e, 'crawl3')}
                            className="sr-only"
                          />
                          <label 
                            htmlFor="crawl-sound-upload-3"
                            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-white/20 hover:border-accent/50 rounded-xl bg-white/5 hover:bg-white/15 cursor-pointer transition-all text-[11px] text-white/80 font-bold"
                          >
                            <Upload size={12} className="text-accent" />
                            Choose Audio...
                          </label>
                        </div>
                        <input 
                          type="url" 
                          value={crawlSoundUrl3.startsWith('data:') ? '' : crawlSoundUrl3}
                          onChange={(e) => handleCrawlSoundUrlChange(e.target.value, 3)}
                          placeholder="Or paste sound link..."
                          disabled={crawlSoundUrl3.startsWith('data:')}
                          className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-accent disabled:opacity-50 transition-colors"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-medium p-1.5 rounded-lg bg-black/25">
                        <span className="truncate pr-2 max-w-[85%] text-[10px]">
                          {crawlSoundUrl3 ? (
                            crawlSoundUrl3.startsWith('data:') ? (
                              <span className="text-accent flex items-center gap-1">📂 Device Audio File Loaded</span>
                            ) : (
                              <span className="text-blue-400 flex items-center gap-1 truncate">🔗 {crawlSoundUrl3}</span>
                            )
                          ) : (
                            <span className="text-white/30">⚪ Slot Empty (Silent)</span>
                          )}
                        </span>
                        {crawlSoundUrl3 && (
                          <button 
                            type="button"
                            onClick={() => handleCrawlSoundUrlChange('', 3)}
                            className="text-white/40 hover:text-red-400 p-1 rounded hover:bg-white/10 transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Click Squish Sound URL & Upload */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1">
                    <Volume2 size={11} /> Sound 2: Click Squish / Death Sound
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Device Upload Button */}
                    <div className="relative">
                      <input 
                        type="file"
                        id="squish-sound-upload"
                        accept="audio/*"
                        onChange={(e) => handleSoundFileUpload(e, 'squish')}
                        className="sr-only"
                      />
                      <label 
                        htmlFor="squish-sound-upload"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-white/20 hover:border-accent/50 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all text-xs text-white/80 font-semibold"
                      >
                        <Upload size={14} className="text-accent" />
                        Choose Audio File...
                      </label>
                    </div>

                    {/* Quick URL paste fallback */}
                    <input 
                      type="url" 
                      value={soundUrl.startsWith('data:') ? '' : soundUrl}
                      onChange={(e) => handleSoundUrlChange(e.target.value)}
                      placeholder="Or paste sound link..."
                      disabled={soundUrl.startsWith('data:')}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-accent disabled:opacity-50 transition-colors"
                    />
                  </div>

                  {/* Status Indicator Bar */}
                  <div className="flex items-center justify-between text-[10px] font-medium p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="truncate pr-2">
                      {soundUrl ? (
                        soundUrl.startsWith('data:') ? (
                          <span className="text-accent flex items-center gap-1">📂 Loaded: Custom uploaded device audio file</span>
                        ) : (
                          <span className="text-blue-400 flex items-center gap-1">🔗 Web Link: {soundUrl}</span>
                        )
                      ) : (
                        <span className="text-white/40">⚡ Synthesized: Dynamic Web Audio pop sounds</span>
                      )}
                    </span>
                    {soundUrl && (
                      <button 
                        onClick={() => handleSoundUrlChange('')}
                        className="text-white/40 hover:text-red-400 p-1 rounded hover:bg-white/10 transition-colors"
                        title="Remove Audio"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  <p className="text-[9px] text-white/30 leading-relaxed pt-1">
                    Left blank, the system automatically triggers synthesized cartoon/organic pop audio triggers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
