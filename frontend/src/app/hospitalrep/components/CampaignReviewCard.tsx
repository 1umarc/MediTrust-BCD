'use client'
import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { Address, formatEther } from 'viem'
import { print } from '@/utils/toast'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'

interface CampaignReviewCardProps {
    campaignId: number
}

export function CampaignReviewCard({ campaignId }: CampaignReviewCardProps) {
    const [viewingDocuments, setViewingDocuments] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [showRejectForm, setShowRejectForm] = useState(false)

    // Fetch campaign data
    const { data: campaign } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaign',
        args: [campaignId]
    })

    const { data: hash, writeContract, isPending } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    if (!campaign) return null

    const [patient, targetAmount, raisedAmount, expiry, ipfsHash, status] = campaign as any[]
    
    // Only show pending campaigns
    if (status !== 0) return null

    const expiryDate = new Date(Number(expiry) * 1000)
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    const handleApprove = () => {
        writeContract({
            address: campaignContractAddress as Address,
            abi: campaignAbi.abi,
            functionName: 'approveCampaign',
            args: [campaignId]
        })
    }

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            print('Please provide a rejection reason', 'error')
            return
        }

        writeContract({
            address: campaignContractAddress as Address,
            abi: campaignAbi.abi,
            functionName: 'rejectCampaign',
            args: [campaignId, rejectionReason]
        })
    }

    if (isSuccess) {
        print('Campaign status updated successfully!', 'success')
        setShowRejectForm(false)
        setRejectionReason('')
    }

    return (
        <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Campaign #{campaignId}</h3>
                        <p className="text-sm text-slate-400 font-mono">{patient.slice(0, 6)}...{patient.slice(-4)}</p>
                    </div>
                    <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-bold">
                        ⏳ Pending Review
                    </span>
                </div>

                {/* Campaign Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1 font-semibold">Target Amount</div>
                        <div className="text-2xl font-bold text-cyan-400">{formatEther(targetAmount)} ETH</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1 font-semibold">Campaign Duration</div>
                        <div className="text-2xl font-bold text-purple-400">{daysUntilExpiry} days</div>
                    </div>
                </div>

                {/* Expiry Info */}
                <div className="mb-6 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Expires:</span>
                        <span className="text-slate-300 font-semibold">{expiryDate.toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Medical Documents */}
                <button
                    onClick={() => setViewingDocuments(!viewingDocuments)}
                    className="w-full mb-6 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:border-cyan-500/50 transition-all text-sm font-semibold"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>📄 View Medical Documentation</span>
                        </div>
                        <svg className={`w-5 h-5 transition-transform ${viewingDocuments ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                {viewingDocuments && (
                    <div className="mb-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl space-y-4">
                        <div>
                            <p className="text-sm text-slate-400 mb-2 font-semibold">IPFS Hash:</p>
                            <p className="text-xs text-cyan-400 font-mono break-all mb-3">{ipfsHash}</p>
                        </div>
                        
                        <div className="space-y-2">
                            <p className="text-sm text-slate-400 font-semibold">Available Documents:</p>
                            <div className="space-y-2">
                                {['Medical Diagnosis', 'Medical Reports', 'Medication Records (Quotation)', 'Campaign Image'].map((doc, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300 p-2 bg-slate-900/50 rounded-lg">
                                        <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        {doc}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <a
                            href={`https://ipfs.io/ipfs/${ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all text-sm font-semibold"
                        >
                            Open Documents in IPFS
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                )}

                {/* Verification Checklist */}
                <div className="mb-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                    <h4 className="text-sm font-bold text-white mb-3">Verification Checklist</h4>
                    <div className="space-y-2">
                        {[
                            'Medical diagnosis is authentic and complete',
                            'Treatment plan aligns with stated medical need',
                            'Target amount is reasonable for stated treatment',
                            'Campaign duration is feasible for treatment timeline',
                            'All required documents are present and valid'
                        ].map((item, i) => (
                            <label key={i} className="flex items-start gap-2 text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                                <input type="checkbox" className="mt-1 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500" />
                                <span>{item}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                {!showRejectForm ? (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setShowRejectForm(true)}
                            disabled={isPending}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-400 hover:to-pink-500 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20"
                        >
                            Reject Campaign
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={isPending}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {isPending ? 'Processing...' : 'Approve Campaign'}
                        </button>
                    </div>
                ) : (
                    /* Rejection Form */
                    <div className="space-y-4">
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <p className="text-sm text-red-300 font-semibold mb-2">⚠️ Rejection Reason Required</p>
                            <p className="text-xs text-red-400">
                                Please provide a clear reason for rejection. This helps the campaign creator understand what needs to be corrected.
                            </p>
                        </div>
                        
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none"
                            placeholder="e.g., Medical diagnosis documents are incomplete. Please include full treatment plan from physician."
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setShowRejectForm(false)
                                    setRejectionReason('')
                                }}
                                className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isPending || !rejectionReason.trim()}
                                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-400 hover:to-pink-500 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20"
                            >
                                {isPending ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}