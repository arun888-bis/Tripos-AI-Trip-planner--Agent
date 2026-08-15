<div align="center">

# 🌍 Tripos — Autonomous AI Trip Planner

### *Next-Generation Multi-Agent Travel Orchestration Platform*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-tripos--ai.vercel.app-FBD784?style=for-the-badge&logo=vercel&logoColor=black&labelColor=0B1319)](https://tripos-ai.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-FF6F00?style=for-the-badge&logo=langchain)](https://github.com/langchain-ai/langgraphjs)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.5%20%7C%203.7%20Flash-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![Tavily Search](https://img.shields.io/badge/Tavily-Real--Time%20Search-00C7B7?style=for-the-badge)](https://tavily.com/)
[![Prisma](https://img.shields.io/badge/Prisma-Neon%20PostgreSQL-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

<br />

### 🚀 **[Experience the Live Application → https://tripos-ai.vercel.app](https://tripos-ai.vercel.app)**

</div>

---

## 🌟 Executive Summary

**Tripos** is an autonomous travel intelligence and multi-agent orchestration platform designed to transform trip discovery and itinerary planning into a seamless, intelligent experience.

Traditional travel planning tools require hours of manual tab-switching across airlines, hotel aggregators, blog recommendations, and mapping tools. **Tripos replaces this fragmented workflow with a coordinated network of specialized AI agents** that conduct real-time web research in parallel, balance budgets dynamically across global currencies, and synthesize bespoke multi-day itineraries with verified timings, pricing, and human-in-the-loop revisions.

---

## 📸 Product Interface Showcase

### 1. Luxury Dark-Mode Landing Experience
*Crafted with high-contrast typography, gold accents, smooth micro-animations, and instant destination exploration.*

![Tripos Landing Page](./public/assets/landing_hero.png)

---

### 2. Multi-Step Expedition Wizard
*Interactive 3-step wizard capturing departure origins, destination targets, dates, custom budgets, currencies, and travel style preferences.*

![Trip Planner Wizard](./public/assets/planner_wizard.png)

---

### 3. Autonomous Multi-Agent Orchestrator
*Live terminal streaming real-time agent thoughts, search queries, tool outputs, and state transitions via Server-Sent Events (SSE).*

![Multi-Agent Thinking Terminal](./public/assets/agent_terminal.png)

---

### 4. Synthesized Multi-Day Timeline & Pricing
*Dynamic day-by-day itinerary featuring distinct themes, verified activity schedules, map locations, curated meals, and stay estimates.*

![Itinerary Timeline View](./public/assets/itinerary_timeline.png)

---

### 5. Expeditions Dashboard & Persistence
*Centralized travel dashboard backed by PostgreSQL, allowing travelers to revisit, review, and manage finalized trips.*

![Tripos Dashboard](./public/assets/dashboard_view.png)

---

## 🧠 System Architecture & Multi-Agent Workflow

Tripos utilizes a deterministic **Supervisor-Worker Pattern** constructed using **LangGraph StateGraph**:

```mermaid
flowchart TD
    Start([🚀 User Initiates Expedition]) --> Supervisor[Deterministic Supervisor Node]
    
    subgraph Parallel Research Swarm
        Supervisor -->|Parallel Fan-Out| HotelAgent[🏨 Hotel & Stays Specialist]
        Supervisor -->|Parallel Fan-Out| FlightAgent[✈️ Flights & Transit Specialist]
        Supervisor -->|Parallel Fan-Out| RestaurantAgent[🍽️ Culinary & Dining Specialist]
        Supervisor -->|Parallel Fan-Out| AttractionAgent[🏛️ Sights & Activities Specialist]
        
        HotelAgent -->|Live Tavily Web Search| Supervisor
        FlightAgent -->|Live Tavily Web Search| Supervisor
        RestaurantAgent -->|Live Tavily Web Search| Supervisor
        AttractionAgent -->|Live Tavily Web Search| Supervisor
    end
    
    Supervisor -->|Research Compiled| DraftAgent[🤖 Gemini Synthesizer & Day Planner]
    DraftAgent --> HumanReview[👤 Human Review & Feedback Loop]
    HumanReview -->|Approve & Finalize| DB[(💾 Neon PostgreSQL Database)]
    HumanReview -->|Refine / Feedback| DraftAgent
    DB --> End([🏁 Finalized Expedition])
```

---

## ⚡ Specialist Agent Swarm

| Agent | Core Objective | Research Focus & Grounding |
| :--- | :--- | :--- |
| **Supervisor Agent** | Graph orchestration & barrier sync | Manages parallel agent fan-out, validates state completeness, and routes to synthesizer. |
| **Hotel Specialist** | Accommodation discovery | Curates top-rated boutique stays, resorts, and central hotels matched to budget and traveler preferences. |
| **Flight / Transit Specialist** | Route & transport intelligence | Evaluates direct flights, carrier ranges, airport transit routes, and local mobility options. |
| **Culinary Specialist** | Food culture & secret dining | Identifies authentic local dishes, iconic food markets, neighborhood bistros, and top dinner venues. |
| **Attractions Specialist** | Activity curation & sightseeing | Structures morning, afternoon, and evening sights, heritage tickets, viewpoint passes, and hidden spots. |
| **Draft Synthesizer** | Multi-day JSON structuring | Reconciles research into an exact day-by-day itinerary with zero duplicated plans and strict pricing logic. |
| **Human Review Node** | Human-in-the-loop control | Empowers users to submit natural language guidance to adjust, replace, or refine any aspect before saving. |

---

## 💎 Key Technical Highlights

- **⚡ True Parallel Multi-Agent Execution**: Autonomous agents search and process data simultaneously, slashing itinerary synthesis time by over 70%.
- **🌐 Real-Time Web Grounding**: Live search integration via Tavily ensures pricing, flight data, and attractions reflect current real-world information.
- **🛡️ Multi-Model AI Cascading**: Automatic model failover across `gemini-3.5-flash`, `gemini-3.7-flash`, and `gemini-3.1-flash-lite`.
- **💵 Native Global Currency Valuation**: Dedicated pricing guardrails ensuring accurate purchasing-power calculations for **INR (₹)**, **USD ($)**, **EUR (€)**, **GBP (£)**, **JPY (¥)**, **AUD ($)**, and **CAD ($)**.
- **🔄 Session Thread Isolation**: Unique cryptographic thread identifiers prevent cross-search data leakage and stale memory checkpoints.
- **💾 Production Database Persistence**: Robust PostgreSQL schema powered by Prisma ORM for persistent trip storage and user state management.
- **📡 Server-Sent Events (SSE)**: Real-time unidirectional streaming delivering live agent updates without polling overhead.

---

## 🛠️ Technology Stack

- **Frontend & UX**: Next.js 16.3.1 (App Router), React 19, Framer Motion, Lucide Icons, Modern Vanilla CSS System.
- **Agent Orchestration**: LangGraph JS (`@langchain/langgraph`), LangChain Core, `@langchain/google-genai`.
- **AI Models & Web Search**: Google Gemini 3.5 / 3.7 Flash, Tavily Search API.
- **Database & Authentication**: Prisma ORM, Neon PostgreSQL, NextAuth.js.
- **Production Infrastructure**: Vercel Serverless Edge & Node.js Runtime.

---

## 🌐 Live Production Platform

Tripos is deployed and live on Vercel:

👉 **[https://tripos-ai.vercel.app](https://tripos-ai.vercel.app)**

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

<div align="center">
<b>Tripos</b> — Designed and engineered for the next era of autonomous AI travel.
</div>
