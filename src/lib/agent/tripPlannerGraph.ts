import { StateGraph, Annotation, START, END, MemorySaver } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { searchTavily } from "./tools";

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  location?: string;
  estimatedCost?: number;
}

export interface DayItinerary {
  day: number;
  date?: string;
  title: string;
  theme?: string;
  activities: ItineraryActivity[];
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  stay?: {
    name: string;
    description: string;
    estimatedCostPerNight?: number;
  };
  dailyEstimatedCost?: number;
}

export interface TripPlannerOutput {
  summary: string;
  totalEstimatedCost: number;
  currency: string;
  tips: string[];
  days: DayItinerary[];
}

export const TripState = Annotation.Root({
  origin: Annotation<string | undefined>(),
  destination: Annotation<string>(),
  budget: Annotation<number | string>(),
  currency: Annotation<string>(),
  startDate: Annotation<string | undefined>(),
  endDate: Annotation<string | undefined>(),
  preferences: Annotation<string | undefined>(),
  userFeedback: Annotation<string | undefined>(),
  
  // Worker Data Gathers
  hotelData: Annotation<string | undefined>(),
  flightData: Annotation<string | undefined>(),
  restaurantData: Annotation<string | undefined>(),
  attractionData: Annotation<string | undefined>(),
  
  // Final Draft
  itineraryDraft: Annotation<TripPlannerOutput | DayItinerary[] | string | undefined>(),
  status: Annotation<string | undefined>(),
});

export type TripStateType = typeof TripState.State;

/**
 * Returns a Gemini LLM instance configured for gemini-flash-latest.
 */
function getGeminiModel(temperature: number = 0.4, modelName: string = "gemini-3.5-flash") {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set. Please add your Gemini API key to the .env file.");
  }
  return new ChatGoogleGenerativeAI({
    model: modelName,
    apiKey,
    temperature,
  });
}

function normalizeItinerary(raw: any, destination: string, budget: number | string, currency: string): TripPlannerOutput {
  const numBudget = Number(budget) || 1200;
  const curr = raw.currency || currency || "USD";
  const days: DayItinerary[] = Array.isArray(raw.days) ? raw.days : (Array.isArray(raw) ? raw : []);

  let calculatedTotal = 0;
  const processedDays = days.map((d: any, idx: number) => {
    const dayNum = d.day || idx + 1;
    const activities = Array.isArray(d.activities) ? d.activities : [];
    
    // Sum activities
    const actTotal = activities.reduce((sum: number, a: any) => sum + (Number(a.estimatedCost) || 0), 0);
    const stayCost = Number(d.stay?.estimatedCostPerNight) || 0;
    
    // Calculate or preserve dynamic daily cost
    let dayCost = Number(d.dailyEstimatedCost);
    if (!dayCost || dayCost <= 0) {
      dayCost = actTotal + stayCost;
    }

    calculatedTotal += dayCost;

    return {
      day: dayNum,
      date: d.date || `Day ${dayNum}`,
      title: d.title || `Exploring ${destination} - Day ${dayNum}`,
      theme: d.theme || "Exploration & Sights",
      activities: activities.map((a: any) => ({
        time: a.time || "10:00 AM",
        title: a.title || "Sightseeing",
        description: a.description || "",
        location: a.location || destination,
        estimatedCost: a.estimatedCost !== undefined ? Number(a.estimatedCost) : undefined,
      })),
      meals: d.meals || {
        breakfast: "Local café or hotel",
        lunch: "Neighborhood eatery",
        dinner: "Regional dining experience",
      },
      stay: d.stay || {
        name: `Recommended stay in ${destination}`,
        description: "Top-rated accommodation",
        estimatedCostPerNight: stayCost > 0 ? stayCost : undefined,
      },
      dailyEstimatedCost: Math.round(dayCost),
    };
  });

  return {
    summary: raw.summary || `Personalized multi-day journey in ${destination}`,
    totalEstimatedCost: Math.round(raw.totalEstimatedCost && raw.totalEstimatedCost > 0 ? raw.totalEstimatedCost : (calculatedTotal > 0 ? calculatedTotal : numBudget)),
    currency: curr,
    tips: Array.isArray(raw.tips) && raw.tips.length > 0 ? raw.tips : ["Check local transport options.", "Keep reservations handy."],
    days: processedDays,
  };
}

/**
 * Robust JSON parser for LLM responses.
 */
function parseItineraryJSON(content: string, destination: string, budget: number | string, currency: string): TripPlannerOutput {
  const trimmed = content.trim();

  // 1. Direct parse attempt
  try {
    const direct = JSON.parse(trimmed);
    if (direct && typeof direct === "object") {
      return normalizeItinerary(direct, destination, budget, currency);
    }
  } catch (_) {}

  // 2. Extract from ```json ... ``` markdown code block
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (parsed && typeof parsed === "object") {
        return normalizeItinerary(parsed, destination, budget, currency);
      }
    } catch (_) {}
  }

  // 3. Extract JSON object substring between { and }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const extracted = JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
      if (extracted && typeof extracted === "object") {
        return normalizeItinerary(extracted, destination, budget, currency);
      }
    } catch (_) {}
  }

  // 4. Extract JSON array substring between [ and ]
  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      const daysArr = JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
      if (Array.isArray(daysArr)) {
        return normalizeItinerary({ days: daysArr }, destination, budget, currency);
      }
    } catch (_) {}
  }

  throw new Error("Unable to parse structured JSON from LLM response");
}

/**
 * Helper to invoke Gemini fallback if Tavily web search fails.
 */
async function fallbackGeminiWorker(topic: string, state: TripStateType): Promise<string> {
  try {
    const llm = getGeminiModel(0.5);
    const originStr = state.origin ? `From: ${state.origin}` : "";
    const prompt = `You are an expert travel assistant specializing in ${topic}.
Destination: ${state.destination}
${originStr}
Budget: ${state.budget} ${state.currency || "USD"}
Dates: ${state.startDate || "Flexible"} to ${state.endDate || "Flexible"}
User Preferences: ${state.preferences || "None specified"}

Provide a concise, highly realistic, curated list of recommendations for ${topic} with estimated costs, location areas, and highlights.`;

    const response = await llm.invoke(prompt);
    return typeof response.content === "string" ? response.content : JSON.stringify(response.content);
  } catch (err) {
    console.error(`[Gemini Fallback Error - ${topic}]:`, err);
    return `Standard recommendations for ${topic} in ${state.destination} within budget ${state.budget} ${state.currency}.`;
  }
}

/**
 * 1. Hotel Worker Agent
 */
export async function hotelAgent(state: TripStateType): Promise<Partial<TripStateType>> {
  const query = `best hotels accommodations ${state.destination} budget ${state.budget} ${state.currency || "USD"} ${state.preferences || ""}`;
  let data = await searchTavily(query, 4);

  if (!data) {
    console.log("[hotelAgent] Tavily failed or unavailable, falling back to Gemini...");
    data = await fallbackGeminiWorker("Hotels & Accommodations", state);
  }

  return { hotelData: data };
}

/**
 * 2. Flight / Transport Worker Agent
 */
export async function flightAgent(state: TripStateType): Promise<Partial<TripStateType>> {
  const originStr = state.origin ? `from ${state.origin} ` : "";
  const query = `travel transit flights ${originStr}to ${state.destination} cost transport tips ${state.preferences || ""}`;
  let data = await searchTavily(query, 4);

  if (!data) {
    console.log("[flightAgent] Tavily failed or unavailable, falling back to Gemini...");
    data = await fallbackGeminiWorker("Flights & Local Transportation", state);
  }

  return { flightData: data };
}

/**
 * 3. Restaurant / Dining Worker Agent
 */
export async function restaurantAgent(state: TripStateType): Promise<Partial<TripStateType>> {
  const query = `top restaurants culinary food guide ${state.destination} must try dishes ${state.preferences || ""}`;
  let data = await searchTavily(query, 4);

  if (!data) {
    console.log("[restaurantAgent] Tavily failed or unavailable, falling back to Gemini...");
    data = await fallbackGeminiWorker("Restaurants & Food Scene", state);
  }

  return { restaurantData: data };
}

/**
 * 4. Attraction / Activities Worker Agent
 */
export async function attractionAgent(state: TripStateType): Promise<Partial<TripStateType>> {
  const query = `top attractions sights things to do must visit places ${state.destination} itinerary ${state.preferences || ""}`;
  let data = await searchTavily(query, 4);

  if (!data) {
    console.log("[attractionAgent] Tavily failed or unavailable, falling back to Gemini...");
    data = await fallbackGeminiWorker("Attractions & Activities", state);
  }

  return { attractionData: data };
}

/**
 * 5. Draft Agent
 * Synthesizes research from all 4 workers using Gemini into a strict JSON itinerary.
 */
export async function draftAgent(state: TripStateType): Promise<Partial<TripStateType>> {
  const originStr = state.origin ? `Departing From: ${state.origin}` : "";

  // Calculate day count
  let dayCount = 4;
  if (state.startDate && state.endDate) {
    const s = new Date(state.startDate);
    const e = new Date(state.endDate);
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diff > 0 && diff <= 14) {
      dayCount = diff;
    }
  }

  const prompt = `You are a master AI Travel Itinerary Planner.
Synthesize the research provided by specialist agents below into a comprehensive, realistic ${dayCount}-day itinerary for ${state.destination}.

Destination: ${state.destination}
${originStr}
Budget: ${state.budget} ${state.currency || "USD"}
Duration: ${dayCount} Days (${state.startDate || "Day 1"} to ${state.endDate || `Day ${dayCount}`})
Preferences: ${state.preferences || "Balanced leisure and exploration"}
${state.userFeedback ? `User Modification Feedback: ${state.userFeedback}` : ""}

--- Specialist Research ---
[HOTELS & STAYS]:
${state.hotelData || "N/A"}

[FLIGHTS & TRANSIT]:
${state.flightData || "N/A"}

[RESTAURANTS & DINING]:
${state.restaurantData || "N/A"}

[ATTRACTIONS & SIGHTS]:
${state.attractionData || "N/A"}
---------------------------
Generate an exact ${dayCount}-day itinerary containing all ${dayCount} distinct day objects in the "days" array (Day 1 through Day ${dayCount}).

CRITICAL CURRENCY & PRICING RULES:
- Currency Selected: ${state.currency || "USD"}
- Total User Budget: ${state.budget} ${state.currency || "USD"} (for ${dayCount} days, approximately ~${Math.round((Number(state.budget) || 1200) / dayCount)} ${state.currency || "USD"} per day)
- ALL cost fields ("estimatedCost", "estimatedCostPerNight", "dailyEstimatedCost", "totalEstimatedCost") MUST be realistic numbers strictly in the requested currency (${state.currency || "USD"}).
- DO NOT confuse currencies:
  * If currency is INR (₹): Activity costs must be realistic in Indian Rupees (e.g. 300 to 2500 INR), hotel stay per night (e.g. 2000 to 8000 INR), daily total (e.g. 3000 to 12000 INR). Never output double-digit USD amounts for INR!
  * If currency is JPY (¥): Costs must be in realistic thousands of Yen (e.g. 2000 to 18000 JPY).
  * If currency is USD/EUR/GBP: Costs must be realistic for Western markets (e.g. activities 15-60, stay 80-250/night).
- EVERY DAY MUST HAVE COMPLETELY UNIQUE AND DISTINCT ACTIVITIES, LOCATIONS, AND THEMES.
- Calculate dailyEstimatedCost specifically for each day based on that day's unique activities, meals, and stay.
- Ensure the sum of all days' dailyEstimatedCost aligns with the total budget of ${state.budget} ${state.currency || "USD"}.

OUTPUT INSTRUCTIONS:
Return ONLY valid JSON without any surrounding conversational text or markdown code fences:
{
  "summary": "Captivating narrative overview of the ${dayCount}-day journey across ${state.destination}",
  "totalEstimatedCost": ${Number(state.budget) || 1200},
  "currency": "${state.currency || "USD"}",
  "tips": [
    "Practical local travel tip 1",
    "Practical local travel tip 2",
    "Culinary tip 3"
  ],
  "days": [
    {
      "day": 1,
      "date": "${state.startDate || "Day 1"}",
      "title": "Arrival & City Orientation",
      "theme": "Settling In & Scenic Walk",
      "activities": [
        {
          "time": "10:30 AM",
          "title": "Check-in & Neighborhood Walk",
          "description": "Settle into your accommodation and explore the surrounding central district.",
          "location": "${state.destination} Central Area",
          "estimatedCost": 20
        },
        {
          "time": "03:00 PM",
          "title": "Historic Old Town & Heritage Sights",
          "description": "Discover primary architectural highlights and iconic squares.",
          "location": "Old Town District",
          "estimatedCost": 35
        }
      ],
      "meals": {
        "breakfast": "Welcome café coffee & pastries",
        "lunch": "Authentic regional bistro",
        "dinner": "Traditional evening dinner"
      },
      "stay": {
        "name": "Central Boutique Hotel",
        "description": "Comfortable, top-rated property matching the budget",
        "estimatedCostPerNight": 110
      },
      "dailyEstimatedCost": 165
    }
  ]
}`;

  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GOOGLE_API_KEY environment variable. Please set your Gemini API key in .env");
    }

    let response;
    const candidateModels = ["gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite"];
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const llm = getGeminiModel(0.3, modelName);
        response = await llm.invoke(prompt);
        if (response && response.content) {
          break;
        }
      } catch (mErr) {
        lastError = mErr;
        console.warn(`[draftAgent] ${modelName} invocation failed, trying next model...`);
      }
    }

    if (!response || !response.content) {
      throw lastError || new Error("All Gemini models failed to respond");
    }

    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const parsed = parseItineraryJSON(content, state.destination, state.budget, state.currency);

    return {
      itineraryDraft: parsed,
      status: "DRAFT",
    };
  } catch (err) {
    console.error("[draftAgent] Error generating itinerary with LLM, using rich contextual generator:", err);

    const userBudget = Number(state.budget) || 1200;
    const avgDailyBudget = Math.max(50, Math.round(userBudget / dayCount));
    const stayCostPerNight = Math.max(30, Math.round(avgDailyBudget * 0.55));

    // Curated rich day-by-day themes and activities so every day is distinct
    const dayBlueprints = [
      {
        title: `Arrival & Historic Center Orientation`,
        theme: "Arrival & City Walk",
        morning: { title: "Check-in & Neighborhood Walk", desc: "Settle into your accommodation, unwind, and take a relaxed stroll through the central boulevard." },
        afternoon: { title: "Old Town & Historic Squares", desc: "Discover iconic heritage architecture, ancient monuments, and picturesque alleys." },
        evening: { title: "Welcome Dinner & Night Lights", desc: "Enjoy authentic local cuisine at a highly-rated traditional tavern as the city illuminates." },
        multiplier: 0.85,
        meals: { breakfast: "Welcome espresso & pastries", lunch: "Classic old town bistro", dinner: "Regional specialty dinner" }
      },
      {
        title: `Iconic Landmarks & Cultural Highlights`,
        theme: "Famous Sights & Monuments",
        morning: { title: "Premier Landmark & Viewpoint", desc: "Beat the crowds to visit the city's most famous landmark and take in panoramic skyline vistas." },
        afternoon: { title: "National Museum & Heritage Tour", desc: "Explore world-class exhibitions, art galleries, and historic collections." },
        evening: { title: "Sunset Observation & Fine Dining", desc: "Catch golden hour from a scenic viewpoint followed by a memorable dinner." },
        multiplier: 1.20,
        meals: { breakfast: "Hotel breakfast buffet", lunch: "Museum café & artisan salads", dinner: "Fine dining overlooking the city" }
      },
      {
        title: `Hidden Neighborhoods & Street Food Discovery`,
        theme: "Local Culture & Secret Spots",
        morning: { title: "Artisan Quarter & Local Markets", desc: "Wander through bustling food markets, sampling fresh regional specialties and handcrafted goods." },
        afternoon: { title: "Bohemian District & Secret Courtyards", desc: "Discover hidden street art, boutique vintage shops, and historic courtyards." },
        evening: { title: "Tasting Tour & Evening Entertainment", desc: "Experience local nightlife, street food stalls, and acoustic music venues." },
        multiplier: 1.10,
        meals: { breakfast: "Bakery delights & fresh juice", lunch: "Market street food tasting", dinner: "Vibrant local gastropub" }
      },
      {
        title: `Parks, Waterfront & Scenic Nature`,
        theme: "Scenic Views & Outdoor Leisure",
        morning: { title: "Botanical Gardens & Royal Promenade", desc: "Enjoy a tranquil morning walking through lush landscaped gardens and waterfront trails." },
        afternoon: { title: "Scenic River Cruise or Hilltop Walk", desc: "Take a relaxing cruise or cable car ride offering breathtaking angles of the region." },
        evening: { title: "Waterside Dining & Evening Relax", desc: "Dine on fresh seafood or regional grilled specialties right by the water." },
        multiplier: 0.95,
        meals: { breakfast: "Waterside terrace breakfast", lunch: "Casual open-air café", dinner: "Lakeside/riverside cuisine" }
      },
      {
        title: `Artisans, Shopping & Masterclass Experience`,
        theme: "Crafts, Shopping & Workshops",
        morning: { title: "Local Craft Workshop / Food Masterclass", desc: "Participate in a hands-on culinary or artisan craft experience guided by local experts." },
        afternoon: { title: "Designer Boutiques & Souvenir Arcades", desc: "Pick up authentic souvenirs, regional wines, spices, and unique fashion." },
        evening: { title: "Culinary Feast & Wine/Beverage Tasting", desc: "Sample curated regional pairings and specialty courses." },
        multiplier: 1.05,
        meals: { breakfast: "Artisan coffee & sourdough", lunch: "Boutique district deli", dinner: "Curated wine & dining experience" }
      },
      {
        title: `Off-the-Beaten-Path & Adventure Day`,
        theme: "Discovery & Panoramic Excursion",
        morning: { title: "Scenic Outskirts & Historic Fort / Castle", desc: "Travel just beyond the city center to explore ancient ramparts and picturesque vistas." },
        afternoon: { title: "Countryside Village Walk & Tea House", desc: "Stroll through quiet historic villages and enjoy regional afternoon delicacies." },
        evening: { title: "Rustic Hearth Dinner", desc: "Dine on hearty farm-to-table recipes in a cozy countryside setting." },
        multiplier: 1.15,
        meals: { breakfast: "Country-style breakfast", lunch: "Village tavern specialties", dinner: "Farm-to-table hearth dinner" }
      },
      {
        title: `Farewell Exploration & Sunset Celebration`,
        theme: "Memories & Farewell Dining",
        morning: { title: "Last Favorite Sights & Photography", desc: "Revisit your favorite spot for morning photos and peaceful reflections." },
        afternoon: { title: "Leisurely Stroll & Final Souvenirs", desc: "Pick up last-minute gifts and enjoy an artisan gelato or afternoon coffee." },
        evening: { title: "Grand Farewell Celebration Feast", desc: "Celebrate the conclusion of an unforgettable journey with a multi-course dinner." },
        multiplier: 0.80,
        meals: { breakfast: "Special rooftop breakfast", lunch: "Favorite local café", dinner: "Celebratory farewell banquet" }
      }
    ];

    const fallbackDays: DayItinerary[] = [];

    for (let i = 1; i <= dayCount; i++) {
      const blueprint = dayBlueprints[(i - 1) % dayBlueprints.length];
      const morningCost = Math.max(10, Math.round(avgDailyBudget * 0.15 * blueprint.multiplier));
      const afternoonCost = Math.max(15, Math.round(avgDailyBudget * 0.25 * blueprint.multiplier));
      const dayTotal = morningCost + afternoonCost + stayCostPerNight;

      fallbackDays.push({
        day: i,
        date: state.startDate ? `Day ${i}` : undefined,
        title: i === 1 ? `Arrival & Exploring ${state.destination}` : i === dayCount ? `Farewell & Departure from ${state.destination}` : `${blueprint.title} in ${state.destination}`,
        theme: blueprint.theme,
        activities: [
          {
            time: "09:30 AM",
            title: `${blueprint.morning.title}`,
            description: `${blueprint.morning.desc}`,
            location: `${state.destination} Central District`,
            estimatedCost: morningCost,
          },
          {
            time: "02:30 PM",
            title: `${blueprint.afternoon.title}`,
            description: `${blueprint.afternoon.desc}`,
            location: `${state.destination} Cultural Zone`,
            estimatedCost: afternoonCost,
          },
          {
            time: "07:00 PM",
            title: `${blueprint.evening.title}`,
            description: `${blueprint.evening.desc}`,
            location: `${state.destination} Dining Quarter`,
            estimatedCost: Math.max(10, Math.round(avgDailyBudget * 0.20 * blueprint.multiplier)),
          }
        ],
        meals: blueprint.meals,
        stay: {
          name: `Top Rated Accommodation in ${state.destination}`,
          description: "Centrally located, highly rated by travelers",
          estimatedCostPerNight: stayCostPerNight,
        },
        dailyEstimatedCost: dayTotal,
      });
    }

    return {
      itineraryDraft: {
        summary: `Custom ${dayCount}-day journey exploring ${state.destination} with distinct daily adventures`,
        totalEstimatedCost: userBudget,
        currency: state.currency || "USD",
        tips: ["Book high-demand sights in advance.", "Use local transit options.", "Keep reservations handy."],
        days: fallbackDays,
      },
      status: "DRAFT",
    };
  }
}

/**
 * 6. Human Review Node
 */
export async function humanReview(state: TripStateType): Promise<Partial<TripStateType>> {
  return {
    status: "READY_FOR_REVIEW",
  };
}

/**
 * Deterministic Supervisor Agent
 */
export function supervisorRouter(state: TripStateType): string[] | string {
  // If any worker research is missing, fan out in parallel to all 4 workers
  if (!state.hotelData || !state.flightData || !state.restaurantData || !state.attractionData) {
    return ["hotelAgent", "flightAgent", "restaurantAgent", "attractionAgent"];
  }

  // Once all 4 workers have populated data, route to draftAgent
  if (!state.itineraryDraft) {
    return "draftAgent";
  }

  // Final step: humanReview
  return "humanReview";
}

// Build StateGraph
export const workflow = new StateGraph(TripState)
  .addNode("supervisor", (state) => state)
  .addNode("hotelAgent", hotelAgent)
  .addNode("flightAgent", flightAgent)
  .addNode("restaurantAgent", restaurantAgent)
  .addNode("attractionAgent", attractionAgent)
  .addNode("draftAgent", draftAgent)
  .addNode("humanReview", humanReview)
  
  // Starting point -> Supervisor
  .addEdge(START, "supervisor")
  
  // Deterministic routing from Supervisor
  .addConditionalEdges("supervisor", supervisorRouter, [
    "hotelAgent",
    "flightAgent",
    "restaurantAgent",
    "attractionAgent",
    "draftAgent",
    "humanReview",
  ])
  
  // Parallel workers return to Supervisor
  .addEdge("hotelAgent", "supervisor")
  .addEdge("flightAgent", "supervisor")
  .addEdge("restaurantAgent", "supervisor")
  .addEdge("attractionAgent", "supervisor")
  
  // Draft routes to human review
  .addEdge("draftAgent", "humanReview")
  
  // Human review ends execution
  .addEdge("humanReview", END);

export const memorySaver = new MemorySaver();

// Export compiled graph with checkpointer
export const tripPlannerGraph = workflow.compile({ checkpointer: memorySaver });
