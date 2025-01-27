/// <reference types="vite/client" />

// src/vite-env.d.ts
interface ImportMetaEnv {
    readonly VITE_GOOGLE_MAPS_API_KEY: string
    // Add other env variables here
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}