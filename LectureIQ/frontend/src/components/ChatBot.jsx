import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileText, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { chatWithLecture, getChatHistory } from '../services/api';

export default function ChatBot({ lecture, onSeekTime }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "What are the core trade-offs explained in this lecture?",
    "Summarize the main mathematical formulas or rules",
    "What key concepts are most likely to appear on an exam?",
    "Explain the underlying mechanism step-by-step"
  ];

  useEffect(() => {
    loadHistory();
  }, [lecture.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadHistory = async () => {
    try {
      const history = await getChatHistory(lecture.id);
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            id: 'init',
            role: 'assistant',
            content: `Hello! I am your LectureIQ study tutor for **${lecture.title}**. Ask me any question, and I'll explain it grounded directly in your lecture material with exact citations!`,
            citations: []
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const tempUserMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await chatWithLecture(lecture.id, query);
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: res.answer,
          citations: res.citations || []
        }
      ]);
    } catch (e) {
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error while synthesizing the answer. Please try again.',
          citations: []
        }
      ]);
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl flex flex-col h-[650px] overflow-hidden animate-fadeIn">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Grounded Lecture Q&A Assistant</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                RAG Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">Answers verified against lecture sections with direct quotes</p>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isUser ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-indigo-400'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                isUser
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-md'
              }`}>
                <p className="whitespace-pre-line">{m.content}</p>

                {/* Citations block */}
                {!isUser && m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                      Source References:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.citations.map((cite, cIdx) => (
                        <div
                          key={cIdx}
                          title={cite.excerpt}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-700/40 text-[11px] text-indigo-300 hover:bg-indigo-900/60 transition-colors"
                        >
                          <FileText className="w-3 h-3 text-indigo-400" />
                          <span>{cite.heading}</span>
                          {cite.time_str && <span className="font-mono text-slate-400">{cite.time_str}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-slate-700 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-400 rounded-bl-none flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 text-xs">Retrieving relevant passages & synthesizing answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      <div className="px-6 py-2 bg-slate-900/40 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Suggestions:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full whitespace-nowrap border border-slate-700 transition-colors shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 border-t border-slate-700/80 bg-slate-900/80 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this lecture..."
          className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md shadow-indigo-600/30 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
