'use client'
import React from 'react'
import Link from 'next/link'
import { Connect } from './Connect'
import { useAccount } from 'wagmi'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import rolesAbi from '@/abi/MediTrustRoles.json'
import { rolesContractAddress } from '@/utils/smartContractAddress'
import { MediTrustLogo } from '@/app/images'

export function Header() {
    const { address } = useAccount()

    const { data: isHospitalRep } = useReadContract({
        address: rolesContractAddress as Address,
        abi: rolesAbi.abi,
        functionName: 'isHospitalRep',
        args: address ? [address] : undefined
    })

    const { data: isDAOMember } = useReadContract({
        address: rolesContractAddress as Address,
        abi: rolesAbi.abi,
        functionName: 'isDAOMember',
        args: address ? [address] : undefined
    })

    return (
        <header className='fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800'>
            <div className='container mx-auto px-6 py-4'>
                <div className='flex justify-between items-center'>
                    {/* Logo */}
                    <Link href="/" className='flex items-center gap-3 group'>
                        <div className='w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105'>
                            <img src={MediTrustLogo.src} alt="MediTrust Logo" className="w-6 h-6" />
                        </div>
                        <h1 className='text-2xl font-bold text-white'>
                            Medi<span className='text-cyan-400'>Trust</span>
                        </h1>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <nav className='hidden md:flex items-center gap-8'>
                        <NavLink href="/">Home</NavLink>
                        <NavLink href="/campaigns">Campaigns</NavLink>
                        <NavLink href="/profile">Profile</NavLink>
                        {isHospitalRep && <NavLink href="/hospital">Hospital Panel</NavLink>}
                        {isDAOMember && <NavLink href="/dao">DAO Voting</NavLink>}
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






// Reusable NavLink component
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link 
            href={href} 
            className='relative text-slate-300 hover:text-white font-medium transition-colors group'
        >
            {children}
            <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full' />
        </Link>
    )
}