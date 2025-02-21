import { database } from '../services/firebase';
import { ref, set, get } from 'firebase/database';

interface FakeProfile {
  username: string;
  age: number;
  gender: 'male' | 'female';
  genderSeeking: 'male' | 'female';
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

const indianMaleNames = [
  'Aarav', 'Vihaan', 'Arjun', 'Kabir', 'Dhruv', 'Ishaan', 'Aditya', 'Rohan',
  'Vivaan', 'Shaurya', 'Reyansh', 'Krishna', 'Virat', 'Aryan', 'Dev', 'Rudra',
  'Pranav', 'Atharv', 'Advait', 'Yash'
];

const maleHobbies = [
  'Cricket', 'Playing guitar', 'Photography', 'Chess', 'Badminton',
  'Coding', 'Mountain biking', 'Yoga', 'Reading', 'Football',
  'Table tennis', 'Sketching', 'Martial arts', 'Basketball', 'Writing poetry'
];

const femaleHobbies = [
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

const maleBios = [
  'Tech enthusiast and cricket lover. Looking for someone who shares my passion for innovation and sports.',
  'Aspiring entrepreneur with a love for Indian classical music. Seeking a partner who appreciates culture and ambition.',
  'Fitness enthusiast and foodie. Love exploring new restaurants and staying active. Looking for someone to share adventures with.',
  'Software engineer by profession, musician by passion. Looking for someone who appreciates both logic and creativity.',
  'Adventure seeker and photography enthusiast. Love capturing moments and creating memories.',
  'Proud of my Indian roots and excited about modern opportunities. Seeking someone with similar values.',
  'Balancing corporate life with creative pursuits. Looking for someone who understands work-life harmony.',
  'Spiritual and ambitious. Seeking a partner who values both personal growth and professional success.',
  'Love traveling and experiencing different cultures. Looking for a companion to explore life with.',
  'Passionate about fitness and mental wellness. Seeking someone who prioritizes health and personal development.'
];

const femaleBios = [
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

function generateFakeProfile(gender: 'male' | 'female'): FakeProfile {
  const timestamp = new Date().toISOString();
  const names = gender === 'male' ? indianMaleNames : indianFemaleNames;
  const hobbies = gender === 'male' ? maleHobbies : femaleHobbies;
  const bios = gender === 'male' ? maleBios : femaleBios;
  
  return {
    username: names[Math.floor(Math.random() * names.length)],
    age: Math.floor(Math.random() * (35 - 21) + 21),
    gender,
    genderSeeking: gender === 'male' ? 'female' : 'male',
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

export async function createFakeProfiles(gender: 'male' | 'female', count: number = 10) {
  try {
    const profiles: Record<string, FakeProfile> = {};
    const usedNames = new Set<string>();

    for (let i = 0; i < count; i++) {
      let profile: FakeProfile;
      let attempts = 0;
      const maxAttempts = 5;

      do {
        profile = generateFakeProfile(gender);
        attempts++;
        if (attempts >= maxAttempts) break;
      } while (usedNames.has(profile.username));

      if (attempts < maxAttempts) {
        usedNames.add(profile.username);
        const id = `fake_${gender}_${Date.now()}_${i}`;
        profiles[id] = profile;
      }
    }

    if (Object.keys(profiles).length > 0) {
      const fakeProfilesRef = ref(database, 'fakeProfiles');
      const existingSnapshot = await get(fakeProfilesRef);
      const existingProfiles = existingSnapshot.exists() ? existingSnapshot.val() : {};

      await set(fakeProfilesRef, {
        ...existingProfiles,
        ...profiles
      });

      return Object.entries(profiles).map(([id, profile]) => ({
        id,
        ...profile
      }));
    }

    return [];
  } catch (error) {
    console.error('Error creating fake profiles:', error);
    return [];
  }
}

export async function getRandomFakeProfiles(count: number = 10, gender?: 'male' | 'female'): Promise<FakeProfile[]> {
  try {
    const fakeProfilesRef = ref(database, 'fakeProfiles');
    const snapshot = await get(fakeProfilesRef);
    
    let profiles: FakeProfile[] = [];
    if (!snapshot.exists() || Object.keys(snapshot.val()).length === 0) {
      // Create new fake profiles if none exist or if we need specific gender profiles
      profiles = await createFakeProfiles(gender || 'female', count);
    } else {
      // Use existing profiles
      const allProfiles = snapshot.val();
      profiles = Object.entries(allProfiles)
        .filter(([_, profile]: [string, any]) => !gender || profile.gender === gender)
        .map(([id, profile]: [string, any]) => ({
          id,
          ...profile
        }));

      // If we don't have enough profiles of the requested gender, create more
      if (profiles.length < count && gender) {
        const newProfiles = await createFakeProfiles(gender, count - profiles.length);
        profiles = [...profiles, ...newProfiles];
      }
    }

    // Shuffle and return requested number of profiles
    return profiles
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  } catch (error) {
    console.error('Error getting random fake profiles:', error);
    return [];
  }
}