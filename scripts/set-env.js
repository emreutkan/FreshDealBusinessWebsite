const fs = require('fs');
const path = require('path');

const googleMapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || '';

const envConfig = {
    VITE_GOOGLE_MAPS_API_KEY: googleMapsApiKey
};

fs.writeFileSync(
    path.resolve(__dirname, '../dist/env-config.js'),
    `window.__env = ${JSON.stringify(envConfig)};`
);

console.log('Runtime environment configured');