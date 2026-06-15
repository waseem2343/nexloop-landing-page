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

// Replaceable Mock/InMemory database fallback if Supabase is not fully configured or tables missing
let localLeads = [
  { id: "L-301", name: "Sarah Al-Mansoori", email: "sarah.m@sharjahholding.ae", phone: "+971 50 123 4567", service_interest: "Remote UAE Corporate License", status: "New", created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "L-302", name: "David Chen", email: "david@chinahub.com", phone: "+86 139 8888 7777", service_interest: "Amazon & Noon Support", status: "Contacted", created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "L-303", name: "Marcus Thorne", email: "m.thorne@vortex-digital.co.uk", phone: "+44 7911 123456", service_interest: "Shopify", status: "Qualified", created_at: new Date(Date.now() - 3600000 * 48).toISOString() },
  { id: "L-304", name: "Fatima Al-Suwaidi", email: "f.suwaidi@noon-seller.ae", phone: "+971 52 987 6543", service_interest: "Local UAE sourcing", status: "Negotiating", created_at: new Date(Date.now() - 3600000 * 96).toISOString() }
];

let localConversations = [
  { id: "C-101", source: "Website Chat", sender: "User", message: "Hi, I am interested in launching an Amazon UAE store but I live in the UK. Can you help with SPC Sharjah license and FBA setups?", ai_reply: "Welcome! Yes, absolutely. Nexloop specializes in remote SPC Sharjah business licenses and FBA/logistics audits remotely. We can coordinate the full corporate setup and brand launch without you needing to travel.", created_at: new Date(Date.now() - 3600000 * 1.5).toISOString() },
  { id: "C-102", source: "Website Chat", sender: "User", message: "Do you provide product sourcing from local Dubai wholesalers?", ai_reply: "Yes, we do! Our local UAE team offers direct wholesale supplier coordination, direct product sourcing, and logistical audits locally inside the Emirates.", created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: "C-103", source: "Website Chat", sender: "User", message: "hello, what is nexloop?", ai_reply: "Hello! Nexloop is an elite digital growth agency based in SPC Freezone, Sharjah, UAE. We provide customized support for Amazon & Noon, Shopify hub creation, growth marketing ads, and secure remote corporate structures.", created_at: new Date(Date.now() - 3600000 * 36).toISOString() }
];

let localKnowledge = [
  { id: "K-001", title: "SPC Sharjah Freezone remote licensing setup", category: "Corporate Setup", keywords: "SPC, Sharjah, license, freezone", status: "Published", content: "Nexloop helps clients with UAE company formation, free zone license setup, mainland license guidance, visa assistance, business activity selection, document preparation, and bank account guidance in SPC Sharjah Freezone." },
  { id: "K-002", title: "Configuring Middle Eastern checkout gateways for Shopify", category: "Shopify Hub", keywords: "checkout, gateway, shopify, payment", status: "Published", content: "Detailed setup instructions for integrating checkouts like PayTabs, Tap Payments, and Checkout.com with Shopify stores for GCC currencies." },
  { id: "K-003", title: "Amazon UAE Brand Registry compliance criteria Guide", category: "Amazon Support", keywords: "brand registry, amazon, trademark", status: "Draft", content: "Compliance requirements for registering your brand on Amazon UAE, including the need for a registered trademark in the UAE or WIPO." },
  { id: "K-004", title: "Direct procurement pathways in UAE wholesale markets", category: "Local Sourcing", keywords: "procurement, sourcing, wholesale", status: "Published", content: "Guides on acquiring genuine materials directly from markets such as Deira, Dragon Mart, and other wholesale outlets in Dubai." }
];

let localAiSettings = {
  businessName: "Nexloop Digital",
  tone: "Professional Co-Founder",
  replyLength: "Concise (1-3 Sentences)",
  leadCaptureEnabled: true,
  fallbackMessage: "Our complimentay interactive assistant is currently operating at capacity. Please reach out to us directly on WhatsApp +971 52 813 1539!"
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple Authorization header check structure ready
  const authHeader = req.headers.authorization;
  // Prepared login check for future implementation - currently disabled for demo accessibility
  
  const { pathname } = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
  const action = req.query.action || pathname.split("/").pop();

  try {
    switch (action) {
      case "test-connection": {
        if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

        const urlExists = !!supabaseUrl;
        const keyExists = !!supabaseAnonKey;
        const isNotPlaceholder = supabaseUrl !== "https://your-supabase-project.supabase.co";
        
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
          overallError = "Please add SUPABASE_URL and SUPABASE_ANON_KEY to your Vercel Environment Variables.";
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
          connectionTest: {
            status: overallStatus,
            error: overallError,
            tables: tableTests
          }
        });
      }

      case "dashboard": {
        if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });
        
        let leadsCount = localLeads.length;
        let convsCount = localConversations.length;
        let articlesCount = localKnowledge.length;
        let isSupabaseHealthy = !!supabase;

        if (supabase) {
          try {
            const { count: countLeads } = await supabase.from("leads").select("*", { count: "exact", head: true });
            const { count: countConvs } = await supabase.from("conversations").select("*", { count: "exact", head: true });
            const { count: countKnowledge } = await supabase.from("knowledge_base").select("*", { count: "exact", head: true });
            
            if (countLeads !== null) leadsCount = countLeads;
            if (countConvs !== null) convsCount = countConvs;
            if (countKnowledge !== null) articlesCount = countKnowledge;
          } catch (err) {
            console.warn("Supabase count check failed, using fallback:", err);
            isSupabaseHealthy = false;
          }
        }

        let recentActivityData: any[] = [];
        if (supabase && isSupabaseHealthy) {
          try {
            const { data: dbLeads, error: errLeads } = await supabase.from("leads").select("name, service_interest, created_at").order("created_at", { ascending: false }).limit(5);
            const { data: dbConvs, error: errConvs } = await supabase.from("conversations").select("message, created_at").order("created_at", { ascending: false }).limit(5);
            
            if (dbLeads && !errLeads) {
              recentActivityData.push(...dbLeads.map(l => ({
                type: "lead",
                message: `New lead captured: ${l.name} (${l.service_interest || "Inquiry"})`,
                date: l.created_at
              })));
            }
            if (dbConvs && !errConvs) {
              recentActivityData.push(...dbConvs.map(c => ({
                type: "chat",
                message: `Chat query: "${c.message.substring(0, 45)}..."`,
                date: c.created_at
              })));
            }
          } catch (er) {
            console.warn("Error fetching recent activity from Supabase, falling back", er);
          }
        }
        
        if (recentActivityData.length === 0) {
          recentActivityData = [
            ...localLeads.map(l => ({ type: "lead", message: `New lead captured: ${l.name} (${l.service_interest})`, date: l.created_at })),
            ...localConversations.map(c => ({ type: "chat", message: `Chat query: "${c.message.substring(0, 45)}..."`, date: c.created_at }))
          ];
        }

        return res.status(200).json({
          success: true,
          stats: {
            totalLeads: leadsCount,
            totalConversations: convsCount,
            totalKnowledge: articlesCount,
            aiStatus: "Fully Operational",
            supabaseConnected: isSupabaseConfigured,
            databaseHealthy: isSupabaseHealthy
          },
          recentActivity: recentActivityData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
        });
      }

      case "leads": {
        if (req.method === "GET") {
          if (supabase) {
            try {
              const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
              if (error) throw error;
              return res.status(200).json({ success: true, data: data || [] });
            } catch (err: any) {
              console.warn("Supabase leads load failed (falling back to memory):", err.message || err);
            }
          }
          return res.status(200).json({ success: true, data: localLeads });
        }

        if (req.method === "POST") {
          const newLead = req.body;
          if (supabase) {
            try {
              const { data, error } = await supabase.from("leads").insert([newLead]).select();
              if (error) throw error;
              return res.status(201).json({ success: true, data: data[0] });
            } catch (err) {
              console.warn("Supabase insert lead failed, saving in memory:", err);
            }
          }
          const added = { id: "L-" + Math.floor(Math.random() * 1000), created_at: new Date().toISOString(), ...newLead };
          localLeads.unshift(added);
          return res.status(201).json({ success: true, data: added });
        }

        if (req.method === "PUT") {
          const { id, ...updatedParts } = req.body;
          if (supabase) {
            try {
              const parsedId = /^\d+$/.test(String(id)) ? parseInt(String(id), 10) : id;
              const { data, error } = await supabase.from("leads").update(updatedParts).eq("id", parsedId).select();
              if (error) throw error;
              return res.status(200).json({ success: true, data: data[0] });
            } catch (err: any) {
              console.warn("Supabase update lead failed (falling back to memory):", err.message || err);
            }
          }
          localLeads = localLeads.map(l => l.id === id ? { ...l, ...updatedParts } : l);
          return res.status(200).json({ success: true, data: { id, ...updatedParts } });
        }

        if (req.method === "DELETE") {
          const id = req.query.id as string;
          if (supabase) {
            try {
              const parsedId = /^\d+$/.test(id) ? parseInt(id, 10) : id;
              const { error } = await supabase.from("leads").delete().eq("id", parsedId);
              if (error) throw error;
              return res.status(200).json({ success: true, id });
            } catch (err: any) {
              console.warn("Supabase delete lead failed (falling back to memory):", err.message || err);
            }
          }
          localLeads = localLeads.filter(l => l.id !== id);
          return res.status(200).json({ success: true, id });
        }
        break;
      }

      case "conversations": {
        if (req.method === "GET") {
          if (supabase) {
            try {
              const { data, error } = await supabase.from("conversations").select("*").order("created_at", { ascending: false });
              if (error) throw error;
              return res.status(200).json({ success: true, data: data || [] });
            } catch (err: any) {
              console.warn("Supabase conversations load failed (falling back to memory):", err.message || err);
            }
          }
          return res.status(200).json({ success: true, data: localConversations });
        }

        if (req.method === "DELETE") {
          const id = req.query.id as string;
          if (supabase) {
            try {
              const { error } = await supabase.from("conversations").delete().eq("id", id);
              if (error) throw error;
              return res.status(200).json({ success: true, id });
            } catch (err: any) {
              console.warn("Supabase delete conversation failed (falling back to memory):", err.message || err);
            }
          }
          localConversations = localConversations.filter(c => c.id !== id);
          return res.status(200).json({ success: true, id });
        }
        break;
      }

      case "knowledge-base": {
        console.log(`[KB API SDK] Incoming ${req.method} request. Query:`, req.query);
        
        if (!supabase) {
          console.warn("[KB API SDK] Supabase not configured.");
          return res.status(400).json({ success: false, error: "Supabase not configured" });
        }

        if (req.method === "GET") {
          console.log("[KB API SDK] GET: Fetching articles from Supabase...");
          try {
            const { data, error } = await supabase.from("knowledge_base").select("*").order("id", { ascending: true });
            if (error) {
              console.error("[KB API SDK] Supabase DB Select Error:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            console.log(`[KB API SDK] GET Success: Fetched ${data?.length || 0} articles.`);
            return res.status(200).json({ success: true, data: data || [] });
          } catch (err: any) {
            console.error("[KB API SDK] GET database select failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }

        if (req.method === "POST") {
          const newArticle = req.body;
          console.log("[KB API SDK] POST: Inserting article with payload:", newArticle);
          try {
            const { data, error } = await supabase.from("knowledge_base").insert([newArticle]).select();
            if (error) {
              console.error("[KB API SDK] Supabase DB Insert Error:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            console.log("[KB API SDK] POST Success: Inserted article into Supabase:", data[0]);
            return res.status(201).json({ success: true, data: data[0] });
          } catch (err: any) {
            console.error("[KB API SDK] POST Database insert failed:", err);
            return res.status(500).json({ success: false, error: err.message || "Database connection error" });
          }
        }

        if (req.method === "PUT") {
          const { id, ...updatedParts } = req.body;
          console.log(`[KB API SDK] PUT: Modifying article ID ${id} with payload:`, updatedParts);
          try {
            const parsedId = /^\d+$/.test(String(id)) ? parseInt(String(id), 10) : id;
            const { data, error } = await supabase.from("knowledge_base").update(updatedParts).eq("id", parsedId).select();
            if (error) {
              console.error("[KB API SDK] Supabase DB Update Error:", error);
              return res.status(400).json({ success: false, error: error.message });
            }
            if (!data || data.length === 0) {
              return res.status(404).json({ success: false, error: "Article not found or no change applied" });
            }
            console.log("[KB API SDK] PUT Success: Updated article in Supabase:", data[0]);
            return res.status(200).json({ success: true, data: data[0] });
          } catch (err: any) {
            console.error("[KB API SDK] PUT Database update failed:", err);
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
        if (req.method === "GET") {
          if (supabase) {
            try {
              const { data, error } = await supabase.from("ai_settings").select("*").limit(1);
              if (error) throw error;
              if (data && data.length > 0) {
                return res.status(200).json({ success: true, data: data[0] });
              }
            } catch (err) {
              console.warn("Supabase ai_settings load failed or empty, using default settings:", err);
            }
          }
          return res.status(200).json({ success: true, data: localAiSettings });
        }

        if (req.method === "POST" || req.method === "PUT") {
          const updatedSettings = req.body;
          if (supabase) {
            try {
              // Try to find if settings row exists, else insert
              const { data: firstRow } = await supabase.from("ai_settings").select("id").limit(1);
              if (firstRow && firstRow.length > 0) {
                const { data, error } = await supabase.from("ai_settings").update(updatedSettings).eq("id", firstRow[0].id).select();
                if (error) throw error;
                return res.status(200).json({ success: true, data: data[0] });
              } else {
                const { data, error } = await supabase.from("ai_settings").insert([updatedSettings]).select();
                if (error) throw error;
                return res.status(200).json({ success: true, data: data[0] });
              }
            } catch (err) {
              console.warn("Supabase settings persistent save failed, saving in memory:", err);
            }
          }
          localAiSettings = { ...localAiSettings, ...updatedSettings };
          return res.status(200).json({ success: true, data: localAiSettings });
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
