'use client'
import React from 'react'
import { ProfileHeader } from './ProfileHeader1'
import { ProfileCard } from './ProfileCard2'
import { ProfileStats4 } from './ProfileStats4'
import { MyCampaign } from './MyCampaign5'
import { ProfileNavigation } from './ProfileNavigation3'
import { MoneyIcon, FireIcon, AdminGroupUsers  } from '@/app/images'

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
          <ProfileStats4/>

          {/* My Campaigns Section */}
          <MyCampaign />
        </div>

      </div>
    </div>
  )
}