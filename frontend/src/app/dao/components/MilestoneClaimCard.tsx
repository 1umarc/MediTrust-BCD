'use client'
import { useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { Address, formatEther } from 'viem'
import { print } from '@/utils/toast'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import daoAbi from '@/abi/MediTrustDAO.json'
import { DAOContractAddress } from '@/utils/smartContractAddress'
import { getFromDB } from '@/utils/dbconfig'
import { getFromIPFS } from '@/utils/ipfsconfig'

interface MilestoneClaimCardProps {
    claimID: number
}

export function MilestoneClaimCard({ claimID }: MilestoneClaimCardProps) {
    const { address } = useAccount()

    // Fetch milestone claim data from contract
    const { data: milestoneClaim } = useReadContract({
        address: DAOContractAddress as Address,
        abi: daoAbi.abi,
        functionName: 'getMilestoneClaimDetails',
        args: [claimID]
    })

    // Fetch if current user has voted
    const { data: hasVoted } = useReadContract({
        address: DAOContractAddress as Address,
        abi: daoAbi.abi,
        functionName: 'getVoted',
        args: [claimID, address],
        query: { enabled: !!address }
    })

    // Fetch current user's vote choice (only valid if hasVoted is true)
    const { data: userVote } = useReadContract({
        address: DAOContractAddress as Address,
        abi: daoAbi.abi,
        functionName: 'getVoteChoice',
        args: [claimID, address],
        query: { enabled: !!address && hasVoted === true }
    })

    // Fetch voting stats from DAO contract (totalVotes, approvalRate, participationRate, approved)
    const { data: votingStats } = useReadContract({
        address: DAOContractAddress as Address,
        abi: daoAbi.abi,
        functionName: 'getMilestoneClaimVotingStats',
        args: [claimID]
    })

    // Fetch milestone claim details from DB
    const { data: milestoneDetail } = useQuery({
        queryKey: ['milestoneclaimdetails'],
        queryFn: () => getFromDB('milestoneclaimdetails'),
    })

    // Map DB in reverse order
    const milestoneDetails = milestoneDetail
    ? Object.fromEntries(
        [...(milestoneDetail as any[])].reverse().map((c, index) => [index, c])
      )
    : {}

    const queryClient = useQueryClient()
    const { data: hash, writeContract, isPending } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        if (isSuccess) {
            queryClient.invalidateQueries()
            print('Vote submitted successfully!', 'success')
        }
    }, [isSuccess])

    if (!milestoneClaim || !milestoneDetails || !votingStats) return null

    const [campaignID, patient, amount, invoiceHash, yesCount, noCount, executed, startDate] = milestoneClaim as any[]

    // Voting stats retrieved directly from DAO contract (no frontend calculation needed)
    const [totalVotes, approvalRate, quorumAchieved, totalDAOMembers, isApproved] = votingStats as any[]

    // Vote handler - calls MediTrustDAO.vote()
    const handleVote = (newVote: boolean) => {
        writeContract(
            {
                address: DAOContractAddress as Address,
                abi: daoAbi.abi,
                functionName: 'vote',
                args: [claimID, newVote],
            },
            {
                onError: (error) => {
                    const message = error.message.match(/reason string '(.+?)'/)?.[1]
                    print(message ?? 'Voting failed', 'error')
                }
            }
        )
    }

    // Status badge
    const getStatusBadge = () => {
        if (executed) {
            return (
                <span className="flex-shrink-0 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-xs font-bold">
                    💰 Funds Released
                </span>
            )
        }
        if (isApproved) {
            return (
                <span className="flex-shrink-0 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-bold">
                    ✅ Approved
                </span>
            )
        }
        return (
            <span className="flex-shrink-0 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-bold">
                ⏳ Pending Votes
            </span>
        )
    }

    return (
        <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>

            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
                {/* Header - Milestone Title & Status */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                    <div>
                        <h3 className="text-lg font-black text-white leading-tight">
                            {milestoneDetails[claimID]?.title ?? `Milestone #${claimID}`}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                            Campaign #{Number(campaignID)} · {patient.slice(0, 6)}...{patient.slice(-4)}
                        </p>
                    </div>
                    {getStatusBadge()}
                </div>

                {/* Description */}
                {milestoneDetails[claimID]?.description && (
                    <div className="px-6 mb-5">
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {milestoneDetails[claimID].description}
                        </p>
                    </div>
                )}

                {/* Claim Amount */}
                <div className="px-6 mb-4">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Claim Amount</div>
                        <div className="text-2xl font-black text-cyan-400">{formatEther(amount)} HETH</div>
                    </div>
                </div>

                {/* Voting Progress - Approval Rate */}
                <div className="px-6 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400 font-semibold">Approval Rate</span>
                        <span className="text-emerald-400 font-bold">{Number(approvalRate)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Number(approvalRate)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>{Number(yesCount)} Approve / {Number(noCount)} Reject</span>
                        <span>Need: ≥ 60% approval</span>
                    </div>
                </div>

                {/* Voting Progress - Participation Rate */}
                <div className="px-6 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400 font-semibold">Participation</span>
                        <span className="text-purple-400 font-bold">{Number(quorumAchieved)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(Number(quorumAchieved), 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>{Number(totalVotes)} / {Number(totalDAOMembers)} DAO Members voted</span>
                        <span>Need: ≥ 50% quorum</span>
                    </div>
                </div>

                {/* Invoice Download */}
                <div className="px-6 mb-5">
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-slate-300 font-medium truncate">Invoice.pdf</span>
                        </div>
                        <a
                            href={getFromIPFS(invoiceHash)}
                            download
                            className="flex-shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all text-xs font-bold"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                        </a>
                    </div>
                </div>

                {/* Voting Buttons */}
                <div className="px-6 pb-6">
                    {executed ? (
                        /* Funds Released Message */
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
                            <p className="text-blue-300 font-semibold">
                                💰 Milestone approved and funds have been released.
                            </p>
                        </div>
                    ) : isApproved ? (
                        /* Approved but not yet executed (e.g. insufficient campaign funds at time of vote) */
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                            <p className="text-emerald-300 font-semibold">
                                ✅ Milestone approved! Awaiting fund release.
                            </p>
                        </div>
                    ) : (
                        /* Pending Votes - Active voting */
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleVote(false)}
                                    disabled={isPending}
                                    className={`px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                                        hasVoted && userVote === false
                                            ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/20 ring-2 ring-red-400/50'
                                            : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-400 hover:to-pink-500 shadow-lg shadow-red-500/20'
                                    } ${isPending ? 'opacity-50' : ''}`}
                                >
                                    {isPending ? 'Voting...' : hasVoted && userVote === false ? '✓ Voted Reject' : 'Reject'}
                                </button>
                                <button
                                    onClick={() => handleVote(true)}
                                    disabled={isPending}
                                    className={`px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                                        hasVoted && userVote === true
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/50'
                                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20'
                                    } ${isPending ? 'opacity-50' : ''}`}
                                >
                                    {isPending ? 'Voting...' : hasVoted && userVote === true ? '✓ Voted Approve' : 'Approve'}
                                </button>
                            </div>

                            {/* Revote hint */}
                            {Boolean(hasVoted) && (
                                <p className="text-center text-xs text-slate-500">
                                    You can change your vote at any time before funds are released
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}