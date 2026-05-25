import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  clientName: string;
  clientEmail: string;
  projectName: string;
  portalUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with user's auth context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify user has admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Role check failed:", roleError.message);
      return new Response(
        JSON.stringify({ error: "Failed to verify permissions" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!roleData) {
      console.error("User is not an admin:", user.id);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Admin verified:", user.id);

    const { clientName, clientEmail, projectName, portalUrl }: InvitationRequest = await req.json();

    console.log(`Sending invitation email to ${clientEmail} for project ${projectName}`);

    // Validate required fields
    if (!clientName || !clientEmail || !projectName) {
      console.error("Missing required fields:", { clientName, clientEmail, projectName });
      return new Response(
        JSON.stringify({ error: "Missing required fields: clientName, clientEmail, or projectName" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const loginUrl = portalUrl || "https://navarreinteriors.com/auth";

    const fromAddress = Deno.env.get("RESEND_FROM_EMAIL");
    if (!fromAddress) {
      console.error("RESEND_FROM_EMAIL is not configured");
      return new Response(
        JSON.stringify({ error: "Email sender not configured. Set RESEND_FROM_EMAIL secret to an address on a verified domain." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Sending from:", fromAddress, "to:", clientEmail);

    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [clientEmail],
      subject: `Welcome to Your Design Project - ${projectName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f8f7f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f7f4; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1a1a1a; padding: 40px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 2px;">
                        <span style="color: #ffffff;">Navarre</span>
                        <span style="color: #c9a962;"> Interiors</span>
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 400; color: #1a1a1a;">
                        Welcome, ${clientName}!
                      </h2>
                      
                      <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.8; color: #4a4a4a;">
                        We're thrilled to begin your design journey with us. Your project <strong style="color: #1a1a1a;">"${projectName}"</strong> has been set up and is ready for you to explore.
                      </p>
                      
                      <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.8; color: #4a4a4a;">
                        Through your personalized client portal, you'll be able to:
                      </p>
                      
                      <ul style="margin: 0 0 30px; padding-left: 20px; font-size: 16px; line-height: 2; color: #4a4a4a;">
                        <li>Track your project's progress in real-time</li>
                        <li>View and approve design concepts and mood boards</li>
                        <li>Access important documents and contracts</li>
                        <li>Communicate directly with your design team</li>
                        <li>Review product selections and 3D renderings</li>
                      </ul>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 35px 0;">
                        <tr>
                          <td align="center">
                            <a href="${loginUrl}" style="display: inline-block; background-color: #c9a962; color: #1a1a1a; text-decoration: none; padding: 16px 40px; font-size: 14px; font-weight: 600; letter-spacing: 1px; border-radius: 4px; text-transform: uppercase;">
                              Access Your Portal
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.8; color: #888888;">
                        If you have any questions, please don't hesitate to reach out. We're here to make your design experience seamless and enjoyable.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f7f4; padding: 30px 40px; text-align: center; border-top: 1px solid #e8e6e1;">
                      <p style="margin: 0 0 10px; font-size: 14px; color: #888888;">
                        Navarre Interiors
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #aaaaaa;">
                        Elevating spaces with timeless design
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-client-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
