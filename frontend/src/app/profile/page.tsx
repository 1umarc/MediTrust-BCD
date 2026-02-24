'use client'

import React from 'react'
import { useAccount } from 'wagmi'
import { ProfileDashboard } from './components/ProfileDashboard'
import { WalletConnectionWarning } from './components/WalletConnectionWarning'

export default function ProfilePage() {
    
  const { isConnected } = useAccount()

    {/* TODO: remember to change back this , if wallet is connected then only show profile dashboard else wallet connection warning*/}
    // If wallet IS connected, show the profile dashboard
    if (!isConnected) {
        return <ProfileDashboard />
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