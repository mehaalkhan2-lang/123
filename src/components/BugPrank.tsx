import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase.ts';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// Static placeholder if database hasn't loaded or is empty
import musanifImg from '../assets/images/regenerated_image_1778053842480.png';
import campusLifeImg from '../assets/images/regenerated_image_1778054334747.png';

interface Bug {
  id: string;
  url: string;
  size: number;
  x: number;
  y: number;
  tx: number; // Target X
  ty: number; // Target Y
  angle: number;
  speed: number;
  state: 'crawling' | 'squished';
  corner: 'TL' | 'TR' | 'BL' | 'BR';
  legWiggle: number;
}

interface Splat {
  id: string;
  x: number;
  y: number;
  url: string;
  angle: number;
  size: number;
}

export default function BugPrank() {
  const [images] = useState<string[]>([musanifImg]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [splats, setSplats] = useState<Splat[]>([]);

  const bugsRef = useRef<Bug[]>([]);
  useEffect(() => {
    bugsRef.current = bugs;
  }, [bugs]);

  const spawnTimeoutRef = useRef<any>(null);
  
  // Custom sound path variable (localStorage allows easily inserting custom paths)
  const [customSoundUrl, setCustomSoundUrl] = useState<string>(() => {
    return localStorage.getItem('sca_bug_sound_url') || '';
  });
  const [customCrawlSoundUrls, setCustomCrawlSoundUrls] = useState<string[]>(() => {
    const s1 = localStorage.getItem('sca_bug_crawl_sound_url_1') || localStorage.getItem('sca_bug_crawl_sound_url') || '';
    const s2 = localStorage.getItem('sca_bug_crawl_sound_url_2') || '';
    const s3 = localStorage.getItem('sca_bug_crawl_sound_url_3') || '';
    return [s1, s2, s3].filter(Boolean);
  });

  const crawlAudioRef = useRef<HTMLAudioElement | null>(null);

  const playCrawlActiveSound = () => {
    try {
      const s1 = localStorage.getItem('sca_bug_crawl_sound_url_1') || localStorage.getItem('sca_bug_crawl_sound_url') || '';
      const s2 = localStorage.getItem('sca_bug_crawl_sound_url_2') || '';
      const s3 = localStorage.getItem('sca_bug_crawl_sound_url_3') || '';
      const activeUrls = [s1, s2, s3].filter(Boolean);

      if (activeUrls.length > 0) {
        if (crawlAudioRef.current) {
          crawlAudioRef.current.pause();
        }
        // Choose one of the 3 slots randomly!
        const chosenUrl = activeUrls[Math.floor(Math.random() * activeUrls.length)];
        const audio = new Audio(chosenUrl);
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch((err) => {
          console.warn("Autoplay crawling audio block or error:", err);
        });
        crawlAudioRef.current = audio;
      }
    } catch (e) {
      console.warn("Error playing crawling audio:", e);
    }
  };

  const stopCrawlActiveSound = () => {
    try {
      if (crawlAudioRef.current) {
        crawlAudioRef.current.pause();
        crawlAudioRef.current = null;
      }
    } catch (e) {
      console.warn("Error stopping crawling audio:", e);
    }
  };

  useEffect(() => {
    return () => {
      stopCrawlActiveSound();
    };
  }, []);

  // Track window resizing safely
  const dimensions = useRef({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      dimensions.current = { width: window.innerWidth, height: window.innerHeight };
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Web Audio API Sound Synthesizer Fallback - produces a cartoon pop/squish sound on click
  const playSynthesizedSquish = () => {
    try {
      // Check if custom audio URL is set and plays
      if (customSoundUrl) {
        const audio = new Audio(customSoundUrl);
        audio.volume = 0.8;
        audio.play().catch(() => {
          // Fallback to synth if custom path is blocked/broken
          generateSynthSplat();
        });
      } else {
        generateSynthSplat();
      }
    } catch (e) {
      generateSynthSplat();
    }
  };

  const generateSynthSplat = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      const audioCtx = new AudioContextClass();
      
      // Node 1: Juicy low squish sweep
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.25);
      
      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);

      // Node 2: High friction pop
      const oscPop = audioCtx.createOscillator();
      const gainPop = audioCtx.createGain();
      
      oscPop.type = 'sine';
      oscPop.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscPop.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.12);
      
      gainPop.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gainPop.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.12);
      
      oscPop.connect(gainPop);
      gainPop.connect(audioCtx.destination);
      oscPop.start();
      oscPop.stop(audioCtx.currentTime + 0.12);

    } catch (err) {
      console.warn("FCM / Web Audio interaction restricted: ", err);
    }
  };

  // Helper to spawn a bug at a specified or random corner
  const spawnBug = (forcedCorner?: 'TL' | 'TR' | 'BL' | 'BR') => {
    if (images.length === 0) return;

    // Limit to exactly 1 active crawling bug at a time
    const activeBugExists = bugsRef.current.some(b => b.state === 'crawling');
    if (activeBugExists) {
      return;
    }

    const corners: ('TL' | 'TR' | 'BL' | 'BR')[] = ['TL', 'TR', 'BL', 'BR'];
    const chosenCorner = forcedCorner || corners[Math.floor(Math.random() * corners.length)];
    const w = dimensions.current.width;
    const h = dimensions.current.height;

    // Determine coordinate based on corner
    let startX = 0;
    let startY = 0;
    switch (chosenCorner) {
      case 'TL': startX = -60; startY = -60; break;
      case 'TR': startX = w + 60; startY = -60; break;
      case 'BL': startX = -60; startY = h + 60; break;
      case 'BR': startX = w + 60; startY = h + 60; break;
    }

    // Bug size and attributes
    const size = Math.floor(Math.random() * 45) + 40; // 40px to 85px
    const randomImage = images[Math.floor(Math.random() * images.length)];
    const id = `bug_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Initial bug trajectory scuttles toward screen center with mild offset
    const targetX = w / 2 + (Math.random() * 200 - 100);
    const targetY = h / 2 + (Math.random() * 200 - 100);

    const initialAngle = Math.atan2(targetY - startY, targetX - startX) * (180 / Math.PI) + 90;

    const newBug: Bug = {
      id,
      url: randomImage,
      size,
      x: startX,
      y: startY,
      tx: targetX,
      ty: targetY,
      angle: initialAngle,
      speed: Math.random() * 1.5 + 1.2, // 1.2 to 2.7px per tick
      state: 'crawling',
      corner: chosenCorner,
      legWiggle: 0,
    };

    // Start Crawl Sound active loop if configured
    playCrawlActiveSound();
    
    setBugs(prev => [...prev, newBug]);
  };

  // Listen to manual triggers from High Command panel
  useEffect(() => {
    const handleManualSpawn = (e: any) => {
      spawnBug(e.detail?.corner);
    };
    const handleSoundLinkChange = () => {
      setCustomSoundUrl(localStorage.getItem('sca_bug_sound_url') || '');
      const s1 = localStorage.getItem('sca_bug_crawl_sound_url_1') || localStorage.getItem('sca_bug_crawl_sound_url') || '';
      const s2 = localStorage.getItem('sca_bug_crawl_sound_url_2') || '';
      const s3 = localStorage.getItem('sca_bug_crawl_sound_url_3') || '';
      setCustomCrawlSoundUrls([s1, s2, s3].filter(Boolean));
    };

    window.addEventListener('spawn-bug', handleManualSpawn);
    window.addEventListener('sca-bug-sound-updated', handleSoundLinkChange);

    return () => {
      window.removeEventListener('spawn-bug', handleManualSpawn);
      window.removeEventListener('sca-bug-sound-updated', handleSoundLinkChange);
    };
  }, [images, customSoundUrl, customCrawlSoundUrls]);

  // Initial spawn soon after mounting, and cleanup timers on unmount
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      spawnBug();
    }, 5000);

    return () => {
      clearTimeout(initialDelay);
      if (spawnTimeoutRef.current) {
        clearTimeout(spawnTimeoutRef.current);
      }
    };
  }, [images]);

  // Core Bug scuttling simulation tick loop (60fps animation loop)
  useEffect(() => {
    let animFrameId: number;

    const updateBugs = () => {
      setBugs(prevBugs => {
        if (prevBugs.length === 0) return prevBugs;

        return prevBugs.map(bug => {
          if (bug.state === 'squished') return bug; // gravity falls handles squished offline

          // Calculate distance to target
          const dx = bug.tx - bug.x;
          const dy = bug.ty - bug.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Leg wiggle frequency
          const legWiggle = (bug.legWiggle + 1) % 360;

          if (dist < 15) {
            // Pick a new random target inside the viewport margins
            const pad = 100;
            const tx = Math.random() * (dimensions.current.width - pad * 2) + pad;
            const ty = Math.random() * (dimensions.current.height - pad * 2) + pad;
            const angle = Math.atan2(ty - bug.y, tx - bug.x) * (180 / Math.PI) + 90;
            return {
              ...bug,
              tx,
              ty,
              angle,
              legWiggle,
              // Random rest or rush speed changes
              speed: Math.random() < 0.25 ? 0.3 : Math.random() * 2 + 1.2
            };
          }

          // Move step towards target
          const ratio = Math.min(1, bug.speed / dist);
          const nextX = bug.x + dx * ratio;
          const nextY = bug.y + dy * ratio;

          // Tiny erratic wiggle offset for crawling organic effect
          const wiggleAngle = Math.sin(legWiggle * 0.15) * 4;

          return {
            ...bug,
            x: nextX,
            y: nextY,
            angle: bug.angle,
            legWiggle,
          };
        });
      });

      animFrameId = requestAnimationFrame(updateBugs);
    };

    animFrameId = requestAnimationFrame(updateBugs);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  // Handle clicking on a crawling bug and squashing it
  const handleSquish = (bug: Bug) => {
    if (bug.state === 'squished') return;

    // 1. Play POP sound
    playSynthesizedSquish();

    // 2. Stop Crawl Sound list loop active
    stopCrawlActiveSound();

    // 3. Add splat stain residue where it died
    const splatId = `splat_${Date.now()}`;
    const newSplat: Splat = {
      id: splatId,
      x: bug.x,
      y: bug.y,
      url: bug.url,
      angle: bug.angle + (Math.random() * 30 - 15),
      size: bug.size * 1.1,
    };
    setSplats(prev => [...prev, newSplat]);

    // Clean up splats after 24 seconds so they don't leak memory
    setTimeout(() => {
      setSplats(prev => prev.filter(s => s.id !== splatId));
    }, 24000);

    // 4. Set bug state to squished to animate gravity falling, then remove
    setBugs(prev => prev.map(b => b.id === bug.id ? { ...b, state: 'squished' } : b));

    setTimeout(() => {
      setBugs(prev => prev.filter(b => b.id !== bug.id));
    }, 1200);

    // 5. Schedule next bug to spawn exactly 20 seconds after death
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
    }
    spawnTimeoutRef.current = setTimeout(() => {
      spawnBug();
    }, 20000);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
      {/* 3. Static squished stains fading away */}
      {splats.map((splat) => (
        <div
          key={splat.id}
          style={{
            position: 'absolute',
            left: splat.x,
            top: splat.y,
            transform: `translate(-50%, -50%) rotate(${splat.angle}deg)`,
            width: `${splat.size}px`,
            height: `${splat.size}px`,
            opacity: 0.7,
          }}
          className="transition-opacity duration-[10000ms]"
        >
          {/* Flattened visual splatter outline */}
          <div className="absolute inset-0 bg-red-600/30 rounded-full blur-[4px] animate-ping duration-1000 origin-center" />
          <img
            src={splat.url}
            alt="Squished Bug Residue"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain filter saturate-150 contrast-125 brightness-50 sepia pointer-events-none"
            style={{ transform: 'scaleY(0.12) scaleX(1.15)' }}
          />
          {/* Funny administrative splat label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-black tracking-wider text-accent bg-background-dark/90 px-1 border border-accent/40 rounded shadow select-none uppercase scale-75 whitespace-nowrap">
            FEE DODGED!
          </div>
        </div>
      ))}

      {/* 4. Live Crawling bugs & falling squished ones */}
      {bugs.map((bug) => {
        const isSquished = bug.state === 'squished';
        // Add oscillating leg rotations for crawl movement look
        const legOscillation = Math.sin(bug.legWiggle * 0.2) * 22;

        return (
          <motion.div
            key={bug.id}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSquish(bug);
            }}
            style={{
              position: 'absolute',
              left: bug.x,
              top: bug.y,
              width: `${bug.size}px`,
              height: `${bug.size}px`,
              zIndex: 1000
            }}
            // Animate squishing, flipping, or standard scuttle wiggle
            animate={
              isSquished
                ? {
                    y: dimensions.current.height + 100,
                    rotate: bug.angle + 180,
                    scaleX: 1.4,
                    scaleY: 0.15,
                    opacity: [1, 0.9, 0],
                    transition: { duration: 1.1, ease: 'easeIn' }
                  }
                : {
                    rotate: bug.angle,
                    scale: [0.95, 1.05, 0.95],
                    transition: { duration: 0.35, repeat: Infinity, ease: 'easeInOut' }
                  }
            }
            className={`cursor-pointer pointer-events-auto transform Origin-center ${
              isSquished ? 'pointer-events-none' : 'hover:scale-110 active:scale-95'
            }`}
          >
            {/* Draw active bug legs */}
            {!isSquished && (
              <div className="absolute inset-0 flex justify-between pointer-events-none opacity-80 scale-90">
                {/* Visual legs group */}
                <div className="w-1.5 h-full flex flex-col justify-around transition-transform" style={{ transform: `rotate(${-legOscillation}deg)` }}>
                  <span className="w-4 h-1 bg-primary-dark rounded-full border-t border-accent" />
                  <span className="w-5 h-1 bg-primary-dark rounded-full border-t border-accent" />
                  <span className="w-4 h-1 bg-primary-dark rounded-full border-t border-accent" />
                </div>
                <div className="w-1.5 h-full flex flex-col justify-around transition-transform" style={{ transform: `rotate(${legOscillation}deg)` }}>
                  <span className="w-4 h-1 bg-primary-dark rounded-full border-t border-accent transform translate-x-[-12px]" />
                  <span className="w-5 h-1 bg-primary-dark rounded-full border-t border-accent transform translate-x-[-16px]" />
                  <span className="w-4 h-1 bg-primary-dark rounded-full border-t border-accent transform translate-x-[-12px]" />
                </div>
              </div>
            )}

            {/* Main Bug Body shell hosting the uploaded image */}
            <div className={`relative w-full h-full rounded-2xl bg-primary border-4 p-1 shadow-lg transition-colors duration-300 ${
              isSquished 
                ? 'border-accent bg-base saturate-50' 
                : 'border-white hover:border-accent bg-primary'
            }`}>
              <img
                src={bug.url}
                alt="Active Academic Bug"
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover rounded-xl pointer-events-none transition-filter duration-300 ${isSquished ? 'grayscale contrast-150' : ''}`}
              />
              
              {/* Cute bug eyes sticking out! */}
              {!isSquished && (
                <div className="absolute top-[-8px] left-[15%] right-[15%] flex justify-between px-1.5 pointer-events-none">
                  <span className="w-3.5 h-3.5 bg-white border border-black rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" />
                  </span>
                  <span className="w-3.5 h-3.5 bg-white border border-black rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" />
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
