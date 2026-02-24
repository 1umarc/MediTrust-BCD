'use client'
import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, Address } from 'viem'
import { print } from '@/utils/toast'
import campaignAbi from '@/abi/MediTrustCampaign.json'
import { campaignContractAddress } from '@/utils/smartContractAddress'

// Define the shape of the form data
interface CampaignFormData 
{
    CreatorName: string
    CampaignTitle: string
    CampaignDescription: string
    CampaignImage: File | null
    MedicalDiagnosis: File | null
    TreatmentQuotation: File | null
    TargetAmount: string
    CampaignDuration: string
    TermsAccepted: boolean
}

export function CreataCampaignForm() 
{
    const [currentStep, setCurrentStep] = useState(1)
    const [uploading, setUploading] = useState(false)

    // Form State - Modify 
    const [formData, setFormData] = useState<CampaignFormData>
    ({
        CreatorName: '',
        CampaignTitle: '',
        CampaignDescription: '',
        CampaignImage: null,
        MedicalDiagnosis: null,
        TreatmentQuotation: null,
        TargetAmount: '',
        CampaignDuration: '',
        TermsAccepted: false,
    })

    const { data: hash, writeContract } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({ hash })

    // Added - Modify
    const updateFormData = (field: keyof CampaignFormData, value: any) => 
    {
        setFormData(prevFormData => 
        ({
            ...prevFormData,
            [field]: value,
        }))
    }

    // Upload files to IPFS via Pinata - Modify 
    const uploadToIPFS = async (files: { [ key : string] : File | null }): 
    Promise<string> => 
    {
        const MetaData = 
        {
            CreatorName: formData.CreatorName,
            CampaignTitle: formData.CampaignTitle,
            CampaignDescription: formData.CampaignDescription,
            files: {}
        }

        return 'QmPlaceholderHashForCampaignMetadata'
    }
       

    //     const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', 
    //     {
    //         method: 'POST',
    //         headers: 
    //         {
    //             'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
    //         },
    //         body: formData
    //     })

    //     const data = await response.json()
    //     return data.IpfsHash
    // }}

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files) {
    //         setMedicalDocuments(Array.from(e.target.files))
    //     }
    // }

    const handleNextStep = () => 
    {
        if (currentStep === 1 )
        {
            if(!formData.CreatorName || !formData.CampaignTitle || !formData.CampaignDescription || !formData.CampaignImage || !formData.MedicalDiagnosis || !formData.TreatmentQuotation)
            {
                print('Please fill in all required fields', 'error')
                return
            }
        }

        if (currentStep === 2 )
        {
            if(!formData.TargetAmount || !formData.CampaignDuration || !formData.TermsAccepted)
            {
                print('Please fill in all required fields and accept terms', 'error')
                return
            }
        }
        setCurrentStep(prev => Math.min(prev + 1,3))
    }

    const prevStep = () =>
    {
        setCurrentStep(prev => Math.max(prev - 1,1))
    }

    const handleSubmit = async () => {
        try {
            setUploading(true)
            const ipfsHash = await uploadToIPFS
            ({
                campaignImage: formData.CampaignImage,
                medicalDiagnosis: formData.MedicalDiagnosis,
                treatmentQuotation: formData.TreatmentQuotation
            })
            
            writeContract
            ({
                address: campaignContractAddress as Address,
                abi: campaignAbi.abi,
                functionName: 'CreateCampaign',
                args: [parseEther(formData.TargetAmount), parseInt(formData.CampaignDuration), ipfsHash]
            })

        } catch (error) 

        {
            print('Error creating campaign', 'error')
        } finally 
        {
            setUploading(false)
        }
    }

    if (isSuccess)
    {
        print('Campaign created successfully!', 'success')
    }

  // Frontend Code
  return (
    <div className="max-w-4xl mx-auto">

      {/* Progress Steps - Basic Campaign Information, Funding & Preview*/}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  currentStep >= step /* If currentStep is active, make it blue,else make it dark */
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {currentStep > step ? ( /* If step is completed, show checkmark, else show the step number */
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="font-bold">{step}</span>
                  )}
                </div>
                <span className={`mt-2 text-sm font-semibold ${
                  currentStep >= step ? 'text-cyan-400' : 'text-slate-500'
                }`}>
                  {step === 1 ? 'Basic Info' : step === 2 ? 'Funding' : 'Preview'}
                </span>
              </div>
              {step < 3 && ( /* If step is completed, blue line, else grey line */
                <div className={`h-1 flex-1 mx-4 rounded-full transition-all ${
                  currentStep > step ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-700'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">

        {/* Step 1: Basic Campaign Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Basic Campaign Information</h2>
              <p className="text-slate-400">Tell us about your medical campaign</p>
            </div>
            
            {/* Input Fields 1 : Creator Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Creator Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.CreatorName}
                onChange={(e) => updateFormData('CreatorName', e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                placeholder= "Enter your full name" 
                required
              />
            </div>

            {/* Input Fields 2 : Campaign Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Campaign Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.CampaignTitle}
                onChange={(e) => updateFormData('CampaignTitle', e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                placeholder="e.g., Help Sarah Fight Cancer"
                required
              />
            </div>

            {/* Input Fields 3 : Campaign Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Campaign Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.CampaignDescription}
                onChange={(e) => updateFormData('CampaignDescription', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none"
                placeholder="Describe your medical situation and why you need support..."
                required
              />
              <div className="mt-1 text-xs text-slate-500 text-right">
                {formData.CampaignDescription.length} / 1000 characters
              </div>
            </div>

            {/* Input Fields 4 : Campaign Image */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Campaign Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updateFormData('CampaignImage', e.target.files?.[0] || null)}
                  className="hidden"
                  id="campaignImage"
                />
                <label
                  htmlFor="campaignImage"
                  className="flex items-center justify-center w-full px-4 py-8 bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-cyan-500/50 transition-all"
                >
                  <div className="text-center">
                      {/* TODO: remember to add icon at this line*/}
                    <p className="text-slate-400 text-sm">
                      {formData.CampaignImage ? formData.CampaignImage.name : 'Click to upload campaign image'}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Medical Title */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Medical Documentation <span className="text-red-400">*</span></h3>
              
              {/* Input Fields 5 : Medical Diagnosis */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Medical Diagnosis
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => updateFormData('MedicalDiagnosis', e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white file:font-semibold hover:file:bg-cyan-600 cursor-pointer"
                />
                {formData.MedicalDiagnosis && (
                  <p className="mt-2 text-xs text-emerald-400">✓ {formData.MedicalDiagnosis.name}</p>
                )}
              </div>

              {/* Input Fields 6 : Treatment Quotation */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Treatment Quotation
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => updateFormData('TreatmentQuotation', e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-white file:font-semibold hover:file:bg-cyan-600 cursor-pointer"
                />
                {formData.TreatmentQuotation && (
                  <p className="mt-2 text-xs text-emerald-400">✓ {formData.TreatmentQuotation.name}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Funding Target & Duration */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Funding Target & Duration</h2>
              <p className="text-slate-400">Set your fundraising goals</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Funding Target (HETH) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={formData.TargetAmount}
                  onChange={(e) => updateFormData('TargetAmount', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                  placeholder="0.00"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">HETH</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Enter the total amount you need to raise</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Campaign Duration <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-4 gap-3 mb-3">
                {[30, 60, 90, 120].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => updateFormData('CampaignDuration', days.toString())}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      formData.CampaignDuration === days.toString()
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-cyan-500/50'
                    }`}
                  >
                    {days} days
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={formData.CampaignDuration}
                onChange={(e) => updateFormData('CampaignDuration', e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                placeholder="Or enter custom duration (days)"
                required
              />
            </div>
            
            {/* Terms and Conditions */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Terms & Conditions</h3>
              <div className="space-y-3 text-sm text-slate-400 mb-4 max-h-48 overflow-y-auto">
                <p>• All campaigns must be verified by authorized hospital representatives before approval</p>
                <p>• Funds will be held in smart contract escrow until milestones are achieved</p>
                <p>• Medical documentation must be authentic and verifiable</p>
                <p>• Campaign creators are responsible for providing accurate information</p>
                <p>• Misuse of funds or false information may result in campaign suspension</p>
                <p>• DAO members will vote on milestone claim approvals</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.TermsAccepted}
                  onChange={(e) => updateFormData('TermsAccepted', e.target.checked)}
                  className="mt-1 w-5 h-5 bg-slate-800 border-slate-700 rounded text-cyan-500 focus:ring-cyan-500"
                  required
                />
                <span className="text-sm text-slate-300">
                  I accept the terms and conditions and confirm that all information provided is accurate <span className="text-red-400">*</span>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Campaign Preview */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Campaign Preview</h2>
              <p className="text-slate-400">Review your campaign before submission</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-6">
              {/* Basic Campaign Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Creator Name:</span>
                    <span className="text-white font-semibold">{formData.CreatorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Campaign Title:</span>
                    <span className="text-white font-semibold">{formData.CampaignTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-2">Description:</span>
                    <p className="text-white text-sm bg-slate-900/50 p-4 rounded-lg">{formData.CampaignDescription}</p>
                  </div>
                </div>
              </div>

              {/* Funding Details */}
              <div className="border-t border-slate-700/50 pt-6">
                <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Funding Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
                    <div className="text-slate-400 text-xs mb-1">Target Amount</div>
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                      HETH {formData.TargetAmount} 
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="text-slate-400 text-xs mb-1">Duration</div>
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                      {formData.CampaignDuration} days
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="border-t border-slate-700/50 pt-6">
                <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Uploaded Documents</h3>
                <div className="space-y-2">
                  {formData.CampaignImage && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-300">Campaign Image: {formData.CampaignImage.name}</span>
                    </div>
                  )}
                  {formData.MedicalDiagnosis && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-300">Medical Diagnosis: {formData.MedicalDiagnosis.name}</span>
                    </div>
                  )}
                  {formData.TreatmentQuotation && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-300">Treatment Quotation: {formData.TreatmentQuotation.name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Verification Required */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-amber-200">
                    <p className="font-semibold mb-1">Verification Required</p>
                    <p className="text-amber-300/80">Your campaign will be reviewed by hospital representatives before it goes live. This process may take 24-48 hours.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Back
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
            >
              {uploading ? 'Submitting...' : 'Submit Campaign'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}