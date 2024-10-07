import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update 8.2.3', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should update igx-carousel-theme prop', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `$my-carousel-theme: igx-carousel-theme(
                $button-background: black,
                $disable-button-shadow: black,
                $button-hover-background: white
              );`
        );
        const tree = await schematicRunner.runSchematic('migration-11', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss'))
        .toEqual(
            `$my-carousel-theme: igx-carousel-theme(
                $button-background: black,
                $button-shadow: black,
                $button-hover-background: white
              );`
        );
    });
});
