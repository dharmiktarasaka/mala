import React, { useState } from 'react';
import { GalleryPhoto } from '../../types';
import { Image as ImageIcon, Plus, Trash2, Maximize2, Tag, X, Sparkles } from 'lucide-react';

interface Step4GalleryProps {
  gallery: GalleryPhoto[];
  onChange: (gallery: GalleryPhoto[]) => void;
  errors?: Record<string, string>;
}

export const Step4Gallery: React.FC<Step4GalleryProps> = ({
  gallery,
  onChange,
  errors = {},
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'couple' | 'pre-wedding'>('all');
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);

  const handleMultipleFiles = (files: FileList | null, type: 'couple' | 'pre-wedding') => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          const newPhoto: GalleryPhoto = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: e.target.result,
            caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            type,
          };
          onChange([...gallery, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => {
    onChange(gallery.filter((p) => p.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    onChange(
      gallery.map((p) => (p.id === id ? { ...p, caption } : p)),
    );
  };

  const filteredPhotos =
    activeTab === 'all' ? gallery : gallery.filter((p) => p.type === activeTab);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-brand/10 border border-red-brand/20 text-red-glow text-xs font-semibold uppercase tracking-widest">
          <ImageIcon size={12} className="text-red-brand" /> Step 4: Visual Storytelling
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Wedding & Pre-Wedding Gallery
        </h2>
        <p className="text-gray-400 text-sm">
          Curate a breathtaking gallery of intimate memories, proposals, and pre-wedding portraits.
        </p>
      </div>

      {/* Two Upload Portals (Couple & Pre-Wedding) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Couple Photos Portal */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 relative overflow-hidden group">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-brand/20 border border-red-brand/30 flex items-center justify-center text-red-glow text-sm">
                ❤️
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white">Couple Portraits</h3>
                <p className="text-[11px] text-gray-400">Casual & Candid Memories</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.04] text-gray-300 font-mono">
              {gallery.filter((p) => p.type === 'couple').length} Uploaded
            </span>
          </div>

          <label className="cursor-pointer block rounded-2xl border-2 border-dashed border-white/10 hover:border-red-brand/50 hover:bg-white/[0.02] p-6 text-center transition-all bg-dark-850/50">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleMultipleFiles(e.target.files, 'couple')}
            />
            <div className="w-10 h-10 rounded-full bg-red-brand/10 border border-red-brand/30 flex items-center justify-center mx-auto mb-2 text-red-brand">
              <Plus size={18} />
            </div>
            <p className="text-sm font-semibold text-gray-200">Upload Couple Photos</p>
            <p className="text-xs text-gray-400 mt-0.5">Select multiple photos at once</p>
          </label>
        </div>

        {/* Pre-Wedding Shoot Portal */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 relative overflow-hidden group">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-electric/20 border border-blue-electric/30 flex items-center justify-center text-blue-glow text-sm">
                📸
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white">Pre-Wedding Shoot</h3>
                <p className="text-[11px] text-gray-400">Professional Studio & Destination</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.04] text-gray-300 font-mono">
              {gallery.filter((p) => p.type === 'pre-wedding').length} Uploaded
            </span>
          </div>

          <label className="cursor-pointer block rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-electric/50 hover:bg-white/[0.02] p-6 text-center transition-all bg-dark-850/50">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleMultipleFiles(e.target.files, 'pre-wedding')}
            />
            <div className="w-10 h-10 rounded-full bg-blue-electric/10 border border-blue-electric/30 flex items-center justify-center mx-auto mb-2 text-blue-electric">
              <Plus size={18} />
            </div>
            <p className="text-sm font-semibold text-gray-200">Upload Pre-Wedding Shoot</p>
            <p className="text-xs text-gray-400 mt-0.5">Select multiple high-res shots</p>
          </label>
        </div>
      </div>

      {/* Gallery Filter & Grid */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="font-serif text-lg font-bold text-white">Gallery Collection</h3>
            <p className="text-xs text-gray-400">
              Hover over any photo to preview fullscreen, edit caption or remove.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-dark-800 border border-white/10 self-start sm:self-auto">
            {(['all', 'couple', 'pre-wedding'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-red-brand text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'pre-wedding' ? 'Pre-Wedding' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Photos Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <ImageIcon size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No photos uploaded in this category yet.</p>
            <p className="text-xs text-gray-400 mt-1">Use the upload portals above to add your photos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-2xl overflow-hidden aspect-square border border-white/10 bg-dark-900 shadow-glass"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Wedding photo'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Badge Type */}
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md uppercase tracking-wider ${
                    photo.type === 'couple'
                      ? 'bg-red-brand/80 text-white'
                      : 'bg-blue-electric/80 text-white'
                  }`}
                >
                  {photo.type === 'couple' ? 'Couple' : 'Pre-Wed'}
                </span>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-between">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLightboxPhoto(photo)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors"
                      title="Enlarge"
                    >
                      <Maximize2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={photo.caption || ''}
                      onChange={(e) => updateCaption(photo.id, e.target.value)}
                      placeholder="Add caption..."
                      className="w-full px-2 py-1 rounded bg-black/70 border border-white/20 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-brand"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full max-h-[90vh] glass-panel rounded-3xl overflow-hidden border border-white/20 flex flex-col"
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/40">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption}
                className="max-w-full max-h-[75vh] object-contain"
              />
            </div>
            {lightboxPhoto.caption && (
              <div className="p-4 bg-dark-900 border-t border-white/10 text-center">
                <p className="font-serif text-lg text-gold-champagne italic">
                  "{lightboxPhoto.caption}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

