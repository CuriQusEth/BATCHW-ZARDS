export class Vec2 {
  constructor(public x: number, public y: number) {}

  add(v: Vec2) { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v: Vec2) { return new Vec2(this.x - v.x, this.y - v.y); }
  mult(n: number) { return new Vec2(this.x * n, this.y * n); }
  mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
  normalize() {
    const m = this.mag();
    return m === 0 ? new Vec2(0, 0) : new Vec2(this.x / m, this.y / m);
  }
}
