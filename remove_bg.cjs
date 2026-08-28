const { Jimp } = require('jimp');
const path = require('path');

const files = [
  'ustadz-mascot.png',
  'ustadz-avatar.png',
  'student-boy.png',
  'student-girl.png'
];

async function removeBackground() {
  for (const file of files) {
    const filePath = path.join('d:/si-karakter/public/images/dashboard', file);
    try {
      const image = await Jimp.read(filePath);
      
      const tolerance = 20; // catch off-white
      
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];

        // if pixel is very close to white, make transparent
        if (r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance) {
          this.bitmap.data[idx + 3] = 0; // alpha to 0
        }
      });

      await image.write(filePath);
      console.log(`Processed ${file}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

removeBackground();
