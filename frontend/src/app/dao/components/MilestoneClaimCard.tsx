'use client'
import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { Address } from 'viem'
import { print } from '@/utils/toast'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'

interface MilestoneClaimCardProps {
    campaignId: number
    milestoneId: number
}

export function MilestoneClaimCard({ campaignId, milestoneId }: MilestoneClaimCardProps) {
    const [viewingProof, setViewingProof] = useState(false)

    // Fetch milestone claim data
    const { data: milestoneClaim } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getMilestoneClaim',
        args: [campaignId, milestoneId]
    })

    // Fetch voting data
    const { data: votingData } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getVotingStatus',
        args: [campaignId, milestoneId]
    })

    const { data: hash, writeContract, isPending } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    if (!milestoneClaim || !votingData) return null

    const [description, amount, proofHash, timestamp, isApproved] = milestoneClaim as any[]
    const [totalVotes, approvalVotes, hasVoted, userVote] = votingData as any[]

    const approvalPercentage = totalVotes > 0 ? (Number(approvalVotes) / Number(totalVotes)) * 100 : 0
    const participationPercentage = 50 // This should come from contract (totalVotes / totalDAOMembers * 100)

    const handleVote = (approve: boolean) => {
        writeContract({
            address: campaignContractAddress as Address,
            abi: campaignAbi.abi,
            functionName: 'voteOnMilestone',
            args: [campaignId, milestoneId, approve]
        })
    }

    if (isSuccess) {
        print('Vote submitted successfully!', 'success')
    }

    // Status badge
    const getStatusBadge = () => {
        if (isApproved) {
            return (
                <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold">
                    ✓ Approved
                </span>
            )
        }
        if (participationPercentage >= 50 && approvalPercentage >= 60) {
            return (
                <span className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-xs font-bold">
                    Ready for Approval
                </span>
            )
        }
        return (
            <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-bold">
                ⏳ Pending Votes
            </span>
        )
    }

    return (
        <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                            Milestone #{milestoneId}
                        </h3>
                        <p className="text-sm text-slate-400">Campaign #{campaignId}</p>
                    </div>
                    {getStatusBadge()}
                </div>

                {/* Description */}
                <div className="mb-6">
                    <p className="text-slate-300 leading-relaxed">{description}</p>
                </div>

                {/* Claim Amount */}
                <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                    <div className="text-xs text-slate-500 mb-1 font-semibold">Claim Amount</div>
                    <div className="text-2xl font-bold text-cyan-400">{amount} RM</div>
                </div>

                {/* Voting Progress */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400 font-semibold">Approval Rate</span>
                        <span className="text-emerald-400 font-bold">{approvalPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mb-2">
                        <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${approvalPercentage}%` }}
                        >
                            <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>{Number(approvalVotes)} Approve / {Number(totalVotes)} Total Votes</span>
                        <span>Need: 60% approval + 50% participation</span>
                    </div>
                </div>

                {/* Proof Documents */}
                <button
                    onClick={() => setViewingProof(!viewingProof)}
                    className="w-full mb-6 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:border-cyan-500/50 transition-all text-sm font-semibold"
                >
                    <div className="flex items-center justify-between">
                        <span>📄 View Milestone Proof Documents</span>
                        <svg className={`w-5 h-5 transition-transform ${viewingProof ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                {viewingProof && (
                    <div className="mb-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                        <p className="text-sm text-slate-400 mb-2">IPFS Hash:</p>
                        <p className="text-xs text-cyan-400 font-mono break-all mb-3">{proofHash}</p>
                        <a
                            href={`https://ipfs.io/ipfs/${proofHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                            Open in IPFS
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                )}

                {/* Voting Buttons */}
                {!isApproved && (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleVote(false)}
                            disabled={isPending}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-400 hover:to-pink-500 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20"
                        >
                            {isPending ? 'Voting...' : hasVoted && !userVote ? '✓ Voted Reject' : 'Reject'}
                        </button>
                        <button
                            onClick={() => handleVote(true)}
                            disabled={isPending}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {isPending ? 'Voting...' : hasVoted && userVote ? '✓ Voted Approve' : 'Approve'}
                        </button>
                    </div>
                )}

                {/* User Vote Status */}
                {hasVoted && !isApproved && (
                    <div className="mt-4 text-center text-sm text-slate-400">
                        <p>You can change your vote at any time before approval</p>
                    </div>
                )}

                {isApproved && (
                    <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                        <p className="text-emerald-300 font-semibold">
                            ✓ Milestone approved! Funds have been released.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}