import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Mail, Lock, User, ArrowRight, ShieldCheck, 
  UserCircle, Eye, EyeOff, CheckCircle2, AlertCircle,
  Activity, Award, Target
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { SPORTS, CATEGORIES } from '../constants';

const ADMIN_SETUP_PASSWORD = "nds1234"; // In a real app, this would be more secure

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    role: 'user' as 'admin' | 'user',
    sport: SPORTS[0],
    level: CATEGORIES[0],
    adminPassword: '',
    rememberMe: false
  });

  useEffect(() => {
    setIsLogin(searchParams.get('mode') !== 'signup');
  }, [searchParams]);

  const logSecurityEvent = async (email: string, type: string, category: string) => {
    try {
      await addDoc(collection(db, 'security_notifications'), {
        email,
        type,
        category,
        timestamp: serverTimestamp(),
        time: new Date().toISOString(),
        status: 'unread'
      });
    } catch (err) {
      console.error('Failed to log security event:', err);
    }
  };

  const checkFailedAttempts = async (email: string) => {
    const attemptRef = doc(db, 'auth_attempts', email.replace(/\./g, '_'));
    const attemptSnap = await getDoc(attemptRef);
    
    if (attemptSnap.exists()) {
      const data = attemptSnap.data();
      if (data.count >= 3) {
        const lastAttempt = data.lastAttempt.toDate();
        const now = new Date();
        const diffMinutes = (now.getTime() - lastAttempt.getTime()) / (1000 * 60);
        
        if (diffMinutes < 15) { // Block for 15 minutes
          throw new Error(`Too many failed attempts. Please try again in ${Math.ceil(15 - diffMinutes)} minutes.`);
        } else {
          // Reset after timeout
          await setDoc(attemptRef, { count: 0, lastAttempt: serverTimestamp() });
        }
      }
    }
  };

  const recordFailedAttempt = async (email: string, category: string) => {
    const attemptRef = doc(db, 'auth_attempts', email.replace(/\./g, '_'));
    const attemptSnap = await getDoc(attemptRef);
    
    let count = 1;
    if (attemptSnap.exists()) {
      count = attemptSnap.data().count + 1;
      await updateDoc(attemptRef, {
        count: increment(1),
        lastAttempt: serverTimestamp()
      });
    } else {
      await setDoc(attemptRef, {
        count: 1,
        lastAttempt: serverTimestamp()
      });
    }

    if (count >= 3) {
      await logSecurityEvent(email, 'Brute force / Multiple failures', category);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await checkFailedAttempts(formData.email);

      if (isLogin) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          
          if (userDoc.exists()) {
            const profile = userDoc.data();
            if (profile.role === 'admin') {
              // Reset attempts on success
              await setDoc(doc(db, 'auth_attempts', formData.email.replace(/\./g, '_')), { count: 0, lastAttempt: serverTimestamp() });
              navigate('/admin');
            } else if (profile.role === 'superadmin') {
              navigate('/admin/super');
            } else {
              navigate('/dashboard');
            }
          } else {
            navigate('/dashboard');
          }
        } catch (err: any) {
          await recordFailedAttempt(formData.email, 'Login');
          throw err;
        }
      } else {
        // Sign Up Logic
        if (formData.role === 'admin') {
          if (formData.adminPassword !== ADMIN_SETUP_PASSWORD) {
            await recordFailedAttempt(formData.email, 'Admin Registration');
            throw new Error('Invalid Sport Admin Password. Attempt logged.');
          }
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.username });
        
        const profileData: any = {
          uid: userCredential.user.uid,
          email: formData.email,
          displayName: formData.username,
          username: formData.username,
          role: formData.role,
          createdAt: serverTimestamp(),
        };

        if (formData.role === 'admin') {
          profileData.sport = formData.sport;
          profileData.level = formData.level;
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), profileData);
        
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate(formData.role === 'admin' ? '/admin' : '/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-app-bg">
      {/* Left Panel - Sports Background */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200" 
            alt="Sports Action" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-app-bg via-app-bg/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex space-x-4 mb-8">
              {['⚽', '🏀', '🏐', '♟'].map((icon, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                >
                  {icon}
                </motion.div>
              ))}
            </div>
            <Trophy className="h-16 w-16 text-gold mb-8" />
            <h2 className="text-6xl font-black text-app-text tracking-tighter mb-6 uppercase leading-none">
              THE ARENA <br />
              <span className="text-gold">AWAITS YOU.</span>
            </h2>
            <p className="text-xl text-app-text/70 max-w-md italic font-medium">
              "Tracking Performance, Celebrating Champions"
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl glass-card p-8 md:p-10 border-t-4 border-gold relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Trophy className="h-32 w-32 text-gold" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-app-text mb-2 uppercase tracking-tight">
              {isLogin ? 'Arena Login' : 'Join the Arena'}
            </h1>
            <p className="text-app-text/50 text-sm font-medium">
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Fill in the details to start your sports journey'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex p-1 bg-app-card rounded-2xl mb-8 border border-app-border">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                isLogin ? 'bg-gold text-black shadow-lg' : 'text-app-text/40 hover:text-app-text'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                !isLogin ? 'bg-gold text-black shadow-lg' : 'text-app-text/40 hover:text-app-text'
              }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl text-sm flex items-center space-x-3"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 rounded-xl text-sm flex items-center space-x-3"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Username</label>
                    <div className="relative group">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-gold transition-colors" />
                      <input 
                        type="text"
                        required
                        placeholder="johndoe_25"
                        className="w-full bg-app-card border border-app-border rounded-xl py-3 pl-12 pr-4 text-app-text focus:outline-none focus:border-gold transition-all"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-gold transition-colors" />
                    <input 
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="w-full bg-app-card border border-app-border rounded-xl py-3 pl-12 pr-4 text-app-text focus:outline-none focus:border-gold transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Password</label>
                    {isLogin && (
                      <button type="button" className="text-[10px] font-bold text-sky-blue hover:text-gold transition-colors uppercase tracking-widest">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-gold transition-colors" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full bg-app-card border border-app-border rounded-xl py-3 pl-12 pr-12 text-app-text focus:outline-none focus:border-gold transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="rounded border-app-border bg-app-card text-gold focus:ring-gold"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    />
                    <label htmlFor="remember" className="text-xs text-app-text/50 font-medium">Remember me for 30 days</label>
                  </div>
                )}

                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6 pt-4 border-t border-white/10"
                  >
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">User Category</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, role: 'user' })}
                          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                            formData.role === 'user' 
                              ? 'border-sky-blue bg-sky-blue/10 text-sky-blue' 
                              : 'border-white/10 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          <UserCircle className="h-4 w-4" />
                          <span className="font-bold text-xs uppercase tracking-widest">Normal User</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, role: 'admin' })}
                          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                            formData.role === 'admin' 
                              ? 'border-gold bg-gold/10 text-gold' 
                              : 'border-white/10 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span className="font-bold text-xs uppercase tracking-widest">Admin</span>
                        </button>
                      </div>
                    </div>

                    {formData.role === 'admin' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5 p-5 rounded-2xl bg-gold/5 border border-gold/20"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gold/60 uppercase tracking-[0.2em]">Sport in Charge</label>
                            <div className="relative">
                              <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/40" />
                              <select 
                                className="w-full bg-black/40 border border-gold/20 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-gold transition-all appearance-none"
                                value={formData.sport}
                                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                              >
                                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gold/60 uppercase tracking-[0.2em]">Level Category</label>
                            <div className="relative">
                              <Award className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/40" />
                              <select 
                                className="w-full bg-black/40 border border-gold/20 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-gold transition-all appearance-none"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                              >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gold/60 uppercase tracking-[0.2em]">Sport Admin Password</label>
                          <div className="relative group">
                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/40 group-focus-within:text-gold transition-colors" />
                            <input 
                              type="password"
                              required
                              placeholder="Enter special admin key"
                              className="w-full bg-black/40 border border-gold/20 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-gold transition-all"
                              value={formData.adminPassword}
                              onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                            />
                          </div>
                          <p className="text-[10px] text-gold/40 italic">Required to verify authorized sports officials.</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary py-4 flex items-center justify-center space-x-2 group relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20 translate-x-[-100%]"
                    whileHover={{ translateX: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="relative z-10 font-black uppercase tracking-[0.2em]">
                    {loading ? 'Processing...' : (isLogin ? 'Enter Arena' : 'Join Arena')}
                  </span>
                  {!loading && <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
