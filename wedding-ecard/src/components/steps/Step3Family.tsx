import React from 'react';
import { FamilyInfo } from '../../types';
import { ImageUploader } from '../ImageUploader';
import { Users, Heart, Quote, Plus, Trash2 } from 'lucide-react';

interface Step3FamilyProps {
  data: FamilyInfo;
  onChange: (fields: Partial<FamilyInfo>) => void;
  errors?: Record<string, string>;
}

export const Step3Family: React.FC<Step3FamilyProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const addFamilyPhoto = (url: string) => {
    onChange({ familyPhotos: [...(data.familyPhotos || []), url] });
  };

  const removeFamilyPhoto = (index: number) => {
    const updated = [...(data.familyPhotos || [])];
    updated.splice(index, 1);
    onChange({ familyPhotos: updated });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-brand/10 border border-red-brand/20 text-red-glow text-xs font-semibold uppercase tracking-widest">
          <Users size={12} className="text-red-brand" /> Step 3: Heritage & Lineage
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Family Dignitaries & Blessings
        </h2>
        <p className="text-gray-400 text-sm">
          Acknowledge the revered parents and families whose blessings make this sacred alliance auspicious.
        </p>
      </div>

      {/* Two Column Family Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Groom's Family */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-electric/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-electric/20 border border-blue-electric/30 flex items-center justify-center text-blue-glow font-bold text-xs">
                👑
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Groom's Family</h3>
                <p className="text-[11px] text-gray-400">Parents of the Groom</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-gray-300 border border-white/10 font-mono">
              Singhania
            </span>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
              Groom's Father's Name *
            </label>
            <input
              type="text"
              value={data.groomFather}
              onChange={(e) => onChange({ groomFather: e.target.value })}
              placeholder="e.g. Rajendra Pratap Singhania"
              className="w-full h-12 px-4 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
              Groom's Mother's Name *
            </label>
            <input
              type="text"
              value={data.groomMother}
              onChange={(e) => onChange({ groomMother: e.target.value })}
              placeholder="e.g. Sunita Singhania"
              className="w-full h-12 px-4 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Bride's Family */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-brand/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-brand/20 border border-red-brand/30 flex items-center justify-center text-red-glow font-bold text-xs">
                🌸
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Bride's Family</h3>
                <p className="text-[11px] text-gray-400">Parents of the Bride</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-gray-300 border border-white/10 font-mono">
              Deshmukh
            </span>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
              Bride's Father's Name *
            </label>
            <input
              type="text"
              value={data.brideFather}
              onChange={(e) => onChange({ brideFather: e.target.value })}
              placeholder="e.g. Vikramaditya Deshmukh"
              className="w-full h-12 px-4 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
              Bride's Mother's Name *
            </label>
            <input
              type="text"
              value={data.brideMother}
              onChange={(e) => onChange({ brideMother: e.target.value })}
              placeholder="e.g. Meenakshi Deshmukh"
              className="w-full h-12 px-4 rounded-xl glass-input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Family Blessings Message Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <Quote className="text-gold-leaf w-5 h-5" />
          <h3 className="font-serif text-lg font-bold text-white">
            Formal Family Invitation Note
          </h3>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
            Invitation Message from Both Families
          </label>
          <textarea
            rows={3}
            value={data.blessingsNote || ''}
            onChange={(e) => onChange({ blessingsNote: e.target.value })}
            placeholder="With the divine grace of the Almighty and the eternal blessings of our revered ancestors..."
            className="w-full p-4 rounded-2xl glass-input text-sm leading-relaxed"
          />
        </div>

        {/* Optional Family Portrait Uploads */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-200">
                Optional Family Photographs
              </h4>
              <p className="text-xs text-gray-400">
                Add cherished moments with parents and elders to include in the e-card gallery.
              </p>
            </div>
            <span className="text-xs text-gray-400">
              {data.familyPhotos?.length || 0} Photos Added
            </span>
          </div>

          {/* Grid of uploaded family photos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {data.familyPhotos?.map((photo, i) => (
              <div
                key={i}
                className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10 bg-dark-900 shadow-glass"
              >
                <img
                  src={photo}
                  alt={`Family portrait ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFamilyPhoto(i)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove photo"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {/* Upload new photo trigger */}
            <ImageUploader
              label="Add Family Photo"
              aspect="square"
              onChange={addFamilyPhoto}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

