'use client'

import React from 'react'
import { useAccount } from 'wagmi'
import { AdminGroupUsers, Admin_HospitalReps, CorrectMark } from '@/app/images'

export function AdminPermission6() {
  const { isConnected } = useAccount()

  // Define data in a const array
  const AdminGuideline = 
  [
    {
      title: "DAO Member",
      icon: CorrectMark.src,
      items: 
      [
        "Vote on milestone claim approvals",
        "Review milestone proof documents",
        "Change votes until approval threshold",
        "Includes: Medical professionals, admins, trusted donor"
      ]
    },

    {
        title: "Hospital Representative",
        icon: CorrectMark.src,
        items: 
        [
            "Verify campaign legitimacy during submission",
            "Review medical documentation (IPFS)",
            "Approve/reject campaign submissions",
            "Authorized medical staff from participating hospitals"
        ]
    }
  ];

  return (  
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">

        <h1 className="text-xl font-bold text-white mb-6">Platform Roles & Permissions</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
            {/* DAO Members */}
            <div className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <img src={AdminGroupUsers.src} alt="Admin Group Users Icon" className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-white">DAO Members</h4>
                </div>

                <ul className="space-y-2 text-sm text-slate-400">
                    {/* Loop through all permissions -> generate 1 row per item */}
                    {AdminGuideline[0].items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2"> {/* key={index} -> needs a unique id for each list item */}
                        <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <img src={AdminGuideline[0].icon} alt="Correct Icon" className="w-3 h-3" />
                        </div>
                    {item}
                    </li>   
                    ))}
                </ul>
            </div>

            {/* Hospital Representatives */}
            <div className="space-y-3">

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <img src={Admin_HospitalReps.src} alt="Admin Hospital Reps Icon" className="w-6 h-6" />
                    </div>
                    <h2 className="font-bold text-white">Hospital Representatives</h2>
                </div>

                <ul className="space-y-2 text-sm text-slate-400">
                    {AdminGuideline[1].items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <img src={AdminGuideline[1].icon} alt="Correct Icon" className="w-3 h-3" />
                        </div>
                    {item}
                    </li> 
                    ))}
                </ul>

            </div>
        </div>
    </div>
  )
}