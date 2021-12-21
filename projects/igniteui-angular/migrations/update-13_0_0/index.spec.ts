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

    it('should rename CarouselAnimationType to HorizontalAnimationType', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { Component, ViewChild } from '@angular/core';
        import { CarouselAnimationType } from 'igniteui-angular';

        @Component({
            selector: 'animationType',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class AnimationType {
            public animationType: CarouselAnimationType = CarouselAnimationType.slide;
        }
        `);
        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        const expectedContent = `import { Component, ViewChild } from '@angular/core';
        import { HorizontalAnimationType } from 'igniteui-angular';

        @Component({
            selector: 'animationType',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class AnimationType {
            public animationType: HorizontalAnimationType = HorizontalAnimationType.slide;
        }
        `;

        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should rename IgxComboComponent selectItems to select', async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
            `
            import { IgxComboComponent } from '../../../dist/igniteui-angular';

            export class MyCombo {
                public combo1: IgxComboComponent;
                public selectFavorites() {
                    this.combo1.selectItems(['UK01', 'BG01', 'JP01', 'DE01']);
                }
            }
            `)
            const tree = await schematicRunner
                .runSchematicAsync(migrationName, {}, appTree)
                .toPromise();

            const expectedContent =
            `
            import { IgxComboComponent } from '../../../dist/igniteui-angular';

            export class MyCombo {
                public combo1: IgxComboComponent;
                public selectFavorites() {
                    this.combo1.select(['UK01', 'BG01', 'JP01', 'DE01']);
                }
            }
            `;

            expect(
                tree.readContent(
                    'testSrc/appPrefix/component/test.component.ts'
                )
            ).toEqual(expectedContent);
    });

    it('should rename IgxComboComponent deselectItems to deselect', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `
            import { IgxComboComponent } from '../../../dist/igniteui-angular';

            export class MyComboClass {
                public combo1: IgxComboComponent;
                public deselectFavorites() {
                    this.combo1.deselectItems(["New York", "New Jersey"]);
                }
            }
            `)
            const tree = await schematicRunner
                .runSchematicAsync(migrationName, {}, appTree)
                .toPromise();

            const expectedContent =
            `
            import { IgxComboComponent } from '../../../dist/igniteui-angular';

            export class MyComboClass {
                public combo1: IgxComboComponent;
                public deselectFavorites() {
                    this.combo1.deselect(["New York", "New Jersey"]);
                }
            }
            `;

            expect(
                tree.readContent(
                    'testSrc/appPrefix/component/test.component.ts'
                )
            ).toEqual(expectedContent);
    });

    it('should rename IgxComboComponent selectedItems() to selection', async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
`import { IgxComboComponent } from '../../../dist/igniteui-angular';

export class MyComboClass {
    public combo1: IgxComboComponent;

    public myFunction() {
        const selection = this.combo1.selectedItems();
    }
}`)

const tree = await schematicRunner
    .runSchematicAsync(migrationName, {}, appTree)
    .toPromise();

const expectedContent =
`import { IgxComboComponent } from '../../../dist/igniteui-angular';

export class MyComboClass {
    public combo1: IgxComboComponent;

    public myFunction() {
        const selection = this.combo1.selection;
    }
}`;

            expect(
                tree.readContent(
                    'testSrc/appPrefix/component/test.component.ts'
                )
            ).toEqual(expectedContent);

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
</div>
`.replace(lineBreaksAndSpaceRegex, ''));
    });

    it('should insert a comment when exporter services are present in module.ts files', async () => {
        appTree.create('/testSrc/appPrefix/component/app.module.ts',
`import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
import { IgxCsvExporterService, IgxExcelExporterService } from "igniteui-angular";
import { ExcelExportComponent } from "./services/export-excel/excel-export.component";

@NgModule({
bootstrap: [AppComponent],
declarations: [
    AppComponent,
    ExcelExportComponent
],
imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule
],
providers: [
    IgxCsvExporterService,
    IgxExcelExporterService
],
entryComponents: [],
schemas: []
})
export class AppModule {}
`);

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/app.module.ts')
        ).toEqual(
`// IgxCsvExporterService and IgxExcelExporterService no longer need to be manually provided and can be safely removed.
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
import { IgxCsvExporterService, IgxExcelExporterService } from "igniteui-angular";
import { ExcelExportComponent } from "./services/export-excel/excel-export.component";

@NgModule({
bootstrap: [AppComponent],
declarations: [
    AppComponent,
    ExcelExportComponent
],
imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule
],
providers: [
    IgxCsvExporterService,
    IgxExcelExporterService
],
entryComponents: [],
schemas: []
})
export class AppModule {}
`);
    });

    it('Should properly rename rowData property to data',  async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
`import {
    IgxGridComponent,
    IgxTreeGridComponent,
    IgxHierarchicalGridComponent
} from '../../../dist/igniteui-angular';

export class MyClass {
    public grid: IgxGridComponent;
    public tgrid: IgxTreeGridComponent;
    public hgrid: IgxHierarchicalGridComponent;

    public myFunction() {
        // rowData
        const rowData = this.grid.getRowByIndex(0).rowData;
        const rowData2 = this.tgrid.getRowByIndex(0).rowData;
        const rowData3 = this.hgrid.getRowByIndex(0).rowData;
        const rowData4 = this.grid.rowList.first.rowData;
        const rowData5 = this.tgrid.rowList.first.rowData;
        const rowData6 = this.hgrid.rowList.first.rowData;
        // rowID
        const rowID = this.grid.getRowByIndex(0).rowID;
        const rowID2 = this.tgrid.getRowByIndex(0).rowID;
        const rowID3 = this.hgrid.getRowByIndex(0).rowID;
        const rowID4 = this.grid.rowList.first.rowID;
        const rowID5 = this.tgrid.rowList.first.rowID;
        const rowID6 = this.hgrid.rowList.first.rowID;
        const treeRowID = this.tgrid.getRowByIndex(0).treeRow.rowID;
    }
}`);

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
`import {
    IgxGridComponent,
    IgxTreeGridComponent,
    IgxHierarchicalGridComponent
} from '../../../dist/igniteui-angular';

export class MyClass {
    public grid: IgxGridComponent;
    public tgrid: IgxTreeGridComponent;
    public hgrid: IgxHierarchicalGridComponent;

    public myFunction() {
        // rowData
        const rowData = this.grid.getRowByIndex(0).data;
        const rowData2 = this.tgrid.getRowByIndex(0).data;
        const rowData3 = this.hgrid.getRowByIndex(0).data;
        const rowData4 = this.grid.rowList.first.data;
        const rowData5 = this.tgrid.rowList.first.data;
        const rowData6 = this.hgrid.rowList.first.data;
        // rowID
        const rowID = this.grid.getRowByIndex(0).key;
        const rowID2 = this.tgrid.getRowByIndex(0).key;
        const rowID3 = this.hgrid.getRowByIndex(0).key;
        const rowID4 = this.grid.rowList.first.key;
        const rowID5 = this.tgrid.rowList.first.key;
        const rowID6 = this.hgrid.rowList.first.key;
        const treeRowID = this.tgrid.getRowByIndex(0).treeRow.key;
    }
}`);
    });

    it('Should properly rename columnsCollection property to columns',  async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
        `
        import { IgxGridComponent } from '../../../dist/igniteui-angular';

        export class MyClass {
            public grid1: IgxGridComponent;
            const columns = this.grid1.columnsCollection;

            public soSth() {
                const editableColumns = this.grid1.columnsCollection.filter(c => e.editable);
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
        import { IgxGridComponent } from '../../../dist/igniteui-angular';

        export class MyClass {
            public grid1: IgxGridComponent;
            const columns = this.grid1.columns;

            public soSth() {
                const editableColumns = this.grid1.columns.filter(c => e.editable);
            }
        }
        `
        );
    });

    it('Should properly rename columnsCollection property to columns - treeGrid',  async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
        `
        import { IgxTreeGridComponent } from '../../../dist/igniteui-angular';

        export class MyClass {
            public tGrid1: IgxTreeGridComponent;
            const columns = this.tGrid1.columnsCollection;

            public soSth() {
                const editableColumns = this.tGrid1.columnsCollection.filter(c => e.editable);
            }
        }
        `);

        const expectedContent =
        `
        import { IgxTreeGridComponent } from '../../../dist/igniteui-angular';

        export class MyClass {
            public tGrid1: IgxTreeGridComponent;
            const columns = this.tGrid1.columns;

            public soSth() {
                const editableColumns = this.tGrid1.columns.filter(c => e.editable);
            }
        }
        `

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(expectedContent);
    });
});
