// Helpers shared by the grid filtering UI specs.
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxInputDirective } from 'igniteui-angular/input-group';
import { IgxGridFilteringRowComponent } from 'igniteui-angular/grids/core';
import { wait } from './ui-interactions.spec';
import { GridFunctions } from './grid-functions.spec';
import { ControlsFunction } from './controls-functions.spec';
import { IFilteringExpression } from 'igniteui-angular/core';
import { expect } from 'vitest';

/** Frames a scroll takes: the scroll event, then the frame of its requestAnimationFrame-throttled handler. */
export const SCROLL_FRAMES = 2;
export const FILTER_UI_ROW = 'igx-grid-filtering-row';
export const FILTER_UI_CELL = 'igx-grid-filtering-cell';

/** Waits for the CSS transitions running in the element's subtree to end. */
export const transitionsEnd = (element: HTMLElement) =>
    Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished));

/**
 * Types a value in the filter row input and waits for the (debounced) value to be applied.
 */
export const typeFilterRowValue = async (fix: ComponentFixture<any>, value: string) => {
    GridFunctions.typeValueInFilterRowInput(value, fix);
    await wait();
    await fix.whenStable();
    fix.detectChanges();
};

/**
 * Commits the current filter row condition by pressing 'Enter' in the filter row editor.
 */
export const commitFilterRowInput = (fix: ComponentFixture<any>) => {
    const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
    const editor = filterUIRow.query(By.directive(IgxInputDirective)).nativeElement as HTMLElement;
    editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fix.detectChanges();
};

export const verifyFilterRowUI = (input, closeButton, resetButton, buttonResetDisabled = true) => {
    ControlsFunction.verifyButtonIsDisabled(closeButton.nativeElement, false);
    ControlsFunction.verifyButtonIsDisabled(resetButton.nativeElement, buttonResetDisabled);
    expect(input.nativeElement.offsetHeight).toBeGreaterThan(0);
};

export const verifyFilterUIPosition = (filterUIContainer, grid) => {
    const filterUiRightBorder = filterUIContainer.nativeElement.offsetParent.offsetLeft +
        filterUIContainer.nativeElement.offsetLeft + filterUIContainer.nativeElement.offsetWidth;
    expect(filterUiRightBorder).toBeLessThanOrEqual(grid.nativeElement.offsetWidth);
};

export const verifyFilteringExpression = (operand: IFilteringExpression, fieldName: string, conditionName: string, searchVal: any) => {
    expect(operand.fieldName).toBe(fieldName);
    expect(operand.condition.name).toBe(conditionName);
    expect(operand.conditionName).toBe(conditionName);
    expect(operand.searchVal).toEqual(searchVal);
};

export const verifyExcelStyleFilterAvailableOptions = (fix, labels: string[], checked: boolean[]) => {
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
    const labelElements: any[] = Array.from(GridFunctions.getExcelStyleSearchComponentListItems(fix, excelMenu));
    const checkboxElements: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu));

    expect(labelElements.length, 'incorrect rendered list items count').toBe(labels.length);
    labels.forEach((l, index) => {
        expect(l).toEqual(labelElements[index].innerText.normalize("NFKD"));
    });
    checked.forEach((c, index) => {
        expect(checkboxElements[index].indeterminate ? null : checkboxElements[index].checked).toEqual(c);
    });
};

export const toggleExcelStyleFilteringItems = async (fix, shouldApply: boolean, ...itemIndices: number[]) => {
    const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
    const checkbox = GridFunctions.getExcelStyleFilteringCheckboxes(fix, excelMenu);

    for (const index of itemIndices) {
        checkbox[index].click();
    }
    await fix.whenStable();
    fix.detectChanges();

    if (shouldApply) {
        GridFunctions.clickApplyExcelStyleFiltering(fix, excelMenu);
        await fix.whenStable();
        fix.detectChanges();
    }
};

/**
 * Verfiy multiple condition chips on their respective indices (asc order left to right)
 * are whether fully visible or not.
 */
export const verifyMultipleChipsVisibility = (fix, expectedVisibilities: boolean[]) => {
    for (let index = 0; index < expectedVisibilities.length; index++) {
        verifyChipVisibility(fix, index, expectedVisibilities[index]);
    }
};

/**
 * Verfiy that the condition chip on the respective index (asc order left to right)
 * is whether fully visible or not.
 */
export const isChipFullyVisible = (fix, index: number): boolean => {
    const filteringRow = fix.debugElement.query(By.directive(IgxGridFilteringRowComponent));
    const visibleChipArea = filteringRow.query(By.css('.igx-grid__filtering-row-main'));
    const visibleChipAreaRect = visibleChipArea.nativeElement.getBoundingClientRect();
    const chipRect = GridFunctions.getFilterConditionChip(fix, index).getBoundingClientRect();
    return chipRect.left >= visibleChipAreaRect.left && chipRect.right <= visibleChipAreaRect.right;
};

export const verifyChipVisibility = (fix, index: number, shouldBeFullyVisible: boolean) => {
    expect(isChipFullyVisible(fix, index), 'chip[' + index + '] visibility is incorrect').toBe(shouldBeFullyVisible);
};
