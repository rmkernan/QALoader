/**
 * @file scripts/start-with-logging.js
 * @description Enhanced startup script with detailed logging to track initialization time
 * @created June 19, 2025. 3:56 PM Eastern Time
 * 
 * @architectural-context
 * Layer: Development tooling
 * Dependencies: child_process, chalk (for colored output)
 * Pattern: Process monitoring and logging
 * 
 * @workflow-context
 * User Journey: Development startup with performance tracking
 * Sequence Position: Replaces npm start for debugging slow startup
 * Inputs: None
 * Outputs: Timestamped logs showing startup progress
 */

const { spawn } = require('child_process');
const chalk = require('chalk');

// Timing helpers
const startTime = Date.now();
const log = (message, type = 'info') => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    
    const prefix = {
        info: chalk.blue('[INFO]'),
        success: chalk.green('[SUCCESS]'),
        error: chalk.red('[ERROR]'),
        warn: chalk.yellow('[WARN]'),
        backend: chalk.magenta('[BACKEND]'),
        frontend: chalk.cyan('[FRONTEND]')
    };
    
    console.log(`${prefix[type]} ${timestamp} +${elapsed}s ${message}`);
};

// Environment setup
const isWindows = process.platform === 'win32';
const shell = isWindows ? 'cmd.exe' : '/bin/bash';
const shellFlag = isWindows ? '/c' : '-c';

log('Starting Q&A Loader application...');
log(`Platform: ${process.platform}, Shell: ${shell}`);

// Backend startup
log('Initializing backend server...', 'backend');
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
    
    // Track specific startup milestones
    if (output.includes('Started server process')) {
        log('FastAPI process started', 'backend');
    }
    if (output.includes('Waiting for application startup')) {
        log('Running startup events...', 'backend');
    }
    if (output.includes('Application startup complete')) {
        log('Backend ready! FastAPI is running on http://localhost:8000', 'success');
        backendReady = true;
    }
    if (output.includes('Uvicorn running on')) {
        log('Uvicorn server listening', 'backend');
    }
    
    // Log database connection events
    if (output.includes('Supabase')) {
        log('Connecting to Supabase database...', 'backend');
    }
    
    // Show the output
    process.stdout.write(chalk.magenta('[BACKEND] ') + output);
});

backend.stderr.on('data', (data) => {
    process.stderr.write(chalk.red('[BACKEND ERROR] ') + data.toString());
});

// Frontend startup (delayed to ensure backend is starting)
setTimeout(() => {
    log('Initializing frontend server...', 'frontend');
    
    const frontend = spawn('npm', ['run', 'dev'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
        env: { ...process.env }
    });
    
    let frontendReady = false;
    
    frontend.stdout.on('data', (data) => {
        const output = data.toString();
        
        // Track Vite startup milestones
        if (output.includes('VITE')) {
            log('Vite build tool starting...', 'frontend');
        }
        if (output.includes('dev server running at')) {
            log('Vite dev server started', 'frontend');
        }
        if (output.includes('ready in')) {
            const readyMatch = output.match(/ready in (\d+)ms/);
            if (readyMatch) {
                log(`Frontend build completed in ${readyMatch[1]}ms`, 'success');
            }
            frontendReady = true;
        }
        if (output.includes('Local:')) {
            log('Frontend ready! Application available at http://localhost:3000', 'success');
            
            // Summary when both are ready
            if (backendReady && frontendReady) {
                const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
                log(`\\n✨ Application fully started in ${totalTime} seconds\\n`, 'success');
            }
        }
        
        // Show the output
        process.stdout.write(chalk.cyan('[FRONTEND] ') + output);
    });
    
    frontend.stderr.on('data', (data) => {
        process.stderr.write(chalk.red('[FRONTEND ERROR] ') + data.toString());
    });
    
    frontend.on('close', (code) => {
        log(`Frontend process exited with code ${code}`, code === 0 ? 'info' : 'error');
        process.exit(code);
    });
    
}, 2000); // 2 second delay to stagger startup

// Handle process termination
process.on('SIGINT', () => {
    log('\\nShutting down application...', 'warn');
    backend.kill();
    process.exit();
});

backend.on('close', (code) => {
    log(`Backend process exited with code ${code}`, code === 0 ? 'info' : 'error');
    process.exit(code);
});