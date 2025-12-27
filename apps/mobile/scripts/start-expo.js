#!/usr/bin/env node

// Script to start Expo with proper environment variables to avoid network issues
const path = require('path');
const { spawn } = require('child_process');

// Set environment variables to avoid network/API issues
process.env.EXPO_NO_TELEMETRY = '1';

const projectRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

// Build expo start command
const expoArgs = ['expo', 'start'];
if (args.length > 0) {
  expoArgs.push(...args);
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
    EXPO_NO_TELEMETRY: '1',
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

