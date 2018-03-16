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
import { STRING_FILTERS } from '../../data-operations/filtering-condition';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { resolve } from 'url';
import { CallbackFunction } from 'tapable';
import { ColumnExportingEventArgs, RowExportingEventArgs } from './excel-event-args';

fdescribe('Excel Exporter', () => {
    let exporter : IgxExcelExporterService;
    let actualData : FileContentData;
    let options : IgxExcelExporterOptions;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridMarkupPagingDeclarationComponent,
                GridDeclarationComponent,
                GridReorderedColumnsComponent
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
                    wrapper.verifyDataFilesContent(actualData.simpleGridDataFull);
                });
            });
    }));

    it("should honor 'exportCurrentlyVisiblePageOnly' option.", async(() => {
        const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        grid.paging = true;
        options.exportCurrentlyVisiblePageOnly = true;

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridDataPage1, "Only page 1 should have been exported!");

                options.exportCurrentlyVisiblePageOnly = false;
                fix.detectChanges();
                getExportedData(grid, options).then((wrapper) => {
                    wrapper.verifyDataFilesContent(actualData.simpleGridDataFull, "All data should have been exported!");
                });
            });
        });
    }));

    it("should export currently visible grid page only.", async(() => {
        const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        fix.whenStable().then(() => {
            expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized!");
            options.exportCurrentlyVisiblePageOnly = true;

            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyStructure();
                wrapper.verifyTemplateFilesContent();
                wrapper.verifyDataFilesContent(actualData.simpleGridDataPage1, "Page 1 should have been exported!");

                grid.paginate(1);
                grid.cdr.detectChanges();
                fix.whenStable().then(() => {
                    fix.detectChanges();
                    getExportedData(grid, options).then((wrapper) => {
                        wrapper.verifyDataFilesContent(actualData.simpleGridDataPage2, "Page 2 should have been exported!");
                    });
                });
            });
        });
    }));

    it("should honor the change of items per page.", async(() => {
        const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        fix.whenStable().then(() => {
            expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized!");
            options.exportCurrentlyVisiblePageOnly = true;

            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridDataPage1, "Three rows should have been exported!");

                grid.perPage = 5;
                grid.cdr.detectChanges();
                fix.whenStable().then(() => {
                    fix.detectChanges();
                    expect(grid.rowList.length).toEqual(5, "Invalid number of rows initialized!");
                    getExportedData(grid, options).then((wrapper) => {
                        wrapper.verifyDataFilesContent(actualData.simpleGridDataPage1FiveRows, "5 rows should have been exported!");
                    });
                });
            });
        });
    }));

    it("should honor 'exportFilteredRows' option.", async(() => {
        const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;

        // Contains filter
        grid.filter("JobTitle", "Senior", STRING_FILTERS.contains, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);
        options.exportFilteredRows = false;

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridDataRecord5, "One row only should have been exported!");

                options.exportFilteredRows = true;
                fix.detectChanges();
                getExportedData(grid, options).then((wrapper) => {
                    wrapper.verifyDataFilesContent(actualData.simpleGridDataFull, "All 10 rows should have been exported!");
                });
            });
        });
    }));

    it("should honor filter criteria changes.", async(() => {
        const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        // Contains filter
        grid.filter("JobTitle", "Senior", STRING_FILTERS.contains, true);
        fix.detectChanges();
        expect(grid.rowList.length).toEqual(1);

        options.exportFilteredRows = false;

        fix.whenStable().then(() => {

            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridDataRecord5, "One row should have been exported!");

                grid.filter("JobTitle", "Director", STRING_FILTERS.equals, true);
                fix.detectChanges();
                fix.whenStable().then(() => {
                    fix.detectChanges();
                    expect(grid.rowList.length).toEqual(2, "Invalid number of rows after filtering!");
                    getExportedData(grid, options).then((wrapper) => {
                        wrapper.verifyDataFilesContent(actualData.simpleGridDataDirectors, "Two rows should have been exported!");
                    });
                });
            });
        });
    }));

    it("should honor 'exportHiddenColumns' option.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        grid.columns[0].hidden = true;
        options.exportHiddenColumns = false;

        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(grid.visibleColumns.length).toEqual(2, "Invalid number of visible columns!");
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitle, "Two columns should have been exported!");

                options.exportHiddenColumns = true;
                fix.detectChanges();
                getExportedData(grid, options).then((wrapper) => {
                    wrapper.verifyDataFilesContent(actualData.simpleGridDataFull, "All four columns should have been exported!");
                });
            });
        });
    }));

    it("should honor columns visibility changes.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        options.exportHiddenColumns = false;

        fix.whenStable().then(() => {
            expect(grid.visibleColumns.length).toEqual(3, "Invalid number of visible columns!");
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridDataFull, "All columns should have been exported!");

                grid.columns[0].hidden = true;
                fix.whenStable().then(() => {
                    fix.detectChanges();
                    expect(grid.visibleColumns.length).toEqual(2, "Invalid number of visible columns!");
                    getExportedData(grid, options).then((wrapper) => {
                        wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitle, "Two columns should have been exported!");

                        grid.columns[0].hidden = false;
                        fix.whenStable().then(() => {
                            fix.detectChanges();
                            expect(grid.visibleColumns.length).toEqual(3, "Invalid number of visible columns!");
                            getExportedData(grid, options).then((wrapper) => {
                                wrapper.verifyDataFilesContent(actualData.simpleGridDataFull, "All columns should have been exported!");

                                grid.columns[0].hidden = undefined;
                                fix.whenStable().then(() => {
                                    fix.detectChanges();
                                    expect(grid.visibleColumns.length).toEqual(3, "Invalid number of visible columns!");
                                    getExportedData(grid, options).then((wrapper) => {
                                        wrapper.verifyDataFilesContent(actualData.simpleGridDataFull, "All columns should have been exported!");

                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }));

    it("should honor columns declaration order.", async(() => {
        const fix = TestBed.createComponent(GridReorderedColumnsComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitleID);
            });
        });
    }));

    it("should honor applied sorting.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;
        grid.sort('Name', SortingDirection.Asc, true);

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridSortByName);
            });
        });
    }));

    it("should honor changes in applied sorting.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;
        grid.sort('Name', SortingDirection.Asc, true);

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridSortByName);

                grid.sort('Name', SortingDirection.Desc, true);

                fix.whenStable().then(() => {
                    fix.detectChanges();
                    getExportedData(grid, options).then((wrapper) => {
                        wrapper.verifyDataFilesContent(actualData.simpleGridSortByName);
                        grid.clearSort();

                        fix.whenStable().then(() => {
                            fix.detectChanges();
                            getExportedData(grid, options).then((wrapper) => {
                                wrapper.verifyDataFilesContent(actualData.simpleGridDataFull);
                            });
                        });
                    });
                });
            });
        });
    }));

    it("should export all columns with the width specified in options.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;

        let columnWidths = [ 100, 200, 0, undefined, null ];

        fix.whenStable().then(() => {
            setColWidthAndExport(grid, options, fix, columnWidths[0]).then(() => {
                setColWidthAndExport(grid, options, fix, columnWidths[1]).then(() => {
                    setColWidthAndExport(grid, options, fix, columnWidths[2]).then(() => {
                        setColWidthAndExport(grid, options, fix, columnWidths[3]).then(() => {
                            setColWidthAndExport(grid, options, fix, columnWidths[4]);
                        });
                    });
                });
            });
        });
    }));

    it("should export all rows with the height specified in options.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;

        let rowHeights = [ 20, 40, 0, undefined, null ];

        fix.whenStable().then(() => {
            setRowHeightAndExport(grid, options, fix, rowHeights[0]).then(() => {
                setRowHeightAndExport(grid, options, fix, rowHeights[1]).then(() => {
                    setRowHeightAndExport(grid, options, fix, rowHeights[2]).then(() => {
                        setRowHeightAndExport(grid, options, fix, rowHeights[3]).then(() => {
                            setRowHeightAndExport(grid, options, fix, rowHeights[4]);
                        });
                    });
                });
            });
        });
    }));

    it("should fire 'onColumnExport' for each grid column.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;

        let cols = [];
        exporter.onColumnExport.subscribe((value) => {
            cols.push({ header: value.header, index: value.columnIndex });
        });

        fix.whenStable().then(() => {
            getExportedData(grid, options).then(() => {
                // Should be 4 - HireDate is also exported although it's not shown in the grid!!!
                expect(cols.length).toBe(3);
                expect(cols[0].header).toBe("ID");
                expect(cols[0].index).toBe(0);
                expect(cols[1].header).toBe("Name");
                expect(cols[1].index).toBe(1);
                expect(cols[2].header).toBe("JobTitle");
                expect(cols[2].index).toBe(2);
            });
        });
    }));

    it("should fire 'onColumnExport' for each visible grid column.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;

        let cols = [];
        exporter.onColumnExport.subscribe((value) => {
            cols.push({ header: value.header, index: value.columnIndex });
        });

        grid.columns[0].hidden = true;
        options.exportHiddenColumns = false;

        fix.whenStable().then(() => {
            getExportedData(grid, options).then((wrapper) => {
                    expect(cols.length).toBe(2);
                    expect(cols[0].header).toBe("Name");
                    expect(cols[0].index).toBe(1);
                    expect(cols[1].header).toBe("JobTitle");
                    expect(cols[1].index).toBe(2);
                    wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitle);
                });
            });

    }));

    it("should not export columns when 'onColumnExport' is canceled.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;

        exporter.onColumnExport.subscribe((value : ColumnExportingEventArgs) => {
            value.cancel = true;
        });

        fix.whenStable().then(() => {
            getExportedData(grid, options).then((wrapper) => {
                    expect(wrapper.hasValues).toBe(false);
                    wrapper.verifyStructure();
                    wrapper.verifyTemplateFilesContent();
            });
        });
    }));

    it("should fire 'onRowExport' for each grid row.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;

        let rows = [];
        exporter.onRowExport.subscribe((value : RowExportingEventArgs) => {
            rows.push({ data: value.rowData, index: value.rowIndex });
        });

        fix.whenStable().then(() => {
            getExportedData(grid, options).then(() => {
                expect(rows.length).toBe(10);
                for (let i = 0; i < rows.length; i++) {
                    expect(rows[i].index).toBe(i);
                    expect(JSON.stringify(rows[i].data)).toBe(JSON.stringify(data[i]));
                }
            });
        });
    }));

    it("should fire 'onRowExport' for each visible grid row.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;

        let rows = [];
        exporter.onRowExport.subscribe((value : RowExportingEventArgs) => {
            rows.push({ data: value.rowData, index: value.rowIndex });
        });

        grid.paging = true;
        grid.perPage = 3;
        options.exportCurrentlyVisiblePageOnly = true;

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then(() => {
                expect(rows.length).toBe(3);
                for (let i = 0; i < rows.length; i++) {
                    expect(rows[i].index).toBe(i);
                    expect(JSON.stringify(rows[i].data)).toBe(JSON.stringify(data[i]));
                }
            });
        });
    }));

    it("should not export rows when 'onRowExport' is canceled.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;

        exporter.onRowExport.subscribe((value : RowExportingEventArgs) => {
            value.cancel = true;
        });

        fix.whenStable().then(() => {
            getExportedData(grid, options).then((wrapper) => {
                    expect(wrapper.hasValues).toBe(false);
                    wrapper.verifyStructure();
                    wrapper.verifyTemplateFilesContent();
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

    function setColWidthAndExport(grid, options : IgxExcelExporterOptions, fix, value) {
        return new Promise<void>(resolve => {
            options.columnWidth = value;
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridColumnWidth(value), " Width :" + value).then(() => resolve());
            });
        });
    }

    function setRowHeightAndExport(grid, options : IgxExcelExporterOptions, fix, value) {
        return new Promise<void>(resolve => {
            options.rowHeight = value;
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridRowHeight(value), " Height :" + value).then(() => resolve());
            });
        });
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

@Component({
    template: `
    <igx-grid #grid1 [data]="data">
        <igx-column field="Name"></igx-column>
        <igx-column field="JobTitle"></igx-column>
        <igx-column field="ID"></igx-column>
    </igx-grid>
    `
})
export class GridReorderedColumnsComponent {

    public data = data;

    @ViewChild("grid1", { read: IgxGridComponent })
    public grid1: IgxGridComponent;
}

