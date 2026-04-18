import React, { useEffect, useRef, useState } from 'react';
import { Activity, Zap, ZoomIn, Sliders } from 'lucide-react';
import { cn } from '../lib/utils';

interface EKGMonitorProps {
  heartRate?: number;
  rhythm?: string;
  className?: string;
}

export default function EKGMonitor({ heartRate = 60, rhythm = "Normal Sinus Rhythm", className }: EKGMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sensitivity, setSensitivity] = useState(1);
  const [sweepSpeed, setSweepSpeed] = useState(25); // mm/s
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const points: number[] = [];
    const width = canvas.width;
    const height = canvas.height;
    
    // Grid settings
    const gridSize = 20; // 5mm
    const subGridSize = 4; // 1mm

    const drawGrid = () => {
      ctx.strokeStyle = '#1E293B'; // var(--primary) but slightly lighter or darker for grid
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let i = 0; i < width; i += subGridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let i = 0; i < height; i += subGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      ctx.strokeStyle = '#2d3e50';
      ctx.lineWidth = 1;

      // Bold lines every 5 units
      for (let i = 0; i < width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
    };

    const generateEKGPoint = (t: number) => {
      // Simulate P-QRS-T complex
      // Period based on heart rate
      const period = 60 / heartRate;
      const localT = t % period;
      
      let val = 0;

      // P wave
      if (localT > 0 && localT < 0.1) {
        val = Math.sin((localT / 0.1) * Math.PI) * 0.1;
      }
      // QRS complex
      else if (localT > 0.12 && localT < 0.15) {
        val = -0.15; // Q
      }
      else if (localT >= 0.15 && localT < 0.18) {
        val = 1.2; // R
      }
      else if (localT >= 0.18 && localT < 0.21) {
        val = -0.3; // S
      }
      // T wave
      else if (localT > 0.35 && localT < 0.5) {
        val = Math.sin(((localT - 0.35) / 0.15) * Math.PI) * 0.25;
      }

      return val * sensitivity * 40; // Scale for display
    };

    let startTime = performance.now();

    const animate = (time: number) => {
      if (!isActive) return;
      
      const elapsed = (time - startTime) / 1000;
      const speedFactor = sweepSpeed / 25;
      
      // Clear a small lead section to create the "sweep" effect
      ctx.fillStyle = '#0F172A'; // Dark slate matching the design
      ctx.fillRect(0, 0, width, height);
      drawGrid();

      // Update trace
      x += 2 * speedFactor;
      if (x > width) x = 0;

      points.push(generateEKGPoint(elapsed));
      if (points.length > width / (2 * speedFactor)) {
        points.shift();
      }

      ctx.beginPath();
      ctx.strokeStyle = '#10B981'; // var(--brand-success)
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';

      for (let i = 0; i < points.length; i++) {
        const px = i * (2 * speedFactor);
        const py = height / 2 - points[i];
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [heartRate, sensitivity, sweepSpeed, isActive]);

  return (
    <div className={cn("bg-transparent", className)}>
      <div className="flex justify-between items-end mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-brand-danger rounded-full animate-pulse" />
          <h3 className="font-bold text-brand-primary text-[10px] tracking-widest uppercase">Lead II Activity</h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block text-[9px] text-brand-muted uppercase font-black tracking-tighter">BPM</span>
            <span className="text-xl font-mono font-bold text-brand-primary leading-none">{heartRate}</span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-brand-muted uppercase font-black tracking-tighter">Status</span>
            <span className="text-[11px] font-bold text-brand-success uppercase">{rhythm.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-panel border border-brand-border bg-[#0F172A] shadow-inner mb-6">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={240} 
          className="w-full h-auto"
        />
        <div className="absolute top-4 left-4 bg-brand-primary/40 backdrop-blur-sm border border-white/10 px-2 py-1 rounded text-[8px] font-bold text-white uppercase tracking-widest">
          Live Analysis Mode
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[9px] text-brand-muted font-black uppercase tracking-widest">
            Sensitivity (mm/mV)
          </label>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={sensitivity} 
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[9px] text-brand-muted font-black uppercase tracking-widest">
            Sweep (mm/s)
          </label>
          <div className="flex gap-1.5">
            {[12.5, 25, 50].map((speed) => (
              <button
                key={speed}
                onClick={() => setSweepSpeed(speed)}
                className={cn(
                  "flex-1 py-1 text-[9px] font-bold rounded border transition-all",
                  sweepSpeed === speed 
                    ? "bg-brand-primary text-white border-brand-primary" 
                    : "bg-white text-brand-text border-brand-border hover:bg-brand-bg tracking-tighter"
                )}
              >
                {speed}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end">
           <button 
            onClick={() => setIsActive(!isActive)}
            className={cn(
              "w-full py-2 text-[9px] uppercase font-bold rounded border transition-all",
              isActive ? "bg-white text-brand-danger border-brand-border hover:bg-brand-danger/5" : "bg-brand-success text-white border-brand-success"
            )}
           >
             {isActive ? 'Freeze Data' : 'Engage Engine'}
           </button>
        </div>
        <div className="text-right self-end text-[8px] text-brand-muted font-bold leading-tight opacity-70">
          FILTER: ISO-0.05-150Hz<br/>
          GAIN: 10mm/mV<br/>
          GRID: 0.1mV/0.04s
        </div>
      </div>
    </div>
  );
}
