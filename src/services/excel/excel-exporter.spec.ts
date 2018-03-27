import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ExcelFileTypes } from "./excel-enums";
import { IgxExcelExporterService } from "./excel-exporter";
import { IgxExcelExporterOptions } from "./excel-exporter-options";
import { ExcelStrings } from "./excel-strings";
import { JSZipFiles } from "./jszip-helper";
import { IFileContent, JSZipWrapper, ObjectComparer  } from "./jszip-verification-wrapper";
import { ExportTestDataService, FileContentData, ValueData } from "./test-data.service";

describe("Excel Exporter", () => {
    let sourceData: ExportTestDataService;
    let exporter: IgxExcelExporterService;
    let options: IgxExcelExporterOptions;
    let actualData: FileContentData;

    beforeEach(() => {
        exporter = new IgxExcelExporterService();
        sourceData = new ExportTestDataService();
        actualData = new FileContentData();
        options = new IgxExcelExporterOptions("ExcelExport");

        // Spy the private saveFile method so the files are not really created
        spyOn(exporter as any, "saveFile");
    });

    /* ExportData() tests */
    it("should not fail when data is empty.", async(() => {
        getExportedData([], options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
        });
    }));

    it("should export empty objects successfully.", async(() => {
        getExportedData(sourceData.emptyObjectData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
        });
    }));

    it("should export string data without headers successfully.", async(() => {
        getExportedData(sourceData.noHeadersStringData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersStringDataContent);
        });
    }));

    it("should export date time data without headers successfully.", async(() => {
        getExportedData(sourceData.noHeadersDateTimeData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersDateTimeContent);
        });
    }));

    it("should export number data without headers successfully.", async(() => {
        getExportedData(sourceData.noHeadersNumberData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersNumberDataContent);
        });
    }));

    it("should export object data without headers successfully.", async(() => {
        getExportedData(sourceData.noHeadersObjectData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersObjectDataContent);
        });
    }));

    it("should export regular data successfully.", async(() => {
        getExportedData(sourceData.contactsData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.contactsDataContent);
        });
    }));

    it("should export data with missing values successfully.", async(() => {
        getExportedData(sourceData.contactsPartialData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.contactsPartialDataContent);
        });
    }));

    it("should export data with special characters successully.", async(() => {
        getExportedData(sourceData.contactsFunkyData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.contactsFunkyDataContent);
        });
    }));

    it("should throw an exception when setting negative width and height.", async(() => {
        try {
            options.columnWidth = -1;
        } catch (ex) {
            expect((ex as Error).message).toBe("Invalid value for column width!");
        }

        try {
            options.rowHeight = -1;
        } catch (ex) {
            expect((ex as Error).message).toBe("Invalid value for row height!");
        }

    }));

    async function getExportedData(data: any[], exportOptions: IgxExcelExporterOptions) {
        const result = await new Promise<JSZipWrapper>((resolve) => {
            exporter.onExportEnded.subscribe((value) => {
                const wrapper = new JSZipWrapper(value.xlsx);
                resolve(wrapper);
            });
            exporter.exportData(data, exportOptions);
        });
        return result;
    }
});
