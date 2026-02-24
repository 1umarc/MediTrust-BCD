'use client'

import React from 'react'
import { useAccount } from 'wagmi'
import { DAOVoting, ExclamationMark, CorrectMark } from '@/app/images'

export function DAOHeader() {
  const { isConnected } = useAccount()

  return (
    <div className="mb-12">

      {/* DAO Voting Header - Title & Description */} 
      <div className="flex items-center gap-4 mb-4">

        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
            <img src={DAOVoting.src} alt="DAO Voting Icon" className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            DAO <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Voting</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Review and vote on milestone claims
          </p>
        </div>

      </div>

      {/* Information Banner - DAO Voting */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">

        <div className="flex items-start gap-4">

          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
              <img src={ExclamationMark.src} alt="Exclamation Mark Icon" className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-white font-bold mb-1">DAO Voting Process</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              As a DAO member, you vote on milestone claims submitted by campaign organizers. Review the proof documents (medical bills, receipts, etc.) and approve or reject claims. You can change your vote anytime before approval.
            </p>
  
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <img src={CorrectMark.src} alt="Correct Mark Icon" className="w-4 h-4" />
                </div>
                <span className="text-slate-300">
                  <span className="font-semibold text-white">Approval Threshold:</span> 60% of votes must be "Approve"
                </span>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <img src={CorrectMark.src} alt="Correct Mark Icon" className="w-4 h-4" />
                </div>
                <span className="text-slate-300">
                  <span className="font-semibold text-white">Participation Required:</span> 50% of DAO members must vote
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}