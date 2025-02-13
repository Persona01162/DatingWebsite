import React, { useState } from 'react';
import { createUserProfile } from '../services/firebase';

interface ProfileFormProps {
  userId: string;
  onComplete: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ userId, onComplete }) => {
  const [formData, setFormData] = useState({
    bio: '',
    gender: 'male',
    seekingGender: 'female',
    answers: {
      hobby: '',
      music: '',
      travel: '',
      food: '',
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserProfile(userId, formData);
      onComplete();
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">About You</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              placeholder="Tell us about yourself (200 words max)"
              maxLength={200}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">I am</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Looking for</label>
              <select
                value={formData.seekingGender}
                onChange={(e) => setFormData({ ...formData, seekingGender: e.target.value as 'male' | 'female' | 'other' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Quick Questions</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">What are your hobbies?</label>
              <input
                type="text"
                value={formData.answers.hobby}
                onChange={(e) => setFormData({
                  ...formData,
                  answers: { ...formData.answers, hobby: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">What kind of music do you like?</label>
              <input
                type="text"
                value={formData.answers.music}
                onChange={(e) => setFormData({
                  ...formData,
                  answers: { ...formData.answers, music: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Where would you like to travel?</label>
              <input
                type="text"
                value={formData.answers.travel}
                onChange={(e) => setFormData({
                  ...formData,
                  answers: { ...formData.answers, travel: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">What's your favorite food?</label>
              <input
                type="text"
                value={formData.answers.food}
                onChange={(e) => setFormData({
                  ...formData,
                  answers: { ...formData.answers, food: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;