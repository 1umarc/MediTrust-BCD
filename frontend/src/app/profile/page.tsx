'use client'

import React from 'react'
import { useAccount } from 'wagmi'
import { ProfileDashboard } from './components/ProfileDashboard'
import { WalletConnectionWarning } from '../components/WalletConnectionWarning'

export default function ProfilePage() {
    
  const { isConnected } = useAccount()

    // If wallet IS connected, show the profile dashboard
    if (isConnected) {
        return (
          <div className="relative min-h-screen">
            <main className="flex-grow pt-20">
                <ProfileDashboard />
            </main>
          </div>
        )
    }

  return (

    <div className="relative min-h-screen">
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
          
        <main className="flex-grow pt-20">
            <WalletConnectionWarning/>
        </main>
        
      </div>
    </div>

  )
}