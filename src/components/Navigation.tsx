import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Settings, User, LogOut } from 'lucide-react';
import { auth, database } from '../services/firebase';
import { ref, get } from 'firebase/database';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userRef = ref(database, `users/${auth.currentUser.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUsername(userData.username || '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === `/app${path}`;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 md:top-0 md:bottom-auto z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/app/discover"
            className={`flex flex-col items-center justify-center flex-1 py-2 ${
              isActive('/discover') ? 'text-pink-600' : 'text-gray-600 hover:text-pink-600'
            }`}
          >
            <Heart className="h-6 w-6" />
            <span className="text-xs mt-1">Discover</span>
          </Link>

          <Link
            to="/app/messages"
            className={`flex flex-col items-center justify-center flex-1 py-2 ${
              isActive('/messages') ? 'text-pink-600' : 'text-gray-600 hover:text-pink-600'
            }`}
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs mt-1">Messages</span>
          </Link>

          <Link
            to="/app/profile"
            className={`flex flex-col items-center justify-center flex-1 py-2 ${
              isActive('/profile') ? 'text-pink-600' : 'text-gray-600 hover:text-pink-600'
            }`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">{username || 'Profile'}</span>
          </Link>

          <Link
            to="/app/settings"
            className={`flex flex-col items-center justify-center flex-1 py-2 ${
              isActive('/settings') ? 'text-pink-600' : 'text-gray-600 hover:text-pink-600'
            }`}
          >
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-600 hover:text-pink-600"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;