'use client'

import React from 'react'
import { useAccount } from 'wagmi'
import { AdminHeader } from './components/1_AdminHeader'
import { AdminStats } from './components/2_AdminStats'
import { AddDAOMember } from './components/3_AddDAOMember'
import { AddHospitalRep } from './components/4_AddHospitalRep'
import { RemoveMember } from './components/5_RemoveMember'
import { AdminPermission } from '@/app/platformadmin/components/6_AdminPermission'

export default function PlatformAdminPage() {
  const { isConnected } = useAccount()

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-grow pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">

            {/* Admin Panel Header - Platform Administration */}
              <AdminHeader />
            
            {/* Admin Statistics */}
              <AdminStats />
            
            {/* Management Sections - Add & Remove */}
            <div className="space-y-8">
              {/* Add Members */}
              <div>
                <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></span>
                  Add Members
                </h1>
                <div className="grid md:grid-cols-2 gap-6">
                  <AddDAOMember />
                  <AddHospitalRep />
                </div>
              </div>

              {/* Remove Members */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-gradient-to-b from-red-400 to-pink-500 rounded-full"></span>
                  Remove Members
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <RemoveMember type="dao" />
                  <RemoveMember type="hospital" />
                </div>
              </div>

              <div>
                <AdminPermission/>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}