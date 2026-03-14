# ⚛️ Antigravity AI — Claude-Powered Particle Simulator

An interactive particle simulator controlled by **natural language** using the Claude AI API.  
Type anything like *"make it rain fire"* or *"deep space vibes"* and watch the simulation transform in real time.

## ✨ Features

- 💬 **AI chat interface** — describe what you want in plain English
- ⚛️ **Real-time particle simulation** — up to 600 particles
- 🎨 **4 color modes** — Neon, Fire, Cosmic, Ice
- 🌀 **Black hole & explosion effects**
- 🖱️ **Mouse interaction** — repel or attract particles
- 📜 **Scroll** to change gravity
- 📱 Mobile friendly

## 🚀 How to Run

### Step 1 — Get a free API key
Go to [console.anthropic.com](https://console.anthropic.com) and create a free account to get an API key.

### Step 2 — Add your API key
Open `app.js` and replace line 8:
```javascript
const API_KEY = 'YOUR_API_KEY_HERE';
```
with your actual key:
```javascript
const API_KEY = 'sk-ant-...';
```

### Step 3 — Open the app
Just open `index.html` in your browser. No installations needed!

## 💬 Example Prompts

| You say | What happens |
|---------|-------------|
| `make it rain fire` | Gravity on, fire colors, fast speed |
| `go antigravity` | Particles float upward, neon mode |
| `black hole mode` | Everything gets sucked to the center |
| `deep space vibes` | Slow, tiny, cosmic colors, long trails |
| `absolute chaos` | Max particles, explosion, fire mode |
| `slow and peaceful` | Weightless, ice colors, few particles |

## 🗂 Project Structure

```
antigravity-ai/
├── index.html   # App layout
├── style.css    # UI styling
├── app.js       # Particle engine + Claude AI integration
└── README.md    # This file
```

## 🛠 Built With

- HTML5 Canvas API
- Vanilla JavaScript
- [Anthropic Claude API](https://anthropic.com)
- Google Fonts — Orbitron + Share Tech Mono

---

*Built to explore AI-controlled simulations, Canvas animation, and the Anthropic API.*
