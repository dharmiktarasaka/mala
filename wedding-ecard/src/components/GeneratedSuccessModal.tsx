import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { WeddingFormData } from '../types';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Share2,
  QrCode,
  Sparkles,
  Heart,
  X,
  MessageCircle,
} from 'lucide-react';

interface GeneratedSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeddingFormData;
  onViewLiveSite: () => void;
}

export const GeneratedSuccessModal: React.FC<GeneratedSuccessModalProps> = ({
  isOpen,
  onClose,
  data,
  onViewLiveSite,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate romantic slug
  const groomSlug = (data.couple.groomName || 'groom').toLowerCase().replace(/\s+/g, '-');
  const brideSlug = (data.couple.brideName || 'bride').toLowerCase().replace(/\s+/g, '-');
  const liveUrl = `https://aura.wedding/e/${groomSlug}-and-${brideSlug}`;

  useEffect(() => {
    if (isOpen) {
      // Fire confetti cannons
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D71935', '#D4AF37', '#315BFF', '#FF2A4D', '#FFFFFF'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#D71935', '#D4AF37'],
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#315BFF', '#D4AF37'],
        });
      }, 300);
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `💍 Wedding Invitation 💍\n\nWith great joy, ${data.couple.groomName || 'Arjun'} & ${
        data.couple.brideName || 'Ananya'
      } invite you to celebrate their sacred wedding ceremonies!\n\nView our digital wedding invitation website & itinerary:\n${liveUrl}\n\n#WeddingInvitation`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="relative max-w-xl w-full glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-glass-glow my-auto space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Celebratory Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-red-brand to-gold-leaf p-0.5 mx-auto shadow-red-glow">
            <div className="w-full h-full rounded-[22px] bg-dark-900 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gold-champagne animate-pulse" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 size={13} /> Publication Complete
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-black text-white">
            Your Wedding Website is Live!
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
            The bespoke wedding invitation website for{' '}
            <span className="font-bold text-white">
              {data.couple.groomName} & {data.couple.brideName}
            </span>{' '}
            has been published and is ready to share with your esteemed guests.
          </p>
        </div>

        {/* Live URL Pill */}
        <div className="p-4 rounded-2xl bg-dark-950/80 border border-white/10 space-y-2">
          <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider block">
            Official Wedding Invitation URL
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={liveUrl}
              className="flex-1 bg-transparent text-sm font-mono text-gold-champagne focus:outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle2 size={13} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={13} /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code and Quick Share Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Simulated QR Code Card */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
              {/* Clean SVG QR Code Representation */}
              <svg viewBox="0 0 100 100" className="w-full h-full fill-black">
                <rect x="0" y="0" width="30" height="30" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" />
                <rect x="70" y="0" width="30" height="30" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" />
                <rect x="0" y="70" width="30" height="30" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" />
                <rect x="40" y="10" width="15" height="15" />
                <rect x="40" y="40" width="20" height="20" />
                <rect x="70" y="40" width="15" height="15" />
                <rect x="10" y="40" width="15" height="15" />
                <rect x="40" y="75" width="15" height="15" />
                <rect x="70" y="70" width="20" height="20" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Guest Mobile QR</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Scan on camera to open e-card
              </p>
            </div>
          </div>

          {/* WhatsApp Direct Share */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="p-4 rounded-2xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 flex items-center gap-3.5 text-left transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <MessageCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-300">
                Send via WhatsApp
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Invite guests instantly</p>
            </div>
          </button>
        </div>

        {/* View Live Website Button */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onViewLiveSite}
            className="flex-1 btn-red-gradient py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-red-glow"
          >
            <ExternalLink size={16} />
            <span>Open Live Interactive E-Card</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-gray-300"
          >
            Back to Editor
          </button>
        </div>
      </div>
    </div>
  );
};

