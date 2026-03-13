'use client'
import React, { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatEther, Address } from 'viem'
import { User, MoneyIcon } from '@/app/images'
import fundsAbi from '@/abi/MediTrustFunds.json'
import { fundsContractAddress } from '@/utils/smartContractAddress'

export function ProfileCard() {
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)
  const truncateAddress = (addr: string) => 
  {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Call getTotalReceived(patient) — returns sum of all executed claim amounts in wei
  const { data: totalWei } = useReadContract
  ({
    address: fundsContractAddress as Address,
    abi: fundsAbi.abi,
    functionName: 'getTotalReceived',
    args: [address],
    query: { enabled: !!address } // only call when wallet is connected
  })

  const totalReceivedEth = totalWei ? parseFloat(formatEther(totalWei as bigint)) : 0

  return (
    <div className="relative group">
      
      {/* Animated gradient glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition"></div>
  
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
        
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-6">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full opacity-75 blur-md animate-spin-slow"></div>
            <div className="relative w-30 h-30 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-30 h-30 bg-slate-900 rounded-full flex items-center justify-center">
                <img src={User.src} alt="User Icon" className="w-14 h-14"/>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="mb-6 px-5 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <span className="text-slate-300 font-mono text-base tracking-wide">
              {address ? truncateAddress(address) : 'Wallet not connected'}
            </span>
          </div>

          {/* Total Raised — inside card, below wallet address */}
          <div className="w-full relative group/stat">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-0 group-hover/stat:opacity-20 transition duration-300" />
            <div className="relative w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4">
              
              {/* Title + Icon row */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Total Received
                </span>
                <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover/stat:scale-110 transition-transform">
                  <img src={MoneyIcon.src} alt="Money Icon" className="w-5 h-5" />
                </div>
              </div>

              {/* Value */}
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-3">
                {totalReceivedEth} HETH  
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full w-3/4 transition-all duration-1000" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}