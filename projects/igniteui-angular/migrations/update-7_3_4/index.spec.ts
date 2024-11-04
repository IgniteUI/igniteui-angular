import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update 7.3.4', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should update time picker events', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-time-picker (onOpen)="handler" (onClose)="handler"></igx-time-picker>`
        );
        const tree = await schematicRunner.runSchematic('migration-09', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(
                `<igx-time-picker (onOpened)="handler" (onClosed)="handler"></igx-time-picker>`);
    });

    it('should update date picker events', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-date-picker (onOpen)="handler" (onClose)="handler"></igx-date-picker>`
        );
        const tree = await schematicRunner.runSchematic('migration-09', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(
                `<igx-date-picker (onOpened)="handler" (onClosed)="handler"></igx-date-picker>`);
    });
});
