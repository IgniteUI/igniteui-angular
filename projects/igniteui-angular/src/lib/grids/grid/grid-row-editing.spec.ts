import {DebugElement} from '@angular/core';
import { async, TestBed, fakeAsync, tick, flush, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxGridAPIService } from './grid-api.service';
import { IgxGridComponent } from './grid.component';
import { IGridEditEventArgs } from '../grid-base.component';
import { IgxColumnComponent } from '../column.component';
import { IgxGridModule} from './index';
import { DisplayDensity } from '../../core/displayDensity';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { IgxStringFilteringOperand, IgxNumberFilteringOperand } from '../../data-operations/filtering-condition';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxGridCellComponent } from '../cell.component';
import { TransactionType, Transaction, IgxTransactionService } from '../../services';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { setupGridScrollDetection, resizeObserverIgnoreError } from '../../test-utils/helper-utils.spec';
import { IgxGridRowEditingComponent,
    IgxGridRowEditingTransactionComponent,
    IgxGridWithEditingAndFeaturesComponent,
    IgxGridRowEditingWithoutEditableColumnsComponent,
    IgxGridTestComponent,
    IgxGridCustomOverlayComponent,
    IgxGridRowEditingWithFeaturesComponent} from './grid.component.spec';

const CELL_CLASS = '.igx-grid__td';
const BANNER = 'igx-banner';
const BANNER_TEXT = 'igx-banner__text';
const EDIT_OVERLAY_CONTENT = 'igx-overlay__content';
const COLUMN_HEADER_GROUP_CLASS = '.igx-grid__thead-item';
const DEBOUNCETIME = 30;

fdescribe('IgxGrid - Row Editing', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridRowEditingComponent,
                IgxGridRowEditingTransactionComponent,
                IgxGridWithEditingAndFeaturesComponent,
                IgxGridRowEditingWithoutEditableColumnsComponent,
                IgxGridTestComponent,
                IgxGridCustomOverlayComponent,
                IgxGridRowEditingWithFeaturesComponent
            ],
            imports: [
                NoopAnimationsModule, IgxGridModule]
        }).compileComponents();
    }));

    describe('General tests', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridRowEditingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should throw a warning when [rowEditable] is set on a grid w/o [primaryKey]', fakeAsync(() => {
            grid.primaryKey = null;
            grid.rowEditable = false;
            tick(16);
            fix.detectChanges();

            spyOn(console, 'warn');
            grid.rowEditable = true;
            fix.detectChanges();
            tick(16);
            // Throws warinig but still sets the property correctly
            expect(grid.rowEditable).toBeTruthy();

            const cell = grid.getCellByColumn(2, 'ProductName');
            spyOn(grid, 'openRowOverlay');
            cell.nativeElement.dispatchEvent(new Event('dblclick'));
            tick(16);
            fix.detectChanges();
            expect(console.warn).toHaveBeenCalledWith('The grid must have a `primaryKey` specified when using `rowEditable`!');
            expect(console.warn).toHaveBeenCalledTimes(1);
            // Still calls openRowOverlay, just logs the warning
            expect(grid.openRowOverlay).toHaveBeenCalled();
        }));

        it('Should be able to enter edit mode on dblclick, enter and f2', fakeAsync(() => {
            const cellElement = grid.getCellByColumn(0, 'ReorderLevel').nativeElement;
            const row = grid.getRowByIndex(0);

            cellElement.dispatchEvent(new Event('focus'));
            flush();
            fix.detectChanges();

            cellElement.dispatchEvent(new Event('dblclick'));
            flush();
            fix.detectChanges();
            expect(row.inEditMode).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('escape', cellElement, true);
            flush();
            fix.detectChanges();
            expect(row.inEditMode).toBe(false);

            UIInteractions.triggerKeyDownEvtUponElem('enter', cellElement, true);
            flush();
            fix.detectChanges();
            expect(row.inEditMode).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('escape', cellElement, true);
            flush();
            fix.detectChanges();
            expect(row.inEditMode).toBe(false);

            UIInteractions.triggerKeyDownEvtUponElem('f2', cellElement, true);
            flush();
            fix.detectChanges();
            expect(row.inEditMode).toBe(true);

            UIInteractions.triggerKeyDownEvtUponElem('enter', cellElement, true);
            flush();
            fix.detectChanges();
            expect(row.inEditMode).toBe(false);
        }));

        it('Emit all events with proper arguments', fakeAsync(() => {
            spyOn(grid.onCellEditEnter, 'emit').and.callThrough();
            spyOn(grid.onCellEdit, 'emit').and.callThrough();
            spyOn(grid.onCellEditCancel, 'emit').and.callThrough();
            spyOn(grid.onRowEditEnter, 'emit').and.callThrough();
            spyOn(grid.onRowEdit, 'emit').and.callThrough();
            spyOn(grid.onRowEditCancel, 'emit').and.callThrough();

            const row = grid.getRowByIndex(0);
            const cell = grid.getCellByColumn(0, 'ProductName');
            const cellDom = cell.nativeElement;
            let cellInput = null;

            cellDom.dispatchEvent(new Event('focus'));
            fix.detectChanges();
            tick(16);

            cellDom.dispatchEvent(new Event('dblclick'));
            flush();
            fix.detectChanges();
            expect(row.inEditMode).toBe(true);

            let cellArgs: IGridEditEventArgs = { cellID: cell.cellID, rowID: cell.row.rowID, oldValue: cell.value, cancel: false };
            let rowArgs: IGridEditEventArgs = { rowID: row.rowID, oldValue: row.rowData, cancel: false };
            expect(grid.onCellEditEnter.emit).toHaveBeenCalledWith(cellArgs);
            expect(grid.onRowEditEnter.emit).toHaveBeenCalledWith(rowArgs);

            UIInteractions.triggerKeyDownEvtUponElem('escape', cellDom, true);
            fix.detectChanges();
            flush();

            expect(row.inEditMode).toBe(false);
            cellArgs = { cellID: cell.cellID, rowID: cell.row.rowID, oldValue: cell.value, newValue: cell.value, cancel: false };
            // no change, new value is null
            rowArgs = { rowID: row.rowID, oldValue: row.rowData, newValue: null, cancel: false };
            expect(grid.onCellEditCancel.emit).toHaveBeenCalledWith(cellArgs);
            expect(grid.onRowEditCancel.emit).toHaveBeenCalledWith(rowArgs);

            cellDom.dispatchEvent(new Event('dblclick'));
            fix.detectChanges();
            flush();
            expect(row.inEditMode).toBe(true);

            const newCellValue = 'Aaaaa';
            cellInput = cellDom.querySelector('[igxinput]');
            cellInput.value = newCellValue;
            cellInput.dispatchEvent(new Event('input'));
            flush();
            fix.detectChanges();

            cellArgs = { cellID: cell.cellID, rowID: cell.row.rowID, oldValue: cell.value, newValue: newCellValue, cancel: false };
            rowArgs = {
                rowID: row.rowID, oldValue: row.rowData,
                newValue: Object.assign({}, row.rowData, { ProductName: newCellValue }), cancel: false
            };
            UIInteractions.triggerKeyDownEvtUponElem('enter', cellDom, true);
            flush();
            fix.detectChanges();

            expect(grid.onCellEdit.emit).toHaveBeenCalledWith(cellArgs);
            expect(grid.onRowEdit.emit).toHaveBeenCalledWith(rowArgs);
        }));

        it('Should display the banner below the edited row if it is not the last one', fakeAsync(() => {
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            const editRow = cell.row.nativeElement;
            const banner = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;
            tick(16);
            fix.detectChanges();

            const bannerTop = banner.getBoundingClientRect().top;
            const editRowBottom = editRow.getBoundingClientRect().bottom;

            // The banner appears below the row
            expect(bannerTop).toBeGreaterThanOrEqual(editRowBottom);

            // No much space between the row and the banner
            expect(bannerTop - editRowBottom).toBeLessThan(2);
        }));

        it('Should display the banner after the edited row if it is the last one, but has room underneath it', fakeAsync(() => {
            const lastItemIndex = 6;
            const cell = grid.getCellByColumn(lastItemIndex, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            const editRow = cell.row.nativeElement;
            const banner = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;
            fix.detectChanges();

            const bannerTop = banner.getBoundingClientRect().top;
            const editRowBottom = editRow.getBoundingClientRect().bottom;

            // The banner appears below the row
            expect(bannerTop).toBeGreaterThanOrEqual(editRowBottom);

            // No much space between the row and the banner
            expect(bannerTop - editRowBottom).toBeLessThan(2);
        }));

        it('Should display the banner above the edited row if it is the last one', fakeAsync(() => {
            const cell = grid.getCellByColumn(grid.data.length - 1, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            const editRow = cell.row.nativeElement;
            const banner = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;
            fix.detectChanges();

            const bannerBottom = banner.getBoundingClientRect().bottom;
            const editRowTop = editRow.getBoundingClientRect().top;

            // The banner appears above the row
            expect(bannerBottom).toBeLessThanOrEqual(editRowTop);

            // No much space between the row and the banner
            expect(editRowTop - bannerBottom).toBeLessThan(2);
        }));

        it(`Should preserve updated value inside the cell when it enters edit mode again`,  fakeAsync( () => {
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            cell.update('IG');
            tick(16);
            fix.detectChanges();
            cell.setEditMode(false);
            tick(16);

            cell.setEditMode(true);
            tick(16);
            expect(cell.value).toEqual('IG');
        }));

        it(`Should correctly get column.editable for grid with no transactions`, fakeAsync(() => {
            grid.columnList.forEach(c => {
                c.editable = true;
            });

            const primaryKeyColumn = grid.columnList.find(c => c.field === grid.primaryKey);
            const nonPrimaryKeyColumn = grid.columnList.find(c => c.field !== grid.primaryKey);
            expect(primaryKeyColumn).toBeDefined();
            expect(nonPrimaryKeyColumn).toBeDefined();

            grid.rowEditable = false;
            expect(primaryKeyColumn.editable).toBeTruthy();
            expect(nonPrimaryKeyColumn.editable).toBeTruthy();

            grid.rowEditable = true;
            expect(primaryKeyColumn.editable).toBeFalsy();
            expect(nonPrimaryKeyColumn.editable).toBeTruthy();
        }));

        it('Should properly exit pending state when committing row edit w/o changes', fakeAsync(() => {
            const initialDataLength = grid.data.length;
            const productNameCell = fix.debugElement.queryAll(By.css(CELL_CLASS))[2];
            const enterEvent = { key: 'enter', stopPropagation: () => {}, preventDefault: () => {} };
            productNameCell.triggerEventHandler('keydown', enterEvent);
            tick(16);
            fix.detectChanges();
            expect(grid.getCellByKey(1, 'ProductName').editMode).toBeTruthy();
            productNameCell.triggerEventHandler('keydown', enterEvent);
            tick(16);
            fix.detectChanges();
            expect(grid.getCellByKey(1, 'ProductName').editMode).toBeFalsy();
            grid.deleteRow(2);
            tick(16);
            fix.detectChanges();
            expect(grid.data.length).toEqual(initialDataLength - 1);
        }));

        it('Overlay position: Open overlay for top row', fakeAsync(() => {
            grid.height = '300px';
            fix.detectChanges();
            tick(16);

            let row: HTMLElement = grid.getRowByIndex(0).nativeElement;
            let cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);

            let overlayContent: HTMLElement = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;
            expect(row.getBoundingClientRect().bottom === overlayContent.getBoundingClientRect().top).toBeTruthy();
            cell.setEditMode(false);
            tick(16);

            row = grid.getRowByIndex(2).nativeElement;
            cell = grid.getCellByColumn(2, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            overlayContent = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;
            expect(row.getBoundingClientRect().bottom === overlayContent.getBoundingClientRect().top).toBeTruthy();
            cell.setEditMode(false);
            tick(16);

            row = grid.getRowByIndex(3).nativeElement;
            cell = grid.getCellByColumn(3, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            overlayContent = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;
            expect(row.getBoundingClientRect().top === overlayContent.getBoundingClientRect().bottom).toBeTruthy();
            cell.setEditMode(false);
            tick(16);

            row = grid.getRowByIndex(0).nativeElement;
            cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            overlayContent = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;
            expect(row.getBoundingClientRect().bottom === overlayContent.getBoundingClientRect().top).toBeTruthy();
            cell.setEditMode(false);
            tick(16);
        }));
    });

    describe('Navigation - Keyboard', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fix.detectChanges();

            grid = fix.componentInstance.grid;
            setupGridScrollDetection(fix, grid);
        }));

        it(`Should jump from first editable columns to overlay buttons`, (async () => {
            const targetCell = fix.componentInstance.getCell(0, 'Downloads');
            targetCell.nativeElement.focus();
            fix.detectChanges();
            targetCell.onKeydownEnterEditMode();
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            // TO button
            fix.componentInstance.moveNext(true);
            fix.detectChanges();
            const rowEditingBannerElement = fix.debugElement.query(By.css('.igx-banner__row')).nativeElement;
            const doneButtonElement = rowEditingBannerElement.lastElementChild;
            expect(document.activeElement).toEqual(doneButtonElement);

            // FROM button to last cell
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'tab',
                code: 'tab',
                shiftKey: false
            }));
            fix.detectChanges();
            await wait(DEBOUNCETIME * 2);
            expect(fix.componentInstance.getCurrentEditCell().column.field).toEqual('Downloads');
            //  active element could be the input too, so next expect is not always true
            // expect(document.activeElement).toEqual(lastCellElement);
        }));

        it(`Should jump from last editable columns to overlay buttons`, (async () => {
            grid.parentVirtDir.getHorizontalScroll().scrollLeft = grid.parentVirtDir.getHorizontalScroll().clientWidth;
            await wait(DEBOUNCETIME);
            const targetCell = fix.componentInstance.getCell(0, 'Test');
            targetCell.nativeElement.focus();
            fix.detectChanges();
            targetCell.onKeydownEnterEditMode();
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            // TO button
            fix.componentInstance.moveNext(false);
            fix.detectChanges();
            const rowEditingBannerElement = fix.debugElement.query(By.css('.igx-banner__row')).nativeElement;
            const cancelButtonElement = rowEditingBannerElement.firstElementChild;
            expect(document.activeElement).toEqual(cancelButtonElement);

            // FROM button to last cell
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'tab',
                code: 'tab',
                shiftKey: true
            }));
            fix.detectChanges();
            await wait(DEBOUNCETIME * 2);
            expect(fix.componentInstance.getCurrentEditCell().column.field).toEqual('Test');
            //  active element could be the input too, so next expect is not always true
            // expect(document.activeElement).toEqual(lastCellElement);
        }));

        it(`Should scroll editable column into view when navigating from buttons`, (async () => {
            let currentEditCell: IgxGridCellComponent;
            const targetCell = fix.componentInstance.focusGridCell(0, 'Downloads');
            fix.detectChanges();
            grid.parentVirtDir.getHorizontalScroll().scrollLeft = 0;
            await wait(300);

            targetCell.onKeydownEnterEditMode();
            fix.detectChanges();
            fix.componentInstance.moveNext(true);
            fix.detectChanges();
            await wait(300);

            // go to 'Cancel'
            const bannerRowElement = fix.debugElement.query(By.css('.igx-banner__row')).nativeElement;
            const cancelButtonElement = bannerRowElement.firstElementChild;
            cancelButtonElement.focus();
            // (<HTMLElement>document.activeElement.previousElementSibling).focus();
            fix.detectChanges();
            await wait(300);

            // go to LAST editable cell
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', code: 'tab', shiftKey: true }));
            fix.detectChanges();
            await wait(300);

            currentEditCell = fix.componentInstance.getCurrentEditCell();
            expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBeGreaterThan(0);
            expect(currentEditCell.column.field).toEqual('Test');

            // move to Cancel
            fix.componentInstance.moveNext(false);
            fix.detectChanges();
            await wait(300);

            // move to DONE
            const applyButtonElement = bannerRowElement.lastElementChild;
            applyButtonElement.focus();
            fix.detectChanges();
            await wait(300);

            // move to FIRST editable cell
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'tab', code: 'tab', shiftKey: false }));
            fix.detectChanges();
            await wait(300);

            currentEditCell = fix.componentInstance.getCurrentEditCell();
            expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toEqual(0);
            expect(currentEditCell.column.field).toEqual('Downloads');
        }));

        it(`Should skip non-editable columns`, fakeAsync(() => {
            const targetCell = fix.componentInstance.focusGridCell(0, 'Downloads');
            fix.detectChanges();
            targetCell.onKeydownEnterEditMode();
            fix.detectChanges();
            tick(16);
            const navSpyR = spyOn((<any>grid).navigation, 'moveNextEditable').and.callThrough();
            const navSpyL = spyOn((<any>grid).navigation, 'movePreviousEditable').and.callThrough();
            // Move forwards
            fix.componentInstance.moveNext(false);
            tick(16);
            fix.detectChanges();
            expect(navSpyR).toHaveBeenCalledTimes(1);
            const newCell = (<any>grid).gridAPI.get_cell_inEditMode();
            expect(newCell.id.columnID).toEqual(targetCell.columnIndex + 3);
            expect(newCell.column.editable).toEqual(true);
            // Move backwards
            fix.componentInstance.moveNext(true);
            tick(16);
            fix.detectChanges();
            expect(navSpyL).toHaveBeenCalledTimes(1);
            expect((<any>grid).gridAPI.get_cell_inEditMode().id.columnID).toEqual(targetCell.columnIndex);
            expect((<any>grid).gridAPI.get_cell_inEditMode().column.editable).toEqual(true);

        }));

        it(`Should skip non-editable columns when column pinning is enabled`, fakeAsync(() => {
            let targetCell: IgxGridCellComponent;
            let editedCell: IgxGridCellComponent;
            fix.componentInstance.pinnedFlag = true;
            fix.detectChanges();
            tick(16);

            // from pinned to pinned
            targetCell = fix.componentInstance.focusGridCell(0, 'Downloads');
            targetCell.onKeydownEnterEditMode();
            fix.detectChanges();
            fix.componentInstance.moveNext(false);
            tick(16);
            fix.detectChanges();
            // EXPECT focused cell to be 'Released'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.editMode).toEqual(true);
            // from pinned to unpinned
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(false);
            tick(16);
            fix.detectChanges();
            // EXPECT focused cell to be 'ReleaseDate'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('ReleaseDate');
            expect(editedCell.editMode).toEqual(true);
            // from unpinned to pinned
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(true);
            tick(16);
            fix.detectChanges();
            // EXPECT edited cell to be 'Released'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.editMode).toEqual(true);
        }));

        it(`Should skip non-editable columns when column hiding is enabled`, fakeAsync(() => {
            let targetCell: IgxGridCellComponent;
            let editedCell: IgxGridCellComponent;
            fix.componentInstance.hiddenFlag = true;
            fix.detectChanges();
            tick(16);
            // jump over 3 hidden, both editable and not
            targetCell = fix.componentInstance.focusGridCell(0, 'Downloads');
            targetCell.onKeydownEnterEditMode();
            fix.detectChanges();
            fix.componentInstance.moveNext(false);
            tick(16);
            fix.detectChanges();
            // EXPECT focused cell to be 'Released'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.editMode).toEqual(true);
            // jump over 1 hidden, editable
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(false);
            tick(16);
            fix.detectChanges();
            // EXPECT focused cell to be 'Items'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Items');
            expect(editedCell.editMode).toEqual(true);
            // jump over 1 hidden, editable
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(true);
            tick(16);
            fix.detectChanges();
            // EXPECT edited cell to be 'Released'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.editMode).toEqual(true);
            // jump over 3 hidden, both editable and not
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(true);
            tick(16);
            fix.detectChanges();
            // EXPECT edited cell to be 'Downloads'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Downloads');
            expect(editedCell.editMode).toEqual(true);
        }));

        it(`Should skip non-editable columns when column pinning & hiding is enabled`, () => {
            let targetCell: IgxGridCellComponent;
            let editedCell: IgxGridCellComponent;
            fix.componentInstance.hiddenFlag = true;
            fix.detectChanges();
            fix.componentInstance.pinnedFlag = true;
            fix.detectChanges();
            // jump over 1 hidden, pinned
            targetCell = fix.componentInstance.focusGridCell(0, 'Downloads');
            fix.detectChanges();
            targetCell.onKeydownEnterEditMode();
            fix.detectChanges();
            fix.componentInstance.moveNext(false);
            // tick(16);
            fix.detectChanges();
            // EXPECT focused cell to be 'Released'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.editMode).toEqual(true);
            // jump from pinned to unpinned
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(false);
            // tick(16);
            fix.detectChanges();
            // EXPECT focused cell to be 'Items'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Items');
            expect(editedCell.editMode).toEqual(true);
            // jump back to pinned
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(true);
            // tick(16);
            fix.detectChanges();
            // EXPECT edited cell to be 'Released'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.editMode).toEqual(true);
            // jump over 1 hidden, pinned
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(true);
            // tick(16);
            fix.detectChanges();
            // EXPECT edited cell to be 'Downloads'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Downloads');
            expect(editedCell.editMode).toEqual(true);
        });

        it(`Should skip non-editable columns when column grouping is enabled`, (async () => {
            let targetCell: IgxGridCellComponent;
            let editedCell: IgxGridCellComponent;
            fix.componentInstance.columnGroupingFlag = true;
            fix.detectChanges();
            targetCell = fix.componentInstance.focusGridCell(0, 'ReleaseDate');
            targetCell.onKeydownEnterEditMode();
            fix.detectChanges();
            fix.componentInstance.moveNext(false);
            fix.detectChanges();
            // Should disregards the Igx-Column-Group component
            // EXPECT focused cell to be 'Released'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.editMode).toEqual(true);
            // Go forwards, jump over Category and group end
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(false);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            // EXPECT focused cell to be 'Items'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Items');
            expect(editedCell.editMode).toEqual(true);
            // Go backwards, jump over group end and return to 'Released'
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(true);
            fix.detectChanges();
            // EXPECT focused cell to be 'Released'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.editMode).toEqual(true);
            await wait(DEBOUNCETIME);
            // Go to release date
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(true);
            fix.detectChanges();
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('ReleaseDate');
            expect(editedCell.editMode).toEqual(true);
        }));

        it(`Should skip non-editable columns when all column features are enabled`, fakeAsync(() => {
            let targetCell: IgxGridCellComponent;
            let editedCell: IgxGridCellComponent;
            fix.componentInstance.hiddenFlag = true;
            fix.componentInstance.pinnedFlag = true;
            fix.componentInstance.columnGroupingFlag = true;
            fix.detectChanges();
            targetCell = fix.componentInstance.focusGridCell(0, 'Downloads');
            targetCell.onKeydownEnterEditMode();
            fix.detectChanges();
            fix.componentInstance.moveNext(false);
            tick(16);
            fix.detectChanges();
            // Move from Downloads over hidden to Released in Column Group
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.editMode).toEqual(true);
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(false);
            tick(16);
            fix.detectChanges();
            // Move from pinned 'Released' (in Column Group) to unpinned 'Items'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Items');
            expect(editedCell.editMode).toEqual(true);
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(true);
            tick(16);
            fix.detectChanges();
            // Move back to pinned 'Released' (in Column Group)
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Released');
            expect(editedCell.editMode).toEqual(true);
            editedCell.nativeElement.focus();
            fix.detectChanges();
            fix.componentInstance.moveNext(true);
            tick(16);
            fix.detectChanges();
            // Move back to pinned 'Downloads'
            editedCell = fix.componentInstance.getCurrentEditCell();
            expect(editedCell.column.field).toEqual('Downloads');
            expect(editedCell.editMode).toEqual(true);
        }));

        it(`Should update row changes when focus overlay buttons on tabbing`, (async() => {
            let currentEditCell: IgxGridCellComponent;
            const targetCell = fix.componentInstance.focusGridCell(0, 'Downloads');
            fix.detectChanges();
            await wait();

            // go to first editable cell
            UIInteractions.triggerKeyDownEvtUponElem('Enter', targetCell.nativeElement, true);
            fix.detectChanges();
            await wait();

            // change first editable cell value
            targetCell.editValue = '500';
            fix.detectChanges();
            await wait();

            // go to Done
            fix.componentInstance.moveNext(true);
            fix.detectChanges();
            await wait();

            let overlayText = document.getElementsByClassName(BANNER_TEXT)[0] as HTMLElement;
            expect(overlayText.textContent.trim()).toBe('You have 1 changes in this row');

            // focus Cancel
            const bannerRowElement = fix.debugElement.query(By.css('.igx-banner__row')).nativeElement;
            const cancelButtonElement = bannerRowElement.firstElementChild;
            cancelButtonElement.focus();
            fix.detectChanges();
            await wait();

            // go to last editable cell
            UIInteractions.triggerKeyDownWithBlur('tab', document.activeElement, true, false, true);
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            currentEditCell = fix.componentInstance.getCurrentEditCell();
            expect(grid.parentVirtDir.getHorizontalScroll().scrollLeft).toBeGreaterThan(0);
            expect(currentEditCell.column.field).toEqual('Test');

            // change last editable cell value
            targetCell.editValue = 'No test';
            fix.detectChanges();
            await wait();

            // move to Cancel
            fix.componentInstance.moveNext(false);
            fix.detectChanges();
            await wait();

            overlayText = document.getElementsByClassName(BANNER_TEXT)[0] as HTMLElement;
            expect(overlayText.textContent.trim()).toBe('You have 2 changes in this row');
        }));

        it(`Should focus last edited cell after click on editable buttons`, (async () => {
            const targetCell = fix.componentInstance.getCell(0, 'Downloads');
            targetCell.nativeElement.focus();
            fix.detectChanges();
            targetCell.onKeydownEnterEditMode();
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            // Scroll the grid
            grid.parentVirtDir.getHorizontalScroll().scrollLeft = grid.parentVirtDir.getHorizontalScroll().clientWidth;
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            // Focus done button
            const rowEditingBannerElement = fix.debugElement.query(By.css('.igx-banner__row')).nativeElement;
            const doneButtonElement = rowEditingBannerElement.lastElementChild;
            doneButtonElement.focus();
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            expect(document.activeElement).toEqual(doneButtonElement);
            doneButtonElement.click();
            fix.detectChanges();
            await wait(DEBOUNCETIME);

            expect(document.activeElement).toEqual(targetCell.nativeElement);
        }));
    });

    describe('Exit row editing', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridRowEditingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it(`Should call correct methods on clicking DONE and CANCEL buttons in row edit overlay`, fakeAsync(() => {
            spyOn(grid, 'endEdit');

            // put cell in edit mode
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            fix.detectChanges();

            //  ged DONE button and click it
            const rowEditingBannerElement = fix.debugElement.query(By.css('.igx-banner__row')).nativeElement;
            const doneButtonElement = rowEditingBannerElement.lastElementChild;
            doneButtonElement.click();
            expect(grid.endEdit).toHaveBeenCalled();

            cell.setEditMode(true);
            tick(16);
            fix.detectChanges();

            //  ged CANCEL button and click it
            const cancelButtonElement = rowEditingBannerElement.firstElementChild;
            cancelButtonElement.click();
            expect(grid.endEdit).toHaveBeenCalled();
        }));

        it(`Should exit row editing AND COMMIT on clicking the DONE button in row edit overlay`, fakeAsync(() => {
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);

            // 'click' on Done button
            grid.endEdit(true);
            tick(16);
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            // expect(gridAPI.escape_editMode).toHaveBeenCalled();
            // expect(gridAPI.escape_editMode).toHaveBeenCalledWith({ rowID: 1, columnID: 2, rowIndex: 0 });
            expect(cell.editMode).toBeFalsy();
        }));

        it(`Should exit row editing AND COMMIT on add row`, fakeAsync(() => {
            spyOn(grid, 'endEdit').and.callThrough();
            // spyOn(gridAPI, 'escape_editMode').and.callThrough();

            // put cell in edit mode
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);

            grid.addRow({ ProductID: 99, ProductName: 'ADDED', InStock: true, UnitsInStock: 20000, OrderDate: new Date('2018-03-01') });
            tick(16);
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            // expect(gridAPI.escape_editMode).toHaveBeenCalled();
            // expect(gridAPI.escape_editMode).toHaveBeenCalledWith({ rowID: 1, columnID: 2, rowIndex: 0 });
            expect(cell.editMode).toBeFalsy();
        }));

        it(`Should exit row editing AND COMMIT on delete row`, fakeAsync(() => {
            spyOn(grid, 'endEdit').and.callThrough();
            // spyOn(gridAPI, 'escape_editMode').and.callThrough();

            // put cell in edit mode
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            fix.detectChanges();
            grid.deleteRow(grid.getRowByIndex(2).rowID);
            fix.detectChanges();

            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            // expect(gridAPI.escape_editMode).toHaveBeenCalled();
            // expect(gridAPI.escape_editMode).toHaveBeenCalledWith({ rowID: 1, columnID: 2, rowIndex: 0 });
            expect(cell.editMode).toBeFalsy();
        }));

        it(`Should exit row editing AND DISCARD on filter`, fakeAsync(() => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;

            spyOn(gridAPI, 'submit_value').and.callThrough();
            spyOn(gridAPI, 'escape_editMode').and.callThrough();

            // put cell in edit mode
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);

            grid.filter('ProductName', 'a', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            expect(gridAPI.submit_value).toHaveBeenCalled();
            expect(gridAPI.submit_value).toHaveBeenCalledWith();
            expect(gridAPI.escape_editMode).toHaveBeenCalled();
            expect(gridAPI.escape_editMode).toHaveBeenCalledWith();
            expect(cell.editMode).toBeFalsy();
        }));

        it(`Should exit row editing AND DISCARD on sort`, fakeAsync(() => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;
            spyOn(grid, 'endEdit').and.callThrough();
            spyOn(gridAPI, 'submit_value').and.callThrough();
            spyOn(gridAPI, 'escape_editMode').and.callThrough();

            // put cell in edit mode
            let cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);

            cell.update('New Name');
            grid.sort({
                fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            tick(16);
            fix.detectChanges();

            cell = grid.getCellByColumn(0, 'ProductName');
            expect(cell.editMode).toBe(false);
            expect(cell.value).toBe('Chai'); // SORT does not submit

            expect(gridAPI.escape_editMode).toHaveBeenCalled();
            expect(gridAPI.escape_editMode).toHaveBeenCalledWith();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(false);
        }));

        it(`Should exit row editing AND COMMIT on displayDensity change`, fakeAsync(() => {
            grid.displayDensity = DisplayDensity.comfortable;
            fix.detectChanges();
            tick(DEBOUNCETIME);

            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            fix.detectChanges();
            tick(DEBOUNCETIME);

            let overlayContent: HTMLElement = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;
            expect(overlayContent).toBeTruthy();
            expect(cell.editMode).toBeTruthy();

            grid.displayDensity = DisplayDensity.cosy;
            fix.detectChanges();
            tick(DEBOUNCETIME);

            overlayContent = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;
            expect(overlayContent).toBeFalsy();
            expect(cell.editMode).toBeFalsy();
        }));

        it(`Should NOT exit row editing on click on non-editable cell in same row`, fakeAsync(() => {
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            fix.detectChanges();
            const nonEditableCell = grid.getCellByColumn(0, 'ProductID');
            nonEditableCell.onFocus(new FocusEvent('focus'));
            fix.detectChanges();
            expect(grid.endEdit).not.toHaveBeenCalled();
            expect(cell.editMode).toEqual(true);
        }));

        it(`Should exit row editing AND COMMIT on click on non-editable cell in other row`, fakeAsync(() => {
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            fix.detectChanges();
            const nonEditableCell = grid.getCellByColumn(2, 'ProductID');
            nonEditableCell.onFocus(new FocusEvent('focus'));
            fix.detectChanges();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            // expect(gridAPI.escape_editMode).toHaveBeenCalled();
            // expect(gridAPI.escape_editMode).toHaveBeenCalledWith({ rowID: 1, columnID: 2, rowIndex: 0 });
            expect(cell.editMode).toBeFalsy();
        }));

        it(`Should exit row editing AND COMMIT on click on editable cell in other row`, fakeAsync(() => {
            spyOn(grid, 'endEdit').and.callThrough();
            // spyOn(gridAPI, 'escape_editMode').and.callThrough();

            // put cell in edit mode
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            fix.detectChanges();
            tick(16);
            const otherEditableCell = grid.getCellByColumn(2, 'ProductName');
            otherEditableCell.onFocus(new FocusEvent('focus'));
            fix.detectChanges();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            // expect(gridAPI.escape_editMode).toHaveBeenCalled();
            // expect(gridAPI.escape_editMode).toHaveBeenCalledWith({ rowID: 1, columnID: 2, rowIndex: 0 });
            expect(cell.editMode).toBeFalsy();
            expect(otherEditableCell.editMode).toBeTruthy();
        }));

        it(`Should exit row editing AND COMMIT on ENTER KEYDOWN`, fakeAsync(() => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;

            const targetCell = grid.getCellByColumn(0, 'ProductName');
            targetCell.setEditMode(true);
            tick(16);

            spyOn(gridAPI, 'submit_value').and.callThrough();
            spyOn(gridAPI, 'escape_editMode').and.callThrough();

            targetCell.dispatchEvent(new KeyboardEvent('keydown', {
                code: 'enter',
                key: 'enter'
            }));

            expect(gridAPI.submit_value).toHaveBeenCalled();
            expect(gridAPI.escape_editMode).toHaveBeenCalled();
            expect(targetCell.editMode).toBeFalsy();
        }));

        it(`Should exit row editing AND DISCARD on clicking the CANCEL button in row edit overlay`, fakeAsync(() => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;

            const targetCell = grid.getCellByColumn(0, 'ProductName');
            targetCell.setEditMode(true);
            tick(16);

            spyOn(gridAPI, 'submit_value').and.callThrough();
            spyOn(gridAPI, 'escape_editMode').and.callThrough();

            // get the cancel button and click it
            const rowEditingBannerElement = fix.debugElement.query(By.css('.igx-banner__row')).nativeElement;
            const cancelButtonElement = rowEditingBannerElement.firstElementChild;
            cancelButtonElement.click();

            // submit_value is called to exit edit mode of cell
            expect(gridAPI.submit_value).not.toHaveBeenCalled();
            expect(gridAPI.escape_editMode).toHaveBeenCalled();
        }));

        it(`Should exit row editing AND DISCARD on ESC KEYDOWN`, fakeAsync(() => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;

            const targetCell = grid.getCellByColumn(0, 'ProductName');
            targetCell.setEditMode(true);
            tick(16);

            spyOn(gridAPI, 'submit_value').and.callThrough();
            spyOn(gridAPI, 'escape_editMode').and.callThrough();

            targetCell.dispatchEvent(new KeyboardEvent('keydown', {
                code: 'escape',
                key: 'escape'
            }));

            expect(gridAPI.submit_value).not.toHaveBeenCalled();
            expect(gridAPI.escape_editMode).toHaveBeenCalled();
        }));

        it(`Should exit edit mode when edited row is being deleted`, fakeAsync(() => {
            const row = grid.getRowByIndex(0);
            const targetCell = grid.getCellByColumn(0, 'ProductName');
            spyOn(grid, 'endEdit').and.callThrough();
            targetCell.setEditMode(true);
            flush();
            fix.detectChanges();
            expect(grid.rowEditingOverlay.collapsed).toBeFalsy();
            row.delete();
            flush();
            fix.detectChanges();
            expect(grid.rowEditingOverlay.collapsed).toBeTruthy();
            expect(grid.endEdit).toHaveBeenCalledTimes(1);
            expect(grid.endEdit).toHaveBeenCalledWith(true);
        }));
    });

    describe('Integration', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridRowEditingComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it(`Paging: Should preserve the changes after page navigation`, fakeAsync(() => {
            grid.paging = true;
            grid.perPage = 7;
            fix.detectChanges();
            tick(16);

            const gridElement: HTMLElement = grid.nativeElement;
            const cell = grid.getCellByColumn(0, 'ProductName');
            const rowEl: HTMLElement = grid.getRowByIndex(0).nativeElement;
            const pagingButtons = gridElement.querySelectorAll('.igx-grid-paginator__pager > button');

            expect(rowEl.classList).not.toContain('igx-grid__tr--edited');

            cell.setEditMode(true);
            tick(16);
            cell.update('IG');
            cell.setEditMode(false);
            fix.detectChanges();
            tick(16);

            // Next page button click
            pagingButtons[2].dispatchEvent(new Event('click'));
            fix.detectChanges();
            expect(grid.page).toEqual(1);
            expect(cell.value).toBe('Tofu');

            // Previous page button click
            pagingButtons[1].dispatchEvent(new Event('click'));
            fix.detectChanges();
            expect(cell.value).toBe('IG');
        }));

        it(`Paging: Should save changes when changing page while editing`, fakeAsync(() => {
            grid.paging = true;
            grid.perPage = 7;
            fix.detectChanges();
            tick(16);

            const gridElement: HTMLElement = grid.nativeElement;
            const cell = grid.getCellByColumn(0, 'ProductName');
            const pagingButtons = gridElement.querySelectorAll('.igx-grid-paginator__pager > button');

            cell.setEditMode(true);
            cell.update('IG');
            tick(16);
            // Do not exit edit mode

            // Next page button click
            pagingButtons[2].dispatchEvent(new Event('click'));
            tick(16);
            fix.detectChanges();
            expect(grid.page).toEqual(1);
            expect(cell.value).toBe('Tofu');

            // Previous page button click
            pagingButtons[1].dispatchEvent(new Event('click'));
            tick(16);
            fix.detectChanges();

            expect(cell.editMode).toBeFalsy();
            expect(cell.value).toBe('IG');
        }));

        it(`Paging: Should exit edit mode when changing the page size while editing`, fakeAsync(() => {
            grid.paging = true;
            grid.perPage = 7;
            fix.detectChanges();
            tick(16);

            const cell = grid.getCellByColumn(0, 'ProductName');
            const select = fix.debugElement.query(By.css('igx-select')).nativeElement;

            cell.setEditMode(true);
            // cell.update('IG');
            // cell.update exits edit mode of the CELL
            // Do not exit edit mode
            tick(16);
            fix.detectChanges();
            let rowEditingBannerElement = document.getElementsByClassName(BANNER);
            let overlayContent: HTMLElement = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;

            expect(overlayContent).toBeTruthy();
            expect(rowEditingBannerElement).toBeTruthy();
            // Change page size
            select.click();
            fix.detectChanges();
            const selectList = fix.debugElement.query(By.css('.igx-drop-down__list--select'));
            selectList.children[2].nativeElement.click();
            tick(16);
            fix.detectChanges();
            // refresh collections
            rowEditingBannerElement = document.getElementsByClassName(BANNER);
            overlayContent = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;

            expect(cell.editMode).toEqual(false);
            expect(overlayContent).toBeFalsy();
            // Element is still there in the grid template, but is hidden
            expect(rowEditingBannerElement[0].parentElement.attributes['aria-hidden']).toBeTruthy();
        }));

        it(`Paging: Should exit edit mode when changing the page size resulting in the edited cell going to the next page`,
         fakeAsync(() => {
            grid.paging = true;
            grid.perPage = 7;
            fix.detectChanges();
            tick(16);

            const gridElement: HTMLElement = grid.nativeElement;
            let cell = grid.getCellByColumn(3, 'ProductName');
            const select = fix.debugElement.query(By.css('igx-select')).nativeElement;
            const pagingButtons = gridElement.querySelectorAll('.igx-grid-paginator__pager > button');

            cell.setEditMode(true);
            tick(16);
            (<any>grid).gridAPI.get_cell_inEditMode().editValue = 'IG';
            // cell.update('IG');
            // Do not exit edit mode
            fix.detectChanges();
            let rowEditingBannerElement: HTMLElement = document.getElementsByClassName(BANNER)[0] as HTMLElement;
            let overlayContent: HTMLElement = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;
            expect(overlayContent).toBeTruthy();
            expect(rowEditingBannerElement).toBeTruthy();

            // Change page size
            select.click();
            fix.detectChanges();
            const selectList = fix.debugElement.query(By.css('.igx-drop-down__list--select'));
            selectList.children[0].nativeElement.click();
            tick(16);
            fix.detectChanges();

            // Next page button click
            pagingButtons[2].dispatchEvent(new Event('click'));
            tick(16);
            fix.detectChanges();

            expect(grid.page).toEqual(1);
            cell = grid.getCellByColumn(1, 'ProductName');

            fix.detectChanges();
            // Refresh collection / banner
            rowEditingBannerElement = document.getElementsByClassName(BANNER)[0] as HTMLElement;
            overlayContent = document.getElementsByClassName(EDIT_OVERLAY_CONTENT)[0] as HTMLElement;
            expect(cell.editMode).toEqual(false);
            expect(overlayContent).toBeFalsy();
            expect(rowEditingBannerElement).toBeTruthy(); // banner is still present in grid template, just not visible
        }));

        it(`Filtering: Should exit edit mode on filter applied`, fakeAsync(() => {
            const targetColumnName = 'ProductName';
            const keyword = 'bob';
            spyOn(grid, 'endEdit').and.callThrough();

            const targetCell = grid.getCellByColumn(0, targetColumnName);
            targetCell.setEditMode(true);
            flush();

            // search if the targeted column contains the keyword, ignoring case
            grid.filter(targetColumnName, keyword, IgxStringFilteringOperand.instance().condition('contains'), false);
            flush();
            fix.detectChanges();

            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(false);
        }));

        it(`Filtering: Should NOT include the new value in the results when filtering`, fakeAsync(() => {
            const targetColumnName = 'ProductName';
            const newValue = 'My Awesome Product';
            const targetCell = grid.getCellByColumn(0, targetColumnName);
            targetCell.setEditMode(true);
            tick(16);
            targetCell.update(newValue);
            fix.detectChanges();

            // loop over the grid's data to see if any cell contains the new value
            const editedCell = grid.data.filter(el => el.ProductName === newValue);

            // a cell with the updated value is NOT found (filter does NOT submit)
            expect(editedCell.length).toEqual(0);
        }));

        it(`Filtering: Should preserve the cell's data if it has been modified while being filtered out`, fakeAsync(() => {
            // Steps:
            // 1) Filter by any value
            // 2) Edit any of the filtered rows so that the row is removed from the filtered columns
            // 3) Remove filtering
            // 4) Verify the update is preserved

            const targetColumnName = 'ProductName';
            const keyword = 'ch';
            const newValue = 'My Awesome Product';
            let targetCell = grid.getCellByColumn(0, targetColumnName);

            // search if the targeted column contains the keyword, ignoring case
            grid.filter(targetColumnName, keyword, IgxStringFilteringOperand.instance().condition('contains'), true);
            tick(16);

            fix.detectChanges();
            targetCell.update(newValue);
            tick(16);

            // remove filtering
            targetCell = grid.getCellByColumn(0, targetColumnName);
            grid.clearFilter();
            tick(16);
            fix.detectChanges();
            expect(targetCell.value).toEqual(newValue);
        }));

        it(`GroupBy: Should exit edit mode when Grouping`, fakeAsync(() => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;

            spyOn(gridAPI, 'submit_value').and.callThrough();
            spyOn(gridAPI, 'escape_editMode').and.callThrough();

            const targetCell = grid.getCellByColumn(0, 'OrderDate');
            targetCell.setEditMode(true);
            tick(16);

            grid.groupBy({
                fieldName: 'OrderDate', dir: SortingDirection.Desc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });

            expect(gridAPI.escape_editMode).toHaveBeenCalled();
            expect(gridAPI.submit_value).toHaveBeenCalled();
        }));

        it(`Sorting: Should NOT include the new value in the results when sorting`, fakeAsync(() => {
            const newValue = 'Don Juan De Marco';
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            cell.update(newValue);

            grid.sort({
                fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            tick(16);
            fix.detectChanges();

            // loop over the grid's data to see if any cell contains the new value
            const editedCell = grid.data.filter(el => el.ProductName === newValue);

            // a cell with the updated value is found
            // sorting DOES NOT submit
            expect(editedCell.length).toEqual(0);
        }));

        it(`Sorting: Editing a sorted row`, fakeAsync(() => {
            // Sort any column
            grid.sort({
                fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            tick(16);
            fix.detectChanges();

            // Edit any of the sorted rows so that the row position is changed
            let cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            // Cell will always be first
            cell.update('AAAAAAAAAAA Don Juan De Marco');
            cell.setEditMode(false);
            tick(16);
            fix.detectChanges();

            cell = grid.getCellByColumn(0, 'ProductName');
            expect(cell.value).toBe('AAAAAAAAAAA Don Juan De Marco');
        }));

        xit(`Summaries: Should update summaries after row editing completes`, () => {
            // TO DO: FIX
            // Enable Summaries
            // Check row + column value
            // Open row edit
            // Edit row valuie
            // SUBMIT ?
            // Check summaries are updated
            const newDate = new Date('01/01/1901');
            grid.enableSummaries('OrderDate');
            const targetCell = grid.getCellByColumn(0, 'OrderDate');

            targetCell.setEditMode(true);
            // Bind to cell editor template value
            (<any>grid).gridAPI.get_cell_inEditMode().value = newDate;
            // targetCell.update(newDate);
            fix.detectChanges();

            // get the summaries for a particular column
            const summaries = targetCell.gridAPI.get_summary_data();
            // const earliestDate = summaries.get('OrderDate')[1].summaryResult.toLocaleDateString();

            // expect(earliestDate).toEqual(newDate);
            // grid.disableSummaries('OrderDate');
        });

        it(`Moving: Should exit edit mode when moving a column`, fakeAsync(() => {
            const column = grid.columnList.filter(c => c.field === 'ProductName')[0];
            const targetColumn = grid.columnList.filter(c => c.field === 'ProductID')[0];
            column.movable = true;
            tick(16);
            fix.detectChanges();

            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);

            expect(cell.editMode).toEqual(true);
            expect(grid.rowEditingOverlay.collapsed).toEqual(false);
            grid.moveColumn(column, targetColumn);
            tick(16);
            fix.detectChanges();

            expect(cell.editMode).toBeFalsy();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            expect(grid.rowEditingOverlay.collapsed).toEqual(true);
        }));

        it(`Pinning: Should exit edit mode when pinning/unpinning a column`, fakeAsync(() => {
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            let cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            grid.pinColumn('ProductName');
            tick(16);
            fix.detectChanges();

            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            expect(grid.endEdit).toHaveBeenCalledTimes(1);
            expect(cell.editMode).toBeFalsy();

            // put cell in edit mode
            cell = grid.getCellByColumn(2, 'ProductName');
            cell.setEditMode(true);
            tick(16);

            grid.unpinColumn('ProductName');
            tick(16);
            fix.detectChanges();

            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            expect(grid.endEdit).toHaveBeenCalledTimes(2);
            expect(cell.editMode).toBeFalsy();
        }));

        it(`Resizing: Should exit edit mode when resizing a column`, fakeAsync(() => {
            spyOn(grid, 'endEdit').and.callThrough();

            // put cell in edit mode
            const cell = grid.getCellByColumn(3, 'ProductName');
            cell.setEditMode(true);

            const column = grid.columnList.filter(c => c.field === 'ProductName')[0];
            column.resizable = true;
            fix.detectChanges();

            const headers: DebugElement[] = fix.debugElement.queryAll(By.css(COLUMN_HEADER_GROUP_CLASS));
            const headerResArea = headers[2].children[1].nativeElement;
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 500, 0);
            tick(200);
            const resizer = fix.debugElement.queryAll(By.css('.igx-grid__th-resize-line'))[0].nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, 550, 0);
            UIInteractions.simulateMouseEvent('mouseup', resizer, 550, 0);
            fix.detectChanges();

            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledWith(true);
            expect(cell.editMode).toBeFalsy();
        }));

        it(`Hiding: Should exit edit mode when hiding a column`, fakeAsync(() => {
            const gridAPI: IgxGridAPIService = (<any>grid).gridAPI;

            const targetCell = grid.getCellByColumn(0, 'ProductName'); // Cell must be editable
            targetCell.setEditMode(true);
            tick(16);
            fix.detectChanges();
            expect(gridAPI.get_cell_inEditMode()).toBeTruthy(); // check if there is cell in edit mode
            spyOn(gridAPI, 'escape_editMode').and.callThrough();

            targetCell.column.hidden = true;
            tick(16);
            fix.detectChanges();

            expect(gridAPI.escape_editMode).toHaveBeenCalled();
        }));

        it('Hiding: Should close the row editing overlay on column hiding', fakeAsync(() => {
            const targetCell = grid.getCellByColumn(0, 'ProductName');
            targetCell.setEditMode(true);
            tick(16);
            targetCell.column.hidden = true;
            fix.detectChanges();
            expect(grid.rowEditingOverlay.collapsed).toBeTruthy();
        }));

        it(`Hiding: Should show the updated value when showing the column again`, fakeAsync(() => {
grid.showToolbar = true;
grid.columnHiding = true;
tick(16);
fix.detectChanges();

            const targetCbText = 'Product Name';
            const targetCell = grid.getCellByColumn(0, 'ProductName');
            targetCell.setEditMode(true);
            tick(16);
            targetCell.update('Tea');

            // hide column
            grid.toolbar.columnHidingButton.nativeElement.click();
            tick(16);
            const overlay = fix.debugElement.query(By.css('.igx-column-hiding__columns'));
            const checkboxes = overlay.queryAll(By.css('.igx-checkbox__label'));
            const targetCheckbox = checkboxes.find(el => el.nativeElement.innerText.trim() === targetCbText);
            targetCheckbox.nativeElement.click();
            tick(16);
            // show column
            targetCheckbox.nativeElement.click();
            tick(16);
            grid.toolbar.toggleColumnHidingUI();
            tick(16);

            expect(targetCell.value).toEqual('Chai');
        }));

        xit(`Hiding: Should be possible to update a cell that is hidden programmatically`, () => { // This is NOT possible
            const targetCbText = 'Product Name';
            const newValue = 'Tea';
            const targetCell = grid.getCellByColumn(0, 'ProductName');
            targetCell.setEditMode(true);
            targetCell.column.hidden = true;

            targetCell.update(newValue);

            // show column
            grid.toolbar.columnHidingButton.nativeElement.click();
            const overlay = fix.debugElement.query(By.css('.igx-column-hiding__columns'));
            const checkboxes = overlay.queryAll(By.css('.igx-checkbox__label'));
            const targetCheckbox = checkboxes.find(el => el.nativeElement.innerText.trim() === targetCbText);
            targetCheckbox.nativeElement.click();

            fix.detectChanges();

            expect(targetCell.value).toEqual(newValue);
        });
    });

    describe('Events', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridWithEditingAndFeaturesComponent);
            fix.detectChanges();
            fix.componentInstance.pinnedFlag = true;
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        xit(`Should properly emit 'onRowEditDone' event - Button Click`, fakeAsync(() => {
            fix.detectChanges();
            const component = fix.componentInstance;
            const initialRow = grid.getRowByKey(0);
            const initialData = Object.assign({}, initialRow.rowData);
            let targetCell: IgxGridCellComponent;
            spyOn(grid.onRowEditCancel, 'emit');
            spyOn(grid.onRowEdit, 'emit');
            targetCell = fix.componentInstance.focusGridCell(0, 'Downloads');
            targetCell.setEditMode(true);
            tick(16);
            component.cellInEditMode.editValue = 1337;
            fix.detectChanges();
            // On button click
            fix.debugElement.queryAll(By.css('.igx-button--flat'))[1].nativeElement.click();
            expect(grid.onRowEdit.emit).toHaveBeenCalled();
            expect(grid.onRowEdit.emit).toHaveBeenCalledWith({
                newValue: Object.assign({}, initialData, { Downloads: 1337 }),
                oldValue: initialData,
                row: initialRow,
            });
            fix.destroy();
        }));

        xit(`Should properly emit 'onRowEditCancel' event - Button Click`, fakeAsync(() => {
            const component = fix.componentInstance;
            const initialRow = grid.getRowByKey(0);
            const initialData = Object.assign({}, initialRow.rowData);
            let targetCell: IgxGridCellComponent;
            spyOn(grid.onRowEditCancel, 'emit');
            spyOn(grid.onRowEdit, 'emit');
            targetCell = fix.componentInstance.focusGridCell(0, 'Downloads');
            targetCell.setEditMode(true);
            tick(16);
            component.cellInEditMode.editValue = 1337;
            fix.detectChanges();
            // On button click
            fix.debugElement.queryAll(By.css('.igx-button--flat'))[0].nativeElement.click();
            expect(grid.onRowEditCancel.emit).toHaveBeenCalled();
            expect(grid.onRowEditCancel.emit).toHaveBeenCalledWith({
                newValue: Object.assign({}, initialData, { Downloads: 1337 }),
                oldValue: initialRow.rowData,
                row: initialRow,
            });
            fix.destroy();
        }));

        xit(`Should properly emit 'onRowEditDone' event - Filtering`, fakeAsync(() => {
            const component = fix.componentInstance;
            const initialRow = grid.getRowByKey(0);
            const initalData = Object.assign({}, initialRow.rowData);
            let targetCell: IgxGridCellComponent;
            spyOn(grid.onRowEdit, 'emit');
            targetCell = fix.componentInstance.focusGridCell(0, 'Downloads');
            targetCell.setEditMode(true);
            tick(16);
            component.cellInEditMode.editValue = 1337;
            fix.detectChanges();
            // On filter
            grid.filter('Downloads', 1330, IgxNumberFilteringOperand.instance().condition('greaterThan'), true);
            fix.detectChanges();
            expect(grid.onRowEdit.emit).toHaveBeenCalled();
            expect(grid.onRowEdit.emit).toHaveBeenCalledWith({
                newValue: Object.assign({}, initalData, { Downloads: 1337 }),
                oldValue: initalData,
                row: initialRow,
            });
            fix.destroy();
        }));

        xit(`Should properly emit 'onRowEditDone' event - Sorting`, fakeAsync(() => {
            const component = fix.componentInstance;
            const initialRow = grid.getRowByKey(0);
            const initialData = Object.assign({}, initialRow.rowData);
            let targetCell: IgxGridCellComponent;
            spyOn(grid.onRowEdit, 'emit');
            targetCell = fix.componentInstance.focusGridCell(0, 'Downloads');
            targetCell.setEditMode(true);
            tick(16);
            component.cellInEditMode.editValue = 1337;
            fix.detectChanges();
            // On sort
            grid.sort({
                fieldName: 'ProductName', dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();
            expect(grid.onRowEdit.emit).toHaveBeenCalled();
            expect(grid.onRowEdit.emit).toHaveBeenCalledWith({
                newValue: Object.assign({}, initialData, { Downloads: 1337 }),
                oldValue: initialData,
                row: initialRow,
            });
            fix.destroy();
        }));
    });

    describe('Column editable property', () => {
        it('Default column editable value is correct, when row editing is enabled', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridRowEditingWithoutEditableColumnsComponent);
            fix.detectChanges();
            tick();

            const grid = fix.componentInstance.grid;

            let columns: IgxColumnComponent[] = grid.columnList.toArray();
            expect(columns[0].editable).toBeTruthy(); // column.editable not set
            expect(columns[1].editable).toBeFalsy(); // column.editable not set. Primary column
            expect(columns[2].editable).toBeTruthy(); // column.editable set to true
            expect(columns[3].editable).toBeTruthy(); // column.editable not set
            expect(columns[4].editable).toBeFalsy();  // column.editable set to false

            grid.rowEditable = false;
            columns = grid.columnList.toArray();
            expect(columns[0].editable).toBeFalsy(); // column.editable not set
            expect(columns[1].editable).toBeFalsy(); // column.editable not set. Primary column
            expect(columns[2].editable).toBeTruthy(); // column.editable set to true
            expect(columns[3].editable).toBeFalsy(); // column.editable not set
            expect(columns[4].editable).toBeFalsy();  // column.editable set to false

            grid.rowEditable = true;
            columns = grid.columnList.toArray();
            expect(columns[0].editable).toBeTruthy(); // column.editable not set
            expect(columns[1].editable).toBeFalsy(); // column.editable not set. Primary column
            expect(columns[2].editable).toBeTruthy(); // column.editable set to true
            expect(columns[3].editable).toBeTruthy(); // column.editable not set
            expect(columns[4].editable).toBeFalsy();  // column.editable set to false
        }));

        it(`Default column editable value is correct, when row edititng is disabled`, fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridTestComponent);
            fix.componentInstance.columns.push({ field: 'ID', header: 'ID', dataType: 'number', width: null, hasSummary: false });
            fix.componentInstance.data = [
                { ID: 0, index: 0, value: 0},
                { ID: 1, index: 1, value: 1},
                { ID: 2, index: 2, value: 2},
            ];
            const grid = fix.componentInstance.grid;
            grid.primaryKey = 'ID';

            fix.detectChanges();
            tick();

            let columns: IgxColumnComponent[] = grid.columnList.toArray();
            expect(columns[0].editable).toBeFalsy(); // column.editable not set
            expect(columns[1].editable).toBeFalsy(); // column.editable not set
            expect(columns[2].editable).toBeFalsy(); // column.editable not set. Primary column

            grid.rowEditable = true;
            columns = grid.columnList.toArray();
            expect(columns[0].editable).toBeTruthy(); // column.editable not set
            expect(columns[1].editable).toBeTruthy(); // column.editable not set
            expect(columns[2].editable).toBeFalsy();  // column.editable not set. Primary column
        }));
    });

    describe('Custom overlay', () => {
        it('Custom overlay', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridCustomOverlayComponent);
            fix.detectChanges();
            tick(16);

            const grid = fix.componentInstance.grid;
            let cell = grid.getCellByColumn(0, 'ProductName');
            spyOn(grid, 'endEdit').and.callThrough();
            cell.setEditMode(true);
            tick(16);
            fix.detectChanges();

            let overlayText: HTMLElement = document.getElementsByClassName(BANNER_TEXT)[0] as HTMLElement;
            expect(parseInt(overlayText.textContent, 10)).toEqual(0);
            fix.componentInstance.cellInEditMode.editValue = 'Spiro';
            fix.componentInstance.moveNext(true);
            tick(16);
            fix.detectChanges();

            cell = grid.getCellByColumn(0, 'ReorderLevel');
            overlayText = document.getElementsByClassName(BANNER_TEXT)[0] as HTMLElement;
            expect(parseInt(overlayText.textContent, 10)).toEqual(1);

            fix.componentInstance.buttons.last.element.nativeElement.click();
            expect(grid.endEdit).toHaveBeenCalled();
            expect(grid.endEdit).toHaveBeenCalledTimes(1);
        }));
    });

    describe('Transaction', () => {
        let fix;
        let grid: IgxGridComponent;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridRowEditingTransactionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should add correct class to the edited row', fakeAsync(() => {
            const cell = grid.getCellByColumn(0, 'ProductName');
            const row: HTMLElement = grid.getRowByIndex(0).nativeElement;
            expect(row.classList).not.toContain('igx-grid__tr--edited');

            cell.setEditMode(true);
            fix.detectChanges();
            tick();

            cell.editValue = 'IG';
            grid.endEdit(true);
            fix.detectChanges();
            tick();

            expect(row.classList).toContain('igx-grid__tr--edited');
        }));

        it(`Should correctly get column.editable for grid with transactions`, fakeAsync(() => {
            grid.columnList.forEach(c => {
                c.editable = true;
            });

            const primaryKeyColumn = grid.columnList.find(c => c.field === grid.primaryKey);
            const nonPrimaryKeyColumn = grid.columnList.find(c => c.field !== grid.primaryKey);
            expect(primaryKeyColumn).toBeDefined();
            expect(nonPrimaryKeyColumn).toBeDefined();

            grid.rowEditable = false;
            expect(primaryKeyColumn.editable).toBeFalsy();
            expect(nonPrimaryKeyColumn.editable).toBeTruthy();

            grid.rowEditable = true;
            expect(primaryKeyColumn.editable).toBeFalsy();
            expect(nonPrimaryKeyColumn.editable).toBeTruthy();
        }));

        it(`Should not allow editing a deleted row`, fakeAsync(() => {
            grid.deleteRow(grid.getRowByIndex(2).rowID);
            fix.detectChanges();

            const cell = grid.getCellByColumn(2, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            fix.detectChanges();
            expect(cell.editMode).toBeFalsy();
        }));

        it(`Should exit row editing when clicking on a cell from a deleted row`, fakeAsync(() => {
            grid.deleteRow(1);
            tick(16);
            fix.detectChanges();
            spyOn(grid, 'endRowTransaction');

            const firstCell = grid.getCellByColumn(2, 'ProductName');
            firstCell.setEditMode(true);
            tick(16);
            fix.detectChanges();
            expect(grid.endRowTransaction).toHaveBeenCalledTimes(0);

            const targetCell = grid.getCellByColumn(0, 'ProductName');
            targetCell.nativeElement.dispatchEvent(new Event('focus'));
            tick(100);
            fix.detectChanges();
            expect(grid.endRowTransaction).toHaveBeenCalledTimes(1);
            expect(targetCell.focused).toBeTruthy();
            expect(targetCell.selected).toBeTruthy();
            expect(firstCell.selected).toBeFalsy();
        }));

        it(`Paging: Should not apply edited classes to the same row on a different page`, fakeAsync(() => {
            // This is not a valid scenario if the grid does not have transactions enabled
            fix.componentInstance.paging = true;
            fix.detectChanges();
            tick(16);

            const gridElement: HTMLElement = grid.nativeElement;
            const cell = grid.getCellByColumn(0, 'ProductName');
            const rowEl: HTMLElement = grid.getRowByIndex(0).nativeElement;
            const pagingButtons = gridElement.querySelectorAll('.igx-grid-paginator__pager > button');

            expect(rowEl.classList).not.toContain('igx-grid__tr--edited');

            cell.setEditMode(true);
            tick(16);
            cell.editValue = 'IG';
            tick(16);
            fix.detectChanges();
            grid.endEdit(true);
            tick(16);
            fix.detectChanges();
            expect(rowEl.classList).toContain('igx-grid__tr--edited');

            // Next page button click
            pagingButtons[2].dispatchEvent(new Event('click'));
            fix.detectChanges();
            expect(grid.page).toEqual(1);
            expect(rowEl.classList).not.toContain('igx-grid__tr--edited');
        }));

        it('Transaction Update, Delete, Add, Undo, Redo, Commit check transaction and grid state', () => {
            const trans = grid.transactions;
            spyOn(trans.onStateUpdate, 'emit').and.callThrough();
            let row = null;
            let cell = grid.getCellByColumn(0, 'ProductName');
            let updateValue = 'Chaiiii';
            cell.setEditMode(true);
            fix.detectChanges();
            cell.editValue = updateValue;
            fix.detectChanges();
            expect(trans.onStateUpdate.emit).not.toHaveBeenCalled();
            let state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(0);

            cell = grid.getCellByColumn(1, 'ProductName');
            updateValue = 'Sirop';
            cell.setEditMode(true);
            fix.detectChanges();
            cell.editValue = updateValue;
            fix.detectChanges();

            // Called once because row edit ended on row 1;
            expect(trans.onStateUpdate.emit).toHaveBeenCalledTimes(1);
            state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(1);
            expect(state[0].type).toEqual(TransactionType.UPDATE);
            expect(state[0].newValue['ProductName']).toEqual('Chaiiii');

            grid.endEdit(true);
            fix.detectChanges();
            state = trans.getAggregatedChanges(false);
            expect(trans.onStateUpdate.emit).toHaveBeenCalled();
            expect(state.length).toEqual(2);
            expect(state[0].type).toEqual(TransactionType.UPDATE);
            expect(state[0].newValue['ProductName']).toEqual('Chaiiii');
            expect(state[1].type).toEqual(TransactionType.UPDATE);
            expect(state[1].newValue['ProductName']).toEqual(updateValue);
            grid.deleteRow(grid.getRowByIndex(2).rowID);
            fix.detectChanges();

            expect(trans.onStateUpdate.emit).toHaveBeenCalled();
            state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(3);
            expect(state[2].type).toEqual(TransactionType.DELETE);
            expect(state[2].newValue).toBeNull();

            trans.undo();
            fix.detectChanges();

            expect(trans.onStateUpdate.emit).toHaveBeenCalled();
            state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(2);
            expect(state[1].type).toEqual(TransactionType.UPDATE);
            expect(state[1].newValue['ProductName']).toEqual(updateValue);
            row = grid.getRowByIndex(2).nativeElement;
            expect(row.classList).not.toContain('igx -grid__tr--deleted');

            trans.redo();
            fix.detectChanges();

            expect(trans.onStateUpdate.emit).toHaveBeenCalled();
            state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(3);
            expect(state[2].type).toEqual(TransactionType.DELETE);
            expect(state[2].newValue).toBeNull();
            expect(row.classList).toContain('igx-grid__tr--deleted');

            trans.commit(grid.data);
            fix.detectChanges();
            state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(0);
            expect(row.classList).not.toContain('igx-grid__tr--deleted');

            cell = grid.getCellByColumn(0, 'ProductName');
            updateValue = 'Chaiwe';
            cell.setEditMode(true);
            fix.detectChanges();
            cell.update(updateValue);
            cell.setEditMode(false);
            fix.detectChanges();
            trans.clear();
            fix.detectChanges();
            state = trans.getAggregatedChanges(false);
            expect(state.length).toEqual(0);
            expect(cell.nativeElement.classList).not.toContain('igx-grid__tr--edited');
        });

        it('Should allow to change value of a cell with initial value of 0', fakeAsync(() => {
            const cell = grid.getCellByColumn(3, 'UnitsInStock');
            expect(cell.value).toBe(0);

            cell.update(50);
            tick(16);
            fix.detectChanges();
            expect(cell.value).toBe(50);
        }));

        it('Should allow to change value of a cell with initial value of false', fakeAsync(() => {
            const cell = grid.getCellByColumn(3, 'InStock');
            expect(cell.value).toBeFalsy();

            cell.update(true);
            tick(16);
            fix.detectChanges();
            expect(cell.value).toBeTruthy();
        }));

        it('Should allow to change value of a cell with initial value of empty string', fakeAsync(() => {
            const cell = grid.getCellByColumn(0, 'ProductName');
            expect(cell.value).toBe('Chai');

            cell.update('');
            tick(16);
            fix.detectChanges();
            expect(cell.value).toBe('');

            cell.update('Updated value');
            tick(16);
            fix.detectChanges();
            expect(cell.value).toBe('Updated value');
        }));

        it(`Should not log a transaction when a cell's value does not change`, fakeAsync(() => {
            const cell = grid.getCellByColumn(0, 'ProductName');
            const initialState = grid.transactions.getAggregatedChanges(false);
            expect(cell.value).toBe('Chai');

            // Set to same value
            cell.update('Chai');
            tick(16);
            fix.detectChanges();
            expect(cell.value).toBe('Chai');
            expect(grid.transactions.getAggregatedChanges(false)).toEqual(initialState);

            // Change value and check if it's logged
            cell.update('Updated value');
            tick(16);
            fix.detectChanges();
            expect(cell.value).toBe('Updated value');
            const expectedTransaction: Transaction = {
                id: 1,
                newValue: { ProductName: 'Updated value' },
                type: TransactionType.UPDATE
            };
            expect(grid.transactions.getAggregatedChanges(false)).toEqual([expectedTransaction]);
        }));

        it(`Should not log a transaction when a cell's value does not change - Date`, fakeAsync(() => {
            let cellDate = grid.getCellByColumn(0, 'OrderDate');
            const initialState = grid.transactions.getAggregatedChanges(false);

            // Enter edit mode
            cellDate.onKeydownEnterEditMode();
            tick(16);
            fix.detectChanges();
            // Exit edit mode without change
            cellDate.onKeydownExitEditMode();
            tick(16);
            fix.detectChanges();
            cellDate = grid.getCellByColumn(0, 'UnitsInStock');
            cellDate.onKeydownEnterEditMode();
            tick(16);
            fix.detectChanges();
            expect(grid.transactions.getAggregatedChanges(true)).toEqual(initialState);
            cellDate.onKeydownExitEditMode();

            cellDate = grid.getCellByColumn(0, 'OrderDate');
            const newValue = new Date('01/01/2000');
            cellDate.update(newValue);
            tick(16);
            fix.detectChanges();

            const expectedTransaction: Transaction = {
                id: 1,
                newValue: {OrderDate: newValue},
                type: TransactionType.UPDATE
            };
            expect(grid.transactions.getAggregatedChanges(false)).toEqual([expectedTransaction]);
        }));

        it('Should allow to change of a cell in added row in grid with transactions', fakeAsync(() => {
            const addRowData = {
                ProductID: 99,
                ProductName: 'Added product',
                InStock: false,
                UnitsInStock: 0,
                OrderDate: new Date()
            };
            grid.addRow(addRowData);
            tick(16);
            fix.detectChanges();

            const cell = grid.getCellByColumn(10, 'ProductName');
            expect(cell.value).toBe(addRowData.ProductName);

            cell.update('Changed product');
            tick(16);
            fix.detectChanges();
            expect(cell.value).toBe('Changed product');
        }));

        it('Should properly mark cell/row as dirty if new value evaluates to `false`', fakeAsync(() => {
            const targetRow = grid.getRowByIndex(0);
            let targetRowElement = targetRow.element.nativeElement;
            let targetCellElement = targetRow.cells.toArray()[1].nativeElement;
            expect(targetRowElement.classList).not.toContain('igx-grid__tr--edited', 'row contains edited class w/o edits');
            expect(targetCellElement.classList).not.toContain('igx-grid__td--edited', 'cell contains edited class w/o edits');

            targetRow.cells.toArray()[1].update('');
            tick(16);
            fix.detectChanges();

            targetRowElement = targetRow.element.nativeElement;
            targetCellElement = targetRow.cells.toArray()[1].nativeElement;
            expect(targetRowElement.classList).toContain('igx-grid__tr--edited', 'row does not contain edited class w/ edits');
            expect(targetCellElement.classList).toContain('igx-grid__td--edited', 'cell does not contain edited class w/ edits');
        }));

        it('Should change pages when the only item on the last page is a pending added row that gets deleted', fakeAsync(() => {
            expect(grid.data.length).toEqual(10);
            grid.paging = true;
            grid.perPage = 5;
            fix.detectChanges();
            tick(16);
            expect(grid.totalPages).toEqual(2);
            grid.addRow({
                ProductID: 123,
                ProductName: 'DummyItem',
                InStock: true,
                UnitsInStock: 1,
                OrderDate: new Date()
            });
            fix.detectChanges();
            tick(16);
            expect(grid.totalPages).toEqual(3);
            grid.page = 2;
            tick(16);
            fix.detectChanges();
            expect(grid.page).toEqual(2);
            grid.deleteRowById(123);
            tick(16);
            fix.detectChanges();
            // This is behaving incorrectly - if there is only 1 transaction and it is an ADD transaction on the last page
            // Deleting the ADD transaction on the last page will trigger grid.page-- TWICE
            expect(grid.page).toEqual(1); // Should be 1
            expect(grid.totalPages).toEqual(2);
        }));

        it('Should change pages when commiting deletes on the last page', fakeAsync(() => {
            expect(grid.data.length).toEqual(10);
            grid.paging = true;
            grid.perPage = 5;
            fix.detectChanges();
            tick(16);
            expect(grid.totalPages).toEqual(2);
            grid.page = 1;
            tick(16);
            fix.detectChanges();
            expect(grid.page).toEqual(1);
            for (let i = 0; i < grid.data.length / 2; i++) {
                grid.deleteRowById(grid.data.reverse()[i].ProductID);
            }
            fix.detectChanges();
            tick(16);
            expect(grid.page).toEqual(1);
            grid.transactions.commit(grid.data);
            fix.detectChanges();
            tick(16);
            expect(grid.page).toEqual(0);
            expect(grid.totalPages).toEqual(1);
        }));

        it('Should NOT change pages when deleting a row on the last page', fakeAsync(() => {
            grid.paging = true;
            grid.perPage = 5;
            fix.detectChanges();
            tick(16);
            expect(grid.totalPages).toEqual(2);
            expect(grid.data.length).toEqual(10);
            grid.page = 1;
            tick(16);
            fix.detectChanges();
            expect(grid.page).toEqual(1);
            grid.deleteRowById(grid.data[grid.data.length - 1].ProductID);
            fix.detectChanges();
            tick(16);
            expect(grid.page).toEqual(1);
            expect(grid.totalPages).toEqual(2);
        }));

        it('Should not log transaction when exit edit mode on row with state and with no changes', fakeAsync(() => {
            const trans = grid.transactions;
            const cell = grid.getCellByColumn(0, 'ProductName');
            const updateValue = 'Chaiiii';
            cell.setEditMode(true);
            tick(16);

            cell.editValue = updateValue;
            tick(16);
            fix.detectChanges();

            grid.endEdit(true);
            tick(16);
            fix.detectChanges();

            expect(trans.getTransactionLog().length).toBe(1);

            cell.setEditMode(true);
            tick(16);

            cell.editValue = updateValue;
            tick(16);
            fix.detectChanges();

            grid.endEdit(true);
            tick(16);
            fix.detectChanges();

            // should not log new transaction as there is no change in the row's cells
            expect(trans.getTransactionLog().length).toBe(1);
        }));
    });

    describe('Row Editing - Grouping', () => {
        it('Hide row editing dialog with group collapsing/expanding', fakeAsync(() => {
            const fix = TestBed.createComponent(IgxGridRowEditingWithFeaturesComponent);
            fix.detectChanges();
            const grid = fix.componentInstance.instance;
            grid.primaryKey = 'ID';
            fix.detectChanges();

            grid.groupBy({
                fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            });
            fix.detectChanges();

            let cell = grid.getCellByColumn(6, 'ProductName');
            expect(grid.crudService.inEditMode).toBeFalsy();

            // set cell in second group in edit mode
            cell.setEditMode(true);
            fix.detectChanges();
            tick(100);

            expect(grid.crudService.inEditMode).toBeTruthy();
            const groupRows = grid.groupsRowList.toArray();
            expect(groupRows[0].expanded).toBeTruthy();

            // collapse first group
            grid.toggleGroup(groupRows[0].groupRow);
            fix.detectChanges();

            expect(groupRows[0].expanded).toBeFalsy();
            expect(grid.crudService.inEditMode).toBeFalsy();

            // expand first group
            grid.toggleGroup(groupRows[0].groupRow);
            fix.detectChanges();

            expect(groupRows[0].expanded).toBeTruthy();
            expect(grid.crudService.inEditMode).toBeFalsy();

            // collapse first group
            grid.toggleGroup(groupRows[0].groupRow);
            tick(16);
            fix.detectChanges();

            expect(groupRows[0].expanded).toBeFalsy();
            expect(grid.crudService.inEditMode).toBeFalsy();

            // set cell in second group in edit mode
            cell.setEditMode(true);
            tick(16);
            fix.detectChanges();

            expect(grid.crudService.inEditMode).toBeTruthy();

            // expand first group
            grid.toggleGroup(groupRows[0].groupRow);
            tick(16);
            fix.detectChanges();

            expect(groupRows[0].expanded).toBeTruthy();
            expect(grid.crudService.inEditMode).toBeFalsy();

            // set cell in first group in edit mode
            cell = grid.getCellByColumn(1, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            fix.detectChanges();

            expect(grid.crudService.inEditMode).toBeTruthy();
            expect(groupRows[0].expanded).toBeTruthy();

            // collapse first group
            grid.toggleGroup(groupRows[0].groupRow);
            tick(16);
            fix.detectChanges();

            expect(groupRows[0].expanded).toBeFalsy();
            expect(grid.crudService.inEditMode).toBeFalsy();

            // expand first group
            grid.toggleGroup(groupRows[0].groupRow);
            tick(16);
            fix.detectChanges();

            expect(groupRows[0].expanded).toBeTruthy();
            expect(grid.crudService.inEditMode).toBeFalsy();
        }));

        it('Hide row editing dialog when hierarchical group is collapsed/expanded',
        fakeAsync(() => {
                const fix = TestBed.createComponent(IgxGridRowEditingWithFeaturesComponent);
                fix.detectChanges();
                const grid = fix.componentInstance.instance;
                grid.primaryKey = 'ID';
                fix.detectChanges();
                grid.groupBy({
                    fieldName: 'Released', dir: SortingDirection.Desc, ignoreCase: false,
                    strategy: DefaultSortingStrategy.instance()
                });
                fix.detectChanges();
                grid.groupBy({
                    fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false,
                    strategy: DefaultSortingStrategy.instance()
                });
                fix.detectChanges();
                expect(grid.crudService.inEditMode).toBeFalsy();
                const cell = grid.getCellByColumn(2, 'ProductName');
                cell.setEditMode(true);
                fix.detectChanges();
                tick(100);
                expect(grid.crudService.inEditMode).toBeTruthy();
                const groupRows = grid.groupsRowList.toArray();

                grid.toggleGroup(groupRows[0].groupRow);
                fix.detectChanges();
                expect(grid.crudService.inEditMode).toBeFalsy();
                grid.toggleGroup(groupRows[0].groupRow);
                fix.detectChanges();
                expect(grid.crudService.inEditMode).toBeFalsy();
            }));
    });

    describe('Transactions service', () => {
        let fix;
        let grid: IgxGridComponent;
        let trans;

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxGridRowEditingTransactionComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            trans = grid.transactions;
        }));


        it(`Should not commit added row to grid's data in grid with transactions`, fakeAsync(() => {
            spyOn(trans, 'add').and.callThrough();

            const addRowData = {
                ProductID: 100,
                ProductName: 'Added',
                InStock: true,
                UnitsInStock: 20000,
                OrderDate: new Date(1)
            };

            grid.addRow(addRowData);
            tick(16);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            expect(trans.add).toHaveBeenCalledWith({ id: 100, type: 'add', newValue: addRowData });
            expect(grid.data.length).toBe(10);
        }));

        it(`Should not delete deleted row from grid's data in grid with transactions`, fakeAsync(() => {
            spyOn(trans, 'add').and.callThrough();

            grid.deleteRow(5);
            tick(16);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            expect(trans.add).toHaveBeenCalledWith({ id: 5, type: 'delete', newValue: null }, grid.data[4]);
            expect(grid.data.length).toBe(10);
        }));

        it(`Should not update updated cell in grid's data in grid with transactions`, fakeAsync(() => {
            spyOn(trans, 'add').and.callThrough();

            grid.updateCell('Updated Cell', 3, 'ProductName');
            tick(16);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            expect(trans.add).toHaveBeenCalledWith({ id: 3, type: 'update', newValue: { ProductName: 'Updated Cell' } }, grid.data[2]);
            expect(grid.data.length).toBe(10);
        }));

        it(`Should not update updated row in grid's data in grid with transactions`, fakeAsync(() => {
            spyOn(trans, 'add').and.callThrough();

            const updateRowData = {
                ProductID: 100,
                ProductName: 'Added',
                InStock: true,
                UnitsInStock: 20000,
                OrderDate: new Date(1)
            };
            const oldRowData = grid.data[2];

            grid.updateRow(updateRowData, 3);
            tick(16);
            expect(trans.add).toHaveBeenCalled();
            expect(trans.add).toHaveBeenCalledTimes(1);
            expect(trans.add).toHaveBeenCalledWith({ id: 3, type: 'update', newValue: updateRowData }, oldRowData);
            expect(grid.data[2]).toBe(oldRowData);
        }));

        it(`Should be able to add a row if another row is in edit mode`, fakeAsync(() => {
            const rowCount = grid.rowList.length;
            grid.rowEditable = true;
            fix.detectChanges();

            const targetRow = fix.debugElement.query(By.css(`${CELL_CLASS}:last-child`));
            targetRow.nativeElement.dispatchEvent(new Event('focus'));
            flush();
            fix.detectChanges();
            targetRow.triggerEventHandler('dblclick', {});
            flush();
            fix.detectChanges();

            grid.addRow({
                ProductID: 1000,
                ProductName: 'New Product',
                InStock: true,
                UnitsInStock: 1,
                OrderDate: new Date()
            });
            fix.detectChanges();
            tick(16);

            expect(grid.rowList.length).toBeGreaterThan(rowCount);
        }));

        it(`Should be able to add a row if a cell is in edit mode`, fakeAsync(() => {
              const rowCount = grid.rowList.length;
            const cell = grid.getCellByColumn(0, 'ProductName');
            cell.setEditMode(true);
            tick(16);
            fix.detectChanges();

            grid.addRow({
                ProductID: 1000,
                ProductName: 'New Product',
                InStock: true,
                UnitsInStock: 1,
                OrderDate: new Date()
            });
            fix.detectChanges();
            tick(16);

            expect(grid.rowList.length).toBeGreaterThan(rowCount);
        }));
    });




});
