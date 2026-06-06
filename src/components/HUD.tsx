import React, { useRef, useState, useEffect } from 'react';
import { useGameStore, ElementType } from '../store/gameStore';
import { Flame, Droplet, Wind, Mountain, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function HUD() {
  const { score, health, maxHealth, batchGrid, setGridSlot, clearBatch, castBatch, combo } = useGameStore();
  const [draggedElement, setDraggedElement] = useState<ElementType | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const handleCast = () => {
    const batch = castBatch();
    if (batch.length === 0) return;
    window.dispatchEvent(new CustomEvent('game:cast', { detail: batch }));
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  const handleDragEnd = (event: any, info: any, type: ElementType) => {
    const gridEl = gridRef.current;
    if (!gridEl) return;
    
    // Check if dropping on a specific slot in grid
    const rect = gridEl.getBoundingClientRect();
    const cellWidth = rect.width / 3;
    const cellHeight = rect.height / 3;
    
    const dropX = info.point.x - rect.left;
    const dropY = info.point.y - rect.top;
    
    if (dropX >= 0 && dropX <= rect.width && dropY >= 0 && dropY <= rect.height) {
      const col = Math.floor(dropX / cellWidth);
      const row = Math.floor(dropY / cellHeight);
      const index = row * 3 + col;
      if (index >= 0 && index < 9) {
        setGridSlot(index, type);
      }
    }
  };

  const elementsCount = batchGrid.filter(e => e !== null).length;

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
          {combo > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-bold text-yellow-400"
            >
              Combo x{combo}
            </motion.div>
          )}
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
      <div className="pointer-events-auto self-end flex items-end gap-6 pb-10 pr-4 sm:pb-0 sm:pr-0">
        
        {/* Elements Sidebar */}
        <div className="flex flex-col gap-3 bg-white/5 p-3 rounded-2xl backdrop-blur-xl border border-white/10 shadow-lg">
          {(['FIRE', 'WATER', 'WIND', 'EARTH'] as ElementType[]).map((type) => (
            <motion.div
              key={type}
              drag
              dragSnapToOrigin
              onDragStart={() => setDraggedElement(type)}
              onDragEnd={(e, info) => {
                 handleDragEnd(e, info, type);
                 setDraggedElement(null);
              }}
              whileDrag={{ scale: 1.2, zIndex: 50 }}
              className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transform active:scale-90 touch-none ${elementsCount >= 4 ? 'opacity-50 cursor-not-allowed' : 'cursor-grab'}`}
              style={{ background: getElementBg(type), border: `2px solid ${getElementBorder(type)}`, boxShadow: `0 0 15px ${getElementShadow(type)}` }}
            >
              <ElementIcon type={type} className="text-white drop-shadow-md pointer-events-none" size={24} />
            </motion.div>
          ))}
        </div>

        {/* Batch Grid Area */}
        <div className="flex flex-col items-center gap-2 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center w-full justify-between mb-1">
            <span className="text-[10px] font-bold text-purple-300/60 tracking-widest uppercase">Batch Craft Grid ({elementsCount}/4)</span>
            {elementsCount > 0 && (
               <button onClick={clearBatch} className="text-white/50 hover:text-white transition p-1 bg-white/5 border border-white/10 rounded-lg">
                 <X size={14} />
               </button>
            )}
          </div>
          
          <div ref={gridRef} className="grid grid-cols-3 grid-rows-3 gap-2 bg-black/40 p-2 rounded-xl relative">
            <AnimatePresence>
              {draggedElement && (
                 <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 border-2 border-dashed border-purple-500 rounded-xl z-0 pointer-events-none" 
                 />
              )}
            </AnimatePresence>
            {[...Array(9)].map((_, i) => (
              <div key={i} onClick={() => setGridSlot(i, null)} className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center relative shadow-inner cursor-pointer hover:bg-white/10">
                <AnimatePresence>
                  {batchGrid[i] && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 m-0 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ background: getElementBg(batchGrid[i]!), boxShadow: `0 0 15px ${getElementShadow(batchGrid[i]!)}` }}
                    >
                      <ElementIcon type={batchGrid[i]!} size={20} className="text-white drop-shadow-md" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <button 
            onClick={handleCast}
            disabled={elementsCount === 0}
            className={`w-full mt-2 py-3 rounded-xl font-black text-lg tracking-[0.2em] transform transition-all flex items-center justify-center gap-2
              ${elementsCount > 0 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-600/40 hover:scale-105 active:scale-95' 
                : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'}`}
          >
            CAST BATCH <Zap size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}

function getElementBg(type: ElementType) {
  switch (type) {
    case 'FIRE': return 'rgba(239, 68, 68, 0.2)';
    case 'WATER': return 'rgba(59, 130, 246, 0.2)';
    case 'WIND': return 'rgba(234, 179, 8, 0.2)';
    case 'EARTH': return 'rgba(34, 197, 94, 0.2)';
  }
}

function getElementBorder(type: ElementType) {
  switch (type) {
    case 'FIRE': return '#ef4444'; 
    case 'WATER': return '#3b82f6';
    case 'WIND': return '#eab308';
    case 'EARTH': return '#22c55e';
  }
}

function getElementShadow(type: ElementType) {
  switch (type) {
    case 'FIRE': return 'rgba(239, 68, 68, 0.2)';
    case 'WATER': return 'rgba(59, 130, 246, 0.2)';
    case 'WIND': return 'rgba(234, 179, 8, 0.2)';
    case 'EARTH': return 'rgba(34, 197, 94, 0.2)';
  }
}

function ElementIcon({ type, className, ...props }: { type: ElementType, className?: string } & any) {
  let colorClass = '';
  switch (type) {
    case 'FIRE': colorClass = 'text-red-400'; break;
    case 'WATER': colorClass = 'text-blue-400'; break;
    case 'WIND': colorClass = 'text-yellow-400'; break;
    case 'EARTH': colorClass = 'text-green-400'; break;
  }
  return React.createElement(getIcon(type), { className: `${colorClass} ${className || ''}`, ...props });
}

function getIcon(type: ElementType) {
  switch (type) {
    case 'FIRE': return Flame;
    case 'WATER': return Droplet;
    case 'WIND': return Wind;
    case 'EARTH': return Mountain;
  }
}
