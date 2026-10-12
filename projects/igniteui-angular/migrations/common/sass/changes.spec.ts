import {
    addArgument, applyEdits, applyEditsWithMap, removeIncludes, removeVariable, renameMember, renameVariable, SassChangeResult, updateArgument,
    updateModule
} from './changes';
import { SassStylesheet } from './stylesheet';

type Operation = (sheet: SassStylesheet) => SassChangeResult;

const apply = (operation: Operation, content: string, indented = false): string =>
    applyEdits(content, operation(new SassStylesheet(content, indented)).edits);

const manual = (operation: Operation, content: string, indented = false): string[] =>
    operation(new SassStylesheet(content, indented)).manual.map(change => change.message);

describe('Sass changes', () => {
    /** Every operation, with a statement it changes and what it changes it to. */
    const operations: { name: string; operation: Operation; statement: string; changed: string }[] = [
        {
            name: 'renaming a function',
            operation: sheet => renameMember(sheet, 'igx-color', 'color'),
            statement: '$a: igx-color(red);',
            changed: '$a: color(red);'
        },
        {
            name: 'renaming a mixin',
            operation: sheet => renameMember(sheet, 'igx-theme', 'theme'),
            statement: '@include igx-theme($palette);',
            changed: '@include theme($palette);'
        },
        {
            name: 'removing an include',
            operation: sheet => removeIncludes(sheet, 'card-typography'),
            statement: '.a { @include card-typography($t); }',
            changed: '.a {  }'
        },
        {
            name: 'renaming an argument',
            operation: sheet => updateArgument(sheet, 'button-theme', { name: '$old', replaceWith: '$new' }),
            statement: '$t: button-theme($old: red);',
            changed: '$t: button-theme($new: red);'
        },
        {
            name: 'removing an argument',
            operation: sheet => updateArgument(sheet, 'button-theme', { name: '$old', remove: true }),
            statement: '$t: button-theme($a: 1, $old: red);',
            changed: '$t: button-theme($a: 1);'
        },
        {
            name: 'adding an argument',
            operation: sheet => addArgument(sheet, 'palette', { name: '$generator', value: `'legacy'`, kind: 'function' }),
            statement: '$p: palette(red, blue, white);',
            changed: `$p: palette(red, blue, white, $generator: 'legacy');`
        },
        {
            name: 'renaming a variable',
            operation: sheet => renameVariable(sheet, '$old-palette', '$new-palette'),
            statement: '$a: $old-palette;',
            changed: '$a: $new-palette;'
        },
        {
            name: 'moving a module',
            operation: sheet => updateModule(sheet, { module: 'igniteui-angular/old', replaceWith: 'igniteui-angular/new' }),
            statement: `@use 'igniteui-angular/old' as old;`,
            changed: `@use 'igniteui-angular/new' as old;`
        }
    ];

    for (const { name, operation, statement, changed } of operations) {
        describe(name, () => {
            it('should change the statement', () => {
                expect(apply(operation, statement)).toEqual(changed);
            });

            it('should leave a line comment, a block comment and a string that mention it', () => {
                const content = `// ${statement}\n/* ${statement} */\n$s: "${statement.replace(/"/g, '\'')}";`;
                expect(apply(operation, content)).toEqual(content);
            });

            it('should leave an unquoted url() that mentions it', () => {
                const content = `.a { background: url(//cdn.example.com/${statement.replace(/[;\s]/g, '')}.png); }`;
                expect(apply(operation, content)).toEqual(content);
            });

            it('should keep Windows line endings and change every statement', () => {
                const content = `// first\r\n${statement}\r\n.b { color: red; }\r\n`;
                expect(apply(operation, content)).toEqual(`// first\r\n${changed}\r\n.b { color: red; }\r\n`);
            });

            it('should not touch code after an unbalanced bracket', () => {
                const content = `${statement}\n$broken: fn(1, 2;\n${statement}`;
                expect(apply(operation, content).startsWith(changed)).toBeTrue();
            });
        });
    }

    describe('renameMember', () => {
        const rename = (content: string, indented = false) => apply(sheet => renameMember(sheet, 'igx-color', 'color'), content, indented);

        it('should rename only the whole name', () => {
            const content = '$a: my-igx-color(red); $b: igx-color-x(red); $c: discard(red); $d: $igx-color;';
            expect(rename(content)).toEqual(content);
        });

        it('should rename a call through any namespace', () => {
            expect(rename('$a: igx.igx-color(red); $b: my-theme.igx-color(red);'))
                .toEqual('$a: igx.color(red); $b: my-theme.color(red);');
        });

        it('should rename calls nested in each other', () => {
            expect(rename('$a: igx-color(igx-color(red), igx.igx-color(blue));'))
                .toEqual('$a: color(color(red), igx.color(blue));');
        });

        it('should treat underscores and hyphens in the name as the same', () => {
            expect(rename('$a: igx_color(red);')).toEqual('$a: color(red);');
        });

        it('should leave a member the stylesheet declares itself', () => {
            const content = '@function igx-color($c) { @return $c; }\n$a: igx-color(red);';
            expect(rename(content)).toEqual(content);
        });

        it('should rename an include without arguments and the indented shorthand', () => {
            const renameMixin = (content: string, indented = false) => apply(sheet => renameMember(sheet, 'igx-theme', 'theme'), content, indented);
            expect(renameMixin('.a { @include igx-theme; }')).toEqual('.a { @include theme; }');
            expect(renameMixin('.a\n  +igx-theme($p)\n  +igx.igx-theme', true)).toEqual('.a\n  +theme($p)\n  +igx.theme');
        });

        it('should rename a mixin labelled as a function, as some older changes do', () => {
            expect(rename('.a { @include igx-color(red); }')).toEqual('.a { @include color(red); }');
        });
    });

    describe('removeIncludes', () => {
        const remove = (content: string, indented = false) => apply(sheet => removeIncludes(sheet, 'card-typography'), content, indented);

        it('should remove the whole line of an include alone on it', () => {
            expect(remove('.a {\n    @include card-typography(\n        $categories: (title: \'h5\')\n    );\n    color: red;\n}'))
                .toEqual('.a {\n    color: red;\n}');
        });

        it('should remove an include without arguments, through a namespace and in the indented syntax', () => {
            expect(remove('.a {\n    @include card-typography;\n    @include igx.card-typography();\n}')).toEqual('.a {\n}');
            expect(remove('.a\n  +card-typography($t)\n  color: red', true)).toEqual('.a\n  color: red');
        });

        it('should keep the bounds of an include whose arguments hold brackets in strings', () => {
            expect(remove('.a { @include card-typography($label: \')\'); color: red; }')).toEqual('.a {  color: red; }');
        });

        it('should leave a function call and other mixins with similar names', () => {
            const content = '.a { @include my-card-typography; @include card-typography-x; $v: card-typography(1); }';
            expect(remove(content)).toEqual(content);
        });

        it('should not take the braces of an interpolation for a content block', () => {
            expect(remove('.a {\n    @include card-typography($size: #{$x}px);\n}')).toEqual('.a {\n}');
        });

        it('should leave an include that passes a content block for manual review', () => {
            const content = '.a { @include card-typography { color: red; } }';
            expect(remove(content)).toEqual(content);
            expect(manual(sheet => removeIncludes(sheet, 'card-typography'), content).length).toBe(1);
            const indented = '.a\n  +card-typography\n    color: red';
            expect(remove(indented, true)).toEqual(indented);
        });
    });

    describe('updateArgument', () => {
        const update = (content: string, change: { name: string; replaceWith?: string; remove?: boolean }) =>
            apply(sheet => updateArgument(sheet, 'button-theme', change), content);

        it('should match owners ending with the name, as theme changes need', () => {
            expect(update('$t: flat-button-theme($old: 1);', { name: '$old', replaceWith: '$new' })).toEqual('$t: flat-button-theme($new: 1);');
        });

        it('should match only the exact owner when asked to', () => {
            const content = '$a: color-palette($old: 1); $b: palette($old: 1);';
            expect(apply(sheet => updateArgument(sheet, 'palette', { name: '$old', replaceWith: '$new' }, 'exact'), content))
                .toEqual('$a: color-palette($old: 1); $b: palette($new: 1);');
        });

        it('should not split an argument at the commas of a list or a map', () => {
            expect(update('$t: button-theme($shadow: [1px, 2px], $map: (a: 1, b: 2), $old: 1, $x: 2);', { name: '$old', remove: true }))
                .toEqual('$t: button-theme($shadow: [1px, 2px], $map: (a: 1, b: 2), $x: 2);');
        });

        it('should treat underscores and hyphens in the argument name as the same', () => {
            expect(update('$t: button-theme($old_name: 1);', { name: '$old-name', replaceWith: '$new' })).toEqual('$t: button-theme($new: 1);');
        });

        it('should not split an argument at the commas of an interpolation', () => {
            expect(update('$t: button-theme($x: 1, $old: #{$a, $b}, $y: 2);', { name: '$old', remove: true }))
                .toEqual('$t: button-theme($x: 1, $y: 2);');
            expect(update('$t: button-theme($old: #{$a, $b});', { name: '$old', replaceWith: '$new' }))
                .toEqual('$t: button-theme($new: #{$a, $b});');
        });

        it('should leave a removal from a call passing the argument by position for manual review', () => {
            const change = { name: '$old', remove: true, parameterIndex: 2 };
            const remove = (sheet: SassStylesheet) => updateArgument(sheet, 'button-theme', change);
            const content = '$a: button-theme(red, blue);\n$b: button-theme(red, $args...);\n$c: button-theme(red, $old: blue);\n$d: button-theme(red);';
            expect(apply(remove, content)).toEqual('$a: button-theme(red, blue);\n$b: button-theme(red, $args...);\n$c: button-theme(red);\n$d: button-theme(red);');
            expect(manual(remove, content).length).toBe(2);
        });

        it('should keep an argument passed by position through a rename', () => {
            const content = '$a: button-theme(red, blue);';
            const rename = (sheet: SassStylesheet) => updateArgument(sheet, 'button-theme', { name: '$old', replaceWith: '$new', parameterIndex: 2 });
            expect(apply(rename, content)).toEqual(content);
            expect(manual(rename, content)).toEqual([]);
        });
    });

    describe('addArgument', () => {
        const generator = { name: '$generator', value: `'legacy'`, kind: 'function' as const, parameterIndex: 10 };
        const add = (content: string, indented = false) => apply(sheet => addArgument(sheet, 'palette', generator), content, indented);

        it('should add the argument to a call with a single argument', () => {
            expect(add('\n\n$p: palette($primary: red);')).toEqual(`\n\n$p: palette($primary: red, $generator: 'legacy');`);
        });

        it('should add the argument on its own line to a call with one argument per line', () => {
            expect(add('$p: palette(\n    $primary: red,\n    $surface: white\n);'))
                .toEqual(`$p: palette(\n    $primary: red,\n    $surface: white,\n    $generator: 'legacy'\n);`);
        });

        it('should keep a trailing comma and a comment closing the last line', () => {
            expect(add('$p: palette(\n    $primary: red,\n    $surface: white,\n);'))
                .toEqual(`$p: palette(\n    $primary: red,\n    $surface: white,\n    $generator: 'legacy',\n);`);
            expect(add('$p: palette(\n    $primary: red,\n    $surface: white // (the page)\n);'))
                .toEqual(`$p: palette(\n    $primary: red,\n    $surface: white, // (the page)\n    $generator: 'legacy'\n);`);
        });

        it('should add the argument to an empty call', () => {
            expect(add('$p: palette();')).toEqual(`$p: palette($generator: 'legacy');`);
        });

        it('should leave a call that passes the argument by name or by position', () => {
            const content = `$a: palette(red, blue, white, $generator : 'fitted');\n$b: palette(red, blue, white, null, red, red, red, red, null, 'fitted');`;
            expect(add(content)).toEqual(content);
        });

        it('should leave the mixin of the same name and the members with similar names', () => {
            const content = '@include palette($p);\n$a: color-palette(red);\n$b: palette-x(red);\n$c: map.get($palette, primary);';
            expect(add(content)).toEqual(content);
        });

        it('should add the argument to a call nested in another call of the owner', () => {
            expect(add('$p: palette($primary: color(palette(red, blue, white), primary), $secondary: blue, $surface: white);'))
                .toEqual(`$p: palette($primary: color(palette(red, blue, white, $generator: 'legacy'), primary), $secondary: blue, $surface: white, $generator: 'legacy');`);
        });

        it('should add the argument to calls nested in the include of the mixin', () => {
            expect(add('@include palette(palette(red, blue, white));'))
                .toEqual(`@include palette(palette(red, blue, white, $generator: 'legacy'));`);
        });

        it('should give an include without arguments the argument, unless only functions are asked for', () => {
            const addToMixin = (kind?: 'mixin' | 'function') => (sheet: SassStylesheet) =>
                addArgument(sheet, 'theme', { name: '$palette', value: '$p', kind });
            expect(apply(addToMixin('mixin'), '.a { @include theme; @include igx.theme; }'))
                .toEqual('.a { @include theme($palette: $p); @include igx.theme($palette: $p); }');
            expect(apply(addToMixin(), '.a\n  +theme', true)).toEqual('.a\n  +theme($palette: $p)');
            expect(apply(addToMixin('function'), '.a { @include theme; }')).toEqual('.a { @include theme; }');
        });

        it('should leave a call that spreads its arguments for manual review', () => {
            const content = '$p: palette($args...);';
            expect(add(content)).toEqual(content);
            expect(manual(sheet => addArgument(sheet, 'palette', generator), content).length).toBe(1);
        });

        it('should add the argument in the indented syntax, and leave the mixin shorthand', () => {
            expect(add('$p: palette(red, blue, white)\n:root\n  +palette($p)', true))
                .toEqual(`$p: palette(red, blue, white, $generator: 'legacy')\n:root\n  +palette($p)`);
        });
    });

    describe('renameVariable', () => {
        const rename = (content: string) => apply(sheet => renameVariable(sheet, '$old-palette', '$new-palette'), content);

        it('should rename declarations, reads and namespaced reads', () => {
            expect(rename('$old-palette: red;\n$a: igx.$old-palette;\n$b: fn($old-palette, $x: $old-palette);'))
                .toEqual('$new-palette: red;\n$a: igx.$new-palette;\n$b: fn($new-palette, $x: $new-palette);');
        });

        it('should rename the variable in an interpolation but not in literal text', () => {
            expect(rename(`$a: '#{$old-palette} $old-palette';`)).toEqual(`$a: '#{$new-palette} $old-palette';`);
        });

        it('should leave keyword arguments, map keys and longer names', () => {
            const content = '$a: fn($old-palette: 1);\n$m: ($old-palette: 1);\n$b: $old-palette-2;';
            expect(rename(content)).toEqual(content);
        });

        it('should treat underscores and hyphens in the name as the same', () => {
            expect(rename('$a: $old_palette;')).toEqual('$a: $new-palette;');
        });
    });

    describe('removeVariable', () => {
        const remove = (content: string, indented = false) => apply(sheet => removeVariable(sheet, '$browser-context'), content, indented);
        const reported = (content: string) => manual(sheet => removeVariable(sheet, '$browser-context'), content);

        it('should remove declarations with their line, including multi-line and namespaced ones', () => {
            expect(remove('$a: 1;\n$browser-context: 16px !default;\n$map: (\n    a: 1\n);\n')).toEqual('$a: 1;\n$map: (\n    a: 1\n);\n');
            expect(remove('$browser_context: (\n    a: 1,\n    b: 2\n);\n.a { config.$browser-context: 2; color: red; }'))
                .toEqual('.a {  color: red; }');
            expect(remove('$browser-context: 16px\n.a\n  color: red', true)).toEqual('.a\n  color: red');
        });

        it('should remove a declaration after another one in the indented syntax', () => {
            expect(remove('$other: 1\n$browser-context: 16px\n.a\n  $browser-context: 2\n  color: red', true))
                .toEqual('$other: 1\n.a\n  color: red');
            expect(manual(sheet => removeVariable(sheet, '$browser-context'), '$other: 1\n$browser-context: 16px', true)).toEqual([]);
        });

        it('should remove a declaration whose value holds an interpolation', () => {
            expect(remove('$browser-context: #{$size};\n$a: 1;')).toEqual('$a: 1;');
            expect(remove('$browser-context: #{$size}px\n$a: 1', true)).toEqual('$a: 1');
        });

        it('should leave other references for manual review and never write a replacement', () => {
            const content = `.a { width: rem(10px, $browser-context); content: '#{$browser-context}'; }`;
            expect(remove(content)).toEqual(content);
            expect(reported(content).length).toBe(2);
        });

        it('should leave keyword arguments, map keys and longer names alone', () => {
            const content = '$a: fn($browser-context: 1);\n$m: ($browser-context: 1);\n$b: $browser-context-2;';
            expect(remove(content)).toEqual(content);
            expect(reported(content)).toEqual([]);
        });
    });

    describe('updateModule', () => {
        const remove = { module: 'igniteui-angular/old', remove: true, member: 'styles' };

        it('should move every @use and @forward of the module, and only that module', () => {
            expect(apply(sheet => updateModule(sheet, { module: 'igniteui-angular/old', replaceWith: 'igniteui-angular/new' }),
                `@use "igniteui-angular/old" as o;\n@forward 'igniteui-angular/old';\n@use 'igniteui-angular/old-thing';`))
                .toEqual(`@use "igniteui-angular/new" as o;\n@forward 'igniteui-angular/new';\n@use 'igniteui-angular/old-thing';`);
        });

        it('should remove every @use of the module with the includes of its member', () => {
            expect(apply(sheet => updateModule(sheet, remove),
                `@use 'igniteui-angular/old' as a;\n@use 'igniteui-angular/old' with ($x: 1);\n.l {\n    @include a.styles;\n    @include old.styles();\n}`))
                .toEqual('.l {\n}');
        });

        it('should leave other references through the namespace for manual review', () => {
            const content = `@use 'igniteui-angular/old' as o;\n@include o.styles;\n$c: o.color();`;
            expect(apply(sheet => updateModule(sheet, remove), content)).toEqual('$c: o.color();');
            expect(manual(sheet => updateModule(sheet, remove), content).length).toBe(1);
        });

        it('should remove a module in the indented syntax', () => {
            expect(apply(sheet => updateModule(sheet, remove), `@use 'igniteui-angular/old' as o\n.a\n  +o.styles\n  color: red`, true))
                .toEqual('.a\n  color: red');
        });
    });

    describe('applyEditsWithMap', () => {
        it('should map offsets past, inside and before the applied edits', () => {
            const { content, map } = applyEditsWithMap('0123456789', [{ start: 2, end: 4, text: '' }, { start: 6, end: 6, text: 'ab' }]);
            expect(content).toEqual('0145ab6789');
            expect([map(1), map(3), map(5), map(8)]).toEqual([1, 2, 3, 8]);
        });
    });

    describe('applyEdits', () => {
        it('should put the edit collected first in front of another at the same offset', () => {
            expect(applyEdits('ab', [{ start: 1, end: 1, text: '1' }, { start: 1, end: 1, text: '2' }])).toEqual('a12b');
        });

        it('should drop an edit that overlaps one already applied', () => {
            expect(applyEdits('abcdef', [{ start: 1, end: 4, text: 'X' }, { start: 3, end: 5, text: 'Y' }])).toEqual('abcYf');
        });
    });
});
