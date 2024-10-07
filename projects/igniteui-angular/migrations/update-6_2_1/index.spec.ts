import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update 6.2.1', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should update Sass files', async () => {
        appTree.create(
            '/testSrc/appPrefix/style.scss',
`$dark-chip-theme: igx-chip-theme(
    $roundness: 4px,
    $chip-background: #180505,
    $chip-hover-background: white,
    $remove-icon-color: red,
    $dir-icon-color: yellow,
    $selected-chip-hover-background: gray
);`
        );
        const tree = await schematicRunner.runSchematic('migration-06', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/style.scss'))
            .toEqual(
`$dark-chip-theme: igx-chip-theme(
    $roundness: 4px,
    $background: #180505,
    $hover-background: white,
    $hover-selected-background: gray
);`
            );
    });
});
