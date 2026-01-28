#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all spec files
const specFiles = execSync(
  'find projects/igniteui-angular -name "*.spec.ts" -type f',
  { encoding: 'utf-8' }
).trim().split('\n').filter(Boolean);

let totalConversions = 0;
const filesModified = [];

specFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fileConversions = 0;

  // Pattern 1: expect(...).toMatcher(value, 'message')
  // This needs to be converted to: expect(..., 'message').toMatcher(value)
  const expectPattern1 = /expect\(([^)]*(?:\([^)]*\))*[^)]*)\)\.(to[A-Za-z]+)\(([^,)]+),\s*(['"][^'"]*['"])\)/g;
  content = content.replace(expectPattern1, (match, expectArg, matcher, matcherArg, message) => {
    fileConversions++;
    return `expect(${expectArg}, ${message}).${matcher}(${matcherArg})`;
  });

  // Pattern 2: expect(...).not.toMatcher(value, 'message')
  // Convert: expect(arg).not.matcher(value, 'msg') -> expect(arg, 'msg').not.matcher(value)
  const expectPattern2 = /expect\(([^)]*(?:\([^)]*\))*[^)]*)\)\.not\.(to[A-Za-z]+)\(([^,)]+),\s*(['"][^'"]*['"])\)/g;
  content = content.replace(expectPattern2, (match, expectArg, matcher, matcherArg, message) => {
    fileConversions++;
    return `expect(${expectArg}, ${message}).not.${matcher}(${matcherArg})`;
  });

  // Pattern 3: Multi-line patterns where .toBe etc is on the next line
  // .toBe(false, 'message')
  const multilinePattern = /\.(\s*)(to[A-Za-z]+)\(([^,)]+),\s*(['"][^'"]*['"])\)/g;
  let multilineMatches = [];
  let match;
  while ((match = multilinePattern.exec(content)) !== null) {
    // Check if there's an expect() before this on a previous line
    const beforeMatch = content.substring(Math.max(0, match.index - 200), match.index);
    if (beforeMatch.includes('expect(') && !beforeMatch.includes(', \'') && !beforeMatch.includes(', "')) {
      multilineMatches.push(match);
    }
  }
  
  // Process multiline patterns from end to start to preserve indices
  for (let i = multilineMatches.length - 1; i >= 0; i--) {
    const m = multilineMatches[i];
    const fullMatch = m[0];
    const whitespace = m[1];
    const matcher = m[2];
    const matcherArg = m[3];
    const message = m[4];
    
    // Find the expect( before this
    const before = content.substring(0, m.index);
    const expectMatch = before.match(/expect\(([^)]*(?:\([^)]*\))*[^)]*)$/);
    if (expectMatch) {
      const expectStart = before.lastIndexOf('expect(');
      const expectArg = expectMatch[1];
      const expectEnd = m.index;
      
      // Replace the entire expression
      const oldExpr = content.substring(expectStart, m.index + fullMatch.length);
      const newExpr = `expect(${expectArg}, ${message})${whitespace}${matcher}(${matcherArg})`;
      
      content = content.substring(0, expectStart) + newExpr + content.substring(m.index + fullMatch.length);
      fileConversions++;
    }
  }

  if (fileConversions > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    filesModified.push(filePath);
    totalConversions += fileConversions;
    console.log(`✓ ${filePath}: ${fileConversions} conversions`);
  }
});

console.log(`\n✅ Total files modified: ${filesModified.length}`);
console.log(`✅ Total conversions: ${totalConversions}`);
