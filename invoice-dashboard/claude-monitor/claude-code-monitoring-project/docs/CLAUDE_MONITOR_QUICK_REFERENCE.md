# 🎯 Claude Code Monitor - Quick Reference

## 🚀 Launch Commands

```bash
# Start unified monitor (RECOMMENDED)
./start-claude-monitor.sh

# Direct server start
cd claude-monitor && python3 server.py
```

## 🔗 Access URLs

- **Main Dashboard**: http://127.0.0.1:7777 ⭐
- **Individual View**: http://127.0.0.1:7777/individual
- **Analytics View**: http://127.0.0.1:7777/world-class

## 📊 Dashboard Tabs

| Tab | Content | Features |
|-----|---------|----------|
| 🤖 **Individual Agents** | Real-time agent cards | Token usage, status, tasks |
| 📊 **Analytics** | Interactive charts | Performance graphs, trends |  
| ⚡ **Live Activity** | Activity feed | Recent actions, timestamps |

## 🤖 Agent Status Guide

| Status | Color | Description | Visual Effect |
|--------|-------|-------------|---------------|
| 🔥 **Active** | Bright Blue | Working on tasks | Neon glow, scale 1.05x |
| ⭐ **Coordinating** | Green-Blue | Managing workflows | Shimmer border, scale 1.06x |
| 💡 **Ready** | Warm Yellow | Standing by | Medium glow |
| 💤 **Idle** | Deep Purple | Resting | Subtle glow |

## 💰 Cost Calculation

```
Token Cost = (Tokens Used × $0.015) / 1000
Example: 4,200 tokens = $0.063
```

## 🎨 Color Palette (oklch)

```css
oklch(0.81 0.10 252)  /* Active - Bright Blue */
oklch(0.62 0.19 260)  /* Coordinating - Green-Blue */
oklch(0.55 0.22 263)  /* Ready - Warm Yellow */
oklch(0.49 0.22 264)  /* Idle - Deep Purple */
```

## 🔧 Troubleshooting

```bash
# Kill port 7777
lsof -ti:7777 | xargs kill -9

# Test API
curl http://127.0.0.1:7777/api/claude-status

# Check server status
ps aux | grep python
```

## 📈 Key Metrics

- **Update Frequency**: 3 seconds
- **API Response**: < 50ms
- **Total Agents**: 8 specialized
- **Current Session**: 32k+ tokens, $0.48+

## 🎯 Current Agent Summary

- **6 Active** 🔥 (ShadCN, Performance, Code Quality, Design, Docs, Master)
- **1 Ready** 💡 (Accessibility)  
- **1 Idle** 💤 (UI Testing)

---

**🎉 World-class monitoring with bright, beautiful agents!**