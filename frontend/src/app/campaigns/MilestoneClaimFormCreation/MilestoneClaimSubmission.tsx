'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CampaignSubmissionSuccess {
    formData: {
        CampaignDescription: string
        MilestoneClaim: File | null
        TargetAmount: string
    }
}

export function MilestoneClaimSubmission({ formData = { CampaignDescription: '', MilestoneClaim: null, TargetAmount: '' } }: CampaignSubmissionSuccess) {
    const [mounted, setMounted] = useState(false)
    const [checkVisible, setCheckVisible] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const [stepsVisible, setStepsVisible] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Staggered reveal sequence
        setTimeout(() => setCheckVisible(true), 100)
        setTimeout(() => setContentVisible(true), 600)
        setTimeout(() => setStepsVisible(true), 1000)
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16">

            {/* Ambient background glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px]" />
            </div>

            <div className="relative w-full max-w-2xl">

                {/* ── Animated checkmark ring ─────────────────────────────── */}
                <div className={`flex justify-center mb-10 transition-all duration-700 ${checkVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    <div className="relative">
                        {/* Outer pulse ring */}
                        <div className={`absolute inset-0 rounded-full bg-emerald-500/20 ${mounted ? 'animate-ping' : ''}`} style={{ animationDuration: '2s' }} />
                        {/* Mid ring */}
                        <div className="absolute -inset-3 rounded-full border border-emerald-500/20" />
                        {/* Icon container */}
                        <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                            <svg
                                className={`w-12 h-12 text-white transition-all duration-500 delay-300 ${checkVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                                fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
                                    style={{
                                        strokeDasharray: 30,
                                        strokeDashoffset: checkVisible ? 0 : 30,
                                        transition: 'stroke-dashoffset 0.6s ease 0.5s'
                                    }}
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* ── Main card ───────────────────────────────────────────── */}
                <div className={`transition-all duration-700 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl blur opacity-20" />
                        <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-10">

                            {/* Title */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest mb-5">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                    Submitted Successfully
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                                    Your milestone claim is<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                                        under review
                                    </span>
                                </h1>
                                <p className="text-slate-400 text-base leading-relaxed max-w-md mx-auto">
                                    Your milestone claim has been submitted to the blockchain and is now awaiting hospital verification.
                                </p>
                            </div>

                            {/* Campaign summary pill row */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
                                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Description</div>
                                    <div className="text-white font-bold text-sm truncate">
                                        {formData.CampaignDescription || '—'}
                                    </div>
                                </div>
                                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
                                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Target</div>
                                    <div className="text-cyan-400 font-bold text-sm">
                                        {formData.TargetAmount ? `${formData.TargetAmount} HETH` : '—'}
                                    </div>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/campaigns"
                                    className="flex-1 text-center px-6 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-2xl font-bold hover:from-cyan-400 hover:to-purple-400 transition-all shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02]"
                                >
                                    Browse Campaigns →
                                </Link>
                                <Link
                                    href="/"
                                    className="flex-1 text-center px-6 py-3.5 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-2xl font-bold hover:bg-slate-700/80 hover:border-slate-600 transition-all"
                                >
                                    Back to Home
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}