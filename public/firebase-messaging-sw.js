// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// Note: We need to pull this from the config
// For now, I'll use a placeholder and instruct the user to update it, 
// or I can try to read it from the config file if I can generate it here.

// I will read the senderId from the config file via my thought process.
/* 
Actually, I can't easily read JSON here and put it in a non-module JS file 
unless I hardcode it. But I'll use a generic approach or instruct the user.
Wait, I can use the same firebaseConfig I have.
*/

firebase.initializeApp({
  projectId: "gen-lang-client-0636203738",
  appId: "1:50397708335:web:2f8efa0c6c03aaf87606da",
  apiKey: "AIzaSyCHsFdUmJFwf_WgxUobjiFB-Q6yyoD-P9s",
  authDomain: "gen-lang-client-0636203738.firebaseapp.com",
  storageBucket: "gen-lang-client-0636203738.firebasestorage.app",
  messagingSenderId: "50397708335"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233508.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
