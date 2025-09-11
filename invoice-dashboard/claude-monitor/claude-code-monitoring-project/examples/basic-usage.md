# 📖 Basic Usage Examples

## 🚀 Starting the Monitor

```bash
# Option 1: Use the convenient launcher
./start-monitor.sh

# Option 2: Manual start
cd src
python3 server.py
```

## 🌐 Accessing the Dashboard

```bash
# Open in default browser
open http://127.0.0.1:7778

# Or visit manually
# http://localhost:7778
```

## 📊 Dashboard Navigation

### **Individual Agents Tab** 🤖
- View all 20+ real Claude Code agents
- See current tasks and status
- Monitor token usage per agent
- Check task queues and priorities

### **Analytics Tab** 📈
- Interactive charts showing agent performance
- Token usage breakdowns
- Real-time performance metrics

### **Token Usage Tab** 🎯
- ccusage-style visual representation
- Breakdown by system components
- Individual agent context usage

### **Usage History Tab** 📈
- Historical usage trends
- Cost analysis over time
- Session statistics
- Interactive time range selection

## 🔧 API Usage Examples

### Get Current Agent Status
```bash
curl http://127.0.0.1:7778/api/claude-status | jq
```

### Check Token Usage
```bash
curl http://127.0.0.1:7778/api/token-usage | jq
```

### View Usage History
```bash
# Last 24 hours (default)
curl http://127.0.0.1:7778/api/usage-history | jq

# Last 6 hours
curl http://127.0.0.1:7778/api/usage-history?hours=6 | jq
```

## 💡 Tips & Tricks

### **Real-time Monitoring**
- Data refreshes every 3 seconds
- File modification triggers status updates
- Agent names are auto-generated from task content

### **Status Meanings**
- 🔥 **Active**: Working on tasks (modified within 5 minutes)
- ⭐ **Coordinating**: Managing workflows (in-progress tasks)
- 💡 **Ready**: Recently active (within 1 hour)
- 💤 **Idle**: Not recently active

### **Performance Optimization**
- Database logs are automatically cleaned
- Charts are optimized for smooth rendering
- Mobile-responsive design works on all devices

## 🛠 Troubleshooting

### Port Already in Use
```bash
lsof -ti:7778 | xargs kill -9
./start-monitor.sh
```

### Dashboard Not Loading
```bash
# Check server status
curl http://127.0.0.1:7778/api/claude-status

# Restart server
./start-monitor.sh
```

### No Real Agent Data
- Ensure Claude Code is running
- Check `~/.claude/todos/` directory exists
- Verify session file at `~/.claude/statsig/`

## 📈 Advanced Usage

### Custom Time Ranges
Use the time control buttons in Usage History:
- **1 Hour**: Recent activity
- **6 Hours**: Short-term trends  
- **24 Hours**: Daily overview
- **7 Days**: Weekly patterns

### Export Data
The SQLite database (`usage_history.db`) can be queried directly:
```bash
sqlite3 src/usage_history.db "SELECT * FROM usage_logs ORDER BY timestamp DESC LIMIT 10;"
```

---

*Happy monitoring! 🎯*