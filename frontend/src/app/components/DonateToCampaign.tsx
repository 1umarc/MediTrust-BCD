'use client'
import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, Address } from 'viem'
import { print } from '@/utils/toast'
import fundsAbi from '@/abi/MediTrustFunds.json'
import { FUNDS_CONTRACT } from '@/utils/smartContractAddress'

interface DonateProps {
    campaignId: number
}

export function DonateToCampaign({ campaignId }: DonateProps) {
    const [amount, setAmount] = useState('')

    const { data: hash, writeContract } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    const handleDonate = () => {
        if (!amount || parseFloat(amount) <= 0) {
            print('Please enter a valid amount', 'error')
            return
        }

        writeContract({
            address: FUNDS_CONTRACT as Address,
            abi: fundsAbi.abi,
            functionName: 'donate',
            args: [campaignId],
            value: parseEther(amount)
        })
    }

    if (isSuccess) {
        print('Donation successful! Thank you for your contribution.', 'success')
        setAmount('')
    }

    return (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-4">Make a Donation</h3>
            <div className="flex gap-3">
                <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount in ETH"
                    className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                    onClick={handleDonate}
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                    Donate
                </button>
            </div>
        </div>
    )
}