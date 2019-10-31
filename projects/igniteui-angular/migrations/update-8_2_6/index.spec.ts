import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 8.2.6', () => {
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
            `$my-toolbar-theme: igx-grid-toolbar-theme(
                $background-color: null,
                $button-background: null,
                $title-text-color: null,
                $button-text-color: null,
                $button-hover-background: null,
                $button-hover-text-color: null,
                $button-focus-background: null,
                $button-focus-text-color: null,
                $dropdown-background: null,
                $item-text-color: null,
                $item-hover-background: null,
                $item-hover-text-color: null,
                $item-focus-background: null,
                $item-focus-text-color: null
              );`
        );
        const tree = schematicRunner.runSchematic('migration-12', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss'))
        .toEqual(
            `$my-toolbar-theme: igx-grid-toolbar-theme(
                $background-color: null,
                $title-text-color: null,
                $dropdown-background: null,
                $item-text-color: null,
                $item-hover-background: null,
                $item-hover-text-color: null,
                $item-focus-background: null,
                $item-focus-text-color: null
              );`
        );
        done();
    });

    it('should update igx-grid-paginator-theme', done => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `$dark-grid-paginator: igx-grid-paginator-theme($color: black);
            @include igx-grid-paginator($dark-grid-paginator);
            .igx-grid-paginator__pager {
                @include igx-button($dark-button);
            }
            $dark-grid-paginator-schema: extend($_dark-grid-pagination,());`
        );
        const tree = schematicRunner.runSchematic('migration-12', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss'))
        .toEqual(
            `$dark-grid-paginator: igx-paginator-theme($color: black);
            @include igx-paginator($dark-grid-paginator);
            .igx-grid-paginator__pager {
                @include igx-button($dark-button);
            }
            $dark-grid-paginator-schema: extend($_dark-pagination,());`
        );
        done();
    });
});
