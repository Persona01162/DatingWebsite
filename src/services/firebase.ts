import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { createFakeProfiles } from '../utils/fakeProfiles';

const firebaseConfig = {
  apiKey: "AIzaSyAY8oXo05DRReVHjPhosWZ1jbXV13MZoQM",
  authDomain: "auth-pm-aa819.firebaseapp.com",
  projectId: "auth-pm-aa819",
  databaseURL: "https://auth-pm-aa819-default-rtdb.firebaseio.com",
  storageBucket: "auth-pm-aa819.firebasestorage.app",
  messagingSenderId: "992040916835",
  appId: "1:992040916835:web:7993bb66bec32ac7206556"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Initialize fake profiles after Firebase auth is ready
auth.onAuthStateChanged((user) => {
  if (!user) {
    // Only try to create fake profiles if we're not authenticated
    // This prevents permission errors for regular users
    createFakeProfiles().catch(error => {
      console.warn('Skipping fake profile creation:', error.message);
    });
  }
});

export const createUserProfile = async (userId: string, profileData: any) => {
  try {
    const timestamp = new Date().toISOString();
    
    await set(ref(database, `users/${userId}`), {
      username: profileData.username,
      age: profileData.age,
      gender: profileData.gender,
      genderSeeking: profileData.genderSeeking,
      bio: profileData.bio,
      answers: profileData.answers,
      lastActive: timestamp,
      createdAt: timestamp,
      settings: {
        emailNotifications: true,
        profileVisibility: true,
        maxDistance: 50,
        ageRange: {
          min: 18,
          max: 50
        }
      },
      viewedProfiles: [],
      matches: [],
      messages: {}
    });

    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserSettings = async (userId: string, settings: any) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const timestamp = new Date().toISOString();
    
    await update(userRef, { 
      settings,
      lastUpdated: timestamp
    });

    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export const getUserProfiles = async () => {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.entries(data).map(([id, profile]: [string, any]) => ({
        id,
        ...profile
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    throw error;
  }
};

export const addViewedProfile = async (userId: string, viewedId: string) => {
  try {
    const userRef = ref(database, `users/${userId}/viewedProfiles`);
    const timestamp = new Date().toISOString();
    
    await push(userRef, {
      profileId: viewedId,
      viewedAt: timestamp
    });

    return true;
  } catch (error) {
    console.error('Error adding viewed profile:', error);
    throw error;
  }
};

export const createMatch = async (userId: string, matchedId: string) => {
  try {
    const timestamp = new Date().toISOString();
    
    await update(ref(database), {
      [`users/${userId}/matches/${matchedId}`]: {
        matchedAt: timestamp,
        status: 'active'
      },
      [`users/${matchedId}/matches/${userId}`]: {
        matchedAt: timestamp,
        status: 'active'
      }
    });

    return true;
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
  try {
    const timestamp = new Date().toISOString();
    const messageData = {
      senderId,
      content,
      timestamp,
      status: 'sent'
    };

    const chatRef = ref(database, `users/${senderId}/messages/${receiverId}`);
    await push(chatRef, messageData);

    const receiverChatRef = ref(database, `users/${receiverId}/messages/${senderId}`);
    await push(receiverChatRef, messageData);

    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (userId: string, otherId: string) => {
  try {
    const chatRef = ref(database, `users/${userId}/messages/${otherId}`);
    const snapshot = await get(chatRef);
    
    if (snapshot.exists()) {
      const messages = snapshot.val();
      return Object.entries(messages).map(([id, message]: [string, any]) => ({
        id,
        ...message
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};