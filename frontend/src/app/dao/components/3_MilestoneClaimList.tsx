'use client'
import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'
import { MilestoneClaimCard } from './MilestoneClaimCard'
import { EmptyState } from '@/app/images'

// Create allowed filter values
type FilterType = 'all' | 'pending' | 'approved'

export function MilestoneClaimList() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('pending')

    // Fetch all milestone claims
    const { data: milestoneCount } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getTotalMilestoneCount'
    })

    const count = milestoneCount ? Number(milestoneCount) : 0

    // For now, mock data structure - replace with actual contract calls
    const milestoneClaims = Array.from({ length: count }, (_, i) => ({
        campaignId: Math.floor(i / 3), // Example: 3 milestones per campaign
        milestoneId: i % 3,
        isApproved: i % 5 === 0 // Mock: every 5th is approved
    }))

    const filteredClaims = milestoneClaims.filter(claim => {
        if (activeFilter === 'pending') return !claim.isApproved
        if (activeFilter === 'approved') return claim.isApproved
        return true
    })

    // Create 3 filter button (each button also shows a count)
    const filters = 
    [
        { 
            id : 'pending' as FilterType, 
            label : 'Pending Votes', 
            icon : '⏳',
            count : milestoneClaims.filter(c => !c.isApproved).length 
        },

        { 
            id : 'approved' as FilterType, 
            label : 'Approved', 
            icon : '✅', 
            count : milestoneClaims.filter(c => c.isApproved).length 
        },
        
        { 
            id : 'all' as FilterType, 
            label : 'All Claims', 
            icon: '📋', 
            count: milestoneClaims.length 
        }
    ]

    return (
        <div className="space-y-8">
            {/* Filters - Effects */}
            <div className="flex flex-wrap gap-3">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`group relative px-6 py-3 rounded-xl font-bold transition-all ${
                            activeFilter === filter.id // if activeFilter is the same as the filter.id (the button is clicked) -> purple
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-slate-900/50 border border-slate-700 text-slate-300 hover:border-purple-500/50'
                        }`}
                    >

                    {/* Milestone Claims - Pending Votes, Approved, All Claims (Icon, Label and Count) */}
                        <span className="flex items-center gap-2">
                            <span className="text-lg">{filter.icon}
                                </span>
                                {filter.label}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${ activeFilter === filter.id }`}>
                                {filter.count}
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {/* TODO: This is when the contract is connected & have a milestone claims then display the UI */}
            {/* Claims Grid */}
            {filteredClaims.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClaims.map((claim, index) => (
                        <MilestoneClaimCard
                            key={index}
                            campaignId={claim.campaignId}
                            milestoneId={claim.milestoneId}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State - No Milestone Claims */
                <div className="text-center py-20">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <img src={EmptyState.src} alt="Empty State Icon" className="w-10 h-10"/>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">No Milestone Claims</h1>
                    <p className="text-slate-400">
                        {activeFilter === 'all' // if filter is 'all(All Claims)' -> no milestone claims have been submitted yet else -> no {activeFilter} milestone claims at the moment
                            ? 'No milestone claims have been submitted yet'
                            : `No ${activeFilter} milestone claims at the moment`
                        }
                    </p>
                </div>
            )}
        </div>
    )
}