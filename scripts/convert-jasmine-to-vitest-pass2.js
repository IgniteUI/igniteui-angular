#!/usr/bin/env node

/**
 * Second pass to handle multi-line jasmine.createSpyObj calls
 */

const fs = require('fs');
const path = require('path');

let filesChanged = 0;
let createSpyObjFixed = 0;

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
 * Convert multi-line jasmine.createSpyObj
 */
function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Handle multi-line createSpyObj with better regex
  // Match: jasmine.createSpyObj(optional<Type>,)('name', ['method1', 'method2', ...])
  // This regex captures across multiple lines
  const multiLineRegex = /jasmine\.createSpyObj(?:<[^>]+>)?\s*\(\s*['"]([^'"]+)['"]\s*,\s*\[([^\]]+)\]\s*\)/gs;
  
  content = content.replace(multiLineRegex, (match, name, methods) => {
    // Clean up the methods string and split
    const methodList = methods
      .split(',')
      .map(m => m.trim().replace(/['"]/g, ''))
      .filter(m => m.length > 0);
    
    // Create the replacement object
    const methodsObj = methodList.map(m => `${m}: vi.fn()`).join(', ');
    const replacement = `{ ${methodsObj} }`;
    
    createSpyObjFixed++;
    return replacement;
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesChanged++;
    console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
}

function main() {
  console.log('Running second pass for multi-line jasmine.createSpyObj...\n');
  
  const specFiles = findSpecFiles(process.cwd());
  
  for (const filePath of specFiles) {
    try {
      convertFile(filePath);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }
  
  console.log(`\n============================================================`);
  console.log(`Second Pass Complete!`);
  console.log(`Files changed: ${filesChanged}`);
  console.log(`createSpyObj converted: ${createSpyObjFixed}`);
  console.log(`============================================================`);
}

main();
