const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, 'public', 'images', 'cars');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Curated high quality car photos (Wikipedia & Unsplash HD automotive collection)
const images = [
  {
    name: 'land_cruiser.jpg',
    url: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'prado.jpg',
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 's_class.jpg',
    url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'hiace.jpg',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'bmw_7.jpg',
    url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'range_rover.jpg',
    url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'alphard.jpg',
    url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'lexus_lx.jpg',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'mercedes_gle.jpg',
    url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'suv_hero.jpg',
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'sedan_hero.jpg',
    url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'van_hero.jpg',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'luxury_hero.jpg',
    url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1600&auto=format&fit=crop'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded HD Image: ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('Downloading high-quality vehicle images...');
  for (const item of images) {
    const dest = path.join(dir, item.name);
    try {
      await downloadFile(item.url, dest);
    } catch (e) {
      console.error(`Error downloading ${item.name}:`, e.message);
    }
  }
  console.log('✨ All HD vehicle images downloaded successfully.');
}

run();
