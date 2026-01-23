"use client"

import React from 'react'
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { CampaignList } from './components/CampaignList'
import { CreateCampaign } from './components/CreateCampaign'
import Link from 'next/link'
import { useAccount } from 'wagmi'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Header />
      
      <main className='flex-grow container mx-auto px-4 py-8'>
        {/* Hero Section */}
        <div className='bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-12 mb-8 text-white'>
          <h1 className='text-4xl md:text-5xl font-bold mb-4'>
            Transparent Medical Donations
          </h1>
          <p className='text-xl mb-6 opacity-90'>
            Support verified medical campaigns with blockchain transparency and DAO governance
          </p>
          {!isConnected && (
            <p className='text-lg bg-white/20 inline-block px-6 py-2 rounded-full'>
              Connect your wallet to get started
            </p>
          )}
        </div>

        {/* Features */}
        <div className='grid md:grid-cols-3 gap-6 mb-12'>
          <div className='bg-white p-6 rounded-xl shadow-md'>
            <div className='text-4xl mb-3'>🏥</div>
            <h3 className='text-xl font-bold mb-2'>Medical Verification</h3>
            <p className='text-gray-600'>
              Hospital representatives verify all campaigns for legitimacy
            </p>
          </div>
          <div className='bg-white p-6 rounded-xl shadow-md'>
            <div className='text-4xl mb-3'>🗳️</div>
            <h3 className='text-xl font-bold mb-2'>DAO Governance</h3>
            <p className='text-gray-600'>
              Community votes on milestone claim approvals
            </p>
          </div>
          <div className='bg-white p-6 rounded-xl shadow-md'>
            <div className='text-4xl mb-3'>🔒</div>
            <h3 className='text-xl font-bold mb-2'>Secure Escrow</h3>
            <p className='text-gray-600'>
              Funds locked in smart contracts until DAO approval
            </p>
          </div>
        </div>

        {/* Create Campaign Section */}
        {isConnected && (
          <div className='mb-12'>
            <CreateCampaign />
          </div>
        )}

        {/* Campaign List */}
        <CampaignList />
      </main>

      <Footer />
    </div>
  )
}