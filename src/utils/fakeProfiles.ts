import { database } from '../services/firebase';
import { ref, set, get } from 'firebase/database';

interface FakeProfile {
  username: string;
  age: number;
  gender: 'female';
  genderSeeking: 'male';
  bio: string;
  answers: {
    hobby: string;
    music: string;
    travel: string;
    food: string;
  };
  lastActive: string;
  createdAt: string;
  settings: {
    emailNotifications: boolean;
    profileVisibility: boolean;
    maxDistance: number;
    ageRange: {
      min: number;
      max: number;
    };
  };
}

const indianFemaleNames = [
  'Aanya', 'Diya', 'Zara', 'Kiara', 'Myra', 'Shanaya', 'Ananya', 'Aisha', 'Riya',
  'Aaradhya', 'Avni', 'Ishani', 'Tara', 'Saanvi', 'Pari', 'Aditi', 'Advika',
  'Ahana', 'Amaira', 'Anvi', 'Aria', 'Avisha', 'Disha', 'Divya', 'Ira', 'Kyra',
  'Mishka', 'Navya', 'Nisha', 'Prisha', 'Rhea', 'Saisha', 'Siya', 'Vanya'
];

const hobbies = [
  'Classical dance', 'Yoga', 'Reading', 'Painting', 'Cooking', 'Photography',
  'Gardening', 'Writing poetry', 'Singing', 'Meditation', 'Fashion design',
  'Playing sitar', 'Kathak', 'Bharatanatyam', 'Sketching mehendi designs'
];

const musicGenres = [
  'Bollywood classics', 'Indian classical', 'Sufi music', 'Indie pop',
  'Folk music', 'Fusion', 'Ghazals', 'Contemporary Bollywood',
  'Punjabi music', 'Tamil songs', 'Carnatic music', 'Instrumental'
];

const travelDestinations = [
  'Rajasthan palaces', 'Kerala backwaters', 'Himalayan retreats',
  'Goa beaches', 'Historical monuments of Delhi', 'Varanasi ghats',
  'Ladakh monasteries', 'Hampi ruins', 'Northeast valleys',
  'Andaman islands', 'Mysore heritage sites', 'Darjeeling tea gardens'
];

const indianCuisines = [
  'Homemade biryani', 'Street food', 'South Indian cuisine',
  'North Indian thali', 'Bengali sweets', 'Gujarati food',
  'Punjabi dishes', 'Coastal seafood', 'Hyderabadi cuisine',
  'Rajasthani food', 'Maharashtrian dishes', 'Kerala cuisine'
];

const bios = [
  'A free spirit with a love for Indian traditions and modern thinking. Looking for someone who appreciates both worlds.',
  'Passionate about art and culture, always exploring new ways to express creativity through traditional and contemporary forms.',
  'Adventure seeker with a deep connection to my roots. Love traveling and discovering hidden gems in our beautiful country.',
  'Tech professional by day, classical dancer by evening. Seeking someone who understands the balance of career and passion.',
  'Bookworm who loves discussing everything from ancient philosophy to modern literature. Looking for intellectual conversations.',
  'Foodie who enjoys experimenting with fusion recipes. Would love to share culinary adventures with someone special.',
  'Nature enthusiast and yoga practitioner. Seeking a like-minded soul who values wellness and spiritual growth.',
  'Creative soul with a camera always in hand. Love capturing the beauty of everyday moments and Indian festivities.',
  'Ambitious professional who believes in the perfect blend of career and family values. Looking for someone with similar priorities.',
  'Music lover and trained classical singer. Hoping to find someone who appreciates the harmony of life.'
];

function generateFakeProfile(): FakeProfile {
  const timestamp = new Date().toISOString();
  
  return {
    username: indianFemaleNames[Math.floor(Math.random() * indianFemaleNames.length)],
    age: Math.floor(Math.random() * (35 - 21) + 21),
    gender: 'female',
    genderSeeking: 'male',
    bio: bios[Math.floor(Math.random() * bios.length)],
    answers: {
      hobby: hobbies[Math.floor(Math.random() * hobbies.length)],
      music: musicGenres[Math.floor(Math.random() * musicGenres.length)],
      travel: travelDestinations[Math.floor(Math.random() * travelDestinations.length)],
      food: indianCuisines[Math.floor(Math.random() * indianCuisines.length)]
    },
    lastActive: timestamp,
    createdAt: timestamp,
    settings: {
      emailNotifications: true,
      profileVisibility: true,
      maxDistance: 50,
      ageRange: {
        min: 21,
        max: 40
      }
    }
  };
}

export async function createFakeProfiles() {
  try {
    // Check if fake profiles already exist
    const existingProfilesRef = ref(database, 'fakeProfiles');
    const existingSnapshot = await get(existingProfilesRef);
    
    if (existingSnapshot.exists()) {
      return; // Profiles already exist, no need to create more
    }

    // Try to create a smaller set of profiles first
    const profiles: Record<string, FakeProfile> = {};
    const usedNames = new Set<string>();

    for (let i = 0; i < 10; i++) {
      let profile: FakeProfile;
      let attempts = 0;
      const maxAttempts = 5;

      do {
        profile = generateFakeProfile();
        attempts++;
        if (attempts >= maxAttempts) {
          // If we can't find a unique name after several attempts, skip this profile
          break;
        }
      } while (usedNames.has(profile.username));

      if (attempts < maxAttempts) {
        usedNames.add(profile.username);
        const id = `fake_profile_${i}`;
        profiles[id] = profile;
      }
    }

    if (Object.keys(profiles).length > 0) {
      await set(ref(database, 'fakeProfiles'), profiles);
      console.log(`Successfully created ${Object.keys(profiles).length} fake profiles`);
    } else {
      console.warn('No fake profiles were created due to constraints');
    }
  } catch (error) {
    console.warn('Unable to create fake profiles:', error);
    // Don't throw the error, just log it
  }
}

export async function getRandomFakeProfiles(count: number = 10): Promise<FakeProfile[]> {
  try {
    const fakeProfilesRef = ref(database, 'fakeProfiles');
    const snapshot = await get(fakeProfilesRef);
    
    if (!snapshot.exists()) {
      // Try to create profiles, but don't fail if we can't
      await createFakeProfiles();
      const newSnapshot = await get(fakeProfilesRef);
      if (!newSnapshot.exists()) {
        return []; // Return empty array if we can't create or get profiles
      }
      return getRandomProfilesFromData(newSnapshot.val(), count);
    }

    return getRandomProfilesFromData(snapshot.val(), count);
  } catch (error) {
    console.warn('Unable to get random profiles:', error);
    return []; // Return empty array on error
  }
}

function getRandomProfilesFromData(profiles: Record<string, FakeProfile>, count: number): FakeProfile[] {
  const profileIds = Object.keys(profiles);
  const selectedProfiles: FakeProfile[] = [];
  const selectedIndexes = new Set<number>();

  while (selectedProfiles.length < count && selectedIndexes.size < profileIds.length) {
    const randomIndex = Math.floor(Math.random() * profileIds.length);
    if (!selectedIndexes.has(randomIndex)) {
      selectedIndexes.add(randomIndex);
      const profileId = profileIds[randomIndex];
      const profile = profiles[profileId];
      selectedProfiles.push({
        ...profile,
        id: profileId
      });
    }
  }

  return selectedProfiles;
}