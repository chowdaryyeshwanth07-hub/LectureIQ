import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Clock 
} from 'lucide-react';
import { searchGlobal } from '../services/api';

export default function SemanticSearchModal({ isOpen, onClose, onSelectLecture }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else openModal();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const performSearch = async (term) => {
    try {
      setIsSearching(true);
      const data = await searchGlobal(term);
      setIsSearching(false);
      setResults(data.results || []);
    } catch (e) {
      setIsSearching(false);
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all lectures, transcripts, and concepts..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); setResults([]); }}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isSearching && (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              <span>Scanning lecture vectors...</span>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            results.map((res) => (
              <div
                key={res.chunk_id}
                onClick={() => {
                  onSelectLecture(res.lecture_id);
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {res.lecture_title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-indigo-300">
                      {res.heading}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Score: {Math.round(res.relevance_score * 100)}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {res.content_snippet}
                </p>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
                  <span>Click to jump to lecture</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-indigo-400" />
                </div>
              </div>
            ))
          )}

          {!isSearching && query.length >= 2 && results.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching lecture concepts found for "{query}".
            </div>
          )}

          {!query && (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <Sparkles className="w-6 h-6 text-indigo-400 mx-auto opacity-70" />
              <p>Type keywords to search semantic embeddings across all your lectures</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
