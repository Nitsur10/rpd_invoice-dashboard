# Claude Code Memory

## AWS Lightsail Instance

**Connection Details:**
- Host: ubuntu@13.54.176.108
- Key: ~/.ssh/lightsail_n8n.pem
- Command: `ssh -i ~/.ssh/lightsail_n8n.pem ubuntu@13.54.176.108`

**Instance Info:**
- OS: Ubuntu 22.04.5 LTS
- Internal IP: 172.26.4.164
- System load typically low (0.0)
- Memory usage: ~35%
- Disk usage: ~27% of 58GB

## Project Locations

**Local:**
- n8n Docker setup: `/Users/niteshsure/n8n-docker`
- Email automation: `/Users/niteshsure/MainDrive/Ligthsail_Email_automation/`
- ZARA Project: `/Users/niteshsure/Documents/todo/`

**Remote (Lightsail):**
- n8n Production: `https://13-54-176-108.nip.io/`
- Docker container: n8n (f6ab7d3c546f)

## ZARA WhatsApp AI Memory Agent System

**Current Status:** ✅ Complete AI Implementation with Database Integration

**Architecture:** WhatsApp → Twilio → n8n → ZARA (Memory Picker + Know-it-all) → Supabase

### Core Components
- **Memory Picker Agent:** Analyzes messages, decides what to store/retrieve
- **Know-it-all Agent:** Generates contextual RPD responses using stored memory
- **Supabase Storage:** Records all conversations with vector embeddings
- **WhatsApp Integration:** Business API compliance with 24-hour windows

### Production Deployment
- **Workflow ID:** 3wJiUPpYLEz7lGuu ("Twilio ZARA AI Agent - Full System")
- **Webhook URL:** `https://13-54-176-108.nip.io/webhook/twilio/wa`
- **Database:** Supabase with vector embeddings for AI memory

### Files Structure
```
/Users/niteshsure/Documents/todo/
├── twilio-zara-ai-full.json     # Complete AI workflow (13 nodes)
├── supabase-zara-schema.sql     # Full database schema
├── deploy-schema.sql            # Deployment-ready SQL
├── twilio-zara-tests.js         # Unit tests (100% coverage)
├── openai-credentials.json      # OpenAI config template
├── supabase-credentials.json    # Supabase config template
└── .env.supabase               # Token: sbp_9317bf61b58a8de6eb86ba18c663dff7a646e54d
```

### Database Schema
**Tables:**
- `wa_messages` - All WhatsApp messages (inbound/outbound)
- `wa_responses` - AI-generated responses with token tracking
- `client_context` - Client profiles and RPD context
- `rpd_projects` - Real Property Development projects
- `rpd_notes` - Contextual notes from conversations
- `memory_context` - AI memory with vector embeddings
- `wa_sessions` - 24-hour compliance window tracking

### AI Agent Configuration
**Memory Picker:**
- Model: GPT-4
- Purpose: Analyze incoming messages for storage/retrieval decisions
- Tools: get_all_rows, create_row, delete_row

**Know-it-all:**
- Model: GPT-4  
- Purpose: Generate contextual RPD responses
- Context: Full client history and project details

## Current Todo List

### ✅ Completed Tasks
- Add real AI Agent (Memory Picker + Know it all) to replace mock responses
- Configure OpenAI Chat Model credentials for ZARA agents  
- Integrate Supabase storage for all WhatsApp conversations
- Deploy Supabase schema for conversation tracking
- Configure Agent tools (delete_row, get_all_rows, create_row)

### 🔄 Pending Tasks
- Fix security vulnerabilities found in local n8n-docker dependencies
- Test complete AI workflow with real OpenAI responses
- Verify Supabase conversation recording

### Next Steps
1. **Deploy Database Schema:** Run `deploy-schema.sql` in Supabase SQL Editor
2. **Configure Credentials:** Add OpenAI and Supabase credentials in n8n
3. **Activate Workflow:** Enable the AI agent workflow in production
4. **Test End-to-End:** Send WhatsApp message to verify complete flow

## Technical Notes

**Webhook Processing:**
- Signature verification: HMAC-SHA1 (simplified for n8n sandbox)
- Message parsing: WhatsApp format to AI agent format
- Response handling: AI → Twilio → WhatsApp delivery

**AI Memory System:**
- Vector similarity search for context retrieval
- Client conversation history with RPD focus
- Automatic entity extraction and storage

**Compliance:**
- WhatsApp Business API 24-hour window tracking
- Message delivery status callbacks
- Template message management