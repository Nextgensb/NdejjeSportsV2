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
  MapPin,
  Search,
  Bell,
  Menu,
  X,
  Download,
  Maximize2,
  LogOut,
  Settings,
  Activity,
  Award,
  History,
  ChevronLeft,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, db, rtdb } from '../lib/firebase';
import { ref, push, onValue, serverTimestamp as rtdbTimestamp, query as rtdbQuery, limitToLast } from 'firebase/database';
import { collection, query, onSnapshot, orderBy, limit, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import { signOut, updateEmail, updatePassword } from 'firebase/auth';
import { HOUSES, SPORTS } from '../constants';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

interface OverallLeaderboard {
  id: string;
  houseName: string;
  totalPoints: number;
  gold: number;
  silver: number;
  bronze: number;
  rank: number;
}

interface SportLeaderboard {
  id: string;
  sport: string;
  house: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
  rank: number;
}

interface MVP {
  id: string;
  playerName: string;
  house: string;
  sport: string;
  position: string;
  achievements: string;
  points: number;
}

interface Match {
  id: string;
  sport: string;
  houseA: string;
  houseB: string;
  scoreA: number;
  scoreB: number;
  date: string;
  result: string;
}

interface Fixture {
  id: string;
  sport: string;
  teamA: string;
  teamB: string;
  date: string;
  time: string;
  venue: string;
  category: string;
}

type Tab = 'overall' | 'sport' | 'mvp' | 'recent' | 'fixtures' | 'account' | 'chat';

export default function UserDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overall');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState(SPORTS[0]);
  const [selectedSeason, setSelectedSeason] = useState('2025/2026');
  
  const seasons = ['2025/2026', '2024/2025', '2023/2024'];
  
  // Data States
  const [overallData, setOverallData] = useState<OverallLeaderboard[]>([]);
  const [sportData, setSportData] = useState<SportLeaderboard[]>([]);
  const [mvpData, setMvpData] = useState<MVP[]>([]);
  const [matchData, setMatchData] = useState<Match[]>([]);
  const [fixtureData, setFixtureData] = useState<Fixture[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Account States
  const [email, setEmail] = useState(profile?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Real-time Data Fetching
  useEffect(() => {
    const unsubOverall = onSnapshot(
      query(collection(db, 'overall_leaderboard'), where('season', '==', selectedSeason), orderBy('totalPoints', 'desc')),
      (snap) => setOverallData(snap.docs.map(d => ({ id: d.id, ...d.data() } as OverallLeaderboard)))
    );

    const unsubSport = onSnapshot(
      query(collection(db, 'sport_leaderboards'), where('season', '==', selectedSeason), where('sport', '==', selectedSport), orderBy('points', 'desc')),
      (snap) => setSportData(snap.docs.map(d => ({ id: d.id, ...d.data() } as SportLeaderboard)))
    );

    const unsubMvp = onSnapshot(
      query(collection(db, 'mvps'), where('season', '==', selectedSeason), orderBy('points', 'desc')),
      (snap) => setMvpData(snap.docs.map(d => ({ id: d.id, ...d.data() } as MVP)))
    );

    const unsubMatches = onSnapshot(
      query(collection(db, 'matches'), where('season', '==', selectedSeason), orderBy('date', 'desc'), limit(20)),
      (snap) => setMatchData(snap.docs.map(d => ({ id: d.id, ...d.data() } as Match)))
    );

    const unsubFixtures = onSnapshot(
      query(collection(db, 'fixtures'), where('season', '==', selectedSeason), where('status', '==', 'scheduled'), orderBy('date', 'asc')),
      (snap) => setFixtureData(snap.docs.map(d => ({ id: d.id, ...d.data() } as Fixture)))
    );

    return () => {
      unsubOverall();
      unsubSport();
      unsubMvp();
      unsubMatches();
      unsubFixtures();
    };
  }, [selectedSport, selectedSeason]);

  // Chat logic
  useEffect(() => {
    if (activeTab === 'chat') {
      const chatRef = rtdbQuery(ref(rtdb, 'chat'), limitToLast(50));
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
      timestamp: Date.now()
    });
    setNewMessage('');
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsUpdating(true);
    setAccountError('');
    setAccountSuccess('');

    try {
      if (email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, email);
      }
      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
      }
      setAccountSuccess('Account updated successfully!');
      setNewPassword('');
    } catch (err: any) {
      setAccountError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadData = (format: 'pdf' | 'csv' | 'excel') => {
    let data: any[] = [];
    let filename = `ndejje_sports_${activeTab}_${new Date().toISOString().split('T')[0]}`;
    let headers: string[] = [];

    switch (activeTab) {
      case 'overall':
        data = overallData;
        headers = ['Rank', 'House', 'Points', 'Gold', 'Silver', 'Bronze'];
        break;
      case 'sport':
        data = sportData;
        headers = ['Rank', 'House', 'Played', 'Wins', 'Losses', 'Points'];
        break;
      case 'mvp':
        data = mvpData;
        headers = ['Player', 'House', 'Sport', 'Points', 'Achievements'];
        break;
      case 'recent':
        data = matchData;
        headers = ['Sport', 'House A', 'House B', 'Score', 'Date', 'Result'];
        break;
      case 'fixtures':
        data = fixtureData;
        headers = ['Sport', 'Team A', 'Team B', 'Date', 'Time', 'Venue'];
        break;
    }

    if (format === 'csv') {
      const csvContent = [
        headers.join(','),
        ...data.map(row => Object.values(row).slice(1).join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(`NDEJJE SPORTS - ${activeTab.toUpperCase()} REPORT`, 14, 15);
      (doc as any).autoTable({
        head: [headers],
        body: data.map(row => {
          const { id, ...rest } = row;
          return Object.values(rest);
        }),
        startY: 20,
      });
      doc.save(`${filename}.pdf`);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      contentRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    switch (activeTab) {
      case 'overall':
        return overallData.filter(h => h.houseName.toLowerCase().includes(query));
      case 'sport':
        return sportData.filter(h => h.house.toLowerCase().includes(query));
      case 'mvp':
        return mvpData.filter(m => m.playerName.toLowerCase().includes(query) || m.house.toLowerCase().includes(query) || m.sport.toLowerCase().includes(query));
      case 'recent':
        return matchData.filter(m => m.houseA.toLowerCase().includes(query) || m.houseB.toLowerCase().includes(query) || m.sport.toLowerCase().includes(query));
      case 'fixtures':
        return fixtureData.filter(f => f.teamA.toLowerCase().includes(query) || f.teamB.toLowerCase().includes(query) || f.sport.toLowerCase().includes(query));
      default:
        return [];
    }
  };

  const filteredData = getFilteredData();

  const sidebarItems = [
    { id: 'overall', label: 'Overall Leaderboard', icon: Trophy },
    { id: 'sport', label: 'Per-Sport Leaderboard', icon: BarChart3 },
    { id: 'mvp', label: 'MVP Lists', icon: Award },
    { id: 'recent', label: 'Recent Games', icon: History },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'chat', label: 'Sports Chat', icon: MessageSquare },
    { id: 'account', label: 'User Account', icon: UserIcon },
  ];

  return (
    <div className="flex h-screen bg-app-bg overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        className="bg-app-card border-r border-app-border flex flex-col relative z-30"
      >
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <Trophy className="h-6 w-6 text-gold" />
              <span className="font-black text-lg text-app-text tracking-tighter uppercase">NDEJJE <span className="text-gold">SPORTS</span></span>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-app-bg rounded-lg text-app-text/50 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {!isSidebarCollapsed && (
          <div className="px-6 mb-6">
            <div className="bg-app-bg/50 border border-app-border rounded-xl p-3">
              <label className="text-[10px] font-black text-app-text/30 uppercase tracking-widest block mb-2">Active Season</label>
              <select 
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full bg-transparent text-app-text font-bold text-sm focus:outline-none appearance-none cursor-pointer"
              >
                {seasons.map(s => <option key={s} value={s} className="bg-app-card">{s}</option>)}
              </select>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center p-3 rounded-xl transition-all group ${
                activeTab === item.id 
                  ? 'bg-gold text-black font-bold shadow-lg shadow-gold/20' 
                  : 'text-app-text/40 hover:bg-app-bg hover:text-app-text'
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${activeTab === item.id ? 'text-black' : 'group-hover:text-gold'}`} />
              {!isSidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 text-sm uppercase tracking-widest font-bold truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-app-border">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isSidebarCollapsed && (
              <span className="ml-3 text-sm uppercase tracking-widest font-bold">Logout</span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Utility Bar */}
        <header className="h-20 bg-app-card border-b border-app-border flex items-center justify-between px-8 z-20">
          <div className="flex items-center space-x-8 flex-1">
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 text-app-text/50 hover:text-gold transition-colors">
                <Menu className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden lg:block">Quick Nav</span>
              </button>
              <div className="absolute left-0 mt-2 w-64 bg-app-card border border-app-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <div className="p-4 bg-app-bg/50 border-b border-app-border">
                  <span className="text-[10px] font-black text-gold uppercase tracking-widest">Jump to Section</span>
                </div>
                {sidebarItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full text-left px-6 py-4 text-[10px] font-black transition-all border-b border-app-border last:border-0 uppercase tracking-widest flex items-center space-x-4 ${
                      activeTab === item.id ? 'bg-gold text-black' : 'text-app-text/60 hover:text-gold hover:bg-app-bg'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 max-w-xl relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-app-text/30 group-focus-within:text-gold transition-colors" />
              <input 
                type="text"
                placeholder="Search sports, teams, or players..."
                className="w-full bg-app-bg border border-app-border rounded-2xl py-3 pl-12 pr-4 text-app-text focus:outline-none focus:border-gold transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-app-text/50 hover:text-gold transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-gold rounded-full border-2 border-app-card" />
            </button>
            <div className="h-10 w-px bg-app-border" />
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <div className="text-sm font-black text-app-text uppercase tracking-tight">{profile?.displayName || 'User'}</div>
                <div className="text-[10px] font-bold text-gold uppercase tracking-widest">{profile?.role || 'Athlete'}</div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center overflow-hidden">
                <UserIcon className="h-6 w-6 text-gold" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide relative" ref={contentRef}>
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-black text-app-text uppercase tracking-tighter leading-none mb-2">
                  {sidebarItems.find(i => i.id === activeTab)?.label.split(' ')[0]} <span className="text-gold">{sidebarItems.find(i => i.id === activeTab)?.label.split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-app-text/50 text-sm font-medium uppercase tracking-widest italic">Tracking Excellence in Ndejje Sports</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={toggleFullScreen}
                  className="p-3 bg-app-card border border-app-border rounded-xl text-app-text/50 hover:text-gold transition-all"
                  title="Full Screen"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
                <div className="relative group">
                  <button className="btn-primary px-6 py-3 flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span className="font-bold uppercase tracking-widest text-xs">Download</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-app-card border border-app-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button onClick={() => downloadData('pdf')} className="w-full text-left px-4 py-3 text-sm text-app-text/70 hover:text-gold hover:bg-app-bg transition-colors border-b border-app-border rounded-t-xl">PDF Document</button>
                    <button onClick={() => downloadData('excel')} className="w-full text-left px-4 py-3 text-sm text-app-text/70 hover:text-gold hover:bg-app-bg transition-colors border-b border-app-border">Excel Spreadsheet</button>
                    <button onClick={() => downloadData('csv')} className="w-full text-left px-4 py-3 text-sm text-app-text/70 hover:text-gold hover:bg-app-bg transition-colors rounded-b-xl">CSV File</button>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overall' && (
                <motion.div 
                  key="overall"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Visual Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-6 border-t-4 border-gold h-[300px]">
                      <h3 className="text-xs font-black text-gold uppercase tracking-widest mb-6 flex items-center">
                        <BarChartIcon className="h-4 w-4 mr-2" />
                        Points Distribution
                      </h3>
                      <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={overallData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                          <XAxis dataKey="houseName" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                            itemStyle={{ color: '#FFD700', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="totalPoints" radius={[4, 4, 0, 0]}>
                            {overallData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#FFD700' : '#38bdf8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="glass-card p-6 border-t-4 border-sky-blue h-[300px]">
                      <h3 className="text-xs font-black text-sky-blue uppercase tracking-widest mb-6 flex items-center">
                        <PieChartIcon className="h-4 w-4 mr-2" />
                        Medal Standings (Gold)
                      </h3>
                      <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                          <Pie
                            data={overallData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="gold"
                            nameKey="houseName"
                          >
                            {overallData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#FFD700', '#38bdf8', '#fbbf24', '#f87171', '#34d399'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-card overflow-hidden border-t-4 border-gold">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-app-bg/50 border-b border-app-border">
                            <th className="px-8 py-5 text-[10px] font-black text-gold uppercase tracking-[0.2em]">Rank</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gold uppercase tracking-[0.2em]">House Name</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gold uppercase tracking-[0.2em]">Total Points</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gold uppercase tracking-[0.2em]">Medals (G/S/B)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(searchQuery ? filteredData : overallData).map((item, i) => (
                            <tr key={item.id} className="border-b border-app-border hover:bg-white/5 transition-colors group">
                              <td className="px-8 py-6">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-lg ${
                                  i === 0 ? 'bg-gold text-black' : 
                                  i === 1 ? 'bg-slate-300 text-black' : 
                                  i === 2 ? 'bg-amber-700 text-white' : 'text-app-text/50'
                                }`}>
                                  {i + 1}
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <div className="font-black text-app-text uppercase tracking-tight text-xl">{item.houseName}</div>
                              </td>
                              <td className="px-8 py-6">
                                <div className="text-3xl font-black text-sky-blue">{item.totalPoints}</div>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    <div className="h-3 w-3 rounded-full bg-gold" />
                                    <span className="font-bold text-app-text">{item.gold}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <div className="h-3 w-3 rounded-full bg-slate-300" />
                                    <span className="font-bold text-app-text">{item.silver}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <div className="h-3 w-3 rounded-full bg-amber-700" />
                                    <span className="font-bold text-app-text">{item.bronze}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'sport' && (
                <motion.div 
                  key="sport"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="flex flex-wrap gap-2">
                    {SPORTS.map(sport => (
                      <button
                        key={sport}
                        onClick={() => setSelectedSport(sport)}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                          selectedSport === sport 
                            ? 'bg-gold text-black shadow-lg' 
                            : 'bg-app-card text-app-text/40 hover:text-app-text border border-app-border'
                        }`}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>

                  <div className="glass-card overflow-hidden border-t-4 border-sky-blue">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-app-bg/50 border-b border-app-border">
                            <th className="px-8 py-5 text-[10px] font-black text-sky-blue uppercase tracking-[0.2em]">Rank</th>
                            <th className="px-8 py-5 text-[10px] font-black text-sky-blue uppercase tracking-[0.2em]">House</th>
                            <th className="px-8 py-5 text-[10px] font-black text-sky-blue uppercase tracking-[0.2em]">Played</th>
                            <th className="px-8 py-5 text-[10px] font-black text-sky-blue uppercase tracking-[0.2em]">W / L</th>
                            <th className="px-8 py-5 text-[10px] font-black text-sky-blue uppercase tracking-[0.2em]">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(searchQuery ? filteredData : sportData).map((item, i) => (
                            <tr key={item.id} className="border-b border-app-border hover:bg-white/5 transition-colors">
                              <td className="px-8 py-6 font-black text-app-text/50">#{i + 1}</td>
                              <td className="px-8 py-6 font-black text-app-text uppercase tracking-tight">{item.house}</td>
                              <td className="px-8 py-6 font-bold text-app-text">{item.played}</td>
                              <td className="px-8 py-6">
                                <span className="text-emerald-500 font-bold">{item.wins}</span>
                                <span className="mx-2 text-app-text/20">/</span>
                                <span className="text-red-500 font-bold">{item.losses}</span>
                              </td>
                              <td className="px-8 py-6 text-2xl font-black text-gold">{item.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'mvp' && (
                <motion.div 
                  key="mvp"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {(searchQuery ? filteredData : mvpData).map((mvp, i) => (
                    <div key={mvp.id} className="glass-card p-8 border-t-4 border-gold group hover:scale-[1.02] transition-all">
                      <div className="flex items-center justify-between mb-6">
                        <div className="h-16 w-16 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 group-hover:bg-gold group-hover:text-black transition-all">
                          <Award className="h-8 w-8" />
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black text-gold uppercase tracking-widest mb-1">{mvp.sport}</div>
                          <div className="text-3xl font-black text-app-text">{mvp.points} <span className="text-xs text-app-text/30">PTS</span></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-app-text uppercase tracking-tighter leading-none">{mvp.playerName}</h3>
                        <p className="text-gold font-bold uppercase tracking-widest text-xs">{mvp.house} House</p>
                      </div>
                      <div className="mt-6 pt-6 border-t border-app-border">
                        <div className="text-[10px] font-black text-app-text/30 uppercase tracking-widest mb-2">Key Achievement</div>
                        <p className="text-sm text-app-text/70 italic font-medium">"{mvp.achievements}"</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'recent' && (
                <motion.div 
                  key="recent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card overflow-hidden border-t-4 border-sky-blue"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-app-bg/50 border-b border-app-border">
                          <th className="px-8 py-5 text-[10px] font-black text-sky-blue uppercase tracking-[0.2em]">Sport</th>
                          <th className="px-8 py-5 text-[10px] font-black text-sky-blue uppercase tracking-[0.2em]">Matchup</th>
                          <th className="px-8 py-5 text-[10px] font-black text-sky-blue uppercase tracking-[0.2em]">Final Score</th>
                          <th className="px-8 py-5 text-[10px] font-black text-sky-blue uppercase tracking-[0.2em]">Date</th>
                          <th className="px-8 py-5 text-[10px] font-black text-sky-blue uppercase tracking-[0.2em]">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(searchQuery ? filteredData : matchData).map((match) => (
                          <tr key={match.id} className="border-b border-app-border hover:bg-white/5 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-3">
                                <Activity className="h-4 w-4 text-gold" />
                                <span className="font-bold text-app-text uppercase text-xs tracking-widest">{match.sport}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-4">
                                <span className="font-black text-app-text uppercase tracking-tight">{match.houseA}</span>
                                <span className="text-[10px] font-black text-app-text/20 uppercase">VS</span>
                                <span className="font-black text-app-text uppercase tracking-tight">{match.houseB}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="text-2xl font-black text-gold tracking-widest">{match.scoreA} - {match.scoreB}</div>
                            </td>
                            <td className="px-8 py-6 text-sm text-app-text/50 font-bold">{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                            <td className="px-8 py-6">
                              <span className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                {match.result}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'fixtures' && (
                <motion.div 
                  key="fixtures"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {(searchQuery ? filteredData : fixtureData).map((fixture) => (
                    <div key={fixture.id} className="glass-card p-8 border-t-4 border-gold relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Calendar className="h-24 w-24 text-gold" />
                      </div>
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                          <div className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                          <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">{fixture.sport} • {fixture.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-app-text">{fixture.date}</div>
                          <div className="text-[10px] font-bold text-app-text/40 uppercase tracking-widest">{fixture.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-8">
                        <div className="text-center flex-1">
                          <div className="text-2xl font-black text-app-text uppercase tracking-tighter mb-1">{fixture.teamA}</div>
                          <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">Home Team</div>
                        </div>
                        <div className="px-6 text-xl font-black text-gold italic">VS</div>
                        <div className="text-center flex-1">
                          <div className="text-2xl font-black text-app-text uppercase tracking-tighter mb-1">{fixture.teamB}</div>
                          <div className="text-[10px] font-bold text-app-text/30 uppercase tracking-widest">Away Team</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-app-text/40">
                        <MapPin className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{fixture.venue || 'Main Arena'}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card flex flex-col h-[calc(100vh-280px)] overflow-hidden border-t-4 border-gold"
                >
                  <div className="p-6 border-b border-app-border flex items-center justify-between bg-app-bg/50">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-gold animate-pulse" />
                      <h3 className="font-black text-app-text uppercase tracking-widest text-sm">Ndejje Sports Community</h3>
                    </div>
                    <div className="text-[10px] text-app-text/50 font-black uppercase tracking-widest">
                      {messages.length} Active Messages
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender === (profile?.displayName || profile?.email) ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-[10px] font-black text-gold uppercase tracking-widest">{msg.sender}</span>
                          <span className="text-[10px] text-app-text/30 flex items-center font-bold">
                            <Clock className="h-3 w-3 mr-1" />
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                          </span>
                        </div>
                        <div className={`max-w-[70%] p-4 rounded-2xl text-sm shadow-xl ${
                          msg.sender === (profile?.displayName || profile?.email)
                            ? 'bg-gold text-black font-bold rounded-tr-none'
                            : 'bg-app-card text-app-text border border-app-border rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="p-6 bg-app-bg/50 border-t border-app-border flex gap-4">
                    <input 
                      type="text"
                      placeholder="Share your thoughts on the latest results..."
                      className="flex-1 bg-app-card border border-app-border rounded-2xl px-6 py-4 text-sm text-app-text focus:outline-none focus:border-gold transition-all shadow-inner"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="p-4 bg-gold text-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20">
                      <Send className="h-6 w-6" />
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div 
                  key="account"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto space-y-8"
                >
                  <div className="glass-card p-10 border-t-4 border-gold">
                    <div className="flex items-center space-x-6 mb-10">
                      <div className="h-24 w-24 rounded-3xl bg-gold/10 border-2 border-gold/30 flex items-center justify-center">
                        <UserIcon className="h-12 w-12 text-gold" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-app-text uppercase tracking-tighter leading-none mb-2">{profile?.displayName || 'User Profile'}</h2>
                        <p className="text-gold font-bold uppercase tracking-widest text-xs">{profile?.role || 'Normal User'} • Member since 2026</p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateAccount} className="space-y-6">
                      {accountError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center space-x-3">
                          <AlertCircle className="h-5 w-5" />
                          <span>{accountError}</span>
                        </div>
                      )}
                      {accountSuccess && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center space-x-3">
                          <CheckCircle2 className="h-5 w-5" />
                          <span>{accountSuccess}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-app-text/30 uppercase tracking-[0.2em]">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-app-text/20 group-focus-within:text-gold transition-colors" />
                          <input 
                            type="email"
                            className="w-full bg-app-bg border border-app-border rounded-xl py-4 pl-12 pr-4 text-app-text focus:outline-none focus:border-gold transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-app-text/30 uppercase tracking-[0.2em]">New Password (Leave blank to keep current)</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-app-text/20 group-focus-within:text-gold transition-colors" />
                          <input 
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-app-bg border border-app-border rounded-xl py-4 pl-12 pr-4 text-app-text focus:outline-none focus:border-gold transition-all"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isUpdating}
                        className="w-full btn-primary py-4 font-black uppercase tracking-[0.2em] shadow-xl shadow-gold/20"
                      >
                        {isUpdating ? 'Updating...' : 'Save Changes'}
                      </button>
                    </form>
                  </div>

                  <div className="glass-card p-10 border-t-4 border-red-500">
                    <h3 className="text-xl font-black text-app-text uppercase tracking-tight mb-4">Danger Zone</h3>
                    <p className="text-app-text/50 text-sm mb-6 font-medium">Once you logout, you will need to re-authenticate to access your sports data.</p>
                    <button 
                      onClick={handleLogout}
                      className="w-full py-4 border-2 border-red-500/50 text-red-500 font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      Logout Securely
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
