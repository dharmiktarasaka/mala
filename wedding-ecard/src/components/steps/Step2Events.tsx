import React from 'react';
import { WeddingEvent } from '../../types';
import { Calendar, Plus, Trash2, MapPin, ExternalLink, Clock, Sparkles } from 'lucide-react';

interface Step2EventsProps {
  events: WeddingEvent[];
  onChange: (events: WeddingEvent[]) => void;
  errors?: Record<string, string>;
}

const CEREMONY_PRESETS = [
  'Haldi Ceremony',
  'Mehndi Ceremony',
  'Sangeet Night',
  'The Wedding Ceremony (Pheras)',
  'Grand Reception',
  'Ring Ceremony & Engagement',
  'Cocktail & After-Party',
];

export const Step2Events: React.FC<Step2EventsProps> = ({
  events,
  onChange,
  errors = {},
}) => {
  const addEvent = (presetName?: string) => {
    const newEvent: WeddingEvent = {
      id: `event-${Date.now()}`,
      name: presetName || 'New Ceremony',
      date: '',
      time: '',
      venue: '',
      address: '',
      mapLink: '',
      attire: 'Formal / Traditional',
    };
    onChange([...events, newEvent]);
  };

  const updateEvent = (index: number, fields: Partial<WeddingEvent>) => {
    const updated = [...events];
    updated[index] = { ...updated[index], ...fields };
    onChange(updated);
  };

  const removeEvent = (index: number) => {
    if (events.length <= 1) {
      alert('At least one wedding event is required.');
      return;
    }
    const updated = events.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-brand/10 border border-red-brand/20 text-red-glow text-xs font-semibold uppercase tracking-widest">
          <Calendar size={12} className="text-red-brand" /> Step 2: Itinerary & Ceremonies
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Wedding Events & Celebrations
        </h2>
        <p className="text-gray-400 text-sm">
          Detail each sacred ceremony, musical celebration, and reception feast for your guests.
        </p>
      </div>

      {/* Quick Add Preset Ceremony Chips */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold text-gray-300">
          <Sparkles size={14} className="text-gold-leaf" />
          <span>Quick Add Ceremony Template:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CEREMONY_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => addEvent(preset)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-red-brand/20 hover:border-red-brand/40 border border-white/10 text-xs font-medium text-gray-200 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Plus size={12} className="text-red-glow" />
              <span>{preset}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards List */}
      <div className="space-y-6">
        {events.map((evt, idx) => (
          <div
            key={evt.id}
            className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden group space-y-5"
          >
            {/* Ambient subtle light for each event */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-red-brand/5 rounded-full blur-3xl pointer-events-none" />

            {/* Event Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-brand/30 to-blue-electric/20 border border-red-brand/40 flex items-center justify-center text-sm font-bold text-white shadow-sm font-cinzel">
                  0{idx + 1}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    {evt.name || `Ceremony ${idx + 1}`}
                  </h3>
                  <p className="text-[11px] text-gray-400">Ceremony details & itinerary</p>
                </div>
              </div>

              {events.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEvent(idx)}
                  className="px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/30 border border-red-500/20 text-red-400 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">Delete Event</span>
                </button>
              )}
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Event Name */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={evt.name}
                  onChange={(e) => updateEvent(idx, { name: e.target.value })}
                  placeholder="e.g. Sangeet & Cocktail Night"
                  className="w-full h-12 px-4 rounded-xl glass-input text-sm font-medium"
                />
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  value={evt.date}
                  onChange={(e) => updateEvent(idx, { date: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl glass-input text-sm"
                />
              </div>

              {/* Event Time */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                  Time *
                </label>
                <input
                  type="text"
                  value={evt.time}
                  onChange={(e) => updateEvent(idx, { time: e.target.value })}
                  placeholder="e.g. 07:30 PM Onwards"
                  className="w-full h-12 px-4 rounded-xl glass-input text-sm"
                />
              </div>

              {/* Venue Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                  Venue Name *
                </label>
                <input
                  type="text"
                  value={evt.venue}
                  onChange={(e) => updateEvent(idx, { venue: e.target.value })}
                  placeholder="e.g. The Grand Mewar Ballroom"
                  className="w-full h-12 px-4 rounded-xl glass-input text-sm"
                />
              </div>

              {/* Complete Address */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                  Complete Address *
                </label>
                <input
                  type="text"
                  value={evt.address}
                  onChange={(e) => updateEvent(idx, { address: e.target.value })}
                  placeholder="City Palace Complex, Udaipur, Rajasthan"
                  className="w-full h-12 px-4 rounded-xl glass-input text-sm"
                />
              </div>

              {/* Dress Code / Attire */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                  Dress Code / Attire Recommendation
                </label>
                <input
                  type="text"
                  value={evt.attire || ''}
                  onChange={(e) => updateEvent(idx, { attire: e.target.value })}
                  placeholder="e.g. Royal Traditional / Black Tie"
                  className="w-full h-12 px-4 rounded-xl glass-input text-sm text-gold-champagne"
                />
              </div>
            </div>

            {/* Google Maps Link with Live Tester */}
            <div className="pt-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-1.5">
                Google Maps Location Link
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-brand"
                  />
                  <input
                    type="url"
                    value={evt.mapLink}
                    onChange={(e) => updateEvent(idx, { mapLink: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full h-12 pl-10 pr-4 rounded-xl glass-input text-sm text-blue-300"
                  />
                </div>
                {evt.mapLink && (
                  <a
                    href={evt.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 h-12 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-gray-200 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Test Map</span>
                    <ExternalLink size={14} className="text-blue-electric" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Another Event Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => addEvent()}
          className="px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-red-brand/50 text-sm font-semibold text-white flex items-center gap-2 transition-all shadow-glass hover:shadow-red-glow"
        >
          <Plus size={16} className="text-red-glow" />
          <span>Add Another Wedding Event</span>
        </button>
      </div>
    </div>
  );
};

