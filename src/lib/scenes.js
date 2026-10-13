// Code-drawn environment scenes, ported verbatim from the redesign prototype
// (ambient_redesign/Ambient Redesign v2.dc.html). Plain canvas 2D.
import { rng, hashStr } from "./sounds";

const PARTS = {};
export function parts(key) {
  if (PARTS[key]) return PARTS[key];
  const r = rng(hashStr(key)), n = (c, f) => Array.from({ length: c }, () => f());
  const P = {
    bokeh: n(16, () => ({ x: r(), y: r() * 0.9, r: 0.3 + r() * 0.7, a: 0.08 + r() * 0.16, c: r() < 0.45 ? '226,170,112' : '150,172,212', p: r() * 6 })),
    streaks: n(150, () => ({ x: r() * 1.15, y: r(), v: 520 + r() * 380, l: 10 + r() * 18 })),
    drops: n(38, () => ({ x: r(), y: r(), r: 1.4 + r() * 2.8, v: r() < 0.3 ? 14 + r() * 40 : 0 })),
    clouds: n(8, () => ({ x: r(), y: r() * 0.45, r: 0.25 + r() * 0.3, v: 6 + r() * 10 })),
    embers: n(70, () => ({ x: r(), v: 0.08 + r() * 0.14, o: r(), p: r() * 6, s: 0.8 + r() * 1.6 })),
    stars: n(150, () => ({ x: r(), y: r() * 0.6, s: 0.4 + r() * 1.1, f: 0.6 + r() * 1.8, p: r() * 6 })),
    blades: n(170, () => ({ x: r(), hgt: 30 + r() * 80, p: r() * 6 })),
    flies: n(14, () => ({ x: r(), y: r(), a: 0.15 + r() * 0.3, b: 0.2 + r() * 0.3, p: r() * 6 })),
    birds: n(7, () => ({ x: r(), y: 0.15 + r() * 0.6, v: 14 + r() * 18, f: 5 + r() * 4, s: 5 + r() * 5, p: r() * 6 })),
    motes: n(40, () => ({ x: r(), y: r(), p: r() * 6, v: 3 + r() * 6 })),
    flow: n(60, () => ({ x: r(), y: 0.2 + r() * 0.75, v: 25 + r() * 55, l: 30 + r() * 90, a: 0.06 + r() * 0.16 })),
    spark: n(40, () => ({ x: r(), y: 0.25 + r() * 0.7, f: 1 + r() * 3, p: r() * 6 })),
    sand: n(170, () => ({ x: r(), y: r(), v: 60 + r() * 120, l: 6 + r() * 26, a: 0.05 + r() * 0.15, p: r() * 6 })),
  };
  PARTS[key] = P; return P;
}
function grad(ctx, h, stops) { const g = ctx.createLinearGradient(0, 0, 0, h); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function glow(ctx, x, y, r, rgb, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
function rainLines(ctx, w, h, t, list, slant, alpha) {
  ctx.strokeStyle = `rgba(200,212,232,${alpha})`; ctx.lineWidth = 1; ctx.beginPath();
  for (const s of list) { const y = ((s.y * h + t * s.v) % (h + 40)) - 20; const x = s.x * w - y * slant; ctx.moveTo(x, y); ctx.lineTo(x - s.l * slant, y + s.l); }
  ctx.stroke();
}
export const SCENES = {
  rain(ctx, w, h, t, P, k) {
    ctx.fillStyle = grad(ctx, h, [[0, '#1c2433'], [1, '#10141d']]); ctx.fillRect(0, 0, w, h);
    const m = Math.min(w, h);
    for (const b of P.bokeh) glow(ctx, b.x * w, b.y * h, b.r * m * 0.14, b.c, b.a * k * (0.8 + 0.2 * Math.sin(t * 0.5 + b.p)));
    rainLines(ctx, w, h, t, P.streaks, 0.06, 0.2 * k);
    for (const d of P.drops) {
      const y = (d.y * h + t * d.v) % (h + 20) - 10, x = d.x * w;
      if (d.v) { ctx.strokeStyle = `rgba(210,222,240,${0.07 * k})`; ctx.lineWidth = d.r * 0.7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 40); ctx.stroke(); }
      ctx.fillStyle = `rgba(210,222,240,${0.16 * k})`; ctx.beginPath(); ctx.arc(x, y, d.r, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(240,245,255,${0.32 * k})`; ctx.beginPath(); ctx.arc(x - d.r * 0.3, y - d.r * 0.3, d.r * 0.35, 0, 7); ctx.fill();
    }
  },
  thunder(ctx, w, h, t, P, k) {
    const ph = t % 11, f = ph < 0.08 ? 1 : (ph > 0.2 && ph < 0.27) ? 0.6 : 0;
    ctx.fillStyle = grad(ctx, h, [[0, '#141722'], [1, '#1b1f2b']]); ctx.fillRect(0, 0, w, h);
    for (const c of P.clouds) { const x = ((c.x * w + t * c.v) % (w + 500)) - 250; glow(ctx, x, c.y * h, c.r * w, f ? '150,160,190' : '70,78,98', (0.45 + f * 0.35) * k); }
    rainLines(ctx, w, h, t * 1.15, P.streaks, 0.22, 0.24 * k);
    if (f) { ctx.fillStyle = `rgba(205,214,240,${0.16 * f * k})`; ctx.fillRect(0, 0, w, h); }
  },
  beach(ctx, w, h, t, P, k) {
    const hz = h * 0.52;
    ctx.fillStyle = grad(ctx, hz, [[0, '#141a29'], [1, '#2a3349']]); ctx.fillRect(0, 0, w, hz);
    for (const s of P.stars) if (s.y < 0.45) { ctx.fillStyle = `rgba(230,232,240,${(0.15 + 0.3 * (0.5 + 0.5 * Math.sin(t * s.f + s.p))) * k})`; ctx.fillRect(s.x * w, s.y * hz, s.s, s.s); }
    const mx = w * 0.7, my = hz * 0.42;
    glow(ctx, mx, my, 90, '232,228,214', 0.18 * k); ctx.fillStyle = 'rgba(232,230,220,0.85)'; ctx.beginPath(); ctx.arc(mx, my, 20, 0, 7); ctx.fill();
    ctx.fillStyle = grad(ctx, h, [[0, '#1b2a3d'], [0.52, '#1b2a3d'], [1, '#0d151f']]); ctx.fillRect(0, hz, w, h - hz);
    for (let j = 0; j < 22; j++) { const y = hz + 4 + j * ((h - hz) * 0.7 / 22); const hw = (4 + j * 2.2) * (0.6 + 0.4 * Math.sin(t * 1.6 + j * 1.3)); ctx.fillStyle = `rgba(232,230,220,${(0.22 - j * 0.008) * k})`; ctx.fillRect(mx - hw + Math.sin(t + j) * 3, y, hw * 2, 1.5); }
    for (let i = 0; i < 16; i++) {
      const q = i / 16, yy = hz + (h - hz) * Math.pow(q, 1.5) + 4, amp = 1 + i * 0.7;
      ctx.strokeStyle = `rgba(190,210,230,${(0.04 + 0.12 * q) * k})`; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = 0; x <= w; x += 10) { const y = yy + Math.sin(x * 0.012 * (1.2 - q * 0.5) + t * (0.5 + q * 0.6) + i) * amp; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    const fy = h * 0.9 + Math.sin(t * 0.5) * 10; ctx.strokeStyle = `rgba(220,232,240,${0.22 * k})`; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = 0; x <= w; x += 8) { const y = fy + Math.sin(x * 0.02 + t * 0.8) * 3; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  },
  fire(ctx, w, h, t, P, k) {
    ctx.fillStyle = '#120e0c'; ctx.fillRect(0, 0, w, h);
    const fl = 0.85 + 0.08 * Math.sin(t * 6.1) + 0.05 * Math.sin(t * 13.7) + 0.03 * Math.sin(t * 23.3);
    glow(ctx, w / 2, h * 0.95, h * 1.05, '214,128,64', 0.26 * fl * k);
    const base = h * 0.86, fw = Math.min(w * 0.07, 70);
    for (let i = 0; i < 6; i++) {
      const cx = w / 2 + (i - 2.5) * fw * 0.75, fh = h * (0.22 + 0.05 * Math.sin(t * 3.1 + i * 1.7) + 0.025 * Math.sin(t * 7.3 + i)) * (i === 2 || i === 3 ? 1.25 : 0.9);
      ctx.save(); ctx.translate(cx, base); ctx.scale(1, fh / fw);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, fw); g.addColorStop(0, `rgba(255,206,130,${0.55 * k})`); g.addColorStop(0.45, `rgba(232,120,52,${0.3 * k})`); g.addColorStop(1, 'rgba(180,60,30,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, fw, Math.PI, 0); ctx.fill(); ctx.restore();
    }
    ctx.fillStyle = '#0a0706';
    ctx.beginPath(); ctx.roundRect(w / 2 - fw * 3, base - 6, fw * 6, 18, 9); ctx.fill();
    ctx.save(); ctx.translate(w / 2, base + 6); ctx.rotate(-0.12); ctx.beginPath(); ctx.roundRect(-fw * 2.6, -8, fw * 5.2, 16, 8); ctx.fill(); ctx.restore();
    ctx.fillStyle = grad(ctx, h, [[0, 'rgba(10,7,6,0)'], [0.9, 'rgba(10,7,6,0)'], [1, '#0a0706']]); ctx.fillRect(0, 0, w, h);
    for (const e of P.embers) {
      const age = (t * e.v + e.o) % 1, y = base - age * h * 0.8, x = w / 2 + (e.x - 0.5) * fw * 5 + Math.sin(age * 8 + e.p) * 18;
      ctx.fillStyle = `rgba(244,170,92,${(1 - age) * 0.75 * k})`; ctx.beginPath(); ctx.arc(x, y, e.s, 0, 7); ctx.fill();
    }
  },
  night(ctx, w, h, t, P, k) {
    ctx.fillStyle = grad(ctx, h, [[0, '#0e1322'], [1, '#1c2338']]); ctx.fillRect(0, 0, w, h);
    for (const s of P.stars) { ctx.fillStyle = `rgba(232,234,245,${(0.2 + 0.5 * (0.5 + 0.5 * Math.sin(t * s.f + s.p))) * k})`; ctx.fillRect(s.x * w, s.y * h, s.s, s.s); }
    ctx.fillStyle = '#0a0e17'; ctx.fillRect(0, h * 0.9, w, h * 0.1);
    ctx.strokeStyle = '#0a0e17'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
    for (const b of P.blades) { const x = b.x * w, sway = Math.sin(t * 0.9 + x * 0.02 + b.p) * 6; ctx.moveTo(x, h); ctx.quadraticCurveTo(x, h - b.hgt * 0.6, x + sway, h - b.hgt - h * 0.06); }
    ctx.stroke();
    for (const f of P.flies) {
      const x = f.x * w + Math.sin(t * f.a + f.p) * 50, y = h * (0.5 + f.y * 0.38) + Math.cos(t * f.b + f.p) * 22, a = 0.5 + 0.5 * Math.sin(t * 1.7 + f.p * 3);
      glow(ctx, x, y, 12, '214,224,140', 0.35 * a * k); ctx.fillStyle = `rgba(236,240,180,${0.8 * a * k})`; ctx.beginPath(); ctx.arc(x, y, 1.3, 0, 7); ctx.fill();
    }
  },
  birds(ctx, w, h, t, P, k) {
    ctx.fillStyle = grad(ctx, h, [[0, '#222738'], [0.55, '#3d4050'], [1, '#625650']]); ctx.fillRect(0, 0, w, h);
    glow(ctx, w * 0.22, h * 0.72, h * 0.7, '236,196,150', 0.22 * k);
    for (let i = 0; i < 5; i++) {
      const a = (0.03 + 0.015 * Math.sin(t * 0.4 + i)) * k, x0 = w * 0.12 + i * w * 0.11;
      ctx.fillStyle = `rgba(240,214,176,${a})`; ctx.beginPath(); ctx.moveTo(x0, -10); ctx.lineTo(x0 + w * 0.05, -10); ctx.lineTo(x0 + w * 0.32, h); ctx.lineTo(x0 + w * 0.18, h); ctx.fill();
    }
    [['#34343f', 0.66, 30, 0.004], ['#272832', 0.76, 24, 0.007], ['#1a1b23', 0.86, 18, 0.011]].forEach(([c, b, amp, fr], i) => {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 12) ctx.lineTo(x, h * b + Math.sin(x * fr + i * 2) * amp + Math.sin(x * fr * 2.7 + i) * amp * 0.4);
      ctx.lineTo(w, h); ctx.fill();
    });
    for (const m of P.motes) { const y = (m.y * h - t * m.v + h) % h; ctx.fillStyle = `rgba(245,225,190,${0.18 * (0.5 + 0.5 * Math.sin(t + m.p)) * k})`; ctx.fillRect(m.x * w + Math.sin(t * 0.3 + m.p) * 10, y, 1.5, 1.5); }
    ctx.strokeStyle = 'rgba(22,22,30,0.75)'; ctx.lineWidth = 1.5;
    for (const b of P.birds) {
      const x = ((b.x * w + t * b.v) % (w + 80)) - 40, y = b.y * h * 0.6 + Math.sin(t * 0.5 + b.p) * 8, fl = Math.sin(t * b.f + b.p) * b.s * 0.6;
      ctx.beginPath(); ctx.moveTo(x - b.s, y - fl); ctx.quadraticCurveTo(x - b.s * 0.4, y - fl * 0.2, x, y); ctx.quadraticCurveTo(x + b.s * 0.4, y - fl * 0.2, x + b.s, y - fl); ctx.stroke();
    }
  },
  stream(ctx, w, h, t, P, k) {
    ctx.fillStyle = grad(ctx, h, [[0, '#162320'], [1, '#0d1614']]); ctx.fillRect(0, 0, w, h);
    glow(ctx, w * 0.6, h * 0.15, w * 0.5, '170,210,200', 0.07 * k);
    for (const l of P.flow) {
      const x = ((l.x * w + t * l.v) % (w + 200)) - 100, y = l.y * h + Math.sin(t * 0.8 + l.x * 10) * 2;
      ctx.strokeStyle = `rgba(180,218,208,${l.a * k})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l.l / 2, y - 3 - l.a * 10, x + l.l, y); ctx.stroke();
    }
    for (const s of P.spark) { const a = Math.max(0, Math.sin(t * s.f + s.p)); ctx.fillStyle = `rgba(230,245,240,${0.5 * a * a * k})`; ctx.fillRect(s.x * w, s.y * h, 1.6, 1.6); }
    ctx.fillStyle = '#0a110f';
    [[0.18, 0.92, 70, 18], [0.42, 0.97, 110, 22], [0.78, 0.9, 80, 16], [0.92, 0.99, 120, 26]].forEach(([x, y, rx, ry]) => { ctx.beginPath(); ctx.ellipse(x * w, y * h, rx, ry, 0, 0, 7); ctx.fill(); });
  },
  desert(ctx, w, h, t, P, k) {
    ctx.fillStyle = grad(ctx, h, [[0, '#24232d'], [0.55, '#4b3e40'], [1, '#76594a']]); ctx.fillRect(0, 0, w, h);
    glow(ctx, w * 0.62, h * 0.6, h * 0.5, '226,170,120', 0.28 * k);
    ctx.fillStyle = 'rgba(226,176,128,0.55)'; ctx.beginPath(); ctx.arc(w * 0.62, h * 0.6, 34, 0, 7); ctx.fill();
    [['#4a3a38', 0.62, 26, 0.006], ['#3a2e30', 0.74, 34, 0.004], ['#2a2226', 0.86, 22, 0.008]].forEach(([c, b, amp, fr], i) => {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 12) ctx.lineTo(x, h * b + Math.sin(x * fr + i * 1.4) * amp);
      ctx.lineTo(w, h); ctx.fill();
    });
    ctx.lineWidth = 1;
    for (const s of P.sand) { const x = ((s.x * w + t * s.v) % (w + 60)) - 30, y = h * (0.4 + s.y * 0.6) + Math.sin(t + s.p) * 3; ctx.strokeStyle = `rgba(230,204,172,${s.a * k})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s.l, y - s.l * 0.04); ctx.stroke(); }
  },
  fallback(ctx, w, h, t, P, k, tint) {
    ctx.fillStyle = grad(ctx, h, [[0, tint], [1, '#161826']]); ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 3; i++) glow(ctx, w * (0.25 + i * 0.25) + Math.sin(t * 0.2 + i * 2) * 60, h * (0.4 + 0.1 * Math.cos(t * 0.25 + i)), h * 0.6, '233,233,237', 0.04 * k);
    for (let j = 0; j < 3; j++) {
      ctx.strokeStyle = `rgba(233,233,237,${(0.16 - j * 0.04) * k})`; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let x = 0; x <= w; x += 6) { const y = h * 0.45 + Math.sin(x * 0.015 + t * (0.8 + j * 0.3) + j) * (18 - j * 4) * Math.sin(x / w * Math.PI) + Math.sin(x * 0.041 - t * 1.3) * 6; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
  },
};
