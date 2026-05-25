import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  clientName: string;
  clientEmail: string;
  projectName: string;
  projectStatus?: string;
  portalUrl?: string;
}

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  return String(error);
};

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
      return jsonResponse({ error: "Missing authorization header" }, 401);
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
      return jsonResponse({ error: "Unauthorized" }, 401);
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
      return jsonResponse({ error: "Failed to verify permissions" }, 500);
    }

    if (!roleData) {
      console.error("User is not an admin:", user.id);
      return jsonResponse({ error: "Forbidden: Admin access required" }, 403);
    }

    console.log("Admin verified:", user.id);

    const { clientName, clientEmail, projectName, projectStatus, portalUrl }: InvitationRequest = await req.json();

    console.log(`Sending invitation email to ${clientEmail} for project ${projectName}`);

    // Validate required fields
    if (!clientName || !clientEmail || !projectName) {
      console.error("Missing required fields:", { clientName, clientEmail, projectName });
      return jsonResponse({ error: "Missing required fields: clientName, clientEmail, or projectName" }, 400);
    }

    const loginUrl = portalUrl || "https://navarreinteriors.com/auth";

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return jsonResponse({ error: "Email service is not configured." }, 500);
    }

    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const normalizedEmail = clientEmail.trim().toLowerCase();
    const safeProjectStatus = projectStatus || "Planning";
    const progress = safeProjectStatus === "Planning" ? 5 : 0;

    const { data: inviteData, error: inviteError } = await supabaseServiceClient.auth.admin.generateLink({
      type: "invite",
      email: normalizedEmail,
      options: {
        data: { full_name: clientName },
        redirectTo: loginUrl,
      },
    });

    if (inviteError || !inviteData?.user || !inviteData?.properties?.action_link) {
      console.error("Failed to create client invite link:", inviteError);
      return jsonResponse({ error: "Failed to create client invitation", details: inviteError?.message }, 500);
    }

    const clientId = inviteData.user.id;
    const inviteLink = inviteData.properties.action_link;

    const { error: profileError } = await supabaseServiceClient
      .from("profiles")
      .upsert({
        id: clientId,
        email: normalizedEmail,
        full_name: clientName,
        role: "client",
      }, { onConflict: "id" });

    if (profileError) {
      console.error("Failed to save client profile:", profileError);
      return jsonResponse({ error: "Failed to save client profile", details: profileError.message }, 500);
    }

    const { error: roleUpsertError } = await supabaseServiceClient
      .from("user_roles")
      .upsert({ user_id: clientId, role: "client" }, { onConflict: "user_id,role" });

    if (roleUpsertError) {
      console.error("Failed to save client role:", roleUpsertError);
      return jsonResponse({ error: "Failed to save client access", details: roleUpsertError.message }, 500);
    }

    const { data: projectData, error: projectError } = await supabaseServiceClient
      .from("projects")
      .insert({
        client_id: clientId,
        name: projectName,
        status: safeProjectStatus,
        progress,
      })
      .select("id, name, status, progress")
      .single();

    if (projectError) {
      console.error("Failed to save client project:", projectError);
      return jsonResponse({ error: "Failed to save client project", details: projectError.message }, 500);
    }

    const resend = new Resend(resendApiKey);

    const fromAddress = Deno.env.get("RESEND_FROM_EMAIL");
    if (!fromAddress) {
      console.error("RESEND_FROM_EMAIL is not configured");
      return jsonResponse({ error: "Email sender not configured. Set RESEND_FROM_EMAIL secret to an address on a verified domain." }, 500);
    }

    console.log("Sending from:", fromAddress, "to:", clientEmail);

    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [clientEmail],
      subject: "Welcome to Navarre Interiors",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #faf9f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf9f6; padding: 48px 20px;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">

                  <!-- Logo -->
                  <tr>
                    <td style="padding: 40px 40px 24px; text-align: center;">
                      <img src="https://navarreinteriors.com/email-logo.png" alt="Navarre Interiors" width="180" style="display: block; margin: 0 auto; max-width: 180px; height: auto;" />
                    </td>
                  </tr>

                  <!-- Message -->
                  <tr>
                    <td style="padding: 16px 40px 8px; text-align: center;">
                      <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #2d2d2d;">
                        Hi ${clientName},
                      </p>
                      <p style="margin: 16px 0 0; font-size: 16px; line-height: 1.7; color: #2d2d2d;">
                        We look forward to working with you! Click below to set up your account and get access to the client portal.
                      </p>
                    </td>
                  </tr>

                  <!-- CTA -->
                  <tr>
                    <td style="padding: 32px 40px 48px; text-align: center;">
                      <a href="${inviteLink}" style="display: inline-block; background-color: #758f7f; color: #ffffff; text-decoration: none; padding: 14px 36px; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                        Set Up Your Account
                      </a>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px 40px; text-align: center; border-top: 1px solid #ececec;">
                      <p style="margin: 16px 0 0; font-size: 12px; color: #999999; letter-spacing: 1px;">
                        NAVARRE INTERIORS
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

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return jsonResponse({
        success: false,
        error: "Client was added, but the invitation email failed to send",
        details: emailResponse.error,
        client: { id: clientId, name: clientName, email: normalizedEmail },
        project: projectData,
      });
    }

    console.log("Email sent successfully:", emailResponse);

    return jsonResponse({
      success: true,
      data: emailResponse,
      client: { id: clientId, name: clientName, email: normalizedEmail },
      project: projectData,
    });
  } catch (error: unknown) {
    console.error("Error in send-client-invitation function:", error);
    return jsonResponse({ error: getErrorMessage(error) }, 500);
  }
};

serve(handler);
