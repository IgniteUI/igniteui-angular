import { async, TestBed } from '@angular/core/testing';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridModule } from './index';
import { TreeGridFunctions, CELL_VALUE_DIV_CSS_CLASS } from '../../test-utils/tree-grid-functions.spec';
import { IgxTreeGridSearchComponent, IgxTreeGridPrimaryForeignKeyComponent } from '../../test-utils/tree-grid-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';

const HIGHLIGHT_CLASS = 'igx-highlight';
const ACTIVE_CLASS = 'igx-highlight__active';

describe('IgxTreeGrid - search API', () => {
    configureTestSuite();
    let fix;
    let fixNativeElement;
    let treeGrid: IgxTreeGridComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridSearchComponent,
                IgxTreeGridPrimaryForeignKeyComponent
            ],
            imports: [IgxTreeGridModule, NoopAnimationsModule]
        }).compileComponents();
    }));

    describe('Child Collection', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridSearchComponent);
            fix.detectChanges();
            fixNativeElement = fix.debugElement.nativeElement;
            treeGrid = fix.componentInstance.treeGrid;

            treeGrid.getColumnByName('JobTitle').autosize();
        });

        it('Search highlights should work within tree cell', () => {
            let actualCount = treeGrid.findNext('ev');

            // Verify total number of occurrences in treeGrid.
            verifySearchResult(fixNativeElement, 10, 0, actualCount);

            // Verify occurrences within a tree cell
            const treeCell = TreeGridFunctions.getTreeCell(TreeGridFunctions.getAllRows(fix)[1]);
            expect(getHighlightedCellValue(treeCell.nativeElement)).toBe('Software Developer Evangelist');

            // Active highlight is in second tree cell.
            let spans = getHighlightSpans(treeCell.nativeElement);
            let activeSpan = getActiveSpan(treeCell.nativeElement);
            expect(spans.length).toBe(2);
            expect(activeSpan).toBe(spans[0]);

            // Find next
            actualCount = treeGrid.findNext('ev');

            // Active highlight is still in second tree cell.
            spans = getHighlightSpans(treeCell.nativeElement);
            activeSpan = getActiveSpan(treeCell.nativeElement);
            expect(spans.length).toBe(2);
            expect(activeSpan).toBe(spans[1]);

            // Find next
            actualCount = treeGrid.findNext('ev');

            // Active highlight is no longer in the second tree cell.
            spans = getHighlightSpans(treeCell.nativeElement);
            activeSpan = getActiveSpan(treeCell.nativeElement);
            expect(spans.length).toBe(2);
            expect(activeSpan).not.toBe(spans[0]);
            expect(activeSpan).not.toBe(spans[1]);

            const othertreeCell = TreeGridFunctions.getTreeCell(TreeGridFunctions.getAllRows(fix)[2]);
            expect(getHighlightedCellValue(othertreeCell.nativeElement)).toBe('Junior Software Developer');

            // Active highlight is now in the third tree cell.
            spans = getHighlightSpans(othertreeCell.nativeElement);
            activeSpan = getActiveSpan(othertreeCell.nativeElement);
            expect(spans.length).toBe(1);
            expect(activeSpan).toBe(spans[0]);
        });

        it('Search highlights should work for root and child rows', () => {
            let actualCount = treeGrid.findNext('Software Developer');
            verifySearchResult(fixNativeElement, 6, 0, actualCount);

            actualCount = treeGrid.findNext('Software Developer');
            verifySearchResult(fixNativeElement, 6, 1, actualCount);

            actualCount = treeGrid.findPrev('Software Developer');
            verifySearchResult(fixNativeElement, 6, 0, actualCount);

            actualCount = treeGrid.findNext('Software Developer');
            verifySearchResult(fixNativeElement, 6, 1, actualCount);

            actualCount = treeGrid.findNext('Software Developer');
            verifySearchResult(fixNativeElement, 6, 2, actualCount);

            actualCount = treeGrid.findPrev('Software Developer');
            verifySearchResult(fixNativeElement, 6, 1, actualCount);
        });
    });

    describe('Primary/Foreign key', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridPrimaryForeignKeyComponent);
            fix.detectChanges();
            fixNativeElement = fix.debugElement.nativeElement;
            treeGrid = fix.componentInstance.treeGrid;
        });

        it('Search highlights should work for tree cells', () => {
            treeGrid.findNext('1');
            fix.detectChanges();

            const cell = TreeGridFunctions.getCell(fix, 0, 'ID').nativeElement;
            const highlights = getHighlightSpans(cell);
            const activeHighlight = getActiveSpan(cell);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).not.toBeNull();
            expect(getHighlightedCellValue(cell)).toBe('1');
        });

        it('Search highlights should work for root and child rows', () => {
            let actualCount = treeGrid.findNext('re');
            verifySearchResult(fixNativeElement, 7, 0, actualCount);

            actualCount = treeGrid.findNext('re');
            verifySearchResult(fixNativeElement, 7, 1, actualCount);

            actualCount = treeGrid.findPrev('re');
            verifySearchResult(fixNativeElement, 7, 0, actualCount);

            actualCount = treeGrid.findNext('re');
            verifySearchResult(fixNativeElement, 7, 1, actualCount);

            actualCount = treeGrid.findNext('re');
            verifySearchResult(fixNativeElement, 7, 2, actualCount);

            actualCount = treeGrid.findPrev('re');
            verifySearchResult(fixNativeElement, 7, 1, actualCount);
        });

        it('Should update search highlights when filtering', () => {
            treeGrid.findNext('Software Developer');

            verifySearchResult(fixNativeElement, 3, 0);

            // Apply filter
            treeGrid.filter('JobTitle', 'Associate', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();

            verifySearchResult(fixNativeElement, 2, 0);
        });

        it('Should update search highlights when clearing filter', () => {
            // Apply filter
            treeGrid.filter('JobTitle', 'Associate', IgxStringFilteringOperand.instance().condition('contains'));
            fix.detectChanges();

            treeGrid.findNext('Software Developer');

            verifySearchResult(fixNativeElement, 2, 0);

            // Clear filter
            treeGrid.clearFilter();
            fix.detectChanges();

            verifySearchResult(fixNativeElement, 3, 0);
        });

        it('Should update search highlights when sorting', () => {
            treeGrid.findNext('er');

            verifySearchResult(fixNativeElement, 6, 0);

            // Apply asc sorting
            treeGrid.columns.filter(c => c.field === 'JobTitle')[0].sortable = true;
            fix.detectChanges();
            treeGrid.sort({fieldName: 'JobTitle', dir: SortingDirection.Asc, ignoreCase: true });
            fix.detectChanges();

            verifySearchResult(fixNativeElement, 6, 3);

            // Apply desc sorting
            treeGrid.sort({fieldName: 'JobTitle', dir: SortingDirection.Desc, ignoreCase: true });
            fix.detectChanges();

            verifySearchResult(fixNativeElement, 6, 1);
        });

        it('Should update search highlights when clearing sorting', () => {
            // Apply asc sorting
            treeGrid.columns.filter(c => c.field === 'JobTitle')[0].sortable = true;
            fix.detectChanges();
            treeGrid.sort({fieldName: 'JobTitle', dir: SortingDirection.Asc, ignoreCase: true });
            fix.detectChanges();

            treeGrid.findNext('er');

            verifySearchResult(fixNativeElement, 6, 0);

            // Clear sorting
            treeGrid.clearSort();
            fix.detectChanges();

            verifySearchResult(fixNativeElement, 6, 3);
        });
    });
});

function getHighlightSpans(nativeParent: HTMLElement) {
    return nativeParent.querySelectorAll('.' + HIGHLIGHT_CLASS);
}

function getActiveSpan(nativeParent: HTMLElement) {
    return nativeParent.querySelector('.' + ACTIVE_CLASS);
}

/**
 * Verifies the results from a search execution by providing the expected highlighted elements count
 * and the expected active highlight index.
 * (Optionally the result from findNext/findPrev methods - the actualAPISearchCount, can also be checked.)
*/
function verifySearchResult(nativeParent, expectedHighlightSpansCount, expectedActiveSpanIndex, actualAPISearchCount?) {
    const spans = getHighlightSpans(nativeParent);
    const activeSpan = getActiveSpan(nativeParent);

    if (actualAPISearchCount) {
        expect(actualAPISearchCount).toBe(expectedHighlightSpansCount, 'incorrect highlight elements count returned from api');
    }
    expect(spans.length).toBe(expectedHighlightSpansCount, 'incorrect highlight elements count');
    expect(activeSpan).toBe(spans[expectedActiveSpanIndex], 'incorrect active element');
}

function getHighlightedCellValue(cell: HTMLElement) {
    const valueDivs: HTMLElement[] = Array.from(cell.querySelectorAll(CELL_VALUE_DIV_CSS_CLASS));
    return valueDivs.filter(v => !v.hidden).map(v => v.innerText.trim()).join('');
}
