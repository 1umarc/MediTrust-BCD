'use client'
import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { Address } from 'viem'
import { print } from '@/utils/toast'
import { useQueryClient } from '@tanstack/react-query'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'

interface MilestoneClaimCardProps {
    campaignID: number
    claimID: number
}

export function MilestoneClaimCard({ campaignID, claimID}: MilestoneClaimCardProps) {
    const [viewingProof, setViewingProof] = useState(false)

  // // Fetch milestone claim data
  // const { data: milestoneClaim } = useReadContract({
  //   address: campaignContractAddress as Address,
  //   abi: campaignAbi.abi,
  //   functionName: 'getMilestoneClaimDetails',
  //   args: [claimID],
  // });

  // // Fetch voting data
  // const { data: votingData } = useReadContract({
  //   address: campaignContractAddress as Address,
  //   abi: campaignAbi.abi,
  //   functionName: 'getMilestoneClaimVotes',
  //   args: [claimID],
  // });

      // DUMMY DATA
    const milestoneClaim = [
        'Patient has completed chemotherapy session 1 at Hospital Kuala Lumpur and requires funds for session 2.',
        '5000',                          // amount in RM
        'QmProofHashForMilestoneProof',  // proofHash
        BigInt(Date.now()),              // timestamp
        false                            // isApproved
    ]

    const votingData = [
        BigInt(10),   // totalVotes
        BigInt(7),    // approvalVotes (7/10 = 70%)
        false,        // hasVoted
        false         // userVote
    ]

    const queryClient = useQueryClient()
    const { data: hash, writeContract, isPending } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    //TODO:uncomment when connect to real blockchain
    // if (!milestoneClaim || !votingData) return null

    const [description, amount, invoiceHash, isApproved] = milestoneClaim as any[]
    const [totalVotes, approvalVotes, hasVoted, userVote] = votingData as any[]

    const approvalPercentage = totalVotes > 0 ? (Number(approvalVotes) / Number(totalVotes)) * 100 : 0
    const participationPercentage = 50 // This should come from contract (totalVotes / totalDAOMembers * 100)

    const handleVote = (newVote: boolean) => {
    writeContract({
      address: campaignContractAddress as Address,
      abi: campaignAbi.abi,
      functionName: 'vote',
      args: [claimID, newVote],
    });
  };

    useEffect(() => {
        if (isSuccess) {
            queryClient.invalidateQueries()
            print('Vote submitted successfully!', 'success')
        }
    }, [isSuccess])

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
                            Milestone #{claimID}
                        </h3>
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
                    <div className="text-2xl font-bold text-cyan-400">{amount} HETH</div>
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

                <div className="mb-5 space-y-2">

                    {/* Invoice */}
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-slate-300 font-medium truncate">Invoice.pdf</span>
                        </div>
                        <a
                            // href={`${dummyMetadata.medicalDiagnosisCid}`}
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