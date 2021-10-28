import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '13.0.0';

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
    const lineBreaksAndSpaceRegex = /\s/g;

    /* eslint-disable arrow-parens */
    it('Should properly rename columns property to columnsCollection',  async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
        `
        import { IgxGridComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxGridComponent, { read: IgxGridComponent })
            public grid1: IgxGridComponent;

            public ngAfterViewInit() {
                const columns = grid1.columns;
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
                const columns = grid1.columnsCollection;
            }
        }
        `
        );
    });

    it('Should properly rename columns property to columnsCollection - treeGrid',  async () => {
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
                const editableColumns = this.tGrid1.columns.filter(c => e.editable);
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
                const editableColumns = this.tGrid1.columnsCollection.filter(c => e.editable);
            }
        }
        `
        );
    });

    it('should remove paging and paginationTemplate property and define a igx-paginator component with custom content', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<div class="columnHidingContainer">
    <div *ngFor="let col of grid.columns">
        {{col.field}}
    </div>
</div>
<div class="gridContainer">
    <igx-grid igxPreventDocumentScroll #grid [data]="data" [autoGenerate]="false" width="100%" height="560px" columnWidth="200px"
        [allowFiltering]="true">
        <igx-column [field]="'ID'" dataType="string" [sortable]="true"></igx-column>
        <igx-column [field]="'ContactName'" dataType="string" [sortable]="true" [disableHiding]="true"></igx-column>
        <igx-column [field]="'ContactTitle'" dataType="string" [sortable]="true" [disableHiding]="true"></igx-column>
        <igx-column [field]="'City'" dataType="string" [sortable]="true"></igx-column>
        <igx-column [field]="'CompanyName'" dataType="string" [sortable]="true"></igx-column>
    </igx-grid>
</div>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html').replace(lineBreaksAndSpaceRegex, ''))
            .toEqual(`
<div class="columnHidingContainer">
    <div *ngFor="let col of grid.columnsCollection">
        {{col.field}}
    </div>
</div>
<div class="gridContainer">
    <igx-grid igxPreventDocumentScroll #grid [data]="data" [autoGenerate]="false" width="100%" height="560px" columnWidth="200px"
        [allowFiltering]="true">
        <igx-column [field]="'ID'" dataType="string" [sortable]="true"></igx-column>
        <igx-column [field]="'ContactName'" dataType="string" [sortable]="true" [disableHiding]="true"></igx-column>
        <igx-column [field]="'ContactTitle'" dataType="string" [sortable]="true" [disableHiding]="true"></igx-column>
        <igx-column [field]="'City'" dataType="string" [sortable]="true"></igx-column>
        <igx-column [field]="'CompanyName'" dataType="string" [sortable]="true"></igx-column>
    </igx-grid>
</div>
`.replace(lineBreaksAndSpaceRegex, ''));
    });
});
