#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all spec files with spyOnProperty
const result = execSync(
    `grep -rl "spyOnProperty" --include="*.spec.ts" projects/`,
    { encoding: 'utf-8', cwd: '/home/runner/work/igniteui-angular/igniteui-angular' }
).trim();

const files = result.split('\n').filter(f => f);

console.log(`Found ${files.length} files with spyOnProperty`);

files.forEach(file => {
    const filePath = path.join('/home/runner/work/igniteui-angular/igniteui-angular', file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Pattern 1: spyOnProperty(obj, 'prop', 'get')
    // Convert to: vi.spyOn(obj, 'prop', 'get')
    const pattern1 = /spyOnProperty\(/g;
    if (pattern1.test(content)) {
        content = content.replace(/spyOnProperty\(/g, 'vi.spyOn(');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated: ${file}`);
    }
});

console.log('Conversion complete!');
