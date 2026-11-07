import React, { useState, useEffect } from 'react';
import { WeddingFormData, TemplateTheme } from '../types';
import { TEMPLATES } from '../data/sampleData';
import {
  X,
  Smartphone,
  Monitor,
  Heart,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Sparkles,
  Users,
  Image as ImageIcon,
  Share2,
} from 'lucide-react';

interface LiveECardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeddingFormData;
}

export const LiveECardModal: React.FC<LiveECardModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  const theme: TemplateTheme =
    TEMPLATES.find((t) => t.id === data.selectedTemplate) || TEMPLATES[0];

  // Calculate live countdown to wedding date
  useEffect(() => {
    if (!data.couple.weddingDate) return;

    const timer = setInterval(() => {
      const target = new Date(`${data.couple.weddingDate}T${data.couple.weddingTime || '18:00'}`).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, mins, secs });
    }, 1000);

    return () => clearInterval(timer);
  }, [data.couple.weddingDate, data.couple.weddingTime]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-between p-2 sm:p-6 overflow-hidden">
      {/* Top Controller Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between py-2 sm:py-3 px-4 rounded-2xl glass-panel border border-white/10 mb-3 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-serif text-sm font-bold text-white hidden sm:inline">
            Live Preview:
          </span>
          <span className="text-xs font-semibold text-gold-champagne px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10">
            {theme.name}
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-dark-800 border border-white/10">
          <button
            type="button"
            onClick={() => setDeviceView('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              deviceView === 'mobile'
                ? 'bg-red-brand text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone size={13} />
            <span className="hidden sm:inline">Mobile Frame</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceView('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              deviceView === 'desktop'
                ? 'bg-red-brand text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Monitor size={13} />
            <span className="hidden sm:inline">Desktop View</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-white/[0.06] hover:bg-red-600 text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Frame Container */}
      <div className="flex-1 w-full flex items-center justify-center overflow-y-auto no-scrollbar py-2">
        <div
          className={`transition-all duration-500 overflow-y-auto bg-gradient-to-b ${theme.bgGradient} border border-white/15 text-white shadow-2xl relative ${
            deviceView === 'mobile'
              ? 'w-full max-w-[420px] h-[82vh] rounded-[44px] border-[8px] border-dark-750 shadow-red-glow'
              : 'w-full max-w-4xl h-[82vh] rounded-3xl shadow-glass'
          }`}
        >
          {/* Mobile Notch Bar */}
          {deviceView === 'mobile' && (
            <div className="sticky top-0 z-30 w-full h-7 bg-black/60 backdrop-blur-md flex items-center justify-center">
              <div className="w-24 h-3.5 bg-black rounded-full" />
            </div>
          )}

          {/* E-Card Content */}
          <div className="p-6 sm:p-10 space-y-12">
            {/* Top Sacred Shloka / Blessing Header */}
            <div className="text-center space-y-2 pt-4">
              <span className="font-serif text-gold-champagne tracking-widest text-xs uppercase block">
                || ॐ श्री गणेशाय नमः ||
              </span>
              <p className="text-[11px] text-gray-400 tracking-wider uppercase font-medium">
                The Sacred Union of Hearts
              </p>
            </div>

            {/* Couple Grand Title */}
            <div className="text-center space-y-3">
              <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                {data.couple.groomName || 'Arjun'}
                <span className="block my-1 font-cinzel text-xl sm:text-2xl text-gold-leaf font-light italic">
                  &
                </span>
                {data.couple.brideName || 'Ananya'}
              </h1>

              {data.couple.coupleHashtag && (
                <p className="text-xs font-bold text-red-glow tracking-wider">
                  {data.couple.coupleHashtag}
                </p>
              )}
            </div>

            {/* Couple Portraits */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 bg-dark-900 shadow-glass">
                {data.couple.groomPhoto ? (
                  <img
                    src={data.couple.groomPhoto}
                    alt="Groom"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <span className="text-3xl mb-1">🤵</span>
                    <span className="text-xs">Groom</span>
                  </div>
                )}
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 bg-dark-900 shadow-glass">
                {data.couple.bridePhoto ? (
                  <img
                    src={data.couple.bridePhoto}
                    alt="Bride"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <span className="text-3xl mb-1">👰</span>
                    <span className="text-xs">Bride</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Countdown Clock */}
            {data.couple.weddingDate && (
              <div className="p-5 rounded-3xl bg-black/50 backdrop-blur-xl border border-white/10 text-center space-y-3 shadow-glass">
                <p className="text-xs font-semibold text-gold-champagne uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Clock size={13} className="text-red-brand" /> Countdown to the Pheras
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-white block">
                      {countdown.days}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase">Days</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-white block">
                      {countdown.hours}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase">Hours</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-white block">
                      {countdown.mins}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase">Mins</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-red-glow block">
                      {countdown.secs}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase">Secs</span>
                  </div>
                </div>
              </div>
            )}

            {/* Love Story */}
            {data.couple.loveStory && (
              <div className="text-center space-y-2 max-w-lg mx-auto">
                <Heart size={18} className="text-red-brand fill-red-brand mx-auto" />
                <h3 className="font-serif text-xl font-bold text-gold-champagne">Our Love Story</h3>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "{data.couple.loveStory}"
                </p>
              </div>
            )}

            {/* Wedding Ceremonies Timeline */}
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs uppercase tracking-widest text-gold-leaf font-bold">
                  Ceremonial Itinerary
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">Events & Celebrations</h3>
              </div>

              <div className="space-y-3.5">
                {data.events.map((evt, idx) => (
                  <div
                    key={evt.id || idx}
                    className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-base font-bold text-white">
                        {evt.name}
                      </span>
                      <span className="text-xs font-semibold text-red-glow">{evt.time}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-300">
                      <MapPin size={13} className="text-red-brand shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>

                    {evt.attire && (
                      <p className="text-[11px] text-gold-champagne">
                        Attire: <span className="text-gray-300">{evt.attire}</span>
                      </p>
                    )}

                    {evt.mapLink && (
                      <a
                        href={evt.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-electric hover:underline pt-1"
                      >
                        <span>Open Directions in Google Maps</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Family Blessings */}
            <div className="p-5 rounded-3xl bg-black/50 border border-white/10 text-center space-y-3">
              <span className="text-xs uppercase tracking-widest text-gold-leaf font-bold">
                With Blessings From
              </span>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-white">
                    {data.family.groomFather} & {data.family.groomMother}
                  </p>
                  <p className="text-[11px] text-gray-400">Groom's Parents</p>
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {data.family.brideFather} & {data.family.brideMother}
                  </p>
                  <p className="text-[11px] text-gray-400">Bride's Parents</p>
                </div>
              </div>
              {data.family.blessingsNote && (
                <p className="text-xs text-gray-300 italic pt-2 border-t border-white/5">
                  "{data.family.blessingsNote}"
                </p>
              )}
            </div>

            {/* Photo Gallery Teaser */}
            {data.gallery.length > 0 && (
              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-xs uppercase tracking-widest text-gold-leaf font-bold">
                    Moments of Joy
                  </span>
                  <h4 className="font-serif text-xl font-bold text-white">Photo Memories</h4>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {data.gallery.slice(0, 6).map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10">
                      <img src={img.url} alt="Memory" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer RSVP */}
            <div className="pt-6 border-t border-white/10 text-center space-y-2">
              <p className="font-serif text-lg text-white">We look forward to celebrating with you</p>
              <p className="text-xs text-gray-400">
                Crafted with love on AURA Haute Couture Wedding E-Card Studio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

