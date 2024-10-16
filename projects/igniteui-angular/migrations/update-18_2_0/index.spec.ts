import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '18.2.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-40';

    it('Should replace deprecated `shouldGenerate` property with `autoGenerate`', async () => {
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

    it('should remove property `filterable` from Combo component', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-combo [filterable]="false"></igx-combo>
        <igx-combo filterable="true"></igx-combo>
        <igx-combo [filterable]="myProp"></igx-combo>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-combo [disableFiltering]="true"></igx-combo>
        <igx-combo [disableFiltering]="false"></igx-combo>
        <igx-combo [disableFiltering]="!(myProp)"></igx-combo>
        `
        );
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

    it('should remove hsla and hsl functions', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `.custom-body {
            	color: hsla(var(--ig-primary-A100));
            	background: hsla(var(--ig-gray-100));
            }

            .custom-header {
            	color: hsl(var(--ig-secondary-100));
            	background: hsl(var(--ig-gray-900));
            }`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
            `.custom-body {
            	color: var(--ig-primary-A100);
            	background: var(--ig-gray-100);
            }

            .custom-header {
            	color: var(--ig-secondary-100);
            	background: var(--ig-gray-900);
            }`
        );
    });

    it('should remove the $border-width property from the badge-theme', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-badge: badge-theme(
                $text-color: red,
                $border-width: 2px
            );`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-badge: badge-theme(
                $text-color: red
            );`
        );
    });
});
