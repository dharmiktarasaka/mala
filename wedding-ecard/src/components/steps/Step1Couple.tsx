import React from 'react';
import { CoupleInfo } from '../../types';
import { ImageUploader } from '../ImageUploader';
import { Heart, Calendar, Clock, Sparkles, Hash, BookOpen } from 'lucide-react';

interface Step1CoupleProps {
  data: CoupleInfo;
  onChange: (fields: Partial<CoupleInfo>) => void;
  errors?: Record<string, string>;
}

export const Step1Couple: React.FC<Step1CoupleProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const groomInitial = data.groomName ? data.groomName.charAt(0).toUpperCase() : 'G';
  const brideInitial = data.brideName ? data.brideName.charAt(0).toUpperCase() : 'B';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Step Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-brand/10 border border-red-brand/20 text-red-glow text-xs font-semibold uppercase tracking-widest">
          <Heart size={12} className="fill-red-brand" /> Step 1: The Sacred Union
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Celebrate the Bride & Groom
        </h2>
        <p className="text-gray-400 text-sm">
          Introduce the radiant couple whose love story will grace this luxury wedding invitation.
        </p>
      </div>

      {/* Couple Monogram Badge */}
      <div className="flex justify-center">
        <div className="relative p-1 rounded-3xl bg-gradient-to-r from-red-brand/40 via-gold-leaf/40 to-blue-electric/40 shadow-glass">
          <div className="px-6 py-3 rounded-[22px] bg-dark-900/90 backdrop-blur-xl flex items-center gap-4">
            <span className="font-serif text-2xl font-bold text-gold-champagne">{groomInitial}</span>
            <div className="w-2 h-2 rounded-full bg-red-brand animate-pulse" />
            <Heart size={18} className="text-red-brand fill-red-brand" />
            <div className="w-2 h-2 rounded-full bg-blue-electric animate-pulse" />
            <span className="font-serif text-2xl font-bold text-gold-champagne">{brideInitial}</span>
          </div>
        </div>
      </div>

      {/* Groom & Bride Two-Column Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Groom Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-electric/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-electric/20 border border-blue-electric/30 flex items-center justify-center text-blue-glow font-bold text-xs">
                🤵
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">The Groom</h3>
                <p className="text-[11px] text-gray-400">Groom's personal profile</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-gray-300 border border-white/10 font-mono">
              01
            </span>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
              Groom Full Name *
            </label>
            <input
              type="text"
              value={data.groomName}
              onChange={(e) => onChange({ groomName: e.target.value })}
              placeholder="e.g. Arjun Singhania"
              className={`w-full h-12 px-4 rounded-xl glass-input text-sm ${
                errors.groomName ? 'border-red-500 shadow-red-glow' : ''
              }`}
            />
            {errors.groomName && (
              <p className="text-xs text-red-400 mt-1">{errors.groomName}</p>
            )}
          </div>

          <ImageUploader
            label="Groom Portrait Photo"
            hint="Recommended vertical portrait"
            value={data.groomPhoto}
            onChange={(url) => onChange({ groomPhoto: url })}
            aspect="portrait"
          />
        </div>

        {/* Bride Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-brand/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-brand/20 border border-red-brand/30 flex items-center justify-center text-red-glow font-bold text-xs">
                👰
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">The Bride</h3>
                <p className="text-[11px] text-gray-400">Bride's personal profile</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-gray-300 border border-white/10 font-mono">
              02
            </span>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
              Bride Full Name *
            </label>
            <input
              type="text"
              value={data.brideName}
              onChange={(e) => onChange({ brideName: e.target.value })}
              placeholder="e.g. Ananya Deshmukh"
              className={`w-full h-12 px-4 rounded-xl glass-input text-sm ${
                errors.brideName ? 'border-red-500 shadow-red-glow' : ''
              }`}
            />
            {errors.brideName && (
              <p className="text-xs text-red-400 mt-1">{errors.brideName}</p>
            )}
          </div>

          <ImageUploader
            label="Bride Portrait Photo"
            hint="Recommended vertical portrait"
            value={data.bridePhoto}
            onChange={(url) => onChange({ bridePhoto: url })}
            aspect="portrait"
          />
        </div>
      </div>

      {/* Wedding Date, Time & Hashtag */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <Calendar className="text-red-brand w-5 h-5" />
          <h3 className="font-serif text-lg font-bold text-white">The Big Day</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Wedding Date */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
              Auspicious Wedding Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={data.weddingDate}
                onChange={(e) => onChange({ weddingDate: e.target.value })}
                className={`w-full h-12 px-4 rounded-xl glass-input text-sm ${
                  errors.weddingDate ? 'border-red-500' : ''
                }`}
              />
            </div>
            {errors.weddingDate && (
              <p className="text-xs text-red-400 mt-1">{errors.weddingDate}</p>
            )}
          </div>

          {/* Wedding Time */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
              Ceremony Muhurat / Time *
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.weddingTime}
                onChange={(e) => onChange({ weddingTime: e.target.value })}
                placeholder="e.g. 06:30 PM Onwards"
                className={`w-full h-12 px-4 rounded-xl glass-input text-sm ${
                  errors.weddingTime ? 'border-red-500' : ''
                }`}
              />
            </div>
            {errors.weddingTime && (
              <p className="text-xs text-red-400 mt-1">{errors.weddingTime}</p>
            )}
          </div>

          {/* Wedding Hashtag */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
              Couple's Wedding Hashtag
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.coupleHashtag || ''}
                onChange={(e) => onChange({ coupleHashtag: e.target.value })}
                placeholder="#AnanyaFoundHerArjun"
                className="w-full h-12 px-4 rounded-xl glass-input text-sm text-gold-champagne font-medium"
              />
            </div>
          </div>
        </div>

        {/* Love Story Textarea */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-300 flex items-center gap-1.5">
              <BookOpen size={14} className="text-red-brand" /> Couple's Short Love Story
            </label>
            <span className="text-[11px] text-gray-400">
              {data.loveStory?.length || 0} characters
            </span>
          </div>
          <textarea
            rows={4}
            value={data.loveStory}
            onChange={(e) => onChange({ loveStory: e.target.value })}
            placeholder="Tell your guests how your paths crossed, the magical proposal, or your journey together..."
            className="w-full p-4 rounded-2xl glass-input text-sm leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};

