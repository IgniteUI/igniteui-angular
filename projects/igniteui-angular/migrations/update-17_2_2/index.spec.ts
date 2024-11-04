import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '17.2.2';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-36';

    it('should replace button property `igxButtonColor` with `style.--foreground`', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <button igxButton [igxButtonColor]="red"></button>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <button igxButton [style.--foreground]="red"></button>
        `
        );
    });

    it('should replace button property `igxButtonBackground` with `style.--background`', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <button igxButton [igxButtonBackground]="red"></button>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <button igxButton [style.--background]="red"></button>
        `
        );
    });

    it('should remove igx-card-actions property `reverse`', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-card>
            <igx-card-actions [reverse]="true"></igx-card-actions>
        </igx-card>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-card>
            <igx-card-actions></igx-card-actions>
        </igx-card>
        `
        );
    });
});
