import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Calendar, 
  Trophy, 
  MessageSquare, 
  ChevronRight, 
  Filter,
  Send,
  User as UserIcon,
  Clock,
  TrendingUp,
  Medal,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { rtdb } from '../lib/firebase';
import { ref, push, onValue, serverTimestamp, query, limitToLast } from 'firebase/database';
import { HOUSES, SPORTS } from '../constants';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

export default function UserDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'fixtures' | 'results' | 'mvp' | 'chat'>('overview');
  const [selectedSeason, setSelectedSeason] = useState('2026');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Chat logic
  useEffect(() => {
    if (activeTab === 'chat') {
      const chatRef = query(ref(rtdb, 'chat'), limitToLast(50));
      const unsubscribe = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const msgList = Object.entries(data).map(([id, val]: [string, any]) => ({
            id,
            ...val
          }));
          setMessages(msgList);
        }
      });
      return () => unsubscribe();
    }
  }, [activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile) return;

    const chatRef = ref(rtdb, 'chat');
    await push(chatRef, {
      text: newMessage,
      sender: profile.displayName || profile.email,
      timestamp: serverTimestamp()
    });
    setNewMessage('');
  };

  const seasons = ['2026', '2025', '2024'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 bg-app-bg min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 space-y-6">
        <div className="glass-card p-6 border-t-4 border-gold">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
              <UserIcon className="h-5 w-5 text-gold" />
            </div>
            <div>
              <div className="text-sm font-bold text-app-text">{profile?.displayName || 'Athlete'}</div>
              <div className="text-xs text-app-text/50 uppercase tracking-widest font-black">Muteesa House</div>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'fixtures', label: 'Fixtures', icon: Calendar },
              { id: 'results', label: 'Results', icon: History },
              { id: 'mvp', label: 'MVP Race', icon: Trophy },
              { id: 'chat', label: 'House Chat', icon: MessageSquare },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-gold text-black font-bold shadow-lg shadow-gold/20' 
                    : 'text-app-text/40 hover:bg-app-card hover:text-app-text'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </div>
                {activeTab !== item.id && <ChevronRight className="h-4 w-4 opacity-50" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Season Selector */}
        <div className="glass-card p-6">
          <label className="text-xs font-bold text-app-text/50 uppercase tracking-widest mb-4 block">Select Season</label>
          <div className="space-y-2">
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`w-full p-2 rounded-lg text-sm font-bold transition-all ${
                  selectedSeason === season 
                    ? 'bg-gold/10 text-gold border border-gold/30' 
                    : 'text-app-text/40 hover:text-app-text'
                }`}
              >
                {season} Season
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Overall Rank', value: '#2', sub: 'Muteesa House', color: 'text-gold' },
                  { label: 'Total Points', value: '840', sub: '+120 this week', color: 'text-sky-blue' },
                  { label: 'Games Played', value: '42', sub: 'Across 8 sports', color: 'text-app-text' },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-6">
                    <div className="text-xs font-bold text-app-text/50 uppercase tracking-widest mb-2">{stat.label}</div>
                    <div className={`text-4xl font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-app-text/40 mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8 border-t-4 border-sky-blue">
                  <h3 className="text-xl font-bold text-app-text mb-6 uppercase tracking-tight">Performance <span className="text-sky-blue">per Sport</span></h3>
                  <div className="space-y-6">
                    {[
                      { sport: 'Football', score: 85, color: 'bg-gold' },
                      { sport: 'Basketball', score: 65, color: 'bg-sky-blue' },
                      { sport: 'Athletics', score: 92, color: 'bg-gold' },
                      { sport: 'Volleyball', score: 45, color: 'bg-sky-blue' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-app-text/50 uppercase tracking-widest text-xs">{item.sport}</span>
                          <span className="text-app-text">{item.score}%</span>
                        </div>
                        <div className="h-2 bg-app-bg rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.score}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className={`h-full ${item.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-8 border-t-4 border-gold">
                  <h3 className="text-xl font-bold text-app-text mb-6 uppercase tracking-tight">Recent <span className="text-gold">Achievements</span></h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Gold Medal', sport: '100m Sprint', date: '2 days ago' },
                      { title: 'MVP Award', sport: 'Basketball', date: '1 week ago' },
                      { title: 'Clean Sheet', sport: 'Football', date: 'Mar 01' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center space-x-4 p-3 rounded-xl bg-app-bg border border-app-border hover:gold-border transition-all">
                        <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-gold" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-app-text uppercase">{item.title}</div>
                          <div className="text-xs text-app-text/50 uppercase tracking-widest">{item.sport} • {item.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'fixtures' && (
            <motion.div 
              key="fixtures"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-app-text uppercase tracking-tight">Upcoming <span className="text-gold">Fixtures</span></h2>
                <button className="flex items-center space-x-2 bg-app-card px-4 py-2 rounded-lg text-sm font-bold text-app-text/50 hover:text-app-text transition-colors uppercase tracking-widest border border-app-border">
                  <Filter className="h-4 w-4" />
                  <span>Filter Sport</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="glass-card p-6 flex items-center justify-between group hover:gold-border transition-all">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-xs font-bold text-gold uppercase">Mar 0{i+4}</div>
                        <div className="text-xl font-black text-white">14:30</div>
                      </div>
                      <div className="h-12 w-px bg-app-border" />
                      <div>
                        <div className="text-xs font-bold text-app-text/50 uppercase tracking-widest mb-1">Football • Senior Boys</div>
                        <div className="text-lg font-bold text-app-text uppercase tracking-tight">Muteesa vs Kabalega</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-app-text/20 group-hover:text-gold transition-colors" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card flex flex-col h-full max-h-[700px] overflow-hidden border-t-4 border-gold"
            >
              <div className="p-6 border-b border-app-border flex items-center justify-between bg-app-bg/50">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-gold animate-pulse" />
                  <h3 className="font-bold text-app-text uppercase tracking-widest text-sm">Ndejje Sports Chat</h3>
                </div>
                <div className="text-xs text-app-text/50 font-bold uppercase tracking-widest">
                  {messages.length} Messages
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === (profile?.displayName || profile?.email) ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-bold text-app-text/50 uppercase tracking-widest">{msg.sender}</span>
                      <span className="text-[10px] text-app-text/30 flex items-center">
                        <Clock className="h-2 w-2 mr-1" />
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                      </span>
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender === (profile?.displayName || profile?.email)
                        ? 'bg-gold text-black font-medium rounded-tr-none'
                        : 'bg-app-bg text-app-text border border-app-border rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-app-bg/50 border-t border-app-border flex gap-4">
                <input 
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 bg-app-card border border-app-border rounded-xl px-4 py-3 text-sm text-app-text focus:outline-none focus:border-gold transition-colors"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="p-3 bg-gold text-black rounded-xl hover:scale-105 transition-transform">
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
