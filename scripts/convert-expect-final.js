#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

const specFiles = execSync(
  'find projects/igniteui-angular -name "*.spec.ts" -type f',
  { encoding: 'utf-8' }
).trim().split('\n').filter(Boolean);

let totalConversions = 0;
const filesModified = [];

specFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let fileConversions = 0;

  // Find all multi-line expect patterns where the matcher is on a subsequent line
  // Pattern: expect(...)\n  .toBe(value, 'message')
  
  // Replace patterns where the full expect is on one line
  const regex1 = /expect\(([^)]*(?:\([^)]*\))*[^)]*)\)\.(to[A-Za-z]+)\(([^,)]+),\s*(['"][^'"]*['"])\)/g;
  content = content.replace(regex1, (match, expectArg, matcher, value, msg) => {
    fileConversions++;
    return `expect(${expectArg}, ${msg}).${matcher}(${value})`;
  });

  const regex2 = /expect\(([^)]*(?:\([^)]*\))*[^)]*)\)\.not\.(to[A-Za-z]+)\(([^,)]+),\s*(['"][^'"]*['"])\)/g;
  content = content.replace(regex2, (match, expectArg, matcher, value, msg) => {
    fileConversions++;
    return `expect(${expectArg}, ${msg}).not.${matcher}(${value})`;
  });

  // Multi-line patterns - more aggressive approach
  // Match: expect(...)\n...spaces....toBe(val, 'msg')
  const regex3 = /expect\(([^)]*(?:\([^)]*\))*[^)]*)\)\s*\n\s*\.(to[A-Za-z]+)\(([^,)]+),\s*(['"][^'"]*['"])\)/g;
  content = content.replace(regex3, (match, expectArg, matcher, value, msg) => {
    fileConversions++;
    return `expect(${expectArg}, ${msg}).${matcher}(${value})`;
  });

  const regex4 = /expect\(([^)]*(?:\([^)]*\))*[^)]*)\)\s*\n\s*\.not\.(to[A-Za-z]+)\(([^,)]+),\s*(['"][^'"]*['"])\)/g;
  content = content.replace(regex4, (match, expectArg, matcher, value, msg) => {
    fileConversions++;
    return `expect(${expectArg}, ${msg}).not.${matcher}(${value})`;
  });

  if (fileConversions > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    filesModified.push(filePath);
    totalConversions += fileConversions;
    console.log(`✓ ${filePath}: ${fileConversions} conversions`);
  }
});

console.log(`\n✅ Total files modified: ${filesModified.length}`);
console.log(`✅ Total conversions: ${totalConversions}`);
