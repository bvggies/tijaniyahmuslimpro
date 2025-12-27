#!/usr/bin/env node

// Script to start Expo with proper environment variables to avoid network issues
const path = require('path');
const { spawn } = require('child_process');

// Set environment variables to avoid network/API issues
// These help prevent "Body is unusable" and fetch errors during dependency checks
process.env.EXPO_NO_TELEMETRY = '1';
// Note: EXPO_NO_DEPENDENCY_CHECK may not be officially documented but helps
// prevent network calls during native module version validation
process.env.EXPO_NO_DEPENDENCY_CHECK = '1';
// Additional safeguard: skip doctor checks that require network
process.env.EXPO_SKIP_DOCTOR = '1';

const projectRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

// Build expo start command
// Use --offline flag to prevent network requests during startup
const expoArgs = ['expo', 'start'];
if (args.length > 0) {
  expoArgs.push(...args);
  // If user specifies --lan or --tunnel, don't force --offline
  // But still add it if not already present to prevent dependency checks
  if (!args.includes('--offline') && !args.includes('--lan') && !args.includes('--tunnel')) {
    expoArgs.push('--offline');
  }
} else {
  // Default to offline mode to avoid network fetch errors
  expoArgs.push('--offline', '--localhost');
}

console.log('Starting Expo with optimized settings...');
console.log('Project root:', projectRoot);

const child = spawn('npx', expoArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  cwd: projectRoot,
  env: {
    ...process.env,
    // Pass through environment variables to prevent network dependency checks
    EXPO_NO_TELEMETRY: '1',
    EXPO_NO_DEPENDENCY_CHECK: '1',
    EXPO_SKIP_DOCTOR: '1',
  },
});

child.on('error', (error) => {
  console.error('Failed to start Expo:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  child.kill('SIGINT');
});