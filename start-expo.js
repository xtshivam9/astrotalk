#!/usr/bin/env node

// Custom Expo start script to handle Node.js v22 compatibility issues
const { spawn } = require('child_process');
const path = require('path');

// Set Node.js options for compatibility
process.env.NODE_OPTIONS = '--experimental-loader ts-node/esm --experimental-specifier-resolution=node --no-warnings';

// Alternative approach: use --loader instead of --experimental-loader for newer Node versions
if (process.version.startsWith('v22')) {
  process.env.NODE_OPTIONS = '--loader ts-node/esm --experimental-specifier-resolution=node --no-warnings';
}

// Start Expo with the correct environment
const expoPath = path.join(__dirname, 'node_modules', '.bin', 'expo');
const args = ['start', '--clear', ...process.argv.slice(2)];

console.log('Starting Expo with Node.js v22 compatibility...');
console.log('NODE_OPTIONS:', process.env.NODE_OPTIONS);

const expo = spawn('npx', ['expo', ...args.slice(1)], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_OPTIONS: '--experimental-specifier-resolution=node --no-warnings'
  }
});

expo.on('close', (code) => {
  console.log(`Expo process exited with code ${code}`);
  process.exit(code);
});

expo.on('error', (error) => {
  console.error('Failed to start Expo:', error);
  process.exit(1);
});
