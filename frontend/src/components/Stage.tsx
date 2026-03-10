'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, ShieldCheck, ShieldAlert } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock transcript
const TRANSCRIPT = [
  { start: 0, end: 3, text: "In the deep void of space..." },
  { start: 3, end: 6, text: "there whispers a signal older than time." },
  { start: 6, end: 10, text: "Wait. Was that real? Or is it a glitch in the simulation?" },
];

const MOCK_AUDIO_SRC = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export function Stage({ 
  onClose, 
  isWildcard = false, 
  category 
}: { 
  onClose: () => void, 
  isWildcard?: boolean, 
  category?: string 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reality Anchor / Trust Badge mock score
  const reliabilityScore = isWildcard ? 25 : 98; // Low for wildcard, high for normal

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      // Show game modal when audio reaches the end of the mock transcript (e.g. 10s)
      if (isWildcard && audioRef.current.currentTime > 10 && !showGame && gameResult === null) {
        audioRef.current.pause();
        setIsPlaying(false);
        setShowGame(true);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      {/* Heavily Blurred Background Cover */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity blur-3xl scale-110" 
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200')` }} 
      />

      <button 
        onClick={onClose}
        className="absolute top-8 right-8 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
      >
        <X size={24} />
      </button>

      {/* Trust Badge - The Reality Anchor */}
      <div className="absolute top-8 left-8 z-50 flex items-center gap-3 px-4 py-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md">
        {reliabilityScore > 80 ? (
          <ShieldCheck className="text-green-400" size={20} />
        ) : (
          <ShieldAlert className="text-yellow-400 animate-pulse" size={20} />
        )}
        <span className="font-heading font-semibold text-white tracking-widest uppercase text-sm">
          Reality {reliabilityScore}%
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-8">
        
        {/* Cover Art - Sharp */}
        <motion.div 
          className="w-64 h-96 rounded-2xl shadow-2xl overflow-hidden border border-white/10 mb-12"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        >
          <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&h=900&fit=crop" className="w-full h-full object-cover" alt="Skit Cover" />
        </motion.div>

        {/* Transcript (Line-by-Line) */}
        <div className="w-full max-w-2xl text-center space-y-4 mb-12 h-32 flex flex-col justify-center">
          {TRANSCRIPT.map((line, idx) => {
            const isActive = currentTime >= line.start && currentTime <= line.end;
            const isPast = currentTime > line.end;
            return (
              <motion.p
                key={idx}
                animate={{
                  opacity: isActive ? 1 : isPast ? 0.3 : 0.1,
                  scale: isActive ? 1.05 : 1,
                  y: isActive ? 0 : isPast ? -10 : 10,
                }}
                className={cn(
                  "font-body text-xl md:text-3xl font-medium transition-all duration-300 absolute w-full",
                  isActive ? "text-white" : "text-white/50"
                )}
                style={{ visibility: (isActive || isPast || idx === 0) ? 'visible' : 'hidden' }}
              >
                {line.text}
              </motion.p>
            );
          })}
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={togglePlay}
            className="p-6 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
        </div>

        <audio 
          ref={audioRef} 
          src={MOCK_AUDIO_SRC} 
          onTimeUpdate={handleTimeUpdate} 
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* Wildcard Game (Sci-Fi or Fact) */}
      <AnimatePresence>
        {showGame && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <h2 className="text-5xl font-heading font-bold text-white mb-16 tracking-tighter">
              Sci-Fi or Fact?
            </h2>
            
            {gameResult === null ? (
              <div className="flex gap-8">
                <button 
                  onClick={() => setGameResult('lost')}
                  className="px-12 py-6 text-2xl font-bold rounded-full border-2 border-white/20 text-white hover:bg-white hover:text-black transition-all"
                >
                  SCI-FI
                </button>
                <button 
                  onClick={() => setGameResult('won')}
                  className="px-12 py-6 text-2xl font-bold rounded-full bg-cta text-white hover:brightness-125 transition-all shadow-[0_0_30px_rgba(0,102,204,0.5)]"
                >
                  REAL SCIENCE
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-8"
              >
                <div className={cn(
                  "text-6xl font-bold font-heading",
                  gameResult === 'won' ? "text-green-400" : "text-red-500"
                )}>
                  {gameResult === 'won' ? "CORRECT. IT'S REAL." : "WRONG. IT'S A REALITY."}
                </div>
                <p className="text-xl text-white/70 max-w-lg text-center font-body">
                  Yes, this wild story actually happened. Science is stranger than fiction.
                </p>
                <button 
                  onClick={onClose}
                  className="mt-8 px-8 py-4 rounded-full bg-white text-black font-bold uppercase tracking-widest hover:scale-105 transition-all"
                >
                  Return to Lab
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
