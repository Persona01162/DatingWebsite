import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { createUserProfile } from '../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, Camera, Sparkles, User, Music, Map, Utensils } from 'lucide-react';

interface ProfileData {
  username: string;
  age: number;
  gender: string;
  genderSeeking: string;
  bio: string;
  answers: {
    hobby: string;
    music: string;
    travel: string;
    food: string;
  };
}

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    age: 18,
    gender: '',
    genderSeeking: '',
    bio: '',
    answers: {
      hobby: '',
      music: '',
      travel: '',
      food: ''
    }
  });

  const isStepValid = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return profileData.username.trim() !== '' && profileData.age >= 18;
      case 2:
        return profileData.gender.trim() !== '' && profileData.genderSeeking.trim() !== '';
      case 3:
        return profileData.bio.length >= 300 && profileData.bio.length <= 500;
      case 4:
        return (
          profileData.answers.hobby.trim() !== '' &&
          profileData.answers.music.trim() !== '' &&
          profileData.answers.travel.trim() !== '' &&
          profileData.answers.food.trim() !== ''
        );
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (isStepValid(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      setError('No authenticated user found');
      return;
    }

    try {
      setError(null);
      await createUserProfile(auth.currentUser.uid, profileData);
      navigate('/app/discover');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to save profile');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.6 }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="relative">
              <div className="absolute -top-4 -right-4">
                <Sparkles className="h-8 w-8 text-purple-500 animate-spin-slow" />
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choose a username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="pl-10 block h-10 w-full rounded-lg border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 bg-white/50 backdrop-blur-sm"
                      placeholder="Your unique username"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How old are you?</label>
                  <div className="relative mt-2">
                    <input
                      type="range"
                      min="18"
                      max="100"
                      value={profileData.age}
                      onChange={(e) => setProfileData({ ...profileData, age: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    <div className="mt-2 text-center text-lg font-semibold text-pink-500">
                      {profileData.age} years old
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am</label>
                <div className="grid grid-cols-3 gap-3">
                  {['male', 'female', 'other'].map((option) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setProfileData({ ...profileData, gender: option })}
                      className={`p-4 rounded-lg border-2 transition-all ${profileData.gender === option
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-pink-200'
                        }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
                <div className="grid grid-cols-3 gap-3">
                  {['male', 'female', 'other'].map((option) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setProfileData({ ...profileData, genderSeeking: option })}
                      className={`p-4 rounded-lg border-2 transition-all ${profileData.genderSeeking === option
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-pink-200'
                        }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us about yourself
              </label>
              <div className="relative">
                <textarea
                  value={profileData.bio}
                  onChange={(e) => {
                    const bio = e.target.value;
                    if (bio.length <= 500) {
                      setProfileData({ ...profileData, bio });
                    }
                  }}
                  rows={6}
                  className={`block w-full rounded-lg border-gray-300 shadow-sm focus:ring-pink-500 focus:border-pink-500 bg-white/50 backdrop-blur-sm ${profileData.bio.length < 300 || profileData.bio.length > 500 ? 'border-red-500' : ''
                    }`}
                  placeholder="Share your story, interests, and what makes you unique..."
                  required
                />
                <div className="absolute bottom-3 right-3 text-sm text-gray-500">
                  {profileData.bio.length}/500
                </div>
              </div>
              {profileData.bio.length < 300 && (
                <p className="text-red-500 text-sm mt-1">
                  Bio must be at least 300 characters.
                </p>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="h-6 w-6 text-pink-500" />
                  <label className="block text-sm font-medium text-gray-700">What are your hobbies?</label>
                </div>
                <input
                  type="text"
                  value={profileData.answers.hobby}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    answers: { ...profileData.answers, hobby: e.target.value }
                  })}
                  className="block w-full rounded-lg border-gray-500 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Music className="h-6 w-6 text-purple-500" />
                  <label className="block text-sm font-medium text-gray-700">What kind of music do you like?</label>
                </div>
                <input
                  type="text"
                  value={profileData.answers.music}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    answers: { ...profileData.answers, music: e.target.value }
                  })}
                  className="block w-full rounded-lg border-gray-500 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Map className="h-6 w-6 text-pink-500" />
                  <label className="block text-sm font-medium text-gray-700">Where would you like to travel?</label>
                </div>
                <input
                  type="text"
                  value={profileData.answers.travel}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    answers: { ...profileData.answers, travel: e.target.value }
                  })}
                  className="block w-full rounded-lg border-gray-500 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Utensils className="h-6 w-6 text-purple-500" />
                  <label className="block text-sm font-medium text-gray-700">What's your favorite food?</label>
                </div>
                <input
                  type="text"
                  value={profileData.answers.food}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    answers: { ...profileData.answers, food: e.target.value }
                  })}
                  className="block w-full rounded-lg border-gray-500 shadow-sm focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </motion.div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-3xl"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl mx-auto relative">
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="inline-block"
            >
              <Heart className="h-12 w-12 text-pink-500 mx-auto" />
            </motion.div>
            <h2 className="mt-6 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
              Complete Your Profile
            </h2>
            <div className="mt-4 flex justify-center space-x-2">
              {[1, 2, 3, 4].map((stepNumber) => (
                <motion.div
                  key={stepNumber}
                  className={`w-3 h-3 rounded-full ${step === stepNumber ? 'bg-pink-500' : 'bg-gray-300'
                    }`}
                  animate={{
                    scale: step === stepNumber ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: step === stepNumber ? Infinity : 0,
                    repeatType: "reverse"
                  }}
                />
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          <motion.div
            className="space-y-8"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderStep()}

            <div className="flex justify-between pt-6">
              {/* Back Button */}
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-pink-600 bg-pink-100 hover:bg-pink-200 transition-colors duration-300"
                >
                  Back
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => (step < 4 ? handleNextStep() : handleSubmit())}
                disabled={!isStepValid(step)}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full ${!isStepValid(step)
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : step < 4
                      ? 'text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
                      : 'text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  } transition-all duration-300 shadow-md hover:shadow-lg ml-auto`}
              >
                {step < 4 ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  'Complete Profile'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSetup;