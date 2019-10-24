import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { ComponentFixture } from '@angular/core/testing';
import { IgxGridBaseDirective } from '../grids/index';
import { IgxHierarchicalGridComponent } from '../grids/hierarchical-grid';

export function resizeObserverIgnoreError() {
    jasmine.getEnv().allowRespy(true);
    const spy = spyOn(window, 'onerror').and.callFake((...args) => {
        if (args[0].toString().match('ResizeObserver loop limit exceeded')) {
            return;
        }
        spy.and.callThrough().withArgs(...args);
    });
    return spy;
}

export function setupGridScrollDetection(fixture: ComponentFixture<any>, grid: IgxGridBaseDirective) {
    grid.verticalScrollContainer.onChunkLoad.subscribe(() => fixture.detectChanges());
    grid.parentVirtDir.onChunkLoad.subscribe(() => fixture.detectChanges());
}

export function setupHierarchicalGridScrollDetection(fixture: ComponentFixture<any>, hierarchicalGrid: IgxHierarchicalGridComponent) {
    setupGridScrollDetection(fixture, hierarchicalGrid);

    const existingChildren = hierarchicalGrid.hgridAPI.getChildGrids(true);
    existingChildren.forEach(child => setupGridScrollDetection(fixture, child));

    const layouts = hierarchicalGrid.allLayoutList.toArray();
    layouts.forEach((layout) => {
        layout.onGridCreated.subscribe(evt => {
            setupGridScrollDetection(fixture, evt.grid);
        });
    });
}

export function verifyLayoutHeadersAreAligned(headerCells, rowCells) {
    for (let i; i < headerCells.length; i++) {
        expect(headerCells[i].headerCell.elementRef.nativeElement.offsetWidth)
            .toBe(rowCells[i].nativeElement.offsetWidth);
        expect(headerCells[i].headerCell.elementRef.nativeElement.offsetHeight)
            .toBe(rowCells[i].nativeElement.offsetHeight);
    }
}

export function verifyDOMMatchesLayoutSettings(row, colSettings) {
    const firstRowCells = row.cells.toArray();
    const rowElem = row.nativeElement;
    const mrlBlocks = rowElem.querySelectorAll('.igx-grid__mrl-block');

    colSettings.forEach((groupSetting, index) => {
        // check group has rendered block
        const groupBlock = mrlBlocks[index];
        const cellsFromBlock = firstRowCells.filter((cell) => cell.nativeElement.parentNode === groupBlock);
        expect(groupBlock).not.toBeNull();
        groupSetting.columns.forEach((col, colIndex) => {
            const cell = cellsFromBlock[colIndex];
            const cellElem = cell.nativeElement;
            // check correct attributes are applied
            expect(parseInt(cellElem.style['gridRowStart'], 10)).toBe(parseInt(col.rowStart, 10));
            expect(parseInt(cellElem.style['gridColumnStart'], 10)).toBe(parseInt(col.colStart, 10));
            expect(cellElem.style['gridColumnEnd']).toBe(col.colEnd ? col.colEnd.toString() : '');
            expect(cellElem.style['gridRowEnd']).toBe(col.rowEnd ? col.rowEnd.toString() : '');

            // check width
            let sum = 0;
            if (cell.gridColumnSpan > 1) {
                for (let i = col.colStart; i < col.colStart + cell.column.gridColumnSpan; i++) {
                    const colData = groupSetting.columns.find((currCol) => currCol.colStart === i && currCol.field !== col.field);
                    const col2 = row.grid.getColumnByName(colData ? colData.field : '');
                    sum += col2 ? parseFloat(col2.calcWidth) : 0;
                }
            }
            const expectedWidth = Math.max(parseFloat(cell.column.calcWidth) * cell.column.gridColumnSpan, sum);
            expect(cellElem.clientWidth - expectedWidth).toBeLessThan(1);
            // check height
            const expectedHeight = cell.grid.rowHeight * cell.gridRowSpan;
            expect(cellElem.offsetHeight).toBe(expectedHeight);

            // check offset left
            const acc = (accum, c) => {
                if (c.column.colStart < col.colStart && c.column.rowStart === col.rowStart) {
                    return accum += parseFloat(c.column.calcWidth) * c.column.gridColumnSpan;
                } else {
                    return accum;
                }
            };
            const expectedLeft = cellsFromBlock.reduce(acc, 0);
            expect(cellElem.offsetLeft - groupBlock.offsetLeft - expectedLeft).toBeLessThan(1);
            // check offsetTop
            const expectedTop = (col.rowStart - 1) * cell.grid.rowHeight;
            expect(cellElem.offsetTop).toBe(expectedTop);
        });
    });
}
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
}
