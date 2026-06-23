import { create } from 'zustand';

export const useScrollStore = create((set) => ({
  progress: 0,
  section: 0,
  setProgress: (p) =>
    set({
      progress: p,
      section: Math.min(6, Math.floor(p * 6.999)),
    }),
}));
