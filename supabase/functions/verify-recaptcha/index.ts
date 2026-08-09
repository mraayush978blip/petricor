// @ts-nocheck
// This file runs in Deno (Supabase Edge Function runtime), not Node.js.
// IDE TypeScript errors about 'Deno' or deno.land imports are false positives — safe to ignore.

// Supabase Edge Function: verify-recaptcha
// Verifies a reCAPTCHA v3 token server-side using the secret key.
// The secret key is stored in Supabase Secrets, never exposed to the client.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS_HEADERS });
    }

    try {
        const { token } = await req.json();

        if (!token) {
            return new Response(JSON.stringify({ success: false, error: 'No token provided' }), {
                status: 400,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        // RECAPTCHA_SECRET_KEY must be set in Supabase Dashboard → Settings → Edge Functions → Secrets
        const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');
        if (!secretKey) {
            console.error('RECAPTCHA_SECRET_KEY is not set in Supabase Secrets');
            // Fail open: don't block users if secret is missing (dev/misconfiguration)
            return new Response(JSON.stringify({ success: true, score: 1.0, warning: 'secret_not_set' }), {
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${secretKey}&response=${token}`,
        });

        const result = await verifyRes.json();

        return new Response(
            JSON.stringify({
                success: result.success,
                score: result.score,
                action: result.action,
            }),
            { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: String(err) }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
    }
});
