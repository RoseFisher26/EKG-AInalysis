import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, Download, History, User } from 'lucide-react';
import { analyzeEKG } from '../services/aiService';
import { EKGAnalysis, PatientRecord } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { dbService } from '../services/dbService';

interface EKGUploadProps {
  onAnalysisComplete: (result: EKGAnalysis, imageUrl: string, patientId: string) => void;
}

export default function EKGUpload({ onAnalysisComplete }: EKGUploadProps) {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  useEffect(() => {
    if (user) {
      dbService.getPatients(user.uid).then(data => {
        if (data) setPatients(data);
      });
    }
  }, [user]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedPatientId) {
      setError("Please select a patient before uploading an EKG.");
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64 = await toBase64(file);
      const result = await analyzeEKG(base64);
      onAnalysisComplete(result, base64, selectedPatientId);
    } catch (err: any) {
      setError(err.message || "Failed to analyze EKG image. Please ensure the image is clear and contains ECG leads.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisComplete, selectedPatientId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  } as any);

  const toBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  return (
    <div className="space-y-6">
      {/* Patient Selection */}
      <div className="bg-white p-4 rounded-panel border border-brand-border shadow-sm flex items-center gap-4">
        <div className="p-2 bg-brand-bg rounded-box">
          <User className="text-brand-primary" size={16} />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">Target Patient Directory</label>
          {user ? (
            <select 
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                setError(null);
              }}
              className="w-full bg-transparent border-none outline-none text-sm font-bold text-brand-primary cursor-pointer appearance-none"
            >
              <option value="" disabled>Select a patient to associate...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.lastName}, {p.firstName} (DOB: {p.dateOfBirth})</option>
              ))}
            </select>
          ) : (
            <div className="text-sm font-bold text-brand-primary opacity-50">Local Demo Mode (No Cloud Patient Directory Available)</div>
          )}
        </div>
      </div>

      <div 
        {...getRootProps()} 
        className={cn(
          "relative border-2 border-dashed rounded-panel p-10 transition-all cursor-pointer group",
          isDragActive ? "border-brand-accent bg-brand-accent/5" : "border-brand-border bg-white hover:bg-brand-bg hover:border-brand-accent/50",
          (isAnalyzing || (!selectedPatientId && user)) && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center bg-brand-bg border border-brand-border transition-transform group-hover:scale-110",
            isDragActive && "bg-brand-accent/10 border-brand-accent scale-110"
          )}>
            {isAnalyzing ? (
              <Loader2 className="w-6 h-6 text-brand-accent animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-brand-muted" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-base font-bold text-brand-primary uppercase tracking-tight">
              {isAnalyzing ? "Sequence Extraction..." : (isDragActive ? "Commit File Segment" : "Import EKG Trace")}
            </h3>
            <p className="text-[11px] text-brand-muted font-medium max-w-[240px] leading-relaxed">
              Standard 12-lead image formats accepted (JPEG, PNG, PDF). AI will attempt to extract rhythm and lead data.
            </p>
          </div>
          
          <div className="flex gap-2 text-[9px] text-brand-muted font-black uppercase tracking-widest bg-brand-bg px-2 py-0.5 rounded-full border border-brand-border">
            <span>PNG</span>
            <div className="w-1 h-1 bg-brand-border rounded-full self-center" />
            <span>JPG</span>
            <div className="w-1 h-1 bg-brand-border rounded-full self-center" />
            <span>PDF</span>
          </div>
        </div>

        {isAnalyzing && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-bg overflow-hidden rounded-b-panel">
            <motion.div 
              className="h-full bg-brand-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 15, ease: "linear" }}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-brand-danger/5 border border-brand-danger/20 rounded-box flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-brand-danger shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[10px] font-black text-brand-danger uppercase tracking-widest mb-1">Processing Failure</h4>
              <p className="text-xs text-brand-text font-medium leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
        {[
          { icon: <CheckCircle2 size={14}/>, label: "Lead Logic", desc: "12-lead pattern recognition active" },
          { icon: <History size={14}/>, label: "Clinical Sync", desc: "Cross-checks known cardiovascular markers" },
          { icon: <FileText size={14}/>, label: "EMR Output", desc: "Standardized HL7-compatible structure" }
        ].map((feat, i) => (
          <div key={i} className="p-3 bg-white rounded-box border border-brand-border shadow-sm">
            <div className="flex items-center gap-2 text-brand-primary mb-1">
              <span className="text-brand-accent">{feat.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-widest">{feat.label}</span>
            </div>
            <p className="text-[10px] text-brand-muted font-medium leading-tight">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
