# 🎯 Claude Code - Unified Agent Monitor

## 🚀 Quick Start

```bash
# Launch the unified monitor
./start-claude-monitor.sh

# Access the dashboard
open http://127.0.0.1:7777
```

## 📊 Features

### 🤖 **Individual Agent Tracking**
- Real-time agent status monitoring
- Individual token usage and costs
- Current task descriptions
- Performance efficiency ratings

### 📈 **Enterprise Analytics**
- Interactive Chart.js visualizations
- Token usage breakdown
- Agent performance comparisons
- Live activity feed

### 🎨 **Bright Visual Design**
- **Active agents** glow with neon blue (`oklch(0.81 0.10 252)`)
- **Coordinating agents** shimmer with green-blue gradients
- Smart highlighting based on activity
- Responsive design for all devices

## 🎯 **Agent Overview**

| Agent | Status | Tokens | Cost | Efficiency |
|-------|--------|--------|------|------------|
| ShadCN Optimization | 🔥 Active | 4,200 | $0.063 | 96.8% |
| Performance Audit | 🔥 Active | 3,850 | $0.058 | 94.2% |
| Code Quality | 🔥 Active | 5,600 | $0.084 | 95.7% |
| Master Orchestrator | ⭐ Coordinating | 8,500 | $0.128 | 99.1% |
| Design System | 🔥 Active | 3,200 | $0.048 | 97.4% |
| Documentation | 🔥 Active | 2,750 | $0.041 | 93.8% |
| Accessibility | 💡 Ready | 2,100 | $0.032 | 98.1% |
| UI Testing | 💤 Idle | 1,800 | $0.027 | 92.3% |

## 🔗 **API Endpoints**

- `GET /` - Main unified dashboard
- `GET /api/claude-status` - Real-time agent data
- `GET /api/token-usage` - Token consumption metrics
- `GET /individual` - Individual agents view
- `GET /world-class` - Enterprise analytics

## 📁 **File Structure**

```
claude-monitor/
├── server.py                     # Enhanced Python server
├── unified-monitor.html          # Main dashboard (DEFAULT)
├── individual-agent-monitor.html # Individual view
├── world-class-index.html        # Enterprise view
└── start-claude-monitor.sh       # Launch script
```

## 🎨 **Color Themes**

Inspired by [tweakcn.com](https://tweakcn.com/editor/theme):

```css
Active:      oklch(0.81 0.10 252)  /* Bright blue */
Coordinating: oklch(0.62 0.19 260)  /* Green-blue */
Ready:       oklch(0.55 0.22 263)  /* Warm yellow */
Idle:        oklch(0.49 0.22 264)  /* Deep purple */
```

## 🛠 **Troubleshooting**

**Port in use:**
```bash
lsof -ti:7777 | xargs kill -9
./start-claude-monitor.sh
```

**Manual server start:**
```bash
cd claude-monitor && python3 server.py
```

---

**🎉 Your Claude Code agents now shine with world-class monitoring!**