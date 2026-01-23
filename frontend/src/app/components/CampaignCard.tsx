'use client'
import { useReadContract } from 'wagmi'
import { Address, formatEther } from 'viem'
import Link from 'next/link'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { CAMPAIGN_CONTRACT } from '@/utils/smartContractAddress'

interface CampaignCardProps {
    campaignId: number
}

export function CampaignCard({ campaignId }: CampaignCardProps) {
    const { data: campaign } = useReadContract({
        address: CAMPAIGN_CONTRACT as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaign',
        args: [campaignId]
    })

    if (!campaign) return null

    const [patient, targetAmount, raisedAmount, expiry, ipfsHash, status] = campaign as any[]
    const statusLabels = ['Pending', 'Approved', 'Rejected', 'Completed']
    const progress = (Number(raisedAmount) / Number(targetAmount)) * 100

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Campaign #{campaignId}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                    status === 1 ? 'bg-green-100 text-green-800' :
                    status === 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {statusLabels[status]}
                </span>
            </div>
            
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>Target: {formatEther(targetAmount)} ETH</p>
                <p>Raised: {formatEther(raisedAmount)} ETH</p>
            </div>

            <Link 
                href={`/campaigns/${campaignId}`}
                className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
                View Details
            </Link>
        </div>
    )
}