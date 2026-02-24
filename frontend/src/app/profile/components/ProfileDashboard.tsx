'use client'
import React from 'react'
import { ProfileHeader } from './1_ProfileHeader'
import { ProfileCard } from './2_ProfileCard'
import { ProfileNavigation } from './3_ProfileNavigation'
import { ProfileStats } from './4_ProfileStats'
import { MyCampaign } from './5_MyCampaign'


export function ProfileDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader />

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <ProfileCard />
          <ProfileNavigation />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Stats Grid */}
          <ProfileStats/>

          {/* My Campaigns Section */}
          <MyCampaign />
        </div>

      </div>
    </div>
  )
}