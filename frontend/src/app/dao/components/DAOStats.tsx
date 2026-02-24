'use client'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'
import { Pending, Approve, MoneyIcon } from '@/app/images'

export function DAOStats() {
    // Fetch DAO voting statistics
    const { data: pendingClaims } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getPendingMilestoneCount'
    })

    const { data: approvedClaims } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getApprovedMilestoneCount'
    })

    const { data: totalFundsReleased } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getTotalMilestoneFundsReleased'
    })

    // Define data in an array 
    const DAOStats = 
    [
        {
            label: 'Pending Votes',
            value: pendingClaims ? Number(pendingClaims) : 0,
            icon: ( <img src={Pending.src} alt= "Pending Icon" className = "w-6 h-6" />),
            gradient: 'from-amber-400 to-orange-500',
            bgGradient: 'from-amber-500/10 to-orange-500/10',
            borderColor: 'border-amber-500/20'
        },
        {
            label: 'Approved Claims',
            value: approvedClaims ? Number(approvedClaims) : 0,
            icon: ( <img src={Approve.src} alt= "Pending Icon" className = "w-5 h-5" />),
            gradient: 'from-emerald-400 to-teal-500',
            bgGradient: 'from-emerald-500/10 to-teal-500/10',
            borderColor: 'border-emerald-500/20'
        },
        {
            label: 'Total Released',
            value: totalFundsReleased ? `${Number(totalFundsReleased)} HETH` : 'HETH 0',
            icon: ( <img src={MoneyIcon.src} alt= "Money Icon" className = "w-7 h-7" />),
            gradient: 'from-purple-400 to-pink-500',
            bgGradient: 'from-purple-500/10 to-pink-500/10',
            borderColor: 'border-purple-500/20'
        }
    ]

    // DAO Statistics (Pending Votes, Approved Claims & Total Released)
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Loop through the array and generate UI for each statistic */}
            {DAOStats.map((stat, index) => (
                <div key={index} className="group relative">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>
                    
                    <div className={`relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl border ${stat.borderColor} rounded-2xl p-6`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.label}</div>
                            <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                {stat.icon}
                            </div>
                        </div>
                        
                        <div className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
                            {stat.value}
                        </div>

                    </div>
                </div>
            ))}
        </div>
    )
}