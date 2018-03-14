import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ExcelFileTypes } from './excel-enums';
import { IgxExcelExporterService } from './excel-exporter';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { ExcelStrings } from './excel-strings';
import { ExportTestDataService, ValueData, FileContentData } from './test-data.service';
import { JSZipFiles } from './jsZip-helper';
import { JSZipWrapper, ObjectComparer, IFileContent } from './jszip-verification-wrapper';

describe('Excel Exporter', () => {
    let sourceData : ExportTestDataService;
    let exporter : IgxExcelExporterService;
    let options : IgxExcelExporterOptions;
    let wrapper : JSZipWrapper;
    let fileContents : IFileContent[];
    let timesCalled = 0;
    let actualData : FileContentData;

    beforeEach(() => {
        exporter = new IgxExcelExporterService();
        sourceData = new ExportTestDataService();
        actualData = new FileContentData();
        options = new IgxExcelExporterOptions("TestData");

        // Spy the private SaveFile method so the files are not really created
        spyOn(exporter as any, "SaveFile");
    });

    /* ExportData() tests */
   it('should not fail when data is empty.', async(() => {
        getExportedData([], options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
        });
    }));

    it('should export empty objects successfully.', async(() => {
        getExportedData(sourceData.emptyObjectData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
        });
    }));

    it('should export string data without headers successfully.', async(() => {
        getExportedData(sourceData.noHeadersStringData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersStringDataContent);
        });
    }));

    it('should export object data without headers successfully.', async(() => {
        getExportedData(sourceData.noHeadersObjectData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersObjectDataContent);
        });
    }));

    it('should export regular data successfully.', async(() => {
        getExportedData(sourceData.contactsData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.contactsDataContent);
        });
    }));

    it('should export data with missing values successfully.', async(() => {
        getExportedData(sourceData.contactsPartialData, options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.contactsPartialDataContent);
        });
    }));

    async function getExportedData( data : any[], options : IgxExcelExporterOptions ) {
        let result = await new Promise<JSZipWrapper>(resolve => {
            exporter.onExportEnded.subscribe((value) => {
                let wrapper = new JSZipWrapper(value.xlsx);
                resolve(wrapper);
            });
            exporter.ExportData(data, options);
        });
        return result;
    }
});