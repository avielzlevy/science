'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, ShieldCheck, ShieldAlert } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SkitDetail } from '@/lib/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Dynamic transcripts mapping
const TRANSCRIPTS: Record<string, {start: number, end: number, text: string}[]> = {
  space: [
    { start: 0, end: 3, text: "The Voyager probe has left the solar system." },
    { start: 3, end: 6, text: "But it just sent back an impossible signal." },
    { start: 6, end: 10, text: "It sounds... exactly like a human heartbeat." },
  ],
  physics: [
    { start: 0, end: 3, text: "Quantum entanglement defies logic." },
    { start: 3, end: 6, text: "Change the spin of a particle here, and its twin flips across the galaxy." },
    { start: 6, end: 10, text: "Einstein called it 'spooky action'. He was right to be afraid." },
  ],
  biology: [
    { start: 0, end: 3, text: "Deep inside the Mariana Trench..." },
    { start: 3, end: 6, text: "we found an organism that doesn't use DNA." },
    { start: 6, end: 10, text: "It uses pure silicon. It's essentially a living machine." },
  ],
  computers: [
    { start: 0, end: 3, text: "In 1989, a worm was released on the ARPANET." },
    { start: 3, end: 6, text: "It mapped every machine it touched." },
    { start: 6, end: 10, text: "But it never stopped running. Even today." },
  ],
  chemistry: [
    { start: 0, end: 3, text: "Drop francium into water." },
    { start: 3, end: 6, text: "The reaction is so violent it shatters the glass." },
    { start: 6, end: 10, text: "Now imagine that reaction... in reverse." },
  ],
  wildcard: [
    { start: 0, end: 3, text: "Wait. Was that real?" },
    { start: 3, end: 6, text: "Or is it a glitch in the simulation?" },
    { start: 6, end: 10, text: "Let's find out." },
  ]
};

export const CATEGORY_COLORS: Record<string, string> = {
  space: '#020617', // Deep Cosmos Space Black
  physics: '#312E81', // Indigo Night
  biology: '#064E3B', // Deep Emerald Pine
  computers: '#1E1B4B', // Midnight Violet
  chemistry: '#450A0A', // Blood Maroon
  wildcard: '#4C0519', // Rose Black
  dice: '#171717', // Neutral Dark
};

const MOCK_AUDIO_SRC = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export function Stage({ 
  onClose, 
  isWildcard = false, 
  category,
  skit,
  loading = false,
  error,
}: { 
  onClose: () => void;
  isWildcard?: boolean;
  category?: string;
  skit?: SkitDetail;
  loading?: boolean;
  error?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Safe category fallback for transcripts
  const safeCategory = category && TRANSCRIPTS[category] ? category : 'wildcard';
  const activeTranscript = skit
    ? [
        { start: 0, end: 5, text: skit.worldBefore || 'The world as we knew it…' },
        { start: 5, end: 10, text: skit.breakthrough || 'Then everything changed…' },
        { start: 10, end: 15, text: skit.newReality || 'A new reality emerged…' },
      ]
    : TRANSCRIPTS[safeCategory];
  const reliabilityScore = skit?.reliabilityScore ?? (isWildcard ? 25 : 98);
  const audioSrc = skit?.voiceoverUrl || MOCK_AUDIO_SRC;

  return (
    <motion.div
      layoutId={`card-${safeCategory}`}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Dynamic Background Cover derived from Category Hex */}
      <div 
        className="absolute inset-0 opacity-[1] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent mix-blend-screen" 
        style={{ backgroundColor: CATEGORY_COLORS[safeCategory] || '#000000' }}
      />
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-black/5 to-transparent mix-blend-multiply pointer-events-none" />

      <button 
        onClick={onClose}
        className="absolute top-8 right-8 z-50 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-3xl transition-all shadow-sm border border-white/10"
      >
        <X size={24} />
      </button>

      {/* Trust Badge - The Reality Anchor */}
      <div className="absolute top-8 left-8 z-50 flex items-center gap-3 px-5 py-3 rounded-full border border-black/10 bg-white/80 backdrop-blur-3xl shadow-sm text-black">
        {reliabilityScore > 80 ? (
          <ShieldCheck className="text-emerald-500" size={20} />
        ) : (
          <ShieldAlert className="text-orange-500 animate-[pulse_2s_ease-in-out_infinite]" size={20} />
        )}
        <span className="font-heading font-bold tracking-widest uppercase text-xs">
          Reality {reliabilityScore}%
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/70 font-body text-lg tracking-wide">Discovering research…</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-6 max-w-md text-center">
            <p className="text-white/90 font-heading font-bold text-2xl">Pipeline Warming Up</p>
            <p className="text-white/60 font-body text-lg">{error}</p>
            <button onClick={onClose} className="mt-4 px-8 py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest hover:scale-105 transition-all">
              Go Back
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-8">
        
        <div className="perspective-1000 mb-16">
          {/* Cover Art - True 3D Floating */}
          <motion.div 
            className="w-[28rem] h-[40rem] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_10px_rgba(255,255,255,0.05)_inset] overflow-hidden border border-white/10 mb-8 flex flex-col items-center justify-center bg-gradient-to-br from-white/10 to-black relative backdrop-blur-3xl"
            initial={{ scale: 0.9, opacity: 0, rotateX: 20, y: 50 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0, y: 0 }}
            whileHover={{ rotateY: 5, rotateX: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
             {/* Clean Room Decorative elements */}
             <div className="absolute inset-0 opacity-[0.2] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none mix-blend-overlay" />
             
             <div className="absolute top-12 left-12 w-24 h-1 bg-white/20 rounded-full" style={{ transform: 'translateZ(20px)' }} />
             <div className="absolute bottom-12 right-12 w-16 h-1 bg-white/20 rounded-full" style={{ transform: 'translateZ(20px)' }} />

             {skit?.coverArtUrl && (
               <img src={skit.coverArtUrl} alt="Cover art" className="absolute inset-0 w-full h-full object-cover z-0 rounded-[2rem]" />
             )}
             <motion.div 
                 className="font-heading font-black text-6xl text-white/90 z-10 text-center px-8 uppercase tracking-tighter mix-blend-exclusion"
                 style={{ transform: 'translateZ(40px)' }}
             >
               {skit?.research?.title || category || (isWildcard ? "Wildcard Data" : "Research File")}
             </motion.div>
          </motion.div>
        </div>

        {/* Transcript (Line-by-Line) */}
        <div className="w-full max-w-3xl text-center space-y-6 mb-16 h-40 flex flex-col justify-center relative bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-white shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          {activeTranscript.map((line, idx) => {
            const isActive = currentTime >= line.start && currentTime <= line.end;
            const isPast = currentTime > line.end;
            return (
              <motion.p
                key={idx}
                animate={{
                  opacity: isActive ? 1 : isPast ? 0.2 : 0.05,
                  scale: isActive ? 1.05 : 1,
                  y: isActive ? 0 : isPast ? -15 : 15,
                  filter: isActive ? "blur(0px)" : "blur(2px)",
                }}
                className={cn(
                  "font-body text-2xl md:text-4xl font-semibold transition-all duration-500 absolute w-full tracking-tight",
                  isActive ? "text-black drop-shadow-sm" : "text-black/40"
                )}
                style={{ visibility: (isActive || isPast || idx === 0) ? 'visible' : 'hidden' }}
              >
                {line.text}
              </motion.p>
            );
          })}
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-8">
          <button 
            onClick={togglePlay}
            className="p-8 rounded-full bg-black text-white hover:scale-110 active:scale-95 transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.2)]"
          >
            {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
          </button>
        </div>

        <audio 
          ref={audioRef} 
          src={audioSrc} 
          onTimeUpdate={handleTimeUpdate} 
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* Wildcard Game (Sci-Fi or Fact) */}
      <AnimatePresence>
        {showGame && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(40px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-white/60"
          >
            <h2 className="text-[6rem] font-heading font-black text-black mb-20 tracking-tighter drop-shadow-sm">
              Sci-Fi or Fact?
            </h2>
            
            {gameResult === null ? (
              <div className="flex gap-12">
                <button 
                  onClick={() => setGameResult(skit ? (skit.sciFiFactRating > 0.5 ? 'won' : 'lost') : 'lost')}
                  className="px-16 py-8 text-3xl font-bold rounded-full border border-black/10 text-black hover:bg-black hover:text-white transition-all duration-500 shadow-xl bg-white"
                >
                  SCI-FI
                </button>
                <button 
                  onClick={() => setGameResult(skit ? (skit.sciFiFactRating <= 0.5 ? 'won' : 'lost') : 'won')}
                  className="px-16 py-8 text-3xl font-bold rounded-full bg-[#0066CC] text-white hover:bg-blue-700 transition-all duration-500 shadow-[0_10px_40px_rgba(0,102,204,0.4)]"
                >
                  REAL SCIENCE
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="flex flex-col items-center gap-8 bg-white p-20 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-black/5"
              >
                <div className={cn(
                  "text-7xl font-black font-heading tracking-tighter",
                  gameResult === 'won' ? "text-emerald-600" : "text-rose-600"
                )}>
                  {gameResult === 'won' ? "CONFIRMED." : "REJECTED."}
                </div>
                <p className="text-2xl text-black/60 max-w-2xl text-center font-body leading-relaxed">
                  {gameResult === 'won' 
                    ? "Yes, this wild story actually happened. Science is stranger than fiction."
                    : "Unfortunately, that was purely theoretical. We tricked you."}
                </p>
                <button 
                  onClick={onClose}
                  className="mt-12 px-10 py-5 rounded-full bg-black text-white font-bold uppercase tracking-widest hover:scale-105 hover:bg-neutral-800 transition-all shadow-xl"
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
