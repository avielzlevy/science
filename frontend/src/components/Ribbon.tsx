import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { SpaceArt, PhysicsArt, BiologyArt, ComputersArt, ChemistryArt, WildcardArt, DiceArt } from './CategoryArt';

gsap.registerPlugin(useGSAP);

const BLOB_1 = "M45.7,-76.1C58.9,-69.3,68.8,-53.9,74.5,-37.8C80.2,-21.7,81.7,-4.9,78.5,10.6C75.3,26.1,67.4,40.3,55.4,50.6C43.4,60.9,27.3,67.3,10.2,71.2C-6.9,75.1,-25.1,76.5,-41.6,71.1C-58.1,65.7,-72.9,53.5,-80.7,37.3C-88.5,21.1,-89.3,0.9,-83.1,-16.8C-76.9,-34.5,-63.7,-49.7,-48,-55.9C-32.3,-62.1,-16.2,-59.4,0.8,-60.7C17.8,-62,35.6,-67.3,45.7,-76.1Z";
const BLOB_2 = "M42.4,-64.8C54.1,-58.5,62.2,-44.6,69.5,-29.4C76.8,-14.2,83.3,2.4,78.9,15.8C74.5,29.2,59.2,39.4,46.2,50.7C33.2,62,22.5,74.4,9,78.3C-4.5,82.2,-20.7,77.6,-33.5,68.9C-46.3,60.2,-55.8,47.4,-65.3,33.5C-74.8,19.6,-84.3,4.6,-83.4,-10.1C-82.5,-24.8,-71.2,-39.2,-57.8,-47.5C-44.4,-55.8,-28.9,-58,-14.2,-64C0.5,-70,15.8,-79.8,30.7,-71.1C45.6,-62.4,60.1,-65.2,42.4,-64.8Z";

function LiquidFill({ active, color, x, y }: { active: boolean, color: string, x: number, y: number }) {
  const container = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (active) {
      gsap.to('.liquid-path', { opacity: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
      gsap.to('.liquid-blob-1', { scale: 50, rotation: 65, duration: 1.5, ease: 'power3.out', overwrite: 'auto' });
      gsap.to('.liquid-blob-2', { scale: 55, rotation: -45, duration: 2.0, ease: 'power2.out', overwrite: 'auto' });
    } else {
      gsap.to('.liquid-path', { opacity: 0, duration: 1.0, ease: 'power2.inOut', overwrite: 'auto' });
      gsap.to(['.liquid-blob-1', '.liquid-blob-2'], { scale: 0, rotation: 0, duration: 1.2, ease: 'power3.inOut', overwrite: 'auto' });
    }
  }, { dependencies: [active], scope: container });

  return (
      <div ref={container} className="fixed inset-0 pointer-events-none z-0 mix-blend-multiply">
        <svg 
           className="absolute pointer-events-none"
           style={{
              left: x,
              top: y,
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
              overflow: 'visible'
           }}
           viewBox="-100 -100 200 200"
        >
           <g className="liquid-blob-1 origin-center" style={{ transformOrigin: 'center', transform: 'scale(0)' }}>
             <path className="liquid-path" fill={color} d={BLOB_1} style={{ opacity: 0 }} />
           </g>
           <g className="liquid-blob-2 origin-center" style={{ transformOrigin: 'center', transform: 'scale(0)' }}>
             <path className="liquid-path" fill={color} opacity={0.6} d={BLOB_2} style={{ opacity: 0 }} />
           </g>
        </svg>
      </div>
  );
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES = [
  { id: 'space', title: 'Space', Artwork: SpaceArt, bgColor: '#AEC6CF' }, // Pastel Blue
  { id: 'physics', title: 'Physics', Artwork: PhysicsArt, bgColor: '#C2B280' }, // Sand/Gold
  { id: 'biology', title: 'Biology', Artwork: BiologyArt, bgColor: '#98FB98' }, // Pale Green
  { id: 'computers', title: 'Computers', Artwork: ComputersArt, bgColor: '#E6E6FA' }, // Lavender
  { id: 'chemistry', title: 'Chemistry', Artwork: ChemistryArt, bgColor: '#FFB347' }, // Pastel Orange
];

const ALL_CARDS = [
  ...CATEGORIES,
  { id: 'wildcard', bgColor: '#FF6961' }, // Pastel Red
  { id: 'dice', bgColor: '#D3D3D3' }      // Light Grey
];

export function Ribbon({ onDiceRoll, onSelectCategory }: { onDiceRoll: () => void, onSelectCategory: (cat: string) => void }) {
  const [isRolling, setIsRolling] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [origins, setOrigins] = useState<Record<string, { x: number, y: number }>>({});

  const handleMouseEnter = (e: React.MouseEvent, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setOrigins(prev => ({ ...prev, [id]: { x, y } }));
    setHoveredId(id);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
  };

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
    <div className="relative w-full min-h-[400px]">
      
      {/* Immersive Global Background - Liquid Full Color Expansion via GSAP SVG Blobs */}
      {ALL_CARDS.map(cat => (
        origins[cat.id] && (
          <LiquidFill 
            key={cat.id} 
            active={hoveredId === cat.id} 
            color={cat.bgColor} 
            x={origins[cat.id].x} 
            y={origins[cat.id].y} 
          />
        )
      ))}

      <div className="w-full max-w-[1700px] mx-auto px-4 md:px-8 py-4 relative z-10">
        <div 
          className="flex flex-row flex-nowrap items-stretch justify-center gap-2 md:gap-4 w-full h-[26rem] lg:h-[30rem]"
          onMouseLeave={handleMouseLeave}
        >
          {/* Category Tiles (5 Items) */}
        {CATEGORIES.map((cat) => {
          const Artwork = cat.Artwork;
          return (
            <motion.div
              key={cat.id}
              onMouseEnter={(e) => handleMouseEnter(e, cat.id)}
              className={cn(
                "flex-1 min-w-0 max-w-[18rem] h-full relative rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden group border border-foreground/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] cursor-pointer bg-white"
              )}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              onClick={() => safeSelectCategory(cat.id)}
            >
              <div className="absolute inset-0">
                 <Artwork />
              </div>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-colors duration-500 group-hover:bg-white/20 group-hover:border-white/30 z-20">
                <h3 className="text-white/95 font-sans font-semibold tracking-[0.2em] uppercase text-xs lg:text-sm drop-shadow-md">{cat.title}</h3>
              </div>
            </motion.div>
          );
        })}

        {/* The Dice and Wildcard Section */}
        {/* The Wildcard Tile */}
        <motion.div
          onMouseEnter={(e) => handleMouseEnter(e, 'wildcard')} 
          className={cn(
            "flex-1 min-w-0 max-w-[18rem] h-full relative rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden group border border-foreground/5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] cursor-pointer bg-white"
          )}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          onClick={() => safeSelectCategory('wildcard')}
        >
          <div className="absolute inset-0">
             <WildcardArt />
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-colors duration-500 group-hover:bg-white/20 group-hover:border-white/30 z-20">
            <h3 className="text-white/95 font-sans font-semibold tracking-[0.2em] uppercase text-xs lg:text-sm drop-shadow-md">Wildcard</h3>
          </div>
        </motion.div>

        {/* The Dice Button (Separate Action) */}
        <motion.div
          onMouseEnter={(e) => handleMouseEnter(e, 'dice')} 
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
          <div className="absolute inset-0">
             <DiceArt />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-colors duration-500 group-hover:bg-white/20 group-hover:border-white/30 z-20">
             <h3 className="text-white/95 font-sans font-semibold tracking-[0.2em] uppercase text-xs lg:text-sm drop-shadow-md">
                {isRolling ? "Computing" : "Dice"}
             </h3>
          </div>
        </motion.div>
      </div>
     </div>
    </div>
  );
}
