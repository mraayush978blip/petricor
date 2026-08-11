// @ts-nocheck
import nodemailer from "npm:nodemailer";

import { createClient } from "npm:@supabase/supabase-js";

// Supabase webhook payload interface
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  schema: 'public';
  old_record: null | any;
}

export default {
  async fetch(req: Request) {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    try {
      const payload: WebhookPayload = await req.json();

      if (payload.type !== 'INSERT' || payload.table !== 'enquiries') {
        return new Response('Not an enquiry insert event.', { status: 200 });
      }

      const enquiry = payload.record;

      // Extract credentials from Supabase Environment Secrets
      const gmailAddress = Deno.env.get('GMAIL_ADDRESS');
      const gmailPassword = Deno.env.get('GMAIL_PASSWORD');

      if (!gmailAddress || !gmailPassword) {
        throw new Error('GMAIL_ADDRESS or GMAIL_PASSWORD is not set in Edge Function secrets.');
      }

      // Initialize Supabase Client to fetch Admin Email from Settings
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: settings, error: settingsError } = await supabase.from('settings').select('admin_email').limit(1).single();
      
      console.log('Fetched settings data:', settings);
      if (settingsError) {
        console.error('Error fetching settings:', settingsError);
      }

      const toEmail = settings?.admin_email || gmailAddress;
      console.log('Sending email to:', toEmail);

      // Create a Nodemailer transporter using SMTP
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailAddress,
          pass: gmailPassword,
        },
      });

      // Construct the email body
      const mailOptions = {
        from: `Petricor Enquiries <${gmailAddress}>`,
        to: toEmail,
        subject: `New Enquiry from ${enquiry.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; color: #333;">
            <h2 style="color: #7c5847;">New Petricor Enquiry Received</h2>
            <p>You have received a new enquiry via the website form.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold; width: 120px;">Name</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${enquiry.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Email</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${enquiry.email}">${enquiry.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Phone</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${enquiry.phone || 'N/A'}</td>
              </tr>
              ${enquiry.company ? `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Company</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${enquiry.company}</td>
              </tr>
              ` : ''}
              ${enquiry.product_id ? `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Product Enquiry</td>
                <td style="padding: 10px; border: 1px solid #ddd;">True</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Message</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${enquiry.message.replace(/\n/g, '<br/>')}</td>
              </tr>
            </table>
            
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
              This email was generated automatically by Petricor website.
            </p>
          </div>
        `,
      };

      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);

      return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  },
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
