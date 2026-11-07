import React from 'react';
import { Heart, Calendar, Users, Image as ImageIcon, Palette, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface StepDef {
  number: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

export const STEPS: StepDef[] = [
  {
    number: 1,
    title: 'Couple Info',
    subtitle: 'Groom, Bride & Story',
    icon: Heart,
  },
  {
    number: 2,
    title: 'Events',
    subtitle: 'Ceremonies & Venues',
    icon: Calendar,
  },
  {
    number: 3,
    title: 'Family',
    subtitle: 'Parents & Blessings',
    icon: Users,
  },
  {
    number: 4,
    title: 'Gallery',
    subtitle: 'Love Story Photos',
    icon: ImageIcon,
  },
  {
    number: 5,
    title: 'Design',
    subtitle: 'Luxury Theme Styles',
    icon: Palette,
  },
  {
    number: 6,
    title: 'Review',
    subtitle: 'Preview & Generate',
    icon: CheckCircle2,
  },
];

interface ProgressWizardProps {
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
  completedSteps: number[];
}

export const ProgressWizard: React.FC<ProgressWizardProps> = ({
  currentStep,
  onStepClick,
  completedSteps,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-8">
      {/* Step Pills Bar */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-white/10 shadow-glass relative overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="ambient-glow-red -top-12 -left-12 w-48 h-48 opacity-40" />
        <div className="ambient-glow-blue -bottom-12 -right-12 w-48 h-48 opacity-30" />

        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = completedSteps.includes(step.number);
            const isPast = step.number < currentStep || isCompleted;

            return (
              <React.Fragment key={step.number}>
                <button
                  type="button"
                  onClick={() => onStepClick(step.number)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 flex-shrink-0 text-left relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-red-brand/20 via-red-brand/10 to-blue-electric/10 border border-red-brand/50 shadow-red-glow'
                      : isCompleted
                      ? 'hover:bg-white/[0.04] border border-transparent'
                      : 'hover:bg-white/[0.02] border border-transparent opacity-60'
                  }`}
                >
                  {/* Step Icon Badge */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-red-brand to-red-deep text-white shadow-md shadow-red-brand/40 scale-105'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/[0.05] text-gray-400 border border-white/10 group-hover:text-white'
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>

                  {/* Step Details */}
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] tracking-wider uppercase font-semibold text-gray-400">
                        Step 0{step.number}
                      </span>
                    </div>
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isActive
                          ? 'text-white'
                          : isCompleted
                          ? 'text-gray-200'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeWizardStep"
                      className="absolute inset-0 rounded-xl border border-red-brand/40 pointer-events-none"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>

                {/* Arrow Connector between steps */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:flex items-center text-gray-600 px-1">
                    <ChevronRight size={14} className={isPast ? 'text-red-brand/60' : 'text-gray-700'} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

