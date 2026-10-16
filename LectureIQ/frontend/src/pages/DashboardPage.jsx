import React from 'react';
import { 
  GraduationCap, 
  Layers, 
  HelpCircle, 
  Award, 
  Sparkles, 
  Upload, 
  Search, 
  ArrowRight, 
  Flame, 
  TrendingUp, 
  BookOpen 
} from 'lucide-react';
import LectureCard from '../components/LectureCard';

export default function DashboardPage({ 
  stats, 
  recentLectures, 
  onSelectLecture, 
  onDeleteLecture, 
  onOpenUpload, 
  onOpenSearch, 
  onSeedDemo,
  isSeeding 
}) {
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 border border-indigo-700/40 p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Lecture-to-Learning Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Learn Smarter. Revise Faster. Turn Every Lecture Into Knowledge.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Upload recordings, PDFs, or lecture notes to automatically generate structured summaries, 
            topic notes, flashcards, practice quizzes, and an interactive Q&A tutor grounded in your material.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Lecture</span>
            </button>

            <button
              onClick={onSeedDemo}
              disabled={isSeeding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 hover:border-indigo-500/50 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{isSeeding ? 'Loading Samples...' : 'Load 3 Demo Lectures'}</span>
            </button>

            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 hover:border-indigo-500/50 transition-all"
            >
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Semantic Search</span>
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 bottom-0 w-64 h-64 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Lectures */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white block">
              {stats?.total_lectures || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">Lectures Processed</span>
          </div>
        </div>

        {/* Mastered Flashcards */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">
                {stats?.mastered_flashcards || 0}
              </span>
              <span className="text-xs text-slate-400">/ {stats?.total_flashcards || 0}</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Flashcards Mastered</span>
          </div>
        </div>

        {/* Quizzes Taken */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white block">
              {stats?.total_attempts || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">Assessments Completed</span>
          </div>
        </div>

        {/* Average Quiz Accuracy */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white block">
              {stats?.average_quiz_score ? `${stats.average_quiz_score}%` : '—'}
            </span>
            <span className="text-xs text-slate-400 font-medium">Avg Quiz Accuracy</span>
          </div>
        </div>

      </div>

      {/* Recent Lectures Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Study Materials</h2>
            <p className="text-xs text-slate-400">Select any lecture to open its interactive learning suite</p>
          </div>
        </div>

        {recentLectures && recentLectures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentLectures.map((lec) => (
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
            <GraduationCap className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Lectures Added Yet</h3>
            <p className="text-xs text-slate-400 mb-5 max-w-sm mx-auto">
              Get started immediately by clicking below to load 3 ready-made sample lectures or upload your own files.
            </p>
            <button
              onClick={onSeedDemo}
              disabled={isSeeding}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSeeding ? 'Seeding...' : 'Load Sample Lectures (1-Click)'}</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
