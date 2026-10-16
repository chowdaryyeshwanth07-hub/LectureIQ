import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Shuffle, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { updateFlashcardMastery, generateFlashcards } from '../services/api';

export default function FlashcardDeck({ lecture, onUpdateLecture }) {
  const [cards, setCards] = useState(lecture.flashcards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setCards(lecture.flashcards || []);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [lecture]);

  // Keyboard controls: ArrowLeft, ArrowRight, Space
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards.length, currentIndex]);

  const handleNext = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleSetMastery = async (status) => {
    if (cards.length === 0) return;
    const currentCard = cards[currentIndex];
    try {
      await updateFlashcardMastery(currentCard.id, status);
      const updated = cards.map((c, i) => i === currentIndex ? { ...c, mastery_status: status } : c);
      setCards(updated);
      onUpdateLecture({
        ...lecture,
        flashcards: updated
      });
      // Auto advance to next card
      setTimeout(() => handleNext(), 350);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateMore = async () => {
    try {
      setIsGenerating(true);
      const newCards = await generateFlashcards(lecture.id, 6);
      setIsGenerating(false);
      const combined = [...cards, ...newCards];
      setCards(combined);
      onUpdateLecture({
        ...lecture,
        flashcards: combined
      });
    } catch (e) {
      setIsGenerating(false);
      alert('Failed to generate more flashcards.');
    }
  };

  const currentCard = cards[currentIndex];
  const masteredCount = cards.filter(c => c.mastery_status === 'mastered').length;
  const progressPercent = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

  if (cards.length === 0) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-12 text-center shadow-xl">
        <Layers className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No Flashcards Generated</h3>
        <p className="text-xs text-slate-400 mb-6">Create your first revision deck using AI extraction</p>
        <button
          onClick={handleGenerateMore}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Synthesizing Cards...' : 'Generate Flashcard Deck'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Interactive Flashcard Deck</span>
          </h2>
          <p className="text-xs text-slate-400">
            Card {currentIndex + 1} of {cards.length} • {masteredCount} Mastered ({progressPercent}%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            title="Shuffle cards"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>

          <button
            onClick={handleGenerateMore}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : '+ Generate More'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flashcard Container */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="perspective-1000 w-full h-80 sm:h-96 cursor-pointer select-none group"
      >
        <div 
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform shadow-2xl rounded-3xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE (QUESTION) */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700/80 group-hover:border-indigo-500/60 rounded-3xl p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {currentCard.concept || 'Key Concept'}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Difficulty: {currentCard.difficulty || 'Medium'}
              </span>
            </div>

            <div className="text-center my-auto px-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400 block mb-2">
                QUESTION
              </span>
              <p className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
                {currentCard.question}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-slate-400">
                <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                Click card or press Spacebar to flip
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                currentCard.mastery_status === 'mastered' 
                  ? 'bg-emerald-500/20 text-emerald-300' 
                  : currentCard.mastery_status === 'reviewing' 
                    ? 'bg-amber-500/20 text-amber-300' 
                    : 'bg-rose-500/20 text-rose-300'
              }`}>
                {currentCard.mastery_status}
              </span>
            </div>
          </div>

          {/* BACK SIDE (ANSWER) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 to-indigo-950/80 border-2 border-indigo-500/70 rounded-3xl p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                {currentCard.concept || 'Concept'}
              </span>
              <span className="text-xs text-indigo-300 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Answer Revealed
              </span>
            </div>

            <div className="text-center my-auto px-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 block mb-2">
                CORRECT ANSWER
              </span>
              <p className="text-base sm:text-xl font-medium text-slate-100 leading-relaxed">
                {currentCard.answer}
              </p>
            </div>

            <div className="text-center text-xs text-indigo-300/70 pt-3 border-t border-indigo-900/50">
              Click to flip back to question
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Controls & Mastery Actions */}
      <div className="space-y-4">
        {/* Previous / Next buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-400 font-medium">
            Use ← → arrows to navigate
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Rate Mastery Status */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-300">
            How well do you know this card?
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSetMastery('learning')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentCard.mastery_status === 'learning'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30'
              }`}
            >
              Needs Work
            </button>

            <button
              onClick={() => handleSetMastery('reviewing')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentCard.mastery_status === 'reviewing'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
              }`}
            >
              Reviewing
            </button>

            <button
              onClick={() => handleSetMastery('mastered')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentCard.mastery_status === 'mastered'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
              }`}
            >
              Mastered ✓
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
