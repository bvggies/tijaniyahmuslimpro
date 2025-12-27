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
// Note: Expo only allows one of: --offline, --host, --tunnel, --lan, --localhost
const expoArgs = ['expo', 'start'];
if (args.length > 0) {
  // User provided flags - use them as-is
  expoArgs.push(...args);
} else {
  // Default to localhost mode - allows Expo Go to connect while still working locally
  // Environment variables (EXPO_NO_DEPENDENCY_CHECK) prevent network dependency checks
  expoArgs.push('--localhost');
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
