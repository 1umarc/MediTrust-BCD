'use client'

import React from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { DAOStats } from './components/2_DAOStats'
import { MilestoneClaimList } from './components/3_MilestoneClaimList'
import { useAccount } from 'wagmi'
import { DAOHeader }  from './components/1_DAOHeader'
import { VotingGuideline } from './components/4_VotingGuideline'
import { CampaignReviewCard } from '../hospitalrep/components/CampaignReviewCard'
import { MilestoneClaimCard } from './components/MilestoneClaimCard'

export default function DAOPage() {
  const { isConnected } = useAccount()

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col min-h-screen">
        
        <main className="flex-grow pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">

            {/* DAO Voting */}
            <DAOHeader />

            {/* DAO Statistics */}
            <div className="mb-12">
              <DAOStats />
            </div>

            {/* Voting Section */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="w-1.5 h-8 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></span>
                <h2 className="text-2xl font-bold text-white">Milestone Claims</h2>
              </div>
              
              <MilestoneClaimList />
              
              <div>
                <VotingGuideline />
              </div>
            </div>


          </div>
        </main>

      </div>
    </div>
  )
}