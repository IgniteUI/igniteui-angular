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
});
