import {copyFile} from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
await copyFile(
  path.join(root, 'static/landing.html'),
  path.join(root, 'build/index.html'),
);
console.log('Generated lightweight static homepage at build/index.html.');
