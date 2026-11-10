import {readdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {gzipSync, constants} from 'node:zlib';

const root = path.resolve('build');
const compressible = /\.(?:html|css|js|mjs|json|svg|xml|txt|webmanifest)$/i;
let count = 0;
let originalBytes = 0;
let compressedBytes = 0;

async function walk(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(file);
    } else if (compressible.test(entry.name) && !entry.name.endsWith('.gz')) {
      const source = await readFile(file);
      if (source.length < 512) continue;
      const compressed = gzipSync(source, {level: 9, strategy: constants.Z_DEFAULT_STRATEGY});
      if (compressed.length >= source.length) continue;
      await writeFile(`${file}.gz`, compressed);
      count += 1;
      originalBytes += source.length;
      compressedBytes += compressed.length;
    }
  }
}

await walk(root);
console.log(`Precompressed ${count} text assets (${(originalBytes / 1024 / 1024).toFixed(1)} MB to ${(compressedBytes / 1024 / 1024).toFixed(1)} MB).`);
