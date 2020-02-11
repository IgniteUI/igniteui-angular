import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { virtualFs } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 9.0.0', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
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

    it('should update base class names.', done => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { IgxDropDownBase, IgxDropDownItemBase, IgxGridBaseComponent,
                IgxRowComponent, IgxHierarchicalGridBaseComponent } from 'igniteui-angular';
            `);

        const tree = schematicRunner.runSchematic('migration-13', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(
            `import { IgxDropDownBaseDirective, IgxDropDownItemBaseDirective, IgxGridBaseDirective,
                IgxRowDirective, IgxHierarchicalGridBaseDirective } from 'igniteui-angular';
            `);
        done();
    });

    it('should update Enum names.', done => {
        appTree.create(
            '/testSrc/appPrefix/component/enum.component.ts',
            `import { AvatarType, Size, Type, SliderType } from 'igniteui-angular';
            `);

        const tree = schematicRunner.runSchematic('migration-13', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/enum.component.ts'))
            .toEqual(
            `import { IgxAvatarType, IgxAvatarSize, IgxBadgeType, IgxSliderType } from 'igniteui-angular';
            `);
        done();
    });

    it('should update input prop from tabsType to type', done => {
        appTree.create(
            '/testSrc/appPrefix/component/tabs.component.html',
            '<igx-tabs tabsType="fixed"></igx-tabs>'
        );

        const tree = schematicRunner.runSchematic('migration-13', {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/tabs.component.html'))
            .toEqual('<igx-tabs type="fixed"></igx-tabs>');

        done();
    });
});
