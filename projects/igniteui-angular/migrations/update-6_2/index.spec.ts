import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { virtualFs } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 6.2.0', () => {
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

    it('should update igxDatePicker selector', done => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-datePicker></igx-datePicker>`
        );
        const tree = schematicRunner.runSchematic('migration-05', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-date-picker></igx-date-picker>`);
        done();
    });

    it('should remove igx-combo height property', done => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-combo [height]="200px"></igx-combo>`
        );
        const tree = schematicRunner.runSchematic('migration-05', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-combo></igx-combo>`);
        done();
    });

    it('should move igx-icon name property value between element tags only for material fontSet', done => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-icon fontSet='material' name='phone'></igx-icon>
<igx-icon fontSet="material-icons" [name]="getName()"></igx-icon>
<igx-icon name="accessory"></igx-icon>
<igx-icon fontSet="svg-icons" name="my-icon"></igx-icon>`
        );

        const tree = schematicRunner.runSchematic('migration-05', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-icon fontSet='material'>phone</igx-icon>
<igx-icon fontSet="material-icons">{{getName()}}</igx-icon>
<igx-icon>accessory</igx-icon>
<igx-icon fontSet="svg-icons" name="my-icon"></igx-icon>`);
        done();
    });

    it('should rename igx-grid onEditDone event', done => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-grid (onEditDone)="handler"></igx-grid> <not-igx-grid (onEditDone)="handler"></not-igx-grid>`
        );
        const tree = schematicRunner.runSchematic('migration-05', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`<igx-grid (onCellEdit)="handler"></igx-grid> <not-igx-grid (onEditDone)="handler"></not-igx-grid>`);
        done();
    });
});
