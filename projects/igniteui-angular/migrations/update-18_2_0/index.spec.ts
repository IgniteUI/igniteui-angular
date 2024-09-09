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

    it('should remove property `filterable` from `filteringOptions`', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-combo [filteringOptions]="{ filterable: false, caseSensitive: true }"></igx-combo>
        <igx-combo [filteringOptions]="{ caseSensitive: false, filterable: true }"></igx-combo>
        <igx-combo [filteringOptions]="{ filterable: myProp }"></igx-combo>
        <igx-simple-combo [filteringOptions]="{ caseSensitive: false, filterable: true }"></igx-simple-combo>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-combo [filteringOptions]="{caseSensitive:true}" [disableFiltering]="true"></igx-combo>
        <igx-combo [filteringOptions]="{caseSensitive:false}" [disableFiltering]="false"></igx-combo>
        <igx-combo [disableFiltering]="myProp ? 'false' : 'true'"></igx-combo>
        <igx-simple-combo [filteringOptions]="{caseSensitive:false}" ></igx-simple-combo>
        `
        );
    });

    it('should remove filterable from the IComboFilteringOptions when its value is true', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/combo-test.component.ts',
            `import { Component } from '@angular/core';
            import { IComboFilteringOptions } from "igniteui-angular";
            @Component({
                selector: "app-combo-test",
                styleUrls: ["./combo-test.component.scss"],
                templateUrl: "./combo-test.component.html"
            })
            export class ComboComponent {
                public filteringOptions1: IComboFilteringOptions = { caseSensitive: false, filterable: true, filteringKey: undefined };
                public filteringOptions2: IComboFilteringOptions = { filterable: true, caseSensitive: false };
                public filteringOptions3: IComboFilteringOptions = { caseSensitive: false, filterable: true };
                constructor(){}
            }
        `);

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        const expectedContent =
            `import { Component } from '@angular/core';
            import { IComboFilteringOptions } from "igniteui-angular";
            @Component({
                selector: "app-combo-test",
                styleUrls: ["./combo-test.component.scss"],
                templateUrl: "./combo-test.component.html"
            })
            export class ComboComponent {
                public filteringOptions1: IComboFilteringOptions = { caseSensitive: false, filteringKey: undefined };
                public filteringOptions2: IComboFilteringOptions = { caseSensitive: false };
                public filteringOptions3: IComboFilteringOptions = { caseSensitive: false };
                constructor(){}
            }
        `;
        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/combo-test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should add comment after the use of filterable when its value is false', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/combo-test.component.ts',
            `import { Component } from '@angular/core';
            import { IComboFilteringOptions } from "igniteui-angular";
            @Component({
                selector: "app-combo-test",
                styleUrls: ["./combo-test.component.scss"],
                templateUrl: "./combo-test.component.html"
            })
            export class ComboComponent {
                public filteringOptions1: IComboFilteringOptions = { caseSensitive: false, filterable: false, filteringKey: undefined };
                public filteringOptions2: IComboFilteringOptions = { filterable: false, caseSensitive: false };
                combo.filteringOptions.filterable = false;
                constructor(){}
            }
        `);

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        const expectedContent =
            `import { Component } from '@angular/core';
            import { IComboFilteringOptions } from "igniteui-angular";
            @Component({
                selector: "app-combo-test",
                styleUrls: ["./combo-test.component.scss"],
                templateUrl: "./combo-test.component.html"
            })
            export class ComboComponent {
                public filteringOptions1: IComboFilteringOptions = { caseSensitive: false, filterable: false, filteringKey: undefined }; // TODO: Replace with disableFiltering
                public filteringOptions2: IComboFilteringOptions = { filterable: false, caseSensitive: false }; // TODO: Replace with disableFiltering
                combo.filteringOptions.filterable = false; // TODO: Replace with disableFiltering
                constructor(){}
            }
        `;
        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/combo-test.component.ts'
            )
        ).toEqual(expectedContent);
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
        <igx-combo disableFiltering="true"></igx-combo>
        <igx-combo disableFiltering="false"></igx-combo>
        <igx-combo disableFiltering="myProp ? 'false' : 'true' "></igx-combo>
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
});
