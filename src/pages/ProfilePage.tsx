import React, { useState, useEffect } from 'react';
import { auth, database } from '../services/firebase';
import { ref, get } from 'firebase/database';
import { UserCircle2, Heart, Camera, Edit2, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;

      try {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const profileData = snapshot.val();
          
          if (!profileData.username) {
            navigate('/setup-profile');
            return;
          }
          
          if (profileData.minioProfileUrl) {
            try {
              const minioResponse = await fetch(profileData.minioProfileUrl);
              const minioData = await minioResponse.json();
              setProfile({ ...profileData, ...minioData });
            } catch (error) {
              console.error('Error fetching MinIO data:', error);
              setProfile(profileData);
            }
          } else {
            setProfile(profileData);
          }
        } else {
          navigate('/setup-profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="relative">
          <Heart className="w-16 h-16 text-pink-500 animate-pulse" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full animate-ping"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <UserCircle2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h3>
          <p className="text-gray-600 mb-6">Please complete your profile setup.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/setup-profile')}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Complete Profile
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-pink-500 to-purple-500">
            <div className="absolute inset-0 bg-black/20"></div>
            {/* <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300"
            >
              <Camera className="h-6 w-6" />
            </motion.button> */}
          </div>

          {/* Profile Picture */}
          <div className="relative -mt-20 px-6">
            <div className="relative inline-block">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt="Profile"
                  className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <UserCircle2 className="h-20 w-20 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Profile Info */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">@{profile.username}</h1>
                <div className="flex items-center mt-1 text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">{profile.age} years old</span>
                  <MapPin className="h-4 w-4 ml-4 mr-1" />
                  <span className="text-sm">50km away</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/setup-profile')}
                className="flex items-center px-4 py-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-all duration-300"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </motion.button>
            </div>

            {/* Bio */}
            {profile.bio && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About Me</h2>
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
              </motion.div>
            )}

            {/* Interests */}
            {profile.answers && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">My Interests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(profile.answers).map(([question, answer]) => (
                    <motion.div
                      key={question}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg"
                    >
                      <h3 className="text-sm font-medium text-gray-900">
                        {question.charAt(0).toUpperCase() + question.slice(1)}
                      </h3>
                      <p className="mt-1 text-gray-600">{answer as string}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;