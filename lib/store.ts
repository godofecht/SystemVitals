import { create } from "zustand"

interface DataPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  gpu: number;
  networkIn: number;
  networkOut: number;
  temperature: number;
}

interface StoreState {
  data: DataPoint[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const useStore = create<StoreState>((set) => ({
  data: [],
  loading: false,
  error: null,
  fetchData: async () => {
    set({ loading: true });
    try {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const baseFreq = Date.now() / 2000;
      const newDataPoint = {
        timestamp: time,
        // Different frequencies and phases for each metric
        cpu: Number((Math.sin(baseFreq) * 20 + 60).toFixed(1)),
        memory: Number((Math.sin(baseFreq * 0.5 + 1) * 15 + 75).toFixed(1)),
        gpu: Number((Math.sin(baseFreq * 0.7 + 2) * 25 + 50).toFixed(1)),
        networkIn: Number((Math.sin(baseFreq * 0.3) * 30 + 40).toFixed(1)),
        networkOut: Number((Math.sin(baseFreq * 0.4 + 3) * 20 + 35).toFixed(1)),
        temperature: Number((Math.sin(baseFreq * 0.2 + 4) * 10 + 65).toFixed(1)),
      };

      set(state => ({
        data: [...state.data.slice(-49), newDataPoint],
        error: null
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
})); 