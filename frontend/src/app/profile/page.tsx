'use client'

import React from 'react'
import { WalletConnectionWarning } from './components/WalletConnectionWarning'

export default function ProfilePage() {
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