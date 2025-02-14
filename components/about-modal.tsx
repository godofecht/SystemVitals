"use client"

import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'black',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        width: '80%',
        maxWidth: '500px',
        color: 'white'
      }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">About System Vitals</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-300 mb-4">
            System Vitals is a real-time performance monitoring dashboard that provides instant visibility into your system's key metrics:
          </p>
          
          <ul className="space-y-2 text-gray-300 mb-4">
            <li>• CPU utilization tracking</li>
            <li>• Memory usage monitoring</li>
            <li>• GPU performance metrics</li>
            <li>• System temperature readings</li>
            <li>• Network traffic analysis</li>
          </ul>

          <p className="text-gray-300 mb-4">
            All metrics are updated in real-time with smooth animations, providing a clear and immediate understanding of your system's performance.
          </p>

          <p className="text-gray-400 text-sm">
            Built with Next.js, Chart.js, and Tailwind CSS. Designed for both technical and non-technical users.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-900 flex justify-end rounded-b-lg">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 