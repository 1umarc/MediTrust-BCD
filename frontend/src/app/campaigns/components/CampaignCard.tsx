'use client'
import { useReadContract } from 'wagmi'
import { Address, formatEther } from 'viem'
import Link from 'next/link'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'

interface CampaignCardProps {
    campaignId: number
}

export function CampaignCard({ campaignId }: CampaignCardProps) {
    const { data: campaign } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaign',
        args: [campaignId]
    })

    if (!campaign) return null

    const [patient, targetAmount, raisedAmount, expiry, ipfsHash, status] = campaign as any[]
    const statusLabels = ['Pending', 'Approved', 'Rejected', 'Completed']
    const progress = (Number(raisedAmount) / Number(targetAmount)) * 100

    const statusColors = {
        0: 'bg-amber-500/20 border-amber-500/30 text-amber-300', // Pending
        1: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300', // Approved
        2: 'bg-red-500/20 border-red-500/30 text-red-300', // Rejected
        3: 'bg-blue-500/20 border-blue-500/30 text-blue-300' // Completed
    }

// Frontend Code

    return (
        <div className="group relative">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            
            {/* Card */}
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Campaign #{campaignId}</h3>
                        <p className="text-sm text-slate-400 font-mono">{patient.slice(0, 6)}...{patient.slice(-4)}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusColors[status as keyof typeof statusColors]}`}>
                        {statusLabels[status]}
                    </span>
                </div>
                
                {/* Progress */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400 font-semibold">Progress</span>
                        <span className="text-cyan-400 font-bold">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        >
                            <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1 font-semibold">Target</div>
                        <div className="text-lg font-bold text-white">{formatEther(targetAmount)} HETH</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1 font-semibold">Raised</div>
                        <div className="text-lg font-bold text-cyan-400">{formatEther(raisedAmount)} HETH</div>
                    </div>
                </div>

                {/* View Details Button */}
                <Link 
                    href={`/campaigns/${campaignId}`}
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
                >
                    View Details →
                </Link>
            </div>
        </div>
    )
}