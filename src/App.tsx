import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { useAuthState } from './hooks/useAuthState';
import Navigation from './components/Navigation';
import AuthForm from './components/AuthForm';
import ProfileSetup from './components/ProfileSetup';
import DiscoverPage from './pages/DiscoverPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';

function App() {
  const { user, loading } = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/app/discover" />} />
        <Route path="/auth" element={!user ? <AuthForm /> : <Navigate to="/app/discover" />} />
        <Route path="/setup-profile" element={user ? <ProfileSetup /> : <Navigate to="/auth" />} />
        <Route
          path="/app/*"
          element={
            user ? (
              <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
                <Navigation />
                <div className="pb-16 md:pt-16">
                  <Routes>
                    <Route path="/discover" element={<DiscoverPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/" element={<Navigate to="/app/discover" replace />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;