#!/usr/bin/env node

const { spawn } = require('child_process');
const { rmSync } = require('fs');
const { join } = require('path');

const maxAttempts = Number(process.env.NEXT_BUILD_MAX_ATTEMPTS || 5);
// Keep .next cache by default for faster local builds; retries still clean artifacts.
const cleanFirstAttempt = process.env.NEXT_BUILD_CLEAN_FIRST_ATTEMPT === '1';

const buildCommand = 'npx next build';

const cleanBuildArtifacts = () => {
  const root = process.cwd();
  const dirs = [join(root, '.next'), join(root, 'out')];

  for (const dir of dirs) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // Ignore clean-up errors; retry will attempt build anyway.
    }
  }
};

const runAttempt = (attempt) =>
  new Promise((resolve) => {
    const child = spawn(buildCommand, {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });

    child.on('close', (code) => {
      resolve(code || 0);
    });
  });

(async () => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (attempt === 1 && cleanFirstAttempt) {
      cleanBuildArtifacts();
    } else if (attempt > 1) {
      console.warn(`\nRetrying next build (attempt ${attempt}/${maxAttempts})...`);
      cleanBuildArtifacts();
    }

    const code = await runAttempt(attempt);
    if (code === 0) {
      process.exit(0);
    }

    if (attempt === maxAttempts) {
      console.error(`\nnext build failed after ${maxAttempts} attempts.`);
      process.exit(code);
    }
  }
})();
