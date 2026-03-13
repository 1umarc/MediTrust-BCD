'use client'
import React from 'react'
import { ProfileHeader } from './1_ProfileHeader'
import { ProfileCard } from './2_ProfileCard'
import { MyCampaign } from './3_MyCampaign'

export function ProfileDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader />

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <ProfileCard />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* My Campaigns Section */}
          <MyCampaign />
        </div>

      </div>
    </div>
  )
}