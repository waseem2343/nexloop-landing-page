import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
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

// Helper to send message via Meta WhatsApp Cloud API
async function sendWhatsAppMessage(to: string, text: string, customToken?: string, customPhoneId?: string) {
  const token = customToken || process.env.WHATSAPP_TOKEN;
  const phoneId = customPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn("[WhatsApp Manual Send] WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID is missing.");
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
    console.log("[WhatsApp Manual Send] Sent message result:", resJson);
    return response.ok;
  } catch (err) {
    console.error("[WhatsApp Manual Send] Error sending message via API:", err);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  if (!supabase) {
    return res.status(500).json({ success: false, error: "Database not configured." });
  }

  try {
    const { phone_number, message, contact_name, lead_id, custom_token, custom_phone_id } = req.body;

    if (!phone_number || !message) {
      return res.status(400).json({ success: false, error: "Missing required fields (phone_number, message)." });
    }

    // Call Meta API to send WhatsApp message
    const apiSuccess = await sendWhatsAppMessage(phone_number, message, custom_token, custom_phone_id);

    if (!apiSuccess) {
      return res.status(500).json({
        success: false,
        error: "Failed to dispatch message. Verify Meta API configurations and phone_number format."
      });
    }

    // Query current takeover status to carry it forward in metadata
    const { data: latestMsg } = await supabase
      .from("whatsapp_conversations")
      .select("metadata, contact_name, lead_id")
      .eq("phone_number", phone_number)
      .order("created_at", { ascending: false })
      .limit(1);

    const isAiDisabled = latestMsg && latestMsg[0]?.metadata?.ai_disabled === true;

    // Log administrative/manual reply in Conversations Database
    const { data: insertedMsg, error: insertErr } = await supabase
      .from("whatsapp_conversations")
      .insert([
        {
          phone_number,
          contact_name: contact_name || latestMsg?.[0]?.contact_name || "WhatsApp User",
          message_type: "text",
          sender: "ai", // recorded as outbound to keep UI alignment beautiful
          message: message,
          conversation_id: phone_number,
          lead_id: lead_id || latestMsg?.[0]?.lead_id || null,
          metadata: {
            ai_disabled: isAiDisabled,
            manual_representative_reply: true,
            dispatched: true
          }
        }
      ])
      .select();

    if (insertErr) {
      console.error("[WhatsApp Manual Send] Save manual reply log error:", insertErr);
    }

    return res.status(200).json({
      success: true,
      sent_message: message,
      saved_log: insertedMsg?.[0] || null
    });

  } catch (err: any) {
    console.error("[WhatsApp Manual Send Webhook Exception]:", err);
    return res.status(500).json({ success: false, error: err.message || "Internal server manual send exception." });
  }
}
