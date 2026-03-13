import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Trophy, 
  Calendar, 
  Users, 
  ArrowRight, 
  Play, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Medal,
  Activity,
  Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { HOUSES, SPORTS } from '../constants';

const Counter = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      countRef.current = Math.floor(progress * end);
      setCount(countRef.current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count}</span>;
};

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex space-x-2 text-[10px] font-bold text-gold">
      <span>{timeLeft.days}d</span>
      <span>{timeLeft.hours}h</span>
      <span>{timeLeft.minutes}m</span>
      <span>{timeLeft.seconds}s</span>
    </div>
  );
};

export default function Home() {
  const [activeSportTab, setActiveSportTab] = useState('Football');
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  const upcomingEvents = [
    { id: 1, sport: 'Football', teamA: 'Muteesa', teamB: 'Lumumba', date: '2026-03-20T15:00:00', icon: '⚽' },
    { id: 2, sport: 'Basketball', teamA: 'Kabalega', teamB: 'Walusimbi', date: '2026-04-02T16:00:00', icon: '🏀' },
    { id: 3, sport: 'Netball', teamA: 'Muyingo', teamB: 'Lubambula', date: '2026-03-25T14:00:00', icon: '🏐' },
    { id: 4, sport: 'Cricket', teamA: 'Mboya', teamB: 'Walusimbi', date: '2026-03-28T10:00:00', icon: '🏏' },
  ];

  const fixtures = [
    { sport: 'Football', teamA: 'Muteesa', teamB: 'Lumumba', date: 'March 20', time: '3:00 PM' },
    { sport: 'Basketball', teamA: 'Kabalega', teamB: 'Walusimbi', date: 'April 02', time: '4:00 PM' },
    { sport: 'Netball', teamA: 'Muyingo', teamB: 'Lubambula', date: 'March 25', time: '2:00 PM' },
    { sport: 'Cricket', teamA: 'Mboya', teamB: 'Walusimbi', date: 'March 28', time: '10:00 AM' },
    { sport: 'Chess', teamA: 'Muteesa', teamB: 'Muyingo', date: 'March 30', time: '11:00 AM' },
  ];

  const leaderboard = [
    { rank: 1, house: 'Muteesa', points: 1250, gold: 12, silver: 8, bronze: 5 },
    { rank: 2, house: 'Lumumba', points: 1180, gold: 10, silver: 12, bronze: 7 },
    { rank: 3, house: 'Kabalega', points: 1050, gold: 8, silver: 9, bronze: 12 },
    { rank: 4, house: 'Walusimbi', points: 980, gold: 7, silver: 6, bronze: 10 },
    { rank: 5, house: 'Muyingo', points: 890, gold: 5, silver: 8, bronze: 9 },
  ];

  const galleryImages = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1461896756984-3ef185f2518e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=800',
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1920" 
            alt="Sports Background" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sports-black via-transparent to-sports-black" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="flex justify-center space-x-6 mb-8">
              {['⚽', '🏀', '🏐', '♟'].map((icon, i) => (
                <motion.span 
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                >
                  {icon}
                </motion.span>
              ))}
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-4 leading-none uppercase">
              NDEJJE <span className="text-gold">SPORTS</span> <br />
              <span className="text-sky-blue text-3xl md:text-5xl lg:text-6xl">MANAGEMENT SYSTEM</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-medium tracking-wide mb-12 max-w-3xl mx-auto italic">
              "Tracking Performance, Celebrating Champions"
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <button onClick={() => scrollToSection('fixtures')} className="btn-primary group">
                <span>View Fixtures</span>
                <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => scrollToSection('leaderboard')} className="btn-secondary">
                View Leaderboard
              </button>
              <button onClick={() => scrollToSection('leaderboard')} className="btn-outline-gold">
                Latest Results
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Upcoming Sports Events Section */}
      <section className="py-24 bg-sports-gray/30 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              Upcoming <span className="text-gold">Sports Events</span>
            </h2>
            <div className="flex space-x-2">
              <button className="p-2 glass-card hover:bg-gold hover:text-black transition-all"><ChevronLeft className="h-5 w-5" /></button>
              <button className="p-2 glass-card hover:bg-gold hover:text-black transition-all"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x">
            {upcomingEvents.map((event) => (
              <motion.div 
                key={event.id}
                whileHover={{ y: -10 }}
                className="min-w-[300px] md:min-w-[350px] glass-card p-6 snap-start group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">
                  {event.icon}
                </div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-gold/10 rounded-xl">
                    <Activity className="h-6 w-6 text-gold" />
                  </div>
                  <span className="text-sm font-bold text-sky-blue uppercase tracking-widest">{event.sport}</span>
                </div>
                <div className="text-2xl font-black text-white mb-4 flex items-center justify-between">
                  <span>{event.teamA}</span>
                  <span className="text-gold text-sm mx-2 italic">VS</span>
                  <span>{event.teamB}</span>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    {event.date.split('T')[0]} • {event.date.split('T')[1].substring(0, 5)}
                  </div>
                  <CountdownTimer targetDate={event.date} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Last Season Overview (Article) */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block py-1 px-4 rounded-full bg-sky-blue/10 text-sky-blue text-xs font-bold tracking-widest uppercase mb-6 border border-sky-blue/20">
              Season Review
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight uppercase">
              A Season of <span className="text-gold">Unmatched Grit</span> and Excellence
            </h2>
            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed">
              <p className="text-lg mb-6 italic text-white/80">"The 2025 season was a testament to the spirit of Ndejje athletes. From the muddy football pitches to the strategic chess boards, every house showed incredible determination."</p>
              <p className="mb-6">
                Our Sports Teacher, Mr. Ssekandi, noted that this year saw a record-breaking participation rate. Muteesa House dominated the track events, while Lumumba House proved their tactical prowess in Basketball and Chess.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-10">
                <div className="p-4 glass-card border-l-4 border-gold">
                  <h4 className="text-white font-bold mb-1 uppercase text-xs">Key Achievement</h4>
                  <p className="text-sm">New record in 100m Senior Boys sprint.</p>
                </div>
                <div className="p-4 glass-card border-l-4 border-sky-blue">
                  <h4 className="text-white font-bold mb-1 uppercase text-xs">Notable Competition</h4>
                  <p className="text-sm">The Handball finals reached triple overtime.</p>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gold/20 blur-3xl rounded-full" />
            <img 
              src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200" 
              alt="Sports Teacher" 
              className="relative rounded-3xl shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-6 left-6 right-6 p-6 glass-card">
              <p className="text-sm font-bold text-gold uppercase tracking-widest mb-1">Sports Teacher</p>
              <p className="text-xl font-black text-white">Mr. Ssekandi</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Sportsman of the Year Feature */}
      <section className="py-24 bg-gold/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="glass-card p-12 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Trophy className="h-64 w-64 text-gold" />
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative w-full lg:w-1/3 aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.3)] border-2 border-gold/30"
            >
              <img 
                src="https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=800" 
                alt="Sportsman of the Year" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gold/40 to-transparent" />
            </motion.div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
                <Medal className="h-8 w-8 text-gold" />
                <span className="text-xl font-black text-gold uppercase tracking-widest">Sportsman of the Year</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">
                Kato <span className="text-gold">Ivan</span>
              </h2>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                <span className="bg-sky-blue/20 text-sky-blue px-4 py-1 rounded-full text-sm font-bold border border-sky-blue/30">Muteesa House</span>
                <span className="bg-gold/20 text-gold px-4 py-1 rounded-full text-sm font-bold border border-gold/30">Football & Athletics</span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mb-8">
                Ivan led Muteesa House to victory in the Football finals and broke the long-standing record in the 200m Senior Boys sprint. His leadership and dedication have set a new standard for excellence at Ndejje.
              </p>
              <button className="btn-primary">View Full Profile</button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Last Season Leaderboard */}
      <section id="leaderboard" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-4">
              Last Season <span className="text-gold">Leaderboard</span>
            </h2>
            <p className="text-gray-400">Final standings based on points accumulated across all sports.</p>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500">Rank</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500">House Name</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500">Points</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500">Gold</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500">Silver</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-gray-500">Bronze</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.map((row, i) => (
                    <motion.tr 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`hover:bg-white/5 transition-colors ${i === 0 ? 'bg-gold/5' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <span className={`text-2xl font-black ${i === 0 ? 'text-gold' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-white/20'}`}>
                          {i + 1 < 10 ? `0${i + 1}` : i + 1}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-8 rounded-full ${i === 0 ? 'bg-gold' : 'bg-sky-blue'}`} />
                          <span className="font-bold text-white text-lg">{row.house}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-xl text-white">
                        <Counter end={row.points} />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2 text-gold font-bold">
                          <Medal className="h-4 w-4" />
                          <span>{row.gold}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2 text-gray-300 font-bold">
                          <Medal className="h-4 w-4" />
                          <span>{row.silver}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2 text-orange-400 font-bold">
                          <Medal className="h-4 w-4" />
                          <span>{row.bronze}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Fixtures Section (Tabs) */}
      <section id="fixtures" className="py-24 bg-sports-gray/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">
              Match <span className="text-sky-blue">Fixtures</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((sport) => (
                <button
                  key={sport}
                  onClick={() => setActiveSportTab(sport)}
                  className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
                    activeSportTab === sport 
                      ? 'bg-sky-blue text-black border-sky-blue shadow-[0_0_15px_rgba(0,180,216,0.4)]' 
                      : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {fixtures.filter(f => f.sport === activeSportTab).length > 0 ? (
                fixtures.filter(f => f.sport === activeSportTab).map((fixture, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 border-t-4 border-sky-blue group"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{fixture.sport}</div>
                      <div className="p-2 bg-sky-blue/10 rounded-lg">
                        <Calendar className="h-4 w-4 text-sky-blue" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xl font-black text-white mb-8">
                      <span>{fixture.teamA}</span>
                      <span className="text-sky-blue text-sm italic">VS</span>
                      <span>{fixture.teamB}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs font-bold uppercase tracking-widest text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gold" />
                        <span>{fixture.time}</span>
                      </div>
                      <span>{fixture.date}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-gray-500 font-bold uppercase tracking-widest">
                  No upcoming {activeSportTab} fixtures found.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 7. Quick Sports Statistics */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Matches Played', value: 450, icon: Activity, color: 'text-gold' },
              { label: 'Sports Available', value: 12, icon: Trophy, color: 'text-sky-blue' },
              { label: 'Participating Houses', value: 7, icon: Users, color: 'text-gold' },
              { label: 'Total Athletes', value: 850, icon: Medal, color: 'text-sky-blue' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-8 glass-card"
              >
                <stat.icon className={`h-10 w-10 mx-auto mb-6 ${stat.color}`} />
                <div className="text-4xl md:text-5xl font-black text-white mb-2">
                  <Counter end={stat.value} />
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Interactive Sports Gallery */}
      <section className="py-24 bg-sports-gray/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">
              Sports <span className="text-gold">Gallery</span>
            </h2>
            <div className="flex items-center space-x-2 text-sky-blue font-bold uppercase tracking-widest text-xs">
              <ImageIcon className="h-4 w-4" />
              <span>Moments in Motion</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {galleryImages.map((img, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-xl border border-white/10 group"
              >
                <img 
                  src={img} 
                  alt={`Gallery ${i}`} 
                  className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
