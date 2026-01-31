'use client'
import React from 'react'
import { useAccount } from 'wagmi'
import { SafeSecurity, Transparency, VerifyApprove } from '../../images'
import { ProfileDashboard } from './ProfileDashboard'

export function WalletConnectionWarning() {
    const { isConnected } = useAccount()

    // If wallet IS connected, show the profile dashboard
    if (!isConnected) {
        return <ProfileDashboard />
    }

    // If wallet is NOT connected, show the prompt 
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <img src={SafeSecurity.src} alt="Safe Security" className="w-6 h-6" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Connect Your Wallet
                    </h2>

                    {/* Message */}
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Connect your wallet to create your campaign and start receiving donations through blockchain technology
                    </p>

                    <div className="flex justify-center">
                        {/* Connect Button */}
                        <appkit-button 
                            label="Connect Wallet" 
                            balance="show" 
                            size="md"
                        />
                    </div>
                    
                    {/* Info Badge */}
                    <div className="mt-8 pt-6 border-t border-slate-700">
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>Secure and encrypted connection</span>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <img src={VerifyApprove.src} alt="Secure" className="w-6 h-6" />
                        </div>
                        <p className="text-xs text-slate-500">Secure</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <img src={SafeSecurity.src} alt="Safe Security" className="w-6 h-6" />
                        </div>
                        <p className="text-xs text-slate-500">Fast</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <img src={Transparency.src} alt="Transparent" className="w-6 h-6" />
                        </div>
                        <p className="text-xs text-slate-500">Transparent</p>
                    </div>
                </div>
            </div>
        </div>
    )
}