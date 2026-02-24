'use client'

import React from 'react'
import { useAccount } from 'wagmi'
import { CorrectGreen, RejectRed, Caution } from '@/app/images'

export default function CampaignGuideline4() {
  const { isConnected } = useAccount()

  // Define data in a const array
  const VerifiesGuideline = [
    {
      title: "Approve When:",
      icon: CorrectGreen.src,
      titleColor: "text-emerald-400",
      bulletColor: "text-emerald-400",
      items: 
      [
        "Medical diagnosis is from a legitimate healthcare provider",
        "Treatment plan is detailed and medically sound",
        "Cost estimates are reasonable for stated treatment",
        "Timeline is feasible for the medical condition",
        "All required documentation is complete and authentic"
      ]
    },
    {
      title: "Reject When:",
      icon: RejectRed.src,
      titleColor: "text-red-400",
      bulletColor: "text-red-400",
      items: 
      [
        "Medical documents appear fraudulent or altered",
        "Treatment plan is vague or lacks medical basis",
        "Requested amount is unreasonably high for treatment",
        "Timeline conflicts with medical reality",
        "Critical documentation is missing or incomplete"
      ]
    }
  ];

  return (
    <div className="mt-12 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
      <h1 className="text-xl font-bold text-white mb-6">Verification Guidelines</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Map through the const to generate the UI */}
        {VerifiesGuideline.map((section, index) => (
          <div key={index}>
            <h2 className={`font-bold mb-3 flex items-center gap-2 ${section.titleColor}`}>
              <img src={section.icon} alt={section.title} className="w-5 h-5" />
              {section.title}
            </h2>
            <ul className="space-y-2 text-sm text-slate-400">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2">
                  <span className={section.bulletColor}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Caution Box stays outside the loop since it's unique */}
      <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <div className="flex gap-3">
          <img src={Caution.src} alt="Caution Icon" className="w-5 h-5" />
          <p className="text-sm text-amber-200">
            <span className="font-bold">Important:</span> Your verification protects both donors and patients. If rejected, campaigns can be resubmitted with corrections. Always provide clear feedback in rejection reasons.
          </p>
        </div>
      </div>
    </div>
  )
}