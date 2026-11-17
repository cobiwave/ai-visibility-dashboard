import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const sourceDirectories = ['src/features', 'src/shared'];
const sourceExtensions = new Set(['.ts', '.tsx', '.css']);
const checks = [
  { name: 'hex color', expression: /#[0-9a-fA-F]{3,8}\b/g },
  { name: 'arbitrary px value', expression: /-\[\d+px\]/g },
  { name: 'arbitrary hex value', expression: /-\[#/g },
];

function collectSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectSourceFiles(path);
    }

    return sourceExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

const violations = [];

for (const directory of sourceDirectories) {
  for (const path of collectSourceFiles(directory)) {
    const lines = readFileSync(path, 'utf8').split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const check of checks) {
        for (const match of line.matchAll(check.expression)) {
          const column = match.index + 1;
          violations.push(`${relative(process.cwd(), path)}:${index + 1}:${column}: ${check.name}`);
        }
      }
    });
  }
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  console.error(`Found ${violations.length} token violation(s).`);
  process.exitCode = 1;
} else {
  console.log('Token check passed.');
}
