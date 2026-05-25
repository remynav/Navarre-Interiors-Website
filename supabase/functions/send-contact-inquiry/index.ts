import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactInquiryRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
  website?: string; // Honeypot field - should be empty for legitimate submissions
}

// Sanitize input to prevent header injection (remove newlines and carriage returns)
const sanitize = (str: string): string => {
  if (!str) return '';
  return str.replace(/[\r\n]/g, '').trim();
};

// Escape HTML to prevent XSS in email clients
const escapeHtml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone format (allows various formats, optional)
const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  // Allow digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-\(\)\+\.]{0,20}$/;
  return phoneRegex.test(phone);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, phone, message, website } = body as ContactInquiryRequest;

    // Honeypot check - if filled, it's likely a bot
    if (website && website.trim() !== '') {
      console.log("Bot submission detected - honeypot field filled");
      // Return success to not alert the bot, but don't send email
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate and sanitize inputs
    const sanitizedName = sanitize(name);
    const sanitizedEmail = sanitize(email);
    const sanitizedPhone = sanitize(phone || '');
    const sanitizedMessage = sanitize(message);

    // Enforce length limits
    if (sanitizedName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name must be less than 100 characters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (sanitizedEmail.length > 255) {
      return new Response(
        JSON.stringify({ error: "Email must be less than 255 characters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (sanitizedMessage.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message must be less than 2000 characters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate phone format
    if (!isValidPhone(sanitizedPhone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Escape HTML for safe rendering in email
    const safeName = escapeHtml(sanitizedName);
    const safeEmail = escapeHtml(sanitizedEmail);
    const safePhone = escapeHtml(sanitizedPhone);
    const safeMessage = escapeHtml(sanitizedMessage);

    const fromAddress =
      Deno.env.get("RESEND_FROM_EMAIL") ?? "Navarre Interiors <onboarding@resend.dev>";
    const toAddress =
      Deno.env.get("CONTACT_INQUIRY_TO") ?? "brandy@navarreinteriors.com";

    console.log("Sending contact inquiry email");

    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      subject: `New Inquiry from ${safeName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #739263; padding-bottom: 10px;">New Project Inquiry</h1>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #739263; margin-bottom: 5px;">Contact Information</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${safeName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${safePhone || 'Not provided'}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #739263; margin-bottom: 5px;">Project Details</h3>
            <p style="background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${safeMessage}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #888; font-size: 12px;">This inquiry was submitted through the Navarre Interiors website.</p>
        </div>
      `,
      reply_to: sanitizedEmail,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending contact inquiry:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send inquiry. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
