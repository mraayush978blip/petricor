import fs from 'fs';

// Read environment variables
let SUPABASE_URL = process.env.VITE_SUPABASE_URL;
let SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Fallback to .env.local if not running in Vercel/CI
if (!SUPABASE_URL || !SUPABASE_KEY) {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        envFile.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1];
                const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                if (key === 'VITE_SUPABASE_URL') SUPABASE_URL = value;
                if (key === 'VITE_SUPABASE_ANON_KEY') SUPABASE_KEY = value;
            }
        });
    } catch (err) {
        console.error("Could not read .env.local and process.env is missing variables.");
    }
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials!");
    process.exit(1);
}

const BASE_URL = 'https://petricor.co.in';

async function generateSitemap() {
    console.log("Fetching products from Supabase...");
    
    let products = [];
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=slug`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    // Static pages
    const staticPages = [
        { loc: '/', priority: '1.0', changefreq: 'weekly' },
        { loc: '/products', priority: '0.8', changefreq: 'weekly' },
        { loc: '/about-us', priority: '0.7', changefreq: 'monthly' },
        { loc: '/contact-us', priority: '0.7', changefreq: 'monthly' },
        { loc: '/general-enquiry', priority: '0.6', changefreq: 'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add static pages
    for (const page of staticPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}${page.loc}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
    }

    // Add dynamic product pages
    if (products && products.length > 0) {
        console.log(`Adding ${products.length} products to sitemap...`);
        for (const product of products) {
            if (product.slug) {
                xml += `  <url>\n`;
                xml += `    <loc>${BASE_URL}/product/${product.slug}</loc>\n`;
                xml += `    <lastmod>${today}</lastmod>\n`;
                xml += `    <changefreq>weekly</changefreq>\n`;
                xml += `    <priority>0.9</priority>\n`;
                xml += `  </url>\n`;
            }
        }
    }

    xml += `</urlset>\n`;

    fs.writeFileSync('./public/sitemap.xml', xml, 'utf8');
    console.log("✅ Successfully generated public/sitemap.xml");
}

generateSitemap();
