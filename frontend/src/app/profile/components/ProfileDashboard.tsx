'use client'
import React from 'react'
import { ProfileHeader } from './ProfileHeader'
import { ProfileCard } from './ProfileCard'
import { StatsCard } from './StatsCard'
import { MyCampaign } from './MyCampaign'
import { ProfileNavigation } from './ProfileNavigation'

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
          <div className="grid md:grid-cols-3 gap-6">
            <StatsCard
              title="Total Raised"
              value="RM 0"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              gradient="from-cyan-400 to-blue-500"
              trend={{ value: "+12.5%", isPositive: true }}
            />

            <StatsCard
              title="Active Campaigns"
              value="0"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              }
              gradient="from-emerald-400 to-teal-500"
            />

            <StatsCard
              title="Total Supporters"
              value="0"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              gradient="from-purple-400 to-pink-500"
            />
          </div>

          {/* My Campaigns Section */}
          <MyCampaign />
        </div>
      </div>
    </div>
  )
}