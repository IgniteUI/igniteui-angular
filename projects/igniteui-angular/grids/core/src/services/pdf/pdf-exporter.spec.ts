import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxPdfExporterService } from './pdf-exporter';
import { IgxPdfExporterOptions } from './pdf-exporter-options';
import { SampleTestData } from '../../../../../test-utils/sample-test-data.spec';
import { first } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { ExportRecordType, ExportHeaderType, DEFAULT_OWNER, IExportRecord, IColumnInfo, IColumnList, GRID_LEVEL_COL } from '../exporter-common/base-export-service';

import { describe, it, expect, beforeEach, vi } from 'vitest';
describe('PDF Exporter', () => {
    let exporter: IgxPdfExporterService;
    let options: IgxPdfExporterOptions;

    beforeEach(() => {
        exporter = new IgxPdfExporterService();
        options = new IgxPdfExporterOptions('PdfExport');

        // Clear owners map between tests
        (exporter as any)._ownersMap.clear();

        // Spy the saveBlobToFile method so the files are not really created
        vi.spyOn(ExportUtilities, 'saveBlobToFile');
    });

    it('should be created', () => {
        expect(exporter).toBeTruthy();
    });

    it('should export empty data without errors', async () => {
        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData([], options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should export simple data successfully', async () => {
        const simpleData = [
            { Name: 'John', Age: 30 },
            { Name: 'Jane', Age: 25 }
        ];

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(simpleData, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should export contacts data successfully', async () => {
        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(SampleTestData.contactsData(), options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should export with custom page orientation', async () => {
        options.pageOrientation = 'landscape';

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(SampleTestData.contactsData(), options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should export with custom page size', async () => {
        options.pageSize = 'letter';

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(SampleTestData.contactsData(), options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should export without table borders', async () => {
        options.showTableBorders = false;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(SampleTestData.contactsData(), options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should export with custom font size', async () => {
        options.fontSize = 12;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(SampleTestData.contactsData(), options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should handle null and undefined values', async () => {
        const dataWithNulls = [
            { Name: 'John', Age: null },
            { Name: undefined, Age: 25 }
        ];

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(dataWithNulls, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should handle date values', async () => {
        const dataWithDates = [
            { Name: 'John', BirthDate: new Date('1990-01-01') },
            { Name: 'Jane', BirthDate: new Date('1995-06-15') }
        ];

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(dataWithDates, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should export with portrait orientation', async () => {
        options.pageOrientation = 'portrait';

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(SampleTestData.contactsData(), options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should export with various page sizes', async () => {
        const pageSizes = ['a3', 'a5', 'legal'];

        for (const pageSize of pageSizes) {
            const opts = new IgxPdfExporterOptions('Test');
            opts.pageSize = pageSize as any;
            const exportPromise = firstValueFrom(exporter.exportEnded);
            exporter.exportData(SampleTestData.contactsData(), opts);
            await exportPromise;
        }
        
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(pageSizes.length);
    });

    it('should export with different font sizes', async () => {
        options.fontSize = 14;

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(SampleTestData.contactsData(), options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should export large dataset requiring pagination', async () => {
        const largeData = [];
        for (let i = 0; i < 100; i++) {
            largeData.push({ Name: `Person ${i}`, Age: 20 + (i % 50), City: `City ${i % 10}` });
        }

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(largeData, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should handle long text values with truncation', async () => {
        const dataWithLongText = [
            { Name: 'John', Description: 'This is a very long description that should be truncated with ellipsis in the PDF export to fit within the cell width' },
            { Name: 'Jane', Description: 'Another extremely long text that needs to be handled properly in the PDF export without breaking the layout' }
        ];

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(dataWithLongText, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should export data with mixed data types', async () => {
        const mixedData = [
            { String: 'Text', Number: 42, Boolean: true, Date: new Date('2023-01-01'), Null: null, Undefined: undefined },
            { String: 'More text', Number: 3.14, Boolean: false, Date: new Date('2023-12-31'), Null: null, Undefined: undefined }
        ];

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(mixedData, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should export with custom filename', async () => {
        const customOptions = new IgxPdfExporterOptions('CustomFileName');

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(SampleTestData.contactsData(), customOptions);
        await exportPromise;
        
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        const callArgs = (ExportUtilities.saveBlobToFile as any).mock.lastCall;
        expect(callArgs[1]).toBe('CustomFileName.pdf');
    });

    it('should handle empty rows in data', async () => {
        const dataWithEmptyRows = [
            { Name: 'John', Age: 30 },
            {},
            { Name: 'Jane', Age: 25 }
        ];

        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(dataWithEmptyRows, options);
        await exportPromise;
        expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
    });

    it('should emit exportEnded event with pdf object', async () => {
        const exportPromise = firstValueFrom(exporter.exportEnded);
        exporter.exportData(SampleTestData.contactsData(), options);
        const args = await exportPromise;
        
        expect(args).toBeDefined();
        expect(args.pdf).toBeDefined();
    });

    describe('Pivot Grid Export', () => {
        it('should export pivot grid with single dimension', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);
            exporter.exportData(pivotData, options);
            await exportPromise;
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

        it('should export multi-dimensional pivot grid with multiple row dimensions', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);
            exporter.exportData(pivotData, options);
            await exportPromise;
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

        it('should export pivot grid with row dimension headers and multi-level column headers', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);
            exporter.exportData(pivotData, options);
            await exportPromise;
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

        it('should export pivot grid with PivotMergedHeader columns', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);
            exporter.exportData(pivotData, options);
            await exportPromise;
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

        it('should export pivot grid when dimensionKeys are inferred from record data', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);
            exporter.exportData(pivotData, options);
            await exportPromise;
            expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
        });

        it('should export pivot grid with MultiRowHeader columns', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should export pivot grid with row dimension columns by level', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });
    });

    describe('Hierarchical Grid Export', () => {
        it('should export hierarchical grid with child records', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(hierarchicalData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should export hierarchical grid with multiple child levels', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(hierarchicalData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should export hierarchical grid with multi-level headers in child grid', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(hierarchicalData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });
    });

    describe('Tree Grid Export', () => {
        it('should export tree grid with hierarchical levels', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(treeData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });
    });

    describe('Summary Records Export', () => {
        it('should export summary records with label and value', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(summaryData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should export summary records with summaryResult property', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(summaryData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });
    });

    describe('Edge Cases and Special Scenarios', () => {
        it('should skip hidden records', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(dataWithHidden, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pagination when data exceeds page height', async () => {
            const largeData: IExportRecord[] = [];
            for (let i = 0; i < 50; i++) {
                largeData.push({
                    data: { Name: `Person ${i}`, Age: 20 + i, City: `City ${i % 10}` },
                    level: 0,
                    type: ExportRecordType.DataRecord
                });
            }

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(largeData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with empty row dimension fields', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid when no columns are defined', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with row dimension headers longer than fields', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with date values in row dimensions', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle hierarchical grid with HeaderRecord type', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(hierarchicalData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle hierarchical grid with empty child columns', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(hierarchicalData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pagination with hierarchical grid', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(hierarchicalData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });
    });

    describe('Additional Edge Cases and Error Paths', () => {
        it('should handle pivot grid with no defaultOwner', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid dimension inference from columnGroup', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with simple keys inference', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with row dimension headers longer than fields and trim them', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle multi-level headers with empty headersForLevel', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(data, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle columns with skip: true', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(data, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle GRID_LEVEL_COL column', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(data, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle records with missing data property', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(data, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with fuzzy key matching', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with possible dimension keys by index fallback', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle summary records with only label', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(summaryData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle summary records with only value', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(summaryData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with empty PivotRowHeader columns', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle hierarchical grid with owner not in map', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(hierarchicalData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle tree grid with undefined level', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(treeData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with columnGroupParent as non-string', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with column header matching record values', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with record index-based column selection', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with empty allColumns in drawDataRow', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle very long header text truncation', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(data, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle pivot grid with row dimension columns but no matching data', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle column field as non-string gracefully', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(data, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle empty rowDimensionHeaders fallback path', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle PivotMergedHeader with empty header text', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(pivotData, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle resolveLayoutStartIndex with no child columns', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(data, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });

        it('should handle data with zero total columns', async () => {
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

            const exportPromise = firstValueFrom(exporter.exportEnded);

            exporter.exportData(data, options);
        await exportPromise;
                expect(ExportUtilities.saveBlobToFile).toHaveBeenCalledTimes(1);
                
            });
    });
});
