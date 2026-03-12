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
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-10">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full opacity-75 blur-md animate-spin-slow"></div>
            <div className="relative w-30 h-30 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-30 h-30 bg-slate-900 rounded-full flex items-center justify-center">
                <img src={User.src} alt="User Icon" className="w-14 h-14"/>
              </div>
            </div>
          </div>
          
          {/* Wallet Address */}
          <div className="mb-3 px-5 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <span className="text-slate-300 font-mono text-base px-5 py-2.5 tracking-wide">
              {address ? truncateAddress(address) : 'Wallet not connected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}