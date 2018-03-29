import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ExportTestDataService, FileContentData, ValueData } from "../excel/test-data.service";
import { IgxCsvExporterService } from "./csv-exporter";
import { CsvFileTypes, IgxCsvExporterOptions } from "./csv-exporter-options";
import { CSVWrapper } from "./csv-verification-wrapper";

describe("Export to", () => {
    let sourceData: ExportTestDataService;
    let exporter: IgxCsvExporterService;
    // let options: IgxCsvExporterOptions;
    let actualData: FileContentData;
    const fileTypes = [ CsvFileTypes.CSV, CsvFileTypes.TSV, CsvFileTypes.TAB ];

    beforeEach(() => {
        exporter = new IgxCsvExporterService();
        sourceData = new ExportTestDataService();
        actualData = new FileContentData();

        // Spy the private saveFile method so the files are not really created
        spyOn(exporter as any, "saveFile");
    });

    /* ExportData() tests */
    for (const fileType of fileTypes) {
        const typeName = CsvFileTypes[fileType];
        const options = new IgxCsvExporterOptions("Test" + typeName, fileType);

        it(typeName + " should not fail when data is empty.", async(() => {
            getExportedData([], options).then((wrapper) => {
                wrapper.verifyData("");
            });
        }));

        it(typeName + " should export empty objects successfully.", async(() => {
            getExportedData(sourceData.emptyObjectData, options).then((wrapper) => {
                wrapper.verifyData("");
            });
        }));

        it(typeName + " should export string data without headers successfully.", async(() => {
            getExportedData(sourceData.noHeadersStringData, options).then((wrapper) => {
                wrapper.verifyData(wrapper.noHeadersStringData);
            });
        }));

        it(typeName + " should export number data without headers successfully.", async(() => {
            getExportedData(sourceData.noHeadersNumberData, options).then((wrapper) => {
                wrapper.verifyData(wrapper.noHeadersNumberData);
            });
        }));

        it(typeName + " should export date time data without headers successfully.", async(() => {
            getExportedData(sourceData.noHeadersDateTimeData, options).then((wrapper) => {
                wrapper.verifyData(wrapper.noHeadersDateTimeData);
            });
        }));

        it(typeName + " should export object data without headers successfully.", async(() => {
            getExportedData(sourceData.noHeadersObjectData, options).then((wrapper) => {
                wrapper.verifyData(wrapper.noHeadersObjectData);
            });
        }));

        it(typeName + " should export regular data successfully.", async(() => {
            getExportedData(sourceData.contactsData, options).then((wrapper) => {
                wrapper.verifyData(wrapper.contactsData);
            });
        }));

        it(typeName + " should export data with missing values successfully.", async(() => {
            getExportedData(sourceData.contactsPartialData, options).then((wrapper) => {
                wrapper.verifyData(wrapper.contactsPartialData);
            });
        }));

        it(typeName + " should export data with special characters successfully.", async(() => {
            getExportedData(sourceData.getContactsFunkyData(options.valueDelimiter), options).then((wrapper) => {
                wrapper.verifyData(wrapper.contactsFunkyData);
            });
        }));

    }

    it("CSV should export data with a custom delimiter successfully.", async(() => {
        const options = new IgxCsvExporterOptions("CustomDelimiter", CsvFileTypes.CSV);
        options.valueDelimiter = "###";
        getExportedData(sourceData.getContactsFunkyData(options.valueDelimiter), options).then((wrapper) => {
            wrapper.verifyData(wrapper.contactsFunkyData);
        });
    }));

    it("CSV should use a default delimiter when given an invalid one.", async(() => {
        const options = new IgxCsvExporterOptions("InvalidDelimiter", CsvFileTypes.CSV);
        options.valueDelimiter = "";
        getExportedData(sourceData.contactsData, options).then((wrapper) => {
            expect(options.valueDelimiter).toBe(",");
        });
    }));

    it("CSV should overwrite file type successfully.", async(() => {
        const options = new IgxCsvExporterOptions("Export", CsvFileTypes.CSV);
        options.fileType = CsvFileTypes.TAB;
        getExportedData(sourceData.getContactsFunkyData("\t"), options).then((wrapper) => {
            expect(options.fileName.endsWith(".tab")).toBe(true);
        });
    }));

    it("should fire 'onColumnExport' for each data field.", async(() => {
        const options = new IgxCsvExporterOptions("ExportEvents", CsvFileTypes.CSV);
        const cols = [];
        exporter.onColumnExport.subscribe((value) => {
            cols.push({ header: value.header, index: value.columnIndex });
        });

        getExportedData(sourceData.simpleGridData, options).then((wrapper) => {
            expect(cols.length).toBe(3);
            expect(cols[0].header).toBe("ID");
            expect(cols[0].index).toBe(0);
            expect(cols[1].header).toBe("Name");
            expect(cols[1].index).toBe(1);
            expect(cols[2].header).toBe("JobTitle");
            expect(cols[2].index).toBe(2);
        });
    }));

    it("should fire 'onRowExport' for each data row.", async(() => {
        const options = new IgxCsvExporterOptions("ExportEvents", CsvFileTypes.CSV);
        const rows = [];
        exporter.onRowExport.subscribe((value) => {
            rows.push({ data: value.rowData, index: value.rowIndex });
        });

        getExportedData(sourceData.simpleGridData, options).then(() => {
            expect(rows.length).toBe(10);
            for (let i = 0; i < rows.length; i++) {
                expect(rows[i].index).toBe(i);
                expect(JSON.stringify(rows[i].data)).toBe(JSON.stringify(sourceData.simpleGridData[i]));
            }
        });
    }));

    async function getExportedData(data: any[], csvOptions: IgxCsvExporterOptions) {
        const result = await new Promise<CSVWrapper>((resolve) => {
            exporter.onExportEnded.subscribe((value) => {
                const wrapper = new CSVWrapper(value.csvData, csvOptions.valueDelimiter);
                resolve(wrapper);
            });
            exporter.exportData(data, csvOptions);
        });
        return result;
    }
});
