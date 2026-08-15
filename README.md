# Tripos (Wanderlust AI) — Multi-Agent Trip Planner

An autonomous, parallel multi-agent travel planning system built with **Next.js 16 (App Router)**, **LangGraph**, **Google Gemini 2.5 Flash**, **Tavily Web Search**, **Prisma ORM**, and **SQLite**.

---

## 📖 Architecture & Workflow Documentation

For the comprehensive technical architecture guide and Mermaid workflow diagram, refer to **[`ARCHITECTURE.md`](./ARCHITECTURE.md)**.

---

## 🚀 Getting Started

### 1. Configure Environment Variables
Copy or update `.env` with your API keys:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="super-secret-key-change-in-prod"
NEXTAUTH_URL="http://localhost:3000"

# AI & Search API Keys
GOOGLE_API_KEY="your_google_gemini_api_key"
TAVILY_API_KEY="your_tavily_api_key"
```

### 2. Run Database Migrations
```bash
npx prisma db push
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied).

---

## 🌟 Key Features

- **Parallel Specialist Workers**: 4 independent agents (`hotelAgent`, `flightAgent`, `restaurantAgent`, `attractionAgent`) conducting real-time web research via Tavily.
- **Zero-Rate-Limit Supervisor**: Deterministic state machine router with zero LLM consumption.
- **Gemini 2.5 Flash Synthesis**: Synthesizes unstructured research into strict multi-day structured JSON itineraries.
- **Human-in-the-Loop Review**: Real-time feedback loop allowing modifications before saving to local SQLite.
- **Bespoke Obsidian Theme**: Custom Vanilla CSS design with violet-purple and luminous teal glassmorphic styling (no Tailwind).
