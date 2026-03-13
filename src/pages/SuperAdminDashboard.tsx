import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Users, AlertTriangle, Bell, CheckCircle, 
  Search, Filter, Trash2, UserPlus, Settings,
  Activity, Trophy, Calendar
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, query, orderBy, onSnapshot, 
  doc, updateDoc, deleteDoc, getDocs 
} from 'firebase/firestore';

interface SecurityNotification {
  id: string;
  email: string;
  type: string;
  category: string;
  time: string;
  status: 'unread' | 'read';
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  role: string;
  sport?: string;
  level?: string;
}

export default function SuperAdminDashboard() {
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'security' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'security_notifications'), orderBy('time', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SecurityNotification));
      setNotifications(docs);
      setLoading(false);
    });

    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const userList = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(userList);
    };
    fetchUsers();

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'security_notifications', id), { status: 'read' });
  };

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, 'security_notifications', id));
  };

  return (
    <div className="min-h-screen bg-sports-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gold/20 rounded-lg">
                <Shield className="h-6 w-6 text-gold" />
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">Super Admin <span className="text-gold">Command Center</span></h1>
            </div>
            <p className="text-gray-400 font-medium">Full system control and security monitoring</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="glass-card px-6 py-3 flex items-center space-x-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Status</p>
                <p className="text-emerald-500 font-bold text-sm">Operational</p>
              </div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-white/5 rounded-2xl mb-12 border border-white/10 max-w-2xl">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'security', label: 'Security Logs', icon: AlertTriangle },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card p-8 border-l-4 border-gold">
                <Users className="h-8 w-8 text-gold mb-4" />
                <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Users</h3>
                <p className="text-4xl font-black text-white">{users.length}</p>
              </div>
              <div className="glass-card p-8 border-l-4 border-sky-blue">
                <Trophy className="h-8 w-8 text-sky-blue mb-4" />
                <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Active Admins</h3>
                <p className="text-4xl font-black text-white">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <div className="glass-card p-8 border-l-4 border-red-500">
                <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
                <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Unread Alerts</h3>
                <p className="text-4xl font-black text-white">{notifications.filter(n => n.status === 'unread').length}</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold uppercase tracking-widest">Security Notifications</h3>
                <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {notifications.filter(n => n.status === 'unread').length} New Alerts
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`p-6 flex items-center justify-between hover:bg-white/5 transition-colors ${notif.status === 'unread' ? 'bg-red-500/5' : ''}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${notif.status === 'unread' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-500'}`}>
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-white font-bold">{notif.type}</p>
                          <p className="text-xs text-gray-400">
                            Email: <span className="text-sky-blue">{notif.email}</span> • Category: {notif.category}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{new Date(notif.time).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {notif.status === 'unread' && (
                          <button 
                            onClick={() => markAsRead(notif.id)}
                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notif.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete log"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center text-gray-500 font-bold uppercase tracking-widest">
                    No security logs found. System is secure.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-white font-bold uppercase tracking-widest">User Directory</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold transition-all w-full md:w-64"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">User</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Assignment</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user) => (
                      <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-sky-blue/20 flex items-center justify-center text-sky-blue font-black">
                              {user.displayName?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">{user.displayName}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            user.role === 'superadmin' ? 'bg-gold/20 text-gold' :
                            user.role === 'admin' ? 'bg-sky-blue/20 text-sky-blue' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.role === 'admin' ? (
                            <p className="text-xs text-gray-300">
                              {user.sport} • <span className="text-gold">{user.level}</span>
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">N/A</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-white transition-colors"><Settings className="h-4 w-4" /></button>
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
