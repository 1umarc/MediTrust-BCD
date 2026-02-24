'use client'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import rolesAbi from '@/abi/MediTrustRoles.json'
import { rolesContractAddress } from '@/utils/smartContractAddress'
import { CorrectMark, Caution } from '@/app/images'
import { title } from 'process'

export function VotingGuideline() {

    // Define data in a const array
    const VotingGuideline = 
    [
        {
            title : "Approve When:",
            icon : CorrectMark.src,
            items : 
            [
                "Medical documentation is authentic and complete",
                "Receipts match the claimed amount",
                "Treatment aligns with campaign purpose",
                "Milestone description is clear and accurate"
            ]
        },

        {
            title : "Reject When:",
            icon : CorrectMark.src,
            items : 
            [
                "Documentation appears fraudulent or altered",
                "Amounts don't match provided receiptsnt",
                "Expenses unrelated to campaign purpose",
                "Insufficient or missing proof documents"
            ]
        }
    ]

    return (
    <div className="mt-12 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">

        {/* Voting Guidelines - Title & Content */}
        <h1 className="text-xl font-bold text-white mb-6">Voting Guidelines</h1>
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <h2 className="font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <img src={VotingGuideline[0].icon} alt="Correct Icon" className="w-3 h-3" />
                    </div>
                    {VotingGuideline[0].title}
                </h2>
                <ul className="space-y-2 text-sm text-slate-400">
                    {/* Loop through all permissions -> generate 1 row per item */}
                    {VotingGuideline[0].items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        {item}
                    </li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <img src={VotingGuideline[1].icon} alt="Correct Icon" className="w-3 h-3" />
                    </div>
                    {VotingGuideline[1].title}
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                    {/* Loop through all permissions -> generate 1 row per item */}
                    {VotingGuideline[1].items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        {item}
                    </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Warning Message */}
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex gap-3">
                <img src={Caution.src} alt = "Caution Icon" className="w-5 h-5"/>
                <p className="text-sm text-amber-200">
                    <span className="font-bold">Remember:</span> 
                    Your vote helps protect donors and ensures funds reach legitimate medical needs. Take time to review all documentation carefully.
                </p>
            </div>
        </div>

    </div>
    
    )
}