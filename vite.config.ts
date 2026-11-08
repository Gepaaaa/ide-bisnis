import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, type Plugin } from 'vite';

function savePhotosPlugin(): Plugin {
  return {
    name: 'save-photos-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-photos', (req, res, next) => {
        if (req.method !== 'POST') {
          return next();
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk) => {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        });

        req.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            const data = JSON.parse(rawBody);
            const photosDir = path.resolve(__dirname, 'public/assets/photos');
            if (!fs.existsSync(photosDir)) {
              await fs.promises.mkdir(photosDir, { recursive: true });
            }

            let savedCount = 0;
            const savedDetails: Array<{ id: string; filename: string }> = [];

            const saveBase64Image = async (base64Str: string, baseFilename: string) => {
              if (!base64Str || typeof base64Str !== 'string') return null;
              const match = base64Str.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
              if (!match) return null;
              const buffer = Buffer.from(match[2], 'base64');
              const filename = `${baseFilename}.jpg`;
              const filePath = path.join(photosDir, filename);
              await fs.promises.writeFile(filePath, buffer);
              return `/assets/photos/${filename}`;
            };

            // Save photos in gallery (1..16)
            if (Array.isArray(data.photos)) {
              for (let i = 0; i < data.photos.length; i++) {
                const item = data.photos[i];
                const slotNum = item.slot || i + 1;
                if (typeof item.src === 'string' && item.src.startsWith('data:image/')) {
                  const savedSrc = await saveBase64Image(item.src, `foto${slotNum}`);
                  if (savedSrc) {
                    savedCount++;
                    savedDetails.push({ id: item.id || `photo-${slotNum}`, filename: `foto${slotNum}.jpg` });
                  }
                }
              }
            }

            // Save Chapter 5 special photo
            if (
              data.chapter5Photo &&
              typeof data.chapter5Photo.src === 'string' &&
              data.chapter5Photo.src.startsWith('data:image/')
            ) {
              const savedSrc = await saveBase64Image(data.chapter5Photo.src, 'chapter5');
              if (savedSrc) {
                savedCount++;
                savedDetails.push({ id: 'photo-chapter-5', filename: 'chapter5.jpg' });
              }
            }

            // Save Ending special photo
            if (
              data.endingPhoto &&
              typeof data.endingPhoto.src === 'string' &&
              data.endingPhoto.src.startsWith('data:image/')
            ) {
              const savedSrc = await saveBase64Image(data.endingPhoto.src, 'ending');
              if (savedSrc) {
                savedCount++;
                savedDetails.push({ id: 'photo-ending', filename: 'ending.jpg' });
              }
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                success: true,
                savedCount,
                savedDetails,
                message: `Berhasil mematenkan ${savedCount} foto ke /public/assets/photos/!`,
              })
            );
          } catch (err: any) {
            console.error('Error saving photos:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });

      // Endpoint for saving a single photo immediately on upload (fast, lightweight, quota-safe)
      server.middlewares.use('/api/save-single-photo', (req, res, next) => {
        if (req.method !== 'POST') return next();

        const chunks: Buffer[] = [];
        req.on('data', (chunk) => {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        });

        req.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            const data = JSON.parse(rawBody);
            const photosDir = path.resolve(__dirname, 'public/assets/photos');
            if (!fs.existsSync(photosDir)) {
              await fs.promises.mkdir(photosDir, { recursive: true });
            }

            let filename = '';
            if (data.type === 'chapter5' || data.id === 'photo-chapter-5' || data.slot === 17) {
              filename = 'chapter5.jpg';
            } else if (data.type === 'ending' || data.id === 'photo-ending' || data.slot === 18) {
              filename = 'ending.jpg';
            } else {
              const slot = data.slot || 1;
              filename = `foto${slot}.jpg`;
            }

            if (!data.src || typeof data.src !== 'string') {
              throw new Error('Data src gambar tidak valid');
            }

            const match = data.src.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
            if (!match) {
              throw new Error('Format gambar harus berupa data:image/... base64');
            }

            const buffer = Buffer.from(match[2], 'base64');
            const filePath = path.join(photosDir, filename);
            await fs.promises.writeFile(filePath, buffer);

            const timestamp = Date.now();
            const savedUrl = `/assets/photos/${filename}?t=${timestamp}`;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                success: true,
                filename,
                url: savedUrl,
                message: `Foto ${filename} berhasil disimpan ke disk!`,
              })
            );
          } catch (err: any) {
            console.error('Error saving single photo:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), savePhotosPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
