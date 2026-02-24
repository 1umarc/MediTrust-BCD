'use client'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { User } from '@/app/images'

export function ProfileCard() {
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative group">
      
      {/* Animated gradient glow - Effects on border line */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition"></div>
      
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
      
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full opacity-75 blur-md animate-spin-slow"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center">
                <img src={User.src} alt="User Icon" className="w-8 h-8"/>
              </div>
            </div>
          </div>
          
          {/* TODO: what if the user already connect with the wallet -> display the connected wallet address*/}
          {/* Wallet Address */}
          <div className="mb-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <span className="text-slate-300 font-mono text-sm font-medium">
              {address ? truncateAddress(address) : '0x0000...0000'}
            </span>
          </div>
          
          {/* Verify Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-full">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
            <span className="text-red-300 text-sm font-semibold">Unverified</span>
          </div>
        </div>

        {/* TODO: what if the user have many campaigns and supporters -> display the number of them */}
        {/* Mini stats - Campaigns & Supporters */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">0</div>
            <div className="text-xs text-slate-400 font-medium">Campaigns</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">0</div>
            <div className="text-xs text-slate-400 font-medium">Supporters</div>
          </div>
        </div>
      </div>
    </div>
  )
}