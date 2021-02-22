import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxExcelExporterService } from './excel-exporter';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { JSZipWrapper } from './jszip-verification-wrapper.spec';
import { FileContentData } from './test-data.service.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { first } from 'rxjs/operators';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('Excel Exporter', () => {
    configureTestSuite();
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
        const wrapper = await getExportedData([], options);

        wrapper.verifyStructure();
        await wrapper.verifyTemplateFilesContent();
    });

    it('should export empty objects successfully.', async () => {
        const wrapper = await getExportedData(SampleTestData.emptyObjectData(), options);

        wrapper.verifyStructure();
        await wrapper.verifyTemplateFilesContent();
    });

    it('should export string data without headers successfully.', async () => {
        options.columnWidth = 50;
        const wrapper = await getExportedData(SampleTestData.stringArray(), options);

        wrapper.verifyStructure();
        await wrapper.verifyTemplateFilesContent();
        await wrapper.verifyDataFilesContent(actualData.noHeadersStringDataContent);
    });

    it('should export date time data without headers successfully.', async () => {
        options.columnWidth = 50;
        const wrapper = await getExportedData(SampleTestData.excelDateArray(), options);

        wrapper.verifyStructure();
        await wrapper.verifyTemplateFilesContent('', true);
        await wrapper.verifyDataFilesContent(actualData.noHeadersDateTimeContent);
    });

    it('should export number data without headers successfully.', async () => {
        options.columnWidth = 50;
        const wrapper = await getExportedData(SampleTestData.numbersArray(), options);

        wrapper.verifyStructure();
        // await wrapper.verifyTemplateFilesContent();
        await wrapper.verifyDataFilesContent(actualData.noHeadersNumberDataContent);
    });

    it('should export object data without headers successfully.', async () => {
        const wrapper = await getExportedData(SampleTestData.noHeadersObjectArray(), options);

        wrapper.verifyStructure();
        await wrapper.verifyTemplateFilesContent();
        await wrapper.verifyDataFilesContent(actualData.noHeadersObjectDataContent);
    });

    it('should export regular data successfully.', async () => {
        options.columnWidth = 50;
        const wrapper = await getExportedData(SampleTestData.contactsData(), options);

        wrapper.verifyStructure();
        await wrapper.verifyTemplateFilesContent();
        await wrapper.verifyDataFilesContent(actualData.contactsDataContent);
    });

    it('should export data with missing values successfully.', async () => {
        options.columnWidth = 50;
        const wrapper = await getExportedData(SampleTestData.contactsDataPartial(), options);

        wrapper.verifyStructure();
        await wrapper.verifyTemplateFilesContent();
        await wrapper.verifyDataFilesContent(actualData.contactsPartialDataContent);
    });

    it('should export data with special characters successully.', async () => {
        options.columnWidth = 50;
        const wrapper = await getExportedData(SampleTestData.contactsFunkyData(), options);

        wrapper.verifyStructure();
        await wrapper.verifyTemplateFilesContent();
        await wrapper.verifyDataFilesContent(actualData.contactsFunkyDataContent);
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
    });

    const getExportedData = (data: any[], exportOptions: IgxExcelExporterOptions) => {
        const result = new Promise<JSZipWrapper>((resolve) => {
            exporter.exportEnded.pipe(first()).subscribe((value) => {
                const wrapper = new JSZipWrapper(value.xlsx);
                resolve(wrapper);
            });
            exporter.exportData(data, exportOptions);
        });
        return result;
    };
});
