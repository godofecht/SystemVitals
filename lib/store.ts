import { create } from "zustand"
import { getMetrics } from './metrics'

interface SystemMetrics {
  timestamp: number;
  cpu: number;
  memory: number;
  gpu: number;
  networkIn: number;
  networkOut: number;
  networkInterface: string;
  networkSpeed: number;
}

interface Store {
  data: SystemMetrics[];
  latestMetrics: SystemMetrics | null;
  loading: boolean;
  error: string | null;
  intervalId: number | null;
  connect: () => void;
  disconnect: () => void;
}

export const useStore = create<Store>((set, get) => ({
  data: [],
  latestMetrics: null,
  loading: false,
  error: null,
  intervalId: null,

  connect: () => {
    const intervalId = window.setInterval(async () => {
      try {
        const metrics = await getMetrics();
        set((state) => ({
          data: [...state.data.slice(-50), metrics],
          latestMetrics: metrics,
          loading: false,
          error: null
        }));
      } catch (error) {
        console.error('Error getting metrics:', error);
        set({ error: 'Failed to get metrics', loading: false });
      }
    }, 100);  // Update every 100ms

    set({ intervalId, loading: true, error: null });
  },

  disconnect: () => {
    const { intervalId } = get();
    if (intervalId) {
      window.clearInterval(intervalId);
      set({ intervalId: null });
    }
  }
})); 