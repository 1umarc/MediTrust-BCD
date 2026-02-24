'use client'
import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address, isAddress } from 'viem'
import { print } from '@/utils/toast'
import rolesAbi from '@/abi/MediTrustRoles.json'
import { rolesContractAddress } from '@/utils/smartContractAddress'
import { Admin_AddUsers } from '@/app/images'

export function AddDAOMember() {
    const [address, setAddress] = useState('')
    const [name, setName] = useState('')

    const { data: hash, writeContract, isPending } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!isAddress(address)) {
            print('Invalid Ethereum address', 'error')
            return
        }

        writeContract({
            address: rolesContractAddress as Address,
            abi: rolesAbi.abi,
            functionName: 'addDAOMember',
            args: [address as Address]
        })
    }

    if (isSuccess) {
        print('DAO Member added successfully!', 'success')
        setAddress('')
        setName('')
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">

            {/* Add DAO Member */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <img src={Admin_AddUsers.src} alt="Admin Add Users Icon" className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Add DAO Member</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Input Field 1 : Member Name */}
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Member Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                        placeholder="e.g., Dr. John Smith"
                        required
                    />
                </div>
                
                {/* Input Field 2 : Wallet Address */}
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Wallet Address
                    </label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                        placeholder="0x..."
                        required
                    />
                </div>

                {/* Add DAO member Button */}
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:from-purple-400 hover:to-pink-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/30"
                >
                    {isPending ? 'Adding...' : 'Add DAO Member'}
                </button>
            </form>
        </div>
    )
}