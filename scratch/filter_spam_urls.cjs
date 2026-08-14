const fs = require('fs');

const inputCsv = '/home/aayush/Downloads/https___petricor.co (2).in_-Coverage-Valid-2026-08-13/Table.csv';
const outputCsv = '/home/aayush/Downloads/spam_urls_to_remove.csv';

const rawData = fs.readFileSync(inputCsv, 'utf-8');
const lines = rawData.split('\n').filter(line => line.trim() !== '');

const validPrefixes = [
  'https://petricor.co.in/product/',
  'https://petricor.co.in/products/',
  'https://petricor.co.in/ad/'
];

const validExact = [
  'https://petricor.co.in/',
  'https://petricor.co.in/about-us/',
  'https://petricor.co.in/contact-us/',
  'https://petricor.co.in/general-enquiry/'
];

const spamUrls = [];

for (let i = 1; i < lines.length; i++) { // Skip header
  const parts = lines[i].split(',');
  const url = parts[0].trim();
  
  if (!url) continue;

  let isValid = false;

  // Check exact matches
  if (validExact.includes(url)) {
    isValid = true;
  }

  // Check prefixes
  for (const prefix of validPrefixes) {
    if (url.startsWith(prefix)) {
      isValid = true;
      break;
    }
  }

  if (!isValid) {
    spamUrls.push(url);
  }
}

// Write the new CSV (Google bulk removal extensions usually just need a list of URLs, 
// but we'll include a simple header just in case)
let outputData = 'URL\n' + spamUrls.join('\n');
fs.writeFileSync(outputCsv, outputData, 'utf-8');

console.log(`Successfully filtered URLs. Found ${spamUrls.length} spam/dead URLs to remove.`);
