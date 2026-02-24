'use client'

import React from 'react'
import { useAccount } from 'wagmi'
import { AdminHeader1 } from '../platformadmin/components/AdminHeader1'
import { AdminStats2 } from './components/AdminStats2'
import { AddDAOMember3 } from './components/AddDAOMember3'
import { AddHospitalRep4 } from './components/AddHospitalRep4'
import { RemoveMember5 } from './components/RemoveMember5'
import { AdminPermission6 } from '@/app/platformadmin/components/AdminPermission6'

export default function PlatformAdminPage() {
  const { isConnected } = useAccount()

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-grow pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">

            {/* Admin Panel Header - Platform Administration */}
              <AdminHeader1 />
            
            {/* Admin Statistics */}
              <AdminStats2 />
            
            {/* Management Sections - Add & Remove */}
            <div className="space-y-8">
              {/* Add Members */}
              <div>
                <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></span>
                  Add Members
                </h1>
                <div className="grid md:grid-cols-2 gap-6">
                  <AddDAOMember3 />
                  <AddHospitalRep4 />
                </div>
              </div>

              {/* Remove Members */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-gradient-to-b from-red-400 to-pink-500 rounded-full"></span>
                  Remove Members
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <RemoveMember5 type="dao" />
                  <RemoveMember5 type="hospital" />
                </div>
              </div>

              <div>
                <AdminPermission6/>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}