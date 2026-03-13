'use client'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Connect } from './Connect'
import { useAccount ,useReadContract } from 'wagmi'
import { Address } from 'viem'
import rolesAbi from '@/abi/MediTrustRoles.json'
import { rolesContractAddress } from '@/utils/smartContractAddress'
import { MediTrustLogo } from '@/app/images'

export function Header() {
    const router = useRouter()
    const { address , isConnected } = useAccount()

    // Check if connected wallet is Hospital Representative
    const { data: isHospitalRep } = useReadContract({
        address: rolesContractAddress as Address,  // Contract address from .env
        abi: rolesAbi.abi,                         // Contract interface (ABI)
        functionName: 'isHospitalRep',             // Function to call in the contract
        args: address ? [address] : undefined      // User's wallet address
    })

     // Check if connected wallet is DAO Member
    const { data: isDAOMember } = useReadContract({
        address: rolesContractAddress as Address,
        abi: rolesAbi.abi,
        functionName: 'isDAOMember',
        args: address ? [address] : undefined
    })

    // Check if connected wallet is Platform Admin (contract owner)
    const { data: isPlatformAdmin } = useReadContract({
        address: rolesContractAddress as Address,
        abi: rolesAbi.abi,
        functionName: 'isPlatformAdmin',
        args: address ? [address] : undefined
    })

    // NEW CHANGES : Refreshing website to update the webpage based on user's role. If user is not connected or not platform admin, redirect to homepage.
    useEffect(() => {
        // Wait for loading to finish before redirecting
        if ((!isConnected || !isPlatformAdmin)) {
            router.replace('/')  // Redirect unauthorized users to home
        }
    }, [isPlatformAdmin, isConnected])
    
   
// Frontend Code 
return ( 
        <header className='fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800'>
            <div className='container mx-auto px-6 py-4'>
                <div className='flex justify-between items-center'>

                    {/* Insert a MediTrust Logo by linking to the homepage itself */}
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


                        {/* Hospital Representative - Only show if wallet is hospital rep */}
                        {!!isHospitalRep && (
                            <NavLink href="/hospitalrep">Hospital Panel</NavLink>
                        )}

                        {/* DAO Member - Only show if wallet is DAO member */}
                        {!!isDAOMember && (
                            <NavLink href="/dao">DAO Voting</NavLink>
                        )} 

                        {/* Platform Admin - Only show if wallet is contract owner */}
                        {!!isPlatformAdmin && (
                                <NavLink href="/platformadmin">Admin</NavLink>
                            )}
                        
                        <Connect />
                    </nav>

                     {/* md:hidden -> Hide the 'navigation link' and 'connect' button on medium screen and bigger */}
                    <nav className='md:hidden flex items-center gap-6'>
                        <NavLink href="/">Home</NavLink>
                        <NavLink href="/campaigns">Campaigns</NavLink>
                        <NavLink href="/profile">Profile</NavLink>
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