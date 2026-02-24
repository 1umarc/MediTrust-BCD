'use client'

import React from 'react'
import { CampaignsHeader } from './components/CampaignHeader1'
import { CampaignStats } from './components/CampaignStats2'
import { CampaignList } from './components/CampaignList4'

export default function CampaignsPage() {
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