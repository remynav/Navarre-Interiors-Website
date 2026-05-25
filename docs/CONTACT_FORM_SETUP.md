# Contact form — production setup (Resend + DNS)

The contact form calls the Supabase Edge Function `send-contact-inquiry`, which sends email via [Resend](https://resend.com).

## Code defaults (no DNS required for testing)

- **To:** `brandy@navarreinteriors.com` (override with Supabase secret `CONTACT_INQUIRY_TO`)
- **From:** `Navarre Interiors <onboarding@resend.dev>` until your domain is verified (override with `RESEND_FROM_EMAIL`)

`onboarding@resend.dev` only works for Resend test mode / limited recipients. For production, verify your domain.

## What you need on your end (DNS)

1. Create a [Resend](https://resend.com) account and add **`navarreinteriors.com`** as a sending domain.
2. In Resend → Domains, copy the DNS records (typically **SPF**, **DKIM**, and sometimes **MX** / return-path). Add them in your domain registrar (where `navarreinteriors.com` DNS is managed).
3. Wait until Resend shows the domain as **Verified**.
4. In Supabase → Project Settings → Edge Functions → Secrets, set:
   - `RESEND_API_KEY` — from Resend API Keys
   - `RESEND_FROM_EMAIL` — e.g. `Navarre Interiors <hello@navarreinteriors.com>` (must use an address on the verified domain)
   - `CONTACT_INQUIRY_TO` — optional; defaults to `brandy@navarreinteriors.com`
5. Deploy the function: `supabase functions deploy send-contact-inquiry`
6. Submit the contact form on your live site and confirm mail arrives at `brandy@navarreinteriors.com`.

## Frontend (already configured)

- `.env` needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the marketing site build/host.

No extra DNS is required for the website itself—only for **sending** email from your domain through Resend.
