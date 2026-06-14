import type { VercelRequest, VercelResponse } from "@vercel/node";
import path from "path";
import fs from "fs/promises";

const DYNAMIC_KNOWLEDGE_PATH = path.join(process.cwd(), "data", "learned_knowledge.json");

interface LearnedKnowledge {
  insights: string[];
  lastUpdated: string;
  totalQueriesProcessed: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    let knowledge: LearnedKnowledge;
    try {
      const data = await fs.readFile(DYNAMIC_KNOWLEDGE_PATH, "utf8");
      knowledge = JSON.parse(data);
    } catch {
      knowledge = {
        insights: [
          "Customers frequently prioritize combined Amazon & Noon regional setups with SPC Sharjah remote business licenses.",
          "High-performance Shopify stores integrated with Middle Eastern secure checkout gateways yield significantly higher local conversions.",
          "Direct procurement coordination inside UAE wholesale spots provides competitive advantages for local e-commerce startups."
        ],
        lastUpdated: new Date().toISOString(),
        totalQueriesProcessed: 3
      };
    }

    return res.status(200).json({
      success: true,
      insights: knowledge.insights || [],
      totalQueriesProcessed: knowledge.totalQueriesProcessed || 0,
      lastUpdated: knowledge.lastUpdated
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Unable to load learned database: " + err.message
    });
  }
}
