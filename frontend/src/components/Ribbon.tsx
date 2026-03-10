import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useDragControls } from 'framer-motion';
import { Dices } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES = [
  { id: 'space', title: 'Space', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&h=900&fit=crop' },
  { id: 'physics', title: 'Physics', image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=600&h=900&fit=crop' },
  { id: 'biology', title: 'Biology', image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=600&h=900&fit=crop' },
  { id: 'computers', title: 'Computers', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&h=900&fit=crop' },
  { id: 'chemistry', title: 'Chemistry', image: 'https://images.unsplash.com/photo-1603126857599-f6e1570edbc5?q=80&w=600&h=900&fit=crop' },
];

export function Ribbon({ onDiceRoll, onSelectCategory }: { onDiceRoll: () => void, onSelectCategory: (cat: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const [isRolling, setIsRolling] = useState(false);

  const handleDiceClick = () => {
    if (isRolling) return;
    setIsRolling(true);
    // Simulate API call + calculate animation
    setTimeout(() => {
      setIsRolling(false);
      onDiceRoll();
    }, 1500);
  };

  return (
    <div className="relative w-full overflow-hidden py-12">
      <div className="px-12 mb-6">
        <h2 className="text-3xl font-heading font-bold text-text tracking-tight">Discover the Unknown</h2>
      </div>

      <motion.div
        ref={containerRef}
        className="flex gap-6 px-12 cursor-grab active:cursor-grabbing overflow-x-visible items-center"
        drag="x"
        dragConstraints={{ right: 0, left: -1000 }} // Typically calculated dynamically, this is a simplified bounds
        dragElastic={0.2}
      >
        {/* The Dice Tile */}
        <motion.div
          animate={
            isRolling
              ? { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.4, repeat: 3 } }
              : {}
          }
          className={cn(
            "flex-shrink-0 w-64 h-96 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300",
            "border border-foreground/10 bg-background/50 backdrop-blur-md shadow-glass",
            isRolling ? "pointer-events-none opacity-80" : "hover:scale-[1.02] hover:bg-background/80 cursor-pointer"
          )}
          onClick={handleDiceClick}
        >
          <div className={cn("p-4 rounded-full bg-cta text-white", isRolling && "animate-spin")}>
            <Dices size={48} />
          </div>
          <span className="font-heading font-semibold text-lg text-text">
            {isRolling ? "Calculating..." : "Roll the Wildcard"}
          </span>
        </motion.div>

        {/* Category Tiles */}
        {CATEGORIES.map((cat) => (
          <motion.div
            key={cat.id}
            className="flex-shrink-0 w-64 h-96 relative rounded-2xl overflow-hidden group border border-foreground/5 shadow-sm"
            whileHover={{ scale: 1.02, filter: "brightness(1.05)" }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            onClick={() => onSelectCategory(cat.id)}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
            <img src={cat.image} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" draggable={false} />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
              <h3 className="text-white font-heading font-bold text-2xl tracking-tight">{cat.title}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
