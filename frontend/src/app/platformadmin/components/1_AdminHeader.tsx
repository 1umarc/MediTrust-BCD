'use client'

import React from 'react'
import { useAccount } from 'wagmi'
import { AdminPanel, ExclamationMark } from '@/app/images'

export function AdminHeader() {
  const { isConnected } = useAccount()

  return (
    <div className="mb-12">

           {/* Admin Panel Header - Title & Description */}
        <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <img src={AdminPanel.src} alt="Admin Panel Icon" className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                Platform{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Administration
                </span>
                </h1>
                <p className="text-slate-400 text-lg">
                Manage roles, permissions, and platform governance
                </p>
            </div>
        </div>

        {/* Information Banner - Admin Responsibilities */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <img src={ExclamationMark.src} alt="Exclamation Mark Icon" className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-white font-bold mb-1">Admin Responsibilities</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                    As Platform Administrator, you provide operational oversight without participating
                    in fund release decisions. Add/remove DAO members who vote on milestone claims,
                    and hospital representatives who verify campaign legitimacy.
                    </p>
                </div>
            </div>
        </div>
    </div>
  )
}