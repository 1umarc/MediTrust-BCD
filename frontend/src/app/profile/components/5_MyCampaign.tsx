'use client'
import React from 'react'
import Link from 'next/link'
import { AddIcon, CampaignEmptyState}  from '@/app/images'
import { formatEther } from 'viem'

const dummyCampaigns = [
  {
    campaignID: 1,
    patient: '0x7099AbCdEf1234567890abcdef12345679C8',
    target: BigInt('5000000000000000000'),   // 5 HETH
    raised: BigInt('3200000000000000000'),   // 3.2 HETH
    duration: 30,
    ipfsHash: 'QmXyz123',
    status: 1, // Approved
  },
  {
    campaignID: 2,
    patient: '0xAb12Cd34Ef56789012345678abcdef901234',
    target: BigInt('10000000000000000000'),  // 10 HETH
    raised: BigInt('1500000000000000000'),   // 1.5 HETH
    duration: 60,
    ipfsHash: 'QmAbc456',
    status: 0, // Pending
  },
  {
    campaignID: 3,
    patient: '0x1234567890AbCdEf1234567890abcdef5678',
    target: BigInt('2000000000000000000'),   // 2 HETH
    raised: BigInt('2000000000000000000'),   // 2 HETH (completed)
    duration: 15,
    ipfsHash: 'QmDef789',
    status: 3, // Completed
  },
  {
    campaignID: 4,
    patient: '0xDeAdBeEf1234567890abcdef1234567890AB',
    target: BigInt('8000000000000000000'),   // 8 HETH
    raised: BigInt('500000000000000000'),    // 0.5 HETH
    duration: 45,
    ipfsHash: 'QmGhi012',
    status: 2, // Rejected
  },
]

const statusLabels = ['Pending', 'Approved', 'Rejected', 'Completed']
const statusColors: Record<number, string> = {
  0: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  1: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  2: 'bg-red-500/20 border-red-500/30 text-red-300',
  3: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
}


export function MyCampaign() {
  // const campaigns: any[] = []
  const campaigns = dummyCampaigns

  return (
    <div className="relative group">
      {/* Gradient glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
      
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">

        {/* Header - Title & Descriptions*/}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></span>
              My Campaigns
            </h1>
            <p className="text-slate-400 text-sm">Manage and track your fundraising</p>
          </div>
          
          {/* Create Campaign Button */}
          <Link href="/campaigns/formCreation" className="group/btn relative inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-2xl font-bold overflow-hidden hover:scale-105 transition-all shadow-xl shadow-cyan-500/20">
            <img src={AddIcon.src} alt="Add Icon" className="w-6 h-6"/>
            <span className="relative z-10">Create Campaign</span>
          </Link>
        </div>

        {/* If no campaign yet - Show empty state*/}
        {campaigns.length === 0 ? (
          <div className="text-center py-20">
            {/* Animated Icon */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 animate-ping">
                <div className="w-28 h-28 border-4 border-cyan-400/20 rounded-full"></div>
              </div>
              
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-slate-800/90 rounded-full flex items-center justify-center border border-slate-700/50">
                  <img src={CampaignEmptyState.src} alt="Campaign Empty State" className= "w-12 h-12"/>
                </div>
              </div>
            </div>

            {/* SubTitle & Descriptions */}
            <h2 className="text-2xl font-bold text-white mb-3">No Campaigns Yet</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
              Start your first campaign and make a difference
            </p>

            {/* Features - Secure, Fast, Control*/}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { icon: '🔒', text: 'Secure' },
                { icon: '⚡', text: 'Fast' },
                { icon: '✨', text: 'Control' }
              ].map((feature, i) => (
                <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-xs text-slate-400 font-medium">{feature.text}</div>
                </div>
              ))}
            </div>

          </div>

        ) : (
          /* ---------- Campaign List ---------- */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((c) => {
              const progress = (Number(c.raised) / Number(c.target)) * 100

              return (
                <div key={c.campaignID} className="group/card relative">
                  {/* Glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 group-hover/card:opacity-30 transition duration-500"></div>

                  <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Campaign #{c.campaignID}</h3>
                        <p className="text-sm text-slate-400 font-mono">
                          {c.patient.slice(0, 6)}...{c.patient.slice(-4)}
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusColors[c.status]}`}>
                        {statusLabels[c.status]}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400 font-semibold">Progress</span>
                        <span className="text-cyan-400 font-bold">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1 font-semibold">Target</div>
                        <div className="text-lg font-bold text-white">{formatEther(c.target)} HETH</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1 font-semibold">Raised</div>
                        <div className="text-lg font-bold text-cyan-400">{formatEther(c.raised)} HETH</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}