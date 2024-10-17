import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '15.0.11';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-28';

    it('should replace CSS $grays parameters', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`$my-palette: palette(
    $primary: #09f,
    $secondary: #e41c77,
    $grays: #000
);
$my-palette: palette(
    $primary: #09f,
    $secondary: #e41c77,
    $grays: #000123
);`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`$my-palette: palette(
    $primary: #09f,
    $secondary: #e41c77,
    $gray: #000
);
$my-palette: palette(
    $primary: #09f,
    $secondary: #e41c77,
    $gray: #000123
);`
        );
    });

    it('should replace CSS $grays parameters variations', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`$my-palette: palette(
    $grays: red,
    $grays: rgb(204, 102, 153),
    $grays: rgba(107, 113, 127, 0.8),
    $grays: hsl(228, 7%, 86%),
    $grays: hsla(20, 20%, 85%, 0.7),
);
$my-palette: palette(
    $grays: red,
    $grays: rgb(204, 102, 153),
    $grays: rgba(107, 113, 127, 0.8),
    $grays: hsl(228, 7%, 86%),
    $grays: hsla(20, 20%, 85%, 0.7),
);`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`$my-palette: palette(
    $gray: red,
    $gray: rgb(204, 102, 153),
    $gray: rgba(107, 113, 127, 0.8),
    $gray: hsl(228, 7%, 86%),
    $gray: hsla(20, 20%, 85%, 0.7),
);
$my-palette: palette(
    $gray: red,
    $gray: rgb(204, 102, 153),
    $gray: rgba(107, 113, 127, 0.8),
    $gray: hsl(228, 7%, 86%),
    $gray: hsla(20, 20%, 85%, 0.7),
);`
        );
    });

    it('should NOT replace $grays as custom var', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`$grays: #FFFFFF;`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`$grays: #FFFFFF;`
        );
    });

    it('should replace grays as value', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`.my-class {
    color: contrast-color($color: 'grays', $variant: 300);
}`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`.my-class {
    color: contrast-color($color: 'gray', $variant: 300);
}`
        );
    });

    it('should replace .igx-typography with .ig-typography as style', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`.igx-typography {
    h1, h2, h3, h4, h5, h6, p, .igx-typography__body-1 {
      margin: 0;
    }
}`);

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`.ig-typography {
    h1, h2, h3, h4, h5, h6, p, .ig-typography__body-1 {
      margin: 0;
    }
}`
        );
    });

    it('should replace igx-typography & igx-scrollbar from template', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
`<body class="igx-typography igx-scrollbar">
    <app-root></app-root>
</body>`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
`<body class="ig-typography ig-scrollbar">
    <app-root></app-root>
</body>`
        );
    });
});
