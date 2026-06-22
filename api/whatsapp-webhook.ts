import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// Lazy Gemini Client Initialization
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not defined.");
    return null;
  }
  if (!geminiClient) {
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

// Initialize Supabase Client
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

// Helper to send a message via Meta WhatsApp Cloud API
async function sendWhatsAppMessage(to: string, text: string, customToken?: string, customPhoneId?: string) {
  const token = customToken || process.env.WHATSAPP_TOKEN;
  const phoneId = customPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn("[WhatsApp Webhook] WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID is missing.");
    return false;
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: text,
        },
      }),
    });

    const resJson = await response.json();
    console.log("[WhatsApp Webhook] Sent message result:", resJson);
    return response.ok;
  } catch (err) {
    console.error("[WhatsApp Webhook] Error sending message via API:", err);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Webhook Verification (GET)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const localVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "nexloop_verify_token";

    if (mode === "subscribe" && token === localVerifyToken) {
      console.log("[WhatsApp Webhook] Webhook verified successfully.");
      return res.status(200).send(challenge);
    } else {
      console.warn("[WhatsApp Webhook] Webhook verification failed. Token mismatch.");
      return res.status(403).json({ error: "Verification failed. Token mismatch." });
    }
  }

  // 2. Receiving Webhook Payload (POST)
  if (req.method === "POST") {
    try {
      const body = req.body;
      const custom_token = body?.custom_token || undefined;
      const custom_phone_id = body?.custom_phone_id || undefined;
      console.log("[WhatsApp Webhook] Received webhook payload:", JSON.stringify(body, null, 2));

      // Check if it's a message event
      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const messageObj = value?.messages?.[0];

      if (!messageObj) {
        // Meta sends statuses like sent, delivered, read through webhooks as well. Just acknowledge them.
        return res.status(200).json({ success: true, status: "Ignored status/non-message webhook." });
      }

      const phone_number = messageObj.from || "";
      const contact_name = value?.contacts?.[0]?.profile?.name || "WhatsApp User";
      const message_type = messageObj.type || "text";
      
      let incomingMessage = "";
      if (message_type === "text") {
        incomingMessage = messageObj?.text?.body || "";
      } else if (messageObj?.interactive) {
        // Handle list select or quick replies from WhatsApp
        const interactiveType = messageObj.interactive.type;
        if (interactiveType === "button_reply") {
          incomingMessage = messageObj.interactive.button_reply?.title || "";
        } else if (interactiveType === "list_reply") {
          incomingMessage = messageObj.interactive.list_reply?.title || messageObj.interactive.list_reply?.description || "";
        }
      } else {
        incomingMessage = `[Received media type: ${message_type}]`;
      }

      if (!phone_number) {
        return res.status(400).json({ success: false, error: "Missing sender phone number." });
      }

      if (!supabase) {
        return res.status(500).json({ success: false, error: "Database not configured." });
      }

      // Check if Human Takeover (AI auto-reply disabled) is active for this phone number
      const { data: latestMsg } = await supabase
        .from("whatsapp_conversations")
        .select("metadata")
        .eq("phone_number", phone_number)
        .order("created_at", { ascending: false })
        .limit(1);

      const isAiDisabled = latestMsg && latestMsg[0]?.metadata?.ai_disabled === true;

      // Check if lead already exists in Leads table
      let { data: existingLeads } = await supabase
        .from("leads")
        .select("*")
        .eq("phone", phone_number)
        .limit(1);

      let currentLead = existingLeads?.[0] || null;

      if (!currentLead) {
        // Auto create lead if it's a new user
        const { data: insertedLead, error: insertError } = await supabase
          .from("leads")
          .insert([
            {
              name: contact_name,
              phone: phone_number,
              status: "New",
              service_interest: "WhatsApp Lead"
            }
          ])
          .select();
        
        if (!insertError && insertedLead && insertedLead.length > 0) {
          currentLead = insertedLead[0];
          console.log("[WhatsApp Webhook] Created new lead for", contact_name);
        } else {
          console.error("[WhatsApp Webhook] Failed to auto-create lead:", insertError);
        }
      } else {
        // Link and update lead activity
        await supabase
          .from("leads")
          .update({
            status: currentLead.status || "New"
          })
          .eq("id", currentLead.id);
        console.log("[WhatsApp Webhook] Linked existing lead ID:", currentLead.id);
      }

      const lead_id = currentLead?.id || null;

      // Format metadata
      const promptMetadata = {
        ai_disabled: isAiDisabled,
        message_id: messageObj.id,
        whatsapp_sender_name: contact_name
      };

      // Create new customer message log entry
      const { data: savedCustomerMsg, error: saveErr } = await supabase
        .from("whatsapp_conversations")
        .insert([
          {
            phone_number,
            contact_name,
            message_type,
            sender: "customer",
            message: incomingMessage,
            conversation_id: phone_number,
            lead_id,
            metadata: promptMetadata
          }
        ])
        .select();

      if (saveErr) {
        console.error("[WhatsApp Webhook] Error saving customer message:", saveErr);
      }

      // If Human Takeover is active, do not send an AI response!
      if (isAiDisabled) {
        console.log("[WhatsApp Webhook] AI is disabled/human takeover enabled. Acknowledging webhook without responding.");
        return res.status(200).json({
          success: true,
          ai_response_muted: true,
          reason: "Human takeover is active."
        });
      }

      // 3. AI Autopilot response process using Gemini
      const client = getGeminiClient();
      if (!client) {
        // No Gemini key configured, cannot auto respond
        console.warn("[WhatsApp Webhook] Gemini client not configured, auto respond skipped.");
        return res.status(200).json({ success: true, ai_response_skipped: "No Gemini Key Configured" });
      }

      // Fetch dynamic verification corporate records from knowledge_base
      let kbTextSection = "";
      try {
        const { data: dbArticles } = await supabase
          .from("knowledge_base")
          .select("title, category, keywords, content")
          .eq("status", "Published");
          
        if (dbArticles && dbArticles.length > 0) {
          kbTextSection = dbArticles.map((art: any, index: number) => {
            return `INFO ARTICLE ${index + 1}:
Category: ${art.category || "General"}
Title: ${art.title}
Keyphrase Terms: ${art.keywords || ""}
Verified Knowledge: ${art.content || ""}`;
          }).join("\n\n");
        }
      } catch (err: any) {
        console.warn("[WhatsApp Webhook] Knowledge Base loading error:", err.message);
      }

      // Fetch the last 10 messages of this conversation history to build elegant contextual memories
      let historyContext = "";
      try {
        const { data: dbHistory } = await supabase
          .from("whatsapp_conversations")
          .select("sender, message")
          .eq("phone_number", phone_number)
          .order("created_at", { ascending: false })
          .limit(10);

        if (dbHistory && dbHistory.length > 0) {
          // reverse history list to be chronological
          historyContext = dbHistory.reverse().map((h) => 
            `${h.sender === "customer" ? "Customer" : "Nexloop Sales AI"}: ${h.message}`
          ).join("\n");
        }
      } catch (err: any) {
        console.warn("[WhatsApp Webhook] History query exception:", err);
      }

      const systemInstruction = `You are a warm, e-commerce-savvy, and professional Sales Consultant representing Nexloop (based in Business Center Sharjah, SPC Freezone, Sharjah, UAE).
You are interacting on WhatsApp directly.

Responsibilities as Representative:
- Greet with hospitality, charm, and excitement. Speak easily like a human business partner. Keep sentences short, easily readable on mobile screens (1-3 sentences normally). Do not sound wordy or overly structured.
- Answer inquiries using our VERIFIED CORPORATE KNOWLEDGE BASE details below. Match terms accurately.
- Ask friendly questions to qualify the customer's project. Learn their requirements, Name, Company, Budget, Service interest, Country, and Timeline.
- Detect which service line they demand:
  * Amazon & Noon A-to-Z Management Support
  * Shopify dev / e-commerce hubs
  * Growth Performance Ad Campaigns
  * Customized rapid web & mobile apps
  * Remote Business setups (Sharjah SPC Freezone Licensing, Visas, Enterprise Accounts setup remotely)
  * Local UAE product wholesale sourcing (UAE-local only).

VERIFIED CORPORATE KNOWLEDGE BASE:
${kbTextSection || "Nexloop specializes in full-stack Amazon and Noon e-commerce enablement, high-speed custom web design, and Sharjah SPC Freezone incorporation services."}

CONVERSATION HISTORY OF THIS CHAT THREAD:
${historyContext || `Customer: ${incomingMessage}`}

Your core directive is to produce an elegant conversational answer ('reply'), list 2-3 matching interactive options ('options') for instant answers, and extract lead information ('lead') if they share any details.
If any qualifying variables are detected, write them carefully in the lead parameter of the JSON response schema.

Map languages: If the customer writes in a specific language (Arabic, English, Urdu, etc.), formulate your 'reply' and 'options' strictly in that SAME language.`;

      const aiResponse = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: `Customer says: ${incomingMessage}` }] }],
        config: {
          systemInstruction,
          temperature: 0.6,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "The professional, warm message response text to send onto WhatsApp (mobile-optimized text. Feel free to use professional emojis)."
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 2-3 short suggestions or quick queries matching what the user could select next."
              },
              lead: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Contact name if mentioned" },
                  company: { type: Type.STRING, description: "Company brand or name if mentioned" },
                  budget: { type: Type.STRING, description: "The budget scale or amount mentioned" },
                  service_required: { type: Type.STRING, description: "Determined core service line keyword matching the user interest" },
                  country: { type: Type.STRING, description: "Selected country region of the business" },
                  timeline: { type: Type.STRING, description: "Proposed launch timeline" }
                }
              }
            },
            required: ["reply"]
          }
        }
      });

      const parsedJson = JSON.parse(aiResponse.text || "{}");
      const replyBody = parsedJson.reply || "Thanks for contacting Nexloop Digital. A corporate manager will reach out shortly!";
      const extractedLeadData = parsedJson.lead || {};

      // 4. Lead Qualification Sync
      if (extractedLeadData && Object.keys(extractedLeadData).length > 0 && currentLead) {
        const updateParams: any = {};
        if (extractedLeadData.name && (!currentLead.name || currentLead.name === "WhatsApp User")) {
          updateParams.name = extractedLeadData.name;
        }
        if (extractedLeadData.service_required && !currentLead.service_interest) {
          updateParams.service_interest = extractedLeadData.service_required;
        }
        
        let messageAppended = currentLead.message || "";
        const detailsToAppend: string[] = [];
        if (extractedLeadData.company) detailsToAppend.push(`Company: ${extractedLeadData.company}`);
        if (extractedLeadData.budget) detailsToAppend.push(`Budget: ${extractedLeadData.budget}`);
        if (extractedLeadData.country) detailsToAppend.push(`Country: ${extractedLeadData.country}`);
        if (extractedLeadData.timeline) detailsToAppend.push(`Timeline: ${extractedLeadData.timeline}`);

        if (detailsToAppend.length > 0) {
          const detailStr = `[WhatsApp Qualified traits: ${detailsToAppend.join(" | ")}]`;
          if (!messageAppended.includes(detailStr)) {
            updateParams.message = messageAppended ? `${messageAppended}\n${detailStr}` : detailStr;
          }
        }

        if (Object.keys(updateParams).length > 0) {
          await supabase
            .from("leads")
            .update(updateParams)
            .eq("id", currentLead.id);
          console.log("[WhatsApp Webhook] Qualified and updated lead details:", updateParams);
        }
      }

      // 5. Send message reply back via WhatsApp Business API
      let optionsPrompt = "";
      if (parsedJson.options && Array.isArray(parsedJson.options) && parsedJson.options.length > 0) {
        optionsPrompt = `\n\n💡 *Suggested replies:*\n` + parsedJson.options.map((opt: string) => `👉 ${opt}`).join("\n");
      }
      const fullReplyText = replyBody + optionsPrompt;

      const apiSent = await sendWhatsAppMessage(phone_number, fullReplyText, custom_token, custom_phone_id);

      // 6. Save AI reply to WhatsApp Conversations database
      await supabase
        .from("whatsapp_conversations")
        .insert([
          {
            phone_number,
            contact_name,
            message_type: "text",
            sender: "ai",
            message: fullReplyText,
            conversation_id: phone_number,
            lead_id,
            metadata: {
              ai_disabled: isAiDisabled,
              whatsapp_delivery_attempted: apiSent,
              qualifications: extractedLeadData
            }
          }
        ]);

      return res.status(200).json({
        success: true,
        messageReceived: incomingMessage,
        aiReplied: fullReplyText,
        contact_name,
        phone_number
      });

    } catch (err: any) {
      console.error("[WhatsApp Webhook] Serious Handler Exception:", err);
      return res.status(500).json({ success: false, error: err.message || "Internal server webhook crash." });
    }
  }

  return res.status(405).json({ success: false, error: "Method Not Allowed" });
}
