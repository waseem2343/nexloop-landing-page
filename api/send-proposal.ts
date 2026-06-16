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
  // Only accept POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed. Use POST.`
    });
  }

  try {
    const { fullName, email, countryCode, phoneNumber, service, message, proposalData } = req.body || {};

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

    // Save lead submission exclusively to the Supabase leads table
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

    return res.status(200).json({
      success: true,
      proposalId: proposalData?.id || null
    });

  } catch (err: any) {
    console.error("[POST /api/send-proposal Serverless Error]", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error while processing the proposal: " + err.message
    });
  }
}
