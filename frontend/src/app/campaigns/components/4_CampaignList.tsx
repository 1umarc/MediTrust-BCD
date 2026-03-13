'use client'
import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'
import { CampaignCard } from './CampaignCard'
import { EmptyState } from '@/app/images'

// Create allowed filter values
type FilterType = 'all' | 'active' | 'completed'

export function CampaignList() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all')

    // Get all campaign IDs
    const { data: allCampaignIDsData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getAllCampaignIDs'
    })

    // Get active campaign IDs (Approved)
    const { data: activeIDsData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignIDs',
        args: [1]   // 1 = CampaignStatus.Approved (Active)
    })

    // Get completed campaign IDs
    const { data: completedIDsData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignIDs',
        args: [3]   // 3 = CampaignStatus.Completed
    })

    // Convert to Javascript Arrays
    const allCampaignIDs = allCampaignIDsData 
        ? (allCampaignIDsData as bigint[]).map(id => Number(id))
        : []
    
    const activeIDs = activeIDsData
        ? (activeIDsData as bigint[]).map(id => Number(id))
        : []
    
    const completedIDs = completedIDsData
        ? (completedIDsData as bigint[]).map(id => Number(id))
        : []

    // Calculate Counts for Filters Cal
    const campaignCounts = {
        all: allCampaignIDs.length,
        active: activeIDs.length,
        completed: completedIDs.length
    }

    // Filter based on Active Filter
    const filteredCampaignIDs =
        activeFilter === 'active' ? activeIDs :
        activeFilter === 'completed' ? completedIDs :
        allCampaignIDs

    // Filter Buttons
    const filters: { id: FilterType; label: string; icon: string }[] = 
    [
        { 
            id: 'active', 
            label: 'Active', 
            icon: '✅' 
        },

        { 
            id: 'completed', 
            label: 'Completed', 
            icon: '🎉' 
        },

        { 
            id: 'all', 
            label: 'All Campaigns', 
            icon: '📋' 
        }
    ]

    return (
        <div className="space-y-8">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-8">
                <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                <h2 className="text-2xl font-bold text-white">Browse Campaigns</h2>
            </div>

            {/* Campaign Filters - Active, Completed, All Campaigns */}
            <div className="flex flex-wrap gap-3">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`group relative px-6 py-3 rounded-xl font-bold transition-all ${
                            activeFilter === filter.id
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                                : 'bg-slate-900/50 border border-slate-700 text-slate-300 hover:border-cyan-500/50'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-lg">{filter.icon}</span>
                            {filter.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                                activeFilter === filter.id
                                    ? 'bg-white/20'
                                    : 'bg-slate-800'
                            }`}>
                                {campaignCounts[filter.id]}
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Campaign Grid */}
            {filteredCampaignIDs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaignIDs.map((campaignID) => (
                        <CampaignCard key={campaignID} campaignID={campaignID} />
                    ))}
                </div>
            ) : (
                /* Empty State - No Campaigns Found */
                <div className="text-center py-20">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <img src={EmptyState.src} alt="No Campaigns" className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Campaigns Found</h3>
                    <p className="text-slate-400">
                        {activeFilter === 'all' 
                            ? 'No campaigns have been created yet'
                            : `No ${activeFilter} campaigns at the moment`
                        }
                    </p>
                </div>
            )}
        </div>
    )
}