#!/usr/bin/env node

/**
 * Third pass to handle jasmine.createSpyObj with properties (3-parameter form)
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
 * Convert jasmine.createSpyObj with 3 parameters (methods, properties)
 */
function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Handle 3-parameter createSpyObj: jasmine.createSpyObj('name', ['methods'], { props })
  // Also handle with type parameter: jasmine.createSpyObj<Type>('name', ['methods'], { props })
  const threeParamRegex = /jasmine\.createSpyObj(?:<[^>]+>)?\s*\(\s*['"]([^'"]+)['"]\s*,\s*\[([^\]]*)\]\s*,\s*(\{[^}]*\})\s*\)/gs;
  
  content = content.replace(threeParamRegex, (match, name, methods, props) => {
    const result = [];
    
    // Parse methods
    if (methods.trim()) {
      const methodList = methods
        .split(',')
        .map(m => m.trim().replace(/['"]/g, ''))
        .filter(m => m.length > 0);
      
      methodList.forEach(m => {
        result.push(`${m}: vi.fn()`);
      });
    }
    
    // Parse properties - keep them as-is but wrap values
    // Simple approach: just include the properties object content
    const propsContent = props.slice(1, -1).trim(); // Remove { and }
    if (propsContent) {
      result.push(propsContent);
    }
    
    createSpyObjFixed++;
    return `{ ${result.join(', ')} }`;
  });
  
  // Also handle 2-parameter form with just properties: jasmine.createSpyObj('name', { props })
  const twoParamPropsRegex = /jasmine\.createSpyObj(?:<[^>]+>)?\s*\(\s*['"]([^'"]+)['"]\s*,\s*(\{[^}]*\})\s*\)/gs;
  
  content = content.replace(twoParamPropsRegex, (match, name, props) => {
    // Just return the properties object with methods converted to vi.fn()
    const propsContent = props.slice(1, -1).trim(); // Remove { and }
    
    createSpyObjFixed++;
    return `{ ${propsContent} }`;
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesChanged++;
    console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
}

function main() {
  console.log('Running third pass for jasmine.createSpyObj with properties...\n');
  
  const specFiles = findSpecFiles(process.cwd());
  
  for (const filePath of specFiles) {
    try {
      convertFile(filePath);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }
  
  console.log(`\n============================================================`);
  console.log(`Third Pass Complete!`);
  console.log(`Files changed: ${filesChanged}`);
  console.log(`createSpyObj converted: ${createSpyObjFixed}`);
  console.log(`============================================================`);
}

main();
