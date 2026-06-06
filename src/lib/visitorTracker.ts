import { db, handleFirestoreError, OperationType } from './firebase.ts';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface VisitorInfo {
  userAgent: string;
  device: string;
  os: string;
  browser: string;
  language: string;
  screenResolution: string;
  firstVisit: string;
  lastActive: string;
}

// Simple and reliable parser for visitor device & system info
function getVisitorDetails(): Omit<VisitorInfo, 'firstVisit' | 'lastActive'> {
  const ua = navigator.userAgent;
  const language = navigator.language || 'unknown';
  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  // OS detection
  let os = 'Unknown OS';
  if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Macintosh/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';

  // Browser detection
  let browser = 'Unknown Browser';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/OPR/i.test(ua) || /Opera/i.test(ua)) browser = 'Opera';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/MSIE|Trident/i.test(ua)) browser = 'Internet Explorer';

  // Device detection
  let device = 'Desktop';
  const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|PlayBook|Silk/i.test(ua) || (isMobile && !/Mobi/i.test(ua));

  if (isTablet) {
    device = 'Tablet';
  } else if (isMobile) {
    device = 'Mobile';
  }

  return {
    userAgent: ua,
    device,
    os,
    browser,
    language,
    screenResolution,
  };
}

export async function trackVisitor() {
  if (typeof window === 'undefined') return;

  const storageKey = 'sca_visitor_id';
  let visitorId = localStorage.getItem(storageKey);

  if (!visitorId) {
    const randomPart = Math.random().toString(36).substring(2, 11);
    visitorId = `v_${Date.now()}_${randomPart}`;
    localStorage.setItem(storageKey, visitorId);
  }

  // To prevent constant writing in development or navigation, we session-limit tracking to once per session
  const trackedThisSession = sessionStorage.getItem('sca_tracked_session');
  if (trackedThisSession) {
    // Already tracked in this tab session, we can skip updating database unless we want to update lastActive time.
    // We should still update lastActive occasionally, but doing it once per session is perfectly sufficient and lightweight,
    // or we can allow updating lastActive if say 5 minutes have passed. Let's do once per session to save Firestore quota!
    return;
  }

  const details = getVisitorDetails();
  const now = new Date().toISOString();
  const path = `visitors/${visitorId}`;

  try {
    const docRef = doc(db, 'visitors', visitorId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      await setDoc(docRef, {
        ...details,
        firstVisit: existingData.firstVisit || now,
        lastActive: now,
      });
    } else {
      await setDoc(docRef, {
        ...details,
        firstVisit: now,
        lastActive: now,
      });
    }
    
    sessionStorage.setItem('sca_tracked_session', 'true');
  } catch (error) {
    // Graceful tracking fallback: log or throw matching specific guidelines
    console.error('Visitor tracking failed: ', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch (e) {
      // Catching so it doesn't break app experience for public visitors
    }
  }
}
