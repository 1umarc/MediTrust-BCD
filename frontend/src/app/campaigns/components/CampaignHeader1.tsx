'use client'
import Link from 'next/link'
import { AddIcon, ProcessIcon } from '@/app/images' 
export function CampaignsHeader() {
    return (
        <div className="mb-12">

            {/* First Section - Page Title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                            Campaigns
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Browse and support medical fundraising campaigns
                    </p>
                </div>

                {/* Create Campaign Button */}
                <Link
                    href="/campaigns/formCreation"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-2xl font-bold hover:from-cyan-400 hover:to-purple-400 transition-all shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
                >
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center transition-transform duration-300">
                        <img src={AddIcon.src} alt="Add Icon" className="w-6 h-6"/>
                    </div>
                    Create Campaign
                </Link>
            </div>

            {/* Infomation Banner - How it works*/}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                        <img src={ProcessIcon.src} alt="Process Icon" className="w-6 h-6"/>
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-white font-bold mb-1">How It Works</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            All campaigns are verified by authorized hospital representatives. Funds are held securely in smart contracts and released upon DAO approval of milestone claims.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}