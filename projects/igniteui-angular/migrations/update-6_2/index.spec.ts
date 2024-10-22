import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update 6.2.0', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should update igxDatePicker selector', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-datePicker></igx-datePicker>`
        );
        const tree = await schematicRunner.runSchematic('migration-05', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-date-picker></igx-date-picker>`);
    });

    it('should remove igx-combo height property', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-combo [height]="200px"></igx-combo>`
        );
        const tree = await schematicRunner.runSchematic('migration-05', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-combo></igx-combo>`);
    });

    it('should move igx-icon name property value between element tags only for material fontSet', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-icon fontSet='material' name='phone'></igx-icon>
<igx-icon fontSet="material-icons" [name]="getName()"></igx-icon>
<igx-icon name="accessory"></igx-icon>
<igx-icon fontSet="svg-icons" name="my-icon"></igx-icon>`
        );

        const tree = await schematicRunner.runSchematic('migration-05', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-icon fontSet='material'>phone</igx-icon>
<igx-icon fontSet="material-icons">{{getName()}}</igx-icon>
<igx-icon>accessory</igx-icon>
<igx-icon fontSet="svg-icons" name="my-icon"></igx-icon>`);
    });

    it('should rename igx-grid onEditDone event', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-grid (onEditDone)="handler"></igx-grid> <not-igx-grid (onEditDone)="handler"></not-igx-grid>`
        );
        const tree = await schematicRunner.runSchematic('migration-05', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-grid (onCellEdit)="handler"></igx-grid> <not-igx-grid (onEditDone)="handler"></not-igx-grid>`);
    });
});
