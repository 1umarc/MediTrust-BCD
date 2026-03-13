'use client'
import { useReadContract } from 'wagmi' // Import hook to read data from smart contracts
import { Address } from 'viem' // Import Ethereum address type
import rolesAbi from '@/abi/MediTrustRoles.json' // Import roles smart contract ABI
import { rolesContractAddress } from '@/utils/smartContractAddress' // Import deployed roles contract address
import { Admin_HospitalReps, Admin_TotalAdmin, AdminGroupUsers } from '@/app/images' // Import icons used for the admin dashboard cards

export function AdminStats() {
    // Get the total number of DAO members from the roles contract
    const { data: daoMemberCount } = useReadContract({
        address: rolesContractAddress as Address,
        abi: rolesAbi.abi,
        functionName: 'getTotalDAOMembers'
    })

    // Get the total number of hospital representatives
    const { data: hospitalRepCount } = useReadContract({
        address: rolesContractAddress as Address,
        abi: rolesAbi.abi,
        functionName: 'getTotalHospitalRep' 
    })

    // Define the statistics shown on the admin dashboard
    const stats = [
        {
            label: 'DAO Members',
            // If daoMemberCount exists -> convert it to a number, else daoMemberCount does NOT exist-> use 0 (if-else statement)
            value: daoMemberCount ? Number(daoMemberCount) : 0,
            icon: (<img src={AdminGroupUsers.src} alt="Admin Group Users Icon" className="w-6 h-6" />),
            gradient: 'from-purple-400 to-pink-500',
            bgGradient: 'from-purple-500/10 to-pink-500/10',
            borderColor: 'border-purple-500/20'
        },
        {
            label: 'Hospital Reps',
            value: hospitalRepCount ? Number(hospitalRepCount) : 0,
            icon: (<img src={Admin_HospitalReps.src} alt="Admin Hospital Reps Icon" className="w-6 h-6" />),
            gradient: 'from-cyan-400 to-blue-500',
            bgGradient: 'from-cyan-500/10 to-blue-500/10',
            borderColor: 'border-cyan-500/20'
        },
        {
            label: 'Total Admins',
            value: (daoMemberCount ? Number(daoMemberCount) : 0) + (hospitalRepCount ? Number(hospitalRepCount) : 0),
            icon: (<img src={Admin_TotalAdmin.src} alt="Admin Total Admins Icon" className="w-6 h-6" />),
            gradient: 'from-emerald-400 to-teal-500',
            bgGradient: 'from-emerald-500/10 to-teal-500/10',
            borderColor: 'border-emerald-500/20'
        }
    ]

    // Display platform admin statistics cards on dashboard
    return (
        <div className = "mb-12">
            {/* Display admin statistics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Generate a card for each statistic */}
                {stats.map((stat, index) => (
                    <div key={index} className="group relative">
                        {/* Decorative Glow Effect */}
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}>
                        </div>
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
        </div>
    )
}