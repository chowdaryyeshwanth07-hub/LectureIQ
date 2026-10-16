import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Upload, 
  Sparkles, 
  Filter, 
  Headphones, 
  FileText, 
  FileCode 
} from 'lucide-react';
import LectureCard from '../components/LectureCard';

export default function LecturesPage({ 
  lectures, 
  onSelectLecture, 
  onDeleteLecture, 
  onOpenUpload, 
  onSeedDemo, 
  isSeeding 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // all, audio, pdf, text

  const filtered = lectures.filter(lec => {
    const matchesSearch = 
      lec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lec.subject && lec.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = 
      selectedType === 'all' || 
      lec.source_type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-400" />
            <span>Lecture Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Browse and manage all audio recordings, documents, and transcripts ({lectures.length} total)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isSeeding ? 'Seeding...' : 'Load Samples'}</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/70">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or subject..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedType === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            All Formats ({lectures.length})
          </button>

          <button
            onClick={() => setSelectedType('audio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedType === 'audio'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audio</span>
          </button>

          <button
            onClick={() => setSelectedType('pdf')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedType === 'pdf'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => setSelectedType('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedType === 'text'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>Notes</span>
          </button>
        </div>

      </div>

      {/* Lectures Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((lec) => (
            <LectureCard
              key={lec.id}
              lecture={lec}
              onSelect={onSelectLecture}
              onDelete={onDeleteLecture}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-12 text-center">
          <p className="text-sm text-slate-400">No lectures match the search filter.</p>
        </div>
      )}

    </div>
  );
}
