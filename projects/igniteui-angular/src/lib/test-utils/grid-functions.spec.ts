
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, tick } from '@angular/core/testing';
import { IgxInputDirective } from '../input-group';
import { IgxGridHeaderComponent } from '../grids/grid-header.component';
import { IgxChipComponent } from '../chips';
import { IgxGridComponent } from '../grids/grid/grid.component';
import { IgxColumnGroupComponent } from '../grids/column.component';
import { IgxGridHeaderGroupComponent } from '../grids/grid-header-group.component';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { UIInteractions } from './ui-interactions.spec';

const SUMMARY_LABEL_CLASS = '.igx-grid-summary__label';
const SORTING_ICON_ASC_CONTENT = 'arrow_upward';
const FILTER_UI_ROW = 'igx-grid-filtering-row';
const FILTER_UI_CONNECTOR = 'igx-filtering-chips__connector';
const FILTER_UI_INDICATOR = 'igx-grid__filtering-cell-indicator';
const BANNER_CLASS = '.igx-banner';
const BANNER_TEXT_CLASS = '.igx-banner__text';
const BANNER_ROW_CLASS = '.igx-banner__row';
const EDIT_OVERLAY_CONTENT = '.igx-overlay__content';
const PAGER_BUTTONS = '.igx-grid-paginator__pager > button';

export class GridFunctions {

    public static getColGroup(grid: IgxGridComponent, headerName: string): IgxColumnGroupComponent {
        const colGroups = grid.columnList.filter(c => c.columnGroup && c.header === headerName);
        if (colGroups.length === 0) {
            return null;
        } else if (colGroups.length === 1) {
            return colGroups[0];
        } else {
            throw new Error('More than one column group found.');
        }
    }

    public static calcMaxSummaryHeight(columnList, summaries: DebugElement[], defaultRowHeight) {
        let maxSummaryLength = 0;
        let index = 0;
        columnList.filter((col) => col.hasSummary).forEach((column) => {
            const currentLength = summaries[index].queryAll(By.css(SUMMARY_LABEL_CLASS)).length;
            if (maxSummaryLength < currentLength) {
                maxSummaryLength = currentLength;
            }
            index++;
        });
        const expectedLength = maxSummaryLength * defaultRowHeight;
        return expectedLength;
    }

    public static scrollLeft(grid: IgxGridComponent, newLeft: number) {
        const hScrollbar = grid.parentVirtDir.getHorizontalScroll();
        hScrollbar.scrollLeft = newLeft;
    }

    public static scrollRight(grid: IgxGridComponent, newRight: number) {
        const hScrollbar = grid.parentVirtDir.getHorizontalScroll();
        hScrollbar.scrollRight = newRight;
    }

    public static setGridScrollTop(grid: IgxGridComponent, newTop: number) {
        const vScrollbar = grid.verticalScrollContainer.getVerticalScroll();
        vScrollbar.scrollTop = newTop;
    }

    public static getCurrentCellFromGrid(grid, row, cell) {
        const gridRow = grid.rowList.toArray()[row];
        const gridCell = gridRow.cells.toArray()[cell];
        return gridCell;
    }

    public static getValueFromCellElement(cell) {
        return cell.nativeElement.textContent.trim();
    }

    public static verifyColumnIsHidden(column, isHidden: boolean, visibleColumnsCount: number) {
        expect(column.hidden).toBe(isHidden, 'Hidden is not ' + isHidden);

        const visibleColumns = column.grid.visibleColumns;
        expect(visibleColumns.length).toBe(visibleColumnsCount, 'Unexpected visible columns count!');
        expect(visibleColumns.findIndex((col) => col === column) > -1).toBe(!isHidden, 'Unexpected result for visibleColumns collection!');
    }

    public static  verifyColumnIsPinned(column, isPinned: boolean, pinnedColumnsCount: number) {
        expect(column.pinned).toBe(isPinned, 'Pinned is not ' + isPinned);

        const pinnedColumns = column.grid.pinnedColumns;
        expect(pinnedColumns.length).toBe(pinnedColumnsCount, 'Unexpected pinned columns count!');
        expect(pinnedColumns.findIndex((col) => col === column) > -1).toBe(isPinned, 'Unexpected result for pinnedColumns collection!');
    }

    /* Filtering-related methods */
    public static verifyFilterUIPosition(filterUIContainer, grid) {
        const filterUiRightBorder = filterUIContainer.nativeElement.offsetParent.offsetLeft +
        filterUIContainer.nativeElement.offsetLeft + filterUIContainer.nativeElement.offsetWidth;
        expect(filterUiRightBorder).toBeLessThanOrEqual(grid.nativeElement.offsetWidth);
    }

    // Generate expected results for 'date' filtering conditions based on the current date
    public static createDateFilterConditions(grid: IgxGridComponent, today) {
        const expectedResults = [];
        // day + 15
        const dateItem0 = GridFunctions.generateICalendarDate(grid.data[0].ReleaseDate,
            today.getFullYear(), today.getMonth());
        // month - 1
        const dateItem1 = GridFunctions.generateICalendarDate(grid.data[1].ReleaseDate,
            today.getFullYear(), today.getMonth());
        // day - 1
        const dateItem3 = GridFunctions.generateICalendarDate(grid.data[3].ReleaseDate,
            today.getFullYear(), today.getMonth());
        // day + 1
        const dateItem5 = GridFunctions.generateICalendarDate(grid.data[5].ReleaseDate,
            today.getFullYear(), today.getMonth());
        // month + 1
        const dateItem6 = GridFunctions.generateICalendarDate(grid.data[6].ReleaseDate,
            today.getFullYear(), today.getMonth());

        let thisMonthCountItems = 1;
        let nextMonthCountItems = 1;
        let lastMonthCountItems = 1;
        let thisYearCountItems = 6;
        let nextYearCountItems = 0;
        let lastYearCountItems = 0;

        // LastMonth filter
        if (dateItem3.isPrevMonth) {
            lastMonthCountItems++;
        }
        expectedResults[0] = lastMonthCountItems;

        // thisMonth filter
        if (dateItem0.isCurrentMonth) {
            thisMonthCountItems++;
        }

        if (dateItem3.isCurrentMonth) {
            thisMonthCountItems++;
        }

        if (dateItem5.isCurrentMonth) {
            thisMonthCountItems++;
        }

        // NextMonth filter
        if (dateItem0.isNextMonth) {
            nextMonthCountItems++;
        }

        if (dateItem5.isNextMonth) {
            nextMonthCountItems++;
        }
        expectedResults[1] = nextMonthCountItems;

        // ThisYear, NextYear, PreviousYear filter

        // day + 15
        if (!dateItem0.isThisYear) {
            thisYearCountItems--;
        } else if (dateItem0.isNextYear) {
            nextYearCountItems++;
        }

        // month - 1
        if (!dateItem1.isThisYear) {
            thisYearCountItems--;
        }

        if (dateItem1.isLastYear) {
            lastYearCountItems++;
        }

        // day - 1
        if (!dateItem3.isThisYear) {
            thisYearCountItems--;
        }

        if (dateItem3.isLastYear) {
            lastYearCountItems++;
        }

        // day + 1
        if (!dateItem5.isThisYear) {
            thisYearCountItems--;
        }

        if (dateItem5.isNextYear) {
            nextYearCountItems++;
        }

        // month + 1
        if (!dateItem6.isThisYear) {
            thisYearCountItems--;
        }

        if (dateItem6.isNextYear) {
            nextYearCountItems++;
        }

        // ThisYear filter result
        expectedResults[2] = thisYearCountItems;

        // NextYear filter result
        expectedResults[3] = nextYearCountItems;

        // PreviousYear filter result
        expectedResults[4] = lastYearCountItems;

        // ThisMonth filter result
        expectedResults[5] = thisMonthCountItems;

        return expectedResults;
    }

    public static generateICalendarDate(date: Date, year: number, month: number) {
        return {
            date,
            isCurrentMonth: date.getFullYear() === year && date.getMonth() === month,
            isLastYear: GridFunctions.isLastYear(date, year),
            isNextMonth: GridFunctions.isNextMonth(date, year, month),
            isNextYear: GridFunctions.isNextYear(date, year),
            isPrevMonth: GridFunctions.isPreviousMonth(date, year, month),
            isThisYear: GridFunctions.isThisYear(date, year)
        };
    }

    public static isPreviousMonth(date: Date, year: number, month: number): boolean {
        if (date.getFullYear() === year) {
            return date.getMonth() < month;
        }
        return date.getFullYear() < year;
    }

    public static isNextMonth(date: Date, year: number, month: number): boolean {
        if (date.getFullYear() === year) {
            return date.getMonth() > month;
        }
        return date.getFullYear() > year;
    }

    public static isThisYear(date: Date, year: number): boolean {
        return date.getFullYear() === year;
    }

    public static isLastYear(date: Date, year: number): boolean {
        return date.getFullYear() < year;
    }

    public static isNextYear(date: Date, year: number): boolean {
        return date.getFullYear() > year;
    }

    /* Grouping-related members */
    public static checkGroups(groupRows, expectedGroupOrder, grExpr?) {
        // verify group rows are sorted correctly, their indexes in the grid are correct and their group records match the group value.
        let count = 0;
        const maxLevel = grExpr ? grExpr.length - 1 : 0;
        for (const groupRow of groupRows) {
            const recs = groupRow.groupRow.records;
            const val = groupRow.groupRow.value;
            const index = groupRow.index;
            const field = groupRow.groupRow.expression.fieldName;
            const level = groupRow.groupRow.level;
            expect(level).toEqual(grExpr ? grExpr.indexOf(groupRow.groupRow.expression) : 0);
            expect(index).toEqual(count);
            count++;
            expect(val).toEqual(expectedGroupOrder[groupRows.indexOf(groupRow)]);
            for (const rec of recs) {
                if (level === maxLevel) {
                    count++;
                }
                expect(rec[field]).toEqual(val);
            }
        }
    }

    public static checkChips(chips, grExpr, sortExpr) {
        for (let i = 0; i < chips.length; i++) {
            const chip = chips[i].querySelector('span.igx-chip__label>span').innerText;
            const chipDirection = chips[i].querySelector('span.igx-chip__label>igx-icon').innerText;
            const grp = grExpr[i];
            const s = sortExpr[i];
            expect(chip).toBe(grp.fieldName);
            expect(chip).toBe(s.fieldName);
            if (chipDirection === SORTING_ICON_ASC_CONTENT) {
                expect(grp.dir).toBe(SortingDirection.Asc);
                expect(s.dir).toBe(SortingDirection.Asc);
            } else {
                expect(grp.dir).toBe(SortingDirection.Desc);
                expect(s.dir).toBe(SortingDirection.Desc);
            }
        }
    }

    public static getChipText(chipElem) {
        return chipElem.nativeElement.querySelector('div.igx-chip__content').innerText.trim();
    }

    public static clickChip(debugElement) {
        UIInteractions.clickElement(debugElement.componentInstance.elementRef);
    }

    /* Search-related members */
    public static findNext(grid: IgxGridComponent, text: string) {
        const promise = new Promise((resolve) => {
            grid.verticalScrollContainer.onChunkLoad.subscribe((state) => {
                resolve(state);
            });

            grid.findNext(text);
        });

        return promise;
    }

    public static findPrev(grid: IgxGridComponent, text: string) {
        const promise = new Promise((resolve) => {
            grid.verticalScrollContainer.onChunkLoad.subscribe((state) => {
                resolve(state);
            });

            grid.findPrev(text);
        });

        return promise;
    }

    public static isInView(index, state): boolean {
        return index > state.startIndex && index <= state.startIndex + state.chunkSize;
    }

    /* Toolbar-related members */
    public static getToolbar(fixture) {
        return fixture.debugElement.query(By.css('igx-grid-toolbar'));
    }

    public static getOverlay(fixture) {
        const div = fixture.debugElement.nativeElement.parentElement.lastChild;
        return div.classList.contains('igx-overlay') ? div : null;
    }

    public static getColumnHidingButton(fixture) {
        const button = GridFunctions.getToolbar(fixture).queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnHiding');
        return button ? button.nativeElement : undefined;
    }

    public static getColumnPinningButton(fixture) {
        const button = GridFunctions.getToolbar(fixture).queryAll(By.css('button'))
                                    .find((b) => b.nativeElement.name === 'btnColumnPinning');
        return button ? button.nativeElement : undefined;
    }

    public static getExportButton(fixture) {
        const div = GridFunctions.getToolbar(fixture).query(By.css('.igx-grid-toolbar__dropdown#btnExport'));
        return (div) ? div.query(By.css('button')) : null;
    }

    public static getExportOptions(fixture) {
        const div = GridFunctions.getOverlay(fixture);
        return (div) ? div.querySelectorAll('li') : null;
    }

    public static getCheckboxElement(name: string, element: DebugElement, fix) {
        const checkboxElements = element.queryAll(By.css('igx-checkbox'));
        const chkElement = checkboxElements.find((el) =>
        (el.context as IgxCheckboxComponent).placeholderLabel.nativeElement.innerText === name);

        return chkElement;
    }

    public static getCheckboxInput(name: string, element: DebugElement, fix) {
        const checkboxEl = this.getCheckboxElement(name, element, fix);
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
        const chkInput = this.getCheckboxInput(name, element, fix);
        expect(chkInput.type).toBe('checkbox');
        expect(chkInput.disabled).toBe(isDisabled);
        expect(chkInput.checked).toBe(isChecked);
    }

    // Filtering
    public static removeFilterChipByIndex(index: number, filterUIRow) {
        const filterChip = filterUIRow.queryAll(By.css('igx-chip'))[index];
        const removeButton = filterChip.query(By.css('div.igx-chip__remove'));
        removeButton.nativeElement.click();
    }

    public static selectFilteringCondition(cond: string, ddList) {
        const ddItems = ddList.nativeElement.children;
        let i;
        for ( i = 0; i < ddItems.length; i++) {
            if (ddItems[i].textContent === cond) {
                ddItems[i].click();
                tick(100);
                return;
            }
        }
    }

    public static filterBy(condition: string, value: string, fix: ComponentFixture<any>) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        // open dropdown
        this.openFilterDD(fix.debugElement);
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        this.selectFilteringCondition(condition, ddList);

        const input = filterUIRow.query(By.directive(IgxInputDirective));
        input.nativeElement.value = value;
        input.nativeElement.dispatchEvent(new Event('keydown'));
        input.nativeElement.dispatchEvent(new Event('input'));
        input.nativeElement.dispatchEvent(new Event('keyup'));
        fix.detectChanges();

        // Enter key to submit
        this.simulateKeyboardEvent(input, 'keydown', 'Enter');
        fix.detectChanges();
    }

    public static typeValueInFilterRowInput(value: string, fix) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const input = filterUIRow.query(By.directive(IgxInputDirective));
        input.nativeElement.value = value;
        input.nativeElement.dispatchEvent(new Event('keydown'));
        input.nativeElement.dispatchEvent(new Event('input'));
        input.nativeElement.dispatchEvent(new Event('keyup'));
        fix.detectChanges();
    }

    public static submitFilterRowInput(fix) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const input = filterUIRow.query(By.directive(IgxInputDirective));
        this.simulateKeyboardEvent(input, 'keydown', 'Enter');
        fix.detectChanges();
    }

    public static resetFilterRow(fix: ComponentFixture<any> ) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const editingBtns = filterUIRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
        const reset = editingBtns.queryAll(By.css('button'))[0];
        reset.nativeElement.click();
        tick(100);
        fix.detectChanges();
    }

    public static closeFilterRow(fix: ComponentFixture<any>) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const editingBtns = filterUIRow.query(By.css('.igx-grid__filtering-row-editing-buttons'));
        const close = editingBtns.queryAll(By.css('button'))[1];
        close.nativeElement.click();
        fix.detectChanges();
    }

    public static openFilterDD(elem: DebugElement) {
        const filterUIRow = elem.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        filterIcon.nativeElement.click();
    }

    public static clickExcelFilterIcon(fix: ComponentFixture<any>, columnField: string) {
        const columnHeader = GridFunctions.getColumnHeader(columnField, fix);
        const filterIcon = columnHeader.query(By.css('.igx-excel-filter__icon'));
        const filterIconFiltered = columnHeader.query(By.css('.igx-excel-filter__icon--filtered'));
        const icon = (filterIcon) ? filterIcon : filterIconFiltered;
        UIInteractions.clickElement(icon);
    }

    public static clickApplyExcelStyleFiltering(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        const raisedButtons = Array.from(excelMenu.querySelectorAll('.igx-button--raised'));
        const applyButton: any = raisedButtons.find((rb: any) => rb.innerText === 'apply');
        applyButton.click();
    }

    public static clickCancelExcelStyleFiltering(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        const flatButtons = Array.from(excelMenu.querySelectorAll('.igx-button--flat'));
        const cancelButton: any = flatButtons.find((rb: any) => rb.innerText === 'cancel');
        cancelButton.click();
    }

    public static clickExcelFilterCascadeButton(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        const cascadeButton = excelMenu.querySelector('.igx-excel-filter__actions-filter');
        cascadeButton.click();
    }

    public static clickOperatorFromCascadeMenu(fix: ComponentFixture<any>, operatorIndex: number) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const subMenu = gridNativeElement.querySelector('.igx-drop-down__list');
        const dropdownItems = subMenu.querySelectorAll('igx-drop-down-item');
        const dropdownItem = dropdownItems[operatorIndex];
        dropdownItem.click();
    }

    public static clickApplyExcelStyleCustomFiltering(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const customFilterMenu = gridNativeElement.querySelector('.igx-excel-filter__secondary');
        const raisedButtons = Array.from(customFilterMenu.querySelectorAll('.igx-button--raised'));
        const applyButton: any = raisedButtons.find((rb: any) => rb.innerText === 'apply');
        applyButton.click();
    }

    public static clickCancelExcelStyleCustomFiltering(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const customFilterMenu = gridNativeElement.querySelector('.igx-excel-filter__secondary');
        const flatButtons = Array.from(customFilterMenu.querySelectorAll('.igx-button--flat'));
        const cancelButton: any = flatButtons.find((rb: any) => rb.innerText === 'cancel');
        cancelButton.click();
    }

    public static clickAddFilterExcelStyleCustomFiltering(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const customFilterMenu = gridNativeElement.querySelector('.igx-excel-filter__secondary');
        const addFilterButton = customFilterMenu.querySelector('.igx-excel-filter__add-filter');
        addFilterButton.click();
    }

    /**
     * Click the pin/unpin icon in the ESF by specifying whether the icon is in the header
     * or at its default position (depending on the display density).
    */
    public static clickPinIconInExcelStyleFiltering(fix: ComponentFixture<any>, isIconInHeader: boolean = true) {
        let pinUnpinIcon: any;
        if (isIconInHeader) {
            const headerIcons = GridFunctions.getExcelFilteringHeaderIcons(fix);
            const headerAreaPinIcon = headerIcons.find((buttonIcon: any) => buttonIcon.innerHTML.indexOf('name="pin"') !== -1);
            const headerAreaUnpinIcon = headerIcons.find((buttonIcon: any) => buttonIcon.innerHTML.indexOf('name="unpin"') !== -1);
            pinUnpinIcon = headerAreaPinIcon ? headerAreaPinIcon : headerAreaUnpinIcon;
        } else {
            const pinContainer = GridFunctions.getExcelFilteringPinContainer(fix);
            const unpinContainer = GridFunctions.getExcelFilteringUnpinContainer(fix);
            pinUnpinIcon = pinContainer ? pinContainer : unpinContainer;
        }
        pinUnpinIcon.click();
    }

    /**
     * Click the hide icon in the ESF by specifying whether the icon is in the header
     * or at its default position (depending on the display density).
    */
    public static clickHideIconInExcelStyleFiltering(fix: ComponentFixture<any>, isIconInHeader: boolean = true) {
        let hideIcon: any;
        if (isIconInHeader) {
            const headerIcons = GridFunctions.getExcelFilteringHeaderIcons(fix);
            hideIcon = headerIcons.find((buttonIcon: any) => buttonIcon.innerText === 'visibility_off');
        } else {
            hideIcon = GridFunctions.getExcelFilteringHideContainer(fix);
        }
        hideIcon.click();
    }

    public static getIconFromButton(iconName: string, component: any, fix: ComponentFixture<any>) {
        const icons = component.querySelectorAll('igx-icon');
        return Array.from(icons).find((sortIcon: any) => sortIcon.innerText === iconName);
    }

    /**
    * Click the sort ascending button in the ESF.
    */
    public static clickSortAscInExcelStyleFiltering(fix: ComponentFixture<any>) {
        const sortAscIcon: any = this.getIconFromButton('arrow_upwards', GridFunctions.getExcelFilteringSortComponent(fix), fix);
        sortAscIcon.click();
    }

    /**
     * Click the sort descending button in the ESF.
    */
    public static clickSortDescInExcelStyleFiltering(fix: ComponentFixture<any>) {
        const sortDescIcon: any = this.getIconFromButton('arrow_downwards', GridFunctions.getExcelFilteringSortComponent(fix), fix);
        sortDescIcon.click();
    }

    /**
     * Click the move left button in the ESF.
    */
    public static clickMoveLeftInExcelStyleFiltering(fix: ComponentFixture<any>) {
        const moveLeftIcon: any = this.getIconFromButton('arrow_back', GridFunctions.getExcelFilteringMoveComponent(fix), fix);
        moveLeftIcon.click();
    }

    /**
     * Click the move right button in the ESF.
    */
    public static clickMoveRightInExcelStyleFiltering(fix: ComponentFixture<any>) {
        const moveRightIcon: any = this.getIconFromButton('arrow_forwards', GridFunctions.getExcelFilteringMoveComponent(fix), fix);
        moveRightIcon.click();
    }

    /**
     * Click the clear filter button in the ESF.
    */
    public static clickClearFilterInExcelStyleFiltering(fix: ComponentFixture<any>) {
        const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
        const clearFilterContainer = excelMenu.querySelector('.igx-excel-filter__actions-clear');
        const clearFilterDisabledContainer = excelMenu.querySelector('.igx-excel-filter__actions-clear--disabled');
        const clearIcon = clearFilterContainer ? clearFilterContainer : clearFilterDisabledContainer;
        clearIcon.click();
    }

    /**
     * Click the filter chip for the provided column in order to open the filter row for it.
    */
    public static clickFilterCellChip(fix: ComponentFixture<any>, columnField: string) {
        const headerGroups = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
        const headerGroup = headerGroups.find((hg) => hg.componentInstance.column.field === columnField);
        const filterCell = headerGroup.query(By.css('igx-grid-filtering-cell'));
        const chip = filterCell.query(By.css('igx-chip'));

        chip.nativeElement.click();
        fix.detectChanges();
    }

    /**
     * Presuming filter row is opened, click the filter condition chip based on ascending index (left to right).
    */
    public static clickFilterConditionChip(fix: ComponentFixture<any>, index: number) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const conditionChips = GridFunctions.sortNativeElementsHorizontally(
            filterUIRow.queryAll(By.directive(IgxChipComponent)).map((ch) => ch.nativeElement));
        conditionChips[index].click();
    }

    /**
     * Presuming filter row is opened, click the inter-chip operator based on its index.
    */
    public static clickChipOperator(fix: ComponentFixture<any>, index: number) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const allIcons = filterUIRow.queryAll(By.css('igx-icon')).map((icon) => icon.nativeElement);
        const operatorIcons = GridFunctions.sortNativeElementsHorizontally(
            allIcons.filter((icon) => icon.innerText === 'expand_more'));
        const operatorIcon = operatorIcons[index];
        operatorIcon.click();
    }

    /**
     * Presuming chip operator dropdown is opened, set the inter-chip operator value. (should be 'And' or 'Or')
    */
    public static clickChipOperatorValue(fix: ComponentFixture<any>, operatorValue: string) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const operators = GridFunctions.sortNativeElementsVertically(
            Array.from(gridNativeElement.querySelectorAll('.igx-drop-down__item')));
        const operator = operators.find((op) => op.innerText.toLowerCase() === operatorValue.toLowerCase());
        operator.click();
        fix.detectChanges();
    }

    public static simulateKeyboardEvent(element, eventName, inputKey) {
        element.nativeElement.dispatchEvent(new KeyboardEvent(eventName, { key: inputKey }));
    }

    public static getExcelStyleFilteringComponent(fix) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        return excelMenu;
    }

    public static getExcelStyleSearchComponent(fix) {
        const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fix);
        const searchComponent = excelMenu.querySelector('.igx-excel-filter__menu-main');
        return searchComponent;
    }

    public static getExcelStyleSearchComponentScrollbar(fix) {
        const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
        const scrollbar = searchComponent.querySelector('igx-virtual-helper');
        return scrollbar;
    }

    public static getColumnHeader(columnField: string, fix: ComponentFixture<any>) {
        return fix.debugElement.queryAll(By.directive(IgxGridHeaderComponent)).find((header) => {
            return header.componentInstance.column.field === columnField;
        });
    }

    public static getColumnHeaderByIndex(fix: ComponentFixture<any>, index: number) {
        const nativeHeaders = fix.debugElement.queryAll(By.directive(IgxGridHeaderComponent))
                                .map((header) => header.nativeElement);
        const sortedNativeHeaders = GridFunctions.sortNativeElementsHorizontally(nativeHeaders);
        return sortedNativeHeaders[index].querySelector('.igx-grid__th-title');
    }

    public static getFilterChipsForColumn(columnField: string, fix: ComponentFixture<any>) {
        const columnHeader = this.getColumnHeader(columnField, fix);
        return columnHeader.parent.queryAll(By.directive(IgxChipComponent));
    }

    public static getFilterOperandsForColumn(columnField: string, fix: ComponentFixture<any>) {
        const columnHeader = this.getColumnHeader(columnField, fix);
        return columnHeader.parent.queryAll(By.css('.' + FILTER_UI_CONNECTOR));
    }

    public static getFilterIndicatorForColumn(columnField: string, fix: ComponentFixture<any>) {
        const columnHeader = this.getColumnHeader(columnField, fix);
        return columnHeader.parent.queryAll(By.css('.' + FILTER_UI_INDICATOR));
    }

    public static getExcelFilteringHeaderIcons(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        const headerArea = excelMenu.querySelector('.igx-excel-filter__menu-header');
        return Array.from(headerArea.querySelectorAll('.igx-button--icon'));
    }

    public static getExcelFilteringPinContainer(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        const pinContainer = excelMenu.querySelector('.igx-excel-filter__actions-pin');
        const pinContainerDisabled = excelMenu.querySelector('.igx-excel-filter__actions-pin--disabled');
        return pinContainer ? pinContainer : pinContainerDisabled;
    }

    public static getExcelFilteringUnpinContainer(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        return excelMenu.querySelector('.igx-excel-filter__actions-unpin');
    }

    public static getExcelFilteringHideContainer(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        return excelMenu.querySelector('.igx-excel-filter__actions-hide');
    }

    public static getExcelFilteringSortComponent(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        return excelMenu.querySelector('igx-excel-style-sorting');
    }

    public static getExcelFilteringMoveComponent(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const excelMenu = gridNativeElement.querySelector('.igx-excel-filter__menu');
        return excelMenu.querySelector('igx-excel-style-column-moving');
    }

    public static getExcelFilteringLoadingIndicator(fix: ComponentFixture<any>) {
        const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
        const loadingIndicator = searchComponent.querySelector('.igx-excel-filter__loading');
        return loadingIndicator;
    }

    public static getColumnCells(fix, columnKey) {
        const allCells = fix.debugElement.queryAll(By.css('igx-grid-cell'));
        return allCells.filter((cell) => cell.componentInstance.column.field === columnKey);
    }

    public static getFilterRowLeftArrowButton(fix) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        return filterUIRow.query(By.css('.igx-grid__filtering-row-scroll-start'));
    }

    public static getFilterRowRightArrowButton(fix) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        return filterUIRow.query(By.css('.igx-grid__filtering-row-scroll-end'));
    }

    public static getFilterCell(fix, columnKey) {
        const headerGroups = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
        const headerGroup = headerGroups.find((hg) => hg.componentInstance.column.field === columnKey);
        return headerGroup.query(By.css('igx-grid-filtering-cell'));
    }

    public static getFilterConditionChip(fix, index) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const conditionChips = GridFunctions.sortNativeElementsHorizontally(
            filterUIRow.queryAll(By.directive(IgxChipComponent)).map((ch) => ch.nativeElement));
        return conditionChips[index];
    }

    public static getFilterRowInputCommitIcon(fix) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const inputGroup = filterUIRow.query(By.css('igx-input-group'));
        const suffix = inputGroup.query(By.css('igx-suffix'));
        const commitIcon: any = Array.from(suffix.queryAll(By.css('igx-icon')))
                                .find((icon: any) => icon.nativeElement.innerText === 'done');
        return commitIcon;
    }

    public static getFilterRowInputClearIcon(fix) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const inputGroup = filterUIRow.query(By.css('igx-input-group'));
        const suffix = inputGroup.query(By.css('igx-suffix'));
        const clearIcon: any = Array.from(suffix.queryAll(By.css('igx-icon')))
                                .find((icon: any) => icon.nativeElement.innerText === 'clear');
        return clearIcon;
    }

    public static getGridDataRows(fix) {
        const grid = fix.debugElement.query(By.css('igx-grid'));
        const gridBody = grid.query(By.css('.igx-grid__tbody'));
        return GridFunctions.sortNativeElementsVertically(
            Array.from(gridBody.queryAll(By.css('igx-grid-row'))).map((r: any) => r.nativeElement));
    }

    public static getExcelStyleCustomFilteringDialog(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        return gridNativeElement.querySelector('.igx-excel-filter__secondary');
    }

    public static getExcelCustomFilteringDefaultExpressions(fix: ComponentFixture<any>) {
        const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);
        return GridFunctions.sortNativeElementsVertically(
            Array.from(customFilterMenu.querySelectorAll('igx-excel-style-default-expression')));
    }

    public static getExcelCustomFilteringDateExpressions(fix: ComponentFixture<any>) {
        const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);
        return GridFunctions.sortNativeElementsVertically(
            Array.from(customFilterMenu.querySelectorAll('igx-excel-style-date-expression')));
    }

    public static setInputValueESF(customMenu, expressionIndex: number, value: any, fix: ComponentFixture<any>) {
        const input =
            customMenu.children[1].children[expressionIndex].children[2].querySelector('.igx-input-group__bundle-main').children[0];
        input.value = value;
        input.dispatchEvent(new Event('keydown'));
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('keyup'));
        fix.detectChanges();
    }

    public static setOperatorESF(customMenu, grid, expressionIndex: number, itemIndex: number, fix: ComponentFixture<any>) {
        const input =
            customMenu.children[1].children[expressionIndex].children[1].querySelector('.igx-input-group__bundle-main').children[0];
        input.click();
        fix.detectChanges();

        const operators = grid.nativeElement.querySelectorAll('.igx-drop-down__list')[expressionIndex + 1];
        const operator = operators.children[itemIndex].children[0];

        operator.click();
        tick();
        fix.detectChanges();
    }

    public static sortNativeElementsVertically(arr) {
        return arr.sort((a, b) =>
            (<HTMLElement>a).getBoundingClientRect().top - (<HTMLElement>b).getBoundingClientRect().top);
    }

    public static sortNativeElementsHorizontally(arr) {
        return arr.sort((a, b) =>
            (<HTMLElement>a).getBoundingClientRect().left - (<HTMLElement>b).getBoundingClientRect().left);
    }

    public static getRowEditingBannerRow(fix): HTMLElement {
        return fix.nativeElement.querySelector(BANNER_ROW_CLASS);
    }

    public static getRowEditingBanner(fix): HTMLElement {
        return fix.nativeElement.querySelector(BANNER_CLASS);
    }

    public static getRowEditingOverlay(fix): HTMLElement {
        return fix.nativeElement.querySelector(EDIT_OVERLAY_CONTENT);
    }

    public static getRowEditingBannerText(fix) {
        return fix.nativeElement.querySelector(BANNER_TEXT_CLASS).textContent.trim();
    }

    public static getRowEditingDoneButton(fix): HTMLElement {
        return GridFunctions.getRowEditingBannerRow(fix).lastElementChild as HTMLElement;
    }

    public static getRowEditingCancelButton(fix): HTMLElement {
        return GridFunctions.getRowEditingBannerRow(fix).firstElementChild as HTMLElement;
    }

    public static getPagingButtons(parent) {
        return parent.querySelectorAll(PAGER_BUTTONS);
    }

    public static clickPagingButton(parent, buttonIndex: number) {
        const pagingButtons = GridFunctions.getPagingButtons(parent);
        pagingButtons[buttonIndex].dispatchEvent(new Event('click'));
    }

    public static navigateToFirstPage(parent) {
        GridFunctions.clickPagingButton(parent, 0);
    }

    public static navigateToPrevPage(parent) {
        GridFunctions.clickPagingButton(parent, 1);
    }

    public static navigateToNextPage(parent) {
        GridFunctions.clickPagingButton(parent, 2);
    }

    public static navigateToLastPage(parent) {
        GridFunctions.clickPagingButton(parent, 3);
    }
}
