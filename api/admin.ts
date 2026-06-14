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
  { id: "K-001", title: "SPC Sharjah Freezone remote licensing setup", category: "Corporate Setup", keywords: "SPC, Sharjah, license, freezone", status: "Published" },
  { id: "K-002", title: "Configuring Middle Eastern checkout gateways for Shopify", category: "Shopify Hub", keywords: "checkout, gateway, shopify, payment", status: "Published" },
  { id: "K-003", title: "Amazon UAE Brand Registry compliance criteria Guide", category: "Amazon Support", keywords: "brand registry, amazon, trademark", status: "Draft" },
  { id: "K-004", title: "Direct procurement pathways in UAE wholesale markets", category: "Local Sourcing", keywords: "procurement, sourcing, wholesale", status: "Published" }
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
          recentActivity: [
            ...localLeads.map(l => ({ type: "lead", message: `New lead captured: ${l.name} (${l.service_interest})`, date: l.created_at })),
            ...localConversations.map(c => ({ type: "chat", message: `Chat query: "${c.message.substring(0, 45)}..."`, date: c.created_at }))
          ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
        });
      }

      case "leads": {
        if (req.method === "GET") {
          if (supabase) {
            try {
              const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
              if (error) throw error;
              if (data && data.length > 0) {
                return res.status(200).json({ success: true, data });
              }
            } catch (err) {
              console.warn("Supabase leads load failed, using local/demo leads:", err);
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
              const { data, error } = await supabase.from("leads").update(updatedParts).eq("id", id).select();
              if (error) throw error;
              return res.status(200).json({ success: true, data: data[0] });
            } catch (err) {
              console.warn("Supabase update lead failed, updating memory:", err);
            }
          }
          localLeads = localLeads.map(l => l.id === id ? { ...l, ...updatedParts } : l);
          return res.status(200).json({ success: true, data: { id, ...updatedParts } });
        }

        if (req.method === "DELETE") {
          const id = req.query.id as string;
          if (supabase) {
            try {
              const { error } = await supabase.from("leads").delete().eq("id", id);
              if (error) throw error;
              return res.status(200).json({ success: true, id });
            } catch (err) {
              console.warn("Supabase delete lead failed, deleting from memory:", err);
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
              if (data && data.length > 0) {
                return res.status(200).json({ success: true, data });
              }
            } catch (err) {
              console.warn("Supabase conversations load failed, using local/demo conversations:", err);
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
            } catch (err) {
              console.warn("Supabase delete conversation failed, deleting from memory:", err);
            }
          }
          localConversations = localConversations.filter(c => c.id !== id);
          return res.status(200).json({ success: true, id });
        }
        break;
      }

      case "knowledge-base": {
        if (req.method === "GET") {
          if (supabase) {
            try {
              const { data, error } = await supabase.from("knowledge_base").select("*").order("id", { ascending: true });
              if (error) throw error;
              if (data && data.length > 0) {
                return res.status(200).json({ success: true, data });
              }
            } catch (err) {
              console.warn("Supabase knowledge_base load failed, using local/demo knowledge:", err);
            }
          }
          return res.status(200).json({ success: true, data: localKnowledge });
        }

        if (req.method === "POST") {
          const newArticle = req.body;
          if (supabase) {
            try {
              const { data, error } = await supabase.from("knowledge_base").insert([newArticle]).select();
              if (error) throw error;
              return res.status(201).json({ success: true, data: data[0] });
            } catch (err) {
              console.warn("Supabase insert article failed, saving in memory:", err);
            }
          }
          const added = { id: "K-" + Math.floor(Math.random() * 1000), ...newArticle };
          localKnowledge.unshift(added);
          return res.status(201).json({ success: true, data: added });
        }

        if (req.method === "PUT") {
          const { id, ...updatedParts } = req.body;
          if (supabase) {
            try {
              const { data, error } = await supabase.from("knowledge_base").update(updatedParts).eq("id", id).select();
              if (error) throw error;
              return res.status(200).json({ success: true, data: data[0] });
            } catch (err) {
              console.warn("Supabase update article failed, updating memory:", err);
            }
          }
          localKnowledge = localKnowledge.map(k => k.id === id ? { ...k, ...updatedParts } : k);
          return res.status(200).json({ success: true, data: { id, ...updatedParts } });
        }

        if (req.method === "DELETE") {
          const id = req.query.id as string;
          if (supabase) {
            try {
              const { error } = await supabase.from("knowledge_base").delete().eq("id", id);
              if (error) throw error;
              return res.status(200).json({ success: true, id });
            } catch (err) {
              console.warn("Supabase delete article failed, deleting from memory:", err);
            }
          }
          localKnowledge = localKnowledge.filter(k => k.id !== id);
          return res.status(200).json({ success: true, id });
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
