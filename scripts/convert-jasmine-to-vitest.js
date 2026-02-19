#!/usr/bin/env node

/**
 * Automated script to convert Jasmine spec files to Vitest syntax
 * 
 * This script performs the following transformations:
 * 1. Adds Vitest imports
 * 2. Converts spyOn to vi.spyOn
 * 3. Converts jasmine.createSpyObj to object literals with vi.fn()
 * 4. Updates spy method calls (.and.returnValue → .mockReturnValue, etc.)
 * 5. Converts jasmine.anything() and jasmine.any() to expect.anything() and expect.any()
 * 6. Removes jasmine.getEnv() calls
 */

const fs = require('fs');
const path = require('path');

// Track statistics
const stats = {
  filesProcessed: 0,
  filesChanged: 0,
  transformations: {
    importsAdded: 0,
    spyOnConverted: 0,
    createSpyObjConverted: 0,
    andReturnValueConverted: 0,
    andCallThroughConverted: 0,
    andCallFakeConverted: 0,
    jasmineAnythingConverted: 0,
    jasmineAnyConverted: 0,
    getEnvRemoved: 0,
  }
};

/**
 * Recursively find all spec files
 */
function findSpecFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, coverage, etc.
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
 * Convert a single spec file from Jasmine to Vitest syntax
 */
function convertSpecFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileChanged = false;

  // Check if file already has Vitest imports
  const hasVitestImports = content.includes('from \'vitest\'') || content.includes('from "vitest"');
  
  // Step 1: Add Vitest imports if not present
  if (!hasVitestImports && (content.includes('describe(') || content.includes('it(') || content.includes('spyOn('))) {
    // Find the last import statement
    const importRegex = /^import\s+.+?from\s+['"]+.+?['"]+;?\s*$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      // Determine which Vitest functions to import
      const vitestFunctions = new Set();
      if (content.includes('describe(')) vitestFunctions.add('describe');
      if (content.includes('it(')) vitestFunctions.add('it');
      if (content.includes('expect(')) vitestFunctions.add('expect');
      if (content.includes('beforeEach(')) vitestFunctions.add('beforeEach');
      if (content.includes('afterEach(')) vitestFunctions.add('afterEach');
      if (content.includes('beforeAll(')) vitestFunctions.add('beforeAll');
      if (content.includes('afterAll(')) vitestFunctions.add('afterAll');
      if (content.includes('spyOn(') || content.includes('jasmine.createSpyObj')) vitestFunctions.add('vi');
      
      if (vitestFunctions.size > 0) {
        const vitestImport = `\nimport { ${Array.from(vitestFunctions).join(', ')} } from 'vitest';`;
        content = content.slice(0, insertPosition) + vitestImport + content.slice(insertPosition);
        fileChanged = true;
        stats.transformations.importsAdded++;
      }
    }
  }

  // Step 2: Convert spyOn to vi.spyOn
  const spyOnRegex = /\bspyOn\s*\(/g;
  const spyOnMatches = content.match(spyOnRegex);
  if (spyOnMatches) {
    content = content.replace(spyOnRegex, 'vi.spyOn(');
    fileChanged = true;
    stats.transformations.spyOnConverted += spyOnMatches.length;
  }

  // Step 3: Convert .and.returnValue to .mockReturnValue
  const andReturnValueRegex = /\.and\.returnValue\(/g;
  const andReturnValueMatches = content.match(andReturnValueRegex);
  if (andReturnValueMatches) {
    content = content.replace(andReturnValueRegex, '.mockReturnValue(');
    fileChanged = true;
    stats.transformations.andReturnValueConverted += andReturnValueMatches.length;
  }

  // Step 4: Convert .and.callThrough() to just remove it (vi.spyOn calls through by default)
  const andCallThroughRegex = /\.and\.callThrough\(\)/g;
  const andCallThroughMatches = content.match(andCallThroughRegex);
  if (andCallThroughMatches) {
    content = content.replace(andCallThroughRegex, '');
    fileChanged = true;
    stats.transformations.andCallThroughConverted += andCallThroughMatches.length;
  }

  // Step 5: Convert .and.callFake to .mockImplementation
  const andCallFakeRegex = /\.and\.callFake\(/g;
  const andCallFakeMatches = content.match(andCallFakeRegex);
  if (andCallFakeMatches) {
    content = content.replace(andCallFakeRegex, '.mockImplementation(');
    fileChanged = true;
    stats.transformations.andCallFakeConverted += andCallFakeMatches.length;
  }

  // Step 6: Convert jasmine.createSpyObj
  // This is more complex as we need to parse the method names
  const createSpyObjRegex = /jasmine\.createSpyObj\s*\(\s*['"]([^'"]+)['"]\s*,\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*\)/g;
  let match;
  let createSpyObjCount = 0;
  
  // Reset regex
  createSpyObjRegex.lastIndex = 0;
  
  while ((match = createSpyObjRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const objName = match[1];
    const methodsOrProps = match[2];
    
    try {
      // Parse the methods/properties
      let replacement;
      
      if (methodsOrProps.startsWith('[')) {
        // Array of method names
        const methods = JSON.parse(methodsOrProps);
        const methodsObj = methods.map(m => `${m}: vi.fn()`).join(', ');
        replacement = `{ ${methodsObj} }`;
      } else {
        // Object with methods and properties
        // This is more complex, just add vi.fn() for each property
        replacement = methodsOrProps.replace(/:\s*(\[|\{|true|false|null|undefined|\d+|['"][^'"]*['"])/g, ': vi.fn()');
      }
      
      content = content.replace(fullMatch, replacement);
      createSpyObjCount++;
      fileChanged = true;
    } catch (e) {
      console.warn(`  Warning: Could not parse createSpyObj in ${filePath}: ${e.message}`);
    }
  }
  
  if (createSpyObjCount > 0) {
    stats.transformations.createSpyObjConverted += createSpyObjCount;
  }

  // Step 7: Convert jasmine.anything() to expect.anything()
  const jasmineAnythingRegex = /jasmine\.anything\(\)/g;
  const jasmineAnythingMatches = content.match(jasmineAnythingRegex);
  if (jasmineAnythingMatches) {
    content = content.replace(jasmineAnythingRegex, 'expect.anything()');
    fileChanged = true;
    stats.transformations.jasmineAnythingConverted += jasmineAnythingMatches.length;
  }

  // Step 8: Convert jasmine.any(Type) to expect.any(Type)
  const jasmineAnyRegex = /jasmine\.any\(/g;
  const jasmineAnyMatches = content.match(jasmineAnyRegex);
  if (jasmineAnyMatches) {
    content = content.replace(jasmineAnyRegex, 'expect.any(');
    fileChanged = true;
    stats.transformations.jasmineAnyConverted += jasmineAnyMatches.length;
  }

  // Step 9: Remove jasmine.getEnv() calls
  const getEnvRegex = /jasmine\.getEnv\(\)\.allowRespy\([^)]*\);?\s*/g;
  const getEnvMatches = content.match(getEnvRegex);
  if (getEnvMatches) {
    content = content.replace(getEnvRegex, '');
    fileChanged = true;
    stats.transformations.getEnvRemoved += getEnvMatches.length;
  }

  // Step 10: Also handle standalone getEnv calls
  const getEnvStandaloneRegex = /jasmine\.getEnv\(\)/g;
  const getEnvStandaloneMatches = content.match(getEnvStandaloneRegex);
  if (getEnvStandaloneMatches) {
    // Only count if not already counted
    const additionalMatches = getEnvStandaloneMatches.length - (getEnvMatches ? getEnvMatches.length : 0);
    if (additionalMatches > 0) {
      console.warn(`  Warning: Found standalone jasmine.getEnv() calls in ${filePath} - manual review needed`);
    }
  }

  // Write the file if it changed
  if (fileChanged) {
    fs.writeFileSync(filePath, content, 'utf8');
    stats.filesChanged++;
    console.log(`  ✓ Updated`);
  } else {
    console.log(`  - No changes needed`);
  }
  
  stats.filesProcessed++;
}

/**
 * Main function to find and convert all spec files
 */
function main() {
  console.log('Starting Jasmine to Vitest conversion...\n');
  
  // Find all spec files
  const specFiles = findSpecFiles(process.cwd());

  console.log(`Found ${specFiles.length} spec files to process\n`);

  // Process each file
  for (const filePath of specFiles) {
    try {
      convertSpecFile(filePath);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }

  // Print statistics
  console.log('\n' + '='.repeat(60));
  console.log('Conversion Complete!');
  console.log('='.repeat(60));
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files changed: ${stats.filesChanged}`);
  console.log('\nTransformations:');
  console.log(`  Vitest imports added: ${stats.transformations.importsAdded}`);
  console.log(`  spyOn → vi.spyOn: ${stats.transformations.spyOnConverted}`);
  console.log(`  jasmine.createSpyObj converted: ${stats.transformations.createSpyObjConverted}`);
  console.log(`  .and.returnValue → .mockReturnValue: ${stats.transformations.andReturnValueConverted}`);
  console.log(`  .and.callThrough removed: ${stats.transformations.andCallThroughConverted}`);
  console.log(`  .and.callFake → .mockImplementation: ${stats.transformations.andCallFakeConverted}`);
  console.log(`  jasmine.anything() → expect.anything(): ${stats.transformations.jasmineAnythingConverted}`);
  console.log(`  jasmine.any() → expect.any(): ${stats.transformations.jasmineAnyConverted}`);
  console.log(`  jasmine.getEnv() removed: ${stats.transformations.getEnvRemoved}`);
  console.log('='.repeat(60));
}

// Run the conversion
main();
