'use client'
import { useEffect, useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, Address } from 'viem'
import { useSearchParams } from 'next/navigation'
import { print } from '@/utils/toast'
import daoAbi from '@/abi/MediTrustDAO.json'
import { DAOContractAddress } from '@/utils/smartContractAddress'
import { MilestoneClaimSubmission } from './MilestoneClaimSubmission' 
import { saveToIPFS } from '@/utils/ipfsconfig'
import { saveToDB } from '@/utils/dbconfig'

interface MilestoneClaimFormData 
{
    MilestoneClaimDescription: string
    Invoice: File | null
    TargetAmount: string
}

export function CreateMilestoneClaimForm() 
{
    // campaignID comes from URL: ?campaignID=X  (set by MyCampaign.tsx)
    const searchParams = useSearchParams()
    const campaignID = searchParams.get('campaignID')

    const [uploading, setUploading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const [formData, setFormData] = useState<MilestoneClaimFormData>
    ({
        MilestoneClaimDescription: '',
        Invoice: null,
        TargetAmount: ''
    })

    // Read current claimCount from contract BEFORE submitting
    // The contract does claimCount++ when submitMilestoneClaim is called
    // So the claimID that will be assigned = current claimCount value
    const { data: claimCount } = useReadContract
    ({
        address: DAOContractAddress as Address,
        abi: daoAbi.abi,
        functionName: 'claimCount'
    })

    const nextClaimID = Number(claimCount ?? 0)

    const { data: hash, writeContract } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    const updateFormData = (field: keyof MilestoneClaimFormData, value: any) => 
    {
        setFormData(prev => 
        ({ 
            ...prev, 
            [field]: value ,
        }))
    }

    const handleSubmit = async () => 
    {
        try 
        {
            setUploading(true)

            // Validate campaignID from URL
            if (!campaignID) 
            {
                print('Error: Campaign ID not found', 'error')
                return
            }

            // Step 1: Upload invoice PDF → IPFS, returns CID hash
            const invoiceHash = await saveToIPFS(formData.Invoice)

            // Step 2: Save claimID + campaignID + description to DB (off-chain)
            const saved = await saveToDB("milestoneclaimdetails", 
            {
                claimid: nextClaimID,
                campaignid: Number(campaignID),
                description: formData.MilestoneClaimDescription,
            })

            console.log("Invoice IPFS CID:", invoiceHash)
            console.log("Saved to DB:", saved.record)

            // Step 3: Call submitMilestoneClaim on DAO contract 
            writeContract
            ({
                address: DAOContractAddress as Address,
                abi: daoAbi.abi,
                functionName: 'submitMilestoneClaim',
                args: 
                [
                    Number(campaignID),                 // uint256 campaignID
                    parseEther(formData.TargetAmount),  // uint256 amount (wei)
                    invoiceHash                         // string invoiceHash (IPFS CID)
                ]
            })

        } catch (error) 
        {
            print('Error submitting milestone claim', 'error')
        } finally 
        {
            setUploading(false)
        }
    }

    useEffect(() => {
        if (isSuccess) {
            print('Milestone claim submitted successfully!', 'success')
            setSubmitted(true)
        }
    }, [isSuccess])

    if (submitted) {
        return (
            <MilestoneClaimSubmission
                formData={{
                    TargetAmount: formData.TargetAmount,
                    CampaignDescription: formData.MilestoneClaimDescription,
                    MilestoneClaim: formData.Invoice
                }}
            />
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
                <div className="space-y-6">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Milestone Claim Form</h1>
                    </div>

                    {/* Milestone Claim Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Milestone Claim Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={formData.MilestoneClaimDescription}
                            onChange={(e) => updateFormData('MilestoneClaimDescription', e.target.value)}
                            rows={6}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none"
                            placeholder="Describe the milestone and what the funds will be used for..."
                            required
                        />
                        <div className="mt-1 text-xs text-slate-500 text-right">
                            {formData.MilestoneClaimDescription.length} / 1000 characters
                        </div>
                    </div>

                    {/* Milestone Claim Target Amount → saved to smart contract */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Milestone Claim Target (HETH) <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                value={formData.TargetAmount}
                                onChange={(e) => updateFormData('TargetAmount', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                                placeholder="0.00"
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">HETH</span>
                        </div>
                    </div>

                    {/* Invoice Upload → saved to IPFS */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Invoice (PDF) <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => updateFormData('Invoice', e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white file:font-semibold hover:file:bg-cyan-600 cursor-pointer"
                            required
                        />
                        {formData.Invoice && (
                            <p className="mt-2 text-xs text-emerald-400">✓ {formData.Invoice.name}</p>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={uploading}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {uploading ? 'Submitting...' : 'Submit Milestone Claim'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
