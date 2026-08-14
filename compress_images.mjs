import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Load env vars
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

import ws from 'ws';
globalThis.WebSocket = ws;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadToSupabase(buffer, fileName) {
  // Use upsert to overwrite if exists, though uuid should be unique
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(`products/${fileName}`, buffer, {
      contentType: 'image/webp',
      upsert: true
    });

  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(`products/${fileName}`);
    
  return urlData.publicUrl;
}

async function processImage(url, prefix) {
  if (!url) return null;
  // If it's already a .webp we just processed or already optimized, we might skip, but let's process anyway to ensure sizing/quality.
  console.log(`Downloading ${url}...`);
  const imageBuffer = await downloadImage(url);
  
  console.log(`Compressing to WebP...`);
  const webpBuffer = await sharp(imageBuffer)
    .resize({ width: 1200, withoutEnlargement: true }) // ensure it doesn't exceed 1200px wide
    .webp({ quality: 85, effort: 6 }) // effort 6 gives better compression
    .toBuffer();
    
  console.log(`Original size: ${(imageBuffer.length / 1024).toFixed(1)} KB -> New size: ${(webpBuffer.length / 1024).toFixed(1)} KB`);
  
  const newFileName = `${prefix}-${Date.now()}.webp`;
  console.log(`Uploading as ${newFileName}...`);
  const newUrl = await uploadToSupabase(webpBuffer, newFileName);
  return newUrl;
}

async function main() {
  console.log("Fetching all products...");
  const { data: products, error } = await supabase.from('products').select('*');
  
  if (error) {
    console.error("Failed to fetch products:", error);
    process.exit(1);
  }
  
  console.log(`Found ${products.length} products. Beginning compression...`);
  
  for (const product of products) {
    console.log(`\n--- Processing Product: ${product.title} ---`);
    let updates = {};
    
    if (product.primary_image_url && !product.primary_image_url.endsWith('.webp')) {
      try {
        const newUrl = await processImage(product.primary_image_url, `primary-${product.slug}`);
        if (newUrl) updates.primary_image_url = newUrl;
      } catch (err) {
        console.error(`Error processing primary image for ${product.title}:`, err.message);
      }
    } else if (product.primary_image_url) {
      console.log("Primary image is already WebP, skipping.");
    }
    
    if (product.hover_image_url && !product.hover_image_url.endsWith('.webp')) {
      try {
        const newUrl = await processImage(product.hover_image_url, `hover-${product.slug}`);
        if (newUrl) updates.hover_image_url = newUrl;
      } catch (err) {
        console.error(`Error processing hover image for ${product.title}:`, err.message);
      }
    } else if (product.hover_image_url) {
      console.log("Hover image is already WebP, skipping.");
    }
    
    if (Object.keys(updates).length > 0) {
      console.log(`Updating database for ${product.title}...`);
      const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product.id);
        
      if (updateError) {
        console.error(`Failed to update DB for ${product.title}:`, updateError);
      } else {
        console.log(`Successfully updated ${product.title}!`);
      }
    } else {
      console.log(`No updates needed for ${product.title}.`);
    }
  }
  
  console.log("\nAll products processed successfully!");
}

main().catch(console.error);
