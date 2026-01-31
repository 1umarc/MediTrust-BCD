'use client'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address } from 'viem'
import { print } from '@/utils/toast'
import daoAbi from '@/abi/MediTrustDAO.json'
import { DAOContractAddress } from '@/utils/smartContractAddress'

interface VoteProps {
    claimId: number
}

export function VoteOnClaim({ claimId }: VoteProps) {
    const { data: votes } = useReadContract({
        address: DAOContractAddress as Address,
        abi: daoAbi.abi,
        functionName: 'getClaimVotes',
        args: [claimId]
    })

    const { data: hash, writeContract } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    const handleVote = (support: boolean) => {
        writeContract({
            address: DAOContractAddress as Address,
            abi: daoAbi.abi,
            functionName: 'vote',
            args: [claimId, support]
        })
    }

    if (isSuccess) {
        print('Vote recorded successfully', 'success')
    }

    const [votesFor, votesAgainst] = votes as [bigint, bigint] || [0n, 0n]
    const total = Number(votesFor) + Number(votesAgainst)
    const approvalRate = total > 0 ? (Number(votesFor) / total) * 100 : 0

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-semibold mb-4">Claim #{claimId}</h4>
            
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span>Approval Rate</span>
                    <span>{approvalRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${approvalRate}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{Number(votesFor)}</div>
                    <div className="text-gray-600">For</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{Number(votesAgainst)}</div>
                    <div className="text-gray-600">Against</div>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => handleVote(true)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                    Vote For
                </button>
                <button
                    onClick={() => handleVote(false)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                    Vote Against
                </button>
            </div>
        </div>
    )
}