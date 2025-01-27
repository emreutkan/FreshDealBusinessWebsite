// index.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppWithMaps from './AppWithMaps';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppWithMaps />
    </StrictMode>
);