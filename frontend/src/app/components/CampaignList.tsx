'use client'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { CAMPAIGN_CONTRACT } from '@/utils/smartContractAddress'
import { CampaignCard } from './CampaignCard'

export function CampaignList() {
    const { data: campaignCount } = useReadContract({
        address: CAMPAIGN_CONTRACT as Address,
        abi: campaignAbi.abi,
        functionName: 'campaignCount'
    })

    const count = campaignCount ? Number(campaignCount) : 0

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Active Campaigns</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: count }, (_, i) => (
                    <CampaignCard key={i} campaignId={i} />
                ))}
            </div>
        </div>
    )
}