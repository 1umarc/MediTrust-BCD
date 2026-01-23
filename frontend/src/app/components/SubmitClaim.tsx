'use client'
import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, Address } from 'viem'
import { print } from '@/utils/toast'
import daoAbi from '@/abi/MediTrustDAO.json'
import { DAO_CONTRACT } from '@/utils/smartContractAddress'

interface SubmitClaimProps {
    campaignId: number
}

export function SubmitClaim({ campaignId }: SubmitClaimProps) {
    const [amount, setAmount] = useState('')
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
            print('Please upload proof documents', 'error')
            return
        }

        try {
            setUploading(true)
            const ipfsHash = await uploadToIPFS(file)
            
            writeContract({
                address: DAO_CONTRACT as Address,
                abi: daoAbi.abi,
                functionName: 'submitClaim',
                args: [campaignId, parseEther(amount), ipfsHash]
            })
        } catch (error) {
            print('Error submitting claim', 'error')
        } finally {
            setUploading(false)
        }
    }

    if (isSuccess) {
        print('Claim submitted for DAO review', 'success')
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Submit Milestone Claim</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Claim Amount (ETH)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Proof Documents (PDF)</label>
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
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                >
                    {uploading ? 'Uploading...' : 'Submit Claim'}
                </button>
            </form>
        </div>
    )
}