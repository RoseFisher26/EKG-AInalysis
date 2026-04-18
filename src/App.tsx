/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import EKGMonitor from './components/EKGMonitor';
import EKGUpload from './components/EKGUpload';
import AnalysisDashboard from './components/AnalysisDashboard';
import { EKGAnalysis, EKGRecord } from './types';
import { Search, Bell, Activity, FileText, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './lib/AuthContext';
import { dbService } from './services/dbService';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentAnalysis, setCurrentAnalysis] = useState<{ result: EKGAnalysis, imageUrl: string } | null>(null);
  const [history, setHistory] = useState<EKGRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Sync history with Firestore
  useEffect(() => {
    if (user) {
      setIsLoadingHistory(true);
      dbService.getRecentAnalyses(user.uid)
        .then(data => {
          if (data) setHistory(data);
        })
        .finally(() => setIsLoadingHistory(false));
    } else {
      setHistory([]);
    }
  }, [user]);

  // Simulated data for demo
  const stats = [
    { label: 'Analyses Today', value: '14', change: '+12%', icon: FileText, color: 'text-blue-500' },
    { label: 'Urgent Findings', value: history.filter(h => h.analysis.urgency === 'high').length.toString().padStart(2, '0'), change: 'Critical', icon: AlertCircle, color: 'text-red-500' },
    { label: 'Avg. Confidence', value: '98.4%', change: 'Stable', icon: Activity, color: 'text-emerald-500' },
  ];

  const handleAnalysisComplete = async (result: EKGAnalysis, imageUrl: string, patientId: string) => {
    setCurrentAnalysis({ result, imageUrl });
    
    if (user) {
      // Save to Firestore
      try {
        const id = await dbService.saveAnalysis(user.uid, patientId, result, imageUrl);
        if (id) {
          const newRecord: EKGRecord = {
            id,
            patientId,
            imageUrl,
            analysis: result,
            notes: '',
            createdAt: Date.now(),
            ownerId: user.uid
          };
          setHistory(prev => [newRecord, ...prev]);
        }
      } catch (err) {
        console.error("Failed to sync with cloud:", err);
      }
    } else {
      // Local only for demo if not logged in
      const newRecord: EKGRecord = {
        id: Math.random().toString(36).substr(2, 9),
        patientId,
        imageUrl,
        analysis: result,
        notes: '',
        createdAt: Date.now(),
        ownerId: 'guest'
      };
      setHistory(prev => [newRecord, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pl-20 md:pl-64 min-h-screen relative">
        {/* Top Header */}
        <header className="h-16 border-b border-brand-border flex items-center justify-between px-8 bg-brand-primary text-white sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4 bg-white/10 px-4 py-1.5 rounded-lg border border-white/20 w-full max-w-md">
            <Search size={16} className="text-white/60" />
            <input 
              type="text" 
              placeholder="Search patients, ID, or analysis..." 
              className="bg-transparent border-none outline-none text-xs w-full placeholder:text-white/40 text-white"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-white/70 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-danger rounded-full border-2 border-brand-primary" />
            </button>
            <div className="h-6 w-px bg-white/20" />
            
            {user ? (
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none">{user.displayName || user.email}</p>
                  <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider mt-1">Provider ID: {user.uid.slice(0, 8)}</p>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} className="w-8 h-8 rounded-full object-cover border border-white/20" alt="Avatar" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white capitalize text-xs font-bold group-hover:scale-105 transition-transform">
                    {user.email?.[0]}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 opacity-70">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none">Guest Provider</p>
                  <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider mt-1">Offline</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                  <Activity size={16} />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
          <AnimatePresence mode="wait">
            {!currentAnalysis ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-panel-bg p-6 rounded-panel border border-brand-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-brand-bg rounded-box">
                          <stat.icon className={cn(stat.color)} size={18} />
                        </div>
                        <span className={cn("text-[10px] font-bold px-2 py-1 rounded bg-brand-bg font-mono", stat.color)}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-1">{stat.label}</p>
                      <h4 className="text-2xl font-bold text-brand-primary tracking-tight">{stat.value}</h4>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <section className="bg-panel-bg rounded-panel border border-brand-border p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold tracking-tight text-brand-primary uppercase flex items-center gap-2">
                          <Activity className="text-brand-accent" size={16} /> Analysis Engine
                        </h2>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Lead Detection Ready</span>
                      </div>
                      <EKGUpload onAnalysisComplete={handleAnalysisComplete} />
                    </section>

                    <section className="bg-brand-bg rounded-panel border border-brand-border p-6 border-dashed">
                      <div className="flex items-center gap-3 mb-4">
                        <Clock className="text-brand-muted" size={16} />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Clinical Protocols</h3>
                      </div>
                      <ul className="space-y-3">
                        {[
                          "Standard 12-lead interpretation active.",
                          "Validating waveform consistency across leads.",
                          "AI engine version 2.4.1 (Clinical Priority).",
                        ].map((tip, i) => (
                          <li key={i} className="flex gap-3 text-xs text-brand-muted leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-accent/40 mt-1.5 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section className="bg-panel-bg rounded-panel border border-brand-border p-6 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold tracking-tight text-brand-primary uppercase flex items-center gap-2">
                          <Activity className="text-brand-success" size={16} /> Real-time Lead II
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-brand-success/10 text-brand-success border border-brand-success/20">Synced</span>
                      </div>
                      <EKGMonitor />
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Analysis Archives</h3>
                        <div className="flex items-center gap-2">
                          {isLoadingHistory && <Activity size={12} className="text-brand-accent animate-spin" />}
                          <button className="text-[10px] font-bold uppercase tracking-widest text-brand-accent hover:underline">Full Database</button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {history.length > 0 ? history.slice(0, 4).map((item) => (
                          <div key={item.id} className="bg-white p-3 rounded-box border border-brand-border flex items-center justify-between group hover:border-brand-accent transition-all cursor-pointer shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-box flex items-center justify-center font-bold text-sm bg-brand-bg",
                                item.analysis.urgency === 'high' ? "text-brand-danger" : "text-brand-text"
                              )}>
                                {item.analysis.heartRate}
                              </div>
                              <div>
                                <h5 className="text-[13px] font-bold text-brand-text">{item.analysis.preliminaryDiagnosis}</h5>
                                <p className="text-[10px] text-brand-muted font-medium">{(new Date(item.createdAt)).toLocaleDateString()} at {(new Date(item.createdAt)).toLocaleTimeString()}</p>
                              </div>
                            </div>
                            <ChevronRight className="text-brand-border group-hover:text-brand-accent transition-colors" size={16} />
                          </div>
                        )) : (
                          <div className="p-10 text-center bg-white rounded-panel border border-dotted border-brand-border shadow-sm">
                            <p className="text-xs text-brand-muted font-medium">
                              {user ? "No patient analyses in current session." : "Sign in to access your cloud analysis logs."}
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </motion.div>
            ) : (
              <AnalysisDashboard 
                analysis={currentAnalysis.result} 
                imageUrl={currentAnalysis.imageUrl} 
                onClose={() => setCurrentAnalysis(null)} 
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

