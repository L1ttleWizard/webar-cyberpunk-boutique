'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCameraState, setIsScanning } from '../store/arSlice';
import { loadScript } from '../utils/loadScript';
import { soundPlayer } from '../utils/SoundPlayer';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-entity': any;
      'a-camera': any;
      'a-assets': any;
      'a-box': any;
      'a-cylinder': any;
      'a-sphere': any;
      'a-torus': any;
      'a-cone': any;
      'a-text': any;
    }
  }
  namespace React.JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-entity': any;
      'a-camera': any;
      'a-assets': any;
      'a-box': any;
      'a-cylinder': any;
      'a-sphere': any;
      'a-torus': any;
      'a-cone': any;
      'a-text': any;
    }
  }
}

export default function ARSceneContainer() {
  const dispatch = useAppDispatch();
  const {
    selectedAccessory,
    glowColor,
    scale,
    positionY,
    positionZ,
    showFaceMesh,
    isSoundEnabled,
  } = useAppSelector((state) => state.ar);

  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const sceneRef = useRef<any>(null);
  const targetRef = useRef<any>(null);

  // Initialize scripts and custom A-Frame components
  useEffect(() => {
    let active = true;

    const setupAR = async () => {
      try {
        dispatch(setCameraState('loading'));
        
        // 1. Load A-Frame
        if (!(window as any).AFRAME) {
          await loadScript('https://aframe.io/releases/1.4.2/aframe.min.js');
        }

        // 2. Load MindAR Face A-Frame
        if (!(window as any).MINDAR || !(window as any).MINDAR.FACE) {
          await loadScript('https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-face-aframe.prod.js');
        }

        if (active) {
          registerCustomComponents();
          setScriptsLoaded(true);
          dispatch(setCameraState('ready'));

          // Make body and html transparent to expose the background video stream
          document.documentElement.style.backgroundColor = 'transparent';
          document.body.style.backgroundColor = 'transparent';
        }
      } catch (err) {
        console.error('Failed to load AR script resources:', err);
        if (active) {
          dispatch(setCameraState('error'));
        }
      }
    };

    setupAR();

    return () => {
      active = false;
      cleanupAR();
      // Restore default backgrounds on unmount
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, [dispatch]);

  // Wire events for A-Frame targets using native listeners (avoiding React Synthetic events)
  useEffect(() => {
    const targetEl = targetRef.current;
    if (!targetEl) return;

    const handleFound = () => {
      dispatch(setIsScanning(true));
      if (isSoundEnabled) {
        try {
          soundPlayer.playSuccess();
        } catch (_) {}
      }
    };

    const handleLost = () => {
      dispatch(setIsScanning(false));
      if (isSoundEnabled) {
        try {
          soundPlayer.playError();
        } catch (_) {}
      }
    };

    targetEl.addEventListener('targetFound', handleFound);
    targetEl.addEventListener('targetLost', handleLost);

    return () => {
      targetEl.removeEventListener('targetFound', handleFound);
      targetEl.removeEventListener('targetLost', handleLost);
    };
  }, [scriptsLoaded, dispatch, isSoundEnabled]);

  // Handle direct DOM updates when configuration props change (avoiding React re-renders of <a-scene>)
  useEffect(() => {
    if (!scriptsLoaded) return;

    // Update visibility of the model container
    const container = document.getElementById('accessory-container') as any;
    if (container) {
      container.setAttribute('scale', `${scale} ${scale} ${scale}`);
      container.setAttribute('position', `0 ${positionY} ${positionZ}`);
    }

    // Toggle specific accessories
    const visor = document.getElementById('visor-accessory') as any;
    const halo = document.getElementById('halo-accessory') as any;
    const horns = document.getElementById('horns-accessory') as any;
    const mask = document.getElementById('mask-accessory') as any;

    if (visor) visor.setAttribute('visible', selectedAccessory === 'visor');
    if (halo) halo.setAttribute('visible', selectedAccessory === 'halo');
    if (horns) horns.setAttribute('visible', selectedAccessory === 'horns');
    if (mask) mask.setAttribute('visible', selectedAccessory === 'mask');

    // Update color on glowing geometry elements (avoiding replacing the entire material component)
    const glowElements = document.querySelectorAll('.glow-element');
    glowElements.forEach((el: any) => {
      const isEmissive = el.classList.contains('glow-emissive');
      el.setAttribute('material', 'color', glowColor);
      if (isEmissive) {
        el.setAttribute('material', 'emissive', glowColor);
        el.setAttribute('material', 'emissiveIntensity', '1.0');
      }
    });

    // Update color on glowing text elements separately
    const glowTexts = document.querySelectorAll('.glow-text');
    glowTexts.forEach((el: any) => {
      el.setAttribute('color', glowColor);
    });

    // Update the custom hologram face mesh properties
    const faceMesh = document.getElementById('holo-mesh-entity') as any;
    if (faceMesh) {
      faceMesh.setAttribute('hologram-face-mesh', {
        enabled: showFaceMesh && selectedAccessory !== 'none',
        color: glowColor,
      });
    }
  }, [selectedAccessory, glowColor, scale, positionY, positionZ, showFaceMesh, scriptsLoaded]);

  // Custom A-Frame component registrations
  const registerCustomComponents = () => {
    const AFRAME = (window as any).AFRAME;
    if (!AFRAME) return;

    // Avoid double-registration error
    if (AFRAME.components['hologram-face-mesh']) return;

    const THREE = AFRAME.THREE;

    AFRAME.registerComponent('hologram-face-mesh', {
      schema: {
        enabled: { type: 'boolean', default: true },
        color: { type: 'string', default: '#00ffff' },
        wireframe: { type: 'boolean', default: true },
      },

      init: function(this: any) {
        const arSystem = this.el.sceneEl.systems['mindar-face-system'];
        if (arSystem) {
          arSystem.registerFaceMesh(this);
        }
        this.el.object3D.matrixAutoUpdate = false;
      },

      updateVisibility: function(this: any, visible: boolean) {
        this.el.object3D.visible = visible && this.data.enabled;
      },

      updateMatrix: function(this: any, matrix: number[]) {
        this.el.object3D.matrix.set(...matrix);
      },

      addFaceMesh: function(this: any, faceGeometry: any) {
        this.material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(this.data.color),
          wireframe: this.data.wireframe,
          transparent: true,
          opacity: 0.35,
        });
        this.mesh = new THREE.Mesh(faceGeometry, this.material);
        this.el.setObject3D('mesh', this.mesh);
      },

      update: function(this: any) {
        if (this.mesh && this.material) {
          this.material.color.set(this.data.color);
          this.material.wireframe = this.data.wireframe;
          this.material.needsUpdate = true;
        }
      },
    });
  };

  const cleanupAR = () => {
    // 1. Stop MindAR tracking
    const sceneEl = sceneRef.current || document.querySelector('a-scene');
    if (sceneEl) {
      if (sceneEl.systems && sceneEl.systems['mindar-face-system']) {
        try {
          sceneEl.systems['mindar-face-system'].stop();
        } catch (e) {
          console.warn('Failed to stop mindar-face-system:', e);
        }
      }
      if (sceneEl.renderer) {
        try {
          sceneEl.renderer.dispose();
        } catch (e) {
          console.warn('Failed to dispose WebGL renderer:', e);
        }
      }
    }

    // 2. Stop camera stream and delete video tags
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      video.remove();
    });

    // 3. Remove injected tags
    document.documentElement.classList.remove('a-fullscreen');
    document.body.classList.remove('a-fullscreen');

    const canvas = document.querySelector('.a-canvas');
    if (canvas) canvas.remove();

    const loader = document.querySelector('.a-loader-title');
    if (loader) loader.remove();

    const mindarUI = document.querySelectorAll('.mindar-ui-overlay');
    mindarUI.forEach((el) => el.remove());
  };

  // Wire events for A-Frame systems
  const handleSceneReady = () => {
    console.log('MindAR scene is ready!');
  };

  const handleTargetFound = () => {
    dispatch(setIsScanning(true));
    soundPlayer.playSuccess();
  };

  const handleTargetLost = () => {
    dispatch(setIsScanning(false));
    soundPlayer.playError();
  };

  if (!scriptsLoaded) {
    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-cyan-400 font-mono">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin"></div>
        </div>
        <h2 className="text-xl tracking-widest uppercase animate-pulse">Initializing WebAR Core</h2>
        <p className="mt-2 text-sm text-cyan-500/70">Connecting tracking libraries...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-transparent">
      <a-scene
        ref={sceneRef}
        mindar-face="autoStart: true; faceOccluder: true; uiLoading: no; uiScanning: no;"
        embedded
        color-space="sRGB"
        renderer="colorManagement: true, physicallyCorrectLights"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        style={{ width: '100%', height: '100%' }}
        onRenderstart={handleSceneReady}
        ar-ready="" // custom empty component attribute to query
      >
        <a-camera active="false" position="0 0 0" look-controls="enabled: false"></a-camera>

        {/* Custom Hologram Face mesh overlay */}
        <a-entity id="holo-mesh-entity" hologram-face-mesh="enabled: true; color: #00ffff; wireframe: true;"></a-entity>

        {/* Face tracking target anchor at Index 168 (bridge of nose) */}
        <a-entity
          ref={targetRef}
          mindar-face-target="anchorIndex: 168"
        >
          {/* Main container for scaling/offset transformations */}
          <a-entity id="accessory-container" position="0 0 0" scale="1.0 1.0 1.0">
            
            {/* Cyber-Visor Accessory */}
            <a-entity id="visor-accessory" visible="false">
              {/* Visor Glass */}
              <a-box
                position="0 0.03 0.04"
                scale="1.45 0.16 0.02"
                class="glow-element glow-emissive"
                material={`color: ${glowColor}; transparent: true; opacity: 0.7; metalness: 0.8; roughness: 0.1;`}
              ></a-box>
              {/* Top Frame Bar */}
              <a-box
                position="0 0.125 0.03"
                scale="1.48 0.03 0.04"
                material="color: #0b0f19; metalness: 0.9; roughness: 0.2"
              ></a-box>
              {/* Glowing Neon Horizontal Line */}
              <a-cylinder
                position="0 0.03 0.051"
                rotation="90 0 90"
                radius="0.012"
                height="1.4"
                class="glow-element glow-emissive"
                material={`color: ${glowColor};`}
              ></a-cylinder>
              {/* Left temple frame */}
              <a-box
                position="-0.72 0.02 -0.15"
                rotation="0 18 0"
                scale="0.03 0.08 0.42"
                material="color: #0b0f19; metalness: 0.9; roughness: 0.2"
              ></a-box>
              {/* Right temple frame */}
              <a-box
                position="0.72 0.02 -0.15"
                rotation="0 -18 0"
                scale="0.03 0.08 0.42"
                material="color: #0b0f19; metalness: 0.9; roughness: 0.2"
              ></a-box>
            </a-entity>

            {/* Cosmic Halo Accessory */}
            <a-entity id="halo-accessory" visible="false">
              {/* Glowing Ring above head */}
              <a-torus
                position="0 0.48 -0.12"
                rotation="80 0 0"
                radius="0.4"
                radius-tubular="0.015"
                class="glow-element glow-emissive"
                material={`color: ${glowColor}; transparent: true; opacity: 0.85;`}
              ></a-torus>
              {/* Central Floating Orb */}
              <a-sphere
                position="0 0.65 -0.15"
                radius="0.05"
                class="glow-element glow-emissive"
                material={`color: ${glowColor}; transparent: true; opacity: 0.9;`}
                animation="property: position; to: 0 0.68 -0.15; dir: alternate; dur: 800; loop: true; easing: easeInOutSine"
              ></a-sphere>
              {/* Rotating Satellites Wrapper */}
              <a-entity
                rotation="0 0 0"
                animation="property: rotation; to: 0 360 0; dur: 5000; loop: true; easing: linear"
              >
                <a-sphere
                  position="0.48 0.48 -0.12"
                  radius="0.025"
                  class="glow-element glow-emissive"
                  material={`color: ${glowColor};`}
                ></a-sphere>
              </a-entity>
              <a-entity
                rotation="0 180 0"
                animation="property: rotation; to: 0 540 0; dur: 5000; loop: true; easing: linear"
              >
                <a-sphere
                  position="0.48 0.48 -0.12"
                  radius="0.025"
                  class="glow-element glow-emissive"
                  material={`color: ${glowColor};`}
                ></a-sphere>
              </a-entity>
            </a-entity>

            {/* Demon Horns Accessory */}
            <a-entity id="horns-accessory" visible="false">
              {/* Left Horn */}
              <a-cone
                position="-0.22 0.35 -0.05"
                rotation="-10 5 22"
                radius-bottom="0.07"
                radius-top="0.005"
                height="0.35"
                class="glow-element glow-emissive"
                material={`color: ${glowColor}; roughness: 0.3; metalness: 0.4;`}
              ></a-cone>
              {/* Right Horn */}
              <a-cone
                position="0.22 0.35 -0.05"
                rotation="-10 -5 -22"
                radius-bottom="0.07"
                radius-top="0.005"
                height="0.35"
                class="glow-element glow-emissive"
                material={`color: ${glowColor}; roughness: 0.3; metalness: 0.4;`}
              ></a-cone>
              {/* Headband mount */}
              <a-torus
                position="0 0.12 -0.05"
                rotation="15 0 0"
                radius="0.24"
                radius-tubular="0.008"
                material="color: #0b0f19; opacity: 0.9;"
              ></a-torus>
            </a-entity>

            {/* Matrix Scanner Accessory */}
            <a-entity id="mask-accessory" visible="false">
              {/* Horizontal scanning bar */}
              <a-box
                position="0 0 0.08"
                scale="1.3 0.015 0.005"
                class="glow-element glow-emissive"
                material={`color: ${glowColor};`}
                animation="property: position; from: 0 -0.15 0.08; to: 0 0.15 0.08; dir: alternate; dur: 1500; loop: true; easing: easeInOutQuad"
              ></a-box>
              {/* Futuristic interface panels */}
              <a-text
                value="[SYS_SCANNING]\nHUMAN_INDEX: 01"
                position="-0.85 0.22 0.08"
                scale="0.14 0.14 0.14"
                class="glow-text"
                color={glowColor}
                font="monoid"
              ></a-text>
              <a-text
                value="LOCK: READY\nSTABILITY: 99.8%"
                position="0.38 0.22 0.08"
                scale="0.14 0.14 0.14"
                class="glow-text"
                color={glowColor}
                font="monoid"
              ></a-text>
            </a-entity>

          </a-entity>
        </a-entity>
      </a-scene>
    </div>
  );
}
