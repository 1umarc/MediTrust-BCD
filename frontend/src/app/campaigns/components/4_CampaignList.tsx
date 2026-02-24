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

    // Get total campaign count (from smart contract)
    const { data: campaignCount } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'campaignCount'
    })

    const count = campaignCount ? Number(campaignCount) : 0

    // Create Campaign ID List
    const allCampaignIds = Array.from({ length: count }, (_, i) => i)
    
    // Get campaign statuses for filtering
    const campaignStatuses = allCampaignIds.map(id => {
        const { data: campaign } = useReadContract({
            address: campaignContractAddress as Address,
            abi: campaignAbi.abi,
            functionName: 'getCampaign',
            args: [id]
        })
        return campaign ? (campaign as any)[5] : null // status is at index 5
    })

    // Filter campaigns based on active filter
    const filteredCampaignIds = allCampaignIds.filter((id, index) => {
        const status = campaignStatuses[index]
        if (status === null) return false
        
        switch (activeFilter) {
            case 'pending':
                return status === 0
            case 'approved':
                return status === 1
            case 'completed':
                return status === 3
            default:
                return true
        }
    })

    // Calculate counts for each filter
    const campaignCounts = {
        all: allCampaignIds.length,
        pending: campaignStatuses.filter(s => s === 0).length,
        approved: campaignStatuses.filter(s => s === 1).length,
        completed: campaignStatuses.filter(s => s === 3).length
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
                    {filteredCampaignIds.map((campaignId) => (
                        <CampaignCard key={campaignId} campaignId={campaignId} />
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