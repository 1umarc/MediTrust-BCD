'use client'
import { useEffect, useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, Address } from 'viem'
import { useSearchParams } from 'next/navigation'
import { print } from '@/utils/toast'
import daoAbi from '@/abi/MediTrustDAO.json'
import { DAOContractAddress } from '@/utils/smartContractAddress'
import { MilestoneClaimSubmission } from './MilestoneClaimSubmission' 
import { saveToIPFS } from '@/utils/ipfsconfig'
import { saveToDB } from '@/utils/dbconfig'

// Define the shape of the form data
interface MilestoneClaimFormData 
{
    MilestoneClaimDescription: string
    Invoice : File | null
    TargetAmount: string
}

export function CreateMilestoneClaimForm() 
{
    const searchParams = useSearchParams()
    const claimid = searchParams.get('claimid')

    const [uploading, setUploading] = useState(false)
    const [submitted, setSubmitted] = useState(false) 
    

    // Form State - Modify 
    const [formData, setFormData] = useState<MilestoneClaimFormData >
    ({
        MilestoneClaimDescription: '',
        Invoice: null,
        TargetAmount: ''
    })

    const { data: hash, writeContract } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    const updateFormData = (field: keyof MilestoneClaimFormData , value: any) => 
    {
        setFormData(prevFormData => 
        ({
            ...prevFormData,
            [field]: value,
        }))
    }

    const handleSubmit = async () => 
    {
        try 
        {
          setUploading(true)
          
          // Validate claim ID from URL query param
          if (!claimid) 
          {
              print('Error: claim ID not found', 'error')
              return
          }

          // Step 1: Upload invoice PDF to IPFS, get back CID hash
          const invoiceHash = await saveToIPFS(formData.Invoice)
          console.log("Invoice IPFS CID:", invoiceHash)

          // Step 2: Save off-chain data to DB (reduces gas costs)
          const saved = await saveToDB("milestoneclaimdetails", 
          {   
              claimid : 4000,
              campaignid : 4000,
              description: formData.MilestoneClaimDescription,
          })

          console.log("Saved record:", saved.record)

          // Step 3: Call submitMilestoneClaim(campaignID, amount, invoiceHash) on DAO contract
          writeContract
          ({
              address: DAOContractAddress as Address,
              abi: daoAbi.abi,
              functionName: 'submitMilestoneClaim',
              args: [
                  Number(claimid),           // uint256 claimID
                  parseEther(formData.TargetAmount), // uint256 amount (in wei)
                  invoiceHash                   // string invoiceHash (IPFS CID)
              ]
          })

        } catch (error) 

        {
            print('Error creating campaign', 'error')
        } finally 
        {
            setUploading(false)
        }
    }

    useEffect(() => 
    {
      if (isSuccess) 
      {
        print('Campaign created successfully!', 'success')
        setSubmitted(true)
      }
    }, [isSuccess])

    if (submitted) 
    {
      return ( 
        <MilestoneClaimSubmission 
          formData=
          {{
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
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Milestone Claim Form</h1>
                        {/* TODO: is the claim id needed??? */}
                        {claimid && (
                            <p className="text-slate-400 text-sm">Claim ID <span className="text-cyan-400 font-semibold">#{claimid}</span></p>
                        )}
                    </div>

                    {/* Campaign Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Campaign Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={formData.MilestoneClaimDescription}
                            onChange={(e) => updateFormData('MilestoneClaimDescription', e.target.value)}
                            rows={6}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none"
                            placeholder="Describe your medical situation and why you need support..."
                            required
                        />
                        <div className="mt-1 text-xs text-slate-500 text-right">
                            {formData.MilestoneClaimDescription.length} / 1000 characters
                        </div>
                    </div>

                    {/* Milestone Claim Target */}
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
                        <p className="mt-2 text-xs text-slate-500">Enter the total amount you target for this milestone claim.</p>
                    </div>

                    {/* Invoice Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Invoice <span className="text-red-400">*</span>
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
