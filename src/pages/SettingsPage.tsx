import React, { useState, useEffect } from 'react';
import { Settings, Bell, Eye, Shield, UserCircle2 } from 'lucide-react';
import { auth, database, updateUserSettings } from '../services/firebase';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface UserSettings {
  emailNotifications: boolean;
  profileVisibility: boolean;
  maxDistance: number;
  ageRange: {
    min: number;
    max: number;
  };
}

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    profileVisibility: true,
    maxDistance: 50,
    ageRange: {
      min: 18,
      max: 50
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      if (!auth.currentUser) return;

      try {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          if (!userData.username) {
            navigate('/setup-profile');
            return;
          }
          setHasProfile(true);
          
          // Load user settings if they exist
          if (userData.settings) {
            setSettings(userData.settings);
          }
        } else {
          navigate('/setup-profile');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [navigate]);

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!auth.currentUser) return;

    try {
      setSaving(true);
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      await updateUserSettings(auth.currentUser.uid, newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!hasProfile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              {saving && (
                <span className="text-sm text-gray-500">Saving...</span>
              )}
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive email updates about matches</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                        settings.emailNotifications ? 'bg-pink-600' : 'bg-gray-200'
                      }`}
                      disabled={saving}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                          settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-medium text-gray-900 mb-4">Privacy</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Eye className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Profile Visibility</h3>
                        <p className="text-sm text-gray-500">Show your profile in discovery</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateSetting('profileVisibility', !settings.profileVisibility)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                        settings.profileVisibility ? 'bg-pink-600' : 'bg-gray-200'
                      }`}
                      disabled={saving}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                          settings.profileVisibility ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-lg font-medium text-gray-900 mb-4">Discovery</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Maximum Distance</label>
                    <div className="mt-2">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={settings.maxDistance}
                        onChange={(e) => updateSetting('maxDistance', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                        disabled={saving}
                      />
                      <div className="mt-1 text-sm text-gray-500">{settings.maxDistance} miles</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900">Age Range</label>
                    <div className="mt-2 space-y-2">
                      <div>
                        <input
                          type="range"
                          min="18"
                          max="100"
                          value={settings.ageRange.min}
                          onChange={(e) => updateSetting('ageRange', { ...settings.ageRange, min: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                          disabled={saving}
                        />
                        <div className="mt-1 text-sm text-gray-500">Minimum: {settings.ageRange.min} years</div>
                      </div>
                      <div>
                        <input
                          type="range"
                          min="18"
                          max="100"
                          value={settings.ageRange.max}
                          onChange={(e) => updateSetting('ageRange', { ...settings.ageRange, max: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                          disabled={saving}
                        />
                        <div className="mt-1 text-sm text-gray-500">Maximum: {settings.ageRange.max} years</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;