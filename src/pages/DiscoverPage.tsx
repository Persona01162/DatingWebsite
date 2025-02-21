import { useState, useEffect } from 'react';
import { useMatching } from '../hooks/useMatching';
import { auth, database } from '../services/firebase';
import { ref, get, update } from 'firebase/database';
import { Heart, X, UserCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DiscoverPage = () => {
  const { matches, loading, error } = useMatching(auth.currentUser?.uid || '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyLimitReached, setDailyLimitReached] = useState(false); 

  const checkAndUpdateDailyLimit = async () => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);

    const today = new Date().toISOString().split('T')[0]; 
    const userData = snapshot.val();

    if (userData && userData.lastViewedDate === today && userData.profilesViewedToday >= 10) {
      setDailyLimitReached(true);
    } else {
      const profilesViewedToday = userData?.lastViewedDate === today ? userData.profilesViewedToday : 0;
      await update(userRef, {
        profilesViewedToday: profilesViewedToday,
        lastViewedDate: today,
      });
      setDailyLimitReached(false);
    }
  };

  const incrementProfileViewCount = async () => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const userRef = ref(database, `users/${userId}`);

    await update(userRef, {
      profilesViewedToday: Math.min((await get(userRef)).val()?.profilesViewedToday + 1, 10),
    });
  };

  useEffect(() => {
    checkAndUpdateDailyLimit();
  }, []);

  const handleLike = async () => {
    if (dailyLimitReached) return;

    await incrementProfileViewCount();
    setCurrentIndex(prev => Math.min(prev + 1, matches.length));
  };

  const handleDislike = async () => {
    if (dailyLimitReached) return;

    await incrementProfileViewCount();
    setCurrentIndex(prev => Math.min(prev + 1, matches.length));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="relative">
          <Heart className="w-16 h-16 text-pink-500 animate-pulse" />
          <Sparkles className="w-6 h-6 text-purple-400 absolute -top-2 -right-2 animate-spin-slow" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-4 text-red-500">
              {/* <X className="h-12 w-12 mx-auto" /> */}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">We've sent a verification link to email. Please check your inbox and click the link to verify your email address.
            </h3>
            {/* <p className="text-gray-600 mb-6">{error}</p> */}
            {/* <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Try Again
            </motion.button> */}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            Discover Your Match
          </h1>
          <p className="text-gray-600 mt-2">
            Find someone who shares your interests and values
          </p>
        </motion.div>

        {dailyLimitReached || (matches.length === 0 || currentIndex >= matches.length) ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <UserCircle2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No more profiles to show
            </h3>
            <p className="text-gray-600">
              Check back later for new potential matches!
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative aspect-video bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <UserCircle2 className="h-32 w-32 text-gray-400" />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {matches[currentIndex].username}, {matches[currentIndex].age}
                    </h2>
                    <p className="text-gray-500">Active recently</p>
                  </div>
                  <div className="bg-pink-100 px-3 py-1 rounded-full">
                    <span className="text-pink-600 text-sm font-medium">50-80% Match</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">About Me</h3>
                    <p className="text-gray-600 mt-1">{matches[currentIndex].bio}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(matches[currentIndex].answers).map(([question, answer]) => (
                      <motion.div
                        key={question}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-50 p-4 rounded-lg"
                      >
                        <h4 className="text-sm font-medium text-gray-900">
                          {question.charAt(0).toUpperCase() + question.slice(1)}
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">{answer}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center space-x-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDislike}
                    className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-300"
                  >
                    <X className="h-8 w-8" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLike}
                    className="p-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Heart className="h-8 w-8" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;