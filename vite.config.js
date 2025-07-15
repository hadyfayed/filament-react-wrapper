import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import filamentReact from '../vite-plugin-filament-react';

// Standalone Vite config for React Wrapper package
export default defineConfig({
    plugins: [
        // React plugin for compilation and Fast Refresh
        react({
            include: "**/*.{jsx,tsx}"
        }),
        
        // TypeScript definitions
        dts({
            insertTypesEntry: true,
            outputDir: 'dist/react-wrapper/types',
            tsConfigFilePath: 'tsconfig.json'
        }),
        
        // Filament React plugin for auto-discovery and integration
        filamentReact({
            discovery: {
                packagePaths: ['resources/js'],
                composer: {
                    enabled: false // Disable for individual package builds
                }
            },
            php: {
                generateRegistry: true,
                registryPath: 'dist/react-wrapper/php/ComponentRegistry.php',
                namespace: 'HadyFayed\\ReactWrapper\\Generated'
            },
            devTools: {
                componentInspector: true,
                stateDebugger: true,
                performanceMonitor: true
            },
            dualBuild: {
                enabled: true
            }
        })
    ],
    build: {
        lib: {
            entry: {
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
        outDir: 'dist/react-wrapper',
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