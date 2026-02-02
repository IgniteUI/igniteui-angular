#!/usr/bin/env node

/**
 * Fourth pass to handle remaining Jasmine-specific matchers and spy APIs
 */

const fs = require('fs');
const path = require('path');

let filesChanged = 0;
let transformations = 0;

/**
 * Recursively find all spec files
 */
function findSpecFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', 'coverage', 'out-tsc', '.git'].includes(file)) {
        findSpecFiles(filePath, fileList);
      }
    } else if (file.endsWith('.spec.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Convert remaining Jasmine APIs
 */
function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // jasmine.objectContaining() → expect.objectContaining()
  const objectContainingCount = (content.match(/jasmine\.objectContaining\(/g) || []).length;
  if (objectContainingCount > 0) {
    content = content.replace(/jasmine\.objectContaining\(/g, 'expect.objectContaining(');
    transformations += objectContainingCount;
  }
  
  // jasmine.arrayWithExactContents() → expect.arrayContaining()
  const arrayCount = (content.match(/jasmine\.arrayWithExactContents\(/g) || []).length;
  if (arrayCount > 0) {
    content = content.replace(/jasmine\.arrayWithExactContents\(/g, 'expect.arrayContaining(');
    transformations += arrayCount;
  }
  
  // jasmine.createSpy() → vi.fn()
  const createSpyCount = (content.match(/jasmine\.createSpy\(/g) || []).length;
  if (createSpyCount > 0) {
    content = content.replace(/jasmine\.createSpy\([^)]*\)/g, 'vi.fn()');
    transformations += createSpyCount;
  }
  
  // .calls.mostRecent().args → .mock.calls[.mock.calls.length - 1]
  const mostRecentCount = (content.match(/\.calls\.mostRecent\(\)\.args/g) || []).length;
  if (mostRecentCount > 0) {
    content = content.replace(/\.calls\.mostRecent\(\)\.args/g, '.mock.calls[.mock.calls.length - 1]');
    transformations += mostRecentCount;
  }
  
  // .calls.count() → .mock.calls.length
  const callsCountCount = (content.match(/\.calls\.count\(\)/g) || []).length;
  if (callsCountCount > 0) {
    content = content.replace(/\.calls\.count\(\)/g, '.mock.calls.length');
    transformations += callsCountCount;
  }
  
  // .calls.all() → .mock.calls
  const callsAllCount = (content.match(/\.calls\.all\(\)/g) || []).length;
  if (callsAllCount > 0) {
    content = content.replace(/\.calls\.all\(\)/g, '.mock.calls');
    transformations += callsAllCount;
  }
  
  // .calls.first() → .mock.calls[0]
  const callsFirstCount = (content.match(/\.calls\.first\(\)/g) || []).length;
  if (callsFirstCount > 0) {
    content = content.replace(/\.calls\.first\(\)/g, '.mock.calls[0]');
    transformations += callsFirstCount;
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesChanged++;
    console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
}

function main() {
  console.log('Running fourth pass for remaining Jasmine APIs...\n');
  
  const specFiles = findSpecFiles(process.cwd());
  
  for (const filePath of specFiles) {
    try {
      convertFile(filePath);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }
  
  console.log(`\n============================================================`);
  console.log(`Fourth Pass Complete!`);
  console.log(`Files changed: ${filesChanged}`);
  console.log(`Total transformations: ${transformations}`);
  console.log(`============================================================`);
}

main();
