importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAY8oXo05DRReVHjPhosWZ1jbXV13MZoQM",
  authDomain: "auth-pm-aa819.firebaseapp.com",
  projectId: "auth-pm-aa819",
  messagingSenderId: "992040916835",
  appId: "1:992040916835:web:7993bb66bec32ac7206556"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});