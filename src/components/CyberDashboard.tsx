'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setAccessory,
  setGlowColor,
  setScale,
  setPositionY,
  setPositionZ,
  toggleFaceMesh,
  toggleSound,
  resetAdjustments,
  AccessoryType
} from '../store/arSlice';
import { soundPlayer } from '../utils/SoundPlayer';
import {
  Camera,
  Sliders,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Info,
  RotateCcw,
  Cpu,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Cyan', value: '#00ffff', label: 'Electric Cyan' },
  { name: 'Pink', value: '#ff007f', label: 'Neon Pink' },
  { name: 'Green', value: '#39ff14', label: 'Laser Green' },
  { name: 'Gold', value: '#ffd700', label: 'Cyber Gold' },
  { name: 'Purple', value: '#bd00ff', label: 'Plasma Purple' },
];

const ACCESSORIES = [
  { id: 'none', label: 'NO GEAR', desc: 'Hardware Offline' },
  { id: 'visor', label: 'CYBER-VISOR', desc: 'Augmented HUD' },
  { id: 'halo', label: 'COSMIC HALO', desc: 'Relativistic Ring' },
  { id: 'horns', label: 'DEMON HORNS', desc: 'Thermal Radiators' },
  { id: 'mask', label: 'MATRIX SCANNER', desc: 'Neural Face Overlay' },
] as const;

export default function CyberDashboard() {
  const dispatch = useAppDispatch();
  const arState = useAppSelector((state) => state.ar);
  
  const {
    selectedAccessory,
    glowColor,
    scale,
    positionY,
    positionZ,
    showFaceMesh,
    isSoundEnabled,
    cameraState,
    isScanning,
  } = arState;

  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isWebXROpen, setIsWebXROpen] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [fps, setFps] = useState(60);

  // Sync sound settings with utility
  useEffect(() => {
    soundPlayer.setEnabled(isSoundEnabled);
  }, [isSoundEnabled]);

  // Simulate hardware metrics
  useEffect(() => {
    if (cameraState !== 'ready') return;
    const interval = setInterval(() => {
      setFps(Math.floor(58 + Math.random() * 3));
    }, 1000);
    return () => clearInterval(interval);
  }, [cameraState]);

  const handleSelectAccessory = (type: AccessoryType) => {
    if (isSoundEnabled) soundPlayer.playClick();
    dispatch(setAccessory(type));
  };

  const handleSelectColor = (color: string) => {
    if (isSoundEnabled) soundPlayer.playClick();
    dispatch(setGlowColor(color));
  };

  const handleToggleSound = () => {
    // Play sound before toggling off, or toggle on and play
    if (!isSoundEnabled) {
      soundPlayer.setEnabled(true);
      soundPlayer.playClick();
    }
    dispatch(toggleSound());
  };

  const handleToggleFaceMesh = () => {
    if (isSoundEnabled) soundPlayer.playClick();
    dispatch(toggleFaceMesh());
  };

  const handleReset = () => {
    if (isSoundEnabled) soundPlayer.playClick();
    dispatch(resetAdjustments());
  };

  const handleSnapshot = () => {
    const video = document.querySelector('video');
    const canvas = document.querySelector('canvas.a-canvas') as HTMLCanvasElement;

    if (!video || !canvas) {
      console.error('Cannot capture: Video or Canvas elements not found');
      return;
    }

    if (isSoundEnabled) {
      soundPlayer.playShutter();
    }

    // Flash overlay
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    try {
      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = video.videoWidth || canvas.width;
      captureCanvas.height = video.videoHeight || canvas.height;
      const ctx = captureCanvas.getContext('2d');

      if (ctx) {
        // Draw the background camera frame
        ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
        
        // Draw the foreground WebGL layer
        ctx.drawImage(canvas, 0, 0, captureCanvas.width, captureCanvas.height);

        const dataUrl = captureCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `aether-ar-${selectedAccessory}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error('Snapshot rendering failed:', err);
    }
  };

  // Convert Hex to RGBA for inline styling transparency
  const hexToRgbStr = (hex: string, alpha: number = 1) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const themeStyle = {
    '--theme-glow': glowColor,
    '--theme-glow-50': hexToRgbStr(glowColor, 0.5),
    '--theme-glow-20': hexToRgbStr(glowColor, 0.2),
    '--theme-glow-10': hexToRgbStr(glowColor, 0.1),
  } as React.CSSProperties;

  return (
    <div style={themeStyle} className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 font-mono select-none">
      {/* FLASH SCREEN EFFECT */}
      {flashActive && (
        <div className="absolute inset-0 bg-white pointer-events-none z-50 animate-fade-out" />
      )}

      {/* HEADER BAR */}
      <header className="w-full flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 bg-slate-950/70 border border-[var(--theme-glow-50)] px-4 py-2 rounded-lg backdrop-blur-md shadow-[0_0_15px_var(--theme-glow-10)]">
          <div className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isScanning ? 'bg-green-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isScanning ? 'bg-green-500' : 'bg-amber-500'}`}></span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Aether AR</span>
            <span className="text-[10px] text-[var(--theme-glow)] drop-shadow-[0_0_3px_var(--theme-glow-50)] font-semibold">
              {isScanning ? 'LOCK_ACQUIRED' : 'SCANNING_FACE...'}
            </span>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className="pointer-events-auto p-2 bg-slate-950/70 border border-slate-800 hover:border-[var(--theme-glow-50)] text-slate-300 hover:text-[var(--theme-glow)] rounded-lg backdrop-blur-md transition-all shadow-md active:scale-95"
            title="Toggle Sound Synthesizer"
          >
            {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          
          <button
            onClick={() => setIsWebXROpen(true)}
            className="pointer-events-auto p-2 bg-slate-950/70 border border-slate-800 hover:border-[var(--theme-glow-50)] text-slate-300 hover:text-[var(--theme-glow)] rounded-lg backdrop-blur-md transition-all shadow-md active:scale-95"
            title="View WebXR Core Diagnostics"
          >
            <Cpu size={18} />
          </button>
        </div>
      </header>

      {/* SCANNED HUD TARGET GRAPHIC (ONLY WHEN AR READY) */}
      {cameraState === 'ready' && (
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-dashed border-[var(--theme-glow-20)] rounded-full flex items-center justify-center pointer-events-none">
          <div className={`w-40 h-40 border border-double border-[var(--theme-glow-50)] rounded-full flex items-center justify-center transition-transform duration-1000 ${isScanning ? 'rotate-180 scale-105' : 'animate-pulse'}`}>
            {/* Hologram Reticle Lines */}
            <div className="absolute w-[2px] h-6 bg-[var(--theme-glow)] top-0"></div>
            <div className="absolute w-[2px] h-6 bg-[var(--theme-glow)] bottom-0"></div>
            <div className="absolute h-[2px] w-6 bg-[var(--theme-glow)] left-0"></div>
            <div className="absolute h-[2px] w-6 bg-[var(--theme-glow)] right-0"></div>
            
            <div className={`text-[8px] tracking-widest text-[var(--theme-glow)] font-bold transition-opacity duration-300 ${isScanning ? 'opacity-100' : 'opacity-30'}`}>
              ALIGN_TARGET
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD BOTTOM PANEL */}
      <div className="w-full flex flex-col gap-3 pointer-events-auto mt-auto">
        
        {/* SNAPSHOT TRIGGER & TOGGLES */}
        <div className="flex items-center justify-between px-2">
          {/* FACE GRID OVERLAY TOGGLE */}
          <button
            onClick={handleToggleFaceMesh}
            className={`p-2 bg-slate-950/70 border rounded-lg backdrop-blur-md transition-all shadow-md active:scale-95 flex items-center gap-2 text-xs font-semibold ${
              showFaceMesh
                ? 'border-[var(--theme-glow)] text-[var(--theme-glow)] shadow-[0_0_8px_var(--theme-glow-20)]'
                : 'border-slate-800 text-slate-400'
            }`}
          >
            {showFaceMesh ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>FACE_GRID</span>
          </button>

          {/* MAIN SNAPSHOT TRIGGER */}
          <button
            onClick={handleSnapshot}
            disabled={selectedAccessory === 'none'}
            className={`relative flex items-center justify-center p-4 bg-slate-950 border-2 rounded-full backdrop-blur-md transition-all active:scale-90 select-none group shadow-lg ${
              selectedAccessory === 'none'
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                : 'border-[var(--theme-glow)] text-[var(--theme-glow)] hover:bg-[var(--theme-glow-10)] shadow-[0_0_15px_var(--theme-glow-20)]'
            }`}
            title="Take High-Fi Shutter Snapshot"
          >
            <Camera size={26} className="relative z-10" />
            {selectedAccessory !== 'none' && (
              <span className="absolute inset-1 rounded-full border border-dashed border-[var(--theme-glow-50)] animate-spin-slow"></span>
            )}
          </button>

          {/* SLIDERS TUNE EXPAND BUTTON */}
          <button
            onClick={() => {
              if (isSoundEnabled) soundPlayer.playClick();
              setIsControlsOpen(!isControlsOpen);
            }}
            className={`p-2 bg-slate-950/70 border rounded-lg backdrop-blur-md transition-all shadow-md active:scale-95 flex items-center gap-2 text-xs font-semibold ${
              isControlsOpen
                ? 'border-[var(--theme-glow)] text-[var(--theme-glow)] shadow-[0_0_8px_var(--theme-glow-20)]'
                : 'border-slate-800 text-slate-400'
            }`}
          >
            <Sliders size={16} />
            <span>TUNE_FIT</span>
            {isControlsOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {/* ACCORDION CONTROLS DRAWER */}
        {isControlsOpen && (
          <div className="bg-slate-950/80 border border-[var(--theme-glow-50)] rounded-lg p-4 backdrop-blur-md shadow-[0_0_20px_var(--theme-glow-10)] flex flex-col gap-4 animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-[var(--theme-glow)] flex items-center gap-1">
                <Sparkles size={14} /> FITTING_CALIBRATION
              </span>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-[var(--theme-glow)] transition-all"
              >
                <RotateCcw size={12} /> RESET
              </button>
            </div>

            {/* SLIDERS GRID */}
            <div className="flex flex-col gap-3">
              {/* SCALE SLIDER */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400 font-semibold uppercase">Accessory Scale</span>
                  <span className="text-[var(--theme-glow)]">{scale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={scale}
                  onChange={(e) => dispatch(setScale(parseFloat(e.target.value)))}
                  className="w-full accent-[var(--theme-glow)] h-1 bg-slate-850 rounded-lg cursor-pointer appearance-none"
                />
              </div>

              {/* Y AXIS SLIDER */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400 font-semibold uppercase">Y-Offset (Height)</span>
                  <span className="text-[var(--theme-glow)]">{positionY > 0 ? '+' : ''}{positionY.toFixed(2)}m</span>
                </div>
                <input
                  type="range"
                  min="-0.6"
                  max="0.6"
                  step="0.02"
                  value={positionY}
                  onChange={(e) => dispatch(setPositionY(parseFloat(e.target.value)))}
                  className="w-full accent-[var(--theme-glow)] h-1 bg-slate-850 rounded-lg cursor-pointer appearance-none"
                />
              </div>

              {/* Z AXIS SLIDER */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400 font-semibold uppercase">Z-Offset (Depth)</span>
                  <span className="text-[var(--theme-glow)]">{positionZ > 0 ? '+' : ''}{positionZ.toFixed(2)}m</span>
                </div>
                <input
                  type="range"
                  min="-0.5"
                  max="0.5"
                  step="0.02"
                  value={positionZ}
                  onChange={(e) => dispatch(setPositionZ(parseFloat(e.target.value)))}
                  className="w-full accent-[var(--theme-glow)] h-1 bg-slate-850 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </div>

            {/* COLOR PALETTE PRESETS AND CUSTOM SELECTOR */}
            <div className="flex flex-col gap-2 border-t border-slate-800 pt-3">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Neon Emitters Palette</span>
              <div className="flex gap-2 items-center flex-wrap">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handleSelectColor(preset.value)}
                    style={{ backgroundColor: preset.value }}
                    className={`w-7 h-7 rounded-full transition-all duration-200 border-2 active:scale-90 relative ${
                      glowColor === preset.value
                        ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                        : 'border-slate-950 hover:scale-105'
                    }`}
                    title={preset.label}
                  />
                ))}

                {/* Custom Color Input Wrapper */}
                <div className="ml-auto flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">
                  <input
                    type="color"
                    value={glowColor}
                    onChange={(e) => dispatch(setGlowColor(e.target.value))}
                    className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                  />
                  <span className="text-[10px] font-bold select-all text-slate-300">{glowColor.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACCESSORY HORIZONTAL CATALOG */}
        <div className="bg-slate-950/70 border border-slate-900/60 rounded-xl p-3 backdrop-blur-md shadow-md flex flex-col gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">GEAR_CHAMBER_LOADOUT</span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {ACCESSORIES.map((item) => {
              const active = selectedAccessory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectAccessory(item.id)}
                  className={`flex-shrink-0 flex flex-col items-start p-3 w-32 border rounded-lg transition-all duration-200 text-left relative overflow-hidden ${
                    active
                      ? 'border-[var(--theme-glow)] bg-[var(--theme-glow-10)] text-[var(--theme-glow)] shadow-[0_0_10px_var(--theme-glow-20)]'
                      : 'border-slate-850 bg-slate-900/50 text-slate-400 hover:border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-xs font-bold tracking-wide uppercase truncate w-full">{item.label}</span>
                  <span className="text-[9px] text-slate-500 truncate w-full mt-0.5">{item.desc}</span>
                  
                  {active && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--theme-glow)] rounded-tl-md flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-slate-950 rounded-full"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* WEBXR DIAGNOSTICS SLIDE DRAWER */}
      {isWebXROpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm pointer-events-auto flex items-center justify-end">
          <div className="w-full max-w-md h-full bg-slate-950 border-l border-[var(--theme-glow-50)] p-6 overflow-y-auto flex flex-col gap-6 font-mono text-xs text-slate-300 shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-slide-in-right">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-[var(--theme-glow)] flex items-center gap-2">
                <Cpu size={16} className="animate-pulse" /> CORE_WEBXR_DIAGNOSTICS
              </h3>
              <button
                onClick={() => {
                  if (isSoundEnabled) soundPlayer.playClick();
                  setIsWebXROpen(false);
                }}
                className="p-1 border border-slate-800 hover:border-[var(--theme-glow-50)] rounded text-slate-400 hover:text-[var(--theme-glow)] transition-all active:scale-95"
              >
                CLOSE [X]
              </button>
            </div>

            {/* DIAGNOSTIC GRAPHICS & SPECS */}
            <div className="flex flex-col gap-3 bg-slate-900/60 border border-slate-850 p-4 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase border-b border-slate-850 pb-1.5">REAL-TIME ENGINE TELEMETRY</span>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="text-slate-500 uppercase text-[9px] block">ENGINE FREQUENCY</span>
                  <span className="font-bold text-[var(--theme-glow)]">{fps} FPS</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[9px] block">GL_RENDER_CORE</span>
                  <span className="font-bold text-slate-200">WEBGL_2.0</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[9px] block">FACE MESH ANCHORS</span>
                  <span className="font-bold text-slate-200">468 SEGMENTS</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[9px] block">LATENCY_INDEX</span>
                  <span className="font-bold text-green-400">12ms (EXCELLENT)</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[9px] block">TARGET_LOCK</span>
                  <span className={`font-bold ${isScanning ? 'text-green-400' : 'text-amber-400'}`}>
                    {isScanning ? 'TRUE (100%)' : 'FALSE (0%)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[9px] block">CAMERA FOV</span>
                  <span className="font-bold text-slate-200">60 DEG (DYNAMIC)</span>
                </div>
              </div>
            </div>

            {/* WEBXR RESEARCH BODY */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-2">WebXR Device API vs. Face-Tracking</h4>
              
              <p className="leading-relaxed text-slate-400">
                While this virtual try-on application uses camera-feed analysis (Computer Vision face mesh markers) via <strong className="text-slate-300">MindAR</strong>, native <strong className="text-cyan-400">WebXR Device APIs</strong> utilize core browser and hardware sensors to place virtual content directly into physical environments.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-glow)] mt-1.5 flex-shrink-0"></div>
                  <div>
                    <strong className="text-slate-200 block">1. Plane Detection & Anchors</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Analyzes visual feature points from a mobile device camera to identify flat horizontal or vertical surfaces (floors, tables, walls) to firmly ground virtual structures without sliding.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-glow)] mt-1.5 flex-shrink-0"></div>
                  <div>
                    <strong className="text-slate-200 block">2. Hit Testing (Raycasting)</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Projects a mathematical ray from the user's screen touch into the physical coordinate matrix, finding where it intersects with estimated planes to place virtual models.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-glow)] mt-1.5 flex-shrink-0"></div>
                  <div>
                    <strong className="text-slate-200 block">3. Light Estimation</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Estimates ambient environmental light values (color temperature, intensity, spherical harmonics) from camera feeds and injects them into the WebGL scene renderer. This aligns artificial object illumination with the user's physical room light.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col gap-2">
                <span className="font-bold text-[10px] text-slate-400 uppercase">W3C Immersive Web Standards</span>
                <p className="text-[11px] text-slate-400">
                  The WebXR Device API is implemented in modern mobile browsers (Chrome on Android, Safari via Apple Vision Pro, Opera Mobile). It integrates VR headsets and AR handsets natively.
                </p>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--theme-glow)] hover:underline inline-flex items-center gap-1 mt-1 font-bold text-[10px]"
                >
                  LEARN MORE ON MDN <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {/* CLOSE DRAWER BOTTOM BUTTON */}
            <button
              onClick={() => {
                if (isSoundEnabled) soundPlayer.playClick();
                setIsWebXROpen(false);
              }}
              className="mt-auto w-full py-3 border border-[var(--theme-glow-50)] text-[var(--theme-glow)] hover:bg-[var(--theme-glow-10)] rounded-lg transition-all font-bold active:scale-98 shadow-[0_0_10px_var(--theme-glow-10)]"
            >
              RESUME SYSTEM EXPERIENCE
            </button>
          </div>
        </div>
      )}

      {/* SNAPSHOT TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 bg-slate-950/90 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg backdrop-blur-md shadow-[0_0_12px_rgba(34,197,94,0.2)] text-[10px] font-bold tracking-wider animate-slide-in">
          [SNAPSHOT_SUCCESSFULLY_SAVED_TO_DEVICE]
        </div>
      )}
    </div>
  );
}
