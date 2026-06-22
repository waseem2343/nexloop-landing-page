import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { pathname } = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
  const action = req.query.action || pathname.split("/").pop();

  try {
    switch (action) {
      case "test-connection": {
        if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

        const urlExists = !!supabaseUrl;
        const keyExists = !!supabaseAnonKey;
        const isNotPlaceholder = supabaseUrl !== "https://your-supabase-project.supabase.co" && urlExists;
        
        let maskedUrl = "Not Configured";
        if (supabaseUrl) {
          try {
            const parsed = new URL(supabaseUrl);
            maskedUrl = `${parsed.protocol}//${parsed.hostname.substring(0, 4)}...${parsed.hostname.slice(-12)}`;
          } catch {
            maskedUrl = "Invalid URL Format";
          }
        }

        let overallStatus = "Not Configured";
        let overallError: string | null = null;
        const tableTests: Record<string, { ok: boolean; count: number | null; error: string | null }> = {
          leads: { ok: false, count: null, error: null },
          conversations: { ok: false, count: null, error: null },
          knowledge_base: { ok: false, count: null, error: null },
          ai_settings: { ok: false, count: null, error: null }
        };

        if (supabase) {
          try {
            overallStatus = "Configured & Hitting API...";
            
            // Test 1: leads
            try {
              const { count, error } = await supabase.from("leads").select("*", { count: "exact", head: true });
              if (error) {
                tableTests.leads.error = error.message || JSON.stringify(error);
              } else {
                tableTests.leads.ok = true;
                tableTests.leads.count = count;
              }
            } catch (e: any) {
              tableTests.leads.error = e.message || String(e);
            }

            // Test 2: conversations
            try {
              const { count, error } = await supabase.from("conversations").select("*", { count: "exact", head: true });
              if (error) {
                tableTests.conversations.error = error.message || JSON.stringify(error);
              } else {
                tableTests.conversations.ok = true;
                tableTests.conversations.count = count;
              }
            } catch (e: any) {
              tableTests.conversations.error = e.message || String(e);
            }

            // Test 3: knowledge_base
            try {
              const { count, error } = await supabase.from("knowledge_base").select("*", { count: "exact", head: true });
              if (error) {
                tableTests.knowledge_base.error = error.message || JSON.stringify(error);
              } else {
                tableTests.knowledge_base.ok = true;
                tableTests.knowledge_base.count = count;
              }
            } catch (e: any) {
              tableTests.knowledge_base.error = e.message || String(e);
            }

            // Test 4: ai_settings
            try {
              const { count, error } = await supabase.from("ai_settings").select("*", { count: "exact", head: true });
              if (error) {
                tableTests.ai_settings.error = error.message || JSON.stringify(error);
              } else {
                tableTests.ai_settings.ok = true;
                tableTests.ai_settings.count = count;
              }
            } catch (e: any) {
              tableTests.ai_settings.error = e.message || String(e);
            }

            const anySuccess = Object.values(tableTests).some(val => val.ok);
            const allErrors = Object.values(tableTests).map(val => val.error).filter(Boolean);
            
            if (anySuccess) {
              overallStatus = "Working";
            } else if (allErrors.length > 0) {
              overallStatus = "API Configured but Tables Missing or Authentication Failed";
              overallError = allErrors[0];
            } else {
              overallStatus = "Configured but Unresponsive";
            }
          } catch (err: any) {
            overallStatus = "Initialization / Connection Failed";
            overallError = err.message || String(err);
          }
        } else {
          overallStatus = "Supabase Env Variables Missing";
          overallError = "Please add SUPABASE_URL and SUPABASE_ANON_KEY to your env variables.";
        }

        return res.status(200).json({
          success: true,
          supabaseConfigured: isSupabaseConfigured,
          envState: {
            urlExists,
            keyExists,
            isNotPlaceholder,
            maskedUrl,
          },
          whatsAppState: {
            tokenExists: !!process.env.WHATSAPP_TOKEN,
            phoneIdExists: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
            verifyTokenExists: !!process.env.WHATSAPP_VERIFY_TOKEN,
            tokenLength: process.env.WHATSAPP_TOKEN?.length || 0,
            maskedPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID 
              ? (process.env.WHATSAPP_PHONE_NUMBER_ID.length > 8 
                  ? `${process.env.WHATSAPP_PHONE_NUMBER_ID.slice(0, 4)}...${process.env.WHATSAPP_PHONE_NUMBER_ID.slice(-4)}`
                  : "***")
              : "Missing",
            maskedVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN
              ? (process.env.WHATSAPP_VERIFY_TOKEN.length > 4
                  ? `${process.env.WHATSAPP_VERIFY_TOKEN.slice(0, 2)}...${process.env.WHATSAPP_VERIFY_TOKEN.slice(-2)}`
                  : "***")
              : "Missing"
          },
          connectionTest: {
            status: overallStatus,
            error: overallError,
            tables: tableTests
          }
        });
      }

      case "dashboard": {
        if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

        if (!supabase) {
          return res.status(400).json({ success: false, error: "Supabase not configured" });
        }

        try {
          // Get counts from actual tables
          const { count: countLeads, error: errorLeads } = await supabase.from("leads").select("*", { count: "exact", head: true });
          if (errorLeads) throw errorLeads;

          const { count: countConvs, error: errorConvs } = await supabase.from("conversations").select("*", { count: "exact", head: true });
          if (errorConvs) throw errorConvs;

          const { count: countKnowledge, error: errorKnowledge } = await supabase.from("knowledge_base").select("*", { count: "exact", head: true });
          if (errorKnowledge) throw errorKnowledge;

          // Fetch recent activity
          const { data: dbLeads, error: errLeads } = await supabase
            .from("leads")
            .select("name, service_interest, created_at")
            .order("created_at", { ascending: false })
            .limit(5);
          if (errLeads) throw errLeads;

          const { data: dbConvs, error: errConvs } = await supabase
            .from("conversations")
            .select("message, created_at")
            .order("created_at", { ascending: false })
            .limit(5);
          if (errConvs) throw errConvs;

          const recentActivityData = [
            ...(dbLeads || []).map(l => ({
              type: "lead",
              message: `New lead captured: ${l.name} (${l.service_interest || "General Inquiry"})`,
              date: l.created_at
            })),
            ...(dbConvs || []).map(c => ({
              type: "chat",
              message: `Chat query: "${c.message ? c.message.substring(0, 45) : ""}${c.message && c.message.length > 45 ? "..." : ""}"`,
              date: c.created_at
            }))
          ];

          recentActivityData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          return res.status(200).json({
            success: true,
            stats: {
              totalLeads: countLeads || 0,
              totalConversations: countConvs || 0,
              totalKnowledge: countKnowledge || 0,
              aiStatus: "Fully Operational",
              supabaseConnected: true,
              databaseHealthy: true
            },
            recentActivity: recentActivityData.slice(0, 6)
          });
        } catch (err: any) {
          console.error("[Dashboard API Server Error]", err);
          return res.status(500).json({ success: false, error: err.message || JSON.stringify(err) });
        }
      }

      case "leads": {
        if (!supabase) {
          return res.status(400).json({ success: false, error: "Supabase not configured" });
        }

        if (req.method === "GET") {
          try {
            const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
            if (error) {
              console.error("[Leads API GET] Supabase selected error:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            return res.status(200).json({ success: true, data: data || [] });
          } catch (err: any) {
            console.error("[Leads API GET] DB failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }

        if (req.method === "POST") {
          const newLead = req.body;
          console.log("[Leads API POST] Creating entry:", req.body);
          try {
            const { data, error } = await supabase.from("leads").insert([newLead]).select();
            if (error) {
              console.error("[Leads API POST] Supabase failed insert:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            return res.status(201).json({ success: true, data: data[0] });
          } catch (err: any) {
            console.error("[Leads API POST] Database failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }

        if (req.method === "PUT") {
          const { id, ...updatedParts } = req.body;
          console.log("[Leads API PUT] Updating entry ID:", id);
          try {
            const parsedId = /^\d+$/.test(String(id)) ? parseInt(String(id), 10) : id;
            const { data, error } = await supabase.from("leads").update(updatedParts).eq("id", parsedId).select();
            if (error) {
              console.error("[Leads API PUT] Supabase failed update:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            if (!data || data.length === 0) {
              return res.status(404).json({ success: false, error: "Lead search target not found or unchanged" });
            }
            return res.status(200).json({ success: true, data: data[0] });
          } catch (err: any) {
            console.error("[Leads API PUT] Database failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }

        if (req.method === "DELETE") {
          const id = req.query.id as string;
          console.log("[Leads API DELETE] Removing entry ID:", id);
          try {
            const parsedId = /^\d+$/.test(id) ? parseInt(id, 10) : id;
            const { error } = await supabase.from("leads").delete().eq("id", parsedId);
            if (error) {
              console.error("[Leads API DELETE] Supabase remove failed:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            return res.status(200).json({ success: true, id });
          } catch (err: any) {
            console.error("[Leads API DELETE] Database failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }
        break;
      }

      case "conversations": {
        if (!supabase) {
          return res.status(400).json({ success: false, error: "Supabase not configured" });
        }

        if (req.method === "GET") {
          try {
            const { data, error } = await supabase.from("conversations").select("*").order("created_at", { ascending: false });
            if (error) {
              console.error("[Conversations API GET] Supabase selected error:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            return res.status(200).json({ success: true, data: data || [] });
          } catch (err: any) {
            console.error("[Conversations API GET] DB failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }

        if (req.method === "DELETE") {
          const id = req.query.id as string;
          console.log("[Conversations API DELETE] Removing entry ID:", id);
          try {
            const parsedId = /^\d+$/.test(id) ? parseInt(id, 10) : id;
            const { error } = await supabase.from("conversations").delete().eq("id", parsedId);
            if (error) {
              console.error("[Conversations API DELETE] Supabase remove failed:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            return res.status(200).json({ success: true, id });
          } catch (err: any) {
            console.error("[Conversations API DELETE] Database failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }
        break;
      }

      case "knowledge-base": {
        if (!supabase) {
          return res.status(400).json({ success: false, error: "Supabase not configured" });
        }

        if (req.method === "GET") {
          console.log("[KB API SDK] GET: Fetching all knowledge-base items");
          try {
            const { data, error } = await supabase.from("knowledge_base").select("*").order("title", { ascending: true });
            if (error) {
              console.error("[KB API SDK] Supabase DB Selected Error:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            console.log(`[KB API SDK] GET Success: Fetched ${data ? data.length : 0} items from Supabase.`);
            return res.status(200).json({ success: true, data: data || [] });
          } catch (err: any) {
            console.error("[KB API SDK] GET Database loading failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }

        if (req.method === "POST") {
          const newDoc = req.body;
          console.log("[KB API SDK] POST: Inserting standard KB doc", req.body);
          try {
            const { data, error } = await supabase.from("knowledge_base").insert([newDoc]).select();
            if (error) {
              console.error("[KB API SDK] Supabase DB Creation Error:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            console.log("[KB API SDK] POST Success: Created KB item in Supabase.", data[0]);
            return res.status(201).json({ success: true, data: data[0] });
          } catch (err: any) {
            console.error("[KB API SDK] POST Database insertion failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }

        if (req.method === "PUT") {
          const { id, ...updatedParts } = req.body;
          console.log(`[KB API SDK] PUT: Modifying article ID ${id}`, req.body);
          try {
            const parsedId = /^\d+$/.test(String(id)) ? parseInt(String(id), 10) : id;
            const { data, error } = await supabase.from("knowledge_base").update(updatedParts).eq("id", parsedId).select();
            if (error) {
              console.error("[KB API SDK] Supabase DB Modifying Error:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            if (!data || data.length === 0) {
              return res.status(404).json({ success: false, error: "Article target not found for updates" });
            }
            console.log(`[KB API SDK] PUT Success: Modified article ID ${parsedId} in Supabase.`);
            return res.status(200).json({ success: true, data: data[0] });
          } catch (err: any) {
            console.error("[KB API SDK] PUT Database modification failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }

        if (req.method === "DELETE") {
          const id = req.query.id as string;
          console.log(`[KB API SDK] DELETE: Removing article ID ${id}`);
          try {
            const parsedId = /^\d+$/.test(id) ? parseInt(id, 10) : id;
            const { error } = await supabase.from("knowledge_base").delete().eq("id", parsedId);
            if (error) {
              console.error("[KB API SDK] Supabase DB Delete Error:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            console.log(`[KB API SDK] DELETE Success: Removed article ID ${parsedId} from Supabase.`);
            return res.status(200).json({ success: true, id });
          } catch (err: any) {
            console.error("[KB API SDK] DELETE Database deletion failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }
        break;
      }

      case "settings": {
        if (!supabase) {
          return res.status(400).json({ success: false, error: "Supabase not configured" });
        }

        if (req.method === "GET") {
          try {
            const { data, error } = await supabase.from("ai_settings").select("*").limit(1);
            if (error) {
              console.error("[Settings API GET] Supabase load settings error:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            if (data && data.length > 0) {
              return res.status(200).json({ success: true, data: data[0] });
            } else {
              const defaultSettings = {
                businessName: "Nexloop Digital",
                tone: "Professional Co-Founder",
                replyLength: "Concise (1-3 Sentences)",
                leadCaptureEnabled: true,
                fallbackMessage: "Our complimentary interactive assistant is currently operating at capacity. Please reach out to us directly on WhatsApp +971 52 813 1539!"
              };
              const { data: inserted, error: insertError } = await supabase.from("ai_settings").insert([defaultSettings]).select();
              if (insertError) {
                console.error("[Settings API GET] Setup default Settings row failed:", insertError);
                return res.status(400).json({ success: false, error: insertError.message });
              }
              return res.status(200).json({ success: true, data: inserted[0] });
            }
          } catch (err: any) {
            console.error("[Settings API GET] Database failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }

        if (req.method === "POST" || req.method === "PUT") {
          const updatedSettings = req.body;
          console.log("[Settings API POST] Updating entry:", req.body);
          try {
            const { data: firstRow, error: selectErr } = await supabase.from("ai_settings").select("id").limit(1);
            if (selectErr) {
              console.error("[Settings API POST] Select row failed:", selectErr);
              return res.status(400).json({ success: false, error: selectErr.message });
            }
            if (firstRow && firstRow.length > 0) {
              const { data, error } = await supabase.from("ai_settings").update(updatedSettings).eq("id", firstRow[0].id).select();
              if (error) {
                console.error("[Settings API POST] Row update failed:", error);
                return res.status(400).json({ success: false, error: error.message });
              }
              return res.status(200).json({ success: true, data: data[0] });
            } else {
              const { data, error } = await supabase.from("ai_settings").insert([updatedSettings]).select();
              if (error) {
                console.error("[Settings API POST] Setup row failed:", error);
                return res.status(400).json({ success: false, error: error.message });
              }
              return res.status(200).json({ success: true, data: data[0] });
            }
          } catch (err: any) {
            console.error("[Settings API POST] Database update failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }
        break;
      }

      default:
        return res.status(404).json({ success: false, error: "Action or endpoint not found" });
    }

    return res.status(400).json({ success: false, error: "Bad Request" });
  } catch (error: any) {
    console.error("[Admin API Engine Error]", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
}
