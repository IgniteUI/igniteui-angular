#!/usr/bin/env node

/**
 * Script to convert fakeAsync to customFakeAsync
 * 
 * Converts:
 *   import { TestBed, fakeAsync, tick } from '@angular/core/testing';
 *   it('test', fakeAsync(() => { ... }));
 * 
 * To:
 *   import { TestBed, tick } from '@angular/core/testing';
 *   import { customFakeAsync } from 'igniteui-angular/test-utils/customFakeAsync';
 *   it('test', customFakeAsync(() => { ... }));
 */

const fs = require('fs');
const path = require('path');

// Get file paths from command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage: node convert-fakeAsync.js <file-or-directory> [--dry-run]');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run    Show changes without modifying files');
    console.log('');
    console.log('Examples:');
    console.log('  node convert-fakeAsync.js ./projects/igniteui-angular');
    console.log('  node convert-fakeAsync.js ./my-file.spec.ts --dry-run');
    process.exit(1);
}

const dryRun = args.includes('--dry-run');
const targetPath = args.find(arg => !arg.startsWith('--'));

function convertFakeAsync(content) {
    let modified = content;
    let changeCount = 0;

    // Check if the file uses fakeAsync (as a function call, not just the word)
    if (!content.match(/fakeAsync\s*\(/)) {
        return { content, changeCount: 0 };
    }

    // Skip if already using customFakeAsync
    if (content.includes('customFakeAsync')) {
        // Still need to replace any remaining fakeAsync usages
        const fakeAsyncCallPattern = /(?<!custom)fakeAsync\s*\(/g;
        if (!fakeAsyncCallPattern.test(content)) {
            return { content, changeCount: 0 };
        }
    }

    // Step 1: Replace fakeAsync( with customFakeAsync( in test bodies
    // But not in import statements
    const fakeAsyncUsagePattern = /(?<!custom)(?<!import[^;]*)(fakeAsync)\s*\(/g;
    modified = modified.replace(fakeAsyncUsagePattern, (match, fakeAsync) => {
        changeCount++;
        return 'customFakeAsync(';
    });

    // Step 2: Add customFakeAsync import if not already present
    if (!modified.includes("import { customFakeAsync }") && 
        !modified.includes("import {customFakeAsync}")) {
        
        // Find a good place to add the import - after existing imports
        // Look for the last import statement
        const importPattern = /^import\s+.*?['"]\s*;?\s*$/gm;
        let lastImportMatch;
        let match;
        while ((match = importPattern.exec(modified)) !== null) {
            lastImportMatch = match;
        }
        
        if (lastImportMatch) {
            const insertPosition = lastImportMatch.index + lastImportMatch[0].length;
            const importStatement = "\nimport { customFakeAsync } from 'igniteui-angular/test-utils/customFakeAsync';";
            modified = modified.slice(0, insertPosition) + importStatement + modified.slice(insertPosition);
            changeCount++;
        }
    }

    // Step 3: Remove fakeAsync from @angular/core/testing import if no longer used
    // Check if fakeAsync is still used anywhere (not customFakeAsync)
    const stillUsesFakeAsync = /(?<!custom)fakeAsync\s*\(/.test(modified);
    
    if (!stillUsesFakeAsync) {
        // Remove fakeAsync from the import
        // Pattern: import { ..., fakeAsync, ... } from '@angular/core/testing';
        
        // Case: fakeAsync is at the end (preserve space before closing brace)
        modified = modified.replace(
            /,\s*fakeAsync(\s*\}.*from\s*['"]@angular\/core\/testing['"])/g,
            '$1'
        );
        
        // Case: fakeAsync is at the beginning or middle
        modified = modified.replace(
            /(from\s*['"]@angular\/core\/testing['"].*?)\bfakeAsync\s*,\s*/g,
            '$1'
        );
        
        // More general patterns for various positions
        modified = modified.replace(
            /(\{\s*)fakeAsync\s*,\s*(.*from\s*['"]@angular\/core\/testing['"])/g,
            '$1$2'
        );
        
        modified = modified.replace(
            /,\s*fakeAsync\s*,/g,
            ','
        );
        
        // Handle the import with proper spacing
        modified = modified.replace(
            /(import\s*\{[^}]*)(?:,\s*)?fakeAsync(?:\s*,)?([^}]*\}\s*from\s*['"]@angular\/core\/testing['"])/g,
            (match, before, after) => {
                // Clean up the result
                let result = before + after;
                // Remove double commas
                result = result.replace(/,\s*,/g, ',');
                // Remove leading comma after {
                result = result.replace(/\{\s*,\s*/g, '{ ');
                // Remove trailing comma before }
                result = result.replace(/,\s*\}/g, ' }');
                return result;
            }
        );
    }

    return { content: modified, changeCount };
}

function processFile(filePath) {
    if (!filePath.endsWith('.spec.ts') && !filePath.endsWith('.test.ts')) {
        return { processed: false };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file uses fakeAsync
    if (!content.match(/fakeAsync\s*\(/)) {
        return { processed: false };
    }

    const { content: newContent, changeCount } = convertFakeAsync(content);

    if (content !== newContent) {
        if (dryRun) {
            console.log(`\n[DRY RUN] Would modify: ${filePath}`);
            console.log(`  Changes: ${changeCount}`);
            
            // Show a diff-like preview
            const oldLines = content.split('\n');
            const newLines = newContent.split('\n');
            
            let diffCount = 0;
            for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
                if (oldLines[i] !== newLines[i] && diffCount < 20) {
                    if (oldLines[i]) console.log(`  - ${oldLines[i].substring(0, 100)}`);
                    if (newLines[i]) console.log(`  + ${newLines[i].substring(0, 100)}`);
                    diffCount++;
                }
            }
            if (diffCount >= 20) {
                console.log('  ... (more changes)');
            }
        } else {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Modified: ${filePath} (${changeCount} changes)`);
        }
        return { processed: true, changes: changeCount };
    }

    return { processed: false };
}

function processDirectory(dirPath) {
    let totalFiles = 0;
    let totalChanges = 0;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            // Skip node_modules, dist, and other common directories
            if (['node_modules', 'dist', '.git', 'coverage', 'migrations', 'schematics', 'cypress'].includes(entry.name)) {
                continue;
            }
            const result = processDirectory(fullPath);
            totalFiles += result.totalFiles;
            totalChanges += result.totalChanges;
        } else if (entry.isFile()) {
            const result = processFile(fullPath);
            if (result.processed) {
                totalFiles++;
                totalChanges += result.changes || 0;
            }
        }
    }

    return { totalFiles, totalChanges };
}

// Main execution
const fullPath = path.resolve(targetPath);

if (!fs.existsSync(fullPath)) {
    console.error(`Error: Path not found: ${fullPath}`);
    process.exit(1);
}

const stats = fs.statSync(fullPath);

console.log(`${dryRun ? '[DRY RUN] ' : ''}Converting fakeAsync to customFakeAsync...`);
console.log(`Target: ${fullPath}\n`);

let result;
if (stats.isDirectory()) {
    result = processDirectory(fullPath);
} else {
    const fileResult = processFile(fullPath);
    result = {
        totalFiles: fileResult.processed ? 1 : 0,
        totalChanges: fileResult.changes || 0
    };
}

console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Done!`);
console.log(`Files ${dryRun ? 'that would be ' : ''}modified: ${result.totalFiles}`);
console.log(`Total changes: ${result.totalChanges}`);
