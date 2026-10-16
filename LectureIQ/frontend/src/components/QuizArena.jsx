import React, { useState } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award, 
  Sparkles, 
  RefreshCw,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitQuiz, generateQuiz } from '../services/api';

export default function QuizArena({ lecture, onUpdateLecture }) {
  const [questions, setQuestions] = useState(lecture.quizzes || []);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectOption = (qId, optionText) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionText
    }));
  };

  const handleTextAnswerChange = (qId, text) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: text
    }));
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;
    try {
      setIsSubmitting(true);
      const res = await submitQuiz(lecture.id, selectedAnswers);
      setIsSubmitting(false);
      setEvaluation(res);
      setIsSubmitted(true);

      if (res.score_percentage >= 70) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (e) {
      setIsSubmitting(false);
      alert('Failed to evaluate quiz.');
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setEvaluation(null);
  };

  const handleGenerateMore = async () => {
    try {
      setIsGenerating(true);
      const newQuestions = await generateQuiz(lecture.id, 4);
      setIsGenerating(false);
      const combined = [...questions, ...newQuestions];
      setQuestions(combined);
      onUpdateLecture({
        ...lecture,
        quizzes: combined
      });
      handleRetake();
    } catch (e) {
      setIsGenerating(false);
      alert('Failed to generate new quiz questions.');
    }
  };

  if (questions.length === 0) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-12 text-center shadow-xl">
        <HelpCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No Practice Questions</h3>
        <p className="text-xs text-slate-400 mb-6">Generate multiple-choice and short-answer questions with instant grading</p>
        <button
          onClick={handleGenerateMore}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Drafting Test...' : 'Generate Practice Quiz'}</span>
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).filter(k => selectedAnswers[k]?.trim()).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>AI Practice Quiz & Self-Assessment</span>
          </h2>
          <p className="text-xs text-slate-400">
            {questions.length} Questions • {answeredCount} Answered
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSubmitted ? (
            <button
              onClick={handleRetake}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          ) : null}

          <button
            onClick={handleGenerateMore}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : '+ More Questions'}</span>
          </button>
        </div>
      </div>

      {/* Evaluation Results Banner */}
      {isSubmitted && evaluation && (
        <div className={`p-6 rounded-2xl border ${
          evaluation.score_percentage >= 70 
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
            : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
        } shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-scaleUp`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              evaluation.score_percentage >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">
                Score: {evaluation.score_percentage}%
              </h3>
              <p className="text-xs opacity-90 mt-0.5">
                {evaluation.correct_count} of {evaluation.total_questions} questions correct.
                {evaluation.score_percentage >= 70 ? ' Outstanding mastery!' : ' Review the explanations below to improve.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleRetake}
            className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs border border-white/20 transition-all"
          >
            Retake Quiz
          </button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const userAns = selectedAnswers[q.id];
          const feedbackItem = evaluation?.feedback?.find(f => f.question_id === q.id);
          const isCorrect = feedbackItem?.is_correct;

          return (
            <div 
              key={q.id}
              className={`bg-slate-800/80 border rounded-2xl p-6 transition-all ${
                isSubmitted 
                  ? isCorrect 
                    ? 'border-emerald-500/50 bg-emerald-950/10' 
                    : 'border-rose-500/50 bg-rose-950/10'
                  : 'border-slate-700/70 hover:border-slate-600'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 font-extrabold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {q.topic || 'General'} • {q.difficulty || 'Medium'}
                  </span>
                </div>

                {isSubmitted && (
                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Question Text */}
              <h4 className="text-base font-semibold text-white mb-4 leading-relaxed">
                {q.question_text}
              </h4>

              {/* Options (MCQ) or Textarea (Short Answer) */}
              {q.question_type === 'mcq' && q.options && q.options.length > 0 ? (
                <div className="space-y-2.5">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = userAns === opt;
                    const isTargetAnswer = isSubmitted && (opt === q.correct_answer || opt.startsWith(q.correct_answer));

                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`p-3.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                          isSubmitted
                            ? isTargetAnswer
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                              : isSelected
                                ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                                : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60'
                            : isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                              : 'bg-slate-900/60 border-slate-700/80 hover:bg-slate-900 hover:border-slate-600 text-slate-300'
                        }`}
                      >
                        <span>{opt}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <textarea
                    rows={3}
                    disabled={isSubmitted}
                    value={userAns || ''}
                    onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                    placeholder="Type your explanation or concise short answer here..."
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  {isSubmitted && (
                    <div className="mt-2 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
                      <strong className="text-emerald-400">Sample Ideal Answer:</strong> {q.correct_answer}
                    </div>
                  )}
                </div>
              )}

              {/* Explanation Dropdown / Box when submitted */}
              {isSubmitted && q.explanation && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300">
                  <span className="font-bold text-indigo-400 block mb-1">
                    💡 Explanation:
                  </span>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Bottom Submit Action */}
      {!isSubmitted && (
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount === 0}
            className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Grading Assessment...</span>
            ) : (
              <>
                <span>Submit Answers ({answeredCount}/{questions.length})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
