'use client'
import React from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  gradient?: string
  trend?: {
    value: string
    isPositive: boolean
  }
}

export function StatsCard({ title, value, icon, gradient = 'from-cyan-500 to-blue-600', trend }: StatsCardProps) {
  return (
    <div className="relative group">
      {/* Animated glow */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>
      
      {/* Main card */}
      <div className="relative h-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 overflow-hidden hover:scale-[1.02] transition-transform duration-300">
        {/* Background orb */}
        <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity`}></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-grow">
              <div className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">{title}</div>
              {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    {trend.isPositive ? (
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                    )}
                  </svg>
                  {trend.value}
                </div>
              )}
            </div>
            
            {/* Icon */}
            <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              {icon}
            </div>
          </div>

          {/* Value */}
          <div className={`text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
            {value}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${gradient} rounded-full w-3/4 transition-all duration-1000`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}