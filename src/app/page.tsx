'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '../store/hooks';
import { soundPlayer } from '../utils/SoundPlayer';
import { Cpu, Video, ShieldCheck, Terminal, HelpCircle } from 'lucide-react';
import CyberDashboard from '../components/CyberDashboard';

// Dynamically import ARSceneContainer to bypass SSR errors
const ARSceneContainer = dynamic(
  () => import('../components/ARSceneContainer'),
  { ssr: false }
);

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  const isSoundEnabled = useAppSelector((state) => state.ar.isSoundEnabled);

  // Simulate cyberpunk console startup logs
  useEffect(() => {
    const logs = [
      'INITIALIZING AETHER_CORE_LINK [v1.0.9]...',
      'CONNECTING WEBGL_RENDERER_SUB_SYSTEM...',
      'ENABLING WEB_AUDIO_SYNTH_DRIVER...',
      'MINDAR_FACE_GEOMETRY_READY [468_NODES]',
      'AETHER_SYSTEM_ONLINE.'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setSystemLogs((prev) => [...prev, log]);
        if (isSoundEnabled && index < logs.length - 1) {
          // Play micro click sound for each terminal log line printed
          try {
            soundPlayer.playClick();
          } catch (_) {}
        }
      }, (index + 1) * 350);
    });

    // Check mediaDevices support
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const hasCam = devices.some((device) => device.kind === 'videoinput');
        if (!hasCam) {
          setSystemLogs((prev) => [...prev, 'WARNING: NO PHYSICAL WEBCAM DETECTED.']);
        }
      }).catch(() => {
        setSystemLogs((prev) => [...prev, 'ERROR: CAMERA PORT IS BLOCKED.']);
      });
    }
  }, [isSoundEnabled]);

  const handleStart = async () => {
    if (isSoundEnabled) {
      soundPlayer.playClick();
      soundPlayer.playScanLine();
    }

    // Request camera permission
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Close stream immediately after checking (MindAR will request it separately)
        stream.getTracks().forEach((track) => track.stop());
        setCameraPermission('granted');
        setIsStarted(true);
      } catch (err) {
        setCameraPermission('denied');
        setSystemLogs((prev) => [...prev, 'ERROR: CAM_PERMISSION_DENIED_BY_USER']);
        if (isSoundEnabled) soundPlayer.playError();
      }
    } else {
      setIsStarted(true);
    }
  };

  if (isStarted) {
    return (
      <main className="relative flex-1 w-full h-full bg-black overflow-hidden">
        <ARSceneContainer />
        <CyberDashboard />
      </main>
    );
  }

  return (
    <main className="relative flex-1 w-full h-full bg-slate-950 font-mono text-cyan-400 overflow-y-auto px-4 py-8 flex flex-col items-center justify-center select-none">
      
      {/* BACKGROUND SCI-FI INTERFACE GRID */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(2,6,23,0))] pointer-events-none"></div>
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0891b2 1px, transparent 1px),
            linear-gradient(to bottom, #0891b2 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* NEON SCAN LINE ANIMATION */}
      <div className="absolute left-0 right-0 h-[2px] bg-cyan-500/30 shadow-[0_0_10px_#06b6d4] pointer-events-none animate-scan-line"></div>

      {/* CENTRAL COMPONENT CONTAINER */}
      <div className="relative w-full max-w-lg bg-slate-900/60 border-2 border-cyan-500/40 rounded-xl p-6 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col gap-6 animate-slide-in">
        
        {/* CORNER ORNAMENTS */}
        <span className="absolute top-[-2px] left-[-2px] w-6 h-6 border-t-2 border-l-2 border-cyan-400"></span>
        <span className="absolute top-[-2px] right-[-2px] w-6 h-6 border-t-2 border-r-2 border-cyan-400"></span>
        <span className="absolute bottom-[-2px] left-[-2px] w-6 h-6 border-b-2 border-l-2 border-cyan-400"></span>
        <span className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-b-2 border-r-2 border-cyan-400"></span>

        {/* LOGO AND BRANDING */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="relative p-3 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)] animate-pulse">
            <Terminal size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 uppercase mt-2">
            Aether AR
          </h1>
          <p className="text-[10px] text-cyan-500/70 tracking-widest font-semibold uppercase">
            Cybernetic Try-On Boutique
          </p>
        </div>

        {/* HARDWARE SPECIFICATION GRID */}
        <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/50 flex flex-col gap-3">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-900 pb-1 flex items-center gap-1.5">
            <Cpu size={12} /> System Specifications
          </span>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-500 uppercase">Tracking Core</span>
              <span className="font-semibold text-slate-200">MindAR v1.2.5</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-500 uppercase">WebGL Core</span>
              <span className="font-semibold text-slate-200">WebGL 2.0</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-500 uppercase">Audio Driver</span>
              <span className="font-semibold text-slate-200">Web Audio API</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-500 uppercase">Responsive Grid</span>
              <span className="font-semibold text-slate-200">Tailwind v4</span>
            </div>
          </div>
        </div>

        {/* SIMULATED DIAGNOSTIC LOG TERMINAL */}
        <div className="h-32 bg-slate-950/80 border border-slate-850 rounded-lg p-3 text-[10px] text-cyan-400/90 font-mono overflow-y-auto flex flex-col gap-1.5 shadow-inner">
          {systemLogs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-cyan-600/70">[$]</span>
              <span className={log.includes('WARNING') ? 'text-amber-400' : log.includes('ERROR') ? 'text-rose-500' : ''}>
                {log}
              </span>
            </div>
          ))}
          <div className="w-1.5 h-3 bg-cyan-400 animate-pulse mt-0.5"></div>
        </div>

        {/* PERMISSIONS CALLOUT */}
        <div className="flex items-start gap-3 bg-slate-900/40 border border-slate-800 p-3 rounded-lg">
          <Video size={20} className="text-cyan-400/80 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-[11px] text-slate-400">
            <span className="font-bold text-slate-200 uppercase">Camera Access Required</span>
            <p className="leading-relaxed">
              This augmented reality experience runs entirely inside your browser. Your webcam feed is analyzed locally on-device and is never transmitted over the network.
            </p>
          </div>
        </div>

        {/* ERROR STATE CALLOUT (IF CAMERA IS BLOCKED) */}
        {cameraPermission === 'denied' && (
          <div className="flex items-center gap-2 border border-rose-500/50 bg-rose-950/20 text-rose-400 p-3 rounded-lg text-xs">
            <ShieldCheck size={16} className="text-rose-400 flex-shrink-0" />
            <span>Camera permission was denied. Please restore camera authorization in browser settings.</span>
          </div>
        )}

        {/* START BUTTON */}
        <button
          onClick={handleStart}
          className="relative w-full py-4 bg-cyan-500/20 border-2 border-cyan-400 hover:bg-cyan-500/30 text-cyan-300 font-bold tracking-widest uppercase rounded-lg cursor-pointer transition-all duration-200 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-98"
        >
          {/* Inner blinking dot */}
          <span className="absolute top-1/2 left-4 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          INITIALIZE GEAR LINK
        </button>
      </div>

      {/* FOOTER METRICS */}
      <footer className="mt-8 text-[9px] text-slate-600/70 tracking-widest text-center flex flex-col gap-1">
        <span>AETHER AR COOP // SECURE WEBAR LINK ACTIVE</span>
        <span>COPYRIGHT © 2026 // ALL RIGHTS RESERVED</span>
      </footer>
    </main>
  );
}
