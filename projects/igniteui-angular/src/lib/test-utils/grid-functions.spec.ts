
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { ComponentFixture, tick } from '@angular/core/testing';
import { IgxInputDirective } from '../input-group';
import { IgxGridHeaderComponent } from '../grids/grid-header.component';
import { IgxChipComponent } from '../chips';
import { IgxGridComponent } from '../grids/grid/grid.component';
import { IgxColumnGroupComponent } from '../grids/column.component';
import { IgxGridHeaderGroupComponent } from '../grids/grid-header-group.component';
import { SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { UIInteractions, wait } from './ui-interactions.spec';
import { IgxGridGroupByRowComponent, IgxGridCellComponent } from '../grids/grid';

const SUMMARY_LABEL_CLASS = '.igx-grid-summary__label';
const CELL_ACTIVE_CSS_CLASS = 'igx-grid-summary--active';
const SORTING_ICON_ASC_CONTENT = 'arrow_upward';
const FILTER_UI_ROW = 'igx-grid-filtering-row';
const FILTER_UI_CONNECTOR = 'igx-filtering-chips__connector';
const FILTER_UI_INDICATOR = 'igx-grid__filtering-cell-indicator';
const BANNER_CLASS = '.igx-banner';
const BANNER_TEXT_CLASS = '.igx-banner__text';
const BANNER_ROW_CLASS = '.igx-banner__row';
const EDIT_OVERLAY_CONTENT = '.igx-overlay__content';
const PAGER_BUTTONS = '.igx-grid-paginator__pager > button';
const ACTIVE_GROUP_ROW_CLASS = 'igx-grid__group-row--active';
const CELL_SELECTED_CSS_CLASS = 'igx-grid__td--selected';
const ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS = '.igx-grid__cbx-selection';
const ROW_SELECTION_CSS_CLASS = 'igx-grid__tr--selected';
const HEADER_ROW_CSS_CLASS = '.igx-grid__thead';
const CHECKBOX_INPUT_CSS_CLASS = '.igx-checkbox__input';
const SCROLL_START_CSS_CLASS = '.igx-grid__scroll-start';
const CHECKBOX_ELEMENT = 'igx-checkbox';
const ICON_CSS_CLASS = 'material-icons igx-icon';
const CHECKBOX_LBL_CSS_CLASS = '.igx-checkbox__composite';
const DEBOUNCETIME = 50;

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

    public static scrollTop(grid: IgxGridComponent, newTop: number) {
        const vScrollbar = grid.verticalScrollContainer.getVerticalScroll();
        vScrollbar.scrollTop = newTop;
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
            const nextIndex = dir === 'ArrowUp' ? rowStartIndex - 1 : rowStartIndex + 1;
            let elem;
            if (row) {
                elem = row instanceof IgxGridGroupByRowComponent ?
                    row : grid.getCellByColumn(row.index, colKey);
            } else {
                const summariRow = grid.summariesRowList.find(s => s.index === rowStartIndex);
                if (summariRow) {
                    elem = summariRow.summaryCells.find(cell => cell.visibleColumnIndex === cIndx);
                }
            }

            if (rowStartIndex === rowEndIndex) {
                resolve();
                return;
            }

            UIInteractions.triggerKeyDownWithBlur(dir, elem.nativeElement, true, false, shift);
            await wait(40);

            GridFunctions.navigateVerticallyToIndex(grid, nextIndex, rowEndIndex, colIndex, shift)
                .then(() => { resolve(); });
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
            UIInteractions.triggerKeyDownWithBlur(dir, cell.nativeElement, true, false, shift);

            grid.cdr.detectChanges();
            // if next row exists navigate next
            if (nextCell) {
                await wait(10);
                grid.cdr.detectChanges();
                GridFunctions.navigateHorizontallyToIndex(grid, nextCell, index, shift).then(() => { resolve(); });
            } else {
                // else wait for chunk to load.
                grid.parentVirtDir.onChunkLoad.pipe(take(1)).subscribe({
                    next: () => {
                        grid.cdr.detectChanges();
                        nextCell = nextCol ? grid.getCellByColumn(cell.rowIndex, nextCol.field) : null;
                        GridFunctions.navigateHorizontallyToIndex(grid, nextCell, index, shift).then(() => { resolve(); });
                    }
                });
            }
        })

    public static expandCollapceGroupRow =
        (fix, groupRow: IgxGridGroupByRowComponent,
            cell: IgxGridCellComponent) => new Promise(async (resolve, reject) => {
                expect(groupRow.focused).toBe(true);
                expect(groupRow.nativeElement.classList.contains(ACTIVE_GROUP_ROW_CLASS)).toBe(true);
                if (cell != null) {
                    expect(cell.selected).toBe(true);
                }
                UIInteractions.triggerKeyDownEvtUponElem('arrowleft', groupRow.nativeElement, true, true);
                await wait(300);
                fix.detectChanges();

                expect(groupRow.expanded).toBe(false);
                expect(groupRow.focused).toBe(true);
                expect(groupRow.nativeElement.classList.contains(ACTIVE_GROUP_ROW_CLASS)).toBe(true);
                if (cell != null) {
                    expect(cell.selected).toBe(true);
                }
                UIInteractions.triggerKeyDownEvtUponElem('arrowright', groupRow.nativeElement, true, true);
                await wait(100);
                fix.detectChanges();

                expect(groupRow.expanded).toBe(true);
                expect(groupRow.focused).toBe(true);
                expect(groupRow.nativeElement.classList.contains(ACTIVE_GROUP_ROW_CLASS)).toBe(true);
                if (cell != null) {
                    expect(cell.selected).toBe(true);
                }
                resolve();
            })

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

    public static verifyColumnIsPinned(column, isPinned: boolean, pinnedColumnsCount: number) {
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

    public static getAdvancedFilteringButton(fix: ComponentFixture<any>) {
        const button = GridFunctions.getToolbar(fix).queryAll(By.css('button'))
        .find((b) => b.nativeElement.name === 'btnAdvancedFiltering');
        return button ? button.nativeElement : undefined;
    }

    public static getColumnHidingButton(fixture) {
        const button = GridFunctions.getToolbar(fixture).queryAll(By.css('button'))
        .find((b) => b.nativeElement.name === 'btnColumnHiding');
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
        for (i = 0; i < ddItems.length; i++) {
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

    public static resetFilterRow(fix: ComponentFixture<any>) {
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

    public static clickAdvancedFilteringButton(fix: ComponentFixture<any>) {
        const advFilterButton = GridFunctions.getAdvancedFilteringButton(fix);
        advFilterButton.click();
    }

    public static clickAdvancedFilteringClearFilterButton(fix: ComponentFixture<any>) {
        const clearFilterButton = GridFunctions.getAdvancedFilteringClearFilterButton(fix);
        clearFilterButton.click();
    }

    public static clickAdvancedFilteringCancelButton(fix: ComponentFixture<any>) {
        const cancelButton = GridFunctions.getAdvancedFilteringCancelButton(fix);
        cancelButton.click();
    }

    public static clickAdvancedFilteringApplyButton(fix: ComponentFixture<any>) {
        const applyButton = GridFunctions.getAdvancedFilteringApplyButton(fix);
        applyButton.click();
    }

    /**
    * (Double)Click the underlying chip of the expression that is located on the provided 'path'.
    */
    public static clickAdvancedFilteringTreeExpressionChip(fix: ComponentFixture<any>, path: number[], dblClick: boolean = false) {
        const chip = GridFunctions.getAdvancedFilteringTreeExpressionChip(fix, path);
        if (dblClick) {
            chip.dispatchEvent(new MouseEvent('dblclick'));
        } else {
            chip.click();
        }
    }

    /**
    * Click the remove icon of the expression that is located on the provided 'path'.
    */
    public static clickAdvancedFilteringTreeExpressionChipRemoveIcon(fix: ComponentFixture<any>, path: number[]) {
        const chip = GridFunctions.getAdvancedFilteringTreeExpressionChip(fix, path);
        const removeIcon = chip.querySelector('.igx-chip__remove');
        removeIcon.click();
    }

    /**
    * Click the edit icon of the expression that is located on the provided 'path'.
    */
    public static clickAdvancedFilteringTreeExpressionChipEditIcon(fix: ComponentFixture<any>, path: number[]) {
        const chipEditIcon = GridFunctions.getAdvancedFilteringTreeExpressionEditIcon(fix, path);
        chipEditIcon.click();
    }

    /**
    * Click the add icon of the expression that is located on the provided 'path'.
    */
    public static clickAdvancedFilteringTreeExpressionChipAddIcon(fix: ComponentFixture<any>, path: number[]) {
        const chipAddIcon = GridFunctions.getAdvancedFilteringTreeExpressionAddIcon(fix, path);
        chipAddIcon.click();
    }

    /**
    * Click the operator line of the group that is located on the provided 'path'.
    */
    public static clickAdvancedFilteringTreeGroupOperatorLine(fix: ComponentFixture<any>, path: number[]) {
        const operatorLine = GridFunctions.getAdvancedFilteringTreeGroupOperatorLine(fix, path);
        operatorLine.click();
    }

    /**
    * Click the column select for the expression that is currently in edit mode.
    */
    public static clickAdvancedFilteringColumnSelect(fix: ComponentFixture<any>) {
        const columnSelect = GridFunctions.getAdvancedFilteringColumnSelect(fix);
        const inputGroup = columnSelect.querySelector('igx-input-group');
        inputGroup.click();
    }

    /**
    * Click the operator select for the expression that is currently in edit mode.
    */
    public static clickAdvancedFilteringOperatorSelect(fix: ComponentFixture<any>) {
        const operatorSelect = GridFunctions.getAdvancedFilteringOperatorSelect(fix);
        const inputGroup = operatorSelect.querySelector('igx-input-group');
        inputGroup.click();
    }

    /**
    * Click the value input for the expression that is currently in edit mode.
    * (NOTE: The value input could be either an input group or a date picker.)
    */
    public static clickAdvancedFilteringValueInput(fix: ComponentFixture<any>, dateType: boolean = false) {
        // Could be either an input group or a date picker.
        const valueInput = GridFunctions.getAdvancedFilteringValueInput(fix, dateType);
        valueInput.click();
    }

    /**
    * Click the the select dropdown's element that is positioned at the specified 'index'.
    * (NOTE: This method presumes that the select dropdown is already opened.)
    */
    public static clickAdvancedFilteringSelectDropdownItem(fix: ComponentFixture<any>, index: number) {
        const selectDropdownItems = GridFunctions.sortNativeElementsVertically(
            Array.from(GridFunctions.getAdvancedFilteringSelectDropdownItems(fix)));
        const item = selectDropdownItems[index];
        item.click();
    }

    /**
    * Click the commit button of the expression that is currently in edit mode.
    */
    public static clickAdvancedFilteringExpressionCommitButton(fix: ComponentFixture<any>) {
        const commitButton = GridFunctions.getAdvancedFilteringExpressionCommitButton(fix);
        commitButton.click();
    }

    /**
    * Click the close button of the expression that is currently in edit mode.
    */
    public static clickAdvancedFilteringExpressionCloseButton(fix: ComponentFixture<any>) {
        const closeButton = GridFunctions.getAdvancedFilteringExpressionCloseButton(fix);
        closeButton.click();
    }

    public static clickAdvancedFilteringContextMenuCloseButton(fix: ComponentFixture<any>) {
        const contextMenuCloseButton = GridFunctions.getAdvancedFilteringContextMenuCloseButton(fix);
        contextMenuCloseButton.click();
    }

    public static getAdvancedFilteringComponent(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const advFilterDialog = gridNativeElement.querySelector('.igx-advanced-filter');
        return advFilterDialog;
    }

    public static getAdvancedFilteringEmptyPrompt(fix: ComponentFixture<any>) {
        const advFilterDialog = GridFunctions.getAdvancedFilteringComponent(fix);
        const emptyPrompt = advFilterDialog.querySelector('.igx-filter-empty');
        return emptyPrompt;
    }

    public static getAdvancedFilteringHeader(fix: ComponentFixture<any>) {
        const advFilterDialog = GridFunctions.getAdvancedFilteringComponent(fix);
        const header = advFilterDialog.querySelector('.igx-advanced-filter__header');
        return header;
    }

    public static getAdvancedFilteringHeaderText(fix: ComponentFixture<any>) {
        const header = GridFunctions.getAdvancedFilteringHeader(fix);
        const title = header.querySelector('h4');
        return title.innerText;
    }

    public static getAdvancedFilteringHeaderLegendItemAnd(fix: ComponentFixture<any>) {
        const header = GridFunctions.getAdvancedFilteringHeader(fix);
        const andLegendItem = header.querySelector('.igx-filter-legend__item--and');
        return andLegendItem;
    }

    public static getAdvancedFilteringHeaderLegendItemOr(fix: ComponentFixture<any>) {
        const header = GridFunctions.getAdvancedFilteringHeader(fix);
        const orLegendItem = header.querySelector('.igx-filter-legend__item--or');
        return orLegendItem;
    }

    public static getAdvancedFilteringAllGroups(fix: ComponentFixture<any>): any[] {
        const advFilterDialog = GridFunctions.getAdvancedFilteringComponent(fix);
        const allGroups = Array.from(GridFunctions.getAdvancedFilteringTreeChildGroups(advFilterDialog, false));
        return allGroups;
    }

    /**
    * Get the expressions container that contains all groups and expressions.
    */
    public static getAdvancedFilteringExpressionsContainer(fix: ComponentFixture<any>) {
        const advFilterDialog = GridFunctions.getAdvancedFilteringComponent(fix);
        const exprContainer = advFilterDialog.querySelector('.igx-advanced-filter__main');
        return exprContainer;
    }

    /**
    * Get the root group.
    */
    public static getAdvancedFilteringTreeRootGroup(fix: ComponentFixture<any>) {
        const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
        const rootGroup = exprContainer.querySelector(':scope > .igx-filter-tree');
        return rootGroup;
    }

    /**
    * Get all child groups of the given 'group' by specifying whether to include its direct child groups only
    * or all of its child groups in the hierarchy. (NOTE: Expressions do not have children!)
    */
    public static getAdvancedFilteringTreeChildGroups(group: HTMLElement, directChildrenOnly: boolean = true) {
        const pattern = directChildrenOnly ? ':scope > .igx-filter-tree' : '.igx-filter-tree';
        const childrenContainer = group.querySelector('.igx-filter-tree__expression');
        const childGroups = GridFunctions.sortNativeElementsVertically(Array.from(childrenContainer.querySelectorAll(pattern)));
        return childGroups;
    }

    /**
    * Get all child expressions of the given 'group' by specifying whether to include its direct child expressions only
    * or all of its child expressions in the hierarchy.
    */
    public static getAdvancedFilteringTreeChildExpressions(group: HTMLElement, directChildrenOnly: boolean = true) {
        const pattern = directChildrenOnly ? ':scope > .igx-filter-tree__expression-item' : '.igx-filter-tree__expression-item';
        const childrenContainer = group.querySelector('.igx-filter-tree__expression');
        const childExpressions = GridFunctions.sortNativeElementsVertically(Array.from(childrenContainer.querySelectorAll(pattern)));
        return childExpressions;
    }

    /**
    * Get all child groups and expressions of the given 'group' by specifying whether to include its
    * direct child groups and expressions only or all of its child groups and expressions in the hierarchy.
    */
    public static getAdvancedFilteringTreeChildItems(group: HTMLElement, directChildrenOnly: boolean = true) {
        const childGroups = Array.from(GridFunctions.getAdvancedFilteringTreeChildGroups(group, directChildrenOnly));
        const childExpressions = Array.from(GridFunctions.getAdvancedFilteringTreeChildExpressions(group, directChildrenOnly));
        return GridFunctions.sortNativeElementsVertically(childGroups.concat(childExpressions));
    }

    /**
    * Get a specific item from the tree (could be a group or an expression)
    * by specifying its hierarchical path (not including the root group).
    * (Example: [2 ,1] will first get the third item of the root group,
    *  and then it will get the second item of the root group's third item.)
    * (NOTE: Only the items that are groups have children.)
    * The returned element is the one that has been gotten last.
    */
    public static getAdvancedFilteringTreeItem(fix: ComponentFixture<any>,
                                               path: number[]) {
        let node = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
        for (let index = 0; index < path.length; index++) {
            const pos = path[index];
            const directChildren = GridFunctions.getAdvancedFilteringTreeChildItems(node, true);
            node = directChildren[pos];
        }
        return node;
    }

    /**
    * Get the operator line of the root group.
    */
    public static getAdvancedFilteringTreeRootGroupOperatorLine(fix: ComponentFixture<any>) {
        const rootGroup = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
        const directOperatorLine = rootGroup.querySelector(':scope > .igx-filter-tree__line');
        return directOperatorLine;
    }

    /**
    * Get the operator line of the group that is located on the provided 'path'.
    */
    public static getAdvancedFilteringTreeGroupOperatorLine(fix: ComponentFixture<any>, path: number[]) {
        const group = GridFunctions.getAdvancedFilteringTreeItem(fix, path);
        const directOperatorLine = group.querySelector(':scope > .igx-filter-tree__line');
        return directOperatorLine;
    }

    /**
    * Get the underlying chip of the expression that is located on the provided 'path'.
    */
    public static getAdvancedFilteringTreeExpressionChip(fix: ComponentFixture<any>, path: number[]) {
        const treeItem = GridFunctions.getAdvancedFilteringTreeItem(fix, path);
        const chip = treeItem.querySelector('igx-chip');
        return chip;
    }

    /**
    * Get the action icons ('edit' and 'add') of the expression that is located on the provided 'path'.
    */
    public static getAdvancedFilteringTreeExpressionActionsContainer(fix: ComponentFixture<any>, path: number[]) {
        const treeItem = GridFunctions.getAdvancedFilteringTreeItem(fix, path);
        const actionsContainer = treeItem.querySelector('.igx-filter-tree__expression-actions');
        return actionsContainer;
    }

    /**
    * Get the edit icon of the expression that is located on the provided 'path'.
    */
    public static getAdvancedFilteringTreeExpressionEditIcon(fix: ComponentFixture<any>, path: number[]) {
        const actionsContainer = GridFunctions.getAdvancedFilteringTreeExpressionActionsContainer(fix, path);
        const icons = Array.from(actionsContainer.querySelectorAll('igx-icon'));
        const editIcon: any = icons.find((icon: any) => icon.innerText === 'edit');
        return editIcon;
    }

    /**
    * Get the add icon of the expression that is located on the provided 'path'.
    */
    public static getAdvancedFilteringTreeExpressionAddIcon(fix: ComponentFixture<any>, path: number[]) {
        const actionsContainer = GridFunctions.getAdvancedFilteringTreeExpressionActionsContainer(fix, path);
        const icons = Array.from(actionsContainer.querySelectorAll('igx-icon'));
        const addIcon: any = icons.find((icon: any) => icon.innerText === 'add');
        return addIcon;
    }

    /**
    * Get the adding buttons and the cancel button of a group by specifying the
    * path of the group and the index position of the buttons container.
    * (NOTE: The buttons are returned in an array and are sorted in ascending order based on 'X' value.)
    */
    public static getAdvancedFilteringTreeGroupButtons(fix: ComponentFixture<any>, path: number[], buttonsIndex: number) {
        const group = GridFunctions.getAdvancedFilteringTreeItem(fix, path);
        const childrenContainer = group.querySelector('.igx-filter-tree__expression');
        const buttonsContainers = GridFunctions.sortNativeElementsVertically(
            Array.from(childrenContainer.querySelectorAll(':scope > .igx-filter-tree__buttons')));
        const buttonsContainer: any = buttonsContainers[buttonsIndex];
        const buttons = GridFunctions.sortNativeElementsHorizontally(Array.from(buttonsContainer.querySelectorAll('button')));
        return buttons;
    }

    /**
    * Get the adding buttons and the cancel button of the root group by specifying the
    * index position of the buttons container.
    * (NOTE: The buttons are returned in an array and are sorted in ascending order based on 'X' value.)
    */
    public static getAdvancedFilteringTreeRootGroupButtons(fix: ComponentFixture<any>, buttonsIndex: number) {
        const group = GridFunctions.getAdvancedFilteringTreeRootGroup(fix);
        const childrenContainer = group.querySelector('.igx-filter-tree__expression');
        const buttonsContainers = GridFunctions.sortNativeElementsVertically(
            Array.from(childrenContainer.querySelectorAll(':scope > .igx-filter-tree__buttons')));
        const buttonsContainer: any = buttonsContainers[buttonsIndex];
        const buttons = GridFunctions.sortNativeElementsHorizontally(Array.from(buttonsContainer.querySelectorAll('button')));
        return buttons;
    }

    /**
    * Get the initial group adding buttons when the dialog does not contain any filters.
    */
    public static getAdvancedFilteringInitialAddGroupButtons(fix: ComponentFixture<any>) {
        const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
        const initialButtons = GridFunctions.sortNativeElementsHorizontally(
            Array.from(exprContainer.querySelectorAll(':scope > button')));
        return initialButtons;
    }

    public static getAdvancedFilteringContextMenu(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const contextMenu = gridNativeElement.querySelector('.igx-filter-contextual-menu');
        return contextMenu;
    }

    public static getAdvancedFilteringContextMenuButtons(fix: ComponentFixture<any>) {
        const contextMenu = GridFunctions.getAdvancedFilteringContextMenu(fix);
        const buttons = GridFunctions.sortNativeElementsVertically(Array.from(contextMenu.querySelectorAll('button')));
        return buttons;
    }

    public static getAdvancedFilteringContextMenuCloseButton(fix: ComponentFixture<any>) {
        const contextMenu = GridFunctions.getAdvancedFilteringContextMenu(fix);
        const buttons = GridFunctions.sortNativeElementsVertically(Array.from(contextMenu.querySelectorAll('button')));
        const closeButton: any = buttons.find((b: any) => b.innerText.toLowerCase() === 'close');
        return closeButton;
    }

    public static getAdvancedFilteringContextMenuButtonGroup(fix: ComponentFixture<any>) {
        const contextMenu = GridFunctions.getAdvancedFilteringContextMenu(fix);
        const buttonGroup = contextMenu.querySelector('igx-buttongroup');
        return buttonGroup;
    }

    public static getAdvancedFilteringFooter(fix: ComponentFixture<any>) {
        const advFilterDialog = GridFunctions.getAdvancedFilteringComponent(fix);
        const footer = advFilterDialog.querySelector('.igx-excel-filter__secondary-footer');
        return footer;
    }

    public static getAdvancedFilteringClearFilterButton(fix: ComponentFixture<any>) {
        const footer = GridFunctions.getAdvancedFilteringFooter(fix);
        const clearFilterButton: any = Array.from(footer.querySelectorAll('button'))
                                       .find((b: any) => b.innerText.toLowerCase() === 'clear filter');
        return clearFilterButton;
    }

    public static getAdvancedFilteringCancelButton(fix: ComponentFixture<any>) {
        const footer = GridFunctions.getAdvancedFilteringFooter(fix);
        const cancelFilterButton: any = Array.from(footer.querySelectorAll('button'))
                                        .find((b: any) => b.innerText.toLowerCase() === 'cancel');
        return cancelFilterButton;
    }

    public static getAdvancedFilteringApplyButton(fix: ComponentFixture<any>) {
        const footer = GridFunctions.getAdvancedFilteringFooter(fix);
        const applyFilterButton: any = Array.from(footer.querySelectorAll('button'))
                                       .find((b: any) => b.innerText.toLowerCase() === 'apply');
        return applyFilterButton;
    }

    public static getAdvancedFilteringEditModeContainer(fix: ComponentFixture<any>) {
        const exprContainer = GridFunctions.getAdvancedFilteringExpressionsContainer(fix);
        const editModeContainer = exprContainer.querySelector('.igx-filter-tree__inputs');
        return editModeContainer;
    }

    public static getAdvancedFilteringColumnSelect(fix: ComponentFixture<any>) {
        const editModeContainer = GridFunctions.getAdvancedFilteringEditModeContainer(fix);
        const selects = GridFunctions.sortNativeElementsHorizontally(Array.from(editModeContainer.querySelectorAll('igx-select')));
        const columnSelect = selects[0];
        return columnSelect;
    }

    public static getAdvancedFilteringOperatorSelect(fix: ComponentFixture<any>) {
        const editModeContainer = GridFunctions.getAdvancedFilteringEditModeContainer(fix);
        const selects = GridFunctions.sortNativeElementsHorizontally(Array.from(editModeContainer.querySelectorAll('igx-select')));
        const columnSelect = selects[1];
        return columnSelect;
    }

    public static getAdvancedFilteringValueInput(fix: ComponentFixture<any>, dateType: boolean = false) {
        const editModeContainer = GridFunctions.getAdvancedFilteringEditModeContainer(fix);
        const input = dateType ?
                    editModeContainer.querySelector('igx-date-picker').querySelector('input') :
                    GridFunctions.sortNativeElementsHorizontally(Array.from(editModeContainer.querySelectorAll('igx-input-group')))[2];
        return input;
    }

    public static getAdvancedFilteringExpressionCommitButton(fix: ComponentFixture<any>) {
        const editModeContainer = GridFunctions.getAdvancedFilteringEditModeContainer(fix);
        const actionButtonsContainer = editModeContainer.querySelector('.igx-filter-tree__inputs-actions');
        const actionButtons = Array.from(actionButtonsContainer.querySelectorAll('button'));
        const commitButton: any = actionButtons.find((b: any) => b.innerText === 'check');
        return commitButton;
    }

    public static getAdvancedFilteringExpressionCloseButton(fix: ComponentFixture<any>) {
        const editModeContainer = GridFunctions.getAdvancedFilteringEditModeContainer(fix);
        const actionButtonsContainer = editModeContainer.querySelector('.igx-filter-tree__inputs-actions');
        const actionButtons = Array.from(actionButtonsContainer.querySelectorAll('button'));
        const closeButton: any = actionButtons.find((b: any) => b.innerText === 'close');
        return closeButton;
    }

    public static getAdvancedFilteringOutlet(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const advFilteringDialog = gridNativeElement.querySelector('igx-advanced-filtering-dialog');
        const outlet = advFilteringDialog.querySelector('.igx-advanced-filter__outlet');
        return outlet;
    }

    public static getAdvancedFilteringSelectDropdown(fix: ComponentFixture<any>) {
        const outlet = GridFunctions.getAdvancedFilteringOutlet(fix);
        const selectDropdown = outlet.querySelector('.igx-drop-down__list--select');
        return selectDropdown;
    }

    public static getAdvancedFilteringSelectDropdownItems(fix: ComponentFixture<any>) {
        const selectDropdown = GridFunctions.getAdvancedFilteringSelectDropdown(fix);
        const items = GridFunctions.sortNativeElementsVertically(
            Array.from(selectDropdown.querySelectorAll('.igx-drop-down__item')));
        return items;
    }

    public static getAdvancedFilteringCalendar(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        const calendar = gridNativeElement.querySelector('.igx-calendar');
        return calendar;
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
export class GridSummaryFunctions {
    public static verifyColumnSummariesBySummaryRowIndex(fix, rowIndex: number, summaryIndex: number, summaryLabels, summaryResults) {
        const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, rowIndex);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, summaryIndex, summaryLabels, summaryResults);
    }

    public static verifyColumnSummaries(summaryRow: DebugElement, summaryIndex: number, summaryLabels, summaryResults) {
        // const summary = summaryRow.query(By.css('igx-grid-summary-cell[data-visibleindex="' + summaryIndex + '"]'));
        const summary = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, summaryIndex);
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
        return GridSummaryFunctions.getAllVisibleSummaries(fix).length;
    }

    public static getAllVisibleSummariesRowIndexes(fix) {
        const summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
        const rowIndexes = [];
        summaries.forEach(summary => {
            rowIndexes.push(Number(summary.attributes['data-rowIndex']));
        });
        return rowIndexes.sort((a: number, b: number) => a - b);
    }

    public static getAllVisibleSummaries(fix) {
        return fix.debugElement.queryAll(By.css('igx-grid-summary-row'));
    }

    public static verifyVisibleSummariesHeight(fix, summariesRows, rowHeight = 36) {
        const visibleSummaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
        visibleSummaries.forEach(summary => {
            expect(summary.nativeElement.getBoundingClientRect().height).toBeGreaterThanOrEqual(summariesRows * rowHeight - 1);
            expect(summary.nativeElement.getBoundingClientRect().height).toBeLessThanOrEqual(summariesRows * rowHeight + 1);
        });
    }

    public static verifySummaryCellActive(fix, rowIndex, cellIndex, active: boolean = true) {
        const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, rowIndex);
        const summ = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, cellIndex);
        const hasClass = summ.nativeElement.classList.contains(CELL_ACTIVE_CSS_CLASS);
        expect(hasClass === active).toBeTruthy();
    }

    public static moveSummaryCell =
        (fix, rowIndex, cellIndex, key, shift = false, ctrl = false) => new Promise(async (resolve, reject) => {
            const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, rowIndex);
            const summaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, cellIndex);
            UIInteractions.triggerKeyDownEvtUponElem(key, summaryCell.nativeElement, true, false, shift, ctrl);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            resolve();
        })

    public static focusSummaryCell =
        (fix, rowIndex, cellIndex) => new Promise(async (resolve, reject) => {
            const summaryRow = GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, rowIndex);
            const summaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, cellIndex);
            summaryCell.nativeElement.dispatchEvent(new Event('focus'));
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            resolve();
        })
}
export class GridSelectionFunctions {
    public static selectCellsRange =
        (fix, startCell, endCell, ctrl = false, shift = false) => new Promise(async (resolve, reject) => {
            UIInteractions.simulatePointerOverCellEvent('pointerdown', startCell.nativeElement, shift, ctrl);
            startCell.nativeElement.dispatchEvent(new Event('focus'));
            fix.detectChanges();
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
            resolve();
        })

    public static selectCellsRangeWithShiftKeyNoWait(fix, startCell, endCell) {
        UIInteractions.simulateClickAndSelectCellEvent(startCell);
        fix.detectChanges();

        UIInteractions.simulateClickAndSelectCellEvent(endCell, true);
        fix.detectChanges();
    }

    public static verifyCellsRegionSelected(grid, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, selected = true) {
        const startRow = startRowIndex < endRowIndex ? startRowIndex : endRowIndex;
        const endRow = startRowIndex < endRowIndex ? endRowIndex : startRowIndex;
        const startCol = startColumnIndex < endColumnIndex ? startColumnIndex : endColumnIndex;
        const endCol = startColumnIndex < endColumnIndex ? endColumnIndex : startColumnIndex;
        for (let i = startCol; i <= endCol; i++) {
            for (let j = startRow; j <= endRow; j++) {
                const cell = grid.getCellByColumn(j, grid.columnList.find(col => col.visibleIndex === i).field);
                if (cell) {
                    GridSelectionFunctions.verifyCellSelected(cell, selected);
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

    public static verifyRowSelected(row, selected = true, hasCheckbox = true) {
        expect(row.selected).toBe(selected);
        expect(row.nativeElement.classList.contains(ROW_SELECTION_CSS_CLASS)).toBe(selected);
        if (hasCheckbox) {
            GridSelectionFunctions.verifyRowHasCheckbox(row.nativeElement);
            expect(GridSelectionFunctions.getRowCheckboxInput(row.nativeElement).checked).toBe(selected);
        }
    }

    public static verifyRowsArraySelected(rows, selected = true, hasCheckbox = true) {
        rows.forEach(row => {
            GridSelectionFunctions.verifyRowSelected(row, selected, hasCheckbox);
        });
    }

    public static getHeaderRow(fix): HTMLElement {
        return fix.nativeElement.querySelector(HEADER_ROW_CSS_CLASS);
    }

    public static verifyHeaderRowCheckboxState(parent, checked = false, indeterminate = false) {
        const header = GridSelectionFunctions.getHeaderRow(parent);
        const headerCheckboxElement = GridSelectionFunctions.getRowCheckboxInput(header);
        expect(headerCheckboxElement.checked).toBe(checked);
        expect(headerCheckboxElement.indeterminate).toBe(indeterminate);
    }

    public static verifyHeaderAndRowCheckBoxesAlignment(grid) {
        const headerDiv = GridSelectionFunctions.getRowCheckboxDiv(GridSelectionFunctions.getHeaderRow(grid));
        const firstRowDiv = GridSelectionFunctions.getRowCheckboxDiv(grid.rowList.first.nativeElement);
        const scrollStartElement = grid.nativeElement.querySelector(SCROLL_START_CSS_CLASS);
        const hScrollbar = grid.parentVirtDir.getHorizontalScroll();

        expect(headerDiv.offsetWidth).toEqual(firstRowDiv.offsetWidth);
        expect(headerDiv.offsetLeft).toEqual(firstRowDiv.offsetLeft);
        if (hScrollbar.scrollWidth) {
            expect(scrollStartElement.offsetWidth).toEqual(firstRowDiv.offsetWidth);
            expect(hScrollbar.offsetLeft).toEqual(firstRowDiv.offsetWidth);
        }
    }

    public static verifyRowHasCheckbox(rowDOM, hasCheckbox = true, hasCheckboxDiv = true, verifyHeader = false) {
        const checkboxDiv = GridSelectionFunctions.getRowCheckboxDiv(rowDOM);
        if (!hasCheckbox && !hasCheckboxDiv) {
            expect(GridSelectionFunctions.getRowCheckboxDiv(rowDOM)).toBeNull();
        } else {
            expect(checkboxDiv).toBeDefined();
            const rowCheckbox = GridSelectionFunctions.getRowCheckbox(rowDOM);
            expect(rowCheckbox).toBeDefined();
            if (!hasCheckbox) {
                expect(rowCheckbox.style.visibility).toEqual('hidden');
            } else if (verifyHeader) {
                expect(rowCheckbox.style.visibility).toEqual('visible');
            } else {
                expect(rowCheckbox.style.visibility).toEqual('');
            }
        }
    }

    public static verifyHeaderRowHasCheckbox(parent, hasCheckbox = true, hasCheckboxDiv = true) {
        GridSelectionFunctions.verifyRowHasCheckbox(GridSelectionFunctions.getHeaderRow(parent), hasCheckbox, hasCheckboxDiv, true);
    }

    public static getRowCheckboxDiv(rowDOM): HTMLElement {
        return rowDOM.querySelector(ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS);
    }

    public static getRowCheckboxInput(rowDOM): HTMLInputElement {
        return GridSelectionFunctions.getRowCheckboxDiv(rowDOM).querySelector(CHECKBOX_INPUT_CSS_CLASS);
    }

    public static getRowCheckbox(rowDOM): HTMLElement {
        return GridSelectionFunctions.getRowCheckboxDiv(rowDOM).querySelector(CHECKBOX_ELEMENT);
    }

    public static clickRowCheckbox(row) {
        const checkboxElement = GridSelectionFunctions.getRowCheckboxDiv(row.nativeElement);
        checkboxElement.dispatchEvent(new Event('click', {}));
    }

    public static clickHeaderRowCheckbox(parent) {
        const checkboxElement = GridSelectionFunctions.getRowCheckboxDiv(GridSelectionFunctions.getHeaderRow(parent));
        checkboxElement.dispatchEvent(new Event('click', {}));
    }

    // select - deselect a checkbox without a handler
    public static rowCheckboxClick(row) {
        const checkboxElement = row.nativeElement ?
            row.nativeElement.querySelector(CHECKBOX_LBL_CSS_CLASS) :
            row.querySelector(CHECKBOX_LBL_CSS_CLASS);
        checkboxElement.click();
    }

    public static headerCheckboxClick(parent) {
        GridSelectionFunctions.rowCheckboxClick(GridSelectionFunctions.getHeaderRow(parent));
    }
    //

    public static expandRowIsland(rowNumber = 1) {
        (<any>document.getElementsByClassName(ICON_CSS_CLASS)[rowNumber]).click();
    }
}
