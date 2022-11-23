import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 8.2.3', () => {
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

    it('should update igx-carousel-theme prop', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `$my-carousel-theme: igx-carousel-theme(
                $button-background: black,
                $disable-button-shadow: black,
                $button-hover-background: white
              );`
        );
        const tree = await schematicRunner.runSchematicAsync('migration-11', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss'))
        .toEqual(
            `$my-carousel-theme: igx-carousel-theme(
                $button-background: black,
                $button-shadow: black,
                $button-hover-background: white
              );`
        );
    });
});
