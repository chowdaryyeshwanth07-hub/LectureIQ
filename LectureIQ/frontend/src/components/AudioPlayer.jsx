import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  FastForward 
} from 'lucide-react';

export default function AudioPlayer({ duration = 1800, currentTime = 0, onTimeUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(currentTime);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  useEffect(() => {
    setTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1 * playbackRate;
          onTimeUpdate && onTimeUpdate(next);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackRate, duration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setTime(newTime);
    onTimeUpdate && onTimeUpdate(newTime);
  };

  const skip = (seconds) => {
    const newTime = Math.max(0, Math.min(duration, time + seconds));
    setTime(newTime);
    onTimeUpdate && onTimeUpdate(newTime);
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIdx]);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      
      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => skip(-10)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Rewind 10s"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <button
          onClick={() => skip(10)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Forward 10s"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          onClick={cycleSpeed}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold border border-slate-700"
          title="Change playback speed"
        >
          {playbackRate}x
        </button>
      </div>

      {/* Scrubber Timeline */}
      <div className="flex-1 w-full flex items-center gap-3">
        <span className="text-xs font-mono text-slate-400 min-w-[45px]">
          {formatTime(time)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 100}
          step={1}
          value={time}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />

        <span className="text-xs font-mono text-slate-400 min-w-[45px]">
          {formatTime(duration)}
        </span>
      </div>

      {/* Speaker icon indicator */}
      <div className="hidden md:flex items-center gap-2 text-indigo-400 text-xs font-semibold">
        <Volume2 className="w-4 h-4" />
        <span>Audio Synced</span>
      </div>

    </div>
  );
}
