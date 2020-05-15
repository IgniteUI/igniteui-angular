import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { virtualFs } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 9.1.0', () => {
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

    it('should update igx-group supressInputAutofocus to suppressInputAutofocus', done => {
        appTree.create(
            `/testSrc/appPrefix/component/input.component.html`,
            '<igx-input-group [supressInputAutofocus]="true"><input igxInput></igx-input-group>'
        );

        const tree = schematicRunner.runSchematic('migration-15', {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/input.component.html'))
            .toEqual('<igx-input-group [suppressInputAutofocus]="true"><input igxInput></igx-input-group>');

        done();
    });

    it('should move igx-toast message property between element tags', done => {
        appTree.create(
            `/testSrc/appPrefix/component/input.component.html`,
            '<igx-toast message="test message"></igx-toast>'
        );

        const tree = schematicRunner.runSchematic('migration-15', {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/input.component.html'))
        .toEqual('<igx-toast>test message</igx-toast>');

        done();
    });

    // Except for testing for true and false (' and ") check for binded scenarios like "'prop'"
    it('should update rowSelectable to rowSelection', done => {
        appTree.create(
            `/testSrc/appPrefix/component/input.component.html`,
            `<igx-grid [rowSelectable]="true"></igx-grid>`
        );

        const tree = schematicRunner.runSchematic('migration-15', {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/input.component.html'))
        .toEqual(`<igx-grid rowSelection="multiple"></igx-grid>`);

        done();
    });

    it('should update rowSelectable to rowSelection when false', done => {
        appTree.create(
            `/testSrc/appPrefix/component/input.component.html`,
            `<h5 style="margin-top: 30px;">[rowSelectable]="true"</h5>
<igx-grid [data]="data" [primaryKey]="'ProductID'" width="700px" height="400px" [rowEditable]="true"
    [autoGenerate]="true"
    [rowSelectable]="true"
>
</igx-grid>
<h5 style="margin-top: 30px;">[rowSelectable]="'false'"</h5>
<igx-grid [data]="data" [primaryKey]="'ProductID'" width="700px" height="400px" [rowEditable]="true"
    [autoGenerate]="true"
    [rowSelectable]="false"
>
</igx-grid>
<h5 style="margin-top: 30px;">rowSelectable="multiple"</h5>
<igx-grid rowSelectable="true" >`);

        const tree = schematicRunner.runSchematic('migration-15', {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/input.component.html'))
        .toEqual(`<h5 style="margin-top: 30px;">[rowSelectable]="true"</h5>
<igx-grid [data]="data" [primaryKey]="'ProductID'" width="700px" height="400px" [rowEditable]="true"
    [autoGenerate]="true"
    rowSelection="multiple"
>
</igx-grid>
<h5 style="margin-top: 30px;">[rowSelectable]="'false'"</h5>
<igx-grid [data]="data" [primaryKey]="'ProductID'" width="700px" height="400px" [rowEditable]="true"
    [autoGenerate]="true"
    rowSelection="none"
>
</igx-grid>
<h5 style="margin-top: 30px;">rowSelectable="multiple"</h5>
<igx-grid rowSelection="multiple" >`);

        done();
    });
});
