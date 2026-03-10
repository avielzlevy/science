'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ribbon } from '@/components/Ribbon';
import { Stage } from '@/components/Stage';

export default function Home() {
  const [activeStage, setActiveStage] = useState<{ category?: string, isWildcard: boolean } | null>(null);

  const handleSelectCategory = (category: string) => {
    setActiveStage({ category, isWildcard: false });
  };

  const handleDiceRoll = () => {
    setActiveStage({ isWildcard: true });
  };

  const handleCloseStage = () => {
    setActiveStage(null);
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center relative overflow-hidden font-body text-[#1D1D1F]">
      
      {/* Subdued Cinematic Lighting Layer */}
      <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-white/50 to-transparent opacity-90 blur-[120px] pointer-events-none mix-blend-overlay" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent opacity-60 blur-[100px] pointer-events-none" />
      
      {/* Structural Minimal Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '100px 100px' }}
      />

      {/* Main Content */}
      <div className="w-full max-w-[100vw] z-10 relative mt-10">
        <motion.header 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
          className="px-12 mb-8 max-w-7xl mx-auto text-center flex flex-col items-center justify-center"
        >
          <h1 className="text-6xl md:text-[4rem] font-heading font-extrabold text-[#1D1D1F] tracking-tighter mb-4 leading-none">
            Research<span className="text-[#0066CC]">Reels</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-[#1D1D1F]/60 tracking-tight max-w-2xl mt-2">
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
          />
        )}
      </AnimatePresence>
    </main>
  );
}
