/**
 * Development script to start both the proxy server and web app together
 * Usage: node start-web-dev.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
};

// Check if the proxy server file exists
const proxyServerPath = path.join(__dirname, 'proxyServer.js');
if (!fs.existsSync(proxyServerPath)) {
  console.error(`${colors.red}${colors.bright}Error: proxyServer.js not found!${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.bright}${colors.cyan}Starting development environment...${colors.reset}\n`);

// Start the proxy server
console.log(`${colors.yellow}Starting proxy server...${colors.reset}`);
const proxyServer = spawn('node', ['proxyServer.js'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: false
});

let proxyServerReady = false;

// Handle proxy server output
proxyServer.stdout.on('data', (data) => {
  const output = data.toString().trim();
  console.log(`${colors.dim}[Proxy] ${colors.reset}${output}`);
  
  // Check if the proxy server is ready
  if (output.includes('Proxy server running on port')) {
    proxyServerReady = true;
    startWebApp();
  }
});

proxyServer.stderr.on('data', (data) => {
  console.error(`${colors.red}[Proxy Error] ${colors.reset}${data.toString().trim()}`);
});

// Handle proxy server exit
proxyServer.on('close', (code) => {
  if (code !== 0 && !shuttingDown) {
    console.error(`${colors.red}${colors.bright}Proxy server exited with code ${code}${colors.reset}`);
  }
});

let webApp = null;
let shuttingDown = false;

// Start the web app
function startWebApp() {
  console.log(`\n${colors.green}${colors.bright}Proxy server is running!${colors.reset}`);
  console.log(`${colors.yellow}Starting web app...${colors.reset}\n`);
  
  // Determine the appropriate start command based on package manager
  const hasYarn = fs.existsSync(path.join(__dirname, 'yarn.lock'));
  const command = hasYarn ? 'yarn' : 'npm';
  const args = hasYarn ? ['web'] : ['run', 'web'];
  
  webApp = spawn(command, args, {
    stdio: 'inherit',
    detached: false,
    shell: true // Use shell to ensure proper environment variables
  });
  
  webApp.on('error', (err) => {
    console.error(`${colors.red}${colors.bright}Failed to start web app: ${err.message}${colors.reset}`);
  });
  
  webApp.on('close', (code) => {
    if (!shuttingDown) {
      console.log(`\n${colors.yellow}Web app exited with code ${code}${colors.reset}`);
      
      // Don't shut down automatically if the web app exits
      // This allows the proxy server to keep running
      console.log(`${colors.yellow}Web app has exited, but proxy server is still running.${colors.reset}`);
      console.log(`${colors.yellow}You can restart the web app manually with 'npm run web' in another terminal.${colors.reset}`);
      console.log(`${colors.yellow}Press Ctrl+C to shut down the proxy server.${colors.reset}`);
    }
  });
  
  // Display helpful information
  console.log(`${colors.bgBlue}${colors.white}${colors.bright} Development Environment Ready ${colors.reset}`);
  console.log(`${colors.cyan}• Proxy server: ${colors.bright}http://localhost:3000${colors.reset}`);
  console.log(`${colors.cyan}• Available endpoints:${colors.reset}`);
  console.log(`  ${colors.dim}- GET /api/stoic-quote${colors.reset}`);
  console.log(`  ${colors.dim}- GET /api/yahoo-finance/:symbol${colors.reset}`);
  console.log(`  ${colors.dim}- GET /api/ping${colors.reset}`);
  console.log(`\n${colors.dim}Press Ctrl+C to stop all servers${colors.reset}\n`);
}

// Set a timeout in case the proxy server doesn't start properly
const timeout = setTimeout(() => {
  if (!proxyServerReady) {
    console.error(`${colors.red}${colors.bright}Timeout waiting for proxy server to start${colors.reset}`);
    console.log(`${colors.yellow}Starting web app anyway...${colors.reset}`);
    startWebApp();
  }
}, 5000);

// Clean shutdown function
function shutDown() {
  if (shuttingDown) return;
  shuttingDown = true;
  
  console.log(`\n${colors.yellow}Shutting down...${colors.reset}`);
  
  clearTimeout(timeout);
  
  // Kill the proxy server
  if (proxyServer && !proxyServer.killed) {
    proxyServer.kill();
  }
  
  // Kill the web app if it's still running
  if (webApp && !webApp.killed) {
    webApp.kill();
  }
  
  console.log(`${colors.green}${colors.bright}All processes terminated.${colors.reset}`);
  process.exit(0);
}

// Handle process termination
process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
process.on('exit', shutDown);
