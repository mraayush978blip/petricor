import { Jimp } from 'jimp';

async function generateIcons() {
    try {
        const image192 = await Jimp.read('./public/favicon.jpg');
        image192.resize({ w: 192, h: 192 });
        await image192.write('./public/pwa-192x192.png');
        
        const image512 = await Jimp.read('./public/favicon.jpg');
        image512.resize({ w: 512, h: 512 });
        await image512.write('./public/pwa-512x512.png');
                  
        console.log('PWA Icons generated successfully!');
    } catch (err) {
        console.error('Error generating icons:', err);
    }
}

generateIcons();
