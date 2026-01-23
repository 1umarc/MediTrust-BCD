'use client'
import React from 'react'
import Link from 'next/link'
import { Connect } from './Connect'
import { useAccount } from 'wagmi'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import rolesAbi from '@/abi/MediTrustRoles.json'
import { ROLES_CONTRACT } from '@/utils/smartContractAddress'

export function Header() {
    const { address } = useAccount()

    const { data: isHospitalRep } = useReadContract({
        address: ROLES_CONTRACT as Address,
        abi: rolesAbi.abi,
        functionName: 'isHospitalRep',
        args: address ? [address] : undefined
    })

    const { data: isDAOMember } = useReadContract({
        address: ROLES_CONTRACT as Address,
        abi: rolesAbi.abi,
        functionName: 'isDAOMember',
        args: address ? [address] : undefined
    })

    return (
        <header className='bg-white shadow-md'>
            <div className='container mx-auto px-4 py-4'>
                <div className='flex justify-between items-center'>
                    <Link href="/" className='flex items-center gap-2'>
                        <span className='text-2xl'>🩺</span>
                        <h1 className='text-xl font-bold text-gray-800'>Medi✙rust</h1>
                    </Link>
                    
                    <nav className='hidden md:flex gap-6 items-center'>
                        <Link href="/campaigns" className='text-gray-600 hover:text-blue-600 font-medium'>
                            Campaigns
                        </Link>
                        {isHospitalRep && (
                            <Link href="/hospital" className='text-gray-600 hover:text-blue-600 font-medium'>
                                Hospital Panel
                            </Link>
                        )}
                        {isDAOMember && (
                            <Link href="/dao" className='text-gray-600 hover:text-blue-600 font-medium'>
                                DAO Voting
                            </Link>
                        )}
                        <Connect />
                    </nav>

                    <div className='md:hidden'>
                        <Connect />
                    </div>
                </div>
            </div>
        </header>
    )
}