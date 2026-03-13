'use client'
import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import daoAbi from '@/abi/MediTrustDAO.json'
import { DAOContractAddress } from '@/utils/smartContractAddress'
import { MilestoneClaimCard } from './MilestoneClaimCard'
import { EmptyState } from '@/app/images'

// Create allowed filter values
type FilterType = 'pending' | 'approved' | 'all'

export function MilestoneClaimList() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('pending')

    // Get pending milestone claim IDs
    const { data: pendingClaimIDsData } = useReadContract({
        address: DAOContractAddress as Address,
        abi: daoAbi.abi,
        functionName: 'getMilestoneClaimIDs',
        args: [0]   // 0 = Pending (not approved & not executed)
    })

    // Get approved milestone claim IDs
    const { data: approvedClaimIDsData } = useReadContract({
        address: DAOContractAddress as Address,
        abi: daoAbi.abi,
        functionName: 'getMilestoneClaimIDs',
        args: [1]   // 1 = Approved (approved by DAO vote)
    })

    // Get all milestone claim IDs
    const { data: allClaimIDsData } = useReadContract({
        address: DAOContractAddress as Address,
        abi: daoAbi.abi,
        functionName: 'getAllMilestoneClaimIDs'
    })

    // Convert to Javascript Arrays
    const pendingIDs = pendingClaimIDsData
        ? (pendingClaimIDsData as bigint[]).map(id => Number(id))
        : []

    const approvedIDs = approvedClaimIDsData
        ? (approvedClaimIDsData as bigint[]).map(id => Number(id))
        : []

    const allIDs = allClaimIDsData
        ? (allClaimIDsData as bigint[]).map(id => Number(id))
        : []

    // Calculate Counts for Filters Cal
    const claimCounts = {
        pending: pendingIDs.length,
        approved: approvedIDs.length,
        all: allIDs.length
    }

    // Filter based on Active Filter
    const filteredClaimIDs =
        activeFilter === 'pending' ? pendingIDs :
        activeFilter === 'approved' ? approvedIDs :
        allIDs

    // Filter Buttons
    const filters: { id: FilterType; label: string; icon: string }[] = 
    [
        { 
            id: 'pending', 
            label: 'Pending Votes', 
            icon: '⏳' 
        },

        { 
            id: 'approved', 
            label: 'Approved', 
            icon: '✅' 
        },

        { 
            id: 'all', 
            label: 'All Claims', 
            icon: '📋' 
        }
    ]

    return (
        <div className="space-y-8">
            {/* Milestone Claim Filters - Pending, Approved, All Claims */}
            <div className="flex flex-wrap gap-3">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`group relative px-6 py-3 rounded-xl font-bold transition-all ${
                            activeFilter === filter.id
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-slate-900/50 border border-slate-700 text-slate-300 hover:border-purple-500/50'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-lg">{filter.icon}</span>
                            {filter.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                                activeFilter === filter.id
                                    ? 'bg-white/20'
                                    : 'bg-slate-800'
                            }`}>
                                {claimCounts[filter.id]}
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Claims Grid */}
            {filteredClaimIDs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClaimIDs.map((claimID) => (
                        <MilestoneClaimCard
                            key={claimID}
                            claimID={claimID}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State - No Milestone Claims */
                <div className="text-center py-20">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <img src={EmptyState.src} alt="No Milestone Claims" className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Milestone Claims</h3>
                    <p className="text-slate-400">
                        {activeFilter === 'all'
                            ? 'No milestone claims have been submitted yet'
                            : `No ${activeFilter} milestone claims at the moment`
                        }
                    </p>
                </div>
            )}
        </div>
    )
}