#!/usr/bin/env node

const { spawn } = require('child_process');
const { mkdirSync, rmSync } = require('fs');
const { join } = require('path');

const maxAttempts = Number(process.env.NEXT_BUILD_MAX_ATTEMPTS || 5);
// Keep .next cache by default for faster local builds; retries still clean artifacts.
const cleanFirstAttempt = process.env.NEXT_BUILD_CLEAN_FIRST_ATTEMPT === '1';

const buildCommand = 'npx next build';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanBuildArtifacts = async () => {
  const root = process.cwd();
  const dirs = [join(root, '.next'), join(root, 'out')];

  for (const dir of dirs) {
    // Windows can briefly lock build artifacts; retry a couple of times.
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        rmSync(dir, { recursive: true, force: true });
        break;
      } catch (error) {
        if (attempt === 3) {
          console.warn(`Warning: failed to clean ${dir} before build attempt.`, error);
        } else {
          await sleep(250);
        }
      }
    }
  }
};

const prepareBuildDirectories = () => {
  const root = process.cwd();
  // Guard against intermittent ENOENT during static export path creation.
  mkdirSync(join(root, '.next', 'export'), { recursive: true });
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
      await cleanBuildArtifacts();
    } else if (attempt > 1) {
      console.warn(`\nRetrying next build (attempt ${attempt}/${maxAttempts})...`);
      await cleanBuildArtifacts();
    }

    prepareBuildDirectories();

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
