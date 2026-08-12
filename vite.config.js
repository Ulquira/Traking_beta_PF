import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";
export default defineConfig({
    server: {
        host: true,
        cors: true,
        allowedHosts: true
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
