import React from 'react';
import { 
  Heart, 
  Activity, 
  Scale, 
  Watch, 
  AlertTriangle, 
  ClipboardList, 
  Stethoscope,
  ChevronRight,
  Download,
  Share2,
  CheckCircle,
  FileText
} from 'lucide-react';
import { EKGAnalysis } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface AnalysisDashboardProps {
  analysis: EKGAnalysis;
  imageUrl: string;
  onClose: () => void;
}

export default function AnalysisDashboard({ analysis, imageUrl, onClose }: AnalysisDashboardProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-brand-danger bg-brand-danger/10 border-brand-danger/20';
      case 'moderate': return 'text-brand-warning bg-brand-warning/10 border-brand-warning/20';
      default: return 'text-brand-success bg-brand-success/10 border-brand-success/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-32"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-2xl font-black tracking-tight text-brand-primary uppercase">Clinical Report</h2>
            <div className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase border tracking-widest", getUrgencyColor(analysis.urgency))}>
              {analysis.urgency} Priority
            </div>
          </div>
          <p className="text-brand-muted text-xs font-bold uppercase tracking-widest">Sequence ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} • Clinical Support Session</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-brand-bg text-brand-text font-bold rounded-lg text-xs transition-all border border-brand-border shadow-sm">
            <Download size={14} /> Export Findings
          </button>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-lg text-xs transition-all shadow-md active:scale-95"
          >
            New Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analysis Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* EKG Image View with Annotations */}
          <div className="bg-white rounded-panel border border-brand-border overflow-hidden shadow-sm">
            <div className="px-6 py-3 border-b border-brand-border bg-brand-bg/50 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Detected Multi-Lead Waveform</span>
              <span className="text-[9px] text-brand-muted font-black tracking-widest bg-white px-2 py-0.5 rounded border border-brand-border">QC CONFIDENCE: {(analysis.confidenceLevel * 100).toFixed(1)}%</span>
            </div>
            <div className="relative group grayscale hover:grayscale-0 transition-all duration-1000 p-1">
              <img src={imageUrl} alt="EKG Trace" className="w-full h-auto rounded-lg" />
              <div className="absolute inset-0 bg-brand-accent/5 pointer-events-none" />
            </div>
          </div>

          {/* Measurements Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              icon={<Heart className="text-brand-danger" size={16} />} 
              label="Heart Rate" 
              value={`${analysis.heartRate} BPM`} 
            />
            <MetricCard 
              icon={<Activity className="text-brand-accent" size={16} />} 
              label="Lead Rhythm" 
              value={analysis.rhythm} 
            />
            <MetricCard 
              icon={<Scale className="text-brand-warning" size={16} />} 
              label="Electrical Axis" 
              value={analysis.axis} 
            />
            <MetricCard 
              icon={<Watch className="text-brand-success" size={16} />} 
              label="Calculated QTc" 
              value={analysis.intervals.qtc} 
            />
          </div>

          {/* Clinical Findings */}
          <div className="bg-white rounded-panel border border-brand-border p-8 shadow-sm space-y-8">
            <div className="flex items-center border-b border-brand-border pb-4">
              <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
                <Stethoscope className="text-brand-accent" size={16} /> Technical Diagnostics
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[9px] uppercase font-black text-brand-muted tracking-widest mb-2">ST-Segment Assessment</h4>
                  <p className="text-brand-text text-xs leading-relaxed font-medium">{analysis.stSegment}</p>
                </div>
                <div>
                  <h4 className="text-[9px] uppercase font-black text-brand-muted tracking-widest mb-2">T-Wave Morphology</h4>
                  <p className="text-brand-text text-xs leading-relaxed font-medium">{analysis.tWave}</p>
                </div>
              </div>
              <div className="bg-brand-bg rounded-box p-6 border border-brand-border">
                <h4 className="text-[10px] uppercase font-black text-brand-danger tracking-widest mb-4">Detected Abnormalities</h4>
                <ul className="space-y-3">
                  {analysis.abnormalities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-brand-text font-bold">
                      <AlertTriangle size={14} className="text-brand-warning shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Diagnoses & Recommendations */}
        <div className="space-y-8">
          <div className="bg-brand-primary rounded-panel p-8 text-white shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-accent mb-4">Master Diagnosis</h3>
            <p className="text-2xl font-black leading-none mb-6 tracking-tight">{analysis.preliminaryDiagnosis}</p>
            
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-white/50 leading-none">Differential Targets</h4>
              <div className="space-y-3">
                {analysis.differentialDiagnoses.map((diff, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs font-bold bg-white/5 p-2 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                    <ChevronRight size={14} className="text-brand-accent" /> {diff}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-panel border border-brand-border p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-success mb-6 flex items-center gap-2">
              <CheckCircle size={14} /> Immediate Protocols
            </h3>
            <ul className="space-y-4">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-4 text-xs text-brand-text font-bold group">
                  <div className="w-6 h-6 rounded-lg bg-brand-success/10 text-brand-success flex items-center justify-center shrink-0 border border-brand-success/20 group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <span className="mt-1 leading-tight">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-brand-warning/5 border border-brand-warning/10 rounded-box">
             <div className="flex items-start gap-3 text-[10px] text-brand-muted font-bold italic leading-relaxed">
               <AlertTriangle size={14} className="text-brand-warning shrink-0 mt-0.5" />
               <p>
                 SYSTEM DISCLAIMER: Preliminary AI interpretation only. Verify findings via multi-lead clinical correlation and specialist consultation.
               </p>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white border border-brand-border p-4 rounded-box hover:border-brand-accent transition-all shadow-sm group">
      <div className="flex items-center gap-2 mb-3 text-brand-muted">
        <span className="group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-base font-black text-brand-primary tracking-tight leading-none">{value}</div>
    </div>
  );
}
