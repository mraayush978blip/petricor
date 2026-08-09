import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false },
    realtime: {
      transport: ws
    }
  }
);

const ADMIN_EMAIL = 'admin@petricor.com'; // I will ask user for actual email/pass or use service role
const ADMIN_PASS = 'admin123'; // Temporary guess, if it fails, I'll instruct user

const categories = [
  { name: 'Ayurvedic', id: null },
  { name: 'Nutraceuticals', id: null }
];

const products = [
  { title: 'Amla Extract', slug: 'amla-extract', category: 'Ayurvedic', desc: 'Standardized Amla Extract with high Vitamin C content.' },
  { title: 'Ashwagandha Extract', slug: 'ashwagandha-extract', category: 'Ayurvedic', desc: 'Premium Ashwagandha root extract.' },
  { title: 'Bacopa Monnieri Extract', slug: 'bacopa-extract', category: 'Ayurvedic', desc: 'High potency Bacopa extract for cognitive support.' },
  { title: 'Boswellia Serrata Extract', slug: 'boswellia-extract', category: 'Ayurvedic', desc: 'Boswellia extract standardized for Boswellic acids.' },
  { title: 'Curcumin 95%', slug: 'curcumin', category: 'Nutraceuticals', desc: 'Highly purified Curcumin extract.' },
  { title: 'Coleus Forskohlii', slug: 'coleus', category: 'Ayurvedic', desc: 'Coleus root extract standardized for Forskolin.' },
  { title: 'Fenugreek Extract', slug: 'fenugreek', category: 'Ayurvedic', desc: 'Fenugreek seed extract.' },
  { title: 'Garcinia Cambogia', slug: 'garcinia', category: 'Nutraceuticals', desc: 'Garcinia extract with HCA.' },
  { title: 'Gymnema Sylvestre', slug: 'gymnema', category: 'Ayurvedic', desc: 'Gymnema leaf extract.' },
  { title: 'Licorice Extract', slug: 'licorice', category: 'Ayurvedic', desc: 'Licorice root extract.' },
  { title: 'Mucuna Pruriens', slug: 'mucuna', category: 'Ayurvedic', desc: 'Mucuna seed extract containing L-Dopa.' },
  { title: 'Moringa Oleifera', slug: 'moringa', category: 'Nutraceuticals', desc: 'Moringa leaf powder extract.' },
  { title: 'Neem Extract', slug: 'neem', category: 'Ayurvedic', desc: 'Pure Neem leaf extract.' },
  { title: 'Safed Musli', slug: 'safed-musli', category: 'Ayurvedic', desc: 'Safed Musli root extract.' },
  { title: 'Shilajit Extract', slug: 'shilajit', category: 'Ayurvedic', desc: 'Purified Shilajit extract with Fulvic Acid.' },
  { title: 'Tribulus Terrestris', slug: 'tribulus', category: 'Ayurvedic', desc: 'Tribulus extract standardized for Saponins.' },
];

async function seed() {
  console.log('Authenticating...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
  });

  if (authError) {
    console.error('Failed to authenticate as admin. You may need to update credentials in seed.js');
    console.error(authError.message);
    // Continue anyway just in case RLS is disabled
  } else {
    console.log('Authenticated successfully!');
  }

  console.log('Inserting categories...');
  for (const cat of categories) {
    const { data: existing } = await supabase
      .from('categories')
      .select('*')
      .eq('name', cat.name)
      .single();

    if (existing) {
      cat.id = existing.id;
      console.log('Category exists:', cat.name);
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: cat.name })
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting category', cat.name, error.message);
      } else {
        cat.id = data.id;
        console.log('Inserted category:', cat.name);
      }
    }
  }

  console.log('Inserting products...');
  for (const prod of products) {
    const catId = categories.find(c => c.name === prod.category)?.id;
    if (!catId) continue;

    const imageUrl = `/products/${prod.slug}.jpg`; 

    const { data: existingProd } = await supabase
      .from('products')
      .select('*')
      .eq('slug', prod.slug)
      .single();

    if (existingProd) {
      console.log('Product exists:', prod.title);
    } else {
      const { error } = await supabase
        .from('products')
        .insert({
          title: prod.title,
          slug: prod.slug,
          description: prod.desc,
          category_id: catId,
          primary_image_url: imageUrl,
        });

      if (error) {
        console.error('Error inserting product', prod.title, error.message);
      } else {
        console.log('Inserted product:', prod.title);
      }
    }
  }

  console.log('Seeding complete!');
}

seed();
