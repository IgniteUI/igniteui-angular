import { Component, ViewChild } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { IgxExcelExporterService } from './excel-exporter';
import { IgxColumnComponent } from '../../grid/column.component';
import { IgxGridComponent } from '../../grid/grid.component';
import { IgxGridModule } from '../../grid';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { ExcelStrings } from './excel-strings';
import { ValueData, ExportTestDataService, FileContentData } from './test-data.service';
import { JSZipWrapper, ObjectComparer } from './jszip-verification-wrapper';
import { JSZipFiles } from './jsZip-helper';
// import { DataType } from "../data-operations/data-util";

fdescribe('Excel Exporter', () => {
    let exporter : IgxExcelExporterService;
    let actualData : FileContentData;
    let options : IgxExcelExporterOptions;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridMarkupPagingDeclarationComponent,
                GridDeclarationComponent
            ],
            imports: [IgxGridModule.forRoot()],
            providers: [ ExportTestDataService ]
        })
        .compileComponents().then(()=> {
            exporter = new IgxExcelExporterService();
            actualData = new FileContentData();
            options = new IgxExcelExporterOptions("GridExport");

            // Spy the private SaveFile method so the files are not really created
            spyOn(exporter as any, "SaveFile");
        });
    }));

    it("should export grid with raw data.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        fix.whenStable().then(() => {
            expect(grid.rowList.length).toEqual(10, "Invalid number of rows initialized!");

            getExportedData(grid, options).then((wrapper) => {
                    wrapper.verifyStructure();
                    wrapper.verifyTemplateFilesContent();
                    wrapper.verifyDataFilesContent(actualData.simpleGridDataContent);
                });
            });
    }));

    it("should export one grid page only with raw data.", async(() => {
        const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        fix.whenStable().then(() => {
            expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized!");

            options.exportCurrentlyVisiblePageOnly = true;

            getExportedData(grid, options).then((wrapper) => {
                    wrapper.verifyStructure();
                    wrapper.verifyTemplateFilesContent();
                    wrapper.verifyDataFilesContent(actualData.simpleGridDataPage1);
                });
            });
    }));

    fit("should export second grid page only.", async(() => {
        const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        fix.whenStable().then(() => {
            grid.paginate(2);
            fix.detectChanges();
            // expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized!");

            options.exportCurrentlyVisiblePageOnly = true;

            getExportedData(grid, options).then((wrapper) => {
                    wrapper.verifyStructure();
                    wrapper.verifyTemplateFilesContent();
                    wrapper.verifyDataFilesContent(actualData.simpleGridDataPage1);
                });
            });
    }));

    async function getExportedData( grid : IgxGridComponent, options : IgxExcelExporterOptions ) {
        let data = await new Promise<JSZipWrapper>(resolve => {
            exporter.onExportEnded.subscribe((value) => {
                let wrapper = new JSZipWrapper(value.xlsx);
                resolve(wrapper);
            });
            exporter.Export(grid, options);
        });
        return data;
    }
});

const data = new ExportTestDataService().simpleGridData;

@Component({
    template: `
    <igx-grid #grid1 [data]="data">
        <igx-column field="ID"></igx-column>
        <igx-column field="Name" [editable]="true"></igx-column>
        <igx-column field="JobTitle" [editable]="true"></igx-column>
    </igx-grid>
    `
})
export class GridDeclarationComponent {

    public data = data;

    @ViewChild("grid1", { read: IgxGridComponent })
    public grid1: IgxGridComponent;
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data" [paging]="true" [perPage]="3">
            <igx-column field="ID"></igx-column>
            <igx-column field="Name"></igx-column>
            <igx-column field="JobTitle"></igx-column>
        </igx-grid>
    `
})
export class GridMarkupPagingDeclarationComponent {
    public data = data;

    @ViewChild("grid1", { read: IgxGridComponent })
    public grid1: IgxGridComponent;
}

