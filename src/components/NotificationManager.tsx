import React, { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db, auth, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { doc, setDoc, collection } from 'firebase/firestore';

export default function NotificationManager() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      if (!messaging) return;

      try {
        if (typeof Notification === 'undefined') return;
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // You need a VAPID key from Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
          // I will use a placeholder and tell the user to replace it.
          const currentToken = await getToken(messaging, { 
            vapidKey: 'BLYU5oB4HTz-8HUESaZFVkFx_us2fjeZtcemcKbL6jIyBRLmkD_9EUPADXvHvG4_jJ9fQ6dZQZ-IJAeR8RFP15E' 
          });
          
          if (currentToken) {
            setToken(currentToken);
            // Store token in Firestore
            const path = 'push_tokens';
            try {
              await setDoc(doc(collection(db, path), currentToken), {
                token: currentToken,
                updatedAt: new Date().toISOString(),
                uid: auth.currentUser?.uid || 'anonymous'
              });
              console.log('FCM Token registered:', currentToken);
            } catch (fsErr) {
              handleFirestoreError(fsErr, OperationType.WRITE, path);
            }
          }
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    // We can trigger this after a delay or on user action
    // For now, let's just listen for a custom event
    const handleRequest = () => requestPermission();
    window.addEventListener('request-fcm-token', handleRequest);

    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        // Show a custom toast or notification if app is in foreground
        if (typeof Notification !== 'undefined') {
          new Notification(payload.notification?.title || 'SCA Alert', {
            body: payload.notification?.body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233508.png'
          });
        }
      });
    }

    return () => window.removeEventListener('request-fcm-token', handleRequest);
  }, []);

  return null;
}
