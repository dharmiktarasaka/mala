import React, { useState } from 'react';
import { TEMPLATES } from '../../data/sampleData';
import { Palette, CheckCircle2, Sparkles, Eye, ShieldCheck } from 'lucide-react';
import { TemplateTheme } from '../../types';

interface Step5DesignProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  onPreviewTemplate: (template: TemplateTheme) => void;
}

export const Step5Design: React.FC<Step5DesignProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onPreviewTemplate,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-brand/10 border border-red-brand/20 text-red-glow text-xs font-semibold uppercase tracking-widest">
          <Palette size={12} className="text-red-brand" /> Step 5: Studio Aesthetic
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Select Wedding Invitation Design
        </h2>
        <p className="text-gray-400 text-sm">
          Choose a handcrafted luxury aesthetic designed by couture wedding invitation masters.
        </p>
      </div>

      {/* Grid of 5 Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((tpl) => {
          const isSelected = selectedTemplate === tpl.id;

          return (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl.id)}
              className={`cursor-pointer rounded-3xl overflow-hidden transition-all duration-500 relative flex flex-col group border ${
                isSelected
                  ? 'border-red-brand bg-dark-850 shadow-red-glow ring-2 ring-red-brand/40 -translate-y-2'
                  : 'border-white/10 hover:border-white/20 bg-dark-900/80 hover:bg-dark-850 hover:-translate-y-1'
              } glass-panel`}
            >
              {/* Template Mockup Visual Hero */}
              <div className="relative aspect-[16/10] overflow-hidden bg-dark-950">
                <img
                  src={tpl.previewImage}
                  alt={tpl.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-gold-champagne uppercase tracking-wider">
                    {tpl.badge}
                  </span>
                </div>

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-brand text-white flex items-center justify-center shadow-lg shadow-red-brand/50">
                    <CheckCircle2 size={18} />
                  </div>
                )}

                {/* Color Swatches */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: tpl.primaryColor }}
                    title="Primary accent"
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: tpl.accentColor }}
                    title="Secondary accent"
                  />
                </div>
              </div>

              {/* Template Information Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-gold-champagne transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-red-glow font-medium mt-0.5">
                    {tpl.tagline}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {tpl.vibe}
                  </p>
                </div>

                {/* Feature Tags */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  {tpl.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-gray-300">
                      <Sparkles size={11} className="text-gold-leaf shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(tpl.id);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-brand text-white shadow-md shadow-red-brand/30'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] text-gray-200'
                    }`}
                  >
                    {isSelected ? '✓ Theme Selected' : 'Choose Theme'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewTemplate(tpl);
                    }}
                    className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-gray-300 hover:text-white transition-colors"
                    title="Preview Theme Mockup"
                  >
                    <Eye size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

