import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IgxCheckboxComponent, IgxGridComponent, IgxGridCellComponent } from '../../public_api';
import { wait, UIInteractions } from '../test-utils/ui-interactions.spec';
import { take } from 'rxjs/operators';
import { IgxGridGroupByRowComponent } from '../grids/grid/groupby-row.component';

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
        colIndex?: number) => new Promise(async (resolve, reject) => {
            const dir = rowStartIndex > rowEndIndex ? 'ArrowUp' : 'ArrowDown';
            const row = grid.getRowByIndex(rowStartIndex);
            const cIndx = colIndex || 0;
            const colKey = grid.columnList.toArray()[cIndx].field;
            let nextRow = dir === 'ArrowUp' ? grid.getRowByIndex(rowStartIndex - 1) : grid.getRowByIndex(rowStartIndex + 1);
            const elem = row instanceof IgxGridGroupByRowComponent ?
                row : grid.getCellByColumn(row.index, colKey);

            if (rowStartIndex === rowEndIndex) {
                resolve();
                return;
            }

            UIInteractions.triggerKeyDownEvtUponElem(dir,  elem.nativeElement, true);

            if (nextRow) {
                await wait(20);
                HelperUtils.navigateVerticallyToIndex(grid, nextRow.index, rowEndIndex, colIndex)
                    .then(() => { resolve(); });
            } else {
                // else wait for chunk to load.
                grid.verticalScrollContainer.onChunkLoad.pipe(take(1)).subscribe({
                    next: async () => {
                        nextRow = dir === 'ArrowUp' ? grid.getRowByIndex(rowStartIndex - 1) : grid.getRowByIndex(rowStartIndex + 1);
                        HelperUtils.navigateVerticallyToIndex(grid, nextRow.index, rowEndIndex, colIndex)
                            .then(() => { resolve(); });
                    }
                });
            }
        })

    public static navigateHorizontallyToIndex = (
        grid: IgxGridComponent,
        cell: IgxGridCellComponent,
        index: number) => new Promise(async (resolve) => {
            // grid - the grid in which to navigate.
            // cell - current cell from which the navigation will start.
            // index - the index to which to navigate

            const currIndex = cell.visibleColumnIndex;
            const dir = currIndex < index ? 'ArrowRight' : 'ArrowLeft';
            const nextIndex = dir === 'ArrowRight' ? currIndex + 1 : currIndex - 1;
            const visibleColumns = grid.visibleColumns.sort((c1, c2) => c1.visibleIndex - c2.visibleIndex);
            const nextCol = visibleColumns[nextIndex];
            let nextCell = nextCol ? grid.getCellByColumn(0, nextCol.field) : null;

            // if index reached return
            if (currIndex === index) { resolve(); return; }
            // else call arrow up/down
            UIInteractions.triggerKeyDownEvtUponElem(dir, cell.nativeElement, true);

            grid.cdr.detectChanges();
            // if next row exists navigate next
            if (nextCell) {
                await wait(10);
                grid.cdr.detectChanges();
                HelperUtils.navigateHorizontallyToIndex(grid, nextCell, index).then(() => { resolve(); });
            } else {
                // else wait for chunk to load.
                grid.parentVirtDir.onChunkLoad.pipe(take(1)).subscribe({
                    next: () => {
                        grid.cdr.detectChanges();
                        nextCell = nextCol ? grid.getCellByColumn(0, nextCol.field) : null;
                        HelperUtils.navigateHorizontallyToIndex(grid, nextCell, index).then(() => { resolve(); });
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
}
