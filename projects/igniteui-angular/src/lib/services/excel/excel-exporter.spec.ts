import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { ExcelFileTypes } from './excel-enums';
import { IgxExcelExporterService } from './excel-exporter';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { ExcelStrings } from './excel-strings';
import { JSZipFiles } from './jszip-helper';
import { IFileContent, JSZipWrapper, ObjectComparer  } from './jszip-verification-wrapper';
import { ExportTestDataService, FileContentData, ValueData } from './test-data.service';

describe('Excel Exporter', () => {
    let sourceData: ExportTestDataService;
    let exporter: IgxExcelExporterService;
    let options: IgxExcelExporterOptions;
    let actualData: FileContentData;

    beforeEach(() => {
        exporter = new IgxExcelExporterService();
        sourceData = new ExportTestDataService();
        actualData = new FileContentData();
        options = new IgxExcelExporterOptions('ExcelExport');

        // Spy the saveBlobToFile method so the files are not really created
        spyOn(ExportUtilities, 'saveBlobToFile');
    });

    /* ExportData() tests */
    it('should not fail when data is empty.', (done) => {
        getExportedData([], options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            done();
        });
    });

    it('should export empty objects successfully.', (done) => {
        getExportedData(sourceData.emptyObjectData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            done();
        });
    });

    it('should export string data without headers successfully.', (done) => {
        options.columnWidth = 50;
        getExportedData(sourceData.noHeadersStringData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersStringDataContent);
            done();
        });
    });

    it('should export date time data without headers successfully.', (done) => {
        options.columnWidth = 50;
        getExportedData(sourceData.noHeadersDateTimeData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersDateTimeContent);
            done();
        });
    });

    it('should export number data without headers successfully.', (done) => {
        options.columnWidth = 50;
        getExportedData(sourceData.noHeadersNumberData, options).then((wrapper) => {
            wrapper.verifyStructure();
            // wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersNumberDataContent);
            done();
        });
    });

    it('should export object data without headers successfully.', (done) => {
        getExportedData(sourceData.noHeadersObjectData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersObjectDataContent);
            done();
        });
    });

    it('should export regular data successfully.', (done) => {
        options.columnWidth = 50;
        getExportedData(sourceData.contactsData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.contactsDataContent);
            done();
        });
    });

    it('should export data with missing values successfully.', (done) => {
        options.columnWidth = 50;
        getExportedData(sourceData.contactsPartialData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.contactsPartialDataContent);
            done();
        });
    });

    it('should export data with special characters successully.', (done) => {
        options.columnWidth = 50;
        getExportedData(sourceData.contactsFunkyData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.contactsFunkyDataContent);
            done();
        });
    });

    it('should throw an exception when setting negative width and height.', (done) => {
        try {
            options.columnWidth = -1;
        } catch (ex) {
            expect((ex as Error).message).toBe('Invalid value for column width!');
        }

        try {
            options.rowHeight = -1;
        } catch (ex) {
            expect((ex as Error).message).toBe('Invalid value for row height!');
        }
        done();
    });

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
