import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function SpaceArt() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Floating spaceship animation
    gsap.to('.spaceship', {
      y: -20,
      rotation: 2,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // Flickering exhaust flame
    gsap.to('.exhaust', {
      scaleY: 1.2,
      opacity: 0.8,
      duration: 0.1,
      yoyo: true,
      repeat: -1,
      transformOrigin: 'top center',
    });

    // Passing stars
    gsap.to('.star', {
      x: -300,
      keyframes: [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }],
      duration: 'random(1, 3)',
      repeat: -1,
      stagger: {
        each: 0.2,
        repeat: -1,
      },
      ease: 'linear',
    });
  }, { scope: container });

  return (
    <div ref={container} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0A0B1A] rounded-[1.5rem] group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]">
      {/* Background stars */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="star absolute w-1 h-1 bg-white rounded-full opacity-0" style={{ top: `${Math.random() * 100}%`, right: '-100px' }} />
        ))}
      </div>
      
      {/* Spaceship SVG */}
      <svg className="spaceship w-[60%] h-[60%] lg:w-40 lg:h-40 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)] z-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
         {/* Exhaust */}
         <path className="exhaust" d="M35 70 C 35 90, 65 90, 65 70 Z" fill="#F59E0B" />
         <path className="exhaust" d="M42 70 C 42 85, 58 85, 58 70 Z" fill="#FEF08A" />
         {/* Fin Left */}
         <path d="M25 50 L 15 70 L 30 65 Z" fill="#4F46E5" />
         {/* Fin Right */}
         <path d="M75 50 L 85 70 L 70 65 Z" fill="#4F46E5" />
         {/* Hull */}
         <path d="M30 40 C 30 10, 70 10, 70 40 L 75 65 C 75 75, 25 75, 25 65 Z" fill="#E0E7FF" />
         {/* Window */}
         <circle cx="50" cy="35" r="12" fill="#1E1B4B" stroke="#818CF8" strokeWidth="3" />
         {/* Window reflection */}
         <path d="M43 31 C 47 28, 53 28, 57 31" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
         {/* Details */}
         <line x1="40" y1="55" x2="60" y2="55" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
         <line x1="45" y1="60" x2="55" y2="60" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function PhysicsArt() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Newton's cradle swing
    const tl = gsap.timeline({ repeat: -1 });
    
    tl.to('.ball-left', {
      rotation: 40,
      transformOrigin: 'top center',
      duration: 0.4,
      ease: 'power2.out',
    })
    .to('.ball-left', {
      rotation: 0,
      duration: 0.4,
      ease: 'power2.in',
    })
    .to('.ball-right', {
      rotation: -40,
      transformOrigin: 'top center',
      duration: 0.4,
      ease: 'power2.out',
    })
    .to('.ball-right', {
      rotation: 0,
      duration: 0.4,
      ease: 'power2.in',
    });

    // Glow pulse on impact
    gsap.to('.glow', {
       keyframes: [
         { opacity: 0.1, scale: 1 },
         { opacity: 0.4, scale: 1.2 },
         { opacity: 0.1, scale: 1 },
       ],
       duration: 0.8,
       repeat: -1,
       ease: 'steps(2)'
    });
  }, { scope: container });

  return (
    <div ref={container} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#1E1B4B] to-black rounded-[1.5rem] group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]">
      <div className="glow absolute w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20" />
      
      <svg className="w-[60%] h-[60%] lg:w-40 lg:h-40 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-10" viewBox="0 0 100 100" fill="none">
         {/* Frame */}
         <path d="M20 20 L 80 20" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
         <path d="M25 20 L 15 80 M 75 20 L 85 80" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
         <path d="M10 80 L 90 80" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
         
         {/* String 1 (Left Swing) */}
         <g className="ball-left">
           <line x1="35" y1="20" x2="35" y2="60" stroke="#94A3B8" strokeWidth="1" />
           <circle cx="35" cy="65" r="5" fill="#C084FC" />
           <circle cx="33" cy="63" r="1.5" fill="white" opacity="0.6" />
         </g>
         
         {/* Static middle balls */}
         <line x1="45" y1="20" x2="45" y2="60" stroke="#94A3B8" strokeWidth="1" />
         <circle cx="45" cy="65" r="5" fill="#A855F7" />
         
         <line x1="55" y1="20" x2="55" y2="60" stroke="#94A3B8" strokeWidth="1" />
         <circle cx="55" cy="65" r="5" fill="#A855F7" />
         
         {/* String 4 (Right Swing) */}
         <g className="ball-right">
           <line x1="65" y1="20" x2="65" y2="60" stroke="#94A3B8" strokeWidth="1" />
           <circle cx="65" cy="65" r="5" fill="#9333EA" />
           <circle cx="63" cy="63" r="1.5" fill="white" opacity="0.6" />
         </g>
      </svg>
    </div>
  );
}

export function BiologyArt() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Microscope floating
    gsap.to('.microscope', {
      y: -10,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    // Examining petri dish glow
    gsap.to('.petri-dish', {
       scale: 1.05,
       fill: '#34D399',
       duration: 2,
       yoyo: true,
       repeat: -1,
       ease: 'power1.inOut'
    });
    
    // Lens adjusting
    gsap.to('.lens', {
       y: 2,
       duration: 1.5,
       repeat: -1,
       yoyo: true,
       ease: 'steps(4)'
    });
  }, { scope: container });

  return (
    <div ref={container} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#064E3B] rounded-[1.5rem] group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/microbial-mat.png')] opacity-10" />
      
      <svg className="microscope w-[60%] h-[60%] lg:w-40 lg:h-40 drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]" viewBox="0 0 100 100" fill="none">
         {/* Base */}
         <path d="M30 85 L 70 85 C 75 85, 75 75, 70 75 L 30 75 C 25 75, 25 85, 30 85 Z" fill="#94A3B8" />
         {/* Arm */}
         <path d="M60 75 C 80 50, 70 20, 50 15 L 45 25 C 60 30, 65 50, 50 75 Z" fill="#E2E8F0" />
         {/* Eyepiece */}
         <path d="M45 15 L 35 5 M 50 20 L 40 10" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
         <circle cx="37" cy="7" r="4" fill="#10B981" />
         {/* Tube */}
         <rect x="35" y="25" width="16" height="25" rx="2" fill="#F1F5F9" transform="rotate(25, 43, 37)" />
         {/* Stage */}
         <rect x="25" y="60" width="30" height="4" rx="1" fill="#475569" />
         {/* Petri / Sample */}
         <ellipse className="petri-dish" cx="40" cy="58" rx="8" ry="3" fill="#A7F3D0" />
         {/* Objective Lens */}
         <path className="lens" d="M33 45 L 45 40 L 41 52 L 30 50 Z" fill="#10B981" />
      </svg>
    </div>
  );
}

export function ComputersArt() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Floating entire unit
    gsap.to('.retro-pc', {
       y: -10,
       duration: 4,
       yoyo: true,
       repeat: -1,
       ease: 'power1.inOut'
    });

    // Glitch / Scanline effect
    gsap.to('.screen-glitch', {
       x: "random(-2, 2)",
       y: "random(-2, 2)",
       opacity: "random(0.5, 1)",
       duration: 0.1,
       repeat: -1,
    });
    
    gsap.to('.scanline', {
       y: 35,
       duration: 2,
       repeat: -1,
       ease: 'linear'
    });
  }, { scope: container });

  return (
    <div ref={container} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0F172A] rounded-[1.5rem] group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]">
      <svg className="retro-pc w-[60%] h-[60%] lg:w-40 lg:h-40 drop-shadow-[0_0_20px_rgba(148,163,184,0.3)]" viewBox="0 0 100 100" fill="none">
         {/* Monitor casing */}
         <path d="M20 20 L 80 20 C 85 20, 85 25, 85 30 L 80 70 C 80 75, 75 75, 70 75 L 30 75 C 25 75, 20 75, 20 70 L 15 30 C 15 25, 15 20, 20 20 Z" fill="#E2E8F0" />
         {/* Inner bezel */}
         <rect x="25" y="28" width="50" height="38" rx="2" fill="#334155" />
         
         {/* CRT Screen with scanline setup */}
         <clipPath id="screenClip">
            <rect x="28" y="31" width="44" height="32" rx="2" />
         </clipPath>
         <rect className="screen-glitch" x="28" y="31" width="44" height="32" rx="2" fill="#020617" />
         <g clipPath="url(#screenClip)">
            <text x="32" y="45" fill="#10B981" fontSize="8" fontFamily="monospace" className="screen-glitch">C:\&gt; RUN</text>
            <text x="32" y="55" fill="#10B981" fontSize="8" fontFamily="monospace" className="screen-glitch">  SYS_OK</text>
            <rect className="scanline" x="28" y="30" width="44" height="1" fill="rgba(16, 185, 129, 0.4)" />
         </g>

         {/* Base/Keyboard */}
         <path d="M35 75 L 65 75 L 70 85 L 30 85 Z" fill="#CBD5E1" />
         <line x1="35" y1="80" x2="65" y2="80" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 2" />
      </svg>
    </div>
  );
}

export function ChemistryArt() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Bubble rising
    gsap.to('.bubble', {
      y: -30,
      opacity: 0,
      scale: "random(0.5, 1.5)",
      x: "random(-5, 5)",
      duration: "random(1, 3)",
      repeat: -1,
      stagger: 0.2,
      ease: 'power1.in'
    });

    // Liquid swaying
    gsap.to('.liquid', {
       skewX: 2,
       scaleY: 1.02,
       transformOrigin: 'bottom center',
       duration: 1.5,
       yoyo: true,
       repeat: -1,
       ease: 'sine.inOut'
    });

    // Flask hovering
    gsap.to('.flask', {
       y: -8,
       rotation: 2,
       duration: 4,
       yoyo: true,
       repeat: -1,
       ease: 'sine.inOut'
    });
  }, { scope: container });

  return (
    <div ref={container} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#431407] rounded-[1.5rem] group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-orange-600/30 to-transparent" />
      
      <svg className="flask w-[60%] h-[60%] lg:w-40 lg:h-40 drop-shadow-[0_15px_30px_rgba(249,115,22,0.4)] z-10" viewBox="0 0 100 100" fill="none">
         {/* Flask Glass Back */}
         <path d="M45 15 L 45 40 L 20 80 A 10 10 0 0 0 30 90 L 70 90 A 10 10 0 0 0 80 80 L 55 40 L 55 15 Z" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
         
         {/* Liquid */}
         <path className="liquid" d="M26 70 L 74 70 A 5 5 0 0 1 78 78 A 8 8 0 0 1 70 88 L 30 88 A 8 8 0 0 1 22 78 A 5 5 0 0 1 26 70 Z" fill="#F97316" />
         
         {/* Glass Front Reflection */}
         <path d="M30 80 A 10 10 0 0 1 20 80" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
         <line x1="43" y1="15" x2="57" y2="15" stroke="white" strokeWidth="4" strokeLinecap="round" />
         
         {/* Rising Bubbles */}
         <circle className="bubble" cx="45" cy="80" r="2" fill="white" />
         <circle className="bubble" cx="55" cy="82" r="3" fill="white" />
         <circle className="bubble" cx="40" cy="75" r="1.5" fill="white" />
         <circle className="bubble" cx="60" cy="78" r="2" fill="white" />
         <circle className="bubble" cx="50" cy="85" r="4" fill="white" />
      </svg>
    </div>
  );
}

export function WildcardArt() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Magic swirling portal ring
    gsap.to('.portal-ring', {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: 'linear'
    });

    gsap.to('.portal-ring-reverse', {
      rotation: -360,
      scale: 1.1,
      duration: 15,
      repeat: -1,
      ease: 'linear'
    });

    // Magic wand glowing tip and bobbing
    gsap.to('.wand-tip', {
      scale: 1.3,
      opacity: 0.8,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut'
    });
    
    gsap.to('.wand', {
      y: -10,
      rotation: -10,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    // Magic sparkles floating off
    gsap.to('.sparkle', {
      y: -50,
      x: "random(-20, 20)",
      rotation: "random(-180, 180)",
      scale: 0,
      opacity: 0,
      duration: "random(1.5, 3)",
      repeat: -1,
      stagger: 0.2,
      ease: 'power2.out'
    });
  }, { scope: container });

  return (
    <div ref={container} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-950 to-black rounded-[1.5rem] group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]">
      
      {/* Background portal */}
      <svg className="absolute w-full h-full scale-125 opacity-20" viewBox="0 0 100 100" fill="none">
        <circle className="portal-ring" cx="50" cy="50" r="40" stroke="#F43F5E" strokeWidth="2" strokeDasharray="10 20 30" />
        <circle className="portal-ring-reverse" cx="50" cy="50" r="45" stroke="#FDA4AF" strokeWidth="1" strokeDasharray="5 15" />
      </svg>
      
      {/* Wand SVG */}
      <svg className="wand w-[60%] h-[60%] lg:w-40 lg:h-40 drop-shadow-[0_10px_20px_rgba(225,29,72,0.4)] z-10" viewBox="0 0 100 100" fill="none">
         {/* Wand Stick */}
         <path d="M25 85 L 70 40 L 75 45 L 30 90 Z" fill="#78716C" />
         <path d="M28 82 L 70 40 L 72 42 L 30 84 Z" fill="#A8A29E" opacity="0.5" />
         
         {/* Metal tip bindings */}
         <line x1="68" y1="42" x2="73" y2="47" stroke="#FCD34D" strokeWidth="3" />
         <line x1="65" y1="45" x2="70" y2="50" stroke="#FCD34D" strokeWidth="3" />
         
         {/* Glowing Magic Gem Tip */}
         <circle className="wand-tip" cx="80" cy="30" r="8" fill="#FB7185" opacity="0.9" />
         <path className="wand-tip" d="M80 15 L 85 25 L 95 30 L 85 35 L 80 45 L 75 35 L 65 30 L 75 25 Z" fill="#FFF1F2" />
      </svg>

      {/* Sparks generated correctly via GSAP */}
      {[...Array(8)].map((_, i) => (
         <svg key={i} className="sparkle absolute w-6 h-6 z-20" style={{ left: '60%', top: '40%' }} viewBox="0 0 20 20" fill="none">
            <path d="M10 0 L 12 8 L 20 10 L 12 12 L 10 20 L 8 12 L 0 10 L 8 8 Z" fill="#FDA4AF" />
         </svg>
      ))}
    </div>
  );
}

export function DiceArt() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 3D Isometric Tumbling Logic
    gsap.to('.dice-group-1', {
      rotationX: 360,
      rotationY: 720,
      rotationZ: 360,
      x: "random(-10, 10)",
      y: "random(-15, 5)",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      transformOrigin: "50px 50px -25px" 
    });
    
    gsap.to('.dice-group-2', {
      rotationX: -360,
      rotationY: -360,
      rotationZ: -720,
      x: "random(-5, 15)",
      y: "random(-5, 15)",
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      delay: 0.2,
      transformOrigin: "50px 50px -25px"
    });
  }, { scope: container });

  return (
    <div ref={container} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-neutral-900 rounded-[1.5rem] group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] perspective-1000">
      
      {/* Abstract casino floor grid - Expanded bounds to prevent black edge stripes on scale */}
      <div className="absolute inset-[-50%] opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '20px 20px', transform: 'perspective(500px) rotateX(60deg)' }} />
      
      <svg className="w-[70%] h-[70%] lg:w-48 lg:h-48 z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]" viewBox="0 0 100 100" fill="none" style={{ overflow: 'visible' }}>
         {/* Dice 1 (Front/Left) - True Iso 3D */}
         <g className="dice-group-1" transform="translate(-10, 0)">
            {/* Top Face */}
            <polygon points="50,15 80,30 50,45 20,30" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
            <circle cx="50" cy="30" r="3" fill="#0F172A" transform="skewX(-30) scale(1, 0.866) translate(22, 10)" />
            
            {/* Right Face */}
            <polygon points="80,30 80,65 50,80 50,45" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
            <circle cx="60" cy="55" r="2.5" fill="#0F172A" />
            <circle cx="70" cy="55" r="2.5" fill="#0F172A" />
            <circle cx="65" cy="65" r="2.5" fill="#0F172A" />

            {/* Left Face */}
            <polygon points="20,30 50,45 50,80 20,65" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
            <circle cx="35" cy="55" r="3" fill="#0F172A" />
         </g>
         
         {/* Dice 2 (Back/Right) - True Iso 3D */}
         <g className="dice-group-2" transform="translate(30, 20) scale(0.8)">
            {/* Top Face */}
            <polygon points="50,15 80,30 50,45 20,30" fill="#FEE2E2" stroke="#FECACA" strokeWidth="1" />
            <circle cx="50" cy="30" r="3" fill="#DC2626" transform="skewX(-30) scale(1, 0.866) translate(22, 10)" />
            <circle cx="40" cy="27" r="3" fill="#DC2626" transform="skewX(-30) scale(1, 0.866) translate(22, 10)" />
            <circle cx="60" cy="33" r="3" fill="#DC2626" transform="skewX(-30) scale(1, 0.866) translate(22, 10)" />
            
            {/* Right Face */}
            <polygon points="80,30 80,65 50,80 50,45" fill="#FCA5A5" stroke="#F87171" strokeWidth="1" />
            <circle cx="65" cy="60" r="3" fill="#991B1B" />

            {/* Left Face */}
            <polygon points="20,30 50,45 50,80 20,65" fill="#F87171" stroke="#EF4444" strokeWidth="1" />
            <circle cx="35" cy="50" r="2.5" fill="#991B1B" />
            <circle cx="35" cy="65" r="2.5" fill="#991B1B" />
         </g>
         
      </svg>
    </div>
  );
}
