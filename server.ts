/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs/promises";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

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

const DYNAMIC_KNOWLEDGE_PATH = path.join(process.cwd(), "data", "learned_knowledge.json");

interface LearnedKnowledge {
  insights: string[];
  lastUpdated: string;
  totalQueriesProcessed: number;
}

// Ensure and load knowledge base
async function loadLearnedKnowledge(): Promise<LearnedKnowledge> {
  try {
    const dataDir = path.join(process.cwd(), "data");
    await fs.mkdir(dataDir, { recursive: true });
    
    try {
      const data = await fs.readFile(DYNAMIC_KNOWLEDGE_PATH, "utf8");
      return JSON.parse(data);
    } catch {
      // Create initial knowledge base if file does not exist
      const initial: LearnedKnowledge = {
        insights: [
          "Customers frequently prioritize combined Amazon & Noon regional setups with SPC Sharjah remote business licenses.",
          "High-performance Shopify stores integrated with Middle Eastern secure checkout gateways yield significantly higher local conversions.",
          "Direct procurement coordination inside UAE wholesale spots provides competitive advantages for local e-commerce startups."
        ],
        lastUpdated: new Date().toISOString(),
        totalQueriesProcessed: 3
      };
      await fs.writeFile(DYNAMIC_KNOWLEDGE_PATH, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
  } catch (err) {
    console.error("Error loading learned knowledge:", err);
    return {
      insights: [
        "Customers expect seamless Shopify integrations with local Middle-Eastern payment channels.",
        "SPC Sharjah licensing is popular due to ease of remote entity creation."
      ],
      lastUpdated: new Date().toISOString(),
      totalQueriesProcessed: 2
    };
  }
}

// Function to digest the convo history, extract insights and update our cache
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
      // Add new insights, keep max 10 to keep memory neat and highly relevant
      const updatedInsights = [
        ...digested.newInsights.map(s => s.trim()).filter(s => s.length > 5 && !s.includes("{")),
        ...currentKnowledge.insights
      ].slice(0, 10);

      const updatedKnowledge: LearnedKnowledge = {
        insights: updatedInsights,
        lastUpdated: new Date().toISOString(),
        totalQueriesProcessed: currentKnowledge.totalQueriesProcessed + userQueries.length
      };

      await fs.writeFile(DYNAMIC_KNOWLEDGE_PATH, JSON.stringify(updatedKnowledge, null, 2), "utf8");
      console.log("[Self-Learning Processed] Successfully updated cache with new parsed insights:", digested.newInsights);
    } else {
      const updatedKnowledge: LearnedKnowledge = {
        ...currentKnowledge,
        lastUpdated: new Date().toISOString(),
        totalQueriesProcessed: currentKnowledge.totalQueriesProcessed + userQueries.length
      };
      await fs.writeFile(DYNAMIC_KNOWLEDGE_PATH, JSON.stringify(updatedKnowledge, null, 2), "utf8");
    }
  } catch (error) {
    console.error("[Self-Learning Task Error]", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

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
- You must comply with the target JSON schema containing 'reply' (string), 'options' (array of strings), and optionally a 'lead' object if any contact data or service interest is mentioned in the history.`;

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
              },
              lead: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "Extract the client's name from conversation history if provided, otherwise empty string"
                  },
                  email: {
                    type: Type.STRING,
                    description: "Extract the client's email address if they provided it, otherwise empty string"
                  },
                  phone: {
                    type: Type.STRING,
                    description: "Extract the client's phone or WhatsApp number if they provided it, otherwise empty string"
                  },
                  service_interest: {
                    type: Type.STRING,
                    description: "Core service line they are interested in (e.g. Amazon & Noon Support, Shopify, Ads, Remote License, Local UAE sourcing) if identifiable based on messages, otherwise empty string"
                  }
                }
              }
            },
            required: ["reply", "options"]
          }
        }
      });

      const replyText = response.text || "{}";
      let parsedResponse: {
        reply: string;
        options: string[];
        lead?: {
          name?: string;
          email?: string;
          phone?: string;
          service_interest?: string;
        };
      };

      try {
        let cleanedText = replyText.trim();
        // Strip markdown backticks block if output by mistake or fallback
        if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        }
        parsedResponse = JSON.parse(cleanedText);
      } catch (err) {
        console.error("[Chat API JSON Parse Error]", err, "Original Text:", replyText);
        // Robust regex recovery to fetch "reply" from broken JSON format
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
      
      // Capture the latest user message
      const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content || "";

      // 1. Core database operations: insert into conversations
      if (supabase) {
        try {
          const { error: insertError } = await supabase.from("conversations").insert([{
            source: "Website Chat",
            sender: "User",
            message: lastUserMessage,
            ai_reply: parsedResponse.reply || ""
          }]);

          if (insertError) {
            console.error("Supabase insert failed", insertError);
          } else {
            console.log("Conversation saved successfully in server backend");
          }
        } catch (dbErr) {
          console.error("Supabase insert failed", dbErr);
        }

        // 2. Lead extraction fallback + creation/updates
        try {
          // Regex-based manual fallback helpers for robust captures
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
          const matchEmail = lastUserMessage.match(emailRegex);
          const manualEmail = matchEmail ? matchEmail[0] : "";

          const phoneRegex = /\+?[0-9]{8,15}/;
          const matchPhone = lastUserMessage.match(phoneRegex);
          const manualPhone = matchPhone ? matchPhone[0] : "";

          const extractedName = parsedResponse.lead?.name?.trim() || "";
          const extractedEmail = parsedResponse.lead?.email?.trim() || manualEmail;
          const extractedPhone = parsedResponse.lead?.phone?.trim() || manualPhone;
          const extractedInterest = parsedResponse.lead?.service_interest?.trim() || "";

          if (extractedName || extractedEmail || extractedPhone || extractedInterest) {
            let existingLead: any = null;

            if (extractedEmail) {
              const { data } = await supabase.from("leads").select("*").eq("email", extractedEmail).limit(1);
              if (data && data.length > 0) existingLead = data[0];
            }

            if (!existingLead && extractedPhone) {
              const { data } = await supabase.from("leads").select("*").eq("phone", extractedPhone).limit(1);
              if (data && data.length > 0) existingLead = data[0];
            }

            if (existingLead) {
              // Update empty/missing fields on existing lead
              const updateProps: any = {};
              if (extractedName && !existingLead.name) updateProps.name = extractedName;
              if (extractedEmail && !existingLead.email) updateProps.email = extractedEmail;
              if (extractedPhone && !existingLead.phone) updateProps.phone = extractedPhone;
              if (extractedInterest && !existingLead.service_interest) {
                updateProps.service_interest = extractedInterest;
              }

              if (Object.keys(updateProps).length > 0) {
                const { error: updateError } = await supabase
                  .from("leads")
                  .update(updateProps)
                  .eq("id", existingLead.id);
                if (updateError) {
                  console.error("[Supabase Leads Update Error]", updateError);
                }
              }
            } else {
              // Create a brand new lead securely
              const { error: leadInsertError } = await supabase.from("leads").insert([{
                name: extractedName || null,
                email: extractedEmail || null,
                phone: extractedPhone || null,
                service_interest: extractedInterest || null
              }]);
              if (leadInsertError) {
                console.error("[Supabase Leads Insert Error]", leadInsertError);
              }
            }
          }
        } catch (leadErr) {
          console.error("[Supabase Leads Lead Process Exception]", leadErr);
        }
      }

      // Kick off background self-learning cognitive digest task to process lessons learned
      if (messages.length >= 2) {
        setTimeout(() => {
          runSelfLearningTask(messages, currentKnowledge).catch(err => {
            console.error("Background cognitive learning error:", err);
          });
        }, 300);
      }

      return res.json({
        success: true,
        reply: parsedResponse.reply || "How can I assist you with Nexloop's services today?",
        options: parsedResponse.options || []
      });

    } catch (error: any) {
      console.error("[Gemini AI Chat Error]", error);
      
      const errorStr = (error.message || "") + " " + JSON.stringify(error);
      const isQuotaError = errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota") || errorStr.includes("limit");
      const isApiKeyMissing = errorStr.includes("API key") || errorStr.includes("API_KEY") || errorStr.includes("key is missing") || errorStr.includes("unauthorized");
      
      let humanFriendlyError = "An unexpected connection gap occurred while communicating with our assistant. Please try sending your message again or proceed with our direct options below!";
      
      if (isQuotaError) {
        humanFriendlyError = "Our complimentary interactive assistant has temporarily touched its daily capacity limit. We'd love to build your blueprint or chat live right away!";
      } else if (isApiKeyMissing) {
        humanFriendlyError = "The digital assistant is preparing its connection keys. Please check our configuration or connect directly!";
      }

      return res.json({
        success: true,
        reply: `⚠️ **Digital Partner Notice**\n\n${humanFriendlyError}\n\n**Direct Nexloop Touchpoints:**\n- 💬 WhatsApp: **+971 52 813 1539**\n- ✉️ Email: **business@nexlooplive.com**`,
        options: [
          "✉️ Fill Estimate Form",
          "💬 Chat on WhatsApp",
          "🔄 Start New Conversation"
        ]
      });
    }
  });

  // API Endpoint: Get current self-learned insights cache
  app.get("/api/learned-knowledge", async (req, res) => {
    try {
      const knowledge = await loadLearnedKnowledge();
      return res.json({
        success: true,
        insights: knowledge.insights || [],
        totalQueriesProcessed: knowledge.totalQueriesProcessed || 0,
        lastUpdated: knowledge.lastUpdated
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: "Unabled to load learned database: " + err.message
      });
    }
  });

  // API Endpoint: Send Proposal through Website Server
  app.post("/api/send-proposal", async (req, res) => {
    try {
      const { fullName, email, countryCode, phoneNumber, service, message, proposalData } = req.body;

      if (!fullName || !email || !phoneNumber) {
        return res.status(400).json({ 
          success: false, 
          error: "Required fields (fullName, email, phoneNumber) are missing." 
        });
      }

      // 1. Log the proposal data to local disk to prevent any data loss
      const dataDir = path.join(process.cwd(), "data");
      await fs.mkdir(dataDir, { recursive: true });
      const proposalsFilePath = path.join(dataDir, "proposals.json");

      let existingProposals = [];
      try {
        const fileContent = await fs.readFile(proposalsFilePath, "utf8");
        existingProposals = JSON.parse(fileContent);
      } catch (err) {
        // File doesn't exist yet, start with empty array
      }

      const newProposalLog = {
        id: proposalData?.id || `NL-OFFLINE-${Date.now()}`,
        timestamp: new Date().toISOString(),
        clientDetails: {
          fullName,
          email,
          countryCode,
          phoneNumber,
          service,
          message
        },
        proposalSpecs: proposalData || null
      };

      existingProposals.push(newProposalLog);
      await fs.writeFile(proposalsFilePath, JSON.stringify(existingProposals, null, 2), "utf8");

      // 2. Format the email details
      const emailSubject = `[Nexloop Project Loop]: ${service} - ${fullName}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #fafafa; color: #1f2937;">
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #6366f1; padding-bottom: 15px;">
            <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">Nexloop Project Discovery</h2>
            <p style="color: #6b7280; font-weight: bold; margin-top: 5px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">New Website Submission</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #111827; border-left: 4px solid #6366f1; padding-left: 10px; font-size: 16px; margin-bottom: 15px;">Client Profile Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #4b5563; font-weight: bold; width: 35%;">Client Name:</td>
                <td style="padding: 8px 0; color: #111827;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #4b5563; font-weight: bold;">Client Email:</td>
                <td style="padding: 8px 0; color: #111827;"><a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #4b5563; font-weight: bold;">Phone Number:</td>
                <td style="padding: 8px 0; color: #111827; font-family: monospace;">${countryCode} ${phoneNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #4b5563; font-weight: bold;">Service Demanded:</td>
                <td style="padding: 8px 0; color: #111827;"><strong style="font-size: 14px; color: #4f46e5;">${service}</strong></td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 25px; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h4 style="color: #111827; margin: 0 0 8px 0; font-size: 14px;">Additional Brief / Message:</h4>
            <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${message || "No additional brief added."}</p>
          </div>

          ${proposalData ? `
          <div style="margin-bottom: 25px; background-color: #f5f3ff; border: 1px dashed #c084fc; padding: 20px; border-radius: 12px;">
            <h3 style="color: #7c3aed; margin: 0 0 12px 0; font-size: 15px; font-weight: bold; border-bottom: 1px solid #ddd6fe; padding-bottom: 8px;">Synthesized Loop Blueprint Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-weight: bold; width: 40%;">Proposal ID:</td>
                <td style="padding: 6px 0; color: #111827; font-family: monospace; font-weight: bold;">${proposalData.id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-weight: bold;">Estimated Delivery:</td>
                <td style="padding: 6px 0; color: #111827;">${proposalData.timeline}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-weight: bold;">Cost Allocation (USD):</td>
                <td style="padding: 6px 0; color: #047857; font-weight: bold; font-family: monospace;">${proposalData.estCostUsd}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-weight: bold;">Cost Allocation (AED):</td>
                <td style="padding: 6px 0; color: #047857; font-weight: bold; font-family: monospace;">${proposalData.estCostAed}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-weight: bold;">Infrastructure Type:</td>
                <td style="padding: 6px 0; color: #111827;">${proposalData.architectureType}</td>
              </tr>
            </table>

            <h5 style="color: #6d28d9; margin: 15px 0 8px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Custom Phases Roadmap</h5>
            <ol style="margin: 0; padding-left: 20px; color: #4c1d95; font-size: 13px; line-height: 1.5;">
              ${proposalData.phases.map((phase: string) => `<li style="margin-bottom: 5px;">${phase}</li>`).join("")}
            </ol>
          </div>
          ` : ""}

          <div style="font-size: 11px; text-align: center; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
            This dispatch was securely triggered in real time by the Nexloop website client automation workflow.
          </div>
        </div>
      `;

      // 3. Send email via SMTP if credentials exist
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || `"Nexloop Bot" <automation@nexlooplive.com>`;
      const notificationEmail = process.env.NOTIFICATION_EMAIL || "business@nexlooplive.com";

      let emailSent = false;
      let configWarning = "";

      const isPlaceholder = !smtpPass || 
                            smtpPass === "re_yourPrivateAPIKeyHere" || 
                            smtpPass.trim() === "" || 
                            smtpPass.includes("yourPrivateAPIKeyHere") ||
                            smtpPass.includes("placeholder");

      if (smtpHost && smtpUser && smtpPass && !isPlaceholder) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          await transporter.sendMail({
            from: smtpFrom,
            to: notificationEmail,
            subject: emailSubject,
            html: emailHtml,
            replyTo: email, // Set client as replyTo so the administrator can answer instantly!
          });

          emailSent = true;
          console.log(`[Email Dispatch] Successfully sent proposal ${proposalData?.id || 'N/A'} for ${fullName}`);
        } catch (mailError: any) {
          console.error("[Email Dispatch Error]", mailError);
          configWarning = `SMTP settings loaded, but sending failed: ${mailError.message}`;
        }
      } else {
        configWarning = "SMTP is not fully configured (using default placeholder values). Submission was fallback logged securely to file persistence archive.";
        console.warn(`[Email Dispatch Warning] ${configWarning}`);
        console.log(`[Form Submission Logged]`, newProposalLog);
      }

      return res.json({
        success: true,
        loggedLocally: true,
        emailSent,
        warning: configWarning || undefined,
        proposalId: proposalData?.id
      });

    } catch (routeError: any) {
      console.error("[POST /api/send-proposal Error]", routeError);
      return res.status(500).json({ 
        success: false, 
        error: "Internal server error while processing the proposal dispatch: " + routeError.message 
      });
    }
  });

  // API Endpoint: Dynamic Express Router for CRM Admin Panel
  app.all("/api/admin/:action?", async (req, res) => {
    try {
      const adminHandler = (await import("./api/admin.js")).default;
      const vercelReq = req as any;
      const vercelRes = res as any;
      if (!vercelReq.query) vercelReq.query = {};
      if (req.params.action) {
        vercelReq.query.action = req.params.action;
      }
      return adminHandler(vercelReq, vercelRes);
    } catch (err: any) {
      console.error("[Express Admin Gateway Error]", err);
      return res.status(500).json({ success: false, error: "Admin API gateway error: " + err.message });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
