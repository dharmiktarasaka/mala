import React from 'react';
import { Sparkles, Save, RotateCcw, Heart, Eye } from 'lucide-react';

interface NavbarProps {
  currentStep: number;
  totalSteps: number;
  lastSavedText: string;
  onLoadSample: () => void;
  onReset: () => void;
  onOpenPreview: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  totalSteps,
  lastSavedText,
  onLoadSample,
  onReset,
  onOpenPreview,
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-dark-900/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Studio Logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-brand via-red-deep to-dark-900 p-0.5 shadow-red-glow">
              <div className="w-full h-full rounded-[14px] bg-dark-900 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-brand fill-red-brand/20 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            {/* Ambient Blue Accent Light */}
            <div className="absolute -inset-1 bg-blue-electric/20 rounded-2xl blur-lg -z-10 group-hover:bg-blue-electric/40 transition-all duration-500" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-white">
                AURA
              </span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-brand/10 border border-red-brand/30 text-red-glow font-semibold">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-sans tracking-wide hidden sm:block">
              Haute Couture Wedding E-Card Builder
            </p>
          </div>
        </div>

        {/* Center Progress Pill (Desktop) */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs">
          <span className="text-gray-400">Creation Journey:</span>
          <span className="font-semibold text-white">
            Step {currentStep} of {totalSteps}
          </span>
          <div className="w-20 h-1.5 bg-dark-750 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-brand to-blue-electric rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-red-glow font-bold text-[11px]">{percentage}%</span>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Auto-saved pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <Save size={12} />
            <span>{lastSavedText || 'Auto-saved'}</span>
          </div>

          {/* Quick Preview Button */}
          <button
            type="button"
            onClick={onOpenPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-gray-200 transition-all"
            title="Interactive Live E-Card Preview"
          >
            <Eye size={14} className="text-blue-electric" />
            <span className="hidden sm:inline">Live Preview</span>
          </button>

          {/* Load Demo Data Button */}
          <button
            type="button"
            onClick={onLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-red-brand/15 to-blue-electric/15 hover:from-red-brand/25 hover:to-blue-electric/25 border border-red-brand/30 text-xs font-semibold text-white transition-all shadow-sm"
            title="Prefill realistic couple and wedding ceremonies"
          >
            <Sparkles size={14} className="text-red-glow animate-pulse" />
            <span className="hidden sm:inline">Load Sample Couple</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] hover:bg-red-500/10 hover:border-red-500/30 border border-white/10 text-gray-400 hover:text-red-400 text-xs transition-colors"
            title="Reset form"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};

