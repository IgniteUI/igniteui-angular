import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IgxCheckboxComponent, IgxGridComponent } from '../../public_api';
import { wait } from '../test-utils/ui-interactions.spec';
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
                if (!elem.focused) {
                    elem.nativeElement.focus();
                }
                resolve();
                return;
            }
            const keyboardEvent = new KeyboardEvent('keydown', {
                code: dir,
                key: dir
            });

            if (dir === 'ArrowDown') {
                elem.nativeElement.dispatchEvent(keyboardEvent);
            } else {
                elem.nativeElement.dispatchEvent(keyboardEvent);
            }

            if (nextRow) {
                await wait(10);
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

    public static verifyColumnSummaries(summaryRow: DebugElement, summaryIndex: number, summaryLabels, summaryResults) {
        const summary = summaryRow.query(By.css('igx-grid-summary-cell[data-visibleindex="' + summaryIndex + '"]'));
        expect(summary).toBeDefined();
        const summaryItems = summary.queryAll(By.css('.igx-grid-summary__item'));
        if (summaryLabels.length === 0) {
            expect(summary.nativeElement.classList.contains('igx-grid-summary--empty')).toBeTruthy();
            expect(summaryItems.length).toBe(0);
        } else {
            expect(summary.nativeElement.classList.contains('igx-grid-summary--empty')).toBeFalsy();
            expect(summaryItems.length).toEqual(summaryLabels.length);
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
