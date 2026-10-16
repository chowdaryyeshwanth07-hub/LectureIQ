import React, { useState } from 'react';
import { 
  Headphones, 
  Search, 
  Copy, 
  Check, 
  Play, 
  User, 
  Clock 
} from 'lucide-react';

export default function TranscriptViewer({ lecture, activeTime, onSeek }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const segments = lecture.segments || [];

  const formatTimestamp = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSegments = segments.filter(seg => 
    seg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seg.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyTranscript = () => {
    const text = segments.map(s => `[${formatTimestamp(s.start_time)}] ${s.speaker}: ${s.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Headphones className="w-5 h-5 text-emerald-400" />
            <span>Verbatim Audio Transcript</span>
          </h2>
          <p className="text-xs text-slate-400">
            {segments.length} timestamped speech segments synchronized with playback
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search in transcript */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcript..."
              className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={handleCopyTranscript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Segments Container */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-xl max-h-[600px] overflow-y-auto space-y-3">
        {filteredSegments.length > 0 ? (
          filteredSegments.map((seg) => {
            const isActive = activeTime >= seg.start_time && activeTime <= seg.end_time;

            return (
              <div 
                key={seg.id}
                onClick={() => onSeek && onSeek(seg.start_time)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                    <User className="w-3.5 h-3.5" />
                    <span>{seg.speaker}</span>
                  </div>

                  <button 
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(seg.start_time)}</span>
                  </button>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">
                  {seg.text}
                </p>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">
            {segments.length === 0 ? 'No speech segments found for this lecture.' : 'No matching segments found.'}
          </div>
        )}
      </div>

    </div>
  );
}
