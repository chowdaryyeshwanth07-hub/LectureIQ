import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Headphones, 
  MessageSquare, 
  Download, 
  Clock, 
  Share2, 
  FileText 
} from 'lucide-react';
import { getLectureDetails, getExportUrl } from '../services/api';
import SummaryTab from '../components/SummaryTab';
import SmartNotesTab from '../components/SmartNotesTab';
import FlashcardDeck from '../components/FlashcardDeck';
import QuizArena from '../components/QuizArena';
import TranscriptViewer from '../components/TranscriptViewer';
import ChatBot from '../components/ChatBot';
import AudioPlayer from '../components/AudioPlayer';

export default function LectureDetailPage({ lectureId, onBack }) {
  const [lecture, setLecture] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);
  const [activeAudioTime, setActiveAudioTime] = useState(0);

  useEffect(() => {
    loadLecture();
  }, [lectureId]);

  const loadLecture = async () => {
    try {
      setIsLoading(true);
      const data = await getLectureDetails(lectureId);
      setLecture(data);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      console.error(e);
    }
  };

  const handleUpdateLecture = (updated) => {
    setLecture(updated);
  };

  const handleAudioSeek = (seconds) => {
    setActiveAudioTime(seconds);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 font-medium">Loading Lecture Learning Hub...</p>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-rose-400 text-sm">Failed to load lecture details.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
        >
          Return to Lectures
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'notes', label: 'Smart Notes', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, badge: lecture.flashcards?.length },
    { id: 'quiz', label: 'Quiz Arena', icon: HelpCircle, badge: lecture.quizzes?.length },
    { id: 'transcript', label: 'Transcript', icon: Headphones, badge: lecture.segments?.length },
    { id: 'chat', label: 'AI Q&A Tutor', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Top Navigation & Lecture Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Top bar with back and export */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <a
              href={getExportUrl(lecture.id, 'markdown')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-indigo-500/50 transition-all"
              title="Download Markdown Study Package"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export .MD</span>
            </a>

            <a
              href={getExportUrl(lecture.id, 'json')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-indigo-500/50 transition-all"
              title="Download JSON Study Package"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export .JSON</span>
            </a>
          </div>
        </div>

        {/* Title & Metadata */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {lecture.subject || 'General'}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
              Source: {lecture.source_type}
            </span>
            {lecture.duration_seconds > 0 && (
              <span className="text-xs text-slate-400 flex items-center gap-1 ml-1">
                <Clock className="w-3.5 h-3.5" />
                {Math.floor(lecture.duration_seconds / 60)} minutes
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {lecture.title}
          </h1>
        </div>

        {/* Audio Player if duration or audio present */}
        {(lecture.source_type === 'audio' || (lecture.segments && lecture.segments.length > 0)) && (
          <div className="pt-2">
            <AudioPlayer
              duration={lecture.duration_seconds || 1200}
              currentTime={activeAudioTime}
              onTimeUpdate={setActiveAudioTime}
            />
          </div>
        )}

        {/* Learning Hub Tabs Nav */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-700/60 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Tab Content Display */}
      <div className="mt-6">
        {activeTab === 'summary' && (
          <SummaryTab
            lecture={lecture}
            onUpdateLecture={handleUpdateLecture}
          />
        )}

        {activeTab === 'notes' && (
          <SmartNotesTab
            lecture={lecture}
            onUpdateLecture={handleUpdateLecture}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardDeck
            lecture={lecture}
            onUpdateLecture={handleUpdateLecture}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizArena
            lecture={lecture}
            onUpdateLecture={handleUpdateLecture}
          />
        )}

        {activeTab === 'transcript' && (
          <TranscriptViewer
            lecture={lecture}
            activeTime={activeAudioTime}
            onSeek={handleAudioSeek}
          />
        )}

        {activeTab === 'chat' && (
          <ChatBot
            lecture={lecture}
            onSeekTime={handleAudioSeek}
          />
        )}
      </div>

    </div>
  );
}
