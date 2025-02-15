import React, { useState, useEffect } from 'react';
import { auth, database } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { Heart, Mail, Lock, ArrowRight, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationChecking, setVerificationChecking] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Reset verification states when switching between login and signup
    setVerificationSent(false);
    setVerificationChecking(false);
    setError('');
    setAcceptedTerms(false);
  }, [isLogin]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account', 
    });
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider); 
      const user = result.user;

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        const userAcceptedTerms = window.confirm(
          'Do you accept the Terms and Conditions?'
        );

        if (!userAcceptedTerms) {
          setError('You must accept the Terms and Conditions to continue.');
          setLoading(false);
          return;
        }

        await set(ref(database, `users/${user.uid}`), {
          email: user.email,
          username: '',
          profileShownToday: 0,
          swipesToday: 0,
          termsAccepted: true,
          termsAcceptedAt: new Date().toISOString(),
        });

        navigate('/setup-profile');
      } else {
        const userData = snapshot.val();
        if (!userData.username || userData.username.trim() === '') {
          navigate('/setup-profile');
        } else {
          navigate('/app/discover');
        }
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google Sign-In popup was closed.';
      } else if (error.code === 'auth/redirect-uri-mismatch') {
        errorMessage = 'Redirect URI mismatch. Please check your Firebase settings.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkEmailVerification = async () => {
    if (!auth.currentUser) return false;

    try {
      await auth.currentUser.reload();
      return auth.currentUser.emailVerified;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  };

  const startVerificationCheck = async () => {
    setVerificationChecking(true);
    const checkInterval = setInterval(async () => {
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        clearInterval(checkInterval);
        setVerificationChecking(false);
        setVerificationSent(false);

        // Create user profile and navigate
        try {
          if (auth.currentUser) {
            await set(ref(database, `users/${auth.currentUser.uid}`), {
              email: auth.currentUser.email,
              username: '',
              profileShownToday: 0,
              swipesToday: 0,
              termsAccepted: true,
              termsAcceptedAt: new Date().toISOString()
            });
            navigate('/setup-profile');
          }
        } catch (error) {
          console.error('Error creating user profile:', error);
          setError('Failed to create user profile. Please try again.');
        }
      }
    }, 2000);

    // Stop checking after 5 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
      setVerificationChecking(false);
      setError('Email verification timeout. Please try again.');
    }, 300000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        if (!userCredential.user.emailVerified) {
          setError('Please verify your email before signing in.');
          await auth.signOut();
          setLoading(false);
          return;
        }

        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          if (!userData.username) {
            navigate('/setup-profile');
            return;
          }
          navigate('/app/discover');
        } else {
          navigate('/setup-profile');
        }
      } else {
        if (!acceptedTerms) {
          setError('Please accept the Terms and Conditions to continue.');
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
        startVerificationCheck();
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred. Please try again.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account already exists with this email.';
      }
      setError(errorMessage);
    } finally {
      if (!verificationSent) {
        setLoading(false);
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  const openTerms = () => {
    window.open('/terms.txt', '_blank');
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="mx-auto h-16 w-16 text-pink-500 mb-4"
            >
              {verificationChecking ? (
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent" />
              ) : (
                <Mail className="w-full h-full" />
              )}
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to verify your email address.
            </p>
            {verificationChecking ? (
              <p className="text-sm text-gray-500">
                Waiting for email verification... This may take a few moments.
              </p>
            ) : (
              <button
                onClick={() => startVerificationCheck()}
                className="text-pink-600 hover:text-pink-500 text-sm font-medium"
              >
                Click here after verifying your email
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-3xl"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-lg relative z-10"
        initial="hidden"
        animate="visible"
        variants={formVariants}
      >
        <div className="text-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="mx-auto h-12 w-12 text-pink-500"
          >
            <Heart className="w-full h-full" />
          </motion.div>
          <motion.h2
            className="mt-6 text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isLogin ? 'Welcome back' : 'Create your account'}
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {isLogin ? 'Sign in to continue your journey' : 'Start your journey to find love'}
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg flex items-center justify-center space-x-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email Input */}
            <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-t-lg relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm bg-white/50 backdrop-blur-sm"
                  placeholder="Email address"
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-b-lg relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm bg-white/50 backdrop-blur-sm"
                  placeholder="Password"
                />
              </div>
            </motion.div>
          </div>

          {!isLogin && (
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={openTerms}
                    className="text-pink-600 hover:text-pink-500 font-semibold"
                  >
                    Terms and Conditions
                  </button>
                </label>
              </div>
            </div>
          )}

          {/* Submit Button (Sign In / Sign Up) */}
          <div>
            <motion.button
              type="submit"
              disabled={loading || (!isLogin && !acceptedTerms)}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-pink-200 group-hover:text-pink-100" />
              </span>
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                <span className="flex items-center">
                  {isLogin ? 'Sign in' : 'Sign up'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </motion.button>
          </div>

          {/* Google Sign-In Button */}
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transform transition-all duration-200 mt-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="absolute left-5 inset-y-0 flex items-center pl-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="20px"
                  height="20px"
                  className="text-gray-500 group-hover:text-gray-600"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
              </span>
              Sign in with Google
            </button>
          </div>

          {/* Toggle Between Login and Signup */}
          <div className="flex items-center justify-center">
            <motion.button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-pink-600 hover:text-pink-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthForm;