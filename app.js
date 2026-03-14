// ─────────────────────────────────────────────────────────
//  ANTIGRAVITY AI — Particle Simulator with Claude AI Chat
//  Uses Anthropic API (claude-sonnet-4-20250514)
// ─────────────────────────────────────────────────────────

// ── CONFIG — Add your API key here ───────────────────────
const API_KEY = 'API KEY HERE';
// Get a free API key at: https://console.anthropic.com

// ── Simulation state ──────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];
let mouse = { x: -9999, y: -9999, down: false };
let blackhole = null;

let cfg = {
  gravity: 0,
  speed: 1,
  size: 3,
  trail: 0.15,
  colorMode: 'neon',
  count: 200
};

const palettes = {
  neon:   () => `hsl(${170 + Math.random()*40}, 100%, ${55 + Math.random()*20}%)`,
  fire:   () => `hsl(${Math.random()*50}, 100%, ${50 + Math.random()*20}%)`,
  cosmic: () => `hsl(${260 + Math.random()*80}, 80%, ${55 + Math.random()*20}%)`,
  ice:    () => `hsl(${190 + Math.random()*30}, 70%, ${70 + Math.random()*20}%)`,
};

// ── Particle class ────────────────────────────────────────
class Particle {
  constructor(rand = false) {
    this.x = rand ? Math.random() * W : W/2 + (Math.random()-.5)*80;
    this.y = rand ? Math.random() * H : H/2 + (Math.random()-.5)*80;
    const a = Math.random() * Math.PI * 2;
    const s = (0.5 + Math.random() * 1.5) * cfg.speed;
    this.vx = Math.cos(a) * s;
    this.vy = Math.sin(a) * s;
    this.size = (0.5 + Math.random()) * cfg.size;
    this.color = palettes[cfg.colorMode]();
    this.alpha = 0.6 + Math.random() * 0.4;
  }

  update() {
    this.vy += cfg.gravity * 0.05;

    // Mouse repel/attract
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d < 120 && d > 0) {
      const f = (120 - d) / 120;
      const dir = mouse.down ? -1 : 1;
      this.vx += (dx/d) * f * 2 * dir;
      this.vy += (dy/d) * f * 2 * dir;
    }

    // Black hole pull
    if (blackhole) {
      const bx = this.x - blackhole.x;
      const by = this.y - blackhole.y;
      const bd = Math.sqrt(bx*bx + by*by);
      if (bd < 200 && bd > 4) {
        const pull = 280 / (bd * bd);
        this.vx -= (bx/bd) * pull * 8;
        this.vy -= (by/bd) * pull * 8;
      }
      if (bd < 5) Object.assign(this, new Particle(true));
    }

    // Speed cap
    const sp = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
    const max = 8 * cfg.speed;
    if (sp > max) { this.vx=(this.vx/sp)*max; this.vy=(this.vy/sp)*max; }

    this.x += this.vx;
    this.y += this.vy;

    // Bounce walls
    if (this.x < 0)  { this.x = 0;  this.vx *= -0.7; }
    if (this.x > W)  { this.x = W;  this.vx *= -0.7; }
    if (this.y < 0)  { this.y = 0;  this.vy *= -0.7; }
    if (this.y > H)  { this.y = H;  this.vy *= -0.7; }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.size * 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Simulation loop ───────────────────────────────────────
function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function init() {
  particles = Array.from({ length: cfg.count }, () => new Particle(true));
}

function loop() {
  requestAnimationFrame(loop);
  ctx.fillStyle = `rgba(2,4,8,${cfg.trail})`;
  ctx.fillRect(0, 0, W, H);

  if (blackhole) {
    const g = ctx.createRadialGradient(blackhole.x, blackhole.y, 0, blackhole.x, blackhole.y, 45);
    g.addColorStop(0, 'rgba(0,0,0,0.98)');
    g.addColorStop(0.6, 'rgba(80,0,160,0.4)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(blackhole.x, blackhole.y, 45, 0, Math.PI * 2);
    ctx.fill();
    blackhole.timer -= 16;
    if (blackhole.timer <= 0) blackhole = null;
  }

  while (particles.length < cfg.count) particles.push(new Particle(true));
  while (particles.length > cfg.count) particles.pop();
  particles.forEach(p => { p.update(); p.draw(); });
}

// ── Apply AI commands ─────────────────────────────────────
function applyCommand(cmd) {
  if (cmd.gravity   !== undefined) cfg.gravity   = cmd.gravity;
  if (cmd.speed     !== undefined) cfg.speed     = Math.max(0.1, Math.min(5, cmd.speed));
  if (cmd.size      !== undefined) cfg.size      = Math.max(1, Math.min(12, cmd.size));
  if (cmd.trail     !== undefined) cfg.trail     = Math.max(0.01, Math.min(0.8, cmd.trail));
  if (cmd.count     !== undefined) cfg.count     = Math.max(50, Math.min(600, cmd.count));
  if (cmd.colorMode && palettes[cmd.colorMode]) {
    cfg.colorMode = cmd.colorMode;
    particles.forEach(p => p.color = palettes[cfg.colorMode]());
  }
  if (cmd.explode) {
    const cx = W/2, cy = H/2;
    particles.forEach(p => {
      const dx=p.x-cx, dy=p.y-cy, d=Math.sqrt(dx*dx+dy*dy)||1;
      const f = 15 + Math.random() * 10;
      p.vx += (dx/d)*f; p.vy += (dy/d)*f;
      p.color = palettes[cfg.colorMode]();
    });
  }
  if (cmd.blackhole) blackhole = { x: W/2, y: H/2, timer: 5000 };
  if (cmd.reset) {
    cfg = { gravity:0, speed:1, size:3, trail:0.15, colorMode:'neon', count:200 };
    blackhole = null;
    init();
  }
}

// ── AI Chat ───────────────────────────────────────────────
const chatMessages = document.getElementById('chatMessages');
const userInput    = document.getElementById('userInput');
const sendBtn      = document.getElementById('sendBtn');

function addMsg(text, role) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

async function sendToAI(text) {
  if (!text.trim()) return;
  addMsg(text, 'user');
  userInput.value = '';

  const thinking = addMsg('Thinking...', 'thinking');

  const systemPrompt = `You control a particle physics simulator. When the user describes what they want, respond with ONLY a JSON object (no markdown, no explanation) with any of these fields:
- gravity: number (-2 to 2, negative = float upward, 0 = weightless)
- speed: number (0.1 to 5)
- size: number (1 to 12)
- trail: number (0.01 to 0.6, low = sharp, high = ghostly long trails)
- count: number (50 to 600)
- colorMode: "neon" | "fire" | "cosmic" | "ice"
- explode: true (blasts all particles from center)
- blackhole: true (sucks everything in for 5 seconds)
- reset: true (resets everything to default)
- message: a short fun 1-sentence description of what you did

Examples:
"make it rain fire" → {"gravity":1.5,"colorMode":"fire","speed":2,"trail":0.2,"message":"Fire raining down!"}
"go antigravity" → {"gravity":-1.5,"colorMode":"neon","message":"Defying gravity!"}
"deep space vibes" → {"gravity":0,"speed":0.4,"size":1,"trail":0.04,"colorMode":"cosmic","count":400,"message":"Drifting through deep space..."}
"absolute chaos" → {"explode":true,"speed":4,"count":500,"colorMode":"fire","trail":0.4,"message":"Total chaos unleashed!"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: systemPrompt + '\n\nUser: ' + text }]
          }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    thinking.remove();

    if (data.error) {
      addMsg(`API error: ${data.error.message}`, 'ai');
      return;
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let cmd;
    try {
      cmd = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      addMsg('AI returned an unexpected response. Try again!', 'ai');
      return;
    }

    applyCommand(cmd);
    addMsg(cmd.message || 'Done! Check out the simulation ✨', 'ai');

  } catch (err) {
    thinking.remove();
    addMsg('Could not reach AI. Check your API key in app.js!', 'ai');
    console.error(err);
  }
}

// ── Events ────────────────────────────────────────────────
sendBtn.addEventListener('click', () => sendToAI(userInput.value));
userInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendToAI(userInput.value); });

document.querySelectorAll('.sug').forEach(btn => {
  btn.addEventListener('click', () => sendToAI(btn.dataset.prompt));
});

canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
canvas.addEventListener('mousedown', () => { mouse.down = true; });
canvas.addEventListener('mouseup',   () => { mouse.down = false; });
canvas.addEventListener('mouseleave',() => { mouse.x = -9999; mouse.y = -9999; });

window.addEventListener('wheel', e => {
  cfg.gravity = Math.max(-2, Math.min(2, cfg.gravity + e.deltaY * 0.002));
}, { passive: true });

window.addEventListener('resize', resize);

// ── Start ─────────────────────────────────────────────────
resize();
init();
loop();
