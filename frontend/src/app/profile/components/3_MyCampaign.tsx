'use client'
import React from 'react'
import Link from 'next/link'
import { AddIcon, CampaignEmptyState } from '@/app/images'
import { formatEther, Address } from 'viem'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'
import { useReadContract, useAccount } from 'wagmi'
import { getFromDB } from '@/utils/dbconfig'
import { getFromIPFS } from '@/utils/ipfsconfig'
import { useQuery } from '@tanstack/react-query'

function CampaignCard({ campaignID }: { campaignID: number }) 
{
    const { address } = useAccount()

    // 1) On-chain data for this campaign
    const { data: campaign } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaign',
        args: [campaignID]
    })

    // 2) Off-chain data from DB (title, description, imagehash, duration)
    const { data: campaignDetails } = useQuery({
        queryKey: ['campaigndetails'],
        queryFn: () => getFromDB('campaigndetails'),
    })

    // Wait for both sources
    if (!campaign || !campaignDetails) return null

    const [patient, target, raised, duration] = campaign as any[]

    // Only show campaigns that belong to the connected wallet
    if (patient?.toLowerCase() !== address?.toLowerCase()) return null

    // Find this campaign's DB record by campaignid
    const detail = campaignDetails.find((d: any) => Number(d.campaignid) === campaignID)

    const raisedEth = parseFloat(formatEther(raised))
    const targetEth = parseFloat(formatEther(target))
    const progressPercent = targetEth > 0 ? Math.min((raisedEth / targetEth) * 100, 100) : 0

    return (
        <div className="group/card relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 group-hover/card:opacity-30 transition duration-500" />

            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/50 transition-all">

                {/* Campaign Image (from DB imagehash → IPFS) */}
                <div className="w-full h-40 bg-slate-800/50 overflow-hidden flex items-center justify-center">
                    {detail?.imagehash ? (
                        <img
                            src={getFromIPFS(detail.imagehash)}
                            alt="Campaign"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                    ) : (
                        <span className="text-slate-600 text-xs font-semibold">No Image</span>
                    )}
                </div>

                <div className="p-6">

                    {/* Title (from DB) + Approved badge */}
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                {detail?.title ?? `Campaign #${campaignID}`}
                            </h3>
                            <p className="text-xs text-slate-400 font-mono">
                                {patient.slice(0, 6)}...{patient.slice(-4)}
                            </p>
                        </div>
                        <span className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border bg-emerald-500/20 border-emerald-500/30 text-emerald-300">
                            ✓ Approved
                        </span>
                    </div>

                    {/* Description (from DB) */}
                    {detail?.description && (
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                            {detail.description}
                        </p>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400 font-semibold">Progress</span>
                            <span className="text-cyan-400 font-bold">{progressPercent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Target & Raised (from contract) */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                            <div className="text-xs text-slate-500 mb-1 font-semibold">Target</div>
                            <div className="text-base font-bold text-white">{targetEth} HETH</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                            <div className="text-xs text-slate-500 mb-1 font-semibold">Raised</div>
                            <div className="text-base font-bold text-cyan-400">{raisedEth} HETH</div>
                        </div>
                    </div>

                    {/* Duration (from DB) */}
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 mb-5">
                        <div className="text-xs text-slate-500 mb-1 font-semibold">Duration</div>
                        <div className="text-sm font-bold text-white">
                            {detail?.duration ?? Number(duration)} days
                        </div>
                    </div>

                    {/* Create Milestone Claim Button */}
                    <Link
                        href={`/campaigns/MilestoneClaimFormCreation?campaignID=${campaignID}`}
                        className="block w-full text-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        Create Milestone Claim
                    </Link>
                </div>
            </div>
        </div>
    )
}

export function MyCampaign() 
{
    // Get all campaign IDs with status = 1 (Approved)
    const { data: approvedIDs } = useReadContract({
        address: campaignContractAddress as Address,
        abi: campaignAbi.abi,
        functionName: 'getCampaignIDs',
        args: [1]   // 1 = Approved
    })

    const campaignIDs = (approvedIDs as bigint[] | undefined) ?? []

    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000" />

            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 min-h-[500px]">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full" />
                            My Campaigns
                        </h1>
                        <p className="text-slate-400 text-sm">Manage and track your fundraising</p>
                    </div>
                    <Link
                        href="/campaigns/CampaignFormCreation"
                        className="inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-cyan-500/20"
                    >
                        <img src={AddIcon.src} alt="Add" className="w-6 h-6" />
                        <span>Create Campaign</span>
                    </Link>
                </div>

                {/* Empty State */}
                {campaignIDs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 animate-ping">
                                <div className="w-28 h-28 border-4 border-cyan-400/20 rounded-full" />
                            </div>
                            <div className="relative w-28 h-28 mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full animate-pulse" />
                                <div className="absolute inset-2 bg-slate-800/90 rounded-full flex items-center justify-center border border-slate-700/50">
                                    <img src={CampaignEmptyState.src} alt="Empty" className="w-12 h-12" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">No Approved Campaigns</h2>
                        <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                            Your campaigns are pending approval from a hospital representative
                        </p>
                        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                            {[{ icon: '🔒', text: 'Secure' }, { icon: '⚡', text: 'Fast' }, { icon: '✨', text: 'Control' }].map((f, i) => (
                                <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                                    <div className="text-2xl mb-2">{f.icon}</div>
                                    <div className="text-xs text-slate-400 font-medium">{f.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* One CampaignCard per approved ID — each fetches its own data */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {campaignIDs.map((id) => (
                            <CampaignCard key={Number(id)} campaignID={Number(id)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
