'use client'
import React from 'react'
import Link from 'next/link'

export function MyCampaign() {
  const campaigns: any[] = []

  return (
    <div className="relative group">
      {/* Gradient glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
      
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></span>
              My Campaigns
            </h2>
            <p className="text-slate-400 text-sm">Manage and track your fundraising</p>
          </div>
          
          <Link href="/create-campaign" className="group/btn relative inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-2xl font-bold overflow-hidden hover:scale-105 transition-all shadow-xl shadow-cyan-500/20">
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
            
            <svg className="w-5 h-5 relative z-10 group-hover/btn:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative z-10">Create Campaign</span>
          </Link>
        </div>

        {campaigns.length === 0 ? (
          /* Modern empty state */
          <div className="text-center py-20">
            {/* Animated icon */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 animate-ping">
                <div className="w-28 h-28 border-4 border-cyan-400/20 rounded-full"></div>
              </div>
              
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-slate-800/90 rounded-full flex items-center justify-center border border-slate-700/50">
                  <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">No Campaigns Yet</h3>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
              Start your first campaign and make a difference
            </p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { icon: '🔒', text: 'Secure' },
                { icon: '⚡', text: 'Fast' },
                { icon: '✨', text: 'Control' }
              ].map((feature, i) => (
                <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-xs text-slate-400 font-medium">{feature.text}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((campaign, index) => (
              <div key={index} className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-cyan-500/50 transition-all hover:scale-[1.01]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold text-lg">Campaign Title</h4>
                    <p className="text-slate-400 text-sm">Details...</p>
                  </div>
                  <button className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg font-medium hover:bg-cyan-500/20">View →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}