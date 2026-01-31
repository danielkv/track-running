import { create } from 'zustand';

interface AppState {
  isAuthenticated: boolean;
  stravaAccessToken: string | null;
  setStravaToken: (token: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  stravaAccessToken: null,
  setStravaToken: (token) => set({ stravaAccessToken: token, isAuthenticated: !!token }),
}));
