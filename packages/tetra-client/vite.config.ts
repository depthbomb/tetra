import { defineConfig }       from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve }            from 'node:path';
import vue                    from '@vitejs/plugin-vue';
import imagemin               from 'vite-plugin-imagemin';
import type { UserConfig }    from 'vite';

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
        root: resolve('./src'),
        build: {
            manifest: true,
            emptyOutDir: true,
            outDir: resolve('./dist'),
            assetsInlineLimit: 0,
            minify: mode === 'production' ? 'terser' : false,
            rollupOptions: {
                input: resolve('./src/app.ts'),
                output: {
                    entryFileNames: '[name]-[hash:64].js',
                    chunkFileNames: '[name]-[hash:64].js',
                    assetFileNames: '[name]-[hash:64].[ext]',
                },
                plugins: [
                    beepWhenDone()
                ]
            },
        },
        plugins: [
            vue()
        ],
        resolve: {
            alias: {
                '~': fileURLToPath(new URL('./src', import.meta.url))
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
