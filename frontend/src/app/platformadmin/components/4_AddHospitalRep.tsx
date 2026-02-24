'use client'
import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address, isAddress } from 'viem'
import { print } from '@/utils/toast'
import rolesAbi from '@/abi/MediTrustRoles.json'
import { rolesContractAddress } from '@/utils/smartContractAddress'
import { Admin_AddHospitalReps } from '@/app/images'


export function AddHospitalRep() {
    const [address, setAddress] = useState('')
    const [hospitalName, setHospitalName] = useState('')

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
            functionName: 'addHospitalRep',
            args: [address as Address]
        })
    }

    if (isSuccess) {
        print('Hospital Representative added successfully!', 'success')
        setAddress('')
        setHospitalName('')
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            
            {/* Add Hospital Representative */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <img src={Admin_AddHospitalReps.src} alt="Admin_AddHospitalReps Icon" className="w-5 h-5"/>
                </div>
                <h3 className="text-xl font-bold text-white">Add Hospital Representative</h3>
            </div>

             {/* Input Field 1 : Hospital Name */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Hospital Name
                    </label>
                    <input
                        type="text"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                        placeholder="e.g., City General Hospital"
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
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                        placeholder="0x..."
                        required
                    />
                </div>

                {/* Add Hospital Representative Button */}
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/30"
                >
                    {isPending ? 'Adding...' : 'Add Hospital Rep'}
                </button>
            </form>
        </div>
    )
}