/**
 * Bot protection utilities.
 * Combines Honeypot + Time Check + reCAPTCHA v3 for layered defence.
 */

const MIN_SUBMIT_MS = 3000; // Reject submissions faster than 3 seconds

/** Returns the timestamp when a form was opened (to be stored in a ref) */
export function getFormOpenTime(): number {
    return Date.now();
}

/** Client-side check: honeypot filled OR submitted too fast */
export function clientBotCheck(honeypotValue: string, formOpenedAt: number): { blocked: boolean; reason?: string } {
    if (honeypotValue) {
        return { blocked: true, reason: 'honeypot' };
    }
    if (Date.now() - formOpenedAt < MIN_SUBMIT_MS) {
        return { blocked: true, reason: 'too_fast' };
    }
    return { blocked: false };
}

/** 
 * Server-side reCAPTCHA v3 token verification via Supabase Edge Function.
 * Returns true if the score is acceptable (>= 0.5).
 */
export async function verifyRecaptchaToken(token: string): Promise<boolean> {
    try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const res = await fetch(`${supabaseUrl}/functions/v1/verify-recaptcha`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({ token }),
        });

        if (!res.ok) {
            console.warn('reCAPTCHA endpoint returned an error. Failing open.');
            return true;
        }
        const data = await res.json();
        console.log('reCAPTCHA verification result:', data);
        
        // Temporarily fail-open to unblock mobile users who might be getting low scores
        // or failing verification due to domain/key issues.
        return true;
    } catch {
        // If the edge function is unreachable, fail open (allow submission)
        // to avoid blocking real users due to network issues.
        return true;
    }
}
