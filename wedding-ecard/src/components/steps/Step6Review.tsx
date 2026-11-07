import React, { useState } from 'react';
import { WeddingFormData } from '../../types';
import { TEMPLATES } from '../../data/sampleData';
import {
  CheckCircle2,
  Edit3,
  Calendar,
  MapPin,
  Heart,
  Users,
  Image as ImageIcon,
  Palette,
  Sparkles,
  ArrowRight,
  Clock,
  Smartphone,
  Monitor,
} from 'lucide-react';

interface Step6ReviewProps {
  data: WeddingFormData;
  onEditStep: (stepNumber: number) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const Step6Review: React.FC<Step6ReviewProps> = ({
  data,
  onEditStep,
  onGenerate,
  isGenerating = false,
}) => {
  const [previewDevice, setPreviewDevice] = useState<'phone' | 'desktop'>('phone');
  const selectedTheme =
    TEMPLATES.find((t) => t.id === data.selectedTemplate) || TEMPLATES[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
          <CheckCircle2 size={12} /> Step 6: Grand Finale Review
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Review Your Wedding Invitation
        </h2>
        <p className="text-gray-400 text-sm">
          Everything is set to perfection. Verify your details, preview the aesthetic, and generate your live wedding website.
        </p>
      </div>

      {/* Prominent Callout Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-red-brand/20 via-dark-850 to-blue-electric/20 border border-red-brand/40 shadow-glass-glow flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-leaf/20 border border-gold-leaf/40 text-gold-champagne text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} /> Ready for Publication
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {data.couple.groomName || 'Groom'} & {data.couple.brideName || 'Bride'}
          </h3>
          <p className="text-sm text-gray-300">
            Selected Theme:{' '}
            <span className="font-semibold text-gold-champagne">{selectedTheme.name}</span> •{' '}
            {data.events.length} Ceremonies • {data.gallery.length} Photos
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="btn-red-gradient px-8 py-4 rounded-2xl text-base font-bold text-white flex items-center gap-3 shadow-red-glow shrink-0 group cursor-pointer"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Crafting Your Website...
            </span>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-gold-champagne animate-pulse" />
              <span>Generate My Wedding Website</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>

      {/* Grid of Sections to Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Couple Details */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 relative">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-red-brand" />
              <h4 className="font-serif text-lg font-bold text-white">Couple Information</h4>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Edit3 size={13} /> Edit
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/15 bg-dark-900 shrink-0">
              {data.couple.groomPhoto ? (
                <img
                  src={data.couple.groomPhoto}
                  alt={data.couple.groomName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">🤵</div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Groom</p>
              <p className="text-base font-bold text-white">
                {data.couple.groomName || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/15 bg-dark-900 shrink-0">
              {data.couple.bridePhoto ? (
                <img
                  src={data.couple.bridePhoto}
                  alt={data.couple.brideName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">👰</div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Bride</p>
              <p className="text-base font-bold text-white">
                {data.couple.brideName || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[11px] text-gray-400 block font-medium">Wedding Date</span>
              <span className="text-xs font-bold text-white">
                {data.couple.weddingDate || 'TBD'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[11px] text-gray-400 block font-medium">Muhurat Time</span>
              <span className="text-xs font-bold text-white">
                {data.couple.weddingTime || 'TBD'}
              </span>
            </div>
          </div>

          {data.couple.loveStory && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-300 italic leading-relaxed">
              "{data.couple.loveStory}"
            </div>
          )}
        </div>

        {/* Section 2: Selected Design Theme */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Palette className="w-5 h-5 text-gold-leaf" />
                <h4 className="font-serif text-lg font-bold text-white">Chosen Aesthetic</h4>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(5)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Edit3 size={13} /> Change
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mt-4 border border-white/15">
              <img
                src={selectedTheme.previewImage}
                alt={selectedTheme.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent p-4 flex flex-col justify-end">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gold-champagne">
                  {selectedTheme.badge}
                </span>
                <h5 className="font-serif text-xl font-bold text-white">{selectedTheme.name}</h5>
                <p className="text-xs text-red-glow font-medium">{selectedTheme.tagline}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
            <span className="text-gray-400">Palette Accents:</span>
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: selectedTheme.primaryColor }}
              />
              <span
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: selectedTheme.accentColor }}
              />
              <span className="text-gray-300 font-mono text-[11px]">
                {selectedTheme.primaryColor}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Wedding Ceremonies & Itinerary */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-red-brand" />
              <h4 className="font-serif text-lg font-bold text-white">
                Events & Ceremonies ({data.events.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Edit3 size={13} /> Edit
            </button>
          </div>

          <div className="space-y-3">
            {data.events.map((evt, i) => (
              <div
                key={evt.id || i}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-white">{evt.name}</span>
                  <span className="text-xs text-red-glow font-medium">{evt.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin size={12} className="text-red-brand shrink-0" />
                  <span className="truncate">{evt.venue || 'Venue TBD'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Family & Gallery Summary */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-blue-electric" />
                <h4 className="font-serif text-lg font-bold text-white">Family & Gallery</h4>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Edit3 size={13} /> Edit
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-gray-400 font-medium">Groom's Parents</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {data.family.groomFather || 'Father'} & {data.family.groomMother || 'Mother'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-gray-400 font-medium">Bride's Parents</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {data.family.brideFather || 'Father'} & {data.family.brideMother || 'Mother'}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-gray-400">Total Gallery Photos:</span>
                <span className="font-bold text-white font-mono">
                  {data.gallery.length} Photos Uploaded
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full btn-red-gradient py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-red-glow"
            >
              <Sparkles size={16} className="text-gold-champagne" />
              <span>Generate Wedding Website</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

