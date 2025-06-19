/**
 * @file scripts/start-simple-logging.js
 * @description Simple startup script with basic logging (no external dependencies)
 * @created June 19, 2025. 3:56 PM Eastern Time
 */

const { spawn } = require('child_process');

// Timing helpers
const startTime = Date.now();
const log = (message, prefix = '[INFO]') => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`${prefix} ${timestamp} +${elapsed}s ${message}`);
};

// Environment setup
const isWindows = process.platform === 'win32';
const shell = isWindows ? 'cmd.exe' : '/bin/bash';
const shellFlag = isWindows ? '/c' : '-c';

log('Starting Q&A Loader application...');
log(`Platform: ${process.platform}, Shell: ${shell}`);

// Backend startup
log('Initializing backend server...', '[BACKEND]');
const backendCmd = isWindows 
    ? 'cd backend && venv\\Scripts\\activate && python -m uvicorn app.main:app --reload --port 8000'
    : 'cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload --port 8000';

const backend = spawn(shell, [shellFlag, backendCmd], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env }
});

let backendReady = false;

backend.stdout.on('data', (data) => {
    const output = data.toString();
    
    if (output.includes('Application startup complete')) {
        log('Backend ready! FastAPI is running on http://localhost:8000', '[SUCCESS]');
        backendReady = true;
    }
    
    process.stdout.write('[BACKEND] ' + output);
});

backend.stderr.on('data', (data) => {
    process.stderr.write('[BACKEND ERROR] ' + data.toString());
});

// Frontend startup (delayed to ensure backend is starting)
setTimeout(() => {
    log('Initializing frontend server...', '[FRONTEND]');
    
    const frontend = spawn('npm', ['run', 'dev'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
        env: { ...process.env }
    });
    
    let frontendReady = false;
    
    frontend.stdout.on('data', (data) => {
        const output = data.toString();
        
        if (output.includes('ready in')) {
            const readyMatch = output.match(/ready in (\d+)ms/);
            if (readyMatch) {
                log(`Frontend build completed in ${readyMatch[1]}ms`, '[SUCCESS]');
            }
            frontendReady = true;
        }
        if (output.includes('Local:')) {
            log('Frontend ready! Application available at http://localhost:3000', '[SUCCESS]');
            
            if (backendReady && frontendReady) {
                const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
                log(`Application fully started in ${totalTime} seconds`, '[SUCCESS]');
            }
        }
        
        process.stdout.write('[FRONTEND] ' + output);
    });
    
    frontend.stderr.on('data', (data) => {
        process.stderr.write('[FRONTEND ERROR] ' + data.toString());
    });
    
    frontend.on('close', (code) => {
        log(`Frontend process exited with code ${code}`, code === 0 ? '[INFO]' : '[ERROR]');
        backend.kill();
        process.exit(code);
    });
    
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
    log('Shutting down application...', '[WARN]');
    backend.kill();
    process.exit();
});

backend.on('close', (code) => {
    log(`Backend process exited with code ${code}`, code === 0 ? '[INFO]' : '[ERROR]');
    process.exit(code);
});