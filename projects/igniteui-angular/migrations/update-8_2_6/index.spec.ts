import * as path from 'path';
import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 8.2.6', () => {
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
        const tree = await schematicRunner.runSchematicAsync('migration-12', {}, appTree)
            .toPromise();
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
    });

    it('should update igx-grid-paginator-theme', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.scss',
            `@import '~igniteui-angular/lib/core/styles/components/grid-paginator/grid-paginator-component';
            @import '~igniteui-angular/lib/core/styles/components/grid-paginator/grid-paginator-theme';
            $dark-grid-paginator: igx-grid-paginator-theme($color: black);
            @include igx-grid-paginator($dark-grid-paginator);
            .igx-grid-paginator__pager {
                @include igx-button($dark-button);
            }
            $dark-grid-paginator-schema: extend($_dark-grid-pagination,());`
        );
        const tree = await schematicRunner.runSchematicAsync('migration-12', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss'))
        .toEqual(
            `@import '~igniteui-angular/lib/core/styles/components/paginator/paginator-component';
            @import '~igniteui-angular/lib/core/styles/components/paginator/paginator-theme';
            $dark-grid-paginator: igx-paginator-theme($color: black);
            @include igx-paginator($dark-grid-paginator);
            .igx-grid-paginator__pager {
                @include igx-button($dark-button);
            }
            $dark-grid-paginator-schema: extend($_dark-pagination,());`
        );
    });
});
