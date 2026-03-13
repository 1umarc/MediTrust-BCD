'use client'
import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'
import { CampaignReviewCard } from './CampaignReviewCard'
import { EmptyState } from '@/app/images'

// Create allowed filter values
type FilterType = 'pending' | 'approved' | 'rejected' | 'all'

export function CampaignReviewList() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('pending')

    // Fetch campaign count
    const { data: campaignCount } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'campaignCount'
    })
    const campaignID = Number(campaignCount)

    // FETCH CAMPAIGN IDS FROM SMART CONTRACT
    const { data: pendingCampaignIDs } = useReadContract({
    address: campaignContractAddress as Address,
    abi: campaignAbi.abi,
    functionName: 'getCampaignIDs',
    args: [0] // Pending
    })

    const { data: approvedCampaignIDs } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignIDs',
        args: [1] // Approved
    })

    const { data: rejectedCampaignIDs } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignIDs',
        args: [2] // Rejected
    })

    const { data: allCampaignIDs } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getAllCampaignIDs'
    })

    // CONVERT TO JAVASCRIPT ARRAYS
    const pendingIDs = pendingCampaignIDs
        ? (pendingCampaignIDs as bigint[]).map(id => Number(id))
        : []

    const approvedIDs = approvedCampaignIDs
        ? (approvedCampaignIDs as bigint[]).map(id => Number(id))
        : []

    const rejectedIDs = rejectedCampaignIDs
        ? (rejectedCampaignIDs as bigint[]).map(id => Number(id))
        : []

    const allIDs = allCampaignIDs
        ? (allCampaignIDs as bigint[]).map(id => Number(id))
        : []

    // CALCULATE COUNTS FOR FILTERS
    const campaignCounts = {
        pending: pendingIDs.length,
        approved: approvedIDs.length,
        rejected: rejectedIDs.length,
        all: allIDs.length
    }

    // FILTER BASED ON ACTIVE FILTER
    const filteredCampaignIds =
        activeFilter === 'pending' ? pendingIDs :
        activeFilter === 'approved' ? approvedIDs :
        activeFilter === 'rejected' ? rejectedIDs :
        allIDs


    const filters: { id: FilterType; label: string; icon: string }[] = 
    [
        {   
            id: 'pending', 
            label: 'Pending Review', 
            icon: '⏳' 
        },

        { 
            id: 'approved', 
            label: 'Approved', 
            icon: '✅' 
        },

        {   id: 'rejected', 
            label: 'Rejected', 
            icon: '❌' 
        },

        { 
            id: 'all', 
            label: 'All Campaigns', 
            icon: '📋' 
        }
    ]

    return (
        
        <div className="space-y-8">
            {/* Campaign Reviews Filters - Pending, Approved, Rejected, All Campaigns */}
            <div className="flex items-center gap-3 mb-8">
            <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
            <h2 className="text-2xl font-bold text-white">Campaign Reviews</h2>
            </div>
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
            {filteredCampaignIds.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaignIds.map((campaignID) => (
                        <CampaignReviewCard
                            key={campaignID}
                            campaignID={campaignID}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="text-center py-20">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <img src={EmptyState.src} alt="No Campaigns" className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Campaigns Found</h3>
                    <p className="text-slate-400">
                        {activeFilter === 'all' 
                            ? 'No campaigns have been submitted yet'
                            : `No ${activeFilter} campaigns at the moment`
                        }
                    </p>
                </div>
            )}
        </div>
    )
}
