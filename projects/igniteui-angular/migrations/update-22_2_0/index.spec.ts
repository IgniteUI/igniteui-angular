import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing/index.js';
import { setupTestTree } from '../common/setup.spec';

const version = '22.2.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-61';

    it('should remove scrollbar-theme properties that no longer have effect', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$my-scrollbar: scrollbar-theme(
    $sb-size: 16px,
    $sb-thumb-bg-color: blue,
    $sb-thumb-bg-color-hover: navy,
    $sb-thumb-border-radius: 4px,
    $sb-track-bg-color: black,
    $sb-corner-bg: gray
);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$my-scrollbar: scrollbar-theme(
    $sb-thumb-bg-color: blue,
    $sb-track-bg-color: black
);`
        );
    });

    it('should leave the supported scrollbar-theme properties untouched', async () => {
        const content = `$my-scrollbar: scrollbar-theme(
    $sb-thumb-bg-color: blue,
    $sb-track-bg-color: black
);`;
        appTree.create(`/testSrc/appPrefix/component/test.component.scss`, content);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(content);
    });

    it('should keep the brackets balanced when the theme is nested in another call', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `.selection-area {
    @include scrollbar(scrollbar-theme($sb-size: 6px));
}

igx-grid {
    @include scrollbar(scrollbar-theme($sb-thumb-bg-color: blue, $sb-size: 16px));
}`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `.selection-area {
    @include scrollbar(scrollbar-theme());
}

igx-grid {
    @include scrollbar(scrollbar-theme($sb-thumb-bg-color: blue));
}`
        );
    });

    it('should migrate a theme call that is not terminated by a semicolon', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$my-scrollbar: scrollbar-theme(
    $sb-size: 16px,
    $sb-thumb-bg-color: blue
)`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$my-scrollbar: scrollbar-theme(
    $sb-thumb-bg-color: blue
)`
        );
    });

    it('should keep a retained property when a comment in the argument list holds an apostrophe', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$my-scrollbar: scrollbar-theme($sb-size: 6px /* user's size */, $sb-thumb-bg-color: red);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$my-scrollbar: scrollbar-theme( $sb-thumb-bg-color: red);`
        );
    });

    it('should remove the properties that follow a comment holding an apostrophe', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$my-scrollbar: scrollbar-theme(
    $sb-size: 16px, // don't need this anymore
    $sb-thumb-bg-color: blue,
    $sb-corner-bg: gray
);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$my-scrollbar: scrollbar-theme( // don't need this anymore
    $sb-thumb-bg-color: blue
);`
        );
    });

    it('should migrate a theme below a comment glued to a closing brace', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `.selection-area {
    color: red;
}// don't set $sb-size here

$my-scrollbar: scrollbar-theme($sb-size: 16px, $sb-thumb-bg-color: blue);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `.selection-area {
    color: red;
}// don't set $sb-size here

$my-scrollbar: scrollbar-theme( $sb-thumb-bg-color: blue);`
        );
    });

    it('should migrate a theme preceded on the same line by a protocol-relative url()', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `.a { background: url(//cdn.example.com/bg.png); $my: scrollbar-theme($sb-size: 16px, $sb-thumb-bg-color: red); }`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `.a { background: url(//cdn.example.com/bg.png); $my: scrollbar-theme( $sb-thumb-bg-color: red); }`
        );
    });

    it('should not rewrite a mixin or a function declared with the theme name', async () => {
        const content = `@mixin scrollbar-theme($sb-size: 16px) {
    width: $sb-size;
}

@function scrollbar-theme($sb-size: 6px) {
    @return ($size: $sb-size);
}`;
        appTree.create(`/testSrc/appPrefix/component/test.component.scss`, content);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(content);
    });

    it('should not touch same-named properties on other themes', async () => {
        const content = `$my-grid: grid-theme(
    $sb-size: 16px
);`;
        appTree.create(`/testSrc/appPrefix/component/test.component.scss`, content);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(content);
    });

    it('should replace button group multiSelection bound to true with selectionMode multi', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-buttongroup [multiSelection]="true" [values]="buttons"></igx-buttongroup>
<igx-buttongroup [values]="buttons" [multiSelection]='true'></igx-buttongroup>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
            `<igx-buttongroup [selectionMode]="'multi'" [values]="buttons"></igx-buttongroup>
<igx-buttongroup [values]="buttons" [selectionMode]="'multi'"></igx-buttongroup>`
        );
    });

    it('should remove button group multiSelection bound to false', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-buttongroup [multiSelection]="false">
    <button igxButton>Button 1</button>
</igx-buttongroup>
<igx-buttongroup [values]="buttons"
    [multiSelection]="false"></igx-buttongroup>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
            `<igx-buttongroup>
    <button igxButton>Button 1</button>
</igx-buttongroup>
<igx-buttongroup [values]="buttons"></igx-buttongroup>`
        );
    });

    it('should convert button group multiSelection bound to an expression to a selectionMode expression', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-buttongroup [multiSelection]="isMulti" [values]="buttons"></igx-buttongroup>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
            `<igx-buttongroup [selectionMode]="(isMulti) ? 'multi' : 'single'" [values]="buttons"></igx-buttongroup>`
        );
    });

    it('should replace static button group multiSelection attributes', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-buttongroup multiSelection="true" [values]="buttons"></igx-buttongroup>
<igx-buttongroup multiSelection="false" [values]="buttons"></igx-buttongroup>
<igx-buttongroup multiSelection [values]="buttons"></igx-buttongroup>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
            `<igx-buttongroup selectionMode="multi" [values]="buttons"></igx-buttongroup>
<igx-buttongroup [values]="buttons"></igx-buttongroup>
<igx-buttongroup [values]="buttons"></igx-buttongroup>`
        );
    });

    it('should replace button group multiSelection in inline component templates', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/inline.component.ts`,
            `import { Component } from '@angular/core';

@Component({
    selector: 'app-inline',
    template: \`
        <igx-buttongroup [multiSelection]="true" [values]="buttons"></igx-buttongroup>
        <igx-buttongroup [values]="buttons" multiSelection="false"></igx-buttongroup>
        <igx-buttongroup [multiSelection]="mode === 'multi'"></igx-buttongroup>
    \`
})
export class InlineComponent { }

@Component({
    selector: 'app-quoted',
    template: '<igx-buttongroup [multiSelection]="true"></igx-buttongroup>'
})
export class QuotedComponent { }`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/inline.component.ts')).toEqual(
            `import { Component } from '@angular/core';

@Component({
    selector: 'app-inline',
    template: \`
        <igx-buttongroup [selectionMode]="'multi'" [values]="buttons"></igx-buttongroup>
        <igx-buttongroup [values]="buttons"></igx-buttongroup>
        <igx-buttongroup [selectionMode]="(mode === 'multi') ? 'multi' : 'single'"></igx-buttongroup>
    \`
})
export class InlineComponent { }

@Component({
    selector: 'app-quoted',
    template: '<igx-buttongroup [selectionMode]="\\'multi\\'"></igx-buttongroup>'
})
export class QuotedComponent { }`
        );
    });

    it('should warn about and not modify inline templates with interpolations', async () => {
        const content = `import { Component } from '@angular/core';

const mode = 'true';

@Component({
    selector: 'app-interpolated',
    template: \`<igx-buttongroup [multiSelection]="\${mode}"></igx-buttongroup>\`
})
export class InterpolatedComponent { }`;
        appTree.create(`/testSrc/appPrefix/component/interpolated.component.ts`, content);

        const warnings: string[] = [];
        const subscription = schematicRunner.logger.subscribe(entry => {
            if (entry.level === 'warn') {
                warnings.push(entry.message);
            }
        });
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);
        subscription.unsubscribe();

        expect(tree.readContent('/testSrc/appPrefix/component/interpolated.component.ts')).toEqual(content);
        expect(warnings).toEqual([
            '/testSrc/appPrefix/component/interpolated.component.ts: replace the removed IgxButtonGroupComponent multiSelection input with selectionMode manually.'
        ]);
    });

    it('should replace button group multiSelection in templateUrl files not named component.html', async () => {
        const component = `import { Component } from '@angular/core';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.html'
})
export class ToolbarComponent { }`;
        appTree.create(`/testSrc/appPrefix/component/toolbar.ts`, component);
        appTree.create(
            `/testSrc/appPrefix/component/toolbar.html`,
            `<igx-buttongroup [multiSelection]="true" [values]="buttons"></igx-buttongroup>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/toolbar.html')).toEqual(
            `<igx-buttongroup [selectionMode]="'multi'" [values]="buttons"></igx-buttongroup>`
        );
        expect(tree.readContent('/testSrc/appPrefix/component/toolbar.ts')).toEqual(component);
    });

    it('should migrate a component.html template referenced through templateUrl once', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.ts`,
            `import { Component } from '@angular/core';

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html'
})
export class TestComponent { }`
        );
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-buttongroup [values]="buttons" [multiSelection]="false" alignment="vertical"></igx-buttongroup>`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
            `<igx-buttongroup [values]="buttons" alignment="vertical"></igx-buttongroup>`
        );
    });

    it('should not modify html files that are not component templates', async () => {
        const content = `<igx-buttongroup [multiSelection]="true"></igx-buttongroup>`;
        appTree.create(`/testSrc/appPrefix/component/snippet.html`, content);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/snippet.html')).toEqual(content);
    });

    it('should not touch multiSelection on elements other than the button group', async () => {
        const content = `<igx-buttongroup selectionMode="multi"></igx-buttongroup>
<my-list [multiSelection]="true"></my-list>`;
        appTree.create(`/testSrc/appPrefix/component/test.component.html`, content);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(content);
    });
});
