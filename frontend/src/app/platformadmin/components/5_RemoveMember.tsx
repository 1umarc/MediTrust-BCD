'use client'
import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address, isAddress } from 'viem'
import { print } from '@/utils/toast'
import rolesAbi from '@/abi/MediTrustRoles.json'
import { rolesContractAddress } from '@/utils/smartContractAddress'
import { Admin_RemoveUsers, Admin_Caution } from '@/app/images'

type MemberType = 'dao' | 'hospital'

interface RemoveMemberProps {
    type: MemberType
}

export function RemoveMember({ type }: RemoveMemberProps) {
    const [address, setAddress] = useState('')

    const { data: hash, writeContract, isPending } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!isAddress(address)) {
            print('Invalid Ethereum address', 'error')
            return
        }

        const functionName = type === 'dao' ? 'removeDAOMember' : 'removeHospitalRep'
        
        writeContract({
            address: rolesContractAddress as Address,
            abi: rolesAbi.abi,
            functionName,
            args: [address as Address]
        })
    }

    if (isSuccess) {
        const memberTypeName = type === 'dao' ? 'DAO Member' : 'Hospital Representative'
        print(`${memberTypeName} removed successfully!`, 'success')
        setAddress('')
    }

    const config = type === 'dao' ? {
        title: 'Remove DAO Member',
        gradient: 'from-red-500 to-pink-600',
        icon: (<img src={Admin_RemoveUsers.src} alt="Admin Remove Users Icon" className="w-4 h-4" />)
    } : {
        title: 'Remove Hospital Rep',
        gradient: 'from-orange-500 to-red-600',
        icon: (<img src={Admin_RemoveUsers.src} alt="Admin Remove Users Icon" className="w-4 h-4" />)
    }

    return (

        <div className="bg-slate-900/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">

            <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center`}>
                    {config.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{config.title}</h3>
            </div>

            {/* Remove DAO member & Hospital Representative */}
            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Wallet Address to Remove
                    </label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                        placeholder="0x..."
                        required
                    />
                </div>

                {/* Warning */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex gap-3">
                        <img src={Admin_Caution.src} alt="Admin Caution Icon" className="w-5 h-5" />
                        <p className="text-sm text-red-300">
                            <span className="font-bold">Warning:</span> This action will immediately revoke all permissions. Make sure you have the correct address.
                        </p>
                    </div>
                </div>

                {/* Remove Member Button */}
                <button
                    type="submit"
                    disabled={isPending}
                    className={`w-full px-6 py-3 bg-gradient-to-r ${config.gradient} text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-red-500/30`}
                >
                    {isPending ? 'Removing...' : 'Remove Member'}
                </button>

            </form>

        </div>
    )
}