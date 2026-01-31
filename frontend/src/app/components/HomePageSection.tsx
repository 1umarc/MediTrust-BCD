'use client'

import React from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { CommunityDonate, DaoGovernance, DirectImpact, Documentation, Email, GroupUsers, HospitalVerifies, KeyUnlock, SafeSecurity, SubmitCampaign, Transparency, VerifyApprove } from '../images'

export function HomePageSection() {
  const { isConnected } = useAccount()

  return (
    <div className='space-y-24 py-12'>
      {/* Hero Section */}
      <section className='relative overflow-hidden'>
        {/* Background Effects */}
        <div className='absolute inset-0 pointer-events-none'>
          <div className='absolute top-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl' />
          <div className='absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl' />
        </div>

        <div className='relative container mx-auto px-4'>
          <div className='max-w-4xl mx-auto text-center space-y-8'>
            {/* Badge */}
            <div className='inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full backdrop-blur-sm'>
              <div className='w-2 h-2 bg-cyan-400 rounded-full animate-pulse' />
              <span className='text-cyan-300 text-sm font-semibold tracking-wide'>Blockchain-Powered Medical Donations</span>
            </div>

            {/* Main Heading */}
            <h1 className='text-5xl md:text-7xl font-bold leading-tight'>
              <span className='text-white'>Transform Lives with</span>
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

              <div className='inline-flex items-center gap-3 px-8 py-4 bg-slate-800/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl shadow-lg hover:bg-slate-700/80 hover:border-cyan-500/50 hover:scale-105'>
                <img src={SafeSecurity.src} alt="Safe Security" className="w-6 h-6" />
                <span className='text-white font-semibold'>Connect wallet to begin your journey</span>
              </div>

            {/* Trust Indicators */}
            <div className='flex flex-wrap justify-center gap-8 pt-8 text-sm text-slate-400'>
              <div className='flex items-center gap-2'>
                <img src={Email.src} alt="Email Icon" className="w-6 h-6" />
                <span>100% Transparent</span>
              </div>
              <div className='flex items-center gap-2'>
                <img src={KeyUnlock.src} alt="Key Unlock Icon" className="w-6 h-6" />
                <span>Blockchain Secured</span>
              </div>
              <div className='flex items-center gap-2'>
                <img src={GroupUsers.src} alt="Group Users Icon" className="w-6 h-6" />
                <span>DAO Governed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className='container mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
            How <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500'>MediTrust</span> Works
          </h2>
          <p className='text-xl text-slate-400 max-w-2xl mx-auto'>
            A simple, transparent process that ensures every donation reaches those in need
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {/* Step 1 */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all' />
            <div className='relative p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl hover:border-cyan-500/50 transition-all'>
              <div className='flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl mb-6 mx-auto'>
                <img src={SubmitCampaign.src} alt="Submit Campaign" className="w-6 h-6" />
              </div>
              <div className='text-center'>
                <h3 className='text-2xl font-bold text-white mb-3'>Submit Campaign</h3>
                <p className='text-slate-400 leading-relaxed'>
                  Patients submit medical campaigns with required documentation for verification
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all' />
            <div className='relative p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl hover:border-emerald-500/50 transition-all'>
              <div className='flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-6 mx-auto'>
                <img src={HospitalVerifies.src} alt="Hospital Verifies" className="w-6 h-6" />
              </div>
              <div className='text-center'>
                <h3 className='text-2xl font-bold text-white mb-3'>Hospital Verifies</h3>
                <p className='text-slate-400 leading-relaxed'>
                  Medical representatives verify authenticity and approve legitimate campaigns
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all' />
            <div className='relative p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl hover:border-purple-500/50 transition-all'>
              <div className='flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mb-6 mx-auto'>
                <img src={CommunityDonate.src} alt="Community Donate" className="w-6 h-6" />
              </div>
              <div className='text-center'>
                <h3 className='text-2xl font-bold text-white mb-3'>Community Donates</h3>
                <p className='text-slate-400 leading-relaxed'>
                  Supporters contribute securely with funds held in smart contract escrow
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Step - DAO Governance */}
        <div className='mt-12 max-w-3xl mx-auto'>
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-yellow-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all' />
            <div className='relative p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl hover:border-amber-500/50 transition-all'>
              <div className='flex items-center gap-6'>
                <div className='flex-shrink-0 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl'>
                  <img src={VerifyApprove.src} alt="DAO Approves Fund Release" className="w-6 h-6" />
                </div>
                <div className='flex-grow'>
                  <h3 className='text-2xl font-bold text-white mb-2'>DAO Approves Fund Release</h3>
                  <p className='text-slate-400 leading-relaxed'>
                    Milestone claims are reviewed and voted on by the community before funds are released to ensure proper usage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className='container mx-auto px-4'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
            Built on <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500'>Trust</span>
          </h2>
          <p className='text-xl text-slate-400 max-w-2xl mx-auto'>
            Advanced features that make medical fundraising transparent and accountable
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Feature 1 */}
          <div className='p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-cyan-500/30 transition-all'>
            <div className='w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4'>
                <img src={SafeSecurity.src} alt="Smart Contract Escrow" className="w-6 h-6" />
            </div>
            <h3 className='text-lg font-bold text-white mb-2'>Smart Contract Escrow</h3>
            <p className='text-slate-400 text-sm'>Donations secured in blockchain until milestones are achieved</p>
          </div>

          {/* Feature 2 */}
          <div className='p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-emerald-500/30 transition-all'>
            <div className='w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4'>
                <img src={VerifyApprove.src} alt="Medical Verification" className="w-6 h-6" />
            </div>
            <h3 className='text-lg font-bold text-white mb-2'>Medical Verification</h3>
            <p className='text-slate-400 text-sm'>Hospital representatives verify all campaigns before approval</p>
          </div>

          {/* Feature 3 */}
          <div className='p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-purple-500/30 transition-all'>
            <div className='w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4'>
                <img src={DaoGovernance.src} alt="DAO Governance" className="w-6 h-6" />
            </div>
            <h3 className='text-lg font-bold text-white mb-2'>DAO Governance</h3>
            <p className='text-slate-400 text-sm'>Community voting on milestone claim approvals</p>
          </div>

          {/* Feature 4 */}
          <div className='p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-blue-500/30 transition-all'>
            <div className='w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4'>
                <img src={Transparency.src} alt="Full Transparency" className="w-6 h-6" />
            </div>
            <h3 className='text-lg font-bold text-white mb-2'>Full Transparency</h3>
            <p className='text-slate-400 text-sm'>Track every donation and fund usage on the blockchain</p>
          </div>

          {/* Feature 5 */}
          <div className='p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-orange-500/30 transition-all'>
            <div className='w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4'>
                <img src={Documentation.src} alt="IPFS Documentation" className="w-6 h-6" />
            </div>
            <h3 className='text-lg font-bold text-white mb-2'>IPFS Documentation</h3>
            <p className='text-slate-400 text-sm'>Medical documents stored securely on decentralized storage</p>
          </div>

          {/* Feature 6 */}
          <div className='p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-pink-500/30 transition-all'>
            <div className='w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4'>
                <img src={DirectImpact.src} alt="Direct Impact" className="w-6 h-6" />
            </div>
            <h3 className='text-lg font-bold text-white mb-2'>Direct Impact</h3>
            <p className='text-slate-400 text-sm'>Funds go directly to verified medical treatments and care</p>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className='container mx-auto px-4'>
        <div className='relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5' />
          <div className='relative p-12 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
              <div>
                <div className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2'>
                  100%
                </div>
                <div className='text-slate-400 font-medium'>Transparent</div>
              </div>
              <div>
                <div className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-2'>
                  24/7
                </div>
                <div className='text-slate-400 font-medium'>Available</div>
              </div>
              <div>
                <div className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2'>
                  Secure
                </div>
                <div className='text-slate-400 font-medium'>Blockchain</div>
              </div>
              <div>
                <div className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 mb-2'>
                  Global
                </div>
                <div className='text-slate-400 font-medium'>Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}