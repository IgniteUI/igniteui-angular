import { DebugElement, QueryList } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, tick } from '@angular/core/testing';
import { IgxInputDirective } from '../input-group/public_api';
import { IgxGridHeaderComponent } from '../grids/headers/grid-header.component';
import { IgxChipComponent } from '../chips/public_api';
import { IgxGridComponent } from '../grids/grid/grid.component';
import { IgxColumnGroupComponent } from '../grids/columns/column-group.component';
import { IgxGridHeaderGroupComponent } from '../grids/headers/grid-header-group.component';
import { UIInteractions, wait } from './ui-interactions.spec';
import { ControlsFunction } from './controls-functions.spec';
import { IgxGridExpandableCellComponent } from '../grids/grid/expandable-cell.component';
import { IgxColumnHidingDirective } from '../grids/column-actions/column-hiding.directive';
import { IgxColumnPinningDirective } from '../grids/column-actions/column-pinning.directive';
import { parseDate } from '../core/utils';
import { IgxGridHeaderRowComponent } from '../grids/headers/grid-header-row.component';
import { IgxGridRowComponent } from '../grids/grid/grid-row.component';
import { IgxGridCellComponent } from '../grids/cell.component';
import { IgxPivotRowComponent } from '../grids/pivot-grid/pivot-row.component';
import { SortingDirection } from '../data-operations/sorting-strategy';
import { IgxRowDirective } from '../grids/row.directive';
import { CellType, GridType, RowType } from '../grids/common/grid.interface';
import { IgxTreeNodeComponent } from '../tree/tree-node/tree-node.component';
import { IgxColumnComponent } from '../grids/columns/column.component';
import { IgxPivotGridComponent } from '../grids/pivot-grid/pivot-grid.component';
import { IgxIconComponent } from '../icon/icon.component';

const SUMMARY_LABEL_CLASS = '.igx-grid-summary__label';
const SUMMARY_ROW = 'igx-grid-summary-row';
const SUMMARY_CELL_ACTIVE_CSS_CLASS = 'igx-grid-summary--active';
const FILTER_UI_CELL = 'igx-grid-filtering-cell';
const FILTER_UI_ROW = 'igx-grid-filtering-row';
const FILTER_UI_CONNECTOR = 'igx-filtering-chips__connector';
const FILTER_ROW_BUTTONS_CLASS = '.igx-grid__filtering-row-editing-buttons';
const FILTER_UI_INDICATOR = 'igx-grid__filtering-cell-indicator';
const FILTER_CHIP_CLASS = '.igx-filtering-chips';
const ESF_MENU_CLASS = '.igx-excel-filter__menu';
const ESF_SORT_CLASS = '.igx-excel-filter__sort';
const ESF_MOVE_CLASS = '.igx-excel-filter__move';
const ESF_CUSTOM_FILTER_DIALOG_CLASS = '.igx-excel-filter__secondary';
const ESF_FILTER_ICON = '.igx-excel-filter__icon';
const ESF_FILTER_ICON_FILTERED = '.igx-excel-filter__icon--filtered';
const ESF_ADD_FILTER_CLASS = '.igx-excel-filter__add-filter';
const ESF_DEFAULT_EXPR = 'igx-excel-style-default-expression';
const ESF_DATE_EXPR = 'igx-excel-style-date-expression';
const BANNER_CLASS = '.igx-banner';
const BANNER_TEXT_CLASS = '.igx-banner__text';
const BANNER_ROW_CLASS = '.igx-banner__row';
const EDIT_OVERLAY_CONTENT = '.igx-overlay__content';
const PAGER_BUTTONS = 'igx-page-nav > button';
const ACTIVE_GROUP_ROW_CLASS = 'igx-grid__group-row--active';
const ACTIVE_HEADER_CLASS = 'igx-grid-th--active';
const GROUP_ROW_CLASS = 'igx-grid-groupby-row';
const CELL_SELECTED_CSS_CLASS = 'igx-grid__td--selected';
const CELL_INVALID_CSS_CLASS = 'igx-grid__td--invalid';
const CELL_ACTIVE_CSS_CLASS = 'igx-grid__td--active';
const ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS = 'igx-grid__cbx-selection';
const ROW_SELECTION_CSS_CLASS = 'igx-grid__tr--selected';
const HEADER_ROW_CSS_CLASS = '.igx-grid-thead';
const CHECKBOX_INPUT_CSS_CLASS = '.igx-checkbox__input';
const CHECKBOX_ELEMENT = 'igx-checkbox';
const ICON_CSS_CLASS = 'material-icons igx-icon';
const CHECKBOX_LBL_CSS_CLASS = '.igx-checkbox__composite';
const GROUP_EXPANDER_CLASS = '.igx-grid-th__expander';
const GROUP_HEADER_CLASS = '.igx-grid-th__group-title';
const CELL_CSS_CLASS = '.igx-grid__td';
const ROW_CSS_CLASS = '.igx-grid__tr';
const FOCUSED_CHECKBOX_CLASS = 'igx-checkbox--focused';
const GRID_BODY_CLASS = '.igx-grid__tbody';
const GRID_FOOTER_CLASS = '.igx-grid__tfoot';
const GRID_CONTENT_CLASS = '.igx-grid__tbody-content';
const DISPLAY_CONTAINER = 'igx-display-container';
const SORT_ICON_CLASS = '.sort-icon';
const FILTER_ICON_CLASS = '.igx-excel-filter__icon';
const SELECTED_COLUMN_CLASS = 'igx-grid-th--selected';
const HOVERED_COLUMN_CLASS = 'igx-grid-th--selectable';
const SELECTED_COLUMN_CELL_CLASS = 'igx-grid__td--column-selected';
const FOCUSED_DETAILS_ROW_CLASS = 'igx-grid__tr-container--active';
const DRAG_INDICATOR_CLASS = '.igx-grid__drag-indicator';
const SORTED_COLUMN_CLASS = 'igx-grid-th--sorted';
const SORTING_ICON_ASC_CONTENT = 'arrow_upward';
const SORTING_ICON_DESC_CONTENT = 'arrow_downward';
const SUMMARY_CELL = 'igx-grid-summary-cell';
const COLUMN_ACTIONS_INPUT_CLASS = '.igx-column-actions__header-input';
const COLUMN_ACTIONS_COLUMNS_CLASS = '.igx-column-actions__columns';
const COLUMN_ACTIONS_COLUMNS_LABEL_CLASS = 'igx-checkbox__label';
const GRID_TOOLBAR_TAG = 'igx-grid-toolbar';
const GRID_TOOLBAR_EXPORT_BUTTON_CLASS = '.igx-grid-toolbar__dropdown#btnExport';
const GRID_OUTLET_CLASS = 'div.igx-grid__outlet';
const SORT_INDEX_ATTRIBUTE = 'data-sortIndex';
const RESIZE_LINE_CLASS = '.igx-grid-th__resize-line';
const RESIZE_AREA_CLASS = '.igx-grid-th__resize-handle';
const GRID_COL_THEAD_CLASS = '.igx-grid-th';
const TREE_NODE_TOGGLE = '.igx-tree-node__toggle-button';

export const GRID_SCROLL_CLASS = '.igx-grid__scroll';
export const GRID_MRL_BLOCK = 'igx-grid__mrl-block';
export const CELL_PINNED_CLASS = 'igx-grid__td--pinned';
export const HEADER_PINNED_CLASS = 'igx-grid-th--pinned';
export const GRID_HEADER_CLASS = '.igx-grid-thead__wrapper';
export const PINNED_SUMMARY = 'igx-grid-summary--pinned';
export const PAGER_CLASS = '.igx-page-nav';
export const SAFE_DISPOSE_COMP_ID = 'root';

export class GridFunctions {

    public static getRows(fix): DebugElement[] {
        const rows: DebugElement[] = fix.debugElement.queryAll(By.css(ROW_CSS_CLASS));
        rows.shift();
        return rows;
    }

    public static getRowCells(fix, rowIndex: number, row: DebugElement = null): DebugElement[] {
        const rowElement = row ? row : GridFunctions.getRows(fix)[rowIndex];
        return rowElement.queryAll(By.css(CELL_CSS_CLASS));
    }

    public static getGridBody(fix): DebugElement {
        return fix.debugElement.query(By.css(GRID_BODY_CLASS));
    }

    public static getGridContent(fix): DebugElement {
        return fix.debugElement.query(By.css(GRID_CONTENT_CLASS));
    }

    public static getGridHeader(grid: GridType): IgxGridHeaderRowComponent {
        return grid.theadRow;
    }

    public static getGridDisplayContainer(fix): DebugElement {
        const gridBody = this.getGridBody(fix);
        return gridBody.query(By.css(DISPLAY_CONTAINER));
    }

    public static getGridFooterWrapper(fix): DebugElement {
        return fix.debugElement.query(By.css(GRID_FOOTER_CLASS));
    }

    public static getGridFooter(fix): DebugElement {
        return fix.debugElement.query(By.css(GRID_FOOTER_CLASS)).children[0];
    }

    public static getGridScroll(fix): DebugElement {
        return fix.debugElement.query(By.css(GRID_SCROLL_CLASS));
    }

    public static getRowDisplayContainer(fix, index: number): DebugElement {
        const row = GridFunctions.getRows(fix)[index];
        return row.query(By.css(DISPLAY_CONTAINER));
    }

    public static getColGroup(grid: IgxGridComponent | IgxPivotGridComponent, headerName: string): IgxColumnGroupComponent {
        const colGroups = grid.columns.filter(c => c.columnGroup && c.header === headerName);
        if (colGroups.length === 0) {
            return null;
        } else if (colGroups.length === 1) {
            return colGroups[0];
        } else {
            throw new Error('More than one column group found.');
        }
    }

    public static getPivotRows(fix): DebugElement[] {
        const rows: DebugElement[] = fix.debugElement.queryAll(By.directive(IgxPivotRowComponent));
        return rows;
    }

    /**
     * Focus the grid header
     */
    public static focusHeader(fix: ComponentFixture<any>, grid: GridType) {
        this.getGridHeader(grid).nativeElement.focus();
        fix.detectChanges();
    }

    /**
     * Focus the first cell in the grid
     */
    public static focusFirstCell(fix: ComponentFixture<any>, grid: GridType) {
        this.getGridHeader(grid).nativeElement.focus();
        fix.detectChanges();
        this.getGridContent(fix).triggerEventHandler('focus', null);
        fix.detectChanges();
    }

    /**
     * Focus the cell in the grid
     */
    public static focusCell(fix: ComponentFixture<any>, cell: IgxGridCellComponent | CellType) {
        this.getGridContent(fix).triggerEventHandler('focus', null);
        fix.detectChanges();
        cell.activate(null);
        fix.detectChanges();
    }

    public static scrollLeft(grid: IgxGridComponent, newLeft: number) {
        const hScrollbar = grid.headerContainer.getScroll();
        hScrollbar.scrollLeft = newLeft;
    }

    public static scrollTop(grid: IgxGridComponent, newTop: number) {
        const vScrollbar = grid.verticalScrollContainer.getScroll();
        vScrollbar.scrollTop = newTop;
    }

    public static getMasterRowDetail(row) {
        const nextSibling = row.element.nativeElement.nextElementSibling;
        if (nextSibling &&
            nextSibling.tagName.toLowerCase() === 'div' &&
            nextSibling.getAttribute('detail') === 'true') {
            return nextSibling;
        }
        return null;
    }

    public static verifyMasterDetailRowFocused(row: HTMLElement, focused = true) {
        expect(row.classList.contains(FOCUSED_DETAILS_ROW_CLASS)).toEqual(focused);
    }

    public static setAllExpanded(grid: IgxGridComponent, data: Array<any>) {
        const allExpanded = new Map<any, boolean>();
        data.forEach(item => {
            allExpanded.set(item['ID'], true);
        });
        grid.expansionStates = allExpanded;
    }

    public static elementInGridView(grid: IgxGridComponent, element: HTMLElement): boolean {
        const gridBottom = grid.tbody.nativeElement.getBoundingClientRect().bottom;
        const gridTop = grid.tbody.nativeElement.getBoundingClientRect().top;
        return element.getBoundingClientRect().top >= gridTop && element.getBoundingClientRect().bottom <= gridBottom;
    }

    public static toggleMasterRowByClick =
        async (fix, row: IgxGridRowComponent, debounceTime) => {
            const icon = row.element.nativeElement.querySelector('igx-icon');
            UIInteractions.simulateClickAndSelectEvent(icon.parentElement);
            await wait(debounceTime);
            fix.detectChanges();
        };

    public static toggleMasterRow(fix: ComponentFixture<any>, row: IgxRowDirective) {
        const rowDE = fix.debugElement.queryAll(By.directive(IgxRowDirective)).find(el => el.componentInstance === row);
        const expandCellDE = rowDE.query(By.directive(IgxGridExpandableCellComponent));
        expandCellDE.componentInstance.toggle(new MouseEvent('click'));
        fix.detectChanges();
    }

    public static getMasterRowDetailDebug(fix: ComponentFixture<any>, row: IgxRowDirective) {
        const rowDE = fix.debugElement.queryAll(By.directive(IgxRowDirective)).find(el => el.componentInstance === row);
        const detailDE = rowDE.parent.children
            .find(el => el.attributes['detail'] === 'true' && el.attributes['data-rowindex'] === row.index + 1 + '');
        return detailDE;
    }

    public static getAllMasterRowDetailDebug(fix: ComponentFixture<any>) {
        return fix.debugElement.queryAll(By.css('div[detail="true"]')).sort((a, b) => a.context.index - b.context.index);
    }

    public static getRowExpandIconName(row: IgxRowDirective) {
        return row.element.nativeElement.querySelector('igx-icon').textContent;
    }

    public static getGroupedRows(fix): DebugElement[] {
        return fix.debugElement.queryAll(By.css(GROUP_ROW_CLASS));
    }

    public static verifyGroupRowIsFocused(groupRow, focused = true) {
        expect(groupRow.nativeElement.classList.contains(ACTIVE_GROUP_ROW_CLASS)).toBe(focused);
    }

    public static verifyHeaderIsFocused(header, focused = true) {
        expect(header.nativeElement.classList.contains(ACTIVE_HEADER_CLASS)).toBe(focused);
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

    public static verifyColumnsAreHidden(columns, isHidden: boolean, visibleColumnsCount: number) {
        const visibleColumns = columns[0].grid.visibleColumns;
        columns.forEach(column => {
            expect(column.hidden).toBe(isHidden, 'Hidden is not ' + isHidden);
            expect(visibleColumns.findIndex((col) => col === column) > -1)
                .toBe(!isHidden, 'Unexpected result for visibleColumns collection!');
        });
        expect(visibleColumns.length).toBe(visibleColumnsCount, 'Unexpected visible columns count!');
    }

    public static verifyColumnIsPinned(column, isPinned: boolean, pinnedColumnsCount: number) {
        expect(column.pinned).toBe(isPinned, 'Pinned is not ' + isPinned);

        const pinnedColumns = column.grid.pinnedColumns;
        expect(pinnedColumns.length).toBe(pinnedColumnsCount, 'Unexpected pinned columns count!');
        expect(pinnedColumns.findIndex((col) => col === column) > -1).toBe(isPinned, 'Unexpected result for pinnedColumns collection!');
    }

    public static verifyUnpinnedAreaWidth(grid: GridType, expectedWidth: number, includeScrollWidth = true) {
        const tolerance = includeScrollWidth ? Math.abs(expectedWidth - (grid.unpinnedWidth + grid.scrollSize)) :
            Math.abs(expectedWidth - grid.unpinnedWidth);
        expect(tolerance).toBeLessThanOrEqual(1);
    }

    public static verifyPinnedAreaWidth(grid: GridType, expectedWidth: number) {
        const tolerance = Math.abs(expectedWidth - grid.pinnedWidth);
        expect(tolerance).toBeLessThanOrEqual(1);
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
        }

        if (dateItem0.isNextYear) {
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
        date = parseDate(date);
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
        UIInteractions.simulateClickAndSelectEvent(debugElement.componentInstance.nativeElement);
    }

    public static isInView(index, state): boolean {
        return index > state.startIndex && index <= state.startIndex + state.chunkSize;
    }

    /* Toolbar-related members */
    public static getToolbar<T>(fixture: ComponentFixture<T>) {
        return fixture.debugElement.query(By.css(GRID_TOOLBAR_TAG));
    }

    public static getOverlay(fixture) {
        const div = fixture.debugElement.query(By.css(GRID_OUTLET_CLASS));
        return div.nativeElement;
    }

    public static getAdvancedFilteringButton<T>(fix: ComponentFixture<T>) {
        const button = GridFunctions.getToolbar(fix).query(By.css('igx-grid-toolbar-advanced-filtering > button'));
        return button ? button.nativeElement : undefined;
    }

    public static getColumnHidingButton<T>(fixture: ComponentFixture<T>) {
        const button = GridFunctions.getToolbar(fixture).query(By.css('igx-grid-toolbar-hiding > button'));
        return button ? button.nativeElement : undefined;
    }

    public static getColumnPinningButton<T>(fixture: ComponentFixture<T>) {
        const button = GridFunctions.getToolbar(fixture).query(By.css('igx-grid-toolbar-pinning > button'));
        return button ? button.nativeElement : undefined;
    }

    public static getExportButton<T>(fixture: ComponentFixture<T>) {
        const div = GridFunctions.getToolbar(fixture).query(By.css(GRID_TOOLBAR_EXPORT_BUTTON_CLASS));
        return (div) ? div.query(By.css('button')) : null;
    }

    public static getExportOptions<T>(fixture: ComponentFixture<T>) {
        const div = GridFunctions.getOverlay(fixture);
        return (div) ? div.querySelectorAll('li') : null;
    }

    // Filtering
    public static getFilteringCells(fix) {
        return fix.debugElement.queryAll(By.css(FILTER_UI_CELL));
    }

    public static getFilteringChips(fix) {
        return fix.debugElement.queryAll(By.css(FILTER_CHIP_CLASS));
    }

    public static getFilteringChipPerIndex(fix, index) {
        return this.getFilteringCells(fix)[index].queryAll(By.css(FILTER_CHIP_CLASS));
    }

    public static getFilterRowCloseButton(fix): DebugElement {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const buttonsContainer = filterUIRow.query(By.css(FILTER_ROW_BUTTONS_CLASS));
        return buttonsContainer.queryAll(By.css('button'))[1];
    }

    public static removeFilterChipByIndex(index: number, filterUIRow) {
        const filterChip = filterUIRow.queryAll(By.css('igx-chip'))[index];
        ControlsFunction.clickChipRemoveButton(filterChip.nativeElement);
    }

    public static verifyFilteringDropDownIsOpened(fix, opened = true) {
        const dropdownList = fix.debugElement.query(By.css('div.igx-drop-down__list.igx-toggle'));
        expect(dropdownList !== null).toEqual(opened);
    }

    public static selectFilteringCondition(cond: string, ddList) {
        const ddItems = ddList.nativeElement.children;
        let i;
        for (i = 0; i < ddItems.length; i++) {
            const ddItem = ddItems[i].querySelector('.igx-grid__filtering-dropdown-items span');
            if (ddItem.textContent === cond) {
                ddItem.click();
                tick(100);
                return;
            }
        }
    }

    public static openFilterDDAndSelectCondition(fix: ComponentFixture<any>, index: number) {
        GridFunctions.openFilterDD(fix.debugElement);
        tick();
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list-scroll'));
        const ddItems = ddList.nativeElement.children;
        ddItems[index].click();
        tick(100);
        fix.detectChanges();
    }

    public static applyFilter(value: string, fix: ComponentFixture<any>) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const input = filterUIRow.query(By.directive(IgxInputDirective));
        UIInteractions.clickAndSendInputElementValue(input.nativeElement, value, fix);

        // Enter key to submit
        UIInteractions.triggerEventHandlerKeyDown('Enter', input);
        fix.detectChanges();
    }

    public static filterBy(condition: string, value: string, fix: ComponentFixture<any>) {
        // open dropdown
        this.openFilterDD(fix.debugElement);
        fix.detectChanges();

        const ddList = fix.debugElement.query(By.css('div.igx-drop-down__list-scroll'));
        this.selectFilteringCondition(condition, ddList);
        // fix.detectChanges();
        tick(100);
        this.applyFilter(value, fix);
        tick(100);
    }

    public static typeValueInFilterRowInput(value, fix, input = null) {
        if (!input) {
            const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
            input = filterUIRow.query(By.directive(IgxInputDirective));
        }
        UIInteractions.clickAndSendInputElementValue(input.nativeElement, value, fix);
    }

    public static submitFilterRowInput(fix) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const input = filterUIRow.query(By.directive(IgxInputDirective));

        UIInteractions.triggerEventHandlerKeyDown('Enter', input);
        fix.detectChanges();
    }

    public static resetFilterRow(fix: ComponentFixture<any>) {
        fix.componentInstance.grid.filteringRow.onClearClick();
        tick(100);
        fix.detectChanges();
    }

    public static closeFilterRow(fix: ComponentFixture<any>) {
        fix.componentInstance.grid.filteringRow.close();
        fix.detectChanges();
    }

    public static openFilterDD(elem: DebugElement) {
        const filterUIRow = elem.query(By.css(FILTER_UI_ROW));
        const filterIcon = filterUIRow.query(By.css('igx-icon'));
        filterIcon.nativeElement.click();
    }

    /**
     * Gets the ESF icon when no filter is applied
     */
    public static getExcelFilterIcon(fix: ComponentFixture<any>, columnField: string) {
        const columnHeader = GridFunctions.getColumnHeader(columnField, fix).nativeElement;
        return columnHeader.querySelector(ESF_FILTER_ICON);
    }

    /**
     * Gets the ESF icon when filter is applied
     */
    public static getExcelFilterIconFiltered(fix: ComponentFixture<any>, columnField: string) {
        const columnHeader = GridFunctions.getColumnHeader(columnField, fix).nativeElement;
        return columnHeader.querySelector(ESF_FILTER_ICON_FILTERED);
    }

    /**
     * Gets the ESF tree node icon
     */
    public static getExcelFilterTreeNodeIcon(fix: ComponentFixture<any>, index: number) {
        const treeNodeEl = fix.debugElement.queryAll(By.directive(IgxTreeNodeComponent))[index]?.nativeElement;
        const expandIcon = treeNodeEl.querySelector(TREE_NODE_TOGGLE);
        return expandIcon;
    }

    public static clickExcelFilterIcon(fix: ComponentFixture<any>, columnField: string) {
        const filterIcon = GridFunctions.getExcelFilterIcon(fix, columnField);
        const filterIconFiltered = GridFunctions.getExcelFilterIconFiltered(fix, columnField);
        const icon = (filterIcon) ? filterIcon : filterIconFiltered;
        UIInteractions.simulateClickAndSelectEvent(icon);
    }

    public static clickExcelTreeNodeExpandIcon(fix: ComponentFixture<any>, index: number) {
        const expandIcon = GridFunctions.getExcelFilterTreeNodeIcon(fix, index);
        UIInteractions.simulateClickAndSelectEvent(expandIcon);
    }

    public static clickExcelFilterIconFromCode(fix: ComponentFixture<any>, grid: GridType, columnField: string) {
        const event = { stopPropagation: () => { }, preventDefault: () => { } };
        const header = grid.getColumnByName(columnField).headerCell;
        header.onFilteringIconClick(event);
        tick(50);
        fix.detectChanges();
    }

    public static clickExcelFilterIconFromCodeAsync(fix: ComponentFixture<any>, grid: GridType, columnField: string) {
        const event = { stopPropagation: () => { }, preventDefault: () => { } };
        const header = grid.getColumnByName(columnField).headerCell;
        header.onFilteringIconClick(event);
        fix.detectChanges();
    }

    public static getApplyButtonExcelStyleFiltering(fix: ComponentFixture<any>, menu = null, grid = 'igx-grid') {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix, grid);
        const containedButtons = Array.from(excelMenu.querySelectorAll('.igx-button--contained'));
        const applyButton: any = containedButtons.find((rb: any) => rb.innerText.toLowerCase() === 'apply');
        return applyButton;
    }

    public static clickApplyExcelStyleFiltering(fix: ComponentFixture<any>, menu = null, grid = 'igx-grid') {
        const applyButton = GridFunctions.getApplyButtonExcelStyleFiltering(fix, menu, grid);
        applyButton.click();
    }

    public static clickCancelExcelStyleFiltering(fix: ComponentFixture<any>, menu = null) {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        const flatButtons = Array.from(excelMenu.querySelectorAll('.igx-button--flat'));
        const cancelButton: any = flatButtons.find((rb: any) => rb.innerText.toLowerCase() === 'cancel');
        cancelButton.click();
    }

    public static getExcelFilterCascadeButton(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector('.igx-excel-filter__actions-filter');
    }

    public static clickExcelFilterCascadeButton(fix: ComponentFixture<any>, menu = null) {
        const cascadeButton = GridFunctions.getExcelFilterCascadeButton(fix, menu);
        cascadeButton.click();
    }

    public static clickOperatorFromCascadeMenu(fix: ComponentFixture<any>, operatorIndex: number) {
        ControlsFunction.clickDropDownItem(fix, operatorIndex);
    }

    public static getApplyExcelStyleCustomFiltering(fix: ComponentFixture<any>): HTMLElement {
        const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);
        const containedButtons = Array.from(customFilterMenu.querySelectorAll('.igx-button--contained'));
        const applyButton = containedButtons.find((rb: any) => rb.innerText.toLowerCase() === 'apply');
        return applyButton as HTMLElement;
    }

    public static clickApplyExcelStyleCustomFiltering(fix: ComponentFixture<any>) {
        const applyButton = GridFunctions.getApplyExcelStyleCustomFiltering(fix);
        applyButton.click();
        fix.detectChanges();
    }

    public static clickClearFilterExcelStyleCustomFiltering(fix: ComponentFixture<any>) {
        const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);
        const containedButtons = Array.from(customFilterMenu.querySelectorAll('.igx-button--flat'));
        const button: any = containedButtons.find((rb: any) => rb.innerText === 'Clear filter');
        button.click();
        fix.detectChanges();
    }

    public static getExcelCustomFilteringExpressionAndButton(fix: ComponentFixture<any>, expressionIndex = 0): HTMLElement {
        const expr = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix)[expressionIndex];
        const andButton = GridFunctions.sortNativeElementsHorizontally(Array.from(expr.querySelectorAll('.igx-button-group__item')))[0];
        return andButton;
    }

    public static getExcelCustomFilteringExpressionOrButton(fix: ComponentFixture<any>, expressionIndex = 0): HTMLElement {
        const expr = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix)[expressionIndex];
        const orButton = GridFunctions.sortNativeElementsHorizontally(Array.from(expr.querySelectorAll('.igx-button-group__item')))[1];
        return orButton;
    }

    public static clickCancelExcelStyleCustomFiltering(fix: ComponentFixture<any>) {
        const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);
        const flatButtons = Array.from(customFilterMenu.querySelectorAll('.igx-button--flat'));
        const cancelButton: any = flatButtons.find((rb: any) => rb.innerText.toLowerCase() === 'cancel');
        cancelButton.click();
    }

    public static getAddFilterExcelStyleCustomFiltering(fix: ComponentFixture<any>): HTMLElement {
        const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);
        const addFilterButton: HTMLElement = customFilterMenu.querySelector(ESF_ADD_FILTER_CLASS);
        return addFilterButton;
    }

    public static clickAddFilterExcelStyleCustomFiltering(fix: ComponentFixture<any>) {
        const addFilterButton = GridFunctions.getAddFilterExcelStyleCustomFiltering(fix);
        addFilterButton.click();
    }

    /**
     * Click the pin/unpin icon in the ESF by specifying whether the icon is in the header
     * or at its default position (depending on the display density).
     */
    public static clickPinIconInExcelStyleFiltering(fix: ComponentFixture<any>, isIconInHeader = true) {
        let pinUnpinIcon: any;
        if (isIconInHeader) {
            const headerIcons: DebugElement[] = GridFunctions.getExcelFilteringHeaderIconsDebugElements(fix);
            const headerAreaPinIcon = headerIcons.find((buttonIcon: DebugElement) => buttonIcon.query(By.directive(IgxIconComponent)).componentInstance.name === "pin");
            const headerAreaUnpinIcon = headerIcons.find((buttonIcon: DebugElement) => buttonIcon.query(By.directive(IgxIconComponent)).componentInstance.name === "unpin");
            pinUnpinIcon = headerAreaPinIcon ? headerAreaPinIcon.nativeElement : headerAreaUnpinIcon.nativeElement;
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
    public static clickHideIconInExcelStyleFiltering(fix: ComponentFixture<any>, isIconInHeader = true) {
        let hideIcon: any;
        if (isIconInHeader) {
            const headerIcons = GridFunctions.getExcelFilteringHeaderIcons(fix);
            hideIcon = headerIcons.find((buttonIcon: any) => buttonIcon.innerText === 'visibility_off');
        } else {
            hideIcon = GridFunctions.getExcelFilteringHideContainer(fix);
        }
        hideIcon.click();
    }

    public static getIconFromButton(iconName: string, fixture: ComponentFixture<any>) {
        const icons = fixture.debugElement.queryAll(By.directive(IgxIconComponent));
        return icons.find((de: DebugElement) => {
            return de.componentInstance.name === iconName;
        });
    }

    /**
     * Click the sort ascending button in the ESF.
     */
    public static clickSortAscInExcelStyleFiltering(fix: ComponentFixture<any>) {
        const sortAscIcon: DebugElement = this.getIconFromButton('sort_asc', fix);
        sortAscIcon?.nativeElement.click();
    }

    /**
     * Click the column selection button in the ESF.
     */
    public static clickColumnSelectionInExcelStyleFiltering(fix: ComponentFixture<any>) {
        const columnSelectIcon: any = this.getIconFromButton('selected', fix);
        columnSelectIcon?.nativeElement.click();
    }

    /**
     * Click the sort descending button in the ESF.
     */
    public static clickSortDescInExcelStyleFiltering(fix: ComponentFixture<any>) {
        const sortDescIcon: any = this.getIconFromButton('sort_desc', fix);
        sortDescIcon?.nativeElement.click();
    }

    /**
     * Click the move left button in the ESF.
     */
    public static clickMoveLeftInExcelStyleFiltering(fix: ComponentFixture<any>) {
        const moveLeftIcon: any = this.getIconFromButton('arrow_back', fix);
        moveLeftIcon?.nativeElement.click();
    }

    /**
     * Click the move right button in the ESF.
     */
    public static clickMoveRightInExcelStyleFiltering(fix: ComponentFixture<any>) {
        const moveRightIcon: any = this.getIconFromButton('arrow_forward', fix);
        moveRightIcon?.nativeElement.click();
    }

    public static getExcelFilteringInput(fix: ComponentFixture<any>, expressionIndex = 0): HTMLInputElement {
        const expr = GridFunctions.getExcelCustomFilteringDefaultExpressions(fix)[expressionIndex];
        return expr.querySelectorAll('.igx-input-group__input').item(1) as HTMLInputElement;
    }

    public static getExcelFilteringDDInput(fix: ComponentFixture<any>,
        expressionIndex = 0, isDate = false): HTMLInputElement {
        const allExpressions = isDate ? GridFunctions.getExcelCustomFilteringDateExpressions(fix) :
            GridFunctions.getExcelCustomFilteringDefaultExpressions(fix);
        return allExpressions[expressionIndex].querySelectorAll('.igx-input-group__input').item(0) as HTMLInputElement;
    }

    public static setInputValueESF(fix: ComponentFixture<any>, expressionIndex: number, value: any) {
        const input = GridFunctions.getExcelFilteringInput(fix, expressionIndex);
        UIInteractions.clickAndSendInputElementValue(input, value, fix);
    }

    /**
     * Gets the clear filter button in the ESF.
     */
    public static getClearFilterInExcelStyleFiltering(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        const clearFilterContainer = excelMenu.querySelector('.igx-excel-filter__actions-clear');
        const clearFilterDisabledContainer = excelMenu.querySelector('.igx-excel-filter__actions-clear--disabled');
        const clearIcon = clearFilterContainer ? clearFilterContainer : clearFilterDisabledContainer;
        return clearIcon;
    }

    /**
     * Click the clear filter button in the ESF.
     */
    public static clickClearFilterInExcelStyleFiltering(fix: ComponentFixture<any>, menu = null) {
        const clearIcon = GridFunctions.getClearFilterInExcelStyleFiltering(fix, menu);
        clearIcon.click();
    }

    /**
     * returns the filter row debug element.
     */
    public static getFilterRow(fix: ComponentFixture<any>): DebugElement {
        return fix.debugElement.query(By.css(FILTER_UI_ROW));
    }

    /**
     * Open filtering row for a column.
     */
    public static clickFilterCellChip(fix, columnField: string) {
        const grid = fix.componentInstance.grid;
        grid.getColumnByName(columnField).filterCell.onChipClicked();
        fix.detectChanges();
    }

    /**
     * Click the filter chip for the provided column in order to open the filter row for it.
     */
    public static clickFilterCellChipUI(fix, columnField: string, forGrid?: GridType) {
        const headerGroups = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
        const headerGroup = headerGroups.find((hg) => {
            const col: IgxColumnComponent = hg.componentInstance.column;
            return col.field === columnField && (forGrid ? forGrid.gridAPI.grid === col.grid : true);
        });
        const filterCell = headerGroup.query(By.css(FILTER_UI_CELL));
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

    public static getExcelStyleFilteringComponent(fix, grid = 'igx-grid') {
        const gridNativeElement = fix.debugElement.query(By.css(grid)).nativeElement;
        let excelMenu = gridNativeElement.querySelector(ESF_MENU_CLASS);
        if (!excelMenu) {
            excelMenu = fix.nativeElement.querySelector(ESF_MENU_CLASS);
        }
        return excelMenu;
    }
    public static getExcelStyleFilteringComponents(fix, grid = 'igx-pivot-grid') {
        const gridNativeElement = fix.debugElement.query(By.css(grid)).nativeElement;
        let excelMenus = gridNativeElement.querySelectorAll(ESF_MENU_CLASS);
        if (!excelMenus) {
            excelMenus = fix.nativeElement.querySelector(ESF_MENU_CLASS);
        }
        return excelMenus;
    }
    public static getExcelStyleFilteringCheckboxes(fix, menu = null, grid = 'igx-grid'): HTMLElement[] {
        const searchComp = GridFunctions.getExcelStyleSearchComponent(fix, menu, grid);
        return GridFunctions.sortNativeElementsVertically(Array.from(searchComp.querySelectorAll(CHECKBOX_INPUT_CSS_CLASS)));
    }

    public static getExcelStyleFilteringSortContainer(fix, menu = null) {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector(ESF_SORT_CLASS);
    }

    public static getExcelStyleFilteringSortButtons(fix, menu = null): HTMLElement[] {
        const sortContainer = GridFunctions.getExcelStyleFilteringSortContainer(fix, menu);
        return sortContainer.querySelectorAll('.igx-button--flat');
    }

    public static getExcelStyleFilteringMoveContainer(fix, menu = null) {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector(ESF_MOVE_CLASS);
    }

    public static getExcelStyleFilteringMoveButtons(fix, menu = null): HTMLElement[] {
        const moveContainer = GridFunctions.getExcelStyleFilteringMoveContainer(fix, menu);
        return moveContainer.querySelectorAll('.igx-button--flat');
    }

    public static getExcelStyleSearchComponent(fix, menu = null, grid = 'igx-grid') {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix, grid);
        const searchComponent = excelMenu.querySelector('.igx-excel-filter__menu-main');
        return searchComponent;
    }

    public static getExcelStyleSearchComponentScrollbar(fix, menu = null) {
        const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix, menu);
        const scrollbar = searchComponent.querySelector('igx-virtual-helper');
        return scrollbar;
    }

    public static getExcelStyleSearchComponentInput(fix, comp = null, grid = 'igx-grid'): HTMLInputElement {
        const searchComponent = comp ? comp : GridFunctions.getExcelStyleSearchComponent(fix, null, grid);
        return searchComponent.querySelector('.igx-input-group__input');
    }

    public static getExcelStyleSearchComponentListItems(fix, comp = null, grid = 'igx-grid'): HTMLElement[] {
        const searchComponent = comp ? comp : GridFunctions.getExcelStyleSearchComponent(fix, null, grid);
        return GridFunctions.sortNativeElementsVertically(Array.from(searchComponent.querySelectorAll('igx-list-item')));
    }

    public static getExcelStyleSearchComponentTreeNodes(fix, comp = null, grid = 'igx-tree-grid'): HTMLElement[] {
        const searchComponent = comp ? comp : GridFunctions.getExcelStyleSearchComponent(fix, null, grid);
        return GridFunctions.sortNativeElementsVertically(Array.from(searchComponent.querySelectorAll('igx-tree-node')));
    }

    public static getColumnHeaders(fix: ComponentFixture<any>): DebugElement[] {
        return fix.debugElement.queryAll(By.directive(IgxGridHeaderComponent));
    }

    public static getColumnHeader(columnField: string, fix: ComponentFixture<any>, forGrid?: GridType): DebugElement {
        return this.getColumnHeaders(fix).find((header) => {
            const col = header.componentInstance.column;
            return col.field === columnField && (forGrid ? forGrid === col.grid : true);
        });
    }

    public static getColumnGroupHeaders(fix: ComponentFixture<any>): DebugElement[] {
        const allHeaders = fix.debugElement.queryAll(By.directive(IgxGridHeaderGroupComponent));
        const groupHeaders = allHeaders.filter(h => h.componentInstance.column.columnGroup);
        return groupHeaders;
    }

    public static getColumnGroupHeader(header: string, fix: ComponentFixture<any>, forGrid?: GridType): DebugElement {
        const headers = this.getColumnGroupHeaders(fix);
        const head = headers.find((gr) => {
            const col = gr.componentInstance.column;
            return col.header === header && (forGrid ? forGrid === col.grid : true);
        });
        return head;
    }

    public static clickColumnHeaderUI(columnField: string, fix: ComponentFixture<any>, ctrlKey = false, shiftKey = false) {
        const header = this.getColumnHeader(columnField, fix);
        header.triggerEventHandler('click', new MouseEvent('click', { shiftKey, ctrlKey }));
        fix.detectChanges();
    }

    public static clickColumnGroupHeaderUI(columnField: string, fix: ComponentFixture<any>, ctrlKey = false, shiftKey = false) {
        const header = this.getColumnGroupHeaderCell(columnField, fix);
        header.triggerEventHandler('click', new MouseEvent('click', { shiftKey, ctrlKey }));
        fix.detectChanges();
    }

    public static getColumnHeaderByIndex(fix: ComponentFixture<any>, index: number) {
        return fix.debugElement.queryAll(By.css(GRID_COL_THEAD_CLASS))[index];
    }


    public static getColumnHeaderTitleByIndex(fix: ComponentFixture<any>, index: number) {
        const nativeHeaders = fix.debugElement.queryAll(By.directive(IgxGridHeaderComponent))
            .map((header) => header.nativeElement);
        const sortedNativeHeaders = GridFunctions.sortNativeElementsHorizontally(nativeHeaders);
        return sortedNativeHeaders[index].querySelector('.igx-grid-th__title');
    }

    public static getFilterChipsForColumn(columnField: string, fix: ComponentFixture<any>) {
        const columnHeader = this.getColumnHeader(columnField, fix);
        return columnHeader.parent.queryAll(By.directive(IgxChipComponent));
    }

    public static getFilterOperandsForColumn(columnField: string, fix: ComponentFixture<any>) {
        const columnHeader = this.getColumnHeader(columnField, fix);
        return columnHeader.parent.queryAll(By.css('.' + FILTER_UI_CONNECTOR));
    }

    public static getFilterIndicatorForColumn(columnField: string, fix: ComponentFixture<any>): DebugElement[] {
        const columnHeader = this.getColumnHeader(columnField, fix);
        return columnHeader.parent.queryAll(By.css('.' + FILTER_UI_INDICATOR));
    }

    public static getFilterCellMoreIcon(columnField: string, fix: ComponentFixture<any>) {
        const filterCell = GridFunctions.getFilterCell(fix, columnField);
        const moreIcon = Array.from(filterCell.queryAll(By.css('igx-icon')))
            .find((ic: any) => ic.nativeElement.innerText === 'filter_list');
        return moreIcon;
    }

    public static getExcelFilteringHeaderIcons(fix: ComponentFixture<any>, menu = null) {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        const headerArea = excelMenu.querySelector('.igx-excel-filter__menu-header');
        return Array.from(headerArea.querySelectorAll('.igx-icon-button'));
    }

    public static getExcelFilteringHeaderIconsDebugElements(fix: ComponentFixture<any>, menu = null) {
        const headerArea = fix.debugElement.query(By.css('.igx-excel-filter__menu-header'));
        return Array.from(headerArea.queryAll(By.css('.igx-icon-button')));
    }

    public static getExcelFilteringPinContainer(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        const pinContainer = excelMenu.querySelector('.igx-excel-filter__actions-pin');
        const pinContainerDisabled = excelMenu.querySelector('.igx-excel-filter__actions-pin--disabled');
        return pinContainer ? pinContainer : pinContainerDisabled;
    }

    public static getExcelFilteringUnpinContainer(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector('.igx-excel-filter__actions-unpin');
    }

    public static getExcelFilteringPinComponent(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector('igx-excel-style-pinning');
    }

    public static getExcelFilteringHideContainer(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector('.igx-excel-filter__actions-hide');
    }

    public static getExcelFilteringHideComponent(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector('igx-excel-style-hiding');
    }

    public static getExcelFilteringHeaderComponent(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector('igx-excel-style-header');
    }

    public static getExcelFilteringSortComponent(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector('igx-excel-style-sorting');
    }

    public static getExcelFilteringMoveComponent(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector('igx-excel-style-moving');
    }

    public static getExcelFilteringColumnSelectionContainer(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector('.igx-excel-filter__actions-select') ||
            excelMenu.querySelector('.igx-excel-filter__actions-selected');
    }

    public static getExcelFilteringColumnSelectionComponent(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector('igx-excel-style-column-selecting');
    }

    public static getExcelFilteringClearFiltersComponent(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector('igx-excel-style-clear-filters');
    }

    public static getExcelFilteringConditionalFilterComponent(fix: ComponentFixture<any>, menu = null): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix);
        return excelMenu.querySelector('igx-excel-style-conditional-filter');
    }

    public static getExcelFilteringSearchComponent(fix: ComponentFixture<any>, menu = null, grid = 'igx-grid'): HTMLElement {
        const excelMenu = menu ? menu : GridFunctions.getExcelStyleFilteringComponent(fix, grid);
        return excelMenu.querySelector('igx-excel-style-search');
    }

    public static getExcelFilteringLoadingIndicator(fix: ComponentFixture<any>) {
        const searchComponent = GridFunctions.getExcelStyleSearchComponent(fix);
        const loadingIndicator = searchComponent.querySelector('.igx-excel-filter__loading');
        return loadingIndicator;
    }

    public static getColumnCells(fix, columnKey, gridCell = 'igx-grid-cell') {
        const allCells = fix.debugElement.queryAll(By.css(gridCell));
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
        return headerGroup.query(By.css(FILTER_UI_CELL));
    }

    public static getFilterConditionChip(fix, index) {
        const conditionChips = this.getAllFilterConditionChips(fix);

        return conditionChips[index];
    }

    public static getAllFilterConditionChips(fix) {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const conditionChips = GridFunctions.sortNativeElementsHorizontally(
            filterUIRow.queryAll(By.directive(IgxChipComponent)).map((ch) => ch.nativeElement));
        return conditionChips;
    }

    public static getFilterRowPrefix(fix): DebugElement {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const inputgroup = filterUIRow.query(By.css('igx-input-group'));
        return inputgroup.query(By.css('igx-prefix'));
    }

    public static getFilterRowSuffix(fix): DebugElement {
        const filterUIRow = fix.debugElement.query(By.css(FILTER_UI_ROW));
        const inputGroup = filterUIRow.query(By.css('igx-input-group'));
        return inputGroup.query(By.css('igx-suffix'));
    }

    public static getFilterRowInputCommitIcon(fix) {
        const suffix = GridFunctions.getFilterRowSuffix(fix);
        const commitIcon: any = Array.from(suffix.queryAll(By.css('igx-icon')))
            .find((icon: any) => icon.nativeElement.innerText === 'check');
        return commitIcon;
    }

    public static getFilterRowInputClearIcon(fix) {
        const suffix = GridFunctions.getFilterRowSuffix(fix);
        const clearIcon: any = Array.from(suffix.queryAll(By.css('igx-icon')))
            .find((icon: any) => icon.nativeElement.innerText === 'clear');
        return clearIcon;
    }

    public static getExcelStyleCustomFilteringDialog(fix: ComponentFixture<any>): HTMLElement {
        return fix.nativeElement.querySelector(ESF_CUSTOM_FILTER_DIALOG_CLASS);
    }

    public static getExcelCustomFilteringDefaultExpressions(fix: ComponentFixture<any>): HTMLElement[] {
        const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);
        const expressions = customFilterMenu.querySelectorAll(ESF_DEFAULT_EXPR);
        return GridFunctions.sortNativeElementsVertically(Array.from(expressions));
    }

    public static getExcelCustomFilteringDateExpressions(fix: ComponentFixture<any>) {
        const customFilterMenu = GridFunctions.getExcelStyleCustomFilteringDialog(fix);
        return GridFunctions.sortNativeElementsVertically(
            Array.from(customFilterMenu.querySelectorAll(ESF_DATE_EXPR)));
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

    public static getAdvancedFilteringComponent(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        let advFilterDialog = gridNativeElement.querySelector('.igx-advanced-filter');

        if (!advFilterDialog) {
            advFilterDialog = fix.nativeElement.querySelector('.igx-advanced-filter');
        }
        return advFilterDialog;
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

    public static getAdvancedFilteringOutlet(fix: ComponentFixture<any>) {
        const gridNativeElement = fix.debugElement.query(By.css('igx-grid')).nativeElement;
        let advFilteringDialog = gridNativeElement.querySelector('igx-advanced-filtering-dialog');

        if (!advFilteringDialog) {
            advFilteringDialog = fix.nativeElement.querySelector('igx-advanced-filtering-dialog');
        }
        const outlet = advFilteringDialog.querySelector('.igx-query-builder__outlet');
        return outlet;
    }

    public static setOperatorESF(fix: ComponentFixture<any>, expressionIndex: number, itemIndex: number) {
        const input: HTMLInputElement = GridFunctions.getExcelFilteringDDInput(fix, expressionIndex);
        input.click();
        fix.detectChanges();

        const operators = fix.nativeElement.querySelectorAll('.igx-drop-down__list-scroll')[expressionIndex + 1];
        const operator = operators.children[itemIndex].children[0];
        operator.click();
        tick();
        fix.detectChanges();
    }

    public static sortNativeElementsVertically(arr) {
        return arr.sort((a: HTMLElement, b: HTMLElement) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    }

    public static sortNativeElementsHorizontally(arr) {
        return arr.sort((a: HTMLElement, b: HTMLElement) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    }

    public static sortDebugElementsVertically(arr) {
        return arr.sort((a, b) => a.nativeElement.getBoundingClientRect().top - b.nativeElement.getBoundingClientRect().top);
    }

    public static sortDebugElementsHorizontally(arr) {
        return arr.sort((a, b) => a.nativeElement.getBoundingClientRect().left - b.nativeElement.getBoundingClientRect().left);
    }

    public static getRowEditingBannerRow(fix): HTMLElement {
        return fix.nativeElement.querySelector(BANNER_ROW_CLASS);
    }

    public static getRowEditingDebugElement(fix): DebugElement {
        return fix.debugElement.query(By.css(BANNER_ROW_CLASS));
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

    public static getRowEditingCancelDebugElement(fix): DebugElement {
        return GridFunctions.getRowEditingDebugElement(fix).queryAll(By.css('.igx-button--flat'))[0];
    }

    public static getRowEditingDoneDebugElement(fix): DebugElement {
        return GridFunctions.getRowEditingDebugElement(fix).queryAll(By.css('.igx-button--flat'))[1];
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

    public static getColGroupExpandIndicator(group): HTMLElement {
        return group.nativeElement.querySelector(GROUP_EXPANDER_CLASS);
    }

    public static getColumnGroupHeaderCell(columnField: string, fix: ComponentFixture<any>) {
        const headerTitle = fix.debugElement.queryAll(By.css(GROUP_HEADER_CLASS))
            .find(header => header.nativeElement.title === columnField);
        return headerTitle.parent;
    }

    public static getGridPaginator(by: IgxGridComponent | ComponentFixture<any>) {
        return by.nativeElement.querySelector(PAGER_CLASS);
    }

    public static getGridPageSelectElement(fix) {
        return fix.debugElement.query(By.css('igx-select')).nativeElement;
    }

    public static clickOnPaginatorButton(btn: DebugElement) {
        btn.triggerEventHandler('click', new Event('click'));
    }

    public static clickOnPageSelectElement(fix) {
        const select = GridFunctions.getGridPageSelectElement(fix);
        UIInteractions.simulateClickEvent(select);
    }

    public static verifyGroupIsExpanded(fixture, group, collapsible = true, isExpanded = true, indicatorText = ['expand_more', 'chevron_right']) {
        const groupHeader = GridFunctions.getColumnGroupHeaderCell(group.header, fixture);
        expect(group.collapsible).toEqual(collapsible);

        if (collapsible === false) {
            expect(GridFunctions.getColGroupExpandIndicator(groupHeader)).toBeNull();
        } else {
            expect(group.expanded).toEqual(isExpanded);
            const text = isExpanded ? indicatorText[0] : indicatorText[1];
            expect(GridFunctions.getColGroupExpandIndicator(groupHeader)).toBeDefined();
            expect(GridFunctions.getColGroupExpandIndicator(groupHeader).innerText.trim()).toEqual(text);
        }
    }

    public static clickGroupExpandIndicator(fixture, group) {
        const groupHeader = GridFunctions.getColumnGroupHeaderCell(group.header, fixture);
        const expandInd = GridFunctions.getColGroupExpandIndicator(groupHeader);
        expandInd.dispatchEvent(new Event('click', {}));
    }

    public static simulateGridContentKeydown(fix: ComponentFixture<any>, keyName: string,
        altKey = false, shiftKey = false, ctrlKey = false) {
        const gridContent = GridFunctions.getGridContent(fix);
        UIInteractions.triggerEventHandlerKeyDown(keyName, gridContent, altKey, shiftKey, ctrlKey);
    }

    public static getHeaderSortIcon(header: DebugElement): DebugElement {
        return header.query(By.css(SORT_ICON_CLASS))?.query(By.css('igx-icon'));
    }

    public static getHeaderFilterIcon(header: DebugElement): DebugElement {
        return header.query(By.css(FILTER_ICON_CLASS));
    }

    public static clickHeaderSortIcon(header: DebugElement) {
        const sortIcon = header.query(By.css(SORT_ICON_CLASS));
        sortIcon.triggerEventHandler('click', new Event('click'));
    }

    public static verifyHeaderSortIndicator(header: DebugElement, sortedAsc = true, sortedDesc = false, sortable = true) {
        const sortIcon = header.query(By.css(SORT_ICON_CLASS));
        if (sortable) {
            const sortIconText = sortedDesc ? SORTING_ICON_DESC_CONTENT : SORTING_ICON_ASC_CONTENT;
            expect(sortIcon.nativeElement.textContent.trim()).toEqual(sortIconText);
            expect(header.nativeElement.classList.contains(SORTED_COLUMN_CLASS)).toEqual(sortedAsc || sortedDesc);
        } else {
            expect(sortIcon).toBeNull();
        }
    }


    public static getDragIndicators(fix: ComponentFixture<any>): HTMLElement[] {
        return fix.nativeElement.querySelectorAll(DRAG_INDICATOR_CLASS);
    }

    public static isCellPinned(cell: CellType): boolean {
        return cell.nativeElement.classList.contains(CELL_PINNED_CLASS);
    }

    public static isHeaderPinned(header: DebugElement): boolean {
        return header.nativeElement.classList.contains(HEADER_PINNED_CLASS);
    }

    public static getColumnHidingElement(fix: ComponentFixture<any>): DebugElement {
        return fix.debugElement.query(By.directive(IgxColumnHidingDirective));
    }

    public static getColumnPinningElement(fix: ComponentFixture<any>): DebugElement {
        return fix.debugElement.query(By.directive(IgxColumnPinningDirective));
    }

    public static getColumnActionsColumnList(element: DebugElement): string[] {
        const labels = element.queryAll(By.css(`.${COLUMN_ACTIONS_COLUMNS_LABEL_CLASS}`));
        return labels.map(label => label.nativeElement.textContent.trim());
    }

    public static getColumnChooserTitle(columnChooserElement: DebugElement): DebugElement {
        return columnChooserElement.query(By.css('h4'));
    }

    public static getColumnHidingHeaderInput(columnChooserElement: DebugElement): DebugElement {
        return columnChooserElement.query(By.css(COLUMN_ACTIONS_INPUT_CLASS));
    }

    public static getColumnChooserFilterInput(columnChooserElement: DebugElement): DebugElement {
        return this.getColumnHidingHeaderInput(columnChooserElement).query(By.directive(IgxInputDirective));
    }

    public static getColumnChooserItems(columnChooserElement: DebugElement): DebugElement[] {
        return columnChooserElement.queryAll(By.css('igx-checkbox'));
    }

    public static getColumnChooserItemElement(columnChooserElement: DebugElement, name: string): DebugElement {
        const item = this.getColumnChooserItems(columnChooserElement).find((el) => el.nativeElement.outerText.includes(name));
        return item;
    }

    public static clickColumnChooserItem(columnChooserElement: DebugElement, name: string) {
        const item = this.getColumnChooserItemElement(columnChooserElement, name);
        item.triggerEventHandler('click', new Event('click'));
    }

    public static getColumnChooserItemInput(item: DebugElement): HTMLInputElement {
        return item.query(By.css('input')).nativeElement as HTMLInputElement;
    }

    public static getColumnChooserButton(columnChooserElement: DebugElement, name: string): DebugElement {
        const buttonElements = columnChooserElement.queryAll(By.css('button'));
        return buttonElements.find((el) => (el.nativeElement as HTMLButtonElement).textContent === name);
    }

    public static getColumnHidingColumnsContainer(columnChooserElement: DebugElement): DebugElement {
        return columnChooserElement.query(By.css(COLUMN_ACTIONS_COLUMNS_CLASS));
    }

    public static getColumnSortingIndex(columnHeader: DebugElement): number {
        let sortIndex = columnHeader.query(By.css(SORT_ICON_CLASS)).nativeElement.getAttribute(SORT_INDEX_ATTRIBUTE);
        sortIndex = parseInt(sortIndex?.trim(), 10);
        if (!isNaN(sortIndex)) {
            return sortIndex;
        }
        return null;
    }

    public static verifyLayoutHeadersAreAligned(grid: GridType, row: RowType, verifyPinnedCells?: boolean) {
        let firstRowCells = (row.cells as QueryList<CellType>).toArray();
        const headerCells = grid.headerCellList;

        if (verifyPinnedCells) {
            firstRowCells = firstRowCells
                .filter(c => c.nativeElement.className.indexOf('igx-grid__td--pinned') !== -1);
        }

        for (let i = 0; i < firstRowCells.length; i++) {
            const dataCell = firstRowCells[i];
            const headerCell = headerCells.find(h => h.column.index === dataCell.column.index);
            const widthDiff = headerCell?.nativeElement.clientWidth - dataCell?.nativeElement.clientWidth;
            const heightDiff = headerCell?.nativeElement.clientHeight - dataCell?.nativeElement.clientHeight;
            expect(widthDiff).toBeLessThanOrEqual(1);
            expect(heightDiff).toBeLessThanOrEqual(3);
        }
    }

    public static verifyDOMMatchesLayoutSettings(grid: GridType, row: RowType, colSettings) {
        const firstRowCells = (row.cells as QueryList<CellType>).toArray();
        const rowElem = row.nativeElement;
        const mrlBlocks = rowElem.querySelectorAll(`.${GRID_MRL_BLOCK}`);

        colSettings.forEach((groupSetting, index) => {
            // check group has rendered block
            const groupBlock = mrlBlocks[index] as any;
            const cellsFromBlock = firstRowCells.filter((cell) => cell.nativeElement.parentNode === groupBlock);
            expect(groupBlock).not.toBeNull();
            groupSetting.columns.forEach((col) => {
                const cell = cellsFromBlock.find(x => x.column.field == col.field) as any;
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
                expect(cellElem.getBoundingClientRect().width - expectedWidth).toBeLessThan(1);
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

    public static getHeaderResizeArea(header: DebugElement): DebugElement {
        return header.parent.query(By.css(RESIZE_AREA_CLASS));
    }

    public static getResizer(fix): DebugElement {
        return fix.debugElement.query(By.css(RESIZE_LINE_CLASS));
    }

    public static verifyCellValid(cell: IgxGridCellComponent, valid = true) {
        expect(cell.isInvalid).toEqual(!valid);
        expect(cell.nativeElement.classList.contains(CELL_INVALID_CSS_CLASS)).not.toEqual(valid);
    }
}
export class GridSummaryFunctions {
    public static getRootSummaryRow(fix): DebugElement {
        const footer = GridFunctions.getGridFooter(fix);
        return footer.query(By.css(SUMMARY_ROW));
    }

    public static calcMaxSummaryHeight(columnList, summaries: DebugElement[], defaultRowHeight) {
        let maxSummaryLength = 0;
        let index = 0;
        columnList.filter((col) => col.hasSummary).forEach(() => {
            const currentLength = summaries[index].queryAll(By.css(SUMMARY_LABEL_CLASS)).length;
            if (maxSummaryLength < currentLength) {
                maxSummaryLength = currentLength;
            }
            index++;
        });
        const expectedLength = maxSummaryLength * defaultRowHeight;
        return expectedLength;
    }

    public static getRootPinnedSummaryCells(fix): DebugElement[] {
        const rootSummaryRow = GridSummaryFunctions.getRootSummaryRow(fix);
        return rootSummaryRow.queryAll(By.css(`${SUMMARY_CELL}.${PINNED_SUMMARY}`));
    }

    public static verifyColumnSummariesBySummaryRowIndex(fix, rowIndex: number, summaryIndex: number, summaryLabels, summaryResults) {
        const summaryRow = rowIndex ? GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, rowIndex)
            : GridSummaryFunctions.getRootSummaryRow(fix);
        GridSummaryFunctions.verifyColumnSummaries(summaryRow, summaryIndex, summaryLabels, summaryResults);
    }

    public static verifyRowWithIndexIsOfType(grid, index: number, type: any) {
        expect(grid.getRowByIndex(index) instanceof type).toBe(true);
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
            rowIndexes.push(Number(summary.nativeElement.attributes['data-rowindex'].value));
        });
        return rowIndexes.sort((a: number, b: number) => a - b);
    }

    public static getAllVisibleSummaries(fix) {
        return fix.debugElement.queryAll(By.css(SUMMARY_ROW));
    }

    public static getAllVisibleSummariesSorted(fix: ComponentFixture<any>) {
        const summaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
        return summaries.sort((a, b) => a.nativeElement.getBoundingClientRect().top - b.nativeElement.getBoundingClientRect().top);
    }

    public static verifyVisibleSummariesHeight(fix, summariesRows, rowHeight = 36) {
        const visibleSummaries = GridSummaryFunctions.getAllVisibleSummaries(fix);
        visibleSummaries.forEach(summary => {
            expect(summary.nativeElement.getBoundingClientRect().height).toBeGreaterThanOrEqual(summariesRows * rowHeight - 1);
            expect(summary.nativeElement.getBoundingClientRect().height).toBeLessThanOrEqual(summariesRows * rowHeight + 1);
        });
    }

    public static verifySummaryCellActive(fix, row, cellIndex, active = true) {
        const summaryRow = typeof row === 'number' ?
            GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, row) : row;
        const summ = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, cellIndex);
        const hasClass = summ.nativeElement.classList.contains(SUMMARY_CELL_ACTIVE_CSS_CLASS);
        expect(hasClass === active).toBeTruthy();
    }

    public static focusSummaryCell(fix, row, cellIndex) {
        const summaryRow = typeof row === 'number' ?
            GridSummaryFunctions.getSummaryRowByDataRowIndex(fix, row) : row;
        const summaryCell = GridSummaryFunctions.getSummaryCellByVisibleIndex(summaryRow, cellIndex);
        UIInteractions.simulateClickAndSelectEvent(summaryCell);
        fix.detectChanges();
    }
}
export class GridSelectionFunctions {
    public static selectCellsRange =
        async (fix, startCell, endCell, ctrl = false, shift = false)  => {
            UIInteractions.simulatePointerOverElementEvent('pointerdown', startCell.nativeElement, shift, ctrl);
            fix.detectChanges();
            await wait();
            fix.detectChanges();

            UIInteractions.simulatePointerOverElementEvent('pointerenter', endCell.nativeElement, shift, ctrl);
            UIInteractions.simulatePointerOverElementEvent('pointerup', endCell.nativeElement, shift, ctrl);
            await wait();
            fix.detectChanges();
        };

    public static selectCellsRangeNoWait(fix, startCell, endCell, ctrl = false, shift = false) {
        UIInteractions.simulatePointerOverElementEvent('pointerdown', startCell.nativeElement, shift, ctrl);
        fix.detectChanges();

        UIInteractions.simulatePointerOverElementEvent('pointerenter', endCell.nativeElement, shift, ctrl);
        UIInteractions.simulatePointerOverElementEvent('pointerup', endCell.nativeElement, shift, ctrl);
        fix.detectChanges();
    }

    public static selectCellsRangeWithShiftKey =
        async (fix, startCell, endCell) => {
            UIInteractions.simulateClickAndSelectEvent(startCell);
            await wait();
            fix.detectChanges();

            UIInteractions.simulateClickAndSelectEvent(endCell, true);
            await wait();
            fix.detectChanges();
        };

    public static selectCellsRangeWithShiftKeyNoWait(fix, startCell, endCell) {
        UIInteractions.simulateClickAndSelectEvent(startCell);
        fix.detectChanges();

        UIInteractions.simulateClickAndSelectEvent(endCell, true);
        fix.detectChanges();
    }

    public static verifyCellsRegionSelected(grid, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, selected = true) {
        const startRow = startRowIndex < endRowIndex ? startRowIndex : endRowIndex;
        const endRow = startRowIndex < endRowIndex ? endRowIndex : startRowIndex;
        const startCol = startColumnIndex < endColumnIndex ? startColumnIndex : endColumnIndex;
        const endCol = startColumnIndex < endColumnIndex ? endColumnIndex : startColumnIndex;
        for (let i = startCol; i <= endCol; i++) {
            for (let j = startRow; j <= endRow; j++) {
                const cell = grid.gridAPI.get_cell_by_index(j, grid.columns.find(col => col.visibleIndex === i).field);
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

    public static verifyCellSelected(cell: IgxGridCellComponent | CellType, selected = true) {
        expect(cell.selected).toBe(selected);
        expect(cell.nativeElement.classList.contains(CELL_SELECTED_CSS_CLASS)).toBe(selected);
    }

    public static verifyCellActive(cell, active = true) {
        expect(cell.active).toBe(active);
        expect(cell.nativeElement.classList.contains(CELL_ACTIVE_CSS_CLASS)).toBe(active);
    }

    // Check the grid selected cell and cell in in the selected function
    public static verifyGridCellSelected(fix, cell: CellType) {
        const selectedCellFromGrid = cell.grid.selectedCells[0];
        const selectedCell = fix.componentInstance.selectedCell;
        expect(cell.selected).toBe(true);
        expect(selectedCell.value).toEqual(cell.value);
        expect(selectedCell.column.field).toMatch(cell.column.field);
        expect(selectedCell.row.index).toEqual(cell.row.index);
        expect(selectedCellFromGrid.value).toEqual(cell.value);
        expect(selectedCellFromGrid.column.field).toMatch(cell.column.field);
        expect(selectedCellFromGrid.row.index).toEqual(cell.row.index);
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

    public static getHeaderRows(fix): HTMLElement[] {
        return fix.nativeElement.querySelectorAll(HEADER_ROW_CSS_CLASS);
    }

    public static verifyGroupByRowCheckboxState(groupByRow, checked = false, indeterminate = false, disabled = false) {
        const groupByRowCheckboxElement = GridSelectionFunctions.getRowCheckboxInput(groupByRow.element.nativeElement);
        expect(groupByRowCheckboxElement.checked).toBe(checked);
        expect(groupByRowCheckboxElement.indeterminate).toBe(indeterminate);
        expect(groupByRowCheckboxElement.disabled).toBe(disabled);
    }

    public static verifyHeaderRowCheckboxState(parent, checked = false, indeterminate = false) {
        const header = GridSelectionFunctions.getHeaderRow(parent);
        const headerCheckboxElement = GridSelectionFunctions.getRowCheckboxInput(header);
        expect(headerCheckboxElement.checked).toBe(checked);
        expect(headerCheckboxElement.indeterminate).toBe(indeterminate);
    }

    public static verifySelectionCheckBoxesAlignment(grid) {
        const headerDiv = GridSelectionFunctions.getRowCheckboxDiv(GridSelectionFunctions.getHeaderRow(grid));
        const firstRowDiv = GridSelectionFunctions.getRowCheckboxDiv(grid.dataRowList.first.nativeElement);
        if (grid.groupingExpressions && grid.groupingExpressions.length > 0) {
            const groupByRowDiv = GridSelectionFunctions.getRowCheckboxDiv(grid.groupsRowList.first.nativeElement);
            expect(groupByRowDiv.offsetWidth).toEqual(firstRowDiv.offsetWidth);
            expect(groupByRowDiv.offsetLeft).toEqual(firstRowDiv.offsetLeft);
        }
        const hScrollbar = grid.headerContainer.getScroll();

        expect(headerDiv.clientWidth).toEqual(firstRowDiv.clientWidth);
        expect(headerDiv.clientWidth).toEqual(firstRowDiv.clientWidth);
        if (hScrollbar.scrollWidth) {
            expect(hScrollbar.offsetLeft).toEqual(firstRowDiv.offsetWidth + firstRowDiv.offsetLeft);
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

    public static verifyRowCheckboxIsNotFocused(rowDOM: HTMLElement, focused = false) {
        const rowCheckbox: HTMLElement = GridSelectionFunctions.getRowCheckbox(rowDOM);
        expect(rowCheckbox.classList.contains(FOCUSED_CHECKBOX_CLASS)).toEqual(focused);
    }

    public static verifyHeaderRowHasCheckbox(parent, hasCheckbox = true, hasCheckboxDiv = true) {
        GridSelectionFunctions.verifyRowHasCheckbox(GridSelectionFunctions.getHeaderRow(parent), hasCheckbox, hasCheckboxDiv, true);
    }

    public static getRowCheckboxDiv(rowDOM): HTMLElement {
        return rowDOM.querySelector(`.${ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS}`);
    }

    /**
     * Returns if the specified element looks like a selection checkbox based on specific class affix
     *
     * @param element The element to check
     * @param modifier The modifier to the base class
     */
    public static isCheckbox(element: HTMLElement, modifier?: string): boolean {
        return element.classList.contains(`${ROW_DIV_SELECTION_CHECKBOX_CSS_CLASS}${modifier || ''}`);
    }

    public static getRowCheckboxInput(rowDOM): HTMLInputElement {
        return GridSelectionFunctions.getRowCheckboxDiv(rowDOM).querySelector(CHECKBOX_INPUT_CSS_CLASS);
    }

    public static getRowCheckbox(rowDOM): HTMLElement {
        return GridSelectionFunctions.getRowCheckboxDiv(rowDOM).querySelector(CHECKBOX_ELEMENT);
    }

    public static getCheckboxes(fix: ComponentFixture<any>): HTMLElement[] {
        return fix.nativeElement.querySelectorAll(CHECKBOX_ELEMENT);
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
        (document.getElementsByClassName(ICON_CSS_CLASS)[rowNumber] as any).click();
    }

    public static verifyColumnSelected(column: IgxColumnComponent, selected = true) {
        expect(column.selected).toEqual(selected);
        if (!column.hidden) {
            expect(column.headerCell.nativeElement.classList.contains(SELECTED_COLUMN_CLASS)).toEqual(selected);
        }
    }

    public static verifyColumnsSelected(columns: IgxColumnComponent[], selected = true) {
        columns.forEach(c => this.verifyColumnSelected(c, selected));
    }

    public static verifyColumnGroupSelected(fixture: ComponentFixture<any>, column: IgxColumnGroupComponent, selected = true) {
        expect(column.selected).toEqual(selected);
        const header = GridFunctions.getColumnGroupHeaderCell(column.header, fixture);
        expect(header.nativeElement.classList.contains(SELECTED_COLUMN_CLASS)).toEqual(selected);
    }

    public static verifyColumnHeaderHasSelectableClass(header: DebugElement, hovered = true) {
        expect(header.nativeElement.classList.contains(HOVERED_COLUMN_CLASS)).toEqual(hovered);
    }

    public static verifyColumnsHeadersHasSelectableClass(headers: DebugElement[], hovered = true) {
        headers.forEach(header => this.verifyColumnHeaderHasSelectableClass(header, hovered));
    }

    public static verifyColumnAndCellsSelected(column: IgxColumnComponent, selected = true) {
        this.verifyColumnSelected(column, selected);
        column._cells.forEach(cell => {
            expect(cell.nativeElement.classList.contains(SELECTED_COLUMN_CELL_CLASS)).toEqual(selected);
        });
    }

    public static clickOnColumnToSelect(column: IgxColumnComponent, ctrlKey = false, shiftKey = false) {
        const event = {
            shiftKey,
            ctrlKey,
            stopPropagation: () => { }
        };

        column.headerCell.onClick(event as any);
    }
}
