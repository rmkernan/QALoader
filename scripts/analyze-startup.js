/**
 * @file scripts/analyze-startup.js
 * @description Comprehensive startup analysis script that measures different phases
 * @created June 19, 2025. 4:35 PM Eastern Time
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Timing tracking
const timings = {
    scriptStart: Date.now(),
    backendStart: null,
    backendReady: null,
    frontendStart: null,
    frontendReady: null,
    firstBuild: null,
    totalComplete: null
};

const phases = [];

// Helper functions
const log = (message, type = 'info') => {
    const elapsed = ((Date.now() - timings.scriptStart) / 1000).toFixed(2);
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    
    const prefixes = {
        info: '[INFO]',
        phase: '[PHASE]',
        backend: '[BACKEND]',
        frontend: '[FRONTEND]',
        success: '[SUCCESS]',
        error: '[ERROR]',
        metric: '[METRIC]'
    };
    
    console.log(`${prefixes[type]} ${timestamp} +${elapsed}s ${message}`);
};

const recordPhase = (name, duration) => {
    phases.push({ name, duration });
    log(`${name}: ${duration}ms`, 'metric');
};

// Check environment
log('=== Q&A Loader Startup Analysis ===', 'phase');
log(`Platform: ${process.platform}`, 'info');
log(`Node.js: ${process.version}`, 'info');
log(`Working Directory: ${process.cwd()}`, 'info');

// Check if dependencies are installed
log('Checking dependencies...', 'phase');
const checkStart = Date.now();

try {
    // Check backend dependencies
    const backendReqs = path.join('backend', 'requirements.txt');
    if (fs.existsSync(backendReqs)) {
        const reqCount = fs.readFileSync(backendReqs, 'utf8').split('\n').filter(line => line.trim() && !line.startsWith('#')).length;
        log(`Backend: ${reqCount} Python packages required`, 'info');
    }
    
    // Check frontend dependencies
    const packageLock = 'package-lock.json';
    if (fs.existsSync(packageLock)) {
        const lockData = JSON.parse(fs.readFileSync(packageLock, 'utf8'));
        const depCount = Object.keys(lockData.packages || {}).length;
        log(`Frontend: ${depCount} npm packages installed`, 'info');
    }
    
    // Check node_modules size
    if (fs.existsSync('node_modules')) {
        const size = execSync('du -sh node_modules 2>/dev/null || echo "Unknown"').toString().trim().split('\t')[0];
        log(`node_modules size: ${size}`, 'info');
    }
} catch (e) {
    log(`Dependency check failed: ${e.message}`, 'error');
}

recordPhase('Dependency Check', Date.now() - checkStart);

// Start backend
log('\\nStarting Backend Server...', 'phase');
timings.backendStart = Date.now();

const isWindows = process.platform === 'win32';
const shell = isWindows ? 'cmd.exe' : '/bin/bash';
const shellFlag = isWindows ? '/c' : '-c';

const backendCmd = isWindows 
    ? 'cd backend && venv\\\\Scripts\\\\activate && python -m uvicorn app.main:app --reload --port 8000'
    : 'cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload --port 8000';

const backend = spawn(shell, [shellFlag, backendCmd], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env }
});

let backendOutput = '';
backend.stdout.on('data', (data) => {
    const output = data.toString();
    backendOutput += output;
    
    if (output.includes('Started server process')) {
        log('Uvicorn process started', 'backend');
    }
    if (output.includes('Waiting for application startup')) {
        log('Running FastAPI startup events...', 'backend');
    }
    if (output.includes('Application startup complete') && !timings.backendReady) {
        timings.backendReady = Date.now();
        const duration = timings.backendReady - timings.backendStart;
        recordPhase('Backend Startup', duration);
        log(`Backend ready! Total backend startup: ${(duration/1000).toFixed(2)}s`, 'success');
    }
    
    // Show detailed backend logs
    if (output.includes('[STARTUP]') || output.includes('[DATABASE]')) {
        process.stdout.write(output);
    }
});

backend.stderr.on('data', (data) => {
    process.stderr.write(`[BACKEND ERROR] ${data}`);
});

// Start frontend after a delay
setTimeout(() => {
    log('\\nStarting Frontend Server...', 'phase');
    timings.frontendStart = Date.now();
    
    const frontend = spawn('npm', ['run', 'dev'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
        env: { ...process.env }
    });
    
    let viteOutput = '';
    frontend.stdout.on('data', (data) => {
        const output = data.toString();
        viteOutput += output;
        
        if (output.includes('VITE v')) {
            log('Vite starting...', 'frontend');
        }
        
        if (output.includes('ready in') && !timings.frontendReady) {
            const readyMatch = output.match(/ready in (\\d+)ms/);
            if (readyMatch) {
                timings.firstBuild = parseInt(readyMatch[1]);
                recordPhase('Vite Initial Build', timings.firstBuild);
            }
            timings.frontendReady = Date.now();
            const duration = timings.frontendReady - timings.frontendStart;
            recordPhase('Frontend Startup', duration);
            log(`Frontend ready! Total frontend startup: ${(duration/1000).toFixed(2)}s`, 'success');
        }
        
        if (output.includes('Local:')) {
            timings.totalComplete = Date.now();
            const totalTime = timings.totalComplete - timings.scriptStart;
            
            // Print summary
            console.log('\\n' + '='.repeat(60));
            log('STARTUP ANALYSIS COMPLETE', 'success');
            console.log('='.repeat(60));
            
            console.log('\\n📊 Timing Summary:');
            phases.forEach(phase => {
                const seconds = (phase.duration / 1000).toFixed(2);
                const bar = '█'.repeat(Math.min(Math.round(phase.duration / 100), 50));
                console.log(`  ${phase.name.padEnd(25)} ${seconds.padStart(6)}s ${bar}`);
            });
            
            console.log(`\\n⏱️  Total Startup Time: ${(totalTime/1000).toFixed(2)} seconds`);
            
            // Provide recommendations
            console.log('\\n💡 Recommendations:');
            if (timings.firstBuild > 3000) {
                console.log('  - Frontend build is slow. Consider checking node_modules or clearing Vite cache');
            }
            if ((timings.backendReady - timings.backendStart) > 5000) {
                console.log('  - Backend startup is slow. Check database connection and Python imports');
            }
            
            console.log('\\n✅ Application is ready at http://localhost:3000\\n');
        }
        
        // Show all frontend output
        process.stdout.write(output);
    });
    
    frontend.stderr.on('data', (data) => {
        process.stderr.write(`[FRONTEND ERROR] ${data}`);
    });
    
    frontend.on('close', (code) => {
        log(`Frontend process exited with code ${code}`, code === 0 ? 'info' : 'error');
        backend.kill();
        process.exit(code);
    });
    
}, 2000);

// Cleanup
process.on('SIGINT', () => {
    console.log('\\n[WARN] Shutting down...');
    backend.kill();
    process.exit();
});

backend.on('close', (code) => {
    log(`Backend process exited with code ${code}`, code === 0 ? 'info' : 'error');
    if (!timings.totalComplete) {
        process.exit(code);
    }
});