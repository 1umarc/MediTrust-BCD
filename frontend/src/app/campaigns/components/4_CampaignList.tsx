'use client'
import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'
import { CampaignCard } from './CampaignCard'
import { CampaignFilters, FilterType } from './3_CampaignFilter'
import { EmptyState } from '@/app/images'

export function CampaignList() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all')

    // ========================================
    // FETCH CAMPAIGN IDS FROM SMART CONTRACT
    // ALL HOOKS AT TOP LEVEL - NO LOOPS!
    // ========================================

    // Get all campaign IDs
    const { data: allCampaignIdsData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getAllCampaignIds'
    })

    // Get pending campaign IDs
    const { data: pendingIdsData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getPendingCampaignIds'
    })

    // Get approved campaign IDs
    const { data: approvedIdsData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getApprovedCampaignIds'
    })

    // Get completed campaign IDs
    const { data: completedIdsData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCompletedCampaignIds'
    })

    // ========================================
    // CONVERT TO JAVASCRIPT ARRAYS
    // ========================================

    const allCampaignIds = allCampaignIdsData 
        ? (allCampaignIdsData as bigint[]).map(id => Number(id))
        : []
    
    const pendingIds = pendingIdsData
        ? (pendingIdsData as bigint[]).map(id => Number(id))
        : []
    
    const approvedIds = approvedIdsData
        ? (approvedIdsData as bigint[]).map(id => Number(id))
        : []
    
    const completedIds = completedIdsData
        ? (completedIdsData as bigint[]).map(id => Number(id))
        : []

    // ========================================
    // FILTER BASED ON ACTIVE FILTER
    // ========================================

    const getFilteredCampaigns = () => {
        switch (activeFilter) {
            case 'pending':
                return pendingIds
            case 'approved':
                return approvedIds
            case 'completed':
                return completedIds
            default: // 'all'
                return allCampaignIds
        }
    }

    const filteredCampaignIds = getFilteredCampaigns()

    // ========================================
    // CALCULATE COUNTS FOR FILTERS
    // ========================================

    const campaignCounts = {
        all: allCampaignIds.length,
        pending: pendingIds.length,
        approved: approvedIds.length,
        completed: completedIds.length
    }

    return (
        <div className="space-y-8">
            {/* Filters */}
            <CampaignFilters 
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                campaignCounts={campaignCounts}
            />

            {/* TODO: Show Campaign Cards - replace with actual data */}
            {filteredCampaignIds.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaignIds.map((campaignID) => (
                        <CampaignCard key={campaignID} campaignID={campaignID} />
                    ))}
                </div>
            ) : (
                /* Empty State - No Campaign Found*/
                <div className="text-center py-20">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <img src={EmptyState.src} alt="Empty State Icon" className="w-10 h-10"/>
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