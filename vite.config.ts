import { defineConfig }       from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve }            from 'node:path';
import { exec }               from 'node:child_process';
import vue                    from '@vitejs/plugin-vue';
import imagemin               from 'vite-plugin-imagemin';
import type { UserConfig }    from 'vite';

function clearCompiledViews() {
    return {
        name: 'clear views',
        closeBundle() {
            exec('php artisan view:clear');
        }
    }
}

function beepWhenDone() {
    return {
        name: 'beep when done',
        closeBundle() {
            process.stderr.write('\x07');
        }
    }
}

export default defineConfig(({ mode }) => {
    const config: UserConfig = {
        base: './',
        root: resolve('./resources/client'),
        build: {
            manifest: true,
            emptyOutDir: true,
            outDir: resolve('public', 'assets'),
            assetsInlineLimit: 0,
            minify: mode === 'production' ? 'terser' : false,
            rollupOptions: {
                input: './resources/client/app.ts',
                output: {
                    entryFileNames: '[name]-[hash:64].js',
                    chunkFileNames: '[name]-[hash:64].js',
                    assetFileNames: '[name]-[hash:64].[ext]',
                },
                plugins: [
                    clearCompiledViews(),
                    beepWhenDone()
                ]
            },
        },
        plugins: [
            vue()
        ],
        resolve: {
            alias: {
                '~': fileURLToPath(new URL('./resources/client', import.meta.url))
            }
        }
    };

    if (mode === 'production') {
        config.plugins!.push(imagemin({
            gifsicle: {
                optimizationLevel: 3,
            },
            mozjpeg: {
                quality: 100,
            },
            pngquant: {
                quality: [0.8, 1.0],
                speed: 3,
            },
            svgo: {
                plugins: [
                    {
                        name: 'removeViewBox',
                    },
                    {
                        name: 'removeEmptyAttrs',
                        active: false,
                    },
                ],
            },
        }));
    }

    return config;
});
