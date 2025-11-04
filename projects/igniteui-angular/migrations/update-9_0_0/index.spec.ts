import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update 9.0.0', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should update base class names.', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { IgxDropDownBase, IgxDropDownItemBase, IgxGridBaseComponent, IgxRowComponent, IgxHierarchicalGridBaseComponent } from 'igniteui-angular/core';;
            `);

        const tree = await schematicRunner.runSchematic('migration-13', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(
            `import { IgxDropDownBaseDirective, IgxDropDownItemBaseDirective, IgxGridBaseDirective, IgxHierarchicalGridBaseDirective } from 'igniteui-angular/core';
import { IgxRowDirective } from 'igniteui-angular/grids';;
            `);
    });

    it('should update Enum names.', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/enum.component.ts',
            `import { AvatarType } from 'igniteui-angular/avatar';
import { Size, SliderType } from 'igniteui-angular/core';
import { Type } from 'igniteui-angular/badge';;
            `);

        const tree = await schematicRunner.runSchematic('migration-13', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/enum.component.ts'))
            .toEqual(
            `import { IgxAvatarType } from 'igniteui-angular/core';
import { IgxAvatarSize } from 'igniteui-angular/avatar';
import { IgxBadgeType } from 'igniteui-angular/badge';
import { IgxSliderType } from 'igniteui-angular/slider';;
            `);
    });

    it('should update input prop from tabsType to type', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/tabs.component.html',
            '<igx-tabs tabsType="fixed"></igx-tabs>'
        );

        const tree = await schematicRunner.runSchematic('migration-13', {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/tabs.component.html'))
            .toEqual('<igx-tabs type="fixed"></igx-tabs>');

    });
});
