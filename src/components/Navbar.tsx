import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { Trophy, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-sports-black/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-gold" />
            <span className="text-xl font-black tracking-tighter text-white uppercase">NDEJJE <span className="text-sky-blue">SPORTS</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-gold transition-colors font-bold text-sm uppercase tracking-widest">Home</Link>
            {user ? (
              <>
                <Link 
                  to={
                    profile?.role === 'superadmin' ? '/admin/super' : 
                    profile?.role === 'admin' ? '/admin' : 
                    '/dashboard'
                  } 
                  className="text-gray-300 hover:text-gold transition-colors font-bold text-sm uppercase tracking-widest"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <User className="h-4 w-4 text-sky-blue" />
                    <span className="text-sm font-medium">{profile?.displayName || user.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth" className="text-gray-300 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest">Login</Link>
                <Link to="/auth?mode=signup" className="btn-primary py-2 px-6 text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 p-2">
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
            className="md:hidden bg-sports-gray border-b border-white/10 px-4 py-6 space-y-4"
          >
            <Link to="/" className="block text-gray-300 hover:text-neon-green">Home</Link>
            {user ? (
              <>
                <Link 
                  to={
                    profile?.role === 'superadmin' ? '/admin/super' : 
                    profile?.role === 'admin' ? '/admin' : 
                    '/dashboard'
                  } 
                  className="block text-gray-300 hover:text-neon-green"
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
                <Link to="/auth" className="block text-gray-300">Login</Link>
                <Link to="/auth?mode=signup" className="block btn-primary text-center">Sign Up</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
