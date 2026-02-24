'use client'
import { useReadContract } from 'wagmi'
import { Address, formatEther } from 'viem'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'
import { OnGoingIcon, TotalCampaignIcon, Approve, MoneyIcon } from '@/app/images'

export function CampaignStats() {
    const { data: campaignCount } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'campaignCount'
    })

    const count = campaignCount ? Number(campaignCount) : 0

    // Fetch all campaigns to calculate stats
    const campaigns = Array.from({ length: count }, (_, i) => {
        const { data: campaign } = useReadContract({
            address: campaignContractAddress as Address,
            abi: campaignAbi.abi,
            functionName: 'getCampaign',
            args: [i]
        })
        return campaign
    }).filter(Boolean)

    // Calculate statistics
    const totalCampaigns = campaigns.length
    const ongoingCampaigns = campaigns.filter((c: any) => c && c[5] === 1).length // Status 1 = Approved
    const completedCampaigns = campaigns.filter((c: any) => c && c[5] === 3).length // Status 3 = Completed
    const totalRaised = campaigns.reduce((sum: bigint, campaign: any) => {
        if (campaign) {
            return sum + BigInt(campaign[2]) // raisedAmount
        }
        return sum
    }, BigInt(0))

    // Define data in an array
    const stats = [
        {
            label: 'Total Campaigns',
            value: totalCampaigns.toString(),
            icon: <img src={TotalCampaignIcon.src} alt="Total Campaigns Icon" className="w-6 h-6" />,
            gradient: 'from-cyan-400 to-blue-500',
            bgGradient: 'from-cyan-500/10 to-blue-500/10',
            borderColor: 'border-cyan-500/20'
        },
        {
            label: 'Ongoing',
            value: ongoingCampaigns.toString(),
            icon: <img src={OnGoingIcon.src} alt="OnGoing Icon" className="w-6 h-6"/>,
            gradient: 'from-emerald-400 to-teal-500',
            bgGradient: 'from-emerald-500/10 to-teal-500/10',
            borderColor: 'border-emerald-500/20'
        },
        {
            label: 'Completed',
            value: completedCampaigns.toString(),
            icon: <img src={Approve.src} alt="Approve Icon" className="w-5 h-5"/>,
            gradient: 'from-purple-400 to-pink-500',
            bgGradient: 'from-purple-500/10 to-pink-500/10',
            borderColor: 'border-purple-500/20'
        },
        {
            label: 'Total Raised',
            value: `${formatEther(totalRaised)} HETH`,
            icon: <img src={MoneyIcon.src} alt="Money Icon" className="w-7 h-7"/>,
            gradient: 'from-amber-400 to-orange-500',
            bgGradient: 'from-amber-500/10 to-orange-500/10',
            borderColor: 'border-amber-500/20'
        }
    ]

// Frontend Code
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="group relative">
                    {/* Glow effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>
                    
                    {/* Card */}
                    <div className={`relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl border ${stat.borderColor} rounded-2xl p-6`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-grow">
                                <div className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">{stat.label}</div>
                            </div>
                            <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                {stat.icon}
                            </div>
                        </div>
                        
                        <div className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
                            {stat.value}
                        </div>

                        {/* Progress bar decoration */}
                        <div className="mt-4 h-1 bg-slate-800/50 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full w-3/4`}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}