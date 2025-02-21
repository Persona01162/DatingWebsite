import { Link } from 'react-router-dom';
import { Heart, Users, Shield, ArrowRight, Sparkles, Facebook, Twitter, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-3xl"></div>
          {/* Animated background elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <nav className="relative z-10 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Heart className="h-8 w-8 text-pink-500" />
                <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                  PersonaMatch
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  to="/auth"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-full text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.div
              className="flex justify-center mb-8"
              variants={fadeInUp}
            >
              <div className="relative">
                <Heart className="w-20 h-20 text-pink-500 animate-pulse" />
                <Sparkles className="w-8 h-8 text-purple-400 absolute -top-2 -right-2 animate-spin-slow" />
              </div>
            </motion.div>

            <motion.h1
              className="text-6xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500"
              variants={fadeInUp}
            >
              Find Your Perfect Match
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Discover meaningful connections based on personality compatibility.
              Our intelligent matching algorithm ensures you meet people who truly resonate with you.
            </motion.p>

            <motion.div variants={fadeInUp}>
              <Link
                to="/auth"
                className="inline-flex items-center px-8 py-4 rounded-full text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <motion.div
            className="text-center group"
            variants={fadeInUp}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors duration-300">
                <Heart className="w-12 h-12 text-pink-500" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Smart Matching</h3>
            <p className="text-gray-600 leading-relaxed">
              Our advanced algorithm ensures 50-60% compatibility for balanced and authentic connections.
            </p>
          </motion.div>

          <motion.div
            className="text-center group"
            variants={fadeInUp}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300">
                <Users className="w-12 h-12 text-purple-500" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Real Connections</h3>
            <p className="text-gray-600 leading-relaxed">
              Connect with people who share your interests, values, and life goals.
            </p>
          </motion.div>

          <motion.div
            className="text-center group"
            variants={fadeInUp}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-pink-100 group-hover:bg-pink-200 transition-colors duration-300">
                <Shield className="w-12 h-12 text-pink-500" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Safe & Secure</h3>
            <p className="text-gray-600 leading-relaxed">
              Your privacy and security are our top priorities. All data is encrypted and protected.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="relative py-32 overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl px-8 py-16 md:px-16 overflow-hidden"
            variants={fadeInUp}
          >
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-purple-600/20 backdrop-blur-sm"></div>
            </div>
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold text-white mb-8">
                Ready to Find Your Perfect Match?
              </h2>
              <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                Join thousands of people who have already found their perfect match through our platform.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center px-8 py-4 rounded-full text-purple-600 bg-white hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <Heart className="h-6 w-6 text-pink-500" />
            <span className="ml-2 text-gray-400">© 2025 PersonaMatch. All rights reserved.</span>
          </div>
          {/* Social Media Handles */}
          <div className="flex justify-end items-center space-x-4">
            <a
              href="https://www.facebook.com/yourpage"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-pink-500 transition-colors duration-300"
              aria-label="Facebook"
            >
              <Facebook className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-pink-500 transition-colors duration-300"
              aria-label="Twitter"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="https://www.instagram.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-pink-500 transition-colors duration-300"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;