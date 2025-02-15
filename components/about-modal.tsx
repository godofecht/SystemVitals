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
        <div className="px-6 py-4 flex justify-between items-center">
          <p className="text-gray-300">
            Just a quick mini project by Abhishek Shivakumar
          </p>
          <button 
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-300"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}; 