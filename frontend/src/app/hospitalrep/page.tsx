'use client'

import React from 'react'
import { useAccount } from 'wagmi'
import { HospitalHeader } from './components/1_HospitalHeader'
import { HospitalStats } from './components/2_HospitalStats'
import { CampaignReviewList } from './components/3_CampaignReviewList'
import CampaignGuideline from './components/4_CampaignGuideline'

export default function HospitalPage() {
  const { isConnected } = useAccount()

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col min-h-screen">
        
        <main className="flex-grow pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">
            {/* Hospital Panel Header */}
            <HospitalHeader/>
            
            {/* Hospital Statistics */}
            <div className="mb-12">
              <HospitalStats/>
            </div>

            {/* Campaign Reviews */}
            <div>
              <CampaignReviewList />
            </div>

            {/* Verification Guidelines */}
            <div>
              <CampaignGuideline />
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}