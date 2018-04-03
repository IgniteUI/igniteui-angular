import { Component, ViewChild } from "@angular/core";
import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { STRING_FILTERS } from "../../data-operations/filtering-condition";
import { SortingDirection } from "../../data-operations/sorting-expression.interface";
import { IgxGridModule } from "../../grid";
import { IgxColumnComponent } from "../../grid/column.component";
import { IgxGridComponent } from "../../grid/grid.component";
import {
    GridDeclarationComponent,
    GridMarkupPagingDeclarationComponent,
    GridReorderedColumnsComponent } from "../exporter-common/components-declarations";
import { IColumnExportingEventArgs, IRowExportingEventArgs } from "../exporter-common/event-args";
import { ExportUtilities } from "../exporter-common/export-utilities";
import { TestMethods } from "../exporter-common/test-methods";
import { IgxExcelExporterService } from "./excel-exporter";
import { IgxExcelExporterOptions } from "./excel-exporter-options";
import { ExcelStrings } from "./excel-strings";
import { JSZipFiles } from "./jszip-helper";
import { JSZipWrapper, ObjectComparer } from "./jszip-verification-wrapper";
import { ExportTestDataService, FileContentData, ValueData } from "./test-data.service";

describe("Excel Exporter", () => {
    let exporter: IgxExcelExporterService;
    let actualData: FileContentData;
    let options: IgxExcelExporterOptions;
    const data = new ExportTestDataService().simpleGridData;

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
        .compileComponents().then(() => {
            exporter = new IgxExcelExporterService();
            actualData = new FileContentData();
            options = new IgxExcelExporterOptions("GridExcelExport");

            // Set column width to a specific value to workaround the issue where
            // different platforms measure text differently
            options.columnWidth = 50;

            // Spy the saveBlobToFile method so the files are not really created
            spyOn(ExportUtilities as any, "saveBlobToFile");
        });
    }));

    it("should export grid as displayed.", async(() => {
        const currentGrid: IgxGridComponent = null;
        TestMethods.testRawData(currentGrid, (grid) => {

            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyStructure();
                wrapper.verifyTemplateFilesContent();
                wrapper.verifyDataFilesContent(actualData.simpleGridData);
            });
        });
    }));

    // it("should export grid with raw data.", async(() => {
    //     const currentGrid: IgxGridComponent = null;
    //     TestMethods.testRawData(currentGrid, (grid) => {
    //         options.ignoreColumnsVisibility = true;
    //         options.ignoreFiltering = true;
    //         getExportedData(grid, options).then((wrapper) => {
    //             wrapper.verifyStructure();
    //             wrapper.verifyTemplateFilesContent();
    //             wrapper.verifyDataFilesContent(actualData.simpleGridDataFull);
    //         });
    //     });
    // }));

    // it("should honor 'exportCurrentlyVisiblePageOnly' option.", async(() => {
    //     const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
    //     fix.detectChanges();

    //     const grid = fix.componentInstance.grid1;
    //     grid.paging = true;
    //     options.exportCurrentlyVisiblePageOnly = true;

    //     fix.whenStable().then(() => {
    //         fix.detectChanges();
    //         getExportedData(grid, options).then((wrapper) => {
    //             wrapper.verifyDataFilesContent(actualData.simpleGridDataPage1, "Only page 1 should have been exported!");

    //             options.exportCurrentlyVisiblePageOnly = false;
    //             fix.detectChanges();
    //             getExportedData(grid, options).then((wrapper2) => {
    //                 wrapper2.verifyDataFilesContent(actualData.simpleGridDataFull, "All data should have been exported!");
    //             });
    //         });
    //     });
    // }));

    // it("should export currently visible grid page only.", async(() => {
    //     const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
    //     fix.detectChanges();

    //     const grid = fix.componentInstance.grid1;
    //     fix.whenStable().then(() => {
    //         expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized!");
    //         options.exportCurrentlyVisiblePageOnly = true;

    //         getExportedData(grid, options).then((wrapper) => {
    //             wrapper.verifyStructure();
    //             wrapper.verifyTemplateFilesContent();
    //             wrapper.verifyDataFilesContent(actualData.simpleGridDataPage1, "Page 1 should have been exported!");

    //             grid.paginate(1);
    //             grid.cdr.detectChanges();
    //             fix.whenStable().then(() => {
    //                 fix.detectChanges();
    //                 getExportedData(grid, options).then((wrapper2) => {
    //                     wrapper2.verifyDataFilesContent(actualData.simpleGridDataPage2, "Page 2 should have been exported!");
    //                 });
    //             });
    //         });
    //     });
    // }));

    // it("should honor the change of items per page.", async(() => {
    //     const fix = TestBed.createComponent(GridMarkupPagingDeclarationComponent);
    //     fix.detectChanges();

    //     const grid = fix.componentInstance.grid1;
    //     fix.whenStable().then(() => {
    //         expect(grid.rowList.length).toEqual(3, "Invalid number of rows initialized!");
    //         options.exportCurrentlyVisiblePageOnly = true;

    //         getExportedData(grid, options).then((wrapper) => {
    //             wrapper.verifyDataFilesContent(actualData.simpleGridDataPage1, "Three rows should have been exported!");

    //             grid.perPage = 5;
    //             grid.cdr.detectChanges();
    //             fix.whenStable().then(() => {
    //                 fix.detectChanges();
    //                 expect(grid.rowList.length).toEqual(5, "Invalid number of rows initialized!");
    //                 getExportedData(grid, options).then((wrapper2) => {
    //                     wrapper2.verifyDataFilesContent(actualData.simpleGridDataPage1FiveRows, "5 rows should have been exported!");
    //                 });
    //             });
    //         });
    //     });
    // }));

    it("should honor 'ignoreFiltering' option.", async(() => {
        const result = TestMethods.createGridAndFilter();
        const fix = result.fixture;
        const grid = result.grid;
        expect(grid.rowList.length).toEqual(1);

        options.ignoreFiltering = false;

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridDataRecord5, "One row only should have been exported!");

                options.ignoreFiltering = true;
                fix.detectChanges();
                getExportedData(grid, options).then((wrapper2) => {
                    wrapper2.verifyDataFilesContent(actualData.simpleGridData, "All 10 rows should have been exported!");
                });
            });
        });
    }));

    it("should honor filter criteria changes.", async(() => {
        const result = TestMethods.createGridAndFilter();
        const fix = result.fixture;
        const grid = result.grid;
        expect(grid.rowList.length).toEqual(1);

        options.ignoreFiltering = false;

        fix.whenStable().then(() => {

            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridDataRecord5, "One row should have been exported!");

                grid.filter("JobTitle", "Director", STRING_FILTERS.equals, true);
                fix.detectChanges();
                fix.whenStable().then(() => {
                    fix.detectChanges();
                    expect(grid.rowList.length).toEqual(2, "Invalid number of rows after filtering!");
                    getExportedData(grid, options).then((wrapper2) => {
                        wrapper2.verifyDataFilesContent(actualData.simpleGridDataDirectors, "Two rows should have been exported!");
                    });
                });
            });
        });
    }));

    it("should honor 'ignoreColumnsVisibility' option.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        grid.columns[0].hidden = true;
        options.ignoreColumnsOrder = true;
        options.ignoreColumnsVisibility = false;

        fix.whenStable().then(() => {
            fix.detectChanges();
            expect(grid.visibleColumns.length).toEqual(2, "Invalid number of visible columns!");
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitle, "Two columns should have been exported!");

                options.ignoreColumnsVisibility = true;
                fix.detectChanges();
                getExportedData(grid, options).then((wrapper2) => {
                    wrapper2.verifyDataFilesContent(actualData.simpleGridData, "All three columns should have been exported!");
                });
            });
        });
    }));

    it("should honor columns visibility changes.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();

        const grid = fix.componentInstance.grid1;
        options.ignoreColumnsOrder = true;
        options.ignoreColumnsVisibility = false;

        fix.whenStable().then(() => {
            expect(grid.visibleColumns.length).toEqual(3, "Invalid number of visible columns!");
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridData, "All columns should have been exported!");

                grid.columns[0].hidden = true;
                fix.whenStable().then(() => {
                    fix.detectChanges();
                    expect(grid.visibleColumns.length).toEqual(2, "Invalid number of visible columns!");
                    getExportedData(grid, options).then((wrapper2) => {
                        wrapper2.verifyDataFilesContent(actualData.simpleGridNameJobTitle, "Two columns should have been exported!");

                        grid.columns[0].hidden = false;
                        fix.whenStable().then(() => {
                            fix.detectChanges();
                            expect(grid.visibleColumns.length).toEqual(3, "Invalid number of visible columns!");
                            getExportedData(grid, options).then((wrapper3) => {
                                wrapper3.verifyDataFilesContent(actualData.simpleGridData, "All columns should have been exported!");

                                grid.columns[0].hidden = undefined;
                                fix.whenStable().then(() => {
                                    fix.detectChanges();
                                    expect(grid.visibleColumns.length).toEqual(3, "Invalid number of visible columns!");
                                    getExportedData(grid, options).then((wrapper4) => {
                                        wrapper4.verifyDataFilesContent(actualData.simpleGridData,
                                            "All columns should have been exported!");

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

    it("should honor 'ignorePinning' option.", async(() => {
        const result = TestMethods.createGridAndPinColumn([1]);
        const fix = result.fixture;
        const grid = result.grid;

        options.ignorePinning = false;

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyStructure();
                wrapper.verifyTemplateFilesContent();
                wrapper.verifyDataFilesContent(actualData.gridNameFrozen, "One frozen column should have been exported!");

                options.ignorePinning = true;
                fix.detectChanges();
                getExportedData(grid, options).then((wrapper2) => {
                    wrapper2.verifyDataFilesContent(actualData.gridNameIDJobTitle, "No frozen columns should have been exported!");
                });
            });
        });
    }));

    it("should honor pinned state changes.", async(() => {
        const result = TestMethods.createGridAndPinColumn([1]);
        const fix = result.fixture;
        const grid = result.grid;

        fix.whenStable().then(() => {
            fix.detectChanges();
            getExportedData(grid, options).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.gridNameFrozen, "One frozen column should have been exported!");

                grid.columns[1].unpin();
                fix.detectChanges();
                getExportedData(grid, options).then((wrapper2) => {
                    wrapper2.verifyDataFilesContent(actualData.simpleGridData, "No frozen columns should have been exported!");
                });
            });
        });
    }));

    // it("should honor applied sorting.", async(() => {
    //     const fix = TestBed.createComponent(GridDeclarationComponent);
    //     fix.detectChanges();
    //     const grid = fix.componentInstance.grid1;
    //     grid.sort("Name", SortingDirection.Asc, true);

    //     fix.whenStable().then(() => {
    //         fix.detectChanges();
    //         getExportedData(grid, options).then((wrapper) => {
    //             wrapper.verifyDataFilesContent(actualData.simpleGridSortByName);
    //         });
    //     });
    // }));

    // it("should honor changes in applied sorting.", async(() => {
    //     const fix = TestBed.createComponent(GridDeclarationComponent);
    //     fix.detectChanges();
    //     const grid = fix.componentInstance.grid1;
    //     grid.sort("Name", SortingDirection.Asc, true);

    //     fix.whenStable().then(() => {
    //         fix.detectChanges();
    //         getExportedData(grid, options).then((wrapper) => {
    //             wrapper.verifyDataFilesContent(actualData.simpleGridSortByName);

    //             grid.sort("Name", SortingDirection.Desc, true);

    //             fix.whenStable().then(() => {
    //                 fix.detectChanges();
    //                 getExportedData(grid, options).then((wrapper2) => {
    //                     wrapper2.verifyDataFilesContent(actualData.simpleGridSortByName);
    //                     grid.clearSort();

    //                     fix.whenStable().then(() => {
    //                         fix.detectChanges();
    //                         getExportedData(grid, options).then((wrapper3) => {
    //                             wrapper3.verifyDataFilesContent(actualData.simpleGridDataFull);
    //                         });
    //                     });
    //                 });
    //             });
    //         });
    //     });
    // }));

    it("should export all columns with the width specified in options.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;
        grid.columns[1].hidden = true;
        grid.columns[2].hidden = true;
        const columnWidths = [ 100, 200, 0, undefined, null ];

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

        const rowHeights = [ 20, 40, 0, undefined, null ];

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

        const cols = [];
        exporter.onColumnExport.subscribe((value) => {
            cols.push({ header: value.header, index: value.columnIndex });
        });

        fix.whenStable().then(() => {
            getExportedData(grid, options).then(() => {
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

        const cols = [];
        exporter.onColumnExport.subscribe((value) => {
            cols.push({ header: value.header, index: value.columnIndex });
        });

        grid.columns[0].hidden = true;
        options.ignoreColumnsVisibility = false;

        fix.whenStable().then(() => {
            getExportedData(grid, options).then((wrapper) => {
                    expect(cols.length).toBe(2);
                    expect(cols[0].header).toBe("Name");
                    expect(cols[0].index).toBe(0);
                    expect(cols[1].header).toBe("JobTitle");
                    expect(cols[1].index).toBe(1);
                    wrapper.verifyDataFilesContent(actualData.simpleGridNameJobTitle);
                });
            });

    }));

    it("should not export columns when 'onColumnExport' is canceled.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;

        exporter.onColumnExport.subscribe((value: IColumnExportingEventArgs) => {
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

        const rows = [];
        exporter.onRowExport.subscribe((value: IRowExportingEventArgs) => {
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

    it("should not export rows when 'onRowExport' is canceled.", async(() => {
        const fix = TestBed.createComponent(GridDeclarationComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid1;

        exporter.onRowExport.subscribe((value: IRowExportingEventArgs) => {
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

    async function getExportedData(grid: IgxGridComponent, exportOptions: IgxExcelExporterOptions) {
        const exportData = await new Promise<JSZipWrapper>((resolve) => {
            exporter.onExportEnded.subscribe((value) => {
                const wrapper = new JSZipWrapper(value.xlsx);
                resolve(wrapper);
            });
            exporter.export(grid, exportOptions);
        });
        return exportData;
    }

    function setColWidthAndExport(grid, exportOptions: IgxExcelExporterOptions, fix, value) {
        return new Promise<void>((resolve) => {
            options.columnWidth = value;
            fix.detectChanges();
            getExportedData(grid, exportOptions).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridColumnWidth(value), " Width :" + value).then(() => resolve());
            });
        });
    }

    function setRowHeightAndExport(grid, exportOptions: IgxExcelExporterOptions, fix, value) {
        return new Promise<void>((resolve) => {
            options.rowHeight = value;
            fix.detectChanges();
            getExportedData(grid, exportOptions).then((wrapper) => {
                wrapper.verifyDataFilesContent(actualData.simpleGridRowHeight(value), " Height :" + value).then(() => resolve());
            });
        });
    }

});
