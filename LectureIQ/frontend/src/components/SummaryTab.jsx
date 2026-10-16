import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  BookMarked, 
  Copy, 
  Check 
} from 'lucide-react';
import { generateSummary } from '../services/api';

export default function SummaryTab({ lecture, onUpdateLecture }) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const res = await generateSummary(lecture.id);
      setIsRegenerating(false);
      onUpdateLecture({
        ...lecture,
        executive_summary: res.executive_summary,
        key_takeaways: res.key_takeaways
      });
    } catch (e) {
      setIsRegenerating(false);
      alert('Failed to re-generate summary.');
    }
  };

  const handleCopy = () => {
    const text = `${lecture.executive_summary}\n\nKey Takeaways:\n${(lecture.key_takeaways || []).map(t => `- ${t}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>AI Executive Summary & Takeaways</span>
          </h2>
          <p className="text-xs text-slate-400">Distilled core concepts and high-yield examination takeaways</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Synthesizing...' : 'Re-summarize'}</span>
          </button>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <BookMarked className="w-4 h-4" />
          <span>Executive Summary</span>
        </div>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line font-normal">
          {lecture.executive_summary || 'No executive summary available. Click "Re-summarize" above to generate.'}
        </p>
      </div>

      {/* Key Takeaways */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>High-Yield Key Takeaways</span>
        </h3>

        <div className="space-y-3">
          {(lecture.key_takeaways && lecture.key_takeaways.length > 0) ? (
            lecture.key_takeaways.map((point, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm text-slate-200 leading-normal">
                  {point}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No takeaways generated yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}
