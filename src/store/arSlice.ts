import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AccessoryType = 'none' | 'visor' | 'halo' | 'horns' | 'mask';

export interface ARState {
  selectedAccessory: AccessoryType;
  glowColor: string;
  scale: number;
  positionY: number;
  positionZ: number;
  showFaceMesh: boolean;
  isSoundEnabled: boolean;
  cameraState: 'idle' | 'loading' | 'ready' | 'error';
  isScanning: boolean;
}

const initialState: ARState = {
  selectedAccessory: 'none',
  glowColor: '#00ffff', // Default electric cyan
  scale: 1.0,
  positionY: 0.0,
  positionZ: 0.0,
  showFaceMesh: true,
  isSoundEnabled: true,
  cameraState: 'idle',
  isScanning: false,
};

export const arSlice = createSlice({
  name: 'ar',
  initialState,
  reducers: {
    setAccessory: (state, action: PayloadAction<AccessoryType>) => {
      state.selectedAccessory = action.payload;
    },
    setGlowColor: (state, action: PayloadAction<string>) => {
      state.glowColor = action.payload;
    },
    setScale: (state, action: PayloadAction<number>) => {
      state.scale = action.payload;
    },
    setPositionY: (state, action: PayloadAction<number>) => {
      state.positionY = action.payload;
    },
    setPositionZ: (state, action: PayloadAction<number>) => {
      state.positionZ = action.payload;
    },
    toggleFaceMesh: (state) => {
      state.showFaceMesh = !state.showFaceMesh;
    },
    toggleSound: (state) => {
      state.isSoundEnabled = !state.isSoundEnabled;
    },
    setCameraState: (state, action: PayloadAction<ARState['cameraState']>) => {
      state.cameraState = action.payload;
    },
    setIsScanning: (state, action: PayloadAction<boolean>) => {
      state.isScanning = action.payload;
    },
    resetAdjustments: (state) => {
      state.scale = 1.0;
      state.positionY = 0.0;
      state.positionZ = 0.0;
    },
  },
});

export const {
  setAccessory,
  setGlowColor,
  setScale,
  setPositionY,
  setPositionZ,
  toggleFaceMesh,
  toggleSound,
  setCameraState,
  setIsScanning,
  resetAdjustments,
} = arSlice.actions;

export default arSlice.reducer;
