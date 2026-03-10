'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
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
    <main className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden font-body">
      
      {/* Background ambient glow matching "The Clean Room" */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-50/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-gray-50/50 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="w-full max-w-[100vw] z-10 relative mt-16">
        <header className="px-12 mb-16 max-w-7xl">
          <h1 className="text-6xl md:text-8xl font-heading font-extrabold text-text tracking-tighter mb-4">
            ResearchReels
          </h1>
          <p className="text-xl md:text-3xl font-light text-foreground/60 tracking-tight">
            Enter the lab.
          </p>
        </header>

        <Ribbon 
          onSelectCategory={handleSelectCategory}
          onDiceRoll={handleDiceRoll}
        />
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
