import { Vec2 } from './Math';
import { ElementType } from '../store/gameStore';

export interface Particle {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Enemy {
  id: string;
  pos: Vec2;
  vel: Vec2;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  frozenTimer: number;
}

export interface Spell {
  id: string;
  pos: Vec2;
  vel: Vec2;
  radius: number;
  type: ElementType;
  life: number;
  damage: number;
}

export class GameEngine {
  public playerPos: Vec2;
  public enemies: Enemy[] = [];
  public spells: Spell[] = [];
  public particles: Particle[] = [];
  
  public width: number;
  public height: number;
  
  private lastTime: number = 0;
  private enemySpawnTimer: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.playerPos = new Vec2(width / 2, height / 2);
  }

  public update(dt: number, moveInput: Vec2, onTakeDamage: (dmg: number) => void, onScore: (pts: number) => void) {
    // Player movement
    if (moveInput.mag() > 0) {
      const move = moveInput.normalize().mult(dt * 200);
      this.playerPos = this.playerPos.add(move);
      
      // Clamp to bounds
      this.playerPos.x = Math.max(20, Math.min(this.width - 20, this.playerPos.x));
      this.playerPos.y = Math.max(20, Math.min(this.height - 20, this.playerPos.y));
    }

    // Spawn enemies
    this.enemySpawnTimer -= dt;
    if (this.enemySpawnTimer <= 0) {
      this.spawnEnemy();
      this.enemySpawnTimer = 1.0 + Math.random(); // spawn every 1-2s
    }

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.frozenTimer > 0) {
        enemy.frozenTimer -= dt;
      } else {
        const dir = this.playerPos.sub(enemy.pos).normalize();
        enemy.pos = enemy.pos.add(dir.mult(dt * enemy.speed));
      }

      // Check collision with player
      if (enemy.pos.sub(this.playerPos).mag() < enemy.radius + 15) {
        onTakeDamage(10);
        this.createExplosion(enemy.pos, '#ff0000', 15);
        this.enemies.splice(i, 1);
        continue;
      }
    }

    // Update Spells
    for (let i = this.spells.length - 1; i >= 0; i--) {
      const spell = this.spells[i];
      spell.pos = spell.pos.add(spell.vel.mult(dt * 400));
      spell.life -= dt;

      // Add trail particles
      if (Math.random() > 0.5) {
        this.particles.push({
          pos: new Vec2(spell.pos.x, spell.pos.y),
          vel: new Vec2((Math.random()-0.5)*20, (Math.random()-0.5)*20),
          life: 0.5,
          maxLife: 0.5,
          color: this.getSpellColor(spell.type),
          size: 3
        });
      }

      if (spell.life <= 0) {
        this.spells.splice(i, 1);
        continue;
      }

      // Collisions with enemies
      let hit = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (spell.pos.sub(e.pos).mag() < spell.radius + e.radius) {
          e.hp -= spell.damage;
          this.createExplosion(e.pos, this.getSpellColor(spell.type), 10);
          
          if (spell.type === 'ICE') {
            e.frozenTimer = 2.0; // Freeze for 2 seconds
          } else if (spell.type === 'LIGHTNING') {
            // Chain lightning logic could go here
            this.createLightningEffect(e.pos);
          }
          
          hit = true;
          if (e.hp <= 0) {
            onScore(100);
            this.enemies.splice(j, 1);
          }
          break; // Projectile dies on hit (unless piercing, but let's keep it simple)
        }
      }
      
      // Fire/Nature can pierce or explode, but let's make all disappear on hit for simplicity
      if (hit && spell.type !== 'FIRE') {
        this.spells.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.pos = p.pos.add(p.vel.mult(dt));
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public castBatch(batch: ElementType[]) {
    if (batch.length === 0) return;

    // Find nearest enemy to target
    let targetDir = new Vec2(1, 0); // default right
    if (this.enemies.length > 0) {
      let nearest = this.enemies[0];
      let minDist = nearest.pos.sub(this.playerPos).mag();
      for (const e of this.enemies) {
        const dist = e.pos.sub(this.playerPos).mag();
        if (dist < minDist) {
          minDist = dist;
          nearest = e;
        }
      }
      targetDir = nearest.pos.sub(this.playerPos).normalize();
    }

    // Spread angle based on batch size
    const spread = 0.3; // radians
    const startAngle = -((batch.length - 1) * spread) / 2;

    const baseAngle = Math.atan2(targetDir.y, targetDir.x);

    batch.forEach((el, index) => {
      const angle = baseAngle + startAngle + index * spread;
      const vel = new Vec2(Math.cos(angle), Math.sin(angle));
      
      this.spells.push({
        id: Math.random().toString(),
        pos: new Vec2(this.playerPos.x, this.playerPos.y),
        vel: vel,
        radius: 12,
        type: el,
        life: 2.0,
        damage: el === 'FIRE' ? 50 : el === 'LIGHTNING' ? 30 : 25
      });
      // Cast effect
      this.createExplosion(this.playerPos, this.getSpellColor(el), 8);
    });
  }

  private spawnEnemy() {
    // Spawn outside screen
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(this.width, this.height) / 2 + 50;
    const center = new Vec2(this.width/2, this.height/2);
    const pos = new Vec2(center.x + Math.cos(angle)*dist, center.y + Math.sin(angle)*dist);
    
    this.enemies.push({
      id: Math.random().toString(),
      pos,
      vel: new Vec2(0,0),
      hp: 50,
      maxHp: 50,
      speed: 60 + Math.random() * 40,
      radius: 15,
      frozenTimer: 0
    });
  }

  private createExplosion(pos: Vec2, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 100 + 50;
      this.particles.push({
        pos: new Vec2(pos.x, pos.y),
        vel: new Vec2(Math.cos(angle) * speed, Math.sin(angle) * speed),
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        color,
        size: 2 + Math.random() * 3
      });
    }
  }

  private createLightningEffect(pos: Vec2) {
    for (let i = 0; i < 5; i++) {
        this.particles.push({
          pos: new Vec2(pos.x + (Math.random()-0.5)*40, pos.y + (Math.random()-0.5)*40),
          vel: new Vec2(0,0),
          life: 0.2,
          maxLife: 0.2,
          color: '#eab308',
          size: 4
        });
    }
  }

  private getSpellColor(type: ElementType) {
    switch(type) {
      case 'FIRE': return '#ef4444'; // red
      case 'ICE': return '#3b82f6'; // blue
      case 'LIGHTNING': return '#eab308'; // yellow
      case 'NATURE': return '#22c55e'; // green
    }
  }
}
