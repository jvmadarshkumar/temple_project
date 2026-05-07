const sharp = require('sharp');

async function processImg() {
  const imgPath = 'C:\\Users\\ADARSH KUMAR\\.gemini\\antigravity\\brain\\ec26ae37-0868-4dbf-9568-cf62ace63ee0\\media__1778187060882.png';
  const outPath = 'public\\ganesha-logo.png';
  
  try {
    const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
    
    const numChannels = info.channels;
    const newBuf = Buffer.alloc(info.width * info.height * 4);
    
    for (let i = 0; i < info.width * info.height; i++) {
      const r = data[i * numChannels + 0];
      const g = data[i * numChannels + 1];
      const b = data[i * numChannels + 2];
      let a = numChannels === 4 ? data[i * numChannels + 3] : 255;
      
      const avg = (r + g + b) / 3;
      if (avg > 240) {
        a = 0;
      } else if (avg > 150) {
        a = Math.max(0, 255 - ((avg - 150) * (255/100)));
      }
      
      newBuf[i * 4 + 0] = r;
      newBuf[i * 4 + 1] = g;
      newBuf[i * 4 + 2] = b;
      newBuf[i * 4 + 3] = Math.round(a);
    }
    
    await sharp(newBuf, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .resize(300) // scale it down a bit for optimized web usage
    .png()
    .toFile(outPath);
    
    console.log('Successfully saved transparent logo to public/ganesha-logo.png');
  } catch(e) {
    console.error('Error:', e);
  }
}
processImg();
