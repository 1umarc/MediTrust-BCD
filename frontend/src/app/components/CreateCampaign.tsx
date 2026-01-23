'use client'
import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, Address } from 'viem'
import { print } from '@/utils/toast'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'

export function CreateCampaign() {
    const [targetAmount, setTargetAmount] = useState('')
    const [duration, setDuration] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const { data: hash, writeContract } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    const uploadToIPFS = async (file: File): Promise<string> => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
            },
            body: formData
        })

        const data = await response.json()
        return data.IpfsHash
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!file) {
            print('Please upload medical documents', 'error')
            return
        }

        try {
            setUploading(true)
            const ipfsHash = await uploadToIPFS(file)
            
            writeContract({
                address: campaignContractAddress as Address,
                abi: campaignAbi.abi,
                functionName: 'createCampaign',
                args: [parseEther(targetAmount), parseInt(duration), ipfsHash]
            })
        } catch (error) {
            print('Error creating campaign', 'error')
        } finally {
            setUploading(false)
        }
    }

    if (isSuccess) {
        print('Campaign created successfully!', 'success')
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Create Medical Campaign</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Target Amount (ETH)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Duration (Days)</label>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Medical Documents (PDF)</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {uploading ? 'Uploading...' : 'Create Campaign'}
                </button>
            </form>
        </div>
    )
}
