'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ribbon } from '@/components/Ribbon';
import { Stage } from '@/components/Stage';
import { discoverSkit, getSkitById, markSkitPlayed } from '@/lib/api';
import type { SkitDetail } from '@/lib/types';

interface StageState {
  category?: string;
  isWildcard: boolean;
  loading: boolean;
  error?: string;
  skit?: SkitDetail;
}

export default function Home() {
  const [activeStage, setActiveStage] = useState<StageState | null>(null);

  const fetchSkit = async (params: { categorySlug?: string; isRandom?: boolean }) => {
    setActiveStage({
      category: params.categorySlug,
      isWildcard: params.isRandom ?? false,
      loading: true,
    });

    try {
      const discovery = await discoverSkit(params);
      const skit = await getSkitById(discovery.skitId);
      setActiveStage((prev) =>
        prev
          ? { ...prev, loading: false, skit, category: prev.category || skit.category?.slug }
          : null,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setActiveStage((prev) => (prev ? { ...prev, loading: false, error: message } : null));
    }
  };

  const handleSelectCategory = (category: string) => {
    fetchSkit({ categorySlug: category });
  };

  const handleDiceRoll = () => {
    fetchSkit({ isRandom: true });
  };

  const handleCloseStage = () => {
    if (activeStage?.skit) {
      markSkitPlayed(activeStage.skit.id).catch(() => {});
    }
    setActiveStage(null);
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center relative overflow-hidden font-body text-black">
      
      {/* Subdued Cinematic Lighting Layer */}
      <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-white/50 to-transparent opacity-90 blur-[120px] pointer-events-none mix-blend-overlay" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent opacity-60 blur-[100px] pointer-events-none" />
      
      {/* Structural Minimal Grid */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize: '100px 100px' }}
      />

      {/* Main Content */}
      <div className="w-full max-w-[100vw] z-10 relative mt-10">
        <motion.header 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
          className="px-12 mb-8 max-w-7xl mx-auto text-center flex flex-col items-center justify-center relative z-20 mix-blend-exclusion"
        >
          <h1 className="text-6xl md:text-[4rem] font-heading font-extrabold text-black tracking-tighter mb-4 leading-none">
            Research<span className="text-rose-400 drop-shadow-sm">Reels</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-white/70 tracking-tight max-w-2xl mt-2 drop-shadow-sm">
            Curated scientific narratives delivered through a cinematic digital theater.
          </p>
        </motion.header>

        <motion.div
           initial={{ opacity: 0, y: 50 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
        >
          <Ribbon 
            onSelectCategory={handleSelectCategory}
            onDiceRoll={handleDiceRoll}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {activeStage && (
          <Stage 
            onClose={handleCloseStage}
            category={activeStage.category}
            isWildcard={activeStage.isWildcard}
            skit={activeStage.skit}
            loading={activeStage.loading}
            error={activeStage.error}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
