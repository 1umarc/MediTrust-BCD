'use client'
import React from 'react'
import { MoneyIcon, FireIcon, AdminGroupUsers } from '@/app/images'

export function ProfileStats() {

  // Define data in an array
  const ProfileStats = [
    {
      title: 'Total Raised',
      value: 'HETH 0',
      icon: <img src={MoneyIcon.src} alt="Money Icon" className="w-8 h-8" />,
      gradient: 'from-cyan-400 to-blue-500',
    },
    {
      title: 'Active Campaigns',
      value: '0',
      icon: <img src={FireIcon.src} alt="Fire Icon" className="w-6 h-6" />,
      gradient: 'from-emerald-400 to-teal-500',
    },
    {
      title: 'Total Supporters',
      value: '0',
      icon: <img src={AdminGroupUsers.src} alt="Admin Group Users Icon" className="w-6 h-6" />,
      gradient: 'from-purple-400 to-pink-500', // also fix: From- -> from-
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {ProfileStats.map((stat, index) => (
        <div key={index} className="relative group">

          {/* Animated glow - Card border */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}>
          </div>

          {/* Create 3 Main card - Total Raised , Active Campaigns & Total Supporters*/}
          <div className="relative h-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 overflow-hidden hover:scale-[1.02] transition-transform duration-300">

            <div className="relative z-10">
              
              {/* Title - Total Raised, Active Campaigns & Total Supporters*/}
              <div className="flex items-start mb-6">
                <div className="flex-grow">
                  <div className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                    {stat.title}
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>

              {/* Value - HETH 0 */}
              <div
                className={`text-4xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
                {stat.value}
              </div>

              {/* Progress bar - Blue Colour, Green Colour & PurplePink Colour */}
              <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full w-3/4 transition-all duration-1000`}>
                </div>
              </div>

            </div>

          </div>
        </div>

      ))}

    </div>
  )
}