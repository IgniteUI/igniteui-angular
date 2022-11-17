import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 9.0.0', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                root: '/',
                sourceRoot: '/testSrc'
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
      };

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should update base class names.', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { IgxDropDownBase, IgxDropDownItemBase, IgxGridBaseComponent,
                IgxRowComponent, IgxHierarchicalGridBaseComponent } from 'igniteui-angular';
            `);

        const tree = await schematicRunner.runSchematicAsync('migration-13', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(
            `import { IgxDropDownBaseDirective, IgxDropDownItemBaseDirective, IgxGridBaseDirective,
                IgxRowDirective, IgxHierarchicalGridBaseDirective } from 'igniteui-angular';
            `);
    });

    it('should update Enum names.', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/enum.component.ts',
            `import { AvatarType, Size, Type, SliderType } from 'igniteui-angular';
            `);

        const tree = await schematicRunner.runSchematicAsync('migration-13', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/enum.component.ts'))
            .toEqual(
            `import { IgxAvatarType, IgxAvatarSize, IgxBadgeType, IgxSliderType } from 'igniteui-angular';
            `);
    });

    it('should update input prop from tabsType to type', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/tabs.component.html',
            '<igx-tabs tabsType="fixed"></igx-tabs>'
        );

        const tree = await schematicRunner.runSchematicAsync('migration-13', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/tabs.component.html'))
            .toEqual('<igx-tabs type="fixed"></igx-tabs>');

    });
});
