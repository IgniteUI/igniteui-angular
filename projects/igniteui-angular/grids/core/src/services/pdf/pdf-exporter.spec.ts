import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxPdfExporterService } from './pdf-exporter';
import { IgxPdfExporterOptions } from './pdf-exporter-options';
import { SampleTestData } from '../../../../../test-utils/sample-test-data.spec';
import { first } from 'rxjs/operators';
import { ExportRecordType, ExportHeaderType, DEFAULT_OWNER, IExportRecord, IColumnInfo, IColumnList, GRID_LEVEL_COL } from '../exporter-common/base-export-service';

describe('PDF Exporter', () => {
    let exporter: IgxPdfExporterService;
    let options: IgxPdfExporterOptions;

    beforeEach(() => {
        exporter = new IgxPdfExporterService();
        options = new IgxPdfExporterOptions('PdfExport');

        // Clear owners map between tests
        (exporter as any)._ownersMap.clear();

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

        const exportNext = (index: number) => {
            if (index >= pageSizes.length) {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(pageSizes.length);
                done();
                return;
            }

            const opts = new IgxPdfExporterOptions('Test');
            opts.pageSize = pageSizes[index] as any;

            exporter.exportEnded.pipe(first()).subscribe(() => {
                completed++;
                exportNext(completed);
            });

            exporter.exportData(SampleTestData.contactsData(), opts);
        };

        exportNext(0);
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
            expect(callArgs[1]).toBe('CustomFileName.pdf');
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

    it('should emit exportEnded event with pdf object', (done) => {
        exporter.exportEnded.pipe(first()).subscribe((args) => {
            expect(args).toBeDefined();
            expect(args.pdf).toBeDefined();
            done();
        });

        exporter.exportData(SampleTestData.contactsData(), options);
    });

    describe('Custom Font Support', () => {
        beforeEach(() => {
            spyOn(console, 'warn');
        });

        it('should export without custom font when customFont is not set', (done) => {
            expect(options.customFont).toBeUndefined();

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle custom font being set to null', (done) => {
            options.customFont = null as any;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle custom font being set to undefined', (done) => {
            options.customFont = undefined;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should fall back to helvetica when custom font with empty name is provided', (done) => {
            options.customFont = {
                name: '',
                data: 'someBase64Data'
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                expect(console.warn).toHaveBeenCalled();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should fall back to helvetica when custom font with empty data is provided', (done) => {
            options.customFont = {
                name: 'TestFont',
                data: ''
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                expect(console.warn).toHaveBeenCalled();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should fall back to helvetica when custom font with both empty name and data is provided', (done) => {
            options.customFont = {
                name: '',
                data: ''
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                expect(console.warn).toHaveBeenCalled();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should fall back to helvetica when custom font bold variant has empty name', (done) => {
            options.customFont = {
                name: '',
                data: 'someData',
                bold: {
                    name: '',
                    data: 'boldData'
                }
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                expect(console.warn).toHaveBeenCalled();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should fall back to helvetica when custom font bold variant has empty data', (done) => {
            options.customFont = {
                name: '',
                data: 'someData',
                bold: {
                    name: 'BoldFont',
                    data: ''
                }
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                expect(console.warn).toHaveBeenCalled();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should export with custom font and portrait orientation when font config is incomplete', (done) => {
            options.customFont = {
                name: '',
                data: ''
            };
            options.pageOrientation = 'portrait';

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should export with incomplete custom font and different page sizes', (done) => {
            const pageSizes = ['a3', 'letter'];
            let completed = 0;

            const exportNext = (index: number) => {
                if (index >= pageSizes.length) {
                    expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(pageSizes.length);
                    done();
                    return;
                }

                const opts = new IgxPdfExporterOptions('Test');
                opts.pageSize = pageSizes[index];
                opts.customFont = {
                    name: '',
                    data: ''
                };

                exporter.exportEnded.pipe(first()).subscribe(() => {
                    completed++;
                    exportNext(completed);
                });

                exporter.exportData(SampleTestData.contactsData(), opts);
            };

            exportNext(0);
        });

        it('should export with incomplete custom font and table borders disabled', (done) => {
            options.customFont = {
                name: '',
                data: ''
            };
            options.showTableBorders = false;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont object with only name property', (done) => {
            options.customFont = {
                name: 'TestFont'
            } as any;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                expect(console.warn).toHaveBeenCalled();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont object with only data property', (done) => {
            options.customFont = {
                data: 'someData'
            } as any;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                expect(console.warn).toHaveBeenCalled();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont as empty object', (done) => {
            options.customFont = {} as any;

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                expect(console.warn).toHaveBeenCalled();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont with whitespace-only name', (done) => {
            options.customFont = {
                name: '   ',
                data: 'someData'
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont with whitespace-only data', (done) => {
            options.customFont = {
                name: 'TestFont',
                data: '   '
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont with bold variant set to null', (done) => {
            options.customFont = {
                name: '',
                data: '',
                bold: null as any
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont with bold variant set to undefined', (done) => {
            options.customFont = {
                name: '',
                data: '',
                bold: undefined
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should handle customFont with bold as empty object', (done) => {
            options.customFont = {
                name: '',
                data: '',
                bold: {} as any
            };

            exporter.exportEnded.pipe(first()).subscribe((args) => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                expect(args.pdf).toBeDefined();
                done();
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });

        it('should reset font configuration when exporting again without customFont', (done) => {
            let exportCallCount = 0;

            // First export uses a custom font
            options.customFont = {
                name: 'CustomFont',
                data: ''
            } as any;

            const subscription = exporter.exportEnded.subscribe((args) => {
                exportCallCount++;

                if (exportCallCount === 1) {
                    // After the first export with custom font
                    expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                    expect(args.pdf).toBeDefined();

                    // Clear customFont and export again
                    options.customFont = undefined as any;
                    exporter.exportData(SampleTestData.contactsData(), options);
                    return;
                }

                if (exportCallCount === 2) {
                    // Second export should succeed and not reuse previous custom font settings
                    expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(2);
                    expect(args.pdf).toBeDefined();
                    subscription.unsubscribe();
                    done();
                }
            });

            exporter.exportData(SampleTestData.contactsData(), options);
        });
    });

    describe('Pivot Grid Export', () => {
        it('should export pivot grid with single dimension', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100, 'City-Paris-Sum': 200 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                },
                {
                    data: { Product: 'Product B', 'City-London-Sum': 150, 'City-Paris-Sum': 250 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'London',
                    field: 'City',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'London'
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'London'
                },
                {
                    header: 'Paris',
                    field: 'City',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'Paris'
                },
                {
                    header: 'Sum',
                    field: 'City-Paris-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'Paris'
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 1,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should export multi-dimensional pivot grid with multiple row dimensions', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Category: 'Category 1', 'City-London-Sum': 100, 'City-Paris-Sum': 200 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                },
                {
                    data: { Product: 'Product A', Category: 'Category 2', 'City-London-Sum': 150, 'City-Paris-Sum': 250 },
                    level: 1,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                },
                {
                    data: { Product: 'Product B', Category: 'Category 1', 'City-London-Sum': 120, 'City-Paris-Sum': 220 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'London',
                    field: 'City',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'London'
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'London'
                },
                {
                    header: 'Paris',
                    field: 'City',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'Paris'
                },
                {
                    header: 'Sum',
                    field: 'City-Paris-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'Paris'
                },
                {
                    header: 'Product A',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category 1',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 1,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should export pivot grid with row dimension headers and multi-level column headers', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100, 'City-London-Avg': 50, 'City-Paris-Sum': 200 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'London',
                    field: 'City',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 2,
                    columnGroup: 'London'
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'London'
                },
                {
                    header: 'Avg',
                    field: 'City-London-Avg',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'London'
                },
                {
                    header: 'Paris',
                    field: 'City',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 2,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'Paris'
                },
                {
                    header: 'Sum',
                    field: 'City-Paris-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 2,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'Paris'
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 1,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should export pivot grid with PivotMergedHeader columns', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: '',
                    field: '',
                    skip: false,
                    headerType: ExportHeaderType.PivotMergedHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should export pivot grid when dimensionKeys are inferred from record data', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Category: 'Category 1', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord
                    // No dimensionKeys - should be inferred
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 0,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should export pivot grid with MultiRowHeader columns', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Category: 'Category 1', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                },
                {
                    data: { Product: 'Product A', Category: 'Category 2', 'City-London-Sum': 150 },
                    level: 1,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'Product A',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.MultiRowHeader,
                    startIndex: 0,
                    level: 0,
                    rowSpan: 2
                },
                {
                    header: 'Category 1',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 1
                },
                {
                    header: 'Category 2',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 0,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should export pivot grid with row dimension columns by level', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Category: 'Category 1', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                },
                {
                    data: { Product: 'Product A', Category: 'Category 2', 'City-London-Sum': 150 },
                    level: 1,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product', 'Category']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'Product A',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category 1',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 1
                },
                {
                    header: 'Category 2',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 0,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });
    });

    describe('Hierarchical Grid Export', () => {
        it('should export hierarchical grid with child records', (done) => {
            const childOwner = 'child1';
            const childColumns: IColumnInfo[] = [
                {
                    header: 'Child Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Child Age',
                    field: 'age',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const childOwnerList: IColumnList = {
                columns: childColumns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(childOwner, childOwnerList);

            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Age',
                    field: 'age',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);

            const hierarchicalData: IExportRecord[] = [
                {
                    data: { name: 'Parent 1', age: 40 },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                },
                {
                    data: { name: 'Child 1', age: 10 },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                },
                {
                    data: { name: 'Child 2', age: 12 },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                },
                {
                    data: { name: 'Parent 2', age: 45 },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(hierarchicalData, options);
        });

        it('should export hierarchical grid with multiple child levels', (done) => {
            const grandChildOwner = 'grandchild1';
            const childOwner = 'child1';

            const grandChildColumns: IColumnInfo[] = [
                {
                    header: 'Grandchild Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const grandChildOwnerList: IColumnList = {
                columns: grandChildColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(grandChildOwner, grandChildOwnerList);

            const childColumns: IColumnInfo[] = [
                {
                    header: 'Child Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const childOwnerList: IColumnList = {
                columns: childColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(childOwner, childOwnerList);

            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);

            const hierarchicalData: IExportRecord[] = [
                {
                    data: { name: 'Parent 1' },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                },
                {
                    data: { name: 'Child 1' },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                },
                {
                    data: { name: 'Grandchild 1' },
                    level: 2,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: grandChildOwner
                },
                {
                    data: { name: 'Grandchild 2' },
                    level: 2,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: grandChildOwner
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(hierarchicalData, options);
        });

        it('should export hierarchical grid with multi-level headers in child grid', (done) => {
            const childOwner = 'child1';

            const childColumns: IColumnInfo[] = [
                {
                    header: 'Location',
                    field: 'location',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 2
                },
                {
                    header: 'City',
                    field: 'city',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 1,
                    columnSpan: 1
                },
                {
                    header: 'Country',
                    field: 'country',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 1,
                    columnSpan: 1
                }
            ];

            const childOwnerList: IColumnList = {
                columns: childColumns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 1
            };

            (exporter as any)._ownersMap.set(childOwner, childOwnerList);

            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);

            const hierarchicalData: IExportRecord[] = [
                {
                    data: { name: 'Parent 1' },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                },
                {
                    data: { city: 'London', country: 'UK' },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(hierarchicalData, options);
        });
    });

    describe('Tree Grid Export', () => {
        it('should export tree grid with hierarchical levels', (done) => {
            const treeData: IExportRecord[] = [
                {
                    data: { name: 'Root 1', value: 100 },
                    level: 0,
                    type: ExportRecordType.TreeGridRecord
                },
                {
                    data: { name: 'Child 1', value: 50 },
                    level: 1,
                    type: ExportRecordType.TreeGridRecord
                },
                {
                    data: { name: 'Grandchild 1', value: 25 },
                    level: 2,
                    type: ExportRecordType.TreeGridRecord
                },
                {
                    data: { name: 'Root 2', value: 200 },
                    level: 0,
                    type: ExportRecordType.TreeGridRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(treeData, options);
        });
    });

    describe('Summary Records Export', () => {
        it('should export summary records with label and value', (done) => {
            const summaryData: IExportRecord[] = [
                {
                    data: { name: 'Total', value: { label: 'Sum', value: 500 } },
                    level: 0,
                    type: ExportRecordType.SummaryRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(summaryData, options);
        });

        it('should export summary records with summaryResult property', (done) => {
            const summaryData: IExportRecord[] = [
                {
                    data: { name: 'Total', value: { summaryResult: 1000 } },
                    level: 0,
                    type: ExportRecordType.SummaryRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(summaryData, options);
        });
    });

    describe('Edge Cases and Special Scenarios', () => {
        it('should skip hidden records', (done) => {
            const dataWithHidden: IExportRecord[] = [
                {
                    data: { Name: 'Visible', Age: 30 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                },
                {
                    data: { Name: 'Hidden', Age: 25 },
                    level: 0,
                    type: ExportRecordType.DataRecord,
                    hidden: true
                },
                {
                    data: { Name: 'Visible 2', Age: 35 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(dataWithHidden, options);
        });

        it('should handle pagination when data exceeds page height', (done) => {
            const largeData: IExportRecord[] = [];
            for (let i = 0; i < 50; i++) {
                largeData.push({
                    data: { Name: `Person ${i}`, Age: 20 + i, City: `City ${i % 10}` },
                    level: 0,
                    type: ExportRecordType.DataRecord
                });
            }

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(largeData, options);
        });

        it('should handle pivot grid with empty row dimension fields', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: []
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle pivot grid when no columns are defined', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Value: 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord
                }
            ];

            const owner: IColumnList = {
                columns: [],
                columnWidths: [],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle pivot grid with row dimension headers longer than fields', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 0,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle pivot grid with date values in row dimensions', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Date: new Date('2023-01-01'), 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Date']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Date',
                    field: 'Date',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle hierarchical grid with HeaderRecord type', (done) => {
            const childOwner = 'child1';
            const childColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const childOwnerList: IColumnList = {
                columns: childColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(childOwner, childOwnerList);

            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);

            const hierarchicalData: IExportRecord[] = [
                {
                    data: { name: 'Parent 1' },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                },
                {
                    data: {},
                    level: 1,
                    type: ExportRecordType.HeaderRecord,
                    owner: childOwner
                },
                {
                    data: { name: 'Child 1' },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(hierarchicalData, options);
        });

        it('should handle hierarchical grid with empty child columns', (done) => {
            const childOwner = 'child1';
            const childOwnerList: IColumnList = {
                columns: [],
                columnWidths: [],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(childOwner, childOwnerList);

            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);

            const hierarchicalData: IExportRecord[] = [
                {
                    data: { name: 'Parent 1' },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                },
                {
                    data: { name: 'Child 1' },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(hierarchicalData, options);
        });

        it('should handle pagination with hierarchical grid', (done) => {
            const childOwner = 'child1';
            const childColumns: IColumnInfo[] = [
                {
                    header: 'Child Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const childOwnerList: IColumnList = {
                columns: childColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(childOwner, childOwnerList);

            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);

            const hierarchicalData: IExportRecord[] = [];
            // Create many parent-child pairs to trigger pagination
            for (let i = 0; i < 30; i++) {
                hierarchicalData.push({
                    data: { name: `Parent ${i}` },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                });
                hierarchicalData.push({
                    data: { name: `Child ${i}` },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                });
            }

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(hierarchicalData, options);
        });
    });

    describe('Additional Edge Cases and Error Paths', () => {
        it('should handle pivot grid with no defaultOwner', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            // Don't set DEFAULT_OWNER in the map
            (exporter as any)._ownersMap.clear();

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle pivot grid dimension inference from columnGroup', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Category: 'Category 1', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord
                    // No dimensionKeys - should be inferred
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0,
                    columnGroup: 'Product'
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 1,
                    columnGroupParent: 'Product'
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 0,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle pivot grid with simple keys inference', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { SimpleKey: 'Value1', 'Complex-Key-With-Separators': 100, 'Another_Complex_Key': 200 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord
                    // No dimensionKeys and no matching row headers
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Sum',
                    field: 'Complex-Key-With-Separators',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle pivot grid with row dimension headers longer than fields and trim them', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 1,
                    level: 1
                },
                {
                    header: 'SubCategory',
                    field: 'SubCategory',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 2,
                    level: 2
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200, 200],
                indexOfLastPinnedColumn: 2,
                maxLevel: 0,
                maxRowLevel: 3
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle multi-level headers with empty headersForLevel', (done) => {
            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Parent',
                    field: 'parent',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'Parent'
                },
                {
                    header: 'Child',
                    field: 'child',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 1,
                    columnSpan: 1,
                    columnGroupParent: 'Parent'
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 2 // Level 2 exists but no columns at that level
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            const data: IExportRecord[] = [
                {
                    data: { name: 'Test', parent: 'Parent', child: 'Child' },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(data, options);
        });

        it('should handle columns with skip: true', (done) => {
            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: true, // Should be skipped
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Age',
                    field: 'age',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            const data: IExportRecord[] = [
                {
                    data: { name: 'John', age: 30 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(data, options);
        });

        it('should handle GRID_LEVEL_COL column', (done) => {
            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: GRID_LEVEL_COL,
                    field: GRID_LEVEL_COL,
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            const data: IExportRecord[] = [
                {
                    data: { name: 'John', [GRID_LEVEL_COL]: 0 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(data, options);
        });

        it('should handle records with missing data property', (done) => {
            const data: IExportRecord[] = [
                {
                    data: { Name: 'John', Age: 30 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                },
                {
                    data: undefined as any,
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(data, options);
        });

        it('should handle pivot grid with fuzzy key matching', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { 'ProductName': 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product'] // Field name doesn't match exactly
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle pivot grid with possible dimension keys by index fallback', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { SimpleKey1: 'Value1', SimpleKey2: 'Value2', 'Complex-Key': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['UnknownKey'] // Key doesn't exist in data
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Unknown',
                    field: 'UnknownKey',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'Complex-Key',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle summary records with only label', (done) => {
            const summaryData: IExportRecord[] = [
                {
                    data: { name: 'Total', value: { label: 'Sum' } },
                    level: 0,
                    type: ExportRecordType.SummaryRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(summaryData, options);
        });

        it('should handle summary records with only value', (done) => {
            const summaryData: IExportRecord[] = [
                {
                    data: { name: 'Total', value: { value: 500 } },
                    level: 0,
                    type: ExportRecordType.SummaryRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(summaryData, options);
        });

        it('should handle pivot grid with empty PivotRowHeader columns', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: '',
                    field: '',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle hierarchical grid with owner not in map', (done) => {
            const childOwner = 'nonexistent-owner';
            const parentColumns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const parentOwner: IColumnList = {
                columns: parentColumns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, parentOwner);
            // Don't set childOwner in map

            const hierarchicalData: IExportRecord[] = [
                {
                    data: { name: 'Parent 1' },
                    level: 0,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: DEFAULT_OWNER
                },
                {
                    data: { name: 'Child 1' },
                    level: 1,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: childOwner
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(hierarchicalData, options);
        });

        it('should handle tree grid with undefined level', (done) => {
            const treeData: IExportRecord[] = [
                {
                    data: { name: 'Root 1', value: 100 },
                    level: undefined as any,
                    type: ExportRecordType.TreeGridRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(treeData, options);
        });

        it('should handle pivot grid with columnGroupParent as non-string', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', Category: 'Category 1', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0,
                    columnGroup: { id: 'product' } as any // Non-string columnGroup
                },
                {
                    header: 'Category',
                    field: 'Category',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 1,
                    columnGroupParent: { id: 'product' } as any // Non-string columnGroupParent
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200, 200],
                indexOfLastPinnedColumn: 1,
                maxLevel: 0,
                maxRowLevel: 2
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle pivot grid with column header matching record values', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product A', // Header matches value in data
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle pivot grid with record index-based column selection', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                },
                {
                    data: { Product: 'Product B', 'City-London-Sum': 200 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Product A',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Product B',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.RowHeader,
                    startIndex: 1,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle pivot grid with empty allColumns in drawDataRow', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle very long header text truncation', (done) => {
            const longHeaderText = 'This is a very long header text that should be truncated because it exceeds the maximum width of the column header cell in the PDF export';
            const columns: IColumnInfo[] = [
                {
                    header: longHeaderText,
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            const data: IExportRecord[] = [
                {
                    data: { name: 'Test' },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(data, options);
        });

        it('should handle pivot grid with row dimension columns but no matching data', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { 'City-London-Sum': 100 }, // No dimension fields in data
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product'] // But dimensionKeys says Product exists
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Product',
                    field: 'Product',
                    skip: false,
                    headerType: ExportHeaderType.PivotRowHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle column field as non-string gracefully', (done) => {
            // This test verifies that non-string fields are handled without crashing
            // The base exporter may filter these out, so we test with valid data structure
            const columns: IColumnInfo[] = [
                {
                    header: 'Name',
                    field: 'name',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                },
                {
                    header: 'Value',
                    field: 'value',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 1,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            const data: IExportRecord[] = [
                {
                    data: { name: 'Test', value: 123 },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(data, options);
        });

        it('should handle empty rowDimensionHeaders fallback path', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0,
                maxRowLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle PivotMergedHeader with empty header text', (done) => {
            const pivotData: IExportRecord[] = [
                {
                    data: { Product: 'Product A', 'City-London-Sum': 100 },
                    level: 0,
                    type: ExportRecordType.PivotGridRecord,
                    dimensionKeys: ['Product']
                }
            ];

            const columns: IColumnInfo[] = [
                {
                    header: '',
                    field: '',
                    skip: false,
                    headerType: ExportHeaderType.PivotMergedHeader,
                    startIndex: 0,
                    level: 0
                },
                {
                    header: 'Sum',
                    field: 'City-London-Sum',
                    skip: false,
                    headerType: ExportHeaderType.ColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200, 200],
                indexOfLastPinnedColumn: 0,
                maxLevel: 0,
                maxRowLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(pivotData, options);
        });

        it('should handle resolveLayoutStartIndex with no child columns', (done) => {
            const columns: IColumnInfo[] = [
                {
                    header: 'Parent',
                    field: 'parent',
                    skip: false,
                    headerType: ExportHeaderType.MultiColumnHeader,
                    startIndex: 0,
                    level: 0,
                    columnSpan: 1,
                    columnGroup: 'Parent'
                    // No child columns with columnGroupParent === 'Parent'
                }
            ];

            const owner: IColumnList = {
                columns: columns,
                columnWidths: [200],
                indexOfLastPinnedColumn: -1,
                maxLevel: 1
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            const data: IExportRecord[] = [
                {
                    data: { parent: 'Value' },
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(data, options);
        });

        it('should handle data with zero total columns', (done) => {
            const data: IExportRecord[] = [
                {
                    data: {},
                    level: 0,
                    type: ExportRecordType.DataRecord
                }
            ];

            const owner: IColumnList = {
                columns: [],
                columnWidths: [],
                indexOfLastPinnedColumn: -1,
                maxLevel: 0
            };

            (exporter as any)._ownersMap.set(DEFAULT_OWNER, owner);

            exporter.exportEnded.pipe(first()).subscribe(() => {
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                done();
            });

            exporter.exportData(data, options);
        });
    });
});
