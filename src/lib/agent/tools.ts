import { TavilySearch } from "@langchain/tavily";

/**
 * Searches the web using Tavily Search API.
 * Returns formatted text of results or null if search fails / key is missing.
 */
export async function searchTavily(query: string, maxResults: number = 4): Promise<string | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("[Tavily] No TAVILY_API_KEY provided in environment, triggering fallback.");
    return null;
  }

  try {
    const tavily = new TavilySearch({
      tavilyApiKey: apiKey,
      maxResults,
    });

    const rawResponse = await tavily.invoke({ query });
    
    if (typeof rawResponse === "string") {
      return rawResponse;
    }

    if (Array.isArray(rawResponse)) {
      return rawResponse
        .map((item: any, idx: number) => {
          const title = item.title || `Result ${idx + 1}`;
          const content = item.content || item.snippet || "";
          const url = item.url ? ` (${item.url})` : "";
          return `[${idx + 1}] ${title}${url}\n${content}`;
        })
        .join("\n\n");
    }

    if (rawResponse && typeof rawResponse === "object") {
      if ("results" in rawResponse && Array.isArray((rawResponse as any).results)) {
        return (rawResponse as any).results
          .map((item: any, idx: number) => {
            const title = item.title || `Result ${idx + 1}`;
            const content = item.content || item.snippet || "";
            const url = item.url ? ` (${item.url})` : "";
            return `[${idx + 1}] ${title}${url}\n${content}`;
          })
          .join("\n\n");
      }
      return JSON.stringify(rawResponse, null, 2);
    }

    return String(rawResponse);
  } catch (error) {
    console.error("[Tavily] Search failed with error:", error);
    return null;
  }
}
