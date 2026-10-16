import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Mic, 
  Square, 
  CheckCircle, 
  AlertCircle,
  FileCode,
  Music
} from 'lucide-react';
import { uploadLecture } from '../services/api';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'text'
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `Lecture_Recording_${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFile(audioFile);
        if (!title) {
          setTitle(`Audio Recording ${new Date().toLocaleTimeString()}`);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Microphone access denied or unsupported browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a lecture title.');
      return;
    }
    if (activeTab === 'file' && !selectedFile) {
      setError('Please select an audio file, PDF, or text document.');
      return;
    }
    if (activeTab === 'text' && !rawText.trim()) {
      setError('Please paste or enter study notes.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('subject', subject.trim() || 'General');

      if (activeTab === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('source_type', 'text');
        formData.append('raw_text', rawText);
      }

      const res = await uploadLecture(formData);
      setIsLoading(false);
      onUploadSuccess(res.lecture_id);
      onClose();
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.detail || 'Failed to upload and process lecture.');
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upload New Lecture</h2>
              <p className="text-xs text-slate-400">Transcribe audio, parse PDFs, and generate study resources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lecture Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Intro to Quantum Computing"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-800/90 p-1 border border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'file'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload Audio / PDF / Text
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'text'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paste Notes
            </button>
          </div>

          {activeTab === 'file' ? (
            <div className="space-y-3">
              {/* Drag & Drop Box */}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-2xl p-6 cursor-pointer bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
                <input
                  type="file"
                  accept=".mp3,.wav,.m4a,.webm,.ogg,.pdf,.txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  {selectedFile ? selectedFile.name : 'Click or drag file to upload'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supported: Audio (MP3, WAV, M4A, WEBM), PDF, TXT, Markdown
                </p>
              </label>

              {/* Or Live Recording option */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${isRecording ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-700 text-slate-300'}`}>
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Record Lecture Directly</p>
                    <p className="text-[11px] text-slate-400">
                      {isRecording ? `Recording in progress: ${formatTimer(recordingSeconds)}` : 'Capture live lecture audio from microphone'}
                    </p>
                  </div>
                </div>

                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Record Mic</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Paste Lecture Transcript or Notes *
              </label>
              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste verbatim lecture transcripts, textbook chapters, or seminar notes here..."
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/25 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing AI Pipeline...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Start Processing</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
