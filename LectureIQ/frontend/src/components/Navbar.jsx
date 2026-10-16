import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Search, 
  Settings, 
  Upload, 
  Sparkles,
  FlaskConical
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  onOpenUpload, 
  onOpenSearch, 
  onOpenSettings,
  onSeedDemo,
  isSeeding
}) {
  return (
    <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                Lecture<span className="text-indigo-400">IQ</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
                v1.0 AI
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-slate-800 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('lectures')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'lectures'
                  ? 'bg-slate-800 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Lectures</span>
            </button>

            <button
              onClick={() => setCurrentTab('backtest')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'backtest'
                  ? 'bg-slate-800 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">AI Benchmark</span>
            </button>

            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors border border-slate-800 sm:border-slate-700/60 ml-1"
            >
              <Search className="w-4 h-4 text-indigo-400" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden sm:inline-block text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onSeedDemo}
              disabled={isSeeding}
              title="Load 3 rich sample lectures"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-700/40 hover:bg-indigo-900/60 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isSeeding ? 'Seeding...' : 'Load Samples'}</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Lecture</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
              title="Settings & AI Providers"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
