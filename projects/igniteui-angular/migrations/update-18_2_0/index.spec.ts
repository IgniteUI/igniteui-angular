import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '18.2.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    const configJson = {
        projects: {
            testProj: {
                root: '/',
                sourceRoot: '/testSrc',
                architect: {
                    build: {
                        options: {
                            styles: [
                                "/testSrc/styles.scss"
                            ] as (string | object)[]
                        }
                    }
                }
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
        appTree.create('/testSrc/styles.scss', `
@use "mockStyles.scss";
@forward something;
`);
    });

    const migrationName = 'migration-40';

    it('Should replace deprecated `shouldGenerate` property with `autoGenerate`', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create(
            '/testSrc/appPrefix/component/grid-test.component.ts',
            `import { Component } from '@angular/core';
    import { IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxPivotGridComponent } from 'igniteui-angular';

    @Component({
        selector: 'app-grid-test',
        templateUrl: './grid-test.component.html',
        styleUrls: ['./grid-test.component.scss']
    })
    export class GridTestComponent {
        public grid: IgxGridComponent;
        public treeGrid: IgxTreeGridComponent;
        public hierarchicalGrid: IgxHierarchicalGridComponent;
        public pivotGrid: IgxPivotGridComponent;

        ngOnInit() {
            this.grid.shouldGenerate = true;
            this.treeGrid.shouldGenerate = false;
            this.hierarchicalGrid.shouldGenerate = true;
            this.pivotGrid.shouldGenerate = false;
        }
    }`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);
        const expectedContent = `import { Component } from '@angular/core';
    import { IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxPivotGridComponent } from 'igniteui-angular';

    @Component({
        selector: 'app-grid-test',
        templateUrl: './grid-test.component.html',
        styleUrls: ['./grid-test.component.scss']
    })
    export class GridTestComponent {
        public grid: IgxGridComponent;
        public treeGrid: IgxTreeGridComponent;
        public hierarchicalGrid: IgxHierarchicalGridComponent;
        public pivotGrid: IgxPivotGridComponent;

        ngOnInit() {
            this.grid.autoGenerate = true;
            this.treeGrid.autoGenerate = false;
            this.hierarchicalGrid.autoGenerate = true;
            this.pivotGrid.autoGenerate = false;
        }
    }`;

        expect(tree.readContent('/testSrc/appPrefix/component/grid-test.component.ts')).toEqual(expectedContent);
    });

    it('should migrate scrollbar theme', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$my-scrollbar: scrollbar-theme(
                $scrollbar-size: 16px,
                $thumb-background: blue,
                $track-background: black,
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$my-scrollbar: scrollbar-theme(
                $sb-size: 16px,
                $sb-thumb-bg-color: blue,
                $sb-track-bg-color: black,
            );`
        );
    });
});
