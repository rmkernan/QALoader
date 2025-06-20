import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';

/**
 * @function startupLoggingPlugin
 * @description Vite plugin that logs startup timing and progress to terminal
 * @created June 19, 2025. 4:35 PM Eastern Time
 */
function startupLoggingPlugin(): Plugin {
    const startTime = Date.now();
    let serverStartTime: number;
    
    const log = (message: string, type: 'info' | 'success' | 'warn' = 'info') => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        const prefix = {
            info: '\x1b[36m[FRONTEND]\x1b[0m',
            success: '\x1b[32m[FRONTEND]\x1b[0m',
            warn: '\x1b[33m[FRONTEND]\x1b[0m'
        };
        console.log(`${prefix[type]} +${elapsed}s ${message}`);
    };
    
    return {
        name: 'startup-logging',
        configResolved() {
            log('Vite configuration resolved');
        },
        buildStart() {
            log('Starting build process...');
        },
        configureServer(server) {
            serverStartTime = Date.now();
            log('Configuring dev server...');
            
            server.httpServer?.on('listening', () => {
                const serverTime = ((Date.now() - serverStartTime) / 1000).toFixed(2);
                log(`Dev server listening on port ${server.config.server.port} (+${serverTime}s from server start)`, 'success');
            });
            
            // Log when first request is received
            let firstRequest = true;
            server.middlewares.use((req, _res, next) => {
                if (firstRequest && req.url === '/') {
                    firstRequest = false;
                    log('First page request received', 'info');
                }
                next();
            });
        },
        transformIndexHtml() {
            log('Transforming index.html');
        },
        load(id) {
            if (id.endsWith('src/index.tsx')) {
                log('Loading application entry point (src/index.tsx)');
            }
            if (id.endsWith('src/App.tsx')) {
                log('Loading App component');
            }
        }
    };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    console.log('\n\x1b[36m[FRONTEND]\x1b[0m Starting Vite development server...');
    
    return {
      root: '.',
      build: {
        outDir: 'dist'
      },
      server: {
        port: 3000,
        open: false
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      plugins: [startupLoggingPlugin()]
    };
});
