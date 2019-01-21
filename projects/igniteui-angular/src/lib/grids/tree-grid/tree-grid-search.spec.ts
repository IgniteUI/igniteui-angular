import { async, TestBed } from '@angular/core/testing';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IgxTreeGridModule } from './index';
import { TreeGridFunctions, CELL_VALUE_DIV_CSS_CLASS } from '../../test-utils/tree-grid-functions.spec';
import { IgxTreeGridSearchComponent, IgxTreeGridPrimaryForeignKeyComponent } from '../../test-utils/tree-grid-components.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

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
            verifySearchResult(fixNativeElement, actualCount, 10, 0);

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
            verifySearchResult(fixNativeElement, actualCount, 6, 0);

            actualCount = treeGrid.findNext('Software Developer');
            verifySearchResult(fixNativeElement, actualCount, 6, 1);

            actualCount = treeGrid.findPrev('Software Developer');
            verifySearchResult(fixNativeElement, actualCount, 6, 0);

            actualCount = treeGrid.findNext('Software Developer');
            verifySearchResult(fixNativeElement, actualCount, 6, 1);

            actualCount = treeGrid.findNext('Software Developer');
            verifySearchResult(fixNativeElement, actualCount, 6, 2);

            actualCount = treeGrid.findPrev('Software Developer');
            verifySearchResult(fixNativeElement, actualCount, 6, 1);
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
            verifySearchResult(fixNativeElement, actualCount, 7, 0);

            actualCount = treeGrid.findNext('re');
            verifySearchResult(fixNativeElement, actualCount, 7, 1);

            actualCount = treeGrid.findPrev('re');
            verifySearchResult(fixNativeElement, actualCount, 7, 0);

            actualCount = treeGrid.findNext('re');
            verifySearchResult(fixNativeElement, actualCount, 7, 1);

            actualCount = treeGrid.findNext('re');
            verifySearchResult(fixNativeElement, actualCount, 7, 2);

            actualCount = treeGrid.findPrev('re');
            verifySearchResult(fixNativeElement, actualCount, 7, 1);
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
 * Verifies the results from a search execution by providing the actualAPISearchCount that is returned
 * by the findNext/findPrev methods and the expected count and active index.
*/
function verifySearchResult(nativeParent, actualAPISearchCount, expectedHighlightSpansCount, expectedActiveSpanIndex) {
    const spans = getHighlightSpans(nativeParent);
    const activeSpan = getActiveSpan(nativeParent);

    expect(actualAPISearchCount).toBe(expectedHighlightSpansCount, 'incorrect highlight elements count returned from api');
    expect(spans.length).toBe(expectedHighlightSpansCount, 'incorrect highlight elements count');
    expect(activeSpan).toBe(spans[expectedActiveSpanIndex], 'incorrect active element');
}

function getHighlightedCellValue(cell: HTMLElement) {
    const valueDivs: HTMLElement[] = Array.from(cell.querySelectorAll(CELL_VALUE_DIV_CSS_CLASS));
    return valueDivs.filter(v => !v.hidden).map(v => v.innerText.trim()).join('');
}
