import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// Standalone Vite config for React Wrapper package
export default defineConfig({
    plugins: [
        react({
            include: "**/*.{jsx,tsx}",
            babel: {
                plugins: ['@babel/plugin-transform-runtime'],
                presets: [['@babel/preset-env', { targets: 'defaults' }], '@babel/preset-typescript']
            }
        }),
        dts({
            insertTypesEntry: true,
            outputDir: 'dist/types',
            tsConfigFilePath: 'tsconfig.json'
        })
    ],
    build: {
        lib: {
            entry: {
                'bootstrap': resolve(__dirname, 'resources/js/bootstrap.tsx'),
                'core': resolve(__dirname, 'resources/js/core.tsx'),
                'index': resolve(__dirname, 'resources/js/index.tsx'),
            },
            formats: ['es'],
            fileName: (format, entryName) => `${entryName}.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM'
                },
                manualChunks: {
                    'state-management': ['./resources/js/components/StateManager.tsx'],
                    'component-system': ['./resources/js/components/ReactComponentRegistry.tsx']
                },
                chunkFileNames: 'chunks/[name]-[hash].js',
                minifyInternalExports: true
            }
        },
        outDir: 'dist',
        sourcemap: true,
        target: 'esnext',
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: !process.env.VITE_DEBUG,
                drop_debugger: !process.env.VITE_DEBUG
            }
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
        },
    },
});