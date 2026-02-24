'use client'

import React from 'react'
import { useAccount } from 'wagmi'
import { ExclamationMark, HospitalPanel, Approve } from '@/app/images'

export function HospitalHeader1() {
  const { address } = useAccount()

  return (
    <div className="mb-12">

      {/* Hospital Panel Header - Title & Description */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
          <img src={HospitalPanel.src} alt="Hospital Panel Icon" className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            Hospital{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Panel
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Review and verify medical campaign submissions
          </p>
        </div>
      </div>

      {/* Information Banner - Hospital Representative Responsibilities */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
            <img src={ExclamationMark.src} alt="Exclamation Mark Icon" className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-white font-bold mb-1">
              Hospital Representative Responsibilities
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              As a Hospital Representative, you verify the legitimacy of medical campaign
              submissions. Review medical documents (diagnosis and treatment quotation) on IPFS
              and assess whether the campaign request is feasible and genuine.
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <img src={Approve.src} alt="Approve Icon" className="w-5 h-5" />
                <span className="text-slate-300">
                  <span className="font-semibold text-white">Verify:</span> Medical documentation authenticity
                </span>
              </div>
              <div className="flex items-start gap-2">
                <img src={Approve.src} alt="Approve Icon" className="w-5 h-5" />
                <span className="text-slate-300">
                  <span className="font-semibold text-white">Assess:</span> Treatment feasibility and cost reasonableness
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}