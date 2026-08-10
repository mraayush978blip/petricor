export default async function handler(req, res) {
  // Extract Supabase credentials from Vercel's environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      status: 'error', 
      message: 'Supabase credentials are not set in the environment variables.' 
    });
  }

  try {
    // Perform a very lightweight REST API call to Supabase.
    // This officially registers as "API Activity" in Supabase and prevents the project from being auto-paused.
    const response = await fetch(`${supabaseUrl}/rest/v1/products?limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase responded with status: ${response.status}`);
    }
    
    return res.status(200).json({ 
      status: 'success', 
      message: 'Successfully pinged Supabase to prevent project from pausing!', 
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Keepalive Ping Failed:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
