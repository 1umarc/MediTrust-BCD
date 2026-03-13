'use client'
import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { Address, formatEther, parseEther } from 'viem'
import { print } from '@/utils/toast'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import fundsAbi from '@/abi/MediTrustFunds.json'
import { campaignContractAddress, fundsContractAddress } from '@/utils/smartContractAddress'
import { getFromDB } from '@/utils/dbconfig'
import { getFromIPFS } from '@/utils/ipfsconfig'

interface CampaignCardProps {
    campaignID: number
}

export function CampaignCard({ campaignID }: CampaignCardProps) {
    const [donationAmount, setDonationAmount] = useState('')
    const [showDonateForm, setShowDonateForm] = useState(false)

    // Fetch campaign data from contract
    const { data: campaign } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaign',
        args: [campaignID]
    })

    // Fetch campaign data from DB
    const { data: campaignDetails } = useQuery({
        queryKey: ['campaigndetails'],
        queryFn: () => getFromDB('campaigndetails'),
    })

    const queryClient = useQueryClient()
    const { data: hash, writeContract, isPending } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        if (isSuccess) {
            queryClient.invalidateQueries()
            print('Donation submitted successfully!', 'success')
            setShowDonateForm(false)
            setDonationAmount('')
        }
    }, [isSuccess])

    if (!campaign || !campaignDetails) return null

    const [patient, target, raised, duration, , , status, startDate] = campaign as any[]

    // Calculate expiry date
    const expiryTimestamp = Number(startDate) + Number(duration) * 86400
    const expiryDate = new Date(expiryTimestamp * 1000)

    // Calculate progress
    const raisedEth = parseFloat(formatEther(raised))
    const targetEth = parseFloat(formatEther(target))
    const progressPercent = Math.min((raisedEth / targetEth) * 100, 100)

    // Only approved campaigns can receive donations
    const isDonatable = status === 1

    // Status labels and colors
    const statusConfig: Record<number, { label: string; icon: string; classes: string }> = {
        0: { label: 'Pending',   icon: '⏳', classes: 'bg-amber-500/20 border border-amber-500/30 text-amber-300' },
        1: { label: 'Approved',  icon: '✅', classes: 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' },
        2: { label: 'Rejected',  icon: '❌', classes: 'bg-red-500/20 border border-red-500/30 text-red-300' },
        3: { label: 'Completed', icon: '🎉', classes: 'bg-blue-500/20 border border-blue-500/30 text-blue-300' }
    }

    const currentStatus = statusConfig[status as number] || statusConfig[0]

    // Donate handler - calls MediTrustFunds.donate()
    const handleDonate = () => {
        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            print('Please enter a valid donation amount', 'error')
            return
        }
        writeContract(
            {
                address: fundsContractAddress as Address,
                abi: fundsAbi.abi,
                functionName: 'donate',
                args: [campaignID],
                value: parseEther(donationAmount)
            },
            {
                onError: (error) => {
                    const message = error.message.match(/reason string '(.+?)'/)?.[1]
                    print(message ?? 'Donation failed', 'error')
                }
            }
        )
    }

    return (
        <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>

            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
                {/* Campaign Name & Status */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4">
                    <div>
                        <h3 className="text-lg font-black text-white leading-tight">
                            {campaignDetails[campaignID]?.title ?? `Campaign #${campaignID}`}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                            {patient.slice(0, 6)}...{patient.slice(-4)}
                        </p>
                    </div>
                    <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${currentStatus.classes}`}>
                        {currentStatus.icon} {currentStatus.label}
                    </span>
                </div>

                {/* Campaign Image */}
                <div className="px-6 mb-5">
                    <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/50 flex items-center justify-center">
                        <img
                            src={getFromIPFS(campaignDetails[campaignID]?.imagehash)}
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
                            <span>{raisedEth} / {targetEth} ETH</span>
                            <span className="text-cyan-400 font-bold">{progressPercent.toFixed(1)}%</span>
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

                {/* Donate Section */}
                <div className="px-6 pb-6">
                    {isDonatable ? (
                        !showDonateForm ? (
                            /* Donate Button */
                            <button
                                onClick={() => setShowDonateForm(true)}
                                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
                            >
                                💙 Donate Now
                            </button>
                        ) : (
                            /* Donate Form */
                            <div className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        value={donationAmount}
                                        onChange={(e) => setDonationAmount(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all text-sm pr-16"
                                        placeholder="Enter amount in HETH..."
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">HETH</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => { setShowDonateForm(false); setDonationAmount('') }}
                                        className="px-4 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDonate}
                                        disabled={isPending || !donationAmount}
                                        className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold disabled:opacity-50 hover:from-cyan-400 hover:to-blue-500 transition-all text-sm shadow-lg shadow-cyan-500/20"
                                    >
                                        {isPending ? 'Donating...' : 'Confirm Donation'}
                                    </button>
                                </div>
                            </div>
                        )
                    ) : status === 3 ? (
                        /* Completed Campaign */
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
                            <p className="text-blue-300 font-semibold">
                                🎉 Campaign completed! Target has been reached.
                            </p>
                        </div>
                    ) : (
                        /* Not Donatable (Pending / Rejected) */
                        <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center">
                            <p className="text-slate-500 font-semibold text-sm">
                                {status === 0 ? '⏳ Awaiting hospital approval' : '❌ Campaign is not accepting donations'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}