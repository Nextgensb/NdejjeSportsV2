import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Save, 
  Trash2, 
  Edit2, 
  Calendar, 
  Trophy, 
  Users, 
  Settings,
  ChevronDown,
  LayoutDashboard,
  History,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { HOUSES, SPORTS, CATEGORIES, GENDERS } from '../constants';

type Category = typeof CATEGORIES[number];
type Gender = typeof GENDERS[number];
type Sport = typeof SPORTS[number];

export default function AdminDashboard() {
  const [gender, setGender] = useState<Gender>('Boys');
  const [category, setCategory] = useState<Category>('Junior');
  const [activeTab, setActiveTab] = useState<'fixtures' | 'record' | 'history' | 'seasons'>('fixtures');
  
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
            Admin <span className="text-gold">Control Center</span>
          </h1>
          <p className="text-gray-400 mt-1">Manage competitions, records, and seasonal data.</p>
        </div>

        <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setGender('Boys')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              gender === 'Boys' ? 'bg-sky-blue text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Boys</span>
          </button>
          <button 
            onClick={() => setGender('Girls')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              gender === 'Girls' ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Girls</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all border-2 ${
              category === cat 
                ? 'border-gold text-gold bg-gold/10' 
                : 'border-white/5 text-gray-500 hover:border-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-4">
          {[
            { id: 'fixtures', label: 'Fixture Management', icon: Calendar },
            { id: 'record', label: 'Record Game', icon: Trophy },
            { id: 'history', label: 'Game Records', icon: History },
            { id: 'seasons', label: 'Season Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 p-4 rounded-2xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white border border-white/20 shadow-xl' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-gold' : ''}`} />
              <span className="font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'fixtures' && (
              <motion.div 
                key="fixtures"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 border-t-4 border-gold"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Add New <span className="text-gold">Fixture</span></h2>
                  <button className="flex items-center space-x-2 text-sky-blue hover:underline text-sm font-bold uppercase tracking-widest">
                    <Plus className="h-4 w-4" />
                    <span>Add Multiple</span>
                  </button>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sport</label>
                    <select className="w-full bg-sports-black border border-white/10 rounded-xl p-3 text-white focus:border-gold outline-none">
                      {SPORTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date & Time</label>
                    <input type="datetime-local" className="w-full bg-sports-black border border-white/10 rounded-xl p-3 text-white focus:border-gold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">House A</label>
                    <select className="w-full bg-sports-black border border-white/10 rounded-xl p-3 text-white focus:border-gold outline-none">
                      {HOUSES.map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">House B</label>
                    <select className="w-full bg-sports-black border border-white/10 rounded-xl p-3 text-white focus:border-gold outline-none">
                      {HOUSES.map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <button 
                      type="button"
                      onClick={handleSave}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <Save className="h-5 w-5" />
                      <span>Schedule Fixture</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'record' && (
              <motion.div 
                key="record"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 border-t-4 border-sky-blue"
              >
                <h2 className="text-2xl font-bold text-white mb-8 uppercase tracking-tight">Record <span className="text-sky-blue">Game Results</span></h2>
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8 items-center text-center">
                    <div className="space-y-4">
                      <select className="w-full bg-transparent text-2xl font-black text-white text-center outline-none">
                        {HOUSES.map(h => <option key={h} className="bg-sports-black">{h}</option>)}
                      </select>
                      <input type="number" placeholder="0" className="w-24 h-24 bg-white/5 border-2 border-white/10 rounded-3xl text-4xl font-black text-center text-gold focus:border-gold outline-none" />
                    </div>
                    <div className="space-y-4">
                      <select className="w-full bg-transparent text-2xl font-black text-white text-center outline-none">
                        {HOUSES.map(h => <option key={h} className="bg-sports-black">{h}</option>)}
                      </select>
                      <input type="number" placeholder="0" className="w-24 h-24 bg-white/5 border-2 border-white/10 rounded-3xl text-4xl font-black text-center text-sky-blue focus:border-sky-blue outline-none" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select MVP of the Match</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input type="text" placeholder="Search athlete name..." className="w-full bg-sports-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-gold outline-none" />
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleSave}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Finalize & Update Leaderboard</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Recent <span className="text-gold">Records</span></h2>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white"><Filter className="h-5 w-5" /></button>
                  </div>
                </div>

                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-card p-6 flex items-center justify-between hover:gold-border transition-all">
                      <div className="flex items-center space-x-8">
                        <div className="text-center min-w-[80px]">
                          <div className="text-xs font-bold text-gray-500 uppercase">Mar 02</div>
                          <div className="text-xl font-black text-white">2 - 1</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-sky-blue uppercase tracking-widest mb-1">Football • {category} {gender}</div>
                          <div className="text-lg font-bold text-white">Muteesa vs Lumumba</div>
                          <div className="text-xs text-gray-500 mt-1 italic">MVP: Kato Ivan (Muteesa)</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-500 hover:text-white transition-colors"><Edit2 className="h-4 w-4" /></button>
                        <button className="p-2 text-gray-500 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-gold text-black px-6 py-4 rounded-2xl font-bold shadow-2xl flex items-center space-x-3 z-50"
          >
            <CheckCircle2 className="h-6 w-6" />
            <span>Data saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
