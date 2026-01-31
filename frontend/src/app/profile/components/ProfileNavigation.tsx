'use client'
import React, { useState } from 'react'

export function ProfileNavigation() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'donations'>('campaigns')

  return (
    <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2">
      <button
        onClick={() => setActiveTab('campaigns')}
        className={`relative w-full px-4 py-3 rounded-xl font-semibold transition-all ${
          activeTab === 'campaigns'
            ? 'text-white'
            : 'text-slate-400 hover:text-slate-300'
        }`}
      >
        {activeTab === 'campaigns' && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl"></div>
        )}
        <span className="relative z-10">My Campaigns</span>
      </button>
      
      <button
        onClick={() => setActiveTab('donations')}
        className={`relative w-full px-4 py-3 rounded-xl font-semibold transition-all mt-2 ${
          activeTab === 'donations'
            ? 'text-white'
            : 'text-slate-400 hover:text-slate-300'
        }`}
      >
        {activeTab === 'donations' && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl"></div>
        )}
        <span className="relative z-10">Recent Donations</span>
      </button>
    </div>
  )
}