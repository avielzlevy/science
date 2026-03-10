import { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { SpaceArt, PhysicsArt, BiologyArt, ComputersArt, ChemistryArt, WildcardArt, DiceArt } from './CategoryArt';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES = [
  { id: 'space', title: 'Space', Artwork: SpaceArt },
  { id: 'physics', title: 'Physics', Artwork: PhysicsArt },
  { id: 'biology', title: 'Biology', Artwork: BiologyArt },
  { id: 'computers', title: 'Computers', Artwork: ComputersArt },
  { id: 'chemistry', title: 'Chemistry', Artwork: ChemistryArt },
];

export function Ribbon({ onDiceRoll, onSelectCategory }: { onDiceRoll: () => void, onSelectCategory: (cat: string) => void }) {
  const [isRolling, setIsRolling] = useState(false);

  const handleDiceClick = () => {
    if (isRolling) return;
    setIsRolling(true);
    setTimeout(() => {
      setIsRolling(false);
      onDiceRoll();
    }, 1500);
  };

  const safeSelectCategory = (catId: string) => {
    onSelectCategory(catId);
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 md:px-8 py-4">
      <div className="flex flex-row flex-nowrap items-stretch justify-center gap-2 md:gap-4 w-full h-[26rem] lg:h-[30rem]">
        {/* Category Tiles (5 Items) */}
        {CATEGORIES.map((cat) => {
          const Artwork = cat.Artwork;
          return (
            <motion.div
              key={cat.id}
              className={cn(
                "flex-1 min-w-0 max-w-[18rem] h-full relative rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden group border border-foreground/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] cursor-pointer bg-white"
              )}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              onClick={() => safeSelectCategory(cat.id)}
            >
              <div className="w-full h-[75%] relative p-2">
                 <Artwork />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-[28%] bg-white/80 backdrop-blur-xl flex items-center justify-center border-t border-foreground/5 transition-colors group-hover:bg-white z-20">
                <h3 className="text-[#1D1D1F] font-heading font-extrabold text-lg lg:text-xl tracking-tighter transition-transform duration-500 group-hover:scale-105">{cat.title}</h3>
              </div>
            </motion.div>
          );
        })}

        {/* The Dice and Wildcard Section */}
        {/* The Wildcard Tile */}
        <motion.div
          className={cn(
            "flex-1 min-w-0 max-w-[18rem] h-full relative rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden group border border-foreground/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] cursor-pointer bg-white"
          )}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          onClick={() => safeSelectCategory('wildcard')}
        >
          <div className="w-full h-[70%] relative p-2">
             <WildcardArt />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-[28%] bg-white/80 backdrop-blur-xl flex items-center justify-center border-t border-foreground/5 transition-colors group-hover:bg-white z-20">
            <h3 className="text-[#1D1D1F] font-heading font-extrabold text-lg lg:text-xl tracking-tighter transition-transform duration-500 group-hover:scale-105">Wildcard</h3>
          </div>
        </motion.div>

        {/* The Dice Button (Separate Action) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={
            isRolling
              ? { opacity: 1, y: 0, x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.4, repeat: 3 } }
              : { opacity: 1, y: 0 }
          }
          className={cn(
            "flex-1 min-w-0 max-w-[18rem] h-full relative rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden group border border-foreground/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] bg-white transition-all duration-300",
            isRolling ? "pointer-events-none opacity-80" : "cursor-pointer"
          )}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          onClick={handleDiceClick}
        >
          <div className="w-full h-[70%] relative p-2">
             <DiceArt />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[28%] bg-white/80 backdrop-blur-xl flex items-center justify-center border-t border-foreground/5 z-20 group-hover:bg-white transition-colors">
             <h3 className="text-[#1D1D1F] font-heading font-extrabold text-lg lg:text-xl tracking-tighter transition-transform duration-500 group-hover:scale-105">
                {isRolling ? "Computing" : "Roll"}
             </h3>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
