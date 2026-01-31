'use client'
import React from 'react'

export function ProfileHeader() {
  return (
    <div className="mb-12 relative">
      {/* Background glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
      
      <div className="relative">
        {/* Main heading with multi-gradient */}
        <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient">
              Organizer
            </span>
            {/* Glow effect under text */}
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400/50 via-blue-500/50 to-purple-600/50 blur-xl"></div>
          </span>
          {' '}
          <span className="text-white">Dashboard</span>
        </h1>
        
        {/* Subtitle with icon */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
          <p className="text-slate-400 text-lg md:text-xl font-semibold">
            Manage your campaigns and build your impact
          </p>
        </div>
        
        {/* Quick stats pills */}
        <div className="flex flex-wrap gap-3 mt-6">
          <div className="group/pill relative px-4 py-2 bg-slate-900/50 backdrop-blur-sm border border-emerald-500/20 rounded-full hover:border-emerald-500/40 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full opacity-0 group-hover/pill:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-slate-300">
                <span className="text-emerald-400">0</span> Active Campaigns
              </span>
            </div>
          </div>
          
          <div className="group/pill relative px-4 py-2 bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-full hover:border-cyan-500/40 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full opacity-0 group-hover/pill:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-sm font-bold text-slate-300">
                <span className="text-cyan-400">0</span> Total Raised
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}