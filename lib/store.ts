import { create } from "zustand"

interface SystemMetrics {
  timestamp: number;
  cpu: number;
  memory: number;
  temperature: number;
  gpu: number;
  networkIn: number;
  networkOut: number;
  networkInterface: string;
  networkSpeed: number;
  gpuTemp?: number;
  gpuMemoryTotal?: number;
  gpuMemoryUsed?: number;
  gpuUtilization?: number;
}

interface Store {
  data: SystemMetrics[];
  latestMetrics: SystemMetrics | null;
  loading: boolean;
  error: string | null;
  ws: WebSocket | null;
  connect: () => void;
  disconnect: () => void;
}

export const useStore = create<Store>((set, get) => ({
  data: [],
  latestMetrics: null,
  loading: false,
  error: null,
  ws: null,

  connect: () => {
    try {
      const ws = new WebSocket('ws://localhost:8080');
      
      ws.onmessage = (event) => {
        const newMetrics = JSON.parse(event.data);
        set((state) => ({
          data: [...state.data.slice(-50), newMetrics],
          latestMetrics: newMetrics,
          loading: false,
          error: null
        }));
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        set({ error: 'WebSocket error', loading: false });
      };

      ws.onclose = () => {
        console.error('WebSocket disconnected');
        set({ error: 'WebSocket disconnected', loading: false });
        setTimeout(() => get().connect(), 5000);
      };

      set({ ws, loading: true, error: null });
    } catch (error) {
      set({ error: 'Failed to connect', loading: false });
    }
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null });
    }
  }
})); 