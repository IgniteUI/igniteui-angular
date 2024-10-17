import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update 6.1.0', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should update igxToggle events and selectors', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-tab-bar attr igxForRemote="true"></igx-tab-bar>` +
            `<elem igxToggle (onOpen)="handler" (onClose)="handler"></elem>`
        );
        const tree = await schematicRunner.runSchematic('migration-04', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(
                `<igx-bottom-nav attr></igx-bottom-nav>` +
                `<elem igxToggle (onOpened)="handler" (onClosed)="handler"></elem>`);
    });
});
