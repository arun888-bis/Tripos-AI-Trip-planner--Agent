<div align="center">

# 🌍 Tripos — Autonomous AI Trip Planner

### *Next-Generation Multi-Agent Travel Orchestration Platform*

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-FF6F00?style=for-the-badge&logo=langchain)](https://github.com/langchain-ai/langgraphjs)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.5%20%7C%203.7%20Flash-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![Tavily Search](https://img.shields.io/badge/Tavily-Real--Time%20Search-00C7B7?style=for-the-badge)](https://tavily.com/)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL%20%2F%20SQLite-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live-000000?style=for-the-badge&logo=vercel)](https://tripos-ai.vercel.app)

<br />

**[🚀 Live Demo](https://tripos-ai.vercel.app)** • **[📖 Architecture Documentation](./ARCHITECTURE.md)** • **[✨ Report Issues](https://github.com/arun888-bis/Tripos-AI-Trip-planner--Agent/issues)**

</div>

---

## 🌟 Overview

**Tripos** is an autonomous, multi-agent travel intelligence platform built to redefine how modern journeys are discovered, researched, and structured. 

Powered by **LangGraph** state machines, real-time **Tavily Web Search**, and **Google Gemini** models, Tripos coordinates specialized autonomous agents in parallel to scout flight routes, boutique hotels, secret dining spots, and iconic cultural landmarks — producing fully customized, day-by-day itineraries with accurate, dynamic pricing across any global currency.

---

## 📸 Interface Preview & Visual Walkthrough

### 1. Luxury Landing Interface
*Sleek, dark-mode glassmorphic interface designed with modern aesthetics, curated destinations, and interactive highlights.*

![Tripos Landing Page](./public/assets/landing_hero.png)

---

### 2. Intuitive Multi-Step Trip Planner
*Dynamic 3-step wizard allowing travelers to select origins, destinations, calendar dates, flexible budgets, currencies, and travel style preferences.*

![Trip Planner Wizard](./public/assets/planner_wizard.png)

---

### 3. Real-Time Autonomous Agent Orchestrator
*Interactive terminal streaming live execution logs, tool invocations, web search queries, and parallel agent statuses via Server-Sent Events (SSE).*

![Multi-Agent Thinking Terminal](./public/assets/agent_terminal.png)

---

### 4. Synthesized Interactive Itinerary Timeline
*Rich multi-day itinerary featuring distinct daily themes, verified activity times, map locations, curated meals, and per-day dynamic cost breakdowns.*

![Itinerary Timeline View](./public/assets/itinerary_timeline.png)

---

### 5. Saved Expeditions & Dashboard
*Central dashboard displaying finalized trips with instant access to full itinerary breakdowns, dates, and total budgets.*

![Tripos Dashboard](./public/assets/dashboard_view.png)

---

## 🧠 Multi-Agent Architecture

Tripos leverages a deterministic **Supervisor-Worker** graph compiled with `@langchain/langgraph`:

```mermaid
flowchart TD
    Start([START]) --> Supervisor[Deterministic Supervisor Agent]
    
    Supervisor -->|Parallel Fan-Out| HotelAgent[🏨 Hotel & Stays Specialist]
    Supervisor -->|Parallel Fan-Out| FlightAgent[✈️ Flights & Transit Specialist]
    Supervisor -->|Parallel Fan-Out| RestaurantAgent[🍽️ Culinary & Dining Specialist]
    Supervisor -->|Parallel Fan-Out| AttractionAgent[🏛️ Sights & Activities Specialist]
    
    HotelAgent -->|Live Tavily Web Search| Supervisor
    FlightAgent -->|Live Tavily Web Search| Supervisor
    RestaurantAgent -->|Live Tavily Web Search| Supervisor
    AttractionAgent -->|Live Tavily Web Search| Supervisor
    
    Supervisor -->|All Data Compiled| DraftAgent[🤖 Gemini Synthesizer & Day Planner]
    DraftAgent --> HumanReview[👤 Human Review & Feedback Loop]
    HumanReview -->|Approve & Save| DB[(💾 Neon PostgreSQL / SQLite)]
    HumanReview -->|Refine / Revise| DraftAgent
    DB --> End([END])
```

### Agent Roles & Responsibilities

| Agent | Responsibility | Tooling |
| :--- | :--- | :--- |
| **Supervisor Agent** | Manages state transitions, parallel fan-out, and graph synchronization. | LangGraph StateGraph |
| **Hotel Specialist** | Gathers top accommodations matching budget, ratings, and location proximity. | Tavily Search + Gemini |
| **Flight / Transit Specialist** | Evaluates routes, transit options, flight ranges, and local airport transfers. | Tavily Search + Gemini |
| **Culinary Specialist** | Discovers authentic regional dishes, hidden gems, and top-rated restaurants. | Tavily Search + Gemini |
| **Attractions Specialist** | Curates landmark admissions, scenic walks, museum schedules, and hidden spots. | Tavily Search + Gemini |
| **Draft Synthesizer** | Normalizes all worker data into an exact day-by-day JSON itinerary. | Google Gemini (3.5 / 3.7 Flash) |
| **Human Review Node** | Accepts user feedback for iterative refinement or final approval. | LangGraph Checkpointing |

---

## ✨ Key Features

- **⚡ True Parallel Multi-Agent Execution**: 4 specialist agents execute web searches and reasoning simultaneously, cutting planning time by over 70%.
- **🌐 Real-Time Web Grounding**: Live queries via Tavily ensure flight guidelines, hotel pricing, and attractions reflect current real-world data.
- **🛡️ Strict Multi-Model Failover**: Intelligent cascading fallback across `gemini-3.5-flash`, `gemini-3.7-flash`, and `gemini-3.1-flash-lite`.
- **💵 Native Global Currency Engine**: Accurate denomination calculations tailored to **INR (₹)**, **USD ($)**, **EUR (€)**, **GBP (£)**, **JPY (¥)**, **AUD ($)**, and **CAD ($)**.
- **🔄 Human-in-the-Loop Revisions**: Reject or refine any part of your itinerary with natural language feedback before finalizing.
- **💾 Full Trip Persistence**: Secure database storage via Prisma ORM with support for Neon PostgreSQL in production and SQLite in development.
- **📡 Server-Sent Events (SSE)**: Ultra-responsive streaming architecture with zero polling.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16.3.1 (App Router), React 19, Framer Motion, Lucide Icons, Vanilla CSS Design System.
- **AI & Agentic Orchestration**: LangGraph JS (`@langchain/langgraph`), LangChain Core, `@langchain/google-genai`.
- **Search & LLMs**: Google Gemini (`gemini-3.5-flash`, `gemini-3.7-flash`), Tavily Search API.
- **Database & Backend**: Prisma ORM, PostgreSQL (Neon) / SQLite, NextAuth.js.
- **Deployment**: Vercel (Edge & Node.js Serverless runtime).

---

## 🚀 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/arun888-bis/Tripos-AI-Trip-planner--Agent.git
cd Tripos-AI-Trip-planner--Agent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Google Gemini API Key (Get at: https://aistudio.google.com/)
GOOGLE_API_KEY="your-gemini-api-key"

# Tavily Search API Key (Get at: https://tavily.com/)
TAVILY_API_KEY="your-tavily-api-key"

# Database Connection (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-change-in-prod"
NEXTAUTH_URL="https://tripos-ai.vercel.app"
```

### 4. Initialize Database
```bash
npx prisma db push
```

### 5. Start Application
```bash
npm run dev
```

Visit the live production application at **[https://tripos-ai.vercel.app](https://tripos-ai.vercel.app)**!

---

## 🌐 Production Deployment (Vercel)

The live production deployment is hosted on Vercel:

🔗 **Production URL:** [https://tripos-ai.vercel.app](https://tripos-ai.vercel.app)

To deploy your own instance:
1. Push your repository to **GitHub**.
2. Import the repository into **[Vercel](https://vercel.com)**.
3. In **Vercel Settings ➔ Environment Variables**, configure:
   - `GOOGLE_API_KEY`
   - `TAVILY_API_KEY`
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` = `https://tripos-ai.vercel.app`
4. Deploy!

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">
Built with ❤️ for curious travelers and autonomous AI enthusiasts.
</div>
