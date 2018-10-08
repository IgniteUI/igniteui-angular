import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxExcelExporterService } from './excel-exporter';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { JSZipWrapper } from './jszip-verification-wrapper.spec';
import { FileContentData } from './test-data.service.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { first } from 'rxjs/operators';
import { wait } from '../../test-utils/ui-interactions.spec';

describe('Excel Exporter', () => {
    let exporter: IgxExcelExporterService;
    let options: IgxExcelExporterOptions;
    let actualData: FileContentData;

    beforeEach(() => {
        exporter = new IgxExcelExporterService();
        actualData = new FileContentData();
        options = new IgxExcelExporterOptions('ExcelExport');

        // Spy the saveBlobToFile method so the files are not really created
        spyOn(ExportUtilities, 'saveBlobToFile');
    });

    /* ExportData() tests */
    it('should not fail when data is empty.', async () => {
        await getExportedData([], options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            // done();
        });
        // await wait();
    });

    it('should export empty objects successfully.', async () => {
        await getExportedData(SampleTestData.emptyObjectData(), options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            // done();
        });
        // await wait();
    });

    it('should export string data without headers successfully.', async () => {
        options.columnWidth = 50;
        await getExportedData(SampleTestData.stringArray(), options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersStringDataContent);
            // done();
        });
        // await wait();
    });

    it('should export date time data without headers successfully.', async () => {
        options.columnWidth = 50;
        await getExportedData(SampleTestData.dateArray(), options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersDateTimeContent);
            // done();
        });
        // await wait();
    });

    it('should export number data without headers successfully.', async () => {
        options.columnWidth = 50;
        await getExportedData(SampleTestData.numbersArray(), options).then((wrapper) => {
            wrapper.verifyStructure();
            // wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersNumberDataContent);
            // done();
        });
        // await wait();
    });

    it('should export object data without headers successfully.', async () => {
        await getExportedData(SampleTestData.noHeadersObjectArray(), options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.noHeadersObjectDataContent);
            // done();
        });
        // await wait();
    });

    it('should export regular data successfully.', async () => {
        options.columnWidth = 50;
        await getExportedData(SampleTestData.contactsData(), options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.contactsDataContent);
            // done();
        });
        // await wait();
    });

    it('should export data with missing values successfully.', async () => {
        options.columnWidth = 50;
        await getExportedData(SampleTestData.contactsDataPartial(), options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.contactsPartialDataContent);
            // done();
        });
        // await wait();
    });

    it('should export data with special characters successully.', async () => {
        options.columnWidth = 50;
        await getExportedData(SampleTestData.contactsFunkyData(), options).then((wrapper) => {
            wrapper.verifyStructure();
            wrapper.verifyTemplateFilesContent();
            wrapper.verifyDataFilesContent(actualData.contactsFunkyDataContent);
            // done();
        });
        // await wait();
    });

    it('should throw an exception when setting negative width and height.', () => {
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
        // done();
        // await wait();
    });

    function getExportedData(data: any[], exportOptions: IgxExcelExporterOptions) {
        const result = new Promise<JSZipWrapper>((resolve) => {
            exporter.onExportEnded.pipe(first()).subscribe((value) => {
                const wrapper = new JSZipWrapper(value.xlsx);
                resolve(wrapper);
            });
            exporter.exportData(data, exportOptions);
        });
        return result;
    }
});
