import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  RefreshCw 
} from 'lucide-react';
import { generateNotes, getExportUrl } from '../services/api';

export default function SmartNotesTab({ lecture, onUpdateLecture }) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const res = await generateNotes(lecture.id);
      setIsRegenerating(false);
      onUpdateLecture({
        ...lecture,
        smart_notes: res.smart_notes
      });
    } catch (e) {
      setIsRegenerating(false);
      alert('Failed to re-generate smart notes.');
    }
  };

  const handleCopy = () => {
    if (lecture.smart_notes) {
      navigator.clipboard.writeText(lecture.smart_notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Structured Topic-Wise Smart Notes</span>
          </h2>
          <p className="text-xs text-slate-400">Hierarchical chapters, mathematical formulas, and exam prep points</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <a
            href={getExportUrl(lecture.id, 'markdown')}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .md</span>
          </a>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Drafting Notes...' : 'Re-generate'}</span>
          </button>
        </div>
      </div>

      {/* Smart Notes Document Body */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 sm:p-8 shadow-xl">
        {lecture.smart_notes ? (
          <div className="prose prose-invert max-w-none space-y-4 text-slate-200">
            <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed bg-transparent p-0 border-none text-slate-200">
              {lecture.smart_notes}
            </pre>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-slate-400 mb-3">No structured notes have been created yet.</p>
            <button
              onClick={handleRegenerate}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md"
            >
              Generate Smart Notes
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
