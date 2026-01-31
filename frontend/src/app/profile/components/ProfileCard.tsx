'use client'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'

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
      {/* Animated gradient glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
      
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-400">Online</span>
          </div>
          <button onClick={copyToClipboard} className="p-2 hover:bg-slate-800 rounded-lg transition-all">
            {copied ? (
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-400 hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full opacity-75 blur-md animate-spin-slow"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-500">7</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          
          <div className="mb-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <span className="text-slate-300 font-mono text-sm font-medium">
              {address ? truncateAddress(address) : '0x0000...0000'}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < 4 ? 'text-amber-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium">4.8</span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-full">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
            <span className="text-red-300 text-sm font-semibold">Unverified</span>
          </div>
        </div>

        {/* Mini stats */}
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

        {/* Verification CTA */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 rounded-2xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Get Verified</h4>
              <p className="text-xs text-slate-400">Unlock premium features</p>
            </div>
          </div>
          <button className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20">
            Start Verification
          </button>
        </div>
      </div>
    </div>
  )
}