import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '13.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
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
            .runSchematic(migrationName, {}, appTree);

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

    it('should rename IgxComboComponent selectedItems() to selection', async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
        `import { IgxComboComponent } from 'igniteui-angular';
        export class MyClass {
            public combo: IgxComboComponent;
            public ngAfterViewInit() {
                const items = this.combo.selectedItems();
            }
        }`);

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: true }, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
        `import { IgxComboComponent } from 'igniteui-angular';
        export class MyClass {
            public combo: IgxComboComponent;
            public ngAfterViewInit() {
                const items = this.combo.selection;
            }
        }`);
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
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

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
schemas: []
})
export class AppModule {}
`);

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

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
schemas: []
})
export class AppModule {}
`);
    });

    it('Should properly rename rowData property to data', async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
        `
        import { IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxGridComponent, { read: IgxGridComponent })
            public grid: IgxGridComponent;
            public tgrid: IgxTreeGridComponent;
            public hgrid: IgxHierarchicalGridComponent;
            public ngAfterViewInit() {
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
        }
        `);

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
        `
        import { IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxGridComponent, { read: IgxGridComponent })
            public grid: IgxGridComponent;
            public tgrid: IgxTreeGridComponent;
            public hgrid: IgxHierarchicalGridComponent;
            public ngAfterViewInit() {
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
        }
        `
        );
    });

    it('Should properly rename columnsCollection property to columns', async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
        `
        import { IgxGridComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxGridComponent, { read: IgxGridComponent })
            public grid1: IgxGridComponent;
            public ngAfterViewInit() {
                const columns = this.grid1.columnsCollection;
            }
        }
        `);

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
        `
        import { IgxGridComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxGridComponent, { read: IgxGridComponent })
            public grid1: IgxGridComponent;
            public ngAfterViewInit() {
                const columns = this.grid1.columns;
            }
        }
        `
        );
    });

    it('Should properly rename columnsCollection property to columns - treeGrid', async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
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
        `);

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
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
        `
        );
    });

    it('should remove grid toolbar inputs and define a igx-grid-toolbar component instead', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-grid #grid1 [data]="data" [showToolbar]='someVal' height="300px" width="300px"
        columnHiding="'true'" [toolbarTitle]='someVal1' columnHidingTitle='hidingTitle' hiddenColumnsText='hiddenColumns'
        [columnPinning]="someVal2" [columnPinningTitle]="pinningTitle" [pinnedColumnsText]="pinnedColumns">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
        <igx-grid #grid1 [data]="data" height="300px" width="300px">
<igx-grid-toolbar *ngIf="someVal">
<igx-grid-toolbar-title>someVal1</igx-grid-toolbar-title>
<igx-grid-toolbar-actions>
<igx-grid-toolbar-hiding title="hidingTitle" buttonText="hiddenColumns"></igx-grid-toolbar-hiding>
<igx-grid-toolbar-pinning *ngIf="someVal2" title="pinningTitle" buttonText="pinnedColumns"></igx-grid-toolbar-pinning>
</igx-grid-toolbar-actions>
</igx-grid-toolbar>
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
    });

    it('should migrate row island toolbar inputs to igx-grid-toolbar component instead', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
            <igx-hierarchical-grid [showExpandAll]='true' [data]="localData" [autoGenerate]="true" [height]="'600px'"
            [width]="'800px'" #hGrid [primaryKey]="'ID'">
            <igx-grid-toolbar>
            <igx-grid-toolbar-title>Singers</igx-grid-toolbar-title>
            <igx-grid-toolbar-actions>
            <igx-grid-toolbar-hiding title="Column Hiding" buttonText="Hidden"></igx-grid-toolbar-hiding>
            </igx-grid-toolbar-actions>
            </igx-grid-toolbar>
            <igx-row-island #island [key]="'childData'" [autoGenerate]="true"
            [primaryKey]="'ID'" [toolbarTitle]="someVal1" columnHiding="'true'" [columnHidingTitle]="hidingTitle"
            [columnPinning]="someVal2" hiddenColumnsText="Hidden">
                <igx-row-island [key]="'childData'" [autoGenerate]="true"
                    [allowFiltering]="true" [rowSelection]="'multiple'">
                </igx-row-island>
            </igx-row-island>
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [allowFiltering]="true"></igx-row-island>
            </igx-hierarchical-grid>`);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
            <igx-hierarchical-grid [showExpandAll]='true' [data]="localData" [autoGenerate]="true" [height]="'600px'"
            [width]="'800px'" #hGrid [primaryKey]="'ID'">
            <igx-grid-toolbar>
            <igx-grid-toolbar-title>Singers</igx-grid-toolbar-title>
            <igx-grid-toolbar-actions>
            <igx-grid-toolbar-hiding title="Column Hiding" buttonText="Hidden"></igx-grid-toolbar-hiding>
            </igx-grid-toolbar-actions>
            </igx-grid-toolbar>
            <igx-row-island #island [key]="'childData'" [autoGenerate]="true"
            [primaryKey]="'ID'">
<igx-grid-toolbar>
<igx-grid-toolbar-title>someVal1</igx-grid-toolbar-title>
<igx-grid-toolbar-actions>
<igx-grid-toolbar-hiding title="hidingTitle" buttonText="Hidden"></igx-grid-toolbar-hiding>
<igx-grid-toolbar-pinning *ngIf="someVal2"></igx-grid-toolbar-pinning>
</igx-grid-toolbar-actions>
</igx-grid-toolbar>
                <igx-row-island [key]="'childData'" [autoGenerate]="true"
                    [allowFiltering]="true" [rowSelection]="'multiple'">
                </igx-row-island>
            </igx-row-island>
            <igx-row-island [key]="'childData2'" [autoGenerate]="true" [allowFiltering]="true"></igx-row-island>
            </igx-hierarchical-grid>`);
    });

    it('should update existing toolbar component', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-grid #grid1 [data]="data" height="300px" width="300px" [toolbarTitle]="someVal1" [hiddenColumnsText]="hiddenColumns"
        [columnPinningTitle]="pinnedColumns">
<igx-grid-toolbar *ngIf="someVal">
<igx-grid-toolbar-actions>
<igx-grid-toolbar-hiding  title="hidingTitle"></igx-grid-toolbar-hiding>
</igx-grid-toolbar-actions>
</igx-grid-toolbar>
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
        <igx-grid #grid1 [data]="data" height="300px" width="300px">
<igx-grid-toolbar *ngIf="someVal">
<igx-grid-toolbar-title>someVal1</igx-grid-toolbar-title>
<igx-grid-toolbar-actions>
<igx-grid-toolbar-hiding title="hidingTitle" buttonText="hiddenColumns"></igx-grid-toolbar-hiding>
<igx-grid-toolbar-pinning title="pinnedColumns"></igx-grid-toolbar-pinning>
</igx-grid-toolbar-actions>
</igx-grid-toolbar>

            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
    });

    it('should remove grid toolbar inputs and define a igx-grid-toolbar component instead', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-grid #grid1 [data]="data" height="300px" width="300px"
        [pinnedColumnsText]="pinnedColumns">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
        <igx-grid #grid1 [data]="data" height="300px" width="300px">
<igx-grid-toolbar>
<igx-grid-toolbar-actions>
<igx-grid-toolbar-pinning buttonText="pinnedColumns"></igx-grid-toolbar-pinning>
</igx-grid-toolbar-actions>
</igx-grid-toolbar>
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
    });

    it('should contain all actions from the before toolbar', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-grid #grid1 hiddenColumnsText="Hidden" primaryKey='id'>
<igx-grid-toolbar *ngIf="showToolbar">
<igx-grid-toolbar-actions>
<igx-grid-toolbar-hiding title="Indicators"></igx-grid-toolbar-hiding>
<igx-grid-toolbar-pinning></igx-grid-toolbar-pinning>
<igx-grid-toolbar-exporter [exportCSV]="false">
<span excelText>Export to Excel</span>
</igx-grid-toolbar-exporter>
<igx-grid-toolbar-advanced-filtering>Custom text for the toggle button</igx-grid-toolbar-advanced-filtering>
</igx-grid-toolbar-actions>
</igx-grid-toolbar>
</igx-grid>`);
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
        <igx-grid #grid1 primaryKey='id'>
<igx-grid-toolbar *ngIf="showToolbar">
<igx-grid-toolbar-actions>
<igx-grid-toolbar-hiding title="Indicators" buttonText="Hidden"></igx-grid-toolbar-hiding>
<igx-grid-toolbar-pinning></igx-grid-toolbar-pinning>
<igx-grid-toolbar-exporter exportCSV="false">
<span excelText>Export to Excel</span>
</igx-grid-toolbar-exporter>
<igx-grid-toolbar-advanced-filtering>Custom text for the toggle button</igx-grid-toolbar-advanced-filtering>
</igx-grid-toolbar-actions>
</igx-grid-toolbar>

</igx-grid>`);
    });

    it('should remove grid toolbar exporter inputs and define a igx-grid-toolbar component instead', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-grid #grid1 [data]="data" height="300px" width="300px"
        [exportExcel]="true" [exportCsv]="csvExport">
        <igx-grid-toolbar>
        <igx-grid-toolbar-actions>
          <igx-grid-toolbar-exporter [exportCSV]="true" [exportExcel]="true">
          <span excelText>Custom text for the excel export entry</span>
          <span csvText>Custom text for the CSV export entry</span>
      </igx-grid-toolbar-exporter>
        </igx-grid-toolbar-actions>
    </igx-grid-toolbar>
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
        <igx-grid #grid1 [data]="data" height="300px" width="300px">
<igx-grid-toolbar>
<igx-grid-toolbar-actions>
<igx-grid-toolbar-exporter exportExcel="true" exportCSV="csvExport">
<span excelText>Custom text for the excel export entry</span>
<span csvText>Custom text for the CSV export entry</span>
</igx-grid-toolbar-exporter>
</igx-grid-toolbar-actions>
</igx-grid-toolbar>
        
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
    });

    it('should remove grid toolbar inputs but do not remove all templating inside tooblar component', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-grid #grid1 [data]="data" [showToolbar]="true" [toolbarTitle]="fdasfsa" height="300px" width="300px">
<igx-grid-toolbar>
<igx-select [(ngModel)]="currentSortingType" (selectionChanging)="sortTypeSelection($event)">
    <label igxLabel>Select Sorting Type</label>
    <igx-select-item *ngFor="let type of sortingTypes" [value]="type.value">
        {{type.name}}
    </igx-select-item>
</igx-select>
        </igx-grid-toolbar>
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
        <igx-grid #grid1 [data]="data" height="300px" width="300px">
<igx-grid-toolbar *ngIf="true">
<igx-grid-toolbar-title>fdasfsa</igx-grid-toolbar-title>
<igx-select [(ngModel)]="currentSortingType" (selectionChanging)="sortTypeSelection($event)">
    <label igxLabel>Select Sorting Type</label>
    <igx-select-item *ngFor="let type of sortingTypes" [value]="type.value">
        {{type.name}}
    </igx-select-item>
</igx-select>
</igx-grid-toolbar>

            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
    });
});
