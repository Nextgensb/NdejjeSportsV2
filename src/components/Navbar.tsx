import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../lib/firebase';
import { Trophy, User, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-app-bg/80 backdrop-blur-lg border-b border-app-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-gold" />
            <span className="text-xl font-black tracking-tighter text-app-text uppercase">NDEJJE <span className="text-sky-blue">SPORTS</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-app-card transition-colors text-app-text"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-gold" /> : <Moon className="h-5 w-5 text-sports-black" />}
            </button>
            <Link to="/" className="text-app-text/70 hover:text-gold transition-colors font-bold text-sm uppercase tracking-widest">Home</Link>
            {user ? (
              <>
                <Link 
                  to={
                    profile?.role === 'superadmin' ? '/admin/super' : 
                    profile?.role === 'admin' ? '/admin' : 
                    '/dashboard'
                  } 
                  className="text-app-text/70 hover:text-gold transition-colors font-bold text-sm uppercase tracking-widest"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-app-card px-3 py-1 rounded-full border border-app-border">
                    <User className="h-4 w-4 text-sky-blue" />
                    <span className="text-sm font-medium text-app-text">{profile?.displayName || user.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-app-text/40 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth" className="text-app-text/70 hover:text-gold transition-colors font-bold text-sm uppercase tracking-widest">Login</Link>
                <Link to="/auth?mode=signup" className="btn-primary py-2 px-6 text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-app-card transition-colors text-app-text"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-gold" /> : <Moon className="h-5 w-5 text-sports-black" />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-app-text p-2">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-app-bg border-b border-app-border px-4 py-6 space-y-4"
          >
            <Link to="/" className="block text-app-text/70 hover:text-gold">Home</Link>
            {user ? (
              <>
                <Link 
                  to={
                    profile?.role === 'superadmin' ? '/admin/super' : 
                    profile?.role === 'admin' ? '/admin' : 
                    '/dashboard'
                  } 
                  className="block text-app-text/70 hover:text-gold"
                >
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-2 text-red-500">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <Link to="/auth" className="block text-app-text/70">Login</Link>
                <Link to="/auth?mode=signup" className="block btn-primary text-center">Sign Up</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
