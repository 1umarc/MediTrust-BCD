'use client'
import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { Address, formatEther } from 'viem'
import { print } from '@/utils/toast'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'
import { getFromDB } from '@/utils/dbconfig'
import { getFromIPFS } from '@/utils/ipfsconfig'

// New Changes : move the useEffect under the 3 hooks before 'if (!campaign) return null'
interface CampaignReviewCardProps {
    campaignID: number
}

export function CampaignReviewCard({ campaignID }: CampaignReviewCardProps) {
    const [reason, setRejectionReason] = useState('')
    const [showRejectForm, setShowRejectForm] = useState(false)

    // Fetch campaign data from contract
    const { data: campaign } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaign',
        args: [campaignID]
    })
 
    // Fetch campaign data from DB
    const { data: campaignDetails, } = useQuery({
    queryKey: ['campaigndetails'],     // array identifying the query
    queryFn: () => getFromDB('campaigndetails'),  // function returning a Promise
    })

    const queryClient = useQueryClient()    // When data changes (approve/reject), it refreshes everything
    const { data: hash, writeContract, isPending } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        if (isSuccess) {
            queryClient.invalidateQueries()
            print('Campaign status updated successfully!', 'success')
            setShowRejectForm(false)
            setRejectionReason('')
        }
    }, [isSuccess])

    if (!campaign) return null      // If 'campaign' is empty , don't show the card"

    const [patient, target, raised, duration, diagnosisHash, quotationHash, status] = campaign as any[] // Takes the array and splits it into separate variables
    
    if (status !== 0) return null // Only show campaigns that are waiting for review (pending)

    const expiryDate = new Date(Number(duration) * 1000)
    const raisedEth = parseFloat(formatEther(raised))
    const targetEth = parseFloat(formatEther(target))
    const progressPercent = Math.min((raisedEth / targetEth) * 100, 100)

    const handleApprove = () => {
        writeContract({
            address: campaignContractAddress as Address,
            abi: campaignAbi.abi,
            functionName: 'approveCampaign',
            args: [campaignID]
        })
    }

    const handleReject = () => {
        if (!reason.trim()) {
            print('Please provide a rejection reason', 'error')
            return
        }

        writeContract({
            address: campaignContractAddress as Address,
            abi: campaignAbi.abi,
            functionName: 'rejectCampaign',
            args: [campaignID]
        })
    }

     return (
        <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                 {/* Campaign Name  */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                    <div>
                        <h3 className="text-lg font-black text-white leading-tight">
                            {campaignDetails[campaignID].title}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                            {patient.slice(0, 6)}...{patient.slice(-4)}
                        </p>
                    </div>
                    <span className="flex-shrink-0 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-bold">
                        ⏳ Pending
                    </span>
                </div>

                {/* Campaign Image */}
                <div className="px-6 mb-5">
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/50 flex items-center justify-center">
                        <img
                            src={ getFromIPFS(campaignDetails[campaignID].imagehash) }
                            alt="Campaign"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                const parent = e.currentTarget.parentElement
                                if (parent) {
                                    parent.innerHTML = `
                                        <div class="flex flex-col items-center justify-center gap-2 text-slate-600 w-full h-full">
                                            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-semibold">No Image Available</span>
                                        </div>`
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Raised / Target Amount */}
                <div className="px-6 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Raised</div>
                            <div className="text-xl font-black text-emerald-400">{raisedEth} HETH</div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Target</div>
                            <div className="text-xl font-black text-cyan-400">{targetEth} HETH</div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                            {/* <span>{progressPercent.toFixed(1)}% funded</span> */}
                            <span>{raisedEth} / {targetEth} ETH</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Expires */}
                <div className="px-6 mb-4">
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-sm">
                        <span className="text-slate-400 font-semibold">Expires</span>
                        <span className="text-white font-bold">
                            {expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Document Download Rows */}
                <div className="px-6 mb-5 space-y-2">

                    {/* Medical Diagnosis */}
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm text-slate-300 font-medium truncate">Medical Diagnosis.pdf</span>
                        </div>
                        <a
                            href={ getFromIPFS(diagnosisHash) }
                            download
                            className="flex-shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all text-xs font-bold"
                        >
                            Download
                        </a>
                    </div>

                    {/* Treatment Quotation */}
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm text-slate-300 font-medium truncate">Treatment Quotation.pdf</span>
                        </div>
                        <a
                            href={ getFromIPFS(quotationHash) }
                            download
                            className="flex-shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all text-xs font-bold"
                        >
                            Download
                        </a>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6">
                    {!showRejectForm ? (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowRejectForm(true)}
                                disabled={isPending}
                                className="px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-400 hover:to-pink-500 disabled:opacity-50 transition-all text-sm shadow-lg shadow-red-500/20"
                            >
                                Reject
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={isPending}
                                className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition-all text-sm shadow-lg shadow-emerald-500/20"
                            >
                                {isPending ? 'Processing...' : ' Approve'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <textarea
                                value={reason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none text-sm"
                                placeholder="e.g., Medical diagnosis documents are incomplete..."
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => { setShowRejectForm(false); setRejectionReason('') }}
                                    className="px-4 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={isPending || !reason.trim()}
                                    className="px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold disabled:opacity-50 transition-all text-sm"
                                >
                                    {isPending ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}