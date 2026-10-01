import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiDetectPlugin(): Plugin {
  return {
    name: 'api-detect-plugin',
    configureServer(server) {
      server.middlewares.use('/api/detect', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { imageBase64, mimeType = 'image/jpeg' } = JSON.parse(body || '{}');
            if (!imageBase64) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing imageBase64' }));
              return;
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ fallback: true, reason: 'No GEMINI_API_KEY in environment' }));
              return;
            }

            // Attempt vision inference with short timeout to prevent blocking if quota is exhausted
            try {
              const { GoogleGenAI } = await import('@google/genai');
              const ai = new GoogleGenAI();

              const prompt = `Detect vehicles (car, motorcycle, bus, truck, bicycle) and other objects (person, dog) in this image. Return JSON:
{
  "has_vehicles": boolean,
  "scene_description": string,
  "other_objects": string[],
  "detections": [
    { "label": "car"|"motorcycle"|"bus"|"truck"|"bicycle"|"person"|"dog", "confidence": number, "box_2d": [ymin, xmin, ymax, xmax] }
  ]
}`;

              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 6000);

              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        inlineData: {
                          mimeType,
                          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
                        },
                      },
                      { text: prompt },
                    ],
                  },
                ],
                config: {
                  responseMimeType: 'application/json',
                },
              });

              clearTimeout(timeout);
              const parsed = JSON.parse(response.text || '{}');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, result: parsed }));
            } catch (apiErr: any) {
              // Graceful fallback to client-side trained detector
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ fallback: true, reason: apiErr?.message || 'Quota or timeout' }));
            }
          } catch (err: any) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ fallback: true, error: err?.message }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDetectPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
