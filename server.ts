import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs/promises";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { VercelRequest, VercelResponse } from "@vercel/node";

// Initialize Supabase Client dynamically
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "https://your-supabase-project.supabase.co" &&
  supabaseUrl.trim().length > 0;

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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

const app = express();

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Endpoint: AI Chatbot conversation powered by Gemini-3.5-flash
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: "Invalid request. 'messages' array is required."
      });
    }

    const client = getGeminiClient();

    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || "" }]
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
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
              description: "An array of 2 to 4 extremely short, direct interactive button options."
            }
          },
          required: ["reply", "options"]
        }
      }
    });

    const replyText = response.text || "{}";
    let parsedResponse;

    try {
      let cleanedText = replyText.trim();
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      }
      parsedResponse = JSON.parse(cleanedText);
    } catch (err) {
      parsedResponse = {
        reply: "How can I assist you with Nexloop's services today?",
        options: []
      };
    }

    return res.json({
      success: true,
      reply: parsedResponse.reply || "How can I assist you with Nexloop's services today?",
      options: parsedResponse.options || []
    });

  } catch (error: any) {
    console.error("[Gemini AI Chat Error]", error);
    return res.json({
      success: true,
      reply: "An unexpected error occurred. Please try again.",
      options: ["Start New Conversation"]
    });
  }
});

// API Endpoint: Send Proposal through Website Server
app.post("/api/send-proposal", async (req, res) => {
  try {
    const { fullName, email, countryCode, phoneNumber, service, message } = req.body;

    if (!fullName || !email || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        error: "Required fields (fullName, email, phoneNumber) are missing." 
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Supabase database client is not configured on this server."
      });
    }

    const fullPhone = countryCode ? `${countryCode} ${phoneNumber}` : phoneNumber;

    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          name: fullName,
          email: email,
          phone: fullPhone,
          service_interest: service,
          message: message || null,
          status: "New"
        }
      ])
      .select();

    if (error) {
      console.error("[Supabase Leads Schema Insert Error]", error);
      return res.status(400).json({
        success: false,
        error: `Failed to insert lead into Supabase: ${error.message}`
      });
    }

    return res.json({
      success: true,
      message: "Proposal sent successfully"
    });

  } catch (routeError: any) {
    console.error("[POST /api/send-proposal Error]", routeError);
    return res.status(500).json({ 
      success: false, 
      error: "Internal server error while processing the proposal dispatch: " + routeError.message 
    });
  }
});

// Serve static files from dist folder
app.use(express.static(path.join(process.cwd(), "dist"), {
  maxAge: "1d",
  etag: false
}));

// SPA fallback - serve index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist", "index.html"));
});

export default app;
