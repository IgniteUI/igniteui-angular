import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '21.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-53';

    it('should replace CSS custom properties prefix from --igx to --ig', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`.custom-avatar {
    --igx-avatar-background: var(--ig-primary-500);
}`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`.custom-avatar {
    --ig-avatar-background: var(--ig-primary-500);
}`
        );
    });

    it('should replace multiple --igx- occurrences in a single file', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/multi.component.scss`,
`.theme {
    --igx-surface-500: var(--igx-primary-500);
    color: var(--igx-secondary-200);
    background: var(--igx-surface-100);
}`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/multi.component.scss')
        ).toEqual(
`.theme {
    --ig-surface-500: var(--ig-primary-500);
    color: var(--ig-secondary-200);
    background: var(--ig-surface-100);
}`
        );
    });

    it('should leave files without --igx- unchanged', async () => {
        const original = `.card {
    --ig-primary-500: #000;
}`;

        appTree.create(
            `/testSrc/appPrefix/component/no-change.component.scss`,
            original
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/no-change.component.scss')
        ).toEqual(original);
    });

    it('should update --igx- inside :root and comments', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/root.component.scss`,
`:root {
    --igx-radius-factor: 1.25;
}

// --igx-elevation-1 is used for cards
.card {
    box-shadow: var(--igx-elevation-1);
}`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/root.component.scss')
        ).toEqual(
`:root {
    --ig-radius-factor: 1.25;
}

// --ig-elevation-1 is used for cards
.card {
    box-shadow: var(--ig-elevation-1);
}`
        );
    });
});
