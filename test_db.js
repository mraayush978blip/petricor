import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function run() {
  const { data } = await supabase.from('enquiries').select('message, phone, type').order('created_at', { ascending: false }).limit(5)
  console.log(JSON.stringify(data, null, 2))
}
run()
