#!/usr/bin/env node

// Script to start Expo with proper environment variables to avoid network issues
const path = require('path');
const { spawn } = require('child_process');

// Set environment variables to avoid network/API issues
process.env.EXPO_NO_TELEMETRY = '1';
// Disable dependency version checks that cause "Body is unusable" errors
process.env.EXPO_NO_DEPENDENCY_CHECK = '1';

const projectRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

// Default to --no-dev-client if no mode specified
const expoArgs = ['expo', 'start', '--no-dev-client'];
if (args.length > 0) {
  expoArgs.push(...args);
} else {
  // Default to localhost to avoid network issues
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
    EXPO_NO_TELEMETRY: '1',
    EXPO_NO_DEPENDENCY_CHECK: '1',
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

