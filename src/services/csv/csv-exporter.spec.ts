import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ExportTestDataService, FileContentData, ValueData } from "../excel/test-data.service";
import { IgxCsvExporterService } from "./csv-exporter";
import { CsvFileTypes, IgxCsvExporterOptions } from "./csv-exporter-options";
import { CSVWrapper } from "./csv-verification-wrapper";

fdescribe("Export to", () => {
    let sourceData: ExportTestDataService;
    let exporter: IgxCsvExporterService;
    let options: IgxCsvExporterOptions;
    let actualData: FileContentData;
    const fileTypes = [ CsvFileTypes.CSV, CsvFileTypes.TAB, CsvFileTypes.TSV ];

    beforeEach(() => {
        exporter = new IgxCsvExporterService();
        sourceData = new ExportTestDataService();
        actualData = new FileContentData();

        // Spy the private SaveFile method so the files are not really created
        // spyOn(exporter as any, "saveFile");
    });

    /* ExportData() tests */
    for (const fileType of fileTypes) {
        const typeName = CsvFileTypes[fileType];
        options = new IgxCsvExporterOptions("Test" + typeName, fileType);

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
            getExportedData(sourceData.contactsFunkyData, options).then((wrapper) => {
                wrapper.verifyData(wrapper.contactsFunkyData);
            });
        }));

    }

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
