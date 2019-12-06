import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 8.2.3', () => {
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

    it('should update igx-carousel-theme prop', done => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `$my-carousel-theme: igx-carousel-theme(
                $button-background: black,
                $disable-button-shadow: black,
                $button-hover-background: white
              );`
        );
        const tree = schematicRunner.runSchematic('migration-11', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss'))
        .toEqual(
            `$my-carousel-theme: igx-carousel-theme(
                $button-background: black,
                $button-shadow: black,
                $button-hover-background: white
              );`
        );
        done();
    });
});
