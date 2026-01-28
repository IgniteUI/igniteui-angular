#!/usr/bin/env python3

import re
import sys

files_to_fix = [
    'projects/igniteui-angular/calendar/src/calendar/calendar.component.spec.ts',
    'projects/igniteui-angular/combo/src/combo/combo.component.spec.ts',
    'projects/igniteui-angular/core/src/data-operations/data-util.spec.ts',
    'projects/igniteui-angular/date-picker/src/date-picker/date-picker.component.spec.ts',
    'projects/igniteui-angular/grids/grid/src/grid-filtering-advanced.spec.ts',
    'projects/igniteui-angular/grids/grid/src/grid-filtering-ui.spec.ts',
    'projects/igniteui-angular/grids/grid/src/grid.component.spec.ts',
    'projects/igniteui-angular/grids/grid/src/grid.master-detail.spec.ts',
    'projects/igniteui-angular/grids/grid/src/grid.pinning.spec.ts',
    'projects/igniteui-angular/query-builder/src/query-builder/query-builder.component.spec.ts',
    'projects/igniteui-angular/test-utils/grid-functions.spec.ts',
]

def find_matching_paren(text, start):
    """Find the matching closing paren starting from position start"""
    count = 1
    i = start
    while i < len(text) and count > 0:
        if text[i] == '(':
            count += 1
        elif text[i] == ')':
            count -= 1
        i += 1
    return i - 1 if count == 0 else -1

total_conversions = 0
files_modified = []

for filepath in files_to_fix:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        file_conversions = 0
        
        # Find all expect( patterns and check if they have multiline matchers with messages
        expect_pattern = re.compile(r'expect\(')
        replacements = []
        
        for match in expect_pattern.finditer(content):
            start_pos = match.start()
            arg_start = match.end()
            arg_end = find_matching_paren(content, arg_start)
            
            if arg_end == -1:
                continue
            
            expect_arg = content[arg_start:arg_end]
            after_close = content[arg_end:]
            
            # Check if there's a multiline matcher with message
            # Pattern: )\n  .toBe(value, 'message') or )\n  .not.toBe(value, 'message')
            matcher_pattern1 = re.compile(r'^\)\s*\n\s*\.(to[A-Za-z]+)\(([^,]+),\s*([\'"].+?[\'"])\)', re.MULTILINE | re.DOTALL)
            matcher_pattern2 = re.compile(r'^\)\s*\n\s*\.not\.(to[A-Za-z]+)\(([^,]+),\s*([\'"].+?[\'"])\)', re.MULTILINE | re.DOTALL)
            
            matcher_match = matcher_pattern1.match(after_close)
            has_not = False
            
            if not matcher_match:
                matcher_match = matcher_pattern2.match(after_close)
                has_not = True
            
            if matcher_match:
                matcher = matcher_match.group(1)
                value = matcher_match.group(2)
                message = matcher_match.group(3)
                
                # Calculate the full range to replace
                full_match_start = start_pos
                full_match_end = arg_end + matcher_match.end()
                
                # Build the replacement
                if has_not:
                    replacement = f'expect({expect_arg}, {message}).not.{matcher}({value})'
                else:
                    replacement = f'expect({expect_arg}, {message}).{matcher}({value})'
                
                replacements.append((full_match_start, full_match_end, replacement))
                file_conversions += 1
        
        # Apply replacements from end to start to preserve positions
        replacements.sort(key=lambda x: x[0], reverse=True)
        for start, end, replacement in replacements:
            content = content[:start] + replacement + content[end:]
        
        if file_conversions > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            files_modified.append(filepath)
            total_conversions += file_conversions
            print(f'✓ {filepath}: {file_conversions} conversions')
            
    except FileNotFoundError:
        print(f'✗ {filepath}: File not found')
        continue

print(f'\n✅ Total files modified: {len(files_modified)}')
print(f'✅ Total conversions: {total_conversions}')

