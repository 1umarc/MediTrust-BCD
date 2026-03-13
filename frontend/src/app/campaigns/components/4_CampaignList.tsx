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
    const { data: allCampaignIDsData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getAllCampaignIDs'
    })

    // Get pending campaign IDs
    const { data: pendingIDsData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignIDs', 
        args: [0]   // 0 = CampaignStatus.Pending
    })

    // Get approved campaign IDs
    const { data: approvedIDsData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignIDs',
        args: [1]   // 1 = CampaignStatus.Approved
    })

    // Get completed campaign IDs
    const { data: completedIDsData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignIDs',
        args: [3]   // 3 = CampaignStatus.Completed
    })

    // ========================================
    // CONVERT TO JAVASCRIPT ARRAYS
    // ========================================

    const allCampaignIDs = allCampaignIDsData 
        ? (allCampaignIDsData as bigint[]).map(id => Number(id))
        : []
    
    const pendingIDs = pendingIDsData
        ? (pendingIDsData as bigint[]).map(id => Number(id))
        : []
    
    const approvedIDs = approvedIDsData
        ? (approvedIDsData as bigint[]).map(id => Number(id))
        : []
    
    const completedIDs = completedIDsData
        ? (completedIDsData as bigint[]).map(id => Number(id))
        : []

    // ========================================
    // FILTER BASED ON ACTIVE FILTER
    // ========================================

    const getFilteredCampaigns = () => {
        switch (activeFilter) {
            case 'pending':
                return pendingIDs
            case 'approved':
                return approvedIDs
            case 'completed':
                return completedIDs
            default: // 'all'
                return allCampaignIDs
        }
    }

    const filteredCampaignIDs = getFilteredCampaigns()

    // ========================================
    // CALCULATE COUNTS FOR FILTERS
    // ========================================

    const campaignCounts = {
        all: allCampaignIDs.length,
        pending: pendingIDs.length,
        approved: approvedIDs.length,
        completed: completedIDs.length
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
            {filteredCampaignIDs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaignIDs.map((campaignID) => (
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