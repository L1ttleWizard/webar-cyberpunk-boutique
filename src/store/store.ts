import { configureStore } from '@reduxjs/toolkit';
import arReducer from './arSlice';

export const store = configureStore({
  reducer: {
    ar: arReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
