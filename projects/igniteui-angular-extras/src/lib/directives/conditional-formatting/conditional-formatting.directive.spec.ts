import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { IgxGridComponent } from 'igniteui-angular/grids/grid';
import { ConditionalFormattingType, IFormatColors, IgxConditionalFormattingDirective } from './conditional-formatting.directive';

describe('IgxConditionalFormattingDirective', () => {
    let directive: IgxConditionalFormattingDirective;
    let mockGrid: any;

    beforeEach(() => {
        mockGrid = {
            rangeSelected: new Subject(),
            columnSelectionChanging: new Subject(),
            cellEdit: new Subject(),
            getSelectedData: jasmine.createSpy('getSelectedData').and.returnValue([]),
            getSelectedColumnsData: jasmine.createSpy('getSelectedColumnsData').and.returnValue([]),
            getSelectedRanges: jasmine.createSpy('getSelectedRanges').and.returnValue([]),
            selectedColumns: jasmine.createSpy('selectedColumns').and.returnValue([]),
            visibleColumns: [],
            data: [],
            cdr: { detectChanges: jasmine.createSpy('detectChanges') },
            notifyChanges: jasmine.createSpy('notifyChanges'),
            getColumnByName: jasmine.createSpy('getColumnByName').and.returnValue({ visibleIndex: 0 })
        };

        TestBed.configureTestingModule({
            providers: [
                IgxConditionalFormattingDirective,
                { provide: IgxGridComponent, useValue: mockGrid }
            ]
        });

        directive = TestBed.inject(IgxConditionalFormattingDirective);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    describe('formatColors', () => {
        it('should reflect updated colors after setter is called', () => {
            const newColors: IFormatColors = { success: 'green', error: 'red', warning: 'orange', info: 'blue', text: 'white' };
            directive.formatColors = newColors;
            expect(directive.formatColors).toEqual(newColors);
        });
    });

    describe('isWithInFormattedRange', () => {
        it('should return false when no range is set', () => {
            expect(directive.isWithInFormattedRange(0, 0)).toBeFalse();
        });

        it('should return true for a row and column that are in the formatted range', () => {
            (directive as any).formatedRange = new Map([[0, new Set([1])]]);
            expect(directive.isWithInFormattedRange(0, 1)).toBeTrue();
        });

        it('should return false when the row is not in the range', () => {
            (directive as any).formatedRange = new Map([[0, new Set([1])]]);
            expect(directive.isWithInFormattedRange(1, 1)).toBeFalse();
        });

        it('should return false when the column is not in the range', () => {
            (directive as any).formatedRange = new Map([[0, new Set([1])]]);
            expect(directive.isWithInFormattedRange(0, 2)).toBeFalse();
        });

        it('should resolve column index by name when colID is a string', () => {
            (directive as any).formatedRange = new Map([[0, new Set([0])]]);
            mockGrid.getColumnByName.and.returnValue({ visibleIndex: 0 });
            expect(directive.isWithInFormattedRange(0, 'colName')).toBeTrue();
            expect(mockGrid.getColumnByName).toHaveBeenCalledWith('colName');
        });
    });

    describe('determineFormatters', () => {
        it('should include numeric formatters for numeric-only data', () => {
            mockGrid.getSelectedData.and.returnValue([{ val: 10 }, { val: 20 }]);
            let emitted: string[];
            directive.formattersReady.subscribe(f => emitted = f);

            directive.determineFormatters(false);

            expect(emitted).toContain('Data Bars');
            expect(emitted).toContain('Color Scale');
            expect(emitted).not.toContain('Text Contains');
        });

        it('should include text formatters for text-only data', () => {
            mockGrid.getSelectedData.and.returnValue([{ name: 'Alice' }, { name: 'Bob' }]);
            let emitted: string[];
            directive.formattersReady.subscribe(f => emitted = f);

            directive.determineFormatters(false);

            expect(emitted).toContain('Text Contains');
            expect(emitted).not.toContain('Data Bars');
        });

        it('should include both Data Bars and Text Contains for mixed data', () => {
            mockGrid.getSelectedData.and.returnValue([{ name: 'Alice', val: 10 }]);
            let emitted: string[];
            directive.formattersReady.subscribe(f => emitted = f);

            directive.determineFormatters(false);

            expect(emitted).toContain('Data Bars');
            expect(emitted).toContain('Text Contains');
        });

        it('should use column data when fromColumn is true', () => {
            mockGrid.getSelectedColumnsData.and.returnValue([{ val: 5 }]);
            directive.determineFormatters(true);
            expect(mockGrid.getSelectedColumnsData).toHaveBeenCalled();
            expect(mockGrid.getSelectedData).not.toHaveBeenCalled();
        });
    });

    describe('colorScale formatter', () => {
        beforeEach(() => {
            (directive as any).formatedRange = new Map([[0, new Set([0])]]);
            (directive as any)._maxValue = 100;
        });

        it('should return undefined when cell is not in the formatted range', () => {
            expect(directive.colorScale.backgroundColor(null, 0, 50, 1)).toBeUndefined();
        });

        it('should return error color for values at or below the low threshold (33%)', () => {
            expect(directive.colorScale.backgroundColor(null, 0, 10, 0)).toBe(directive.formatColors.error);
        });

        it('should return warning color for mid-range values', () => {
            expect(directive.colorScale.backgroundColor(null, 0, 50, 0)).toBe(directive.formatColors.warning);
        });

        it('should return success color for values above the mid threshold (66%)', () => {
            expect(directive.colorScale.backgroundColor(null, 0, 80, 0)).toBe(directive.formatColors.success);
        });
    });

    describe('top10Percent formatter', () => {
        beforeEach(() => {
            (directive as any).formatedRange = new Map([[0, new Set([0])]]);
            (directive as any)._maxValue = 100;
        });

        it('should return info color for values above the top 10% threshold', () => {
            expect(directive.top10Percent.backgroundColor(null, 0, 95, 0)).toBe(directive.formatColors.info);
            expect(directive.top10Percent.color(null, 0, 95, 0)).toBe(directive.formatColors.text);
        });

        it('should return undefined for values below the top 10% threshold', () => {
            expect(directive.top10Percent.backgroundColor(null, 0, 85, 0)).toBeUndefined();
        });
    });

    describe('empty formatter', () => {
        beforeEach(() => {
            (directive as any).formatedRange = new Map([[0, new Set([0])]]);
        });

        it('should return info color for undefined cell values', () => {
            expect(directive.empty.backgroundColor(null, 0, undefined, 0)).toBe(directive.formatColors.info);
            expect(directive.empty.color(null, 0, undefined, 0)).toBe(directive.formatColors.text);
        });

        it('should return undefined for non-empty cell values', () => {
            expect(directive.empty.backgroundColor(null, 0, 'value', 0)).toBeUndefined();
        });
    });

    describe('textContains formatter', () => {
        beforeEach(() => {
            (directive as any).formatedRange = new Map([[0, new Set([0])]]);
            (directive as any)._valueForComparison = 'search';
        });

        it('should return info color when text contains the comparison value', () => {
            expect(directive.textContains.backgroundColor(null, 0, 'searchable text', 0)).toBe(directive.formatColors.info);
        });

        it('should match case-insensitively', () => {
            expect(directive.textContains.backgroundColor(null, 0, 'SEARCHABLE', 0)).toBe(directive.formatColors.info);
        });

        it('should return undefined when text does not contain the comparison value', () => {
            expect(directive.textContains.backgroundColor(null, 0, 'other text', 0)).toBeUndefined();
        });

        it('should return undefined for non-string values', () => {
            expect(directive.textContains.backgroundColor(null, 0, 42, 0)).toBeUndefined();
        });
    });

    describe('duplicates formatter', () => {
        beforeEach(() => {
            (directive as any).formatedRange = new Map([[0, new Set([0])]]);
        });

        it('should return info color for duplicate values', () => {
            mockGrid.getSelectedData.and.returnValue([{ val: 10 }, { val: 10 }, { val: 20 }]);
            expect(directive.duplicates.backgroundColor(null, 0, 10, 0)).toBe(directive.formatColors.info);
        });

        it('should return empty string for unique values', () => {
            mockGrid.getSelectedData.and.returnValue([{ val: 10 }, { val: 20 }, { val: 30 }]);
            expect(directive.duplicates.backgroundColor(null, 0, 10, 0)).toBe('');
        });
    });

    describe('uniques formatter', () => {
        beforeEach(() => {
            (directive as any).formatedRange = new Map([[0, new Set([0])]]);
        });

        it('should return info color for unique values', () => {
            mockGrid.getSelectedData.and.returnValue([{ val: 10 }, { val: 20 }, { val: 30 }]);
            expect(directive.uniques.backgroundColor(null, 0, 10, 0)).toBe(directive.formatColors.info);
        });

        it('should return empty string for duplicate values', () => {
            mockGrid.getSelectedData.and.returnValue([{ val: 10 }, { val: 10 }, { val: 20 }]);
            expect(directive.uniques.backgroundColor(null, 0, 10, 0)).toBe('');
        });
    });

    describe('formatCells', () => {
        let col0: any, col1: any, col2: any;

        beforeEach(() => {
            col0 = { visibleIndex: 0, cellStyles: undefined };
            col1 = { visibleIndex: 1, cellStyles: undefined };
            col2 = { visibleIndex: 2, cellStyles: undefined };
            mockGrid.visibleColumns = [col0, col1, col2];
            mockGrid.getSelectedRanges.and.returnValue([{ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 1 }]);
            mockGrid.getSelectedData.and.returnValue([{ val: 10 }, { val: 20 }]);
            mockGrid.data = [{ val: 10 }, { val: 20 }];
        });

        it('should apply the formatter style to columns within the selected range', () => {
            directive.formatCells(ConditionalFormattingType.ColorScale);
            expect(col0.cellStyles).toBeDefined();
            expect(col1.cellStyles).toBeDefined();
        });

        it('should not apply the formatter style to columns outside the selected range', () => {
            directive.formatCells(ConditionalFormattingType.ColorScale);
            expect(col2.cellStyles).toBeUndefined();
        });

        it('should set the formatter property to the given formatter name', () => {
            directive.formatCells(ConditionalFormattingType.ColorScale);
            expect(directive.formatter).toBe(ConditionalFormattingType.ColorScale);
        });

        it('should notify the grid of changes for each column in range', () => {
            directive.formatCells(ConditionalFormattingType.ColorScale);
            expect(mockGrid.notifyChanges).toHaveBeenCalled();
        });
    });

    describe('clearFormatting', () => {
        it('should set cellStyles to undefined on all visible columns', () => {
            const col0 = { visibleIndex: 0, cellStyles: { backgroundColor: () => 'red' } };
            const col1 = { visibleIndex: 1, cellStyles: { backgroundColor: () => 'blue' } };
            mockGrid.visibleColumns = [col0, col1];

            directive.clearFormatting();

            expect(col0.cellStyles).toBeUndefined();
            expect(col1.cellStyles).toBeUndefined();
        });

        it('should set the formatter property to undefined', () => {
            directive.formatter = ConditionalFormattingType.ColorScale;
            directive.clearFormatting();
            expect(directive.formatter).toBeUndefined();
        });
    });

    describe('recalcCachedValues', () => {
        it('should set _startColumn and _endColumn from selected ranges', () => {
            mockGrid.getSelectedRanges.and.returnValue([{ rowStart: 0, rowEnd: 2, columnStart: 1, columnEnd: 3 }]);
            mockGrid.getSelectedData.and.returnValue([{ val: 10 }, { val: 50 }, { val: 30 }]);

            directive.recalcCachedValues(true);

            expect((directive as any)._startColumn).toBe(1);
            expect((directive as any)._endColumn).toBe(3);
        });

        it('should set _startColumn and _endColumn from selected columns when no ranges exist', () => {
            mockGrid.getSelectedRanges.and.returnValue([]);
            mockGrid.selectedColumns.and.returnValue([{ visibleIndex: 2 }, { visibleIndex: 4 }]);

            directive.recalcCachedValues(true);

            expect((directive as any)._startColumn).toBe(2);
            expect((directive as any)._endColumn).toBe(4);
        });

        it('should calculate _maxValue and _minValue from selected numeric data', () => {
            mockGrid.getSelectedRanges.and.returnValue([{ rowStart: 0, rowEnd: 2, columnStart: 0, columnEnd: 0 }]);
            mockGrid.getSelectedData.and.returnValue([{ val: 10 }, { val: -5 }, { val: 30 }]);

            directive.recalcCachedValues(true);

            expect((directive as any)._maxValue).toBe(30);
            expect((directive as any)._minValue).toBe(-5);
        });

        it('should set _minValue to 0 when all values are positive', () => {
            mockGrid.getSelectedRanges.and.returnValue([{ rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 0 }]);
            mockGrid.getSelectedData.and.returnValue([{ val: 10 }, { val: 30 }]);

            directive.recalcCachedValues(true);

            expect((directive as any)._minValue).toBe(0);
        });
    });

    describe('dataBars formatter', () => {
        beforeEach(() => {
            (directive as any).formatedRange = new Map([[0, new Set([0])]]);
            (directive as any)._maxValue = 100;
            (directive as any)._minValue = 0;
        });

        it('should return a right-direction gradient for positive values', () => {
            const result = directive.dataBars.backgroundImage(null, 0, 50, 0);
            expect(result).toContain('to right');
            expect(result).toContain(directive.formatColors.success);
        });

        it('should return a left-direction gradient for negative values', () => {
            (directive as any)._minValue = -100;
            const result = directive.dataBars.backgroundImage(null, 0, -50, 0);
            expect(result).toContain('to left');
            expect(result).toContain(directive.formatColors.error);
        });

        it('should return undefined for non-numeric values', () => {
            expect(directive.dataBars.backgroundImage(null, 0, 'text', 0)).toBeUndefined();
        });
    });
});
