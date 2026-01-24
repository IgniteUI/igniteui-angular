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

  // This function processes expect statements with custom messages
  // We need to handle patterns like:
  // 1. expect(x).toBe(y, 'msg')  ->  expect(x, 'msg').toBe(y)
  // 2. expect(x).not.toBe(y, 'msg')  ->  expect(x, 'msg').not.toBe(y)
  // 3. Multi-line versions of the above

  // Strategy: Use a more comprehensive regex that handles optional .not and multiline
  
  // Pattern: expect(...)[.not].toMatcher(..., 'message')
  // We need to be careful with nested parentheses in the expect argument
  
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let originalLine = line;
    
    // Check if this line has a matcher with a message parameter
    // Pattern: .toMatcher(arg, 'message') or .not.toMatcher(arg, 'message')
    const matcherWithMessagePattern = /^(\s*)\.(?:not\.)?(to[A-Za-z]+)\(([^,)]+),\s*(['"][^'"]*['"])\)/;
    const matcherMatch = line.match(matcherWithMessagePattern);
    
    if (matcherMatch && i > 0) {
      // This line has a matcher with a message, check previous lines for expect(
      const indent = matcherMatch[1];
      const matcher = matcherMatch[2];
      const matcherArg = matcherMatch[3];
      const message = matcherMatch[4];
      const hasNot = line.includes('.not.');
      
      // Look backwards to find the expect( statement
      let expectLine = -1;
      let expectStatement = '';
      
      for (let j = i - 1; j >= 0 && j >= i - 5; j--) {
        if (lines[j].trim().startsWith('expect(')) {
          expectLine = j;
          // Collect all lines from expect to current
          expectStatement = lines.slice(j, i).join('\n').trim();
          break;
        }
      }
      
      if (expectLine >= 0) {
        // Extract the expect argument
        const expectMatch = expectStatement.match(/expect\(([^)]*(?:\([^)]*\))*[^)]*)\)/);
        if (expectMatch) {
          const expectArg = expectMatch[1];
          
          // Build the new statement
          const newExpect = `expect(${expectArg}, ${message})`;
          const newMatcher = hasNot ? `.not.${matcher}(${matcherArg})` : `.${matcher}(${matcherArg})`;
          
          // Get the indentation from the expect line
          const expectIndent = lines[expectLine].match(/^(\s*)/)[1];
          
          // Replace the expect line with the new single-line statement
          newLines[expectLine] = expectIndent + newExpect + newMatcher;
          
          // Skip the lines in between and the current line
          for (let k = expectLine + 1; k <= i; k++) {
            newLines[k] = null; // Mark for removal
          }
          
          fileConversions++;
          continue;
        }
      }
    }
    
    // Single-line patterns: expect(...).toMatcher(arg, 'msg')
    const singleLinePattern1 = /expect\(([^)]*(?:\([^)]*\))*[^)]*)\)\.(to[A-Za-z]+)\(([^,)]+),\s*(['"][^'"]*['"])\)/g;
    line = line.replace(singleLinePattern1, (match, expectArg, matcher, matcherArg, message) => {
      fileConversions++;
      return `expect(${expectArg}, ${message}).${matcher}(${matcherArg})`;
    });
    
    // Single-line patterns with .not: expect(...).not.toMatcher(arg, 'msg')
    const singleLinePattern2 = /expect\(([^)]*(?:\([^)]*\))*[^)]*)\)\.not\.(to[A-Za-z]+)\(([^,)]+),\s*(['"][^'"]*['"])\)/g;
    line = line.replace(singleLinePattern2, (match, expectArg, matcher, matcherArg, message) => {
      fileConversions++;
      return `expect(${expectArg}, ${message}).not.${matcher}(${matcherArg})`;
    });
    
    if (line !== originalLine) {
      // Line was modified by single-line pattern
      newLines.push(line);
    } else if (newLines[i] === null) {
      // Skip this line (it's part of a multi-line expect we already processed)
      // Do nothing
    } else if (newLines[i] !== undefined) {
      // Line was already set by multi-line processing
      // Do nothing  
    } else {
      newLines.push(line);
    }
  }
  
  // Filter out null entries
  content = newLines.filter(line => line !== null).join('\n');

  if (fileConversions > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    filesModified.push(filePath);
    totalConversions += fileConversions;
    console.log(`✓ ${filePath}: ${fileConversions} conversions`);
  }
});

console.log(`\n✅ Total files modified: ${filesModified.length}`);
console.log(`✅ Total conversions: ${totalConversions}`);
