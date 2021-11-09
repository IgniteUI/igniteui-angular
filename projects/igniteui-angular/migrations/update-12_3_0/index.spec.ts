import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '12.3.0';

describe(`Update to ${version}`, () => {
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

    const migrationName = 'migration-22';

    it('Should properly rename columnsCollection property to columns',  async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
        `
        import { IgxGridComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxGridComponent, { read: IgxGridComponent })
            public grid1: IgxGridComponent;
            public ngAfterViewInit() {
                const columns = grid1.columnsCollection;
            }
        }
        `);

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
        `
        import { IgxGridComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxGridComponent, { read: IgxGridComponent })
            public grid1: IgxGridComponent;
            public ngAfterViewInit() {
                const columns = grid1.columns;
            }
        }
        `
        );
    });

    it('Should properly rename columnsCollection property to columns - treeGrid',  async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
        `
        import { IgxTreeGridComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxTreeGridComponent, { read: IgxTreeGridComponent })
            public tGrid1: IgxTreeGridComponent;
            public ngAfterViewInit() {
                const columns = this.tGrid1.columns;
            }
            public soSth() {
                const editableColumns = this.tGrid1.columnsCollection.filter(c => e.editable);
            }
        }
        `);

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
        `
        import { IgxTreeGridComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxTreeGridComponent, { read: IgxTreeGridComponent })
            public tGrid1: IgxTreeGridComponent;
            public ngAfterViewInit() {
                const columns = this.tGrid1.columnsCollection;
            }
            public soSth() {
                const editableColumns = this.tGrid1.columns.filter(c => e.editable);
            }
        }
        `
        );
    });
});

