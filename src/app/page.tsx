"use client"

import { useEffect, useState } from "react"
import dynamic from 'next/dynamic'
import { AboutModal } from "@/components/about-modal"
import { useStore } from "@/lib/store"

// Dynamically import the Chart component with no SSR
const Chart = dynamic(() => import('@/components/chart'), { ssr: false })

export default function Home() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { connect, disconnect, data, latestMetrics, loading } = useStore()
  const metrics = latestMetrics || {
    cpu: 0, 
    memory: 0, 
    gpu: 0, 
    networkIn: 0, 
    networkOut: 0, 
    temperature: 0,
    networkInterface: '',
    networkSpeed: 0,
    timestamp: Date.now()
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav style={{ height: '56px', backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <span style={{ color: 'white', fontSize: '18px' }}>System Vitals</span>
        <div style={{ marginLeft: 'auto' }}>
          <button 
            onClick={() => setIsAboutOpen(true)} 
            style={{ color: 'white', fontSize: '14px', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', padding: '0', transition: 'color 0.3s' }}
            onMouseOver={(e) => e.currentTarget.style.color = 'gray'}
            onMouseOut={(e) => e.currentTarget.style.color = 'white'}
          >
            About
          </button>
        </div>
      </nav>

      {/* About Modal */}
      <AboutModal 
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Main content */}
      <div className="relative">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 place-items-center">
            <Chart 
              data={data} 
              metric="cpu" 
              color="#2563eb"
              title="Processor Load"
              value={metrics.cpu}
            />

            <Chart 
              data={data} 
              metric="memory" 
              color="#16a34a"
              title="Memory Status"
              value={metrics.memory}
            />

            <Chart 
              data={data} 
              metric="gpu" 
              color="#dc2626"
              title="Graphics Processing"
              value={metrics.gpu}
            />
          </div>

          <div className="flex justify-center">
            <Chart 
              data={data} 
              metric="network" 
              title="Network Activity"
              multiline={[
                { key: 'networkIn', color: '#6366f1', label: 'Inbound' },
                { key: 'networkOut', color: '#a855f7', label: 'Outbound' }
              ]}
              unit=" MB/s"
              networkInterface={latestMetrics?.networkInterface}
              networkSpeed={latestMetrics?.networkSpeed}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 