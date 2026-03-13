'use client'
import { useReadContract } from 'wagmi' // Import hook to read data from smart contracts
import { Address, formatEther } from 'viem' // Import Ethereum types and utilities
import campaignAbi from '@/abi/MediTrustCampaign.json' // Import campaign smart contract ABI
import { campaignContractAddress } from '@/utils/smartContractAddress' // Import deployed campaign contract address
import { OnGoingIcon, TotalCampaignIcon, Approve, MoneyIcon } from '@/app/images' // Import icons used in the statistics cards

export function CampaignStats() {

    // Get total number of campaigns from the contract
    const { data: campaignCount } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'campaignCount'
    })

    // Convert campaign count to a number
    const count = campaignCount ? Number(campaignCount) : 0

    // Get number of campaigns that are currently approved (Ongoing)
    // status = 1 represents "Approved"
    const { data: approvedCount } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignCount',
        args: [1]  
    })

     // Get cnumber of campaigns that are completed
    // status = 3 represents "Completed"
    const { data: completedCount } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignCount',
        args: [3]  
    })

    // Get total amount of funds raised from all campaigns
    const { data: totalRaisedData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getTotalRaised'  
    })

    // Convert blockchain data into statistics
    const totalCampaigns = campaignCount ? Number(campaignCount) : 0
    const ongoingCampaigns = approvedCount ? Number(approvedCount) : 0
    const completedCampaigns = completedCount ? Number(completedCount) : 0
    const totalRaised = totalRaisedData ? Number(totalRaisedData) : Number(0)


    // Stores campaign statistics data to display on dashboard cards
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
            value: `${Number(totalRaised)} HETH`,
            icon: <img src={MoneyIcon.src} alt="Money Icon" className="w-7 h-7"/>,
            gradient: 'from-amber-400 to-orange-500',
            bgGradient: 'from-amber-500/10 to-orange-500/10',
            borderColor: 'border-amber-500/20'
        }
    ]

    // Display campaign statistics cards on dashboard
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="group relative">
                    {/* Decorative Glow Effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>
                    
                    {/* Statistics Card */}
                    <div className={`relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl border ${stat.borderColor} rounded-2xl p-6`}>
                        <div className="flex items-start justify-between mb-4">
                            {/* Statistics Label */}
                            <div className="flex-grow">
                                <div className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">{stat.label}</div>
                            </div>
                            
                            {/* Icon for Statistics */}
                            <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                {stat.icon}
                            </div>
                        </div>
                        
                        {/* Statistic Value */}
                        <div className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
                            {stat.value}
                        </div>

                        {/* Decorative Progress Bar */}
                        <div className="mt-4 h-1 bg-slate-800/50 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full w-3/4`}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}