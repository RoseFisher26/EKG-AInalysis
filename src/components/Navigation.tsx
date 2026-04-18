import React from 'react';
import { Activity, LayoutDashboard, History, Settings, Users, LogOut, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { signInWithGoogle, logOut } from '../lib/firebase';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const { user } = useAuth();
  
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'patients', icon: Users, label: 'Patient Directory' },
    { id: 'history', icon: History, label: 'Clinical Archives' },
    { id: 'settings', icon: Settings, label: 'System Config' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-20 md:w-64 bg-white border-r border-brand-border flex flex-col items-center md:items-stretch py-8 px-4 z-50 shadow-sm">
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center shadow-md">
          <Activity className="text-white" size={24} />
        </div>
        <div className="hidden md:block">
          <h1 className="text-brand-primary font-black leading-none tracking-tight text-lg">ECG<span className="text-brand-accent">AI</span></h1>
          <span className="text-[10px] text-brand-muted font-bold uppercase tracking-widest leading-none">v2.4.1 Professional</span>
        </div>
      </div>

      <div className="space-y-1.5 flex-grow">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-all group",
              activeTab === item.id 
                ? "bg-brand-bg text-brand-primary shadow-sm border border-brand-border" 
                : "text-brand-muted hover:bg-brand-bg hover:text-brand-text"
            )}
          >
            <item.icon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === item.id ? "text-brand-accent" : "opacity-70")} />
            <span className="hidden md:block font-bold text-xs uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto space-y-4">
        <div className="hidden md:block p-4 bg-brand-bg rounded-lg border border-brand-border">
          <p className="text-[10px] font-black text-brand-muted uppercase mb-2 tracking-widest">Cloud Sync</p>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", user ? "bg-brand-success" : "bg-brand-warning")} />
            <span className="text-[11px] text-brand-text font-bold">
              {user ? "Encrypted Link Active" : "Local Storage Mode"}
            </span>
          </div>
        </div>
        
        {user ? (
          <button 
            onClick={logOut}
            className="w-full flex items-center gap-4 px-3 py-3 text-brand-muted hover:text-brand-danger hover:bg-brand-danger/5 rounded-lg transition-all"
          >
            <LogOut size={18} />
            <span className="hidden md:block text-xs font-bold uppercase tracking-wide">Secure Exit</span>
          </button>
        ) : (
          <button 
            onClick={signInWithGoogle}
            className="w-full flex items-center gap-4 px-3 py-3 text-brand-accent hover:bg-brand-accent/5 rounded-lg transition-all border border-brand-accent/20"
          >
            <LogIn size={18} />
            <span className="hidden md:block text-xs font-bold uppercase tracking-wide">Identity Link</span>
          </button>
        )}
      </div>
    </nav>
  );
}
