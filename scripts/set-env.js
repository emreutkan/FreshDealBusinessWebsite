import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const googleMapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || '';

const envConfig = {
    VITE_GOOGLE_MAPS_API_KEY: googleMapsApiKey
};

writeFileSync(
    resolve(__dirname, '../dist/env-config.js'),
    `window.__env = ${JSON.stringify(envConfig)};`
);

console.log('Runtime environment configured');