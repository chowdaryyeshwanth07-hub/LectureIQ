import React from 'react';
import { 
  FileText, 
  Headphones, 
  FileCode, 
  Trash2, 
  ArrowRight, 
  Layers, 
  HelpCircle, 
  Clock, 
  BookOpen 
} from 'lucide-react';

export default function LectureCard({ lecture, onSelect, onDelete }) {
  const getSourceIcon = (type) => {
    switch (type) {
      case 'audio':
        return <Headphones className="w-5 h-5 text-emerald-400" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-400" />;
      default:
        return <FileCode className="w-5 h-5 text-sky-400" />;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="group relative bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 rounded-2xl p-5 shadow-lg shadow-black/20 transition-all duration-200 flex flex-col justify-between">
      
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/50 group-hover:scale-105 transition-transform">
              {getSourceIcon(lecture.source_type)}
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-700/50 text-indigo-300 border border-slate-600/40">
                {lecture.subject || 'General'}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Are you sure you want to delete "${lecture.title}"?`)) {
                onDelete(lecture.id);
              }
            }}
            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete lecture"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onSelect(lecture.id)}
          className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors cursor-pointer line-clamp-2 leading-snug mb-2"
        >
          {lecture.title}
        </h3>

        {/* Meta badges */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          {lecture.duration_seconds > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatDuration(lecture.duration_seconds)}
            </span>
          )}
          {lecture.page_count > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              {lecture.page_count} {lecture.page_count === 1 ? 'page' : 'pages'}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Features & Action */}
      <div className="pt-3 border-t border-slate-700/50">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lecture.flashcard_count || 0} Flashcards</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{lecture.quiz_count || 0} Quiz Qs</span>
          </div>
        </div>

        <button
          onClick={() => onSelect(lecture.id)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-700/50 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition-all group/btn"
        >
          <span>Open Study Hub</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
