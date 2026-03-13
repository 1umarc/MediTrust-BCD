'use client'
import { useReadContract } from 'wagmi' // Import hook to read data from smart contracts
import { Address, formatEther } from 'viem' // Import Ethereum address type and ETH formatter
import daoAbi from '@/abi/MediTrustDAO.json' // Import DAO smart contract ABI
import { DAOContractAddress } from '@/utils/smartContractAddress' // Import deployed DAO contract address
import { Pending, Approve, MoneyIcon } from '@/app/images' // Import icons used in the statistics cards

export function DAOStats() {
    // Get the number of milestone claims that are waiting for DAO votes
    const { data: pendingClaims } = useReadContract({
        address: DAOContractAddress as Address,
        abi: daoAbi.abi,
        functionName: "getMilestoneClaimCount",
        args: [0] // 0 = Pending (not approved & not executed)
    })

    // Get the number of milestone claims that are approved by the DAO
    const { data: approvedClaims } = useReadContract({
        address: DAOContractAddress as Address,
        abi: daoAbi.abi,
        functionName: "getMilestoneClaimCount",
        args: [1] // 1 = Approved
    })

    // Get the total amount of funds released (sum of executed claim amounts in wei)
    const { data: totalFundsReleased } = useReadContract({
        address: DAOContractAddress as Address,
        abi: daoAbi.abi,
        functionName: "getTotalFundsReleased"
    })

    // Store DAO statistics data to display on dashboard 
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
            value: totalFundsReleased ? `${formatEther(totalFundsReleased as bigint)} HETH` : '0 HETH',
            icon: ( <img src={MoneyIcon.src} alt= "Money Icon" className = "w-7 h-7" />),
            gradient: 'from-purple-400 to-pink-500',
            bgGradient: 'from-purple-500/10 to-pink-500/10',
            borderColor: 'border-purple-500/20'
        }
    ]

    // Display DAO Statistics on dashboard
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Generate a statistics card for each DAO metric */}
            {DAOStats.map((stat, index) => (
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