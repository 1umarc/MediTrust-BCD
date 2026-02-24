'use client'

import React from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { CommunityDonate, DaoGovernance, DirectImpact, Documentation, Email, GroupUsers, HospitalVerifies, KeyUnlock, SafeSecurity, SubmitCampaign, Transparency, VerifyApprove } from '../images'
import { step } from 'viem/chains'
import { Stats } from 'fs'
import { getAbiItem } from 'viem'

export function HomePageSection() {
  
  {/* Check if the user is connected */}
  const { isConnected } = useAccount() 

  const HowMediTrustWorksComponents = 
  [
    {
      title: "Submit Campaign",
      description: "Patients submit medical campaigns with required documentation for verification",
      icon: SubmitCampaign,
      gradient: "from-cyan-500 to-blue-600",
      glow: "from-cyan-500/20 to-blue-500/20",
      borderHover: "hover:border-cyan-500/50"
    },
    {
      title: "Hospital Verifies",
      description: "Medical representatives verify authenticity and approve legitimate campaigns",
      icon: HospitalVerifies,
      gradient: "from-emerald-500 to-teal-600",
      glow: "from-emerald-500/20 to-teal-500/20",
      borderHover: "hover:border-emerald-500/50"
    },
    {
      title: "Community Donates",
      description: "Supporters contribute securely with funds held in smart contract escrow",
      icon: CommunityDonate,
      gradient: "from-purple-500 to-pink-600",
      glow: "from-purple-500/20 to-pink-500/20",
      borderHover: "hover:border-purple-500/50"
    },
    {
      title: "DAO Approves Fund Release",
      description: "Milestone claims are reviewed and voted on by the community before funds are released to ensure proper usage",
      icon: VerifyApprove,
      gradient: "from-orange-500 to-amber-600",
      glow: "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
      borderHover: "hover:border-amber-500/50"
    }
  ];

  const BuildOnTrustComponents = [
    {
      title: "Smart Contract Escrow",
      description: "Donations secured in blockchain until milestones are achieved",
      icon: SafeSecurity,
      background: "bg-cyan-500/10",
      borderHover: "hover:border-cyan-500/30"
    },
    {
      title: "Medical Verification",
      description: "Hospital representatives verify all campaigns before approval",
      icon: VerifyApprove,
      background: "bg-emerald-500/10",
      borderHover: "hover:border-emerald-500/30"
    },
    {
      title: "DAO Governance",
      description: "Community voting on milestone claim approvals",
      icon: DaoGovernance,
      background: "bg-purple-500/10",
      borderHover: "hover:border-purple-500/30"
    },
    {
      title: "Full Transparency",
      description: "Track every donation and fund usage on the blockchainl",
      icon: Transparency,
      background: "bg-blue-500/10",
      borderHover: "hover:border-blue-500/30"
    },
    {
      title: "IPFS Documentation",
      description: "Medical documents stored securely on decentralized storage",
      icon: Documentation,
      background: "bg-orange-500/10",
      borderHover: "hover:border-orange-500/30"
    },
    {
      title: "Direct Impact",
      description: "Funds go directly to verified medical treatments and care",
      icon: DirectImpact,
      background: "bg-pink-500/10",
      borderHover: "hover:border-pink-500/30"
    }
  ];

  const stat = 
  [
    {
      title:"100%",
      description: "Transparent",
      gradient: "from-cyan-400 to-blue-500"
    },
    {
      title:"24/7",
      description: "Available",
      gradient: "from-emerald-400 to-teal-500"
    },
    {
      title:"Secure",
      description: "Blockchain",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      title:"Global",
      description: "Access",
      gradient: "from-orange-400 to-amber-500"
    }
  ];

  return (
    <div className='space-y-24 py-12'> 
    {/* 
    space-y : adds vertical space between children inside the container
    py : padding on top and bottom */}

      {/* First Section */}
      <section className='relative overflow-hidden'> 
        {/* 
        relative : position that allows child elements to use 'absolute positioning' relative to this container
        overflow-hidden : anything outside the box gets hidden*/}
        
        {/* Background Effects */}
        <div className='absolute inset-0 pointer-events-none'> {/* pointer-events-none : mouse cannot interact with it */}
          <div className='absolute top-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl' />
          <div className='absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl' />
        </div>

        <div className='relative container mx-auto px-4'> {/* mx-auto : center the element horizontally */}
          <div className='max-w-4xl mx-auto text-center space-y-8'>

            {/* Main Heading */}
            <h1 className='text-5xl md:text-7xl font-bold leading-tight'>  {/* leading tight : add space between lines of text */}
              <span className='text-white'>
                Transform Lives with
              </span>
              <br />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500'>
                Transparent Healthcare
              </span>
            </h1>

            {/* Description */}
            <p className='text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed'>
              Support verified medical campaigns through blockchain technology. 
              Every donation is transparent, secure, and governed by community consensus.
            </p>

            {/* Connect Wallet Design */}
            <div className='inline-flex items-center gap-3 px-8 py-4 bg-slate-800/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl shadow-lg hover:bg-slate-700/80 hover:border-cyan-500/50 hover:scale-105'>
              {/* inline-flex : takes up as much width as its content needs */}
              <img src={SafeSecurity.src} alt="Safe Security" className="w-6 h-6" />
              <span className='text-white font-semibold'>
                Connect wallet to begin your journey
              </span>
            </div>

            {/* Trust Indicators */}
            <div className='flex flex-wrap justify-center gap-8 pt-8 text-sm text-slate-400'>
              <div className='flex items-center gap-2'>
                <img src={Email.src} alt="Email Icon" className="w-6 h-6" />
                <span>
                  100% Transparent
                </span>
              </div>

              <div className='flex items-center gap-2'>
                <img src={KeyUnlock.src} alt="Key Unlock Icon" className="w-6 h-6" />
                <span>
                  Blockchain Secured
                </span>
              </div>

              <div className='flex items-center gap-2'>
                <img src={GroupUsers.src} alt="Group Users Icon" className="w-6 h-6" />
                <span>
                  DAO Governed
                </span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Second Section - How MediTrust Works */}
      <section className='container mx-auto px-4'>
        {/* Title & Description */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
            How <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500'>MediTrust</span> Works
          </h2>
          <p className='text-xl text-slate-400 max-w-2xl mx-auto'>
            A simple, transparent process that ensures every donation reaches those in need
          </p>
        </div>

        {/* Create a grid container with 4 columns */}
        <div className='grid md:grid-cols-4 gap-8'> 
          {HowMediTrustWorksComponents.map((step, index) => (
            <div key ={index} className='relative group h-full'>
              <div className={`absolute inset-0 bg-gradient-to-br ${step.glow} rounded-2xl blur-xl group-hover:blur-2xl transition-all`} /> 
              <div className={`relative h-full flex flex-col p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl ${step.borderHover} transition-all`}>
                <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-xl mb-6 mx-auto`}>
                  <img src={step.icon.src} alt={step.title} className="w-6 h-6" />
                </div>
                <div className='text-center'>
                  <h3 className='text-2xl font-bold text-white mb-3'>{step.title}</h3>
                  <p className='text-slate-400 leading-relaxed'>{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div> 
      </section>

      {/* Third Section - Build on Trust*/}
      <section className='container mx-auto px-4'>
        {/* Title & Description */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
            Built on <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500'>Trust</span>
          </h2>
          <p className='text-xl text-slate-400 max-w-2xl mx-auto'>
            Advanced features that make medical fundraising transparent and accountable
          </p>
        </div>

        {/* Create a grid container with 6 columns with different size (to match the screen size) */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {BuildOnTrustComponents.map((feature, index) => (
          <div key ={index} className={`p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl ${feature.borderHover} hover:border-cyan-500/30 transition-all`}>
            <div className={`w-12 h-12 ${feature.background} rounded-lg flex items-center justify-center mb-4`}>
                <img src={feature.icon.src} alt="Smart Contract Escrow" className="w-6 h-6" />
            </div>
            <h3 className='text-lg font-bold text-white mb-2'>{feature.title}</h3>
            <p className='text-slate-400 text-sm'>{feature.description}</p>
          </div>
          ))}
        </div>
      </section>

      {/* Statistics Banner */}
      <section className='container mx-auto px-4 py-16'>
        <div className='relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5' />
          <div className='relative p-12 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
              {stat.map((item, index) => (
                <div key={index}>
                  <div className={`text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${item.gradient} mb-2`}> 
                    {item.title}
                  </div>
                  <div className='text-slate-400 font-medium'>{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}