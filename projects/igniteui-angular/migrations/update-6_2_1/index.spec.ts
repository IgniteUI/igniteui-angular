import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 6.2.1', () => {
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

    it('should update Sass files', async () => {
        appTree.create(
            '/testSrc/appPrefix/style.scss',
`$dark-chip-theme: igx-chip-theme(
    $roundness: 4px,
    $chip-background: #180505,
    $chip-hover-background: white,
    $remove-icon-color: red,
    $dir-icon-color: yellow,
    $selected-chip-hover-background: gray
);`
        );
        const tree = await schematicRunner.runSchematicAsync('migration-06', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/style.scss'))
            .toEqual(
`$dark-chip-theme: igx-chip-theme(
    $roundness: 4px,
    $background: #180505,
    $hover-background: white,
    $hover-selected-background: gray
);`
            );
    });
});
