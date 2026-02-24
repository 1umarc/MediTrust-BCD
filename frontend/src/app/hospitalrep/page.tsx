'use client'

import React from 'react'
import { HospitalHeader1 } from './components/HospitalHeader1'
import { HospitalStats2 } from './components/HospitalStats2'
import { CampaignReviewList3 } from './components/CampaignReviewList3'
import { useAccount } from 'wagmi'
import CampaignGuideline4 from './components/CampaignGuideline4'

export default function HospitalPage() {
  const { isConnected } = useAccount()

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col min-h-screen">
        
        <main className="flex-grow pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">
            {/* Hospital Panel Header */}
            <HospitalHeader1/>
            
            {/* Hospital Statistics */}
            <div className="mb-12">
              <HospitalStats2/>
            </div>

            {/* Campaign Reviews */}
            <div>
              <CampaignReviewList3 />
            </div>

            {/* Verification Guidelines */}
            <div>
              <CampaignGuideline4 />
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}