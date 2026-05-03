import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameEngine } from './Engine';
import { Vec2 } from './Math';
import { Joystick } from 'react-joystick-component';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  const { gameState, setHealth, setScore, setGameState, batchQueue, clearBatch } = useGameStore();
  const castBatchFn = useGameStore((state) => state.castBatch);
  
  const [moveInput, setMoveInput] = useState(new Vec2(0, 0));

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resize
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      if (!engineRef.current) {
        engineRef.current = new GameEngine(canvas.width, canvas.height);
      } else {
        engineRef.current.width = canvas.width;
        engineRef.current.height = canvas.height;
      }
    };
    
    window.addEventListener('resize', resize);
    resize();

    let lastTime = performance.now();
    let animationFrameId: number;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1); // cap dt
      lastTime = time;

      if (engineRef.current && gameState === 'PLAYING') {
        engineRef.current.update(
          dt, 
          moveInput, 
          (dmg) => {
             // on damage
             setHealth((prev) => {
               const next = prev - dmg;
               if (next <= 0) {
                 setTimeout(() => setGameState('GAMEOVER'), 0);
               }
               return Math.max(0, next);
             });
          },
          (pts) => {
             setScore((prev) => prev + pts);
          }
        );

        draw(ctx, engineRef.current);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, moveInput]);
  
  // Actually we need moveInput ref so loop uses fresh value, let's use a ref for it
  const moveInputRef = useRef(new Vec2(0,0));
  useEffect(() => {
     moveInputRef.current = moveInput;
  }, [moveInput]);

  useEffect(() => {
     // Re-patch loop with ref
     engineRef.current && (engineRef.current.update = (dt: number, _mi: any, onDmg: any, onScore: any) => {
        GameEngine.prototype.update.call(engineRef.current, dt, moveInputRef.current, onDmg, onScore);
     });
  }, []); // Hacky but works for react


  const draw = (ctx: CanvasRenderingContext2D, engine: GameEngine) => {
    // Clear background entirely transparent
    ctx.clearRect(0, 0, engine.width, engine.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let x=0; x < engine.width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x, engine.height); ctx.stroke();
    }
    for(let y=0; y < engine.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(engine.width, y); ctx.stroke();
    }

    // Draw particles
    engine.particles.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Draw spells
    engine.spells.forEach(s => {
      ctx.fillStyle = getSpellColor(s.type);
      ctx.beginPath();
      ctx.arc(s.pos.x, s.pos.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // glowing core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.pos.x, s.pos.y, s.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw enemies
    engine.enemies.forEach(e => {
      ctx.fillStyle = e.frozenTimer > 0 ? '#60a5fa' : '#9f1239'; // blue or dark red
      ctx.beginPath();
      ctx.arc(e.pos.x, e.pos.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Health bar
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(e.pos.x - 15, e.pos.y - 25, 30 * (e.hp / e.maxHp), 4);
    });

    // Draw Player
    ctx.fillStyle = '#8b5cf6'; // violet
    ctx.beginPath();
    ctx.arc(engine.playerPos.x, engine.playerPos.y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Player Hat
    ctx.fillStyle = '#4c1d95';
    ctx.beginPath();
    ctx.moveTo(engine.playerPos.x - 15, engine.playerPos.y - 10);
    ctx.lineTo(engine.playerPos.x + 15, engine.playerPos.y - 10);
    ctx.lineTo(engine.playerPos.x, engine.playerPos.y - 35);
    ctx.fill();
  };

  const handleMove = (e: any) => {
    // e.x and e.y correspond to joystick direction (normalized roughly to distance)
    if (e.x === null || e.y === null) {
      setMoveInput(new Vec2(0, 0));
    } else {
      setMoveInput(new Vec2(e.x, -e.y)); // React-joystick y is inverted
    }
  };

  const handleStop = () => {
    setMoveInput(new Vec2(0, 0));
  };
  
  // Expose cast method to UI (which is via Zustand action, so engine needs to listen)
  // Actually, UI calls `castBatch()` in Zustand. We can watch `batchQueue` locally or use a custom event.
  // Better yet, just expose `engineRef.current.castBatch()` globally or via ref. Let's do pub/sub via window.
  useEffect(() => {
    const handleCast = (e: any) => {
       const batch = e.detail;
       if (engineRef.current && batch) {
          engineRef.current.castBatch(batch);
       }
    };
    window.addEventListener('game:cast', handleCast);
    return () => window.removeEventListener('game:cast', handleCast);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" ref={containerRef}>
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* HUD Layer */}
      {gameState === 'PLAYING' && (
        <div className="absolute bottom-10 left-10 opacity-70 hover:opacity-100 transition-opacity">
           <Joystick size={100} sticky={false} baseColor="#1e293b" stickColor="#cbd5e1" move={handleMove} stop={handleStop} />
        </div>
      )}
    </div>
  );
}

function getSpellColor(type: string) {
  switch(type) {
    case 'FIRE': return '#ef4444';
    case 'ICE': return '#3b82f6';
    case 'LIGHTNING': return '#eab308';
    case 'NATURE': return '#22c55e';
    default: return '#fff';
  }
}
