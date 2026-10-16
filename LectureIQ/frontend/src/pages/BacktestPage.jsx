import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Target, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import { runBacktestSuite } from '../services/api';

export default function BacktestPage() {
  const [data, setData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    handleRunBacktest();
  }, []);

  const handleRunBacktest = async () => {
    try {
      setIsRunning(true);
      const res = await runBacktestSuite();
      setData(res);
      setIsRunning(false);
    } catch (e) {
      setIsRunning(false);
      console.error(e);
    }
  };

  const handleDownloadReport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LectureIQ_Backtest_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const retrieval = data?.retrieval_benchmark;
  const latency = data?.latency_profile;
  const simulation = data?.exam_simulation;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-700/40 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>AI Benchmark & Backtesting Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Automated Quality & Efficiency Evaluation
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Precision@K, Mean Reciprocal Rank (MRR), Grounding Faithfulness, Sub-millisecond Latencies & Exam Simulation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadReport}
            disabled={!data || isRunning}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Report</span>
          </button>

          <button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Test Suite...' : 'Run Live Backtest'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Precision@3 */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Retrieval Precision@3</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {retrieval ? `${retrieval.precision_at_3_pct}%` : '—'}
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">
            Top-3 Passage Recall
          </p>
        </div>

        {/* Mean Reciprocal Rank */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Mean Reciprocal Rank (MRR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {retrieval ? retrieval.mean_reciprocal_rank : '—'}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Rank 1.00 = Instant exact top hit
          </p>
        </div>

        {/* Sub-millisecond Latency */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Vector Search Latency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {retrieval ? `${retrieval.avg_query_latency_ms} ms` : '—'}
          </div>
          <p className="text-[11px] text-amber-300 font-semibold mt-1">
            ⚡ Ultra-high efficiency engine
          </p>
        </div>

        {/* Faithfulness Score */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Answer Faithfulness</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {data ? `${data.faithfulness_score_pct}%` : '—'}
          </div>
          <p className="text-[11px] text-purple-300 font-semibold mt-1">
            Hallucination-free citations
          </p>
        </div>

      </div>

      {/* Predictive Student Exam Simulation */}
      {simulation && (
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span>Predictive Knowledge Backtest & Exam Simulation</span>
              </h2>
              <p className="text-xs text-slate-400">
                Monte-Carlo knowledge projection based on flashcard mastery rates and quiz attempt trajectories
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                Predicted Grade: <strong className="text-white text-sm">{simulation.readiness_grade}</strong>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
                Predicted Score: <strong className="text-white text-sm">{simulation.predicted_exam_score}%</strong>
              </div>
            </div>
          </div>

          {/* Topic Risk Breakdown Heatmap */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Topic-Wise Examination Readiness
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {simulation.topic_analysis?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-200 block truncate max-w-[170px]">
                      {item.topic}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.card_count} flashcards evaluated
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-extrabold ${
                      item.risk_level === 'Low Risk' 
                        ? 'text-emerald-400' 
                        : item.risk_level === 'Medium Risk' 
                          ? 'text-amber-400' 
                          : 'text-rose-400'
                    }`}>
                      {item.mastery_pct}%
                    </span>
                    <span className={`block text-[10px] font-semibold uppercase ${
                      item.risk_level === 'Low Risk' 
                        ? 'text-emerald-400/80' 
                        : item.risk_level === 'Medium Risk' 
                          ? 'text-amber-400/80' 
                          : 'text-rose-400/80'
                    }`}>
                      {item.risk_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Retrieval Evaluation Test Table */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Ground Truth Retrieval Benchmark Logs</span>
            </h2>
            <p className="text-xs text-slate-400">
              Evaluated queries against lecture knowledge base with semantic ranking verification
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-900 px-3 py-1 rounded-full text-indigo-300 border border-slate-700">
            {retrieval?.total_test_queries || 0} Test Vectors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4">Evaluation Query</th>
                <th className="py-3 px-4">Target Topic</th>
                <th className="py-3 px-4">Top 1 Retrieved Chunk</th>
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {retrieval?.test_details?.map((test, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                    {test.query}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-700/60 text-indigo-300 font-semibold text-[11px]">
                      {test.expected_topic}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                    {test.retrieved_top1}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-indigo-300">
                    {test.rank === 1 ? '🥇 #1' : `#${test.rank}`}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {test.passed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" /> FAILED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
