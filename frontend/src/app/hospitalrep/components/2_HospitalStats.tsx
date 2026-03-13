'use client'
import { useReadContract } from 'wagmi' // Import hook to read data from smart contracts
import { Address } from 'viem' // Import Ethereum address type
import campaignAbi from '@/abi/MediTrustCampaign.json' // Import campaign smart contract ABI
import { campaignContractAddress } from '@/utils/smartContractAddress' // Import deployed campaign contract address
import { Pending, Approve, Reject} from '@/app/images' // Import icons used in the statistics cards

export function HospitalStats() {
    // Get number of campaigns waiting for hospital review
    const { data: pendingCampaigns } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignCount',
        args: [0] // Pending
    })

    // Get number of campaigns approved by hospital representatives
    const { data: approvedCampaigns } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignCount',
        args: [1] // Approved
    })

    // Get number of campaigns rejected by hospital representatives
    const { data: rejectedCampaigns } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignCount',
        args: [2] // Rejected
    })

    // Configuration for Hospital Dashboard Stat Cards
    // Each object define the label, value, style and icon for each card (Pending, Approved and Rejected)
    const stats = [
        {
            label: 'Pending Review',
            value: pendingCampaigns ? Number(pendingCampaigns) : 0,
            icon: ( <img src={Pending.src} alt="Pending Icon" className="w-6 h-6" />),
            gradient: 'from-amber-400 to-orange-500',
            bgGradient: 'from-amber-500/10 to-orange-500/10',
            borderColor: 'border-amber-500/20'
        },
        {
            label: 'Approved',
            value: approvedCampaigns ? Number(approvedCampaigns) : 0,
            icon: ( <img src={Approve.src} alt="Approved Icon" className="w-6 h-6" />),
            gradient: 'from-emerald-400 to-teal-500',
            bgGradient: 'from-emerald-500/10 to-teal-500/10',
            borderColor: 'border-emerald-500/20'
        },
        {
            label: 'Rejected',
            value: rejectedCampaigns ? Number(rejectedCampaigns) : 0,
            icon: (< img src={Reject.src} alt="Rejected Icon" className="w-6 h-6" />),
            gradient: 'from-red-400 to-pink-500',
            bgGradient: 'from-red-500/10 to-pink-500/10',
            borderColor: 'border-red-500/20'
        }
    ]

    // Display hospital campaign statistics cards on dashboard
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Generate a card for each campaign statistic */}
            {stats.map((stat, index) => (
                <div key={index} className="group relative">
                    {/* Decorative Glow Effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>
                    
                     {/* Statistics Card */}
                    <div className={`relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl border ${stat.borderColor} rounded-2xl p-6`}>
                        <div className="flex items-start justify-between mb-4">
                            {/* Statistic Label */}
                            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.label}</div>
                            {/* Statistic Icon */}
                            <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                {stat.icon}
                            </div>
                        </div>
                        
                        {/* Statistic Value */}
                        <div className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
                            {stat.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}