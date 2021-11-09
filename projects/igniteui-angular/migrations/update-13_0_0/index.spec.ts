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

    it('should remove exporter services from module.ts files', async () => {
        appTree.create('/testSrc/appPrefix/component/app.module.ts', `
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
import { IgxExcelExporterService } from "igniteui-angular";
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
providers: [IgxExcelExporterService],
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
        ).toEqual( `
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
// IgxExcelExporterService has been removed. Exporter services can now be used without providing.
import { /*IgxExcelExporterService*/ } from "igniteui-angular";
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
// IgxExcelExporterService has been removed. Exporter services can now be used without providing.
providers: [/*IgxExcelExporterService*/],
entryComponents: [],
schemas: []
})
export class AppModule {}
`);
    });
});
