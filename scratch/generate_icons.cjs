const Jimp = require('jimp');

async function generateIcons() {
    try {
        const image = await Jimp.read('./public/favicon.jpg');
        
        // Generate 192x192
        image.resize(192, 192)
             .write('./public/pwa-192x192.png');
             
        // Generate 512x512
        const imageLarge = await Jimp.read('./public/favicon.jpg');
        imageLarge.resize(512, 512)
                  .write('./public/pwa-512x512.png');
                  
        console.log('PWA Icons generated successfully!');
    } catch (err) {
        console.error('Error generating icons:', err);
    }
}

generateIcons();
