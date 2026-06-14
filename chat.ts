import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import fs from "fs/promises";

// Lazy Gemini Client Initialization Helper
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined on the server secrets.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return geminiClient;
}

const DYNAMIC_KNOWLEDGE_PATH = path.join(process.cwd(), "data", "learned_knowledge.json");

interface LearnedKnowledge {
  insights: string[];
  lastUpdated: string;
  totalQueriesProcessed: number;
}

// In-Memory fallback cache since Vercel Serverless containers are read-only
let memoryKnowledge: LearnedKnowledge | null = null;

async function loadLearnedKnowledge(): Promise<LearnedKnowledge> {
  if (memoryKnowledge) {
    return memoryKnowledge;
  }
  try {
    const data = await fs.readFile(DYNAMIC_KNOWLEDGE_PATH, "utf8");
    memoryKnowledge = JSON.parse(data);
    return memoryKnowledge!;
  } catch (err) {
    // Initial default knowledge base
    const initial: LearnedKnowledge = {
      insights: [
        "Customers frequently prioritize combined Amazon & Noon regional setups with SPC Sharjah remote business licenses.",
        "High-performance Shopify stores integrated with Middle Eastern secure checkout gateways yield significantly higher local conversions.",
        "Direct procurement coordination inside UAE wholesale spots provides competitive advantages for local e-commerce startups."
      ],
      lastUpdated: new Date().toISOString(),
      totalQueriesProcessed: 3
    };
    memoryKnowledge = initial;
    return initial;
  }
}

async function runSelfLearningTask(convoHistory: { role: string; content: string }[], currentKnowledge: LearnedKnowledge) {
  try {
    const client = getGeminiClient();
    
    // Extract recent user queries
    const userQueries = convoHistory.filter(m => m.role === "user" && m.content.trim().length > 3).map(m => m.content);
    if (userQueries.length === 0) return;

    const learningPrompt = `
You are the Cognitive Cortex of Nexloop's AI engine. Analyze the following user queries from our latest client conversation:
${JSON.stringify(userQueries, null, 2)}

Current learned insights database:
${JSON.stringify(currentKnowledge.insights, null, 2)}

Extract any NEW, unique, and highly valuable client interests, pain points, desired combinations, or localized e-commerce/business needs discussed that are not clearly represented in the current database.
Format your response as a JSON object containing a list called 'newInsights' of 1-2 new extremely concise, professional, high-value sentences (10-20 words each) representing the exact client pattern learned. If no new high-value pattern is present, return an empty list [].

Format your response strictly as JSON with this schema:
{
  "newInsights": ["string"]
}
`;

    const learningResp = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: learningPrompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.4
      }
    });

    const respText = learningResp.text || "{}";
    let digested: { newInsights: string[] };
    try {
      let cleaned = respText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      }
      digested = JSON.parse(cleaned);
    } catch {
      digested = { newInsights: [] };
    }

    if (digested && Array.isArray(digested.newInsights) && digested.newInsights.length > 0) {
      const updatedInsights = [
        ...digested.newInsights.map(s => s.trim()).filter(s => s.length > 5 && !s.includes("{")),
        ...currentKnowledge.insights
      ].slice(0, 10);

      const updatedKnowledge: LearnedKnowledge = {
        insights: updatedInsights,
        lastUpdated: new Date().toISOString(),
        totalQueriesProcessed: currentKnowledge.totalQueriesProcessed + userQueries.length
      };

      memoryKnowledge = updatedKnowledge;
      try {
        await fs.writeFile(DYNAMIC_KNOWLEDGE_PATH, JSON.stringify(updatedKnowledge, null, 2), "utf8");
      } catch (writeErr) {
        console.warn("Could not save updated info to ephemeral storage (expected in Vercel Serverless environment). Saving in RAM instead.");
      }
    } else {
      const updatedKnowledge: LearnedKnowledge = {
        ...currentKnowledge,
        lastUpdated: new Date().toISOString(),
        totalQueriesProcessed: currentKnowledge.totalQueriesProcessed + userQueries.length
      };
      memoryKnowledge = updatedKnowledge;
      try {
        await fs.writeFile(DYNAMIC_KNOWLEDGE_PATH, JSON.stringify(updatedKnowledge, null, 2), "utf8");
      } catch (writeErr) {
        // Safe catch for serverless systems
      }
    }
  } catch (error) {
    console.error("[In Serverless Function]: Self-Learning Task Error", error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: "Invalid request. 'messages' array is required."
      });
    }

    const client = getGeminiClient();

    // Load dynamic learned insights database to make our knowledge base stronger
    const currentKnowledge = await loadLearnedKnowledge();
    const insightsList = currentKnowledge.insights.map((ins, i) => `   - ${ins}`).join("\n");

    // Format current history into expected format for Gemini API
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || "" }]
    }));

    const userMsgsCount = messages.filter((m: any) => m.role === "user").length;

    let stateInstruction = "";
    if (userMsgsCount >= 2) {
      stateInstruction = `
- [STATE DIRECTIVE: RESOLUTION MODE]: 
  * The user has sent ${userMsgsCount} messages. We have enough context to initiate a custom solution. DO NOT ask any further diagnostic questions or prolong the conversation.
  * Direct them clearly to proceed with our human team by sharing our direct secure booking contacts:
    - WhatsApp / Call: **+971 52 813 1539**
    - Email: **business@nexlooplive.com**
  * Encourage them to fill out the form in the "Estimate Loop" section at the bottom of our web page to immediately compile their customized blueprint.
  * Set the 'options' array to exactly: ["✉️ Fill Estimate Form", "💬 Chat on WhatsApp", "🔄 Start New Conversation"]`;
    } else {
      stateInstruction = `
- [STATE DIRECTIVE: CONVERSATIONAL ANSWER AND DIRECT ROADMAP]:
  * Provide a clear, natural, and direct answer to the user's specific query in 1 to 2 concise sentences. 
  * DO NOT ask a question with every response. Only ask a diagnostic or helpful question if it is absolutely necessary to proceed with their request. If a question is not necessary, simply close your reply with a friendly assurance and leave the options array empty [].
  * If you ask a question, set the 'options' array to 2 to 4 very brief matching answer buttons for the user to select.
  * If you do not ask a question or if this is the first greeting, set the 'options' array to look like a clean empty array [].`;
    }

    const systemInstruction = `You are a warm, helpful, and highly professional human co-founder, partner, or commercial director representing Nexloop (an elite digital agency based in Business Center Sharjah, SPC Freezone, Sharjah, UAE).

Core Customer Interaction Principles:
1. DIALOGUE IN STYLE OF A REAL HUMAN PARTNER:
   - Speak with ease, hospitality, and pure excitement. Avoid robotic, rigid chatbot phrasing. Keep sentences short (1-3 sentences normally).
   - Do not sound pushy. Avoid repeating the same diagnostic questions or forcing questions on every response. Only ask a question if it is genuinely necessary to understand their project requirements.

2. DETECTING WELCOMING AND GREETING MESSAGES:
   - If the user sends a simple greeting or welcoming prompt (e.g. "hi", "hello", "سلام", "hey"):
     * Welcome them with great warmth and Middle-Eastern hospitality.
     * Introduce our core capabilities briefly (Custom Amazon & Noon support, premium Shopify/e-commerce hub, growth marketing, custom high-performance systems, remote UAE licensing, and local UAE product sourcing).
     * Do NOT ask any deep technical question immediately upon greeting, and do NOT provide any clickable option buttons on this welcome message. Set the 'options' array to exactly: []. Keep it completely clean.

3. SERVICE CAPABILITY BOUNDARIES:
   - AMAZON & NOON A-TO-Z SUPPORT (Middle East Focus): Full account setups, logistics & FBA shipping coordination, rich design/optimizations, PPC marketing, catalog audits, and brand registry.
   - REMOTE SERVICES (Worldwide): Custom Shopify web-dev, paid ad performance campaigns (Meta/Google/TikTok/Snapchat), custom fast systems, mobile apps, remote corporate registration in SPC Freezone (Entities, Visas, Bank Accounts setup remotely).
   - LOCAL SERVICES (UAE Only): Product sourcing, wholesale suppliers, and logistical audits are strictly provided LOCAL inside the UAE only.

4. LANGUAGE RULE:
   - Always respond, ask questions, and frame options in the EXACT language mapped to the user's query. If they ask in Arabic, your 'reply' and 'options' list must be fully in Arabic.

5. ACTIVE STATE CONTROL:
${stateInstruction}

6. SELF-LEARNED COGNITIVE INSIGHTS DATABASE:
   We analyze recent interactions & customer queries dynamically to make our knowledge base increasingly competitive. Keep these learned client dynamics in mind and let them inform your recommendations gracefully:
${insightsList}

OUTPUT FORMAT:
- You must comply with the target JSON schema containing 'reply' (string) and 'options' (array of strings).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "Your conversational, warm, and professional reply in the same language as the user's latest query."
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 2 to 4 extremely short, direct interactive button options (maximum 3-4 words each) representing answers, preferred selections, or pathways corresponding to the question you asked. If you welcomed them, offer our 5 core services."
            }
          },
          required: ["reply", "options"]
        }
      }
    });

    const replyText = response.text || "{}";
    let parsedResponse: { reply: string; options: string[] };
    try {
      let cleanedText = replyText.trim();
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      }
      parsedResponse = JSON.parse(cleanedText);
    } catch (err) {
      console.error("[JSON Parse Fallback in Lambda]", err, "Original Text:", replyText);
      const replyMatch = replyText.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/i);
      const extractedReply = replyMatch ? replyMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : "";
      
      parsedResponse = {
        reply: extractedReply || replyText.replace(/[\{\}]|"reply"\s*:|"options"\s*:|\[|\]/g, "").trim(),
        options: [
          "Amazon & Noon Support",
          "Shopify & E-commerce Hub",
          "Paid Brand Ads & Growth",
          "Remote UAE Corporate License",
          "Local UAE Product Sourcing"
        ]
      };
    }
    
    // Process learning in standard request flow
    if (messages.length >= 2) {
      await runSelfLearningTask(messages, currentKnowledge);
    }

    return res.status(200).json({
      success: true,
      reply: parsedResponse.reply || "How can I assist you with Nexloop's services today?",
      options: parsedResponse.options || []
    });

  } catch (error: any) {
    console.error("[Gemini Serverless Chat Error]", error);
    
    const errorStr = (error.message || "") + " " + JSON.stringify(error);
    const isQuotaError = errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota") || errorStr.includes("limit");
    
    let humanFriendlyError = "An unexpected connection gap occurred while communicating with our assistant. Please try sending your message again or proceed with our direct options below!";
    
    if (isQuotaError) {
      humanFriendlyError = "Our complimentary interactive assistant has temporarily touched its daily capacity limit. We'd love to build your blueprint or chat live right away!";
    }

    return res.status(200).json({
      success: true,
      reply: `⚠️ **Digital Partner Notice**\n\n${humanFriendlyError}\n\n**Direct Nexloop Touchpoints:**\n- 💬 WhatsApp: **+971 52 813 1539**\n- ✉️ Email: **business@nexlooplive.com**`,
      options: [
        "✉️ Fill Estimate Form",
        "💬 Chat on WhatsApp",
        "🔄 Start New Conversation"
      ]
    });
  }
}
