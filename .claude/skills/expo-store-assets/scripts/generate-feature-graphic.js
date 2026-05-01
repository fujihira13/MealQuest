/**
 * generate-feature-graphic.js
 *
 * Generates a 1024x500px feature graphic for Google Play Store using Gemini API.
 *
 * Prerequisites:
 *   npm install @google/genai dotenv
 *   GEMINI_API_KEY= in .env
 *   "type": "module" in package.json
 *
 * Usage:
 *   node scripts/generate-feature-graphic.js
 *
 * Customize the APP_* constants and PROMPT below before running.
 */

import { GoogleGenAI, Modality } from '@google/genai';
import { writeFileSync, mkdirSync } from 'fs';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

// ─── Customize these ────────────────────────────────────────────────────────
const APP_NAME = 'Your App Name';           // e.g. "交通費マネージャー"
const APP_TAGLINE = 'Your tagline here';    // e.g. "交通費をかんたんに記録・管理"
const BG_COLOR_LIGHT = '#E6F4FE';           // gradient start (left)
const BG_COLOR_DARK = '#0a7ea4';            // gradient end (right) — also icon bg
const OUTPUT_PATH = resolve(__dirname, '../image/feature-graphic.png');
const ASSETS_PATH = resolve(__dirname, '../mobile/assets/images/feature-graphic.png');
// ────────────────────────────────────────────────────────────────────────────

const PROMPT = `
Create a feature graphic banner for "${APP_NAME}" Android app.

Canvas: exactly 1024x500 pixels, landscape orientation.

Background: smooth horizontal gradient from ${BG_COLOR_LIGHT} on the left to ${BG_COLOR_DARK} on the right.

Left area (leftmost 40% of canvas, vertically centered):
  - A large rounded square (~180x180px) with solid ${BG_COLOR_DARK} fill and a white border (~4px)
  - Inside the rounded square: a white flat app icon symbol relevant to the app
  - The icon should be clean, flat design, pure white

Right area (rightmost 55% of canvas, vertically centered, left-aligned):
  - App name "${APP_NAME}" in large (52px) bold white sans-serif, top line
  - Tagline "${APP_TAGLINE}" in smaller (26px) white sans-serif, below app name

Style: flat design, clean, professional. No drop shadows, no complex textures.
Safe zone: keep all elements at least 40px from any edge.
`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateFeatureGraphic() {
  console.log('Generating feature graphic...');

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: PROMPT,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];

  for (const part of parts) {
    if (part.inlineData?.data) {
      const imageBuffer = Buffer.from(part.inlineData.data, 'base64');

      mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
      writeFileSync(OUTPUT_PATH, imageBuffer);
      console.log(`Saved: ${OUTPUT_PATH}`);

      try {
        mkdirSync(dirname(ASSETS_PATH), { recursive: true });
        writeFileSync(ASSETS_PATH, imageBuffer);
        console.log(`Saved: ${ASSETS_PATH}`);
      } catch {
        // ASSETS_PATH is optional — skip if mobile/ directory doesn't exist
      }
      return;
    }
  }

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  console.error('No image generated.', text ?? 'No response text.');
  process.exit(1);
}

generateFeatureGraphic().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
