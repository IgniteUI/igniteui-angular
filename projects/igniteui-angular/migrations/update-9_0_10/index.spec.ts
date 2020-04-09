import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { virtualFs } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 9.0.10', () => {
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
});
