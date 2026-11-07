import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { ProgressWizard, STEPS } from './components/ProgressWizard';
import { Step1Couple } from './components/steps/Step1Couple';
import { Step2Events } from './components/steps/Step2Events';
import { Step3Family } from './components/steps/Step3Family';
import { Step4Gallery } from './components/steps/Step4Gallery';
import { Step5Design } from './components/steps/Step5Design';
import { Step6Review } from './components/steps/Step6Review';
import { LiveECardModal } from './components/LiveECardModal';
import { GeneratedSuccessModal } from './components/GeneratedSuccessModal';
import { WeddingFormData, TemplateTheme } from './types';
import { INITIAL_FORM_DATA, SAMPLE_PREFILLED_DATA, TEMPLATES } from './data/sampleData';
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';

const STORAGE_KEY = 'AURA_WEDDING_FORM_DATA';

export function App() {
  // Initialize state with LocalStorage fallback
  const [formData, setFormData] = useState<WeddingFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    // Default to rich prefilled sample data for an immediate breathtaking experience
    return SAMPLE_PREFILLED_DATA;
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2, 3, 4, 5]);
  const [lastSavedText, setLastSavedText] = useState<string>('Auto-saved just now');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState<boolean>(false);

  // Auto-save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      const now = new Date();
      setLastSavedText(
        `Auto-saved at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      );
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }, [formData]);

  // Validation function per step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.couple.groomName.trim()) {
        newErrors.groomName = 'Groom name is required';
      }
      if (!formData.couple.brideName.trim()) {
        newErrors.brideName = 'Bride name is required';
      }
      if (!formData.couple.weddingDate) {
        newErrors.weddingDate = 'Wedding date is required';
      }
      if (!formData.couple.weddingTime?.trim()) {
        newErrors.weddingTime = 'Ceremony time is required';
      }
    } else if (step === 2) {
      if (formData.events.length === 0) {
        newErrors.events = 'Please add at least one wedding ceremony';
      }
    } else if (step === 3) {
      // Family is optional or soft validation
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
      handleGenerate();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleStepJump = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleLoadSample = () => {
    if (window.confirm('Load sample luxury couple data (Arjun & Ananya)?')) {
      setFormData(SAMPLE_PREFILLED_DATA);
      setCompletedSteps([1, 2, 3, 4, 5]);
      setErrors({});
    }
  };

  const handleReset = () => {
    if (window.confirm('Clear all form progress and start fresh?')) {
      setFormData(INITIAL_FORM_DATA);
      setCompletedSteps([]);
      setCurrentStep(1);
      setErrors({});
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowSuccessModal(true);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-[#080808] text-gray-100 flex flex-col overflow-x-hidden selection:bg-red-brand selection:text-white">
      {/* Background Ambient Electric Blue & Deep Red Light Accents */}
      <div className="ambient-glow-red top-[-100px] left-[-150px] w-[550px] h-[550px]" />
      <div className="ambient-glow-blue top-[250px] right-[-180px] w-[650px] h-[650px]" />
      <div className="ambient-glow-red bottom-[100px] left-[10%] w-[500px] h-[500px] opacity-40" />

      {/* Top Studio Navbar */}
      <Navbar
        currentStep={currentStep}
        totalSteps={6}
        lastSavedText={lastSavedText}
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        onOpenPreview={() => setShowLivePreviewModal(true)}
      />

      {/* Hero Studio Banner */}
      <div className="text-center pt-8 pb-2 px-4 relative z-10">
        <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-gold-champagne block mb-2 font-medium">
          Haute Couture E-Card Architecture
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-white tracking-tight">
          Craft Your Bespoke Wedding E-Card
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto font-sans leading-relaxed">
          An opulent digital invitation experience combining timeless royal tradition, midnight noir aesthetics, and modern celebration storytelling.
        </p>
      </div>

      {/* Multi-Step Progress Wizard */}
      <ProgressWizard
        currentStep={currentStep}
        onStepClick={handleStepJump}
        completedSteps={completedSteps}
      />

      {/* Form Steps Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pb-24 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            {currentStep === 1 && (
              <Step1Couple
                data={formData.couple}
                onChange={(fields) =>
                  setFormData((prev) => ({
                    ...prev,
                    couple: { ...prev.couple, ...fields },
                  }))
                }
                errors={errors}
              />
            )}

            {currentStep === 2 && (
              <Step2Events
                events={formData.events}
                onChange={(events) =>
                  setFormData((prev) => ({ ...prev, events }))
                }
                errors={errors}
              />
            )}

            {currentStep === 3 && (
              <Step3Family
                data={formData.family}
                onChange={(fields) =>
                  setFormData((prev) => ({
                    ...prev,
                    family: { ...prev.family, ...fields },
                  }))
                }
                errors={errors}
              />
            )}

            {currentStep === 4 && (
              <Step4Gallery
                gallery={formData.gallery}
                onChange={(gallery) =>
                  setFormData((prev) => ({ ...prev, gallery }))
                }
                errors={errors}
              />
            )}

            {currentStep === 5 && (
              <Step5Design
                selectedTemplate={formData.selectedTemplate}
                onSelectTemplate={(templateId) =>
                  setFormData((prev) => ({
                    ...prev,
                    selectedTemplate: templateId,
                  }))
                }
                onPreviewTemplate={(template) => {
                  setFormData((prev) => ({
                    ...prev,
                    selectedTemplate: template.id,
                  }));
                  setShowLivePreviewModal(true);
                }}
              />
            )}

            {currentStep === 6 && (
              <Step6Review
                data={formData}
                onEditStep={handleStepJump}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Step Navigation Controls */}
        <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
          {/* Previous Button */}
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-sm font-semibold text-gray-200 hover:text-white flex items-center gap-2 transition-all"
            >
              <ArrowLeft size={16} />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {/* Quick Step Indicators */}
          <div className="hidden sm:flex items-center gap-2">
            {STEPS.map((s) => (
              <button
                key={s.number}
                type="button"
                onClick={() => handleStepJump(s.number)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentStep === s.number
                    ? 'w-8 bg-gradient-to-r from-red-brand to-blue-electric'
                    : completedSteps.includes(s.number)
                    ? 'bg-emerald-500/60'
                    : 'bg-white/15'
                }`}
                title={`Jump to ${s.title}`}
              />
            ))}
          </div>

          {/* Next / Generate Button */}
          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-red-gradient px-7 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2.5 shadow-red-glow"
            >
              <span>Continue to Step 0{currentStep + 1}</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-red-gradient px-8 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2.5 shadow-red-glow"
            >
              <Sparkles size={16} className="text-gold-champagne animate-pulse" />
              <span>Generate Wedding Website</span>
            </button>
          )}
        </div>
      </main>

      {/* Footer Studio Signature */}
      <footer className="w-full border-t border-white/[0.08] py-8 px-4 text-center bg-dark-950/80 backdrop-blur-md relative z-10">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-cinzel text-sm font-bold tracking-widest text-white">
            AURA WEDDING E-CARD STUDIO
          </p>
          <p className="text-xs text-gray-400">
            Timeless Luxury • 24K Gold Embellishments • Modern Digital RSVP & Guest Experience
          </p>
        </div>
      </footer>

      {/* Live Interactive E-Card Preview Modal */}
      <LiveECardModal
        isOpen={showLivePreviewModal}
        onClose={() => setShowLivePreviewModal(false)}
        data={formData}
      />

      {/* Generated Celebration Website Modal */}
      <GeneratedSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        data={formData}
        onViewLiveSite={() => {
          setShowSuccessModal(false);
          setShowLivePreviewModal(true);
        }}
      />
    </div>
  );
}

