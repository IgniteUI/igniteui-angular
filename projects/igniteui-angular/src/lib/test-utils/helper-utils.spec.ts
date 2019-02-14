import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IgxCheckboxComponent, IgxGridComponent, IgxGridCellComponent } from '../../public_api';
import { wait, UIInteractions } from '../test-utils/ui-interactions.spec';
import { take } from 'rxjs/operators';
import { IgxGridGroupByRowComponent } from '../grids/grid/groupby-row.component';

const CELL_ACTIVE_CSS_CLASS = 'igx-grid-summary--active';
const CELL_SELECTED_CSS_CLASS = 'igx-grid__td--selected';
const DEBOUNCETIME = 50;

export class HelperUtils {
    public static getCheckboxElement(name: string, element: DebugElement, fix) {
        const checkboxElements = element.queryAll(By.css('igx-checkbox'));
        const chkElement = checkboxElements.find((el) =>
            (el.context as IgxCheckboxComponent).placeholderLabel.nativeElement.innerText === name);

        return chkElement;
    }

    public static getCheckboxInput(name: string, element: DebugElement, fix) {
        const checkboxEl = HelperUtils.getCheckboxElement(name, element, fix);
        const chkInput = checkboxEl.query(By.css('input')).nativeElement as HTMLInputElement;

        return chkInput;
    }

    public static getCheckboxInputs(element: DebugElement): HTMLInputElement[] {
        const checkboxElements = element.queryAll(By.css('igx-checkbox'));
        const inputs = [];
        checkboxElements.forEach((el) => {
            inputs.push(el.query(By.css('input')).nativeElement as HTMLInputElement);
        });

        return inputs;
    }

    public static verifyCheckbox(name: string, isChecked: boolean, isDisabled: boolean, element: DebugElement, fix) {
        const chkInput = HelperUtils.getCheckboxInput(name, element, fix);
        expect(chkInput.type).toBe('checkbox');
        expect(chkInput.disabled).toBe(isDisabled);
        expect(chkInput.checked).toBe(isChecked);
    }

    public static clearOverlay() {
        const overlays = document.getElementsByClassName('igx-overlay') as HTMLCollectionOf<Element>;
        Array.from(overlays).forEach(element => {
            element.remove();
        });
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
    }

    public static navigateVerticallyToIndex = (
            grid: IgxGridComponent,
            rowStartIndex: number,
            rowEndIndex: number,
            colIndex?: number,
            shift = false) => new Promise(async (resolve, reject) => {
                const dir = rowStartIndex > rowEndIndex ? 'ArrowUp' : 'ArrowDown';
                const row = grid.getRowByIndex(rowStartIndex);
                const cIndx = colIndex || 0;
                const colKey = grid.columnList.toArray()[cIndx].field;
                const nextIndex =  dir === 'ArrowUp' ? rowStartIndex - 1 : rowStartIndex + 1;
                let nextRow =  grid.getRowByIndex(nextIndex);
                if (!nextRow) {
                    nextRow = grid.summariesRowList.find( s => s.index === nextIndex);
                }

                let elem;
                if (row) {
                    elem = row instanceof IgxGridGroupByRowComponent ?
                    row : grid.getCellByColumn(row.index, colKey);
                } else {
                    const summariRow = grid.summariesRowList.find( s => s.index === rowStartIndex) ;
                    if (summariRow) {
                        elem = summariRow.summaryCells.find(cell => cell.visibleColumnIndex === cIndx);
                    }
                }

                if (rowStartIndex === rowEndIndex) {
                    resolve();
                    return;
                }

                UIInteractions.triggerKeyDownEvtUponElem(dir, elem.nativeElement, true, shift);

                if (nextRow) {
                    await wait(40);
                    HelperUtils.navigateVerticallyToIndex(grid, nextIndex, rowEndIndex, colIndex, shift)
                        .then(() => { resolve(); });
                } else {
                    // else wait for chunk to load.
                    grid.verticalScrollContainer.onChunkLoad.pipe(take(1)).subscribe({
                        next: async () => {
                            // nextRow = dir === 'ArrowUp' ? grid.getRowByIndex(rowStartIndex - 1) : grid.getRowByIndex(rowStartIndex + 1);
                            HelperUtils.navigateVerticallyToIndex(grid, nextIndex, rowEndIndex, colIndex, shift)
                                .then(() => { resolve(); });
                        }
                    });
                }
            })

    public static navigateHorizontallyToIndex = (
        grid: IgxGridComponent,
        cell: IgxGridCellComponent,
        index: number,
        shift = false) => new Promise(async (resolve) => {
            // grid - the grid in which to navigate.
            // cell - current cell from which the navigation will start.
            // index - the index to which to navigate
            // shift - if the Shift key should be pressed on keydown event

            const currIndex = cell.visibleColumnIndex;
            const dir = currIndex < index ? 'ArrowRight' : 'ArrowLeft';
            const nextIndex = dir === 'ArrowRight' ? currIndex + 1 : currIndex - 1;
            const visibleColumns = grid.visibleColumns.sort((c1, c2) => c1.visibleIndex - c2.visibleIndex);
            const nextCol = visibleColumns[nextIndex];
            let nextCell = nextCol ? grid.getCellByColumn(cell.rowIndex, nextCol.field) : null;

            // if index reached return
            if (currIndex === index) { resolve(); return; }
            // else call arrow up/down
            UIInteractions.triggerKeyDownEvtUponElem(dir, cell.nativeElement, true, shift);

            grid.cdr.detectChanges();
            // if next row exists navigate next
            if (nextCell) {
                await wait(10);
                grid.cdr.detectChanges();
                HelperUtils.navigateHorizontallyToIndex(grid, nextCell, index, shift).then(() => { resolve(); });
            } else {
                // else wait for chunk to load.
                grid.parentVirtDir.onChunkLoad.pipe(take(1)).subscribe({
                    next: () => {
                        grid.cdr.detectChanges();
                        nextCell = nextCol ? grid.getCellByColumn(cell.rowIndex, nextCol.field) : null;
                        HelperUtils.navigateHorizontallyToIndex(grid, nextCell, index, shift).then(() => { resolve(); });
                    }
                });
            }
        })

    public static expandCollapceGroupRow =
        (fix, groupRow: IgxGridGroupByRowComponent,
            cell: IgxGridCellComponent) => new Promise(async (resolve, reject) => {
                expect(groupRow.focused).toBe(true);
                expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);
                if (cell != null) {
                    expect(cell.selected).toBe(true);
                }

                groupRow.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'arrowleft', code: 'arrowleft', altKey: true }));
                await wait(300);
                fix.detectChanges();

                expect(groupRow.expanded).toBe(false);
                expect(groupRow.focused).toBe(true);
                expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);
                if (cell != null) {
                    expect(cell.selected).toBe(true);
                }

                groupRow.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'arrowright', code: 'arrowright', altKey: true }));
                await wait(100);
                fix.detectChanges();

                expect(groupRow.expanded).toBe(true);
                expect(groupRow.focused).toBe(true);
                expect(groupRow.nativeElement.classList.contains('igx-grid__group-row--active')).toBe(true);
                if (cell != null) {
                    expect(cell.selected).toBe(true);
                }
                resolve();
            })

    public static verifyColumnSummariesBySummaryRowIndex(fix, rowIndex: number, summaryIndex: number, summaryLabels, summaryResults) {
        const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, rowIndex);
        HelperUtils.verifyColumnSummaries(summaryRow, summaryIndex, summaryLabels, summaryResults);
    }

    public static verifyColumnSummaries(summaryRow: DebugElement, summaryIndex: number, summaryLabels, summaryResults) {
        // const summary = summaryRow.query(By.css('igx-grid-summary-cell[data-visibleindex="' + summaryIndex + '"]'));
        const summary = HelperUtils.getSummaryCellByVisibleIndex(summaryRow, summaryIndex);
        expect(summary).toBeDefined();
        const summaryItems = summary.queryAll(By.css('.igx-grid-summary__item'));
        if (summaryLabels.length === 0) {
            expect(summary.nativeElement.classList.contains('igx-grid-summary--empty')).toBeTruthy();
            expect(summaryItems.length).toBe(0);
        } else {
            expect(summary.nativeElement.classList.contains('igx-grid-summary--empty')).toBeFalsy();
            expect(summaryItems.length).toEqual(summaryLabels.length);
            if (summaryItems.length === summaryLabels.length) {
                for (let i = 0; i < summaryLabels.length; i++) {
                    const summaryItem = summaryItems[i];
                    const summaryLabel = summaryItem.query(By.css('.igx-grid-summary__label'));
                    expect(summaryLabels[i]).toEqual(summaryLabel.nativeElement.textContent.trim());
                    if (summaryResults.length > 0) {
                        const summaryResult = summaryItem.query(By.css('.igx-grid-summary__result'));
                        expect(summaryResults[i]).toEqual(summaryResult.nativeElement.textContent.trim());
                    }
                }
            }
        }
    }

    public static getSummaryRowByDataRowIndex(fix, rowIndex: number) {
        return fix.debugElement.query(By.css('igx-grid-summary-row[data-rowindex="' + rowIndex + '"]'));
    }

    public static getSummaryCellByVisibleIndex(summaryRow: DebugElement, summaryIndex: number) {
        return summaryRow.query(By.css('igx-grid-summary-cell[data-visibleindex="' + summaryIndex + '"]'));
    }

    public static getAllVisibleSummariesLength(fix) {
        return HelperUtils.getAllVisibleSummaries(fix).length;
    }

    public static getAllVisibleSummariesRowIndexes(fix) {
        const summaries = HelperUtils.getAllVisibleSummaries(fix);
        const rowIndexes = [];
        summaries.forEach(summary => {
            rowIndexes.push(Number(summary.attributes['data-rowIndex']));
        });
        return rowIndexes.sort((a: number, b: number) => a - b);
    }

    public static getAllVisibleSummaries(fix) {
        return fix.debugElement.queryAll(By.css('igx-grid-summary-row'));
    }

    public static verifyVisibleSummariesHeight(fix, summariesRows, rowHeight = 50) {
        const visibleSummaries = HelperUtils.getAllVisibleSummaries(fix);
        visibleSummaries.forEach(summary => {
            expect(summary.nativeElement.getBoundingClientRect().height).toBeGreaterThanOrEqual(summariesRows * rowHeight - 1);
            expect(summary.nativeElement.getBoundingClientRect().height).toBeLessThanOrEqual(summariesRows * rowHeight + 1);
        });
    }

    public static verifySummaryCellActive(fix, rowIndex, cellIndex, active: boolean = true) {
        const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, rowIndex);
        const summ = HelperUtils.getSummaryCellByVisibleIndex(summaryRow, cellIndex);
        const hasClass = summ.nativeElement.classList.contains(CELL_ACTIVE_CSS_CLASS);
        expect(hasClass === active).toBeTruthy();
    }

    public static moveSummaryCell =
        (fix, rowIndex, cellIndex, key, shift = false, ctrl = false) => new Promise(async (resolve, reject) => {
            const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, rowIndex);
            const summaryCell = HelperUtils.getSummaryCellByVisibleIndex(summaryRow, cellIndex);
            UIInteractions.triggerKeyDownEvtUponElem(key, summaryCell.nativeElement, shift, ctrl);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            resolve();
        })

    public static focusSummaryCell =
        (fix, rowIndex, cellIndex) => new Promise(async (resolve, reject) => {
            const summaryRow = HelperUtils.getSummaryRowByDataRowIndex(fix, rowIndex);
            const summaryCell = HelperUtils.getSummaryCellByVisibleIndex(summaryRow, cellIndex);
            summaryCell.nativeElement.dispatchEvent(new Event('focus'));
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            resolve();
        })

    public static selectCellsRange =
        (fix, startCell, endCell, ctrl = false, shift = false) => new Promise(async (resolve, reject) => {
            UIInteractions.simulateClickAndSelectCellEvent(startCell, shift, ctrl);
            await wait();
            fix.detectChanges();

            UIInteractions.simulatePointerOverCellEvent('pointerenter', endCell.nativeElement, shift, ctrl);
            UIInteractions.simulatePointerOverCellEvent('pointerup', endCell.nativeElement, shift, ctrl);
            await wait();
            fix.detectChanges();
            resolve();
        })

    public static selectCellsRangeNoWait(fix, startCell, endCell, ctrl = false, shift = false) {
            UIInteractions.simulatePointerOverCellEvent('pointerdown', startCell.nativeElement, shift, ctrl);
            startCell.nativeElement.dispatchEvent(new Event('focus'));
            fix.detectChanges();

            UIInteractions.simulatePointerOverCellEvent('pointerenter', endCell.nativeElement, shift, ctrl);
            UIInteractions.simulatePointerOverCellEvent('pointerup', endCell.nativeElement, shift, ctrl);
            fix.detectChanges();
        }

    public static selectCellsRangeWithShiftKey =
        (fix, startCell, endCell) => new Promise(async (resolve, reject) => {
            UIInteractions.simulateClickAndSelectCellEvent(startCell);
            await wait();
            fix.detectChanges();

            UIInteractions.simulateClickAndSelectCellEvent(endCell, true);
            await wait();
            fix.detectChanges();
            resolve();
        })

    public static selectCellsRangeWithShiftKeyNoWait (fix, startCell, endCell)  {
        UIInteractions.simulateClickAndSelectCellEvent(startCell);
        fix.detectChanges();

        UIInteractions.simulateClickAndSelectCellEvent(endCell, true);
        fix.detectChanges();
        }

    public static verifyCellsRegionSelected(grid, startRowIndex, endRowIndex, startColumnIndex,  endColumnIndex, selected = true) {
        const startRow = startRowIndex < endRowIndex ? startRowIndex : endRowIndex;
        const endRow = startRowIndex < endRowIndex ? endRowIndex : startRowIndex;
        const startCol = startColumnIndex < endColumnIndex ? startColumnIndex : endColumnIndex;
        const endCol = startColumnIndex < endColumnIndex ? endColumnIndex : startColumnIndex;
        for (let i = startCol; i <= endCol; i++) {
            for (let j = startRow; j <= endRow; j++) {
                const cell = grid.getCellByColumn(j, grid.columnList.find(col => col.visibleIndex === i).field);
                if (cell) {
                    HelperUtils.verifyCellSelected(cell, selected);
                }
            }
        }
    }

    public static verifySelectedRange(grid, rowStart, rowEnd, columnStart, columnEnd, rangeIndex = 0, selectedRanges = 1) {
        const range = grid.getSelectedRanges();
            expect(range).toBeDefined();
            expect(range.length).toBe(selectedRanges);
            expect(range[rangeIndex].columnStart).toBe(columnStart);
            expect(range[rangeIndex].columnEnd).toBe(columnEnd);
            expect(range[rangeIndex].rowStart).toBe(rowStart);
            expect(range[rangeIndex].rowEnd).toBe(rowEnd);
    }

    public static verifyCellSelected(cell, selected = true) {
        expect(cell.selected).toBe(selected);
        expect(cell.nativeElement.classList.contains(CELL_SELECTED_CSS_CLASS)).toBe(selected);
    }
}
