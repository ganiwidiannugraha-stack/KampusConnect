"use client";

import { useEffect, useState } from "react";

export default function FallingRain({ count = 30 }: { count?: number }) {
  const [drops, setDrops] = useState<
    Array<{ id: number; left: number; delay: number; duration: number; height: number; opacity: number }>
  >([]);

  useEffect(() => {
    // Generate random raindrops on client side to avoid hydration mismatch
    const newDrops = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // 0-100%
      delay: Math.random() * 5, // 0-5s delay
      duration: 3 + Math.random() * 3, // 3-6s duration for a slower, calmer fall
      height: 60 + Math.random() * 80, // 60px - 140px tall
      opacity: 0.4 + Math.random() * 0.6, // 0.4 - 1.0 opacity
    }));
    setDrops(newDrops);
  }, [count]);

  if (drops.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute w-[2px] animate-rain-fall"
          style={{
            left: `${drop.left}%`,
            height: `${drop.height}px`,
            bottom: '100%', // Start exactly above the container
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`,
            opacity: drop.opacity,
          }}
        >
          {/* The line itself */}
          <div 
            className="w-full h-full rounded-full bg-gradient-to-t from-primary via-primary/50 to-transparent animate-rain-line" 
            style={{ animationDelay: `${drop.delay}s`, animationDuration: `${drop.duration}s` }}
          />
          
          {/* Splash particles */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
             <div className="absolute bottom-0 left-1/2 w-[2px] h-[2px] bg-primary rounded-full animate-splash-1" style={{ animationDelay: `${drop.delay}s`, animationDuration: `${drop.duration}s` }} />
             <div className="absolute bottom-0 left-1/2 w-[3px] h-[3px] bg-primary rounded-full animate-splash-2" style={{ animationDelay: `${drop.delay}s`, animationDuration: `${drop.duration}s` }} />
             <div className="absolute bottom-0 left-1/2 w-[1.5px] h-[1.5px] bg-primary rounded-full animate-splash-3" style={{ animationDelay: `${drop.delay}s`, animationDuration: `${drop.duration}s` }} />
             <div className="absolute bottom-0 left-1/2 w-[2.5px] h-[2.5px] bg-primary rounded-full animate-splash-4" style={{ animationDelay: `${drop.delay}s`, animationDuration: `${drop.duration}s` }} />
             <div className="absolute bottom-0 left-1/2 w-[2px] h-[2px] bg-primary rounded-full animate-splash-5" style={{ animationDelay: `${drop.delay}s`, animationDuration: `${drop.duration}s` }} />
          </div>
        </div>
      ))}
      <style>
        {`
          @keyframes rain-fall {
            0% { transform: translateY(0); }
            80% { transform: translateY(100vh); }
            100% { transform: translateY(100vh); }
          }
          .animate-rain-fall {
            animation: rain-fall linear infinite;
          }
          
          @keyframes rain-line {
            0% { opacity: 0; }
            5% { opacity: 1; }
            79% { opacity: 1; }
            80% { opacity: 0; }
            100% { opacity: 0; }
          }
          .animate-rain-line {
            animation: rain-line linear infinite;
          }
          
          @keyframes splash-1 {
            0%, 79% { transform: translate(0, 0); opacity: 0; }
            80% { opacity: 1; transform: translate(0, 0); }
            100% { transform: translate(-50px, -70px) scale(0); opacity: 0; }
          }
          @keyframes splash-2 {
            0%, 79% { transform: translate(0, 0); opacity: 0; }
            80% { opacity: 1; transform: translate(0, 0); }
            100% { transform: translate(40px, -90px) scale(0); opacity: 0; }
          }
          @keyframes splash-3 {
            0%, 79% { transform: translate(0, 0); opacity: 0; }
            80% { opacity: 1; transform: translate(0, 0); }
            100% { transform: translate(-30px, -100px) scale(0); opacity: 0; }
          }
          @keyframes splash-4 {
            0%, 79% { transform: translate(0, 0); opacity: 0; }
            80% { opacity: 1; transform: translate(0, 0); }
            100% { transform: translate(60px, -40px) scale(0); opacity: 0; }
          }
          @keyframes splash-5 {
            0%, 79% { transform: translate(0, 0); opacity: 0; }
            80% { opacity: 1; transform: translate(0, 0); }
            100% { transform: translate(15px, -80px) scale(0); opacity: 0; }
          }
          .animate-splash-1 { animation: splash-1 linear infinite; }
          .animate-splash-2 { animation: splash-2 linear infinite; }
          .animate-splash-3 { animation: splash-3 linear infinite; }
          .animate-splash-4 { animation: splash-4 linear infinite; }
          .animate-splash-5 { animation: splash-5 linear infinite; }
        `}
      </style>
    </div>
  );
}
