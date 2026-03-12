'use client'
import React from 'react'
import { useAccount } from 'wagmi'
import { CampaignsHeader } from './components/1_CampaignHeader'
import { CampaignStats } from './components/2_CampaignStats'
import { CampaignList } from './components/4_CampaignList'
import { WalletConnectionWarning } from '../components/WalletConnectionWarning'

// NEW CHANGES 
// If user's wallet is not connected, show warning to connect wallet. Otherwise show campaigns page.
export default function CampaignsPage() {

  const { isConnected } = useAccount()
  if (!isConnected) {
      return <WalletConnectionWarning/>
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col min-h-screen">
        
        <main className="flex-grow pt-24 pb-12 px-4">
          <div className="container mx-auto">
            {/* Page Header */}
            <CampaignsHeader />

            {/* Statistics Cards */}
            <div className="mb-12">
              <CampaignStats />
            </div>

            {/* Campaign List with Filters */}
            <CampaignList />
          </div>
        </main>

      </div>
    </div>
  )
}