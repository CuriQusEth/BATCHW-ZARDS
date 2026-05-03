import React from 'react';
import { useGameStore, ElementType } from '../store/gameStore';
import { Flame, Snowflake, Zap, Leaf, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function HUD() {
  const { score, health, maxHealth, batchQueue, addToBatch, clearBatch, castBatch } = useGameStore();

  const handleCast = () => {
    if (batchQueue.length === 0) return;
    const batch = castBatch();
    // Dispatch to canvas engine
    window.dispatchEvent(new CustomEvent('game:cast', { detail: batch }));
    // Haptic feedback if available
    if (navigator.vibrate) navigator.vibrate(100);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar (Score & Health) */}
      <div className="flex justify-between items-start pointer-events-auto w-full max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
          <div className="text-[10px] text-purple-300/60 font-bold uppercase tracking-widest">Score</div>
          <motion.div 
            key={score}
            initial={{ scale: 1.2, color: '#fcd34d' }}
            animate={{ scale: 1, color: '#f8fafc' }}
            className="text-2xl font-black font-mono"
          >
            {score.toLocaleString()}
          </motion.div>
        </div>

        <div className="w-48 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg p-2">
           <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1 text-right">HP</div>
           <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
               initial={{ width: '100%' }}
               animate={{ width: `${(health / maxHealth) * 100}%` }}
               transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
             />
           </div>
        </div>
      </div>

      {/* Bottom Panel (Spells & Batch Grid) */}
      <div className="pointer-events-auto self-end flex flex-col items-end gap-4 pb-10 pr-4 sm:pb-0 sm:pr-0">
        
        {/* Batch Grid */}
        <div className="flex flex-col items-end gap-2 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-2 mb-1 pl-2">
            <span className="text-[10px] font-bold text-purple-300/60 tracking-widest uppercase flex-1">Batch Queue</span>
            {batchQueue.length > 0 && (
               <button onClick={clearBatch} className="text-white/50 hover:text-white transition p-1 bg-white/5 border border-white/10 rounded-lg">
                 <X size={14} />
               </button>
            )}
          </div>
          
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-12 h-12 bg-white/5 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center relative shadow-inner">
                <AnimatePresence>
                  {batchQueue[i] && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 m-0 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ background: getElementBg(batchQueue[i]), boxShadow: `0 0 15px ${getElementShadow(batchQueue[i])}` }}
                    >
                      <ElementIcon type={batchQueue[i]} size={20} className="text-white drop-shadow-md" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <button 
            onClick={handleCast}
            disabled={batchQueue.length === 0}
            className={`w-full mt-2 py-3 rounded-xl font-black text-lg tracking-[0.2em] transform transition-all flex items-center justify-center gap-2
              ${batchQueue.length > 0 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-600/40 hover:scale-105 active:scale-95' 
                : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'}`}
          >
            CAST BATCH <Zap size={18} />
          </button>
        </div>

        {/* Elements */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-3 rounded-2xl backdrop-blur-xl border border-white/10 shadow-lg">
          {(['FIRE', 'ICE', 'LIGHTNING', 'NATURE'] as ElementType[]).map((type) => (
            <button
              key={type}
              onClick={() => addToBatch(type)}
              disabled={batchQueue.length >= 4}
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transform transition-transform active:scale-90 disabled:opacity-50"
              style={{ background: getElementBg(type), border: `2px solid ${getElementBorder(type)}`, boxShadow: `0 0 15px ${getElementShadow(type)}` }}
            >
              <ElementIcon type={type} className="text-white drop-shadow-md" size={24} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getElementBg(type: ElementType) {
  switch (type) {
    case 'FIRE': return 'rgba(239, 68, 68, 0.2)'; // bg-red-500/20
    case 'ICE': return 'rgba(59, 130, 246, 0.2)'; // bg-blue-500/20
    case 'LIGHTNING': return 'rgba(234, 179, 8, 0.2)'; // bg-yellow-500/20
    case 'NATURE': return 'rgba(34, 197, 94, 0.2)'; // bg-green-500/20
  }
}

function getElementBorder(type: ElementType) {
  switch (type) {
    case 'FIRE': return '#ef4444'; 
    case 'ICE': return '#3b82f6';
    case 'LIGHTNING': return '#eab308';
    case 'NATURE': return '#22c55e';
  }
}

function getElementShadow(type: ElementType) {
  switch (type) {
    case 'FIRE': return 'rgba(239, 68, 68, 0.2)';
    case 'ICE': return 'rgba(59, 130, 246, 0.2)';
    case 'LIGHTNING': return 'rgba(234, 179, 8, 0.2)';
    case 'NATURE': return 'rgba(34, 197, 94, 0.2)';
  }
}

function ElementIcon({ type, className, ...props }: { type: ElementType, className?: string } & any) {
  let colorClass = '';
  switch (type) {
    case 'FIRE': colorClass = 'text-red-400'; break;
    case 'ICE': colorClass = 'text-blue-400'; break;
    case 'LIGHTNING': colorClass = 'text-yellow-400'; break;
    case 'NATURE': colorClass = 'text-green-400'; break;
  }
  return React.createElement(getIcon(type), { className: `${colorClass} ${className || ''}`, ...props });
}

function getIcon(type: ElementType) {
  switch (type) {
    case 'FIRE': return Flame;
    case 'ICE': return Snowflake;
    case 'LIGHTNING': return Zap;
    case 'NATURE': return Leaf;
  }
}
