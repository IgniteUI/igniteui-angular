import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxPdfExporterService } from './pdf-exporter';
import { IgxPdfExporterOptions } from './pdf-exporter-options';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { first } from 'rxjs/operators';

describe('PDF Exporter', () => {
    let exporter: IgxPdfExporterService;
    let options: IgxPdfExporterOptions;

    beforeEach(() => {
        exporter = new IgxPdfExporterService();
        options = new IgxPdfExporterOptions('PdfExport');

        // Spy the saveBlobToFile method so the files are not really created
        spyOn(ExportUtilities, 'saveBlobToFile');
    });

    it('should be created', () => {
        expect(exporter).toBeTruthy();
    });

    it('should export empty data without errors', (done) => {
        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData([], options);
    });

    it('should export simple data successfully', (done) => {
        const simpleData = [
            { Name: 'John', Age: 30 },
            { Name: 'Jane', Age: 25 }
        ];

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(simpleData, options);
    });

    it('should export contacts data successfully', (done) => {
        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should export with custom page orientation', (done) => {
        options.pageOrientation = 'landscape';

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should export with custom page size', (done) => {
        options.pageSize = 'letter';

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should export without table borders', (done) => {
        options.showTableBorders = false;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should export with custom font size', (done) => {
        options.fontSize = 12;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should handle null and undefined values', (done) => {
        const dataWithNulls = [
            { Name: 'John', Age: null },
            { Name: undefined, Age: 25 }
        ];

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(dataWithNulls, options);
    });

    it('should handle date values', (done) => {
        const dataWithDates = [
            { Name: 'John', BirthDate: new Date('1990-01-01') },
            { Name: 'Jane', BirthDate: new Date('1995-06-15') }
        ];

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(dataWithDates, options);
    });

    it('should export with portrait orientation', (done) => {
        options.pageOrientation = 'portrait';

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should export with various page sizes', (done) => {
        const pageSizes = ['a3', 'a5', 'legal'];
        let completed = 0;

        pageSizes.forEach(size => {
            const opts = new IgxPdfExporterOptions('Test');
            opts.pageSize = size as any;

            exporter.exportEnded.pipe(first()).subscribe(() => {
                completed++;
                if (completed === pageSizes.length) {
                    expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(pageSizes.length);
                    done();
                }
            });

            exporter.exportData(SampleTestData.contactsData(), opts);
        });
    });

    it('should export with different font sizes', (done) => {
        options.fontSize = 14;

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should export large dataset requiring pagination', (done) => {
        const largeData = [];
        for (let i = 0; i < 100; i++) {
            largeData.push({ Name: `Person ${i}`, Age: 20 + (i % 50), City: `City ${i % 10}` });
        }

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(largeData, options);
    });

    it('should handle long text values with truncation', (done) => {
        const dataWithLongText = [
            { Name: 'John', Description: 'This is a very long description that should be truncated with ellipsis in the PDF export to fit within the cell width' },
            { Name: 'Jane', Description: 'Another extremely long text that needs to be handled properly in the PDF export without breaking the layout' }
        ];

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(dataWithLongText, options);
    });

    it('should export data with mixed data types', (done) => {
        const mixedData = [
            { String: 'Text', Number: 42, Boolean: true, Date: new Date('2023-01-01'), Null: null, Undefined: undefined },
            { String: 'More text', Number: 3.14, Boolean: false, Date: new Date('2023-12-31'), Null: null, Undefined: undefined }
        ];

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(mixedData, options);
    });

    it('should export with custom filename', (done) => {
        const customOptions = new IgxPdfExporterOptions('CustomFileName');

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            const callArgs = (ExportUtilities.saveBlobToFile as jasmine.Spy).calls.mostRecent().args;
            expect(callArgs[1]).toBe('CustomFileName');
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), customOptions);
    });

    it('should handle empty rows in data', (done) => {
        const dataWithEmptyRows = [
            { Name: 'John', Age: 30 },
            {},
            { Name: 'Jane', Age: 25 }
        ];

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
            done();
        });

        exporter.exportData(dataWithEmptyRows, options);
    });

    it('should emit exportStarted event', (done) => {
        let exportStartedFired = false;

        exporter.exportStarted.pipe(first()).subscribe(() => {
            exportStartedFired = true;
        });

        exporter.exportEnded.pipe(first()).subscribe(() => {
            expect(exportStartedFired).toBe(true);
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    it('should emit exportEnded event with pdf object', (done) => {
        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(args).toBeDefined();
            expect(args.pdf).toBeDefined();
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });
});
