import { IgxGridModule, IgxGridComponent } from './public_api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { async, TestBed, fakeAsync } from '@angular/core/testing';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { DebugElement } from '@angular/core';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import {
    IgxAddRowComponent
} from '../../test-utils/grid-samples.spec';

import { By } from '@angular/platform-browser';
import { IgxActionStripComponent } from '../../action-strip/action-strip.component';
import { IgxActionStripModule } from '../../action-strip/action-strip.module';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { IgxGridRowComponent } from './grid-row.component';

describe('IgxGrid - Row Adding #grid', () => {
        let fixture;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        let actionStrip: IgxActionStripComponent;
    configureTestSuite();
    beforeAll( async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxAddRowComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxActionStripModule,
                IgxGridModule]
        }).compileComponents();
    }));

    describe('General tests', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
            actionStrip = fixture.componentInstance.actionStrip;
        }));

        it('Should be able to enter add row mode on action strip click', () => {
            const row = grid.rowList.first;
            actionStrip.show(row);
            fixture.detectChanges();
            const addRowIcon = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`))[1];
            addRowIcon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();
            const addRow = grid.getRowByIndex(1);
            expect(addRow.addRow).toBeTrue();
        });

        it('Should be able to enter add row mode through the exposed API method.', () => {
            const rows = grid.rowList.toArray();
            rows[0].beginAddRow();
            fixture.detectChanges();
            let addRow = grid.getRowByIndex(1);
            expect(addRow.addRow).toBeTrue();

            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
            fixture.detectChanges();
            addRow = grid.getRowByIndex(1);
            expect(addRow.addRow).toBeFalse();

            rows[1].beginAddRow();
            fixture.detectChanges();
            addRow = grid.getRowByIndex(2);
            expect(addRow.addRow).toBeTrue();
        });

        it('Should display the banner above the row if there is no room underneath it', () => {
            grid.paging = true;
            grid.perPage = 7;
            fixture.detectChanges();

            const lastRow = grid.rowList.last;
            const lastRowIndex = lastRow.index;
            actionStrip.show(lastRow);
            fixture.detectChanges();

            const addRowIcon = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`))[1];
            addRowIcon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();


            const addRow = grid.getRowByIndex(lastRowIndex + 1);
            expect(addRow.addRow).toBeTrue();

            const banner = GridFunctions.getRowEditingOverlay(fixture);
            fixture.detectChanges();
            const bannerBottom = banner.getBoundingClientRect().bottom;
            const addRowTop = addRow.nativeElement.getBoundingClientRect().top;

            // The banner appears above the row
            expect(bannerBottom).toBeLessThanOrEqual(addRowTop);

            // No much space between the row and the banner
            expect(addRowTop - bannerBottom).toBeLessThan(2);
        });
        it('Should be able to enter add row mode on Alt + plus key.', () => {
            GridFunctions.focusFirstCell(fixture);
            fixture.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('+', gridContent, true, false, false);
            fixture.detectChanges();

            const addRow = grid.getRowByIndex(1);
            expect(addRow.addRow).toBeTrue();

        });
        it('Should not be able to enter add row mode on Alt + Shift + plus key.', () => {
            GridFunctions.focusFirstCell(fixture);
            fixture.detectChanges();

            UIInteractions.triggerEventHandlerKeyDown('+', gridContent, true, true, false);
            fixture.detectChanges();

            const banner = GridFunctions.getRowEditingOverlay(fixture);
            expect(banner).toBeNull();
            expect(grid.getRowByIndex(1).addRow).toBeFalse();
        });
        it('Should not be able to enter add row mode when rowEditing is disabled', () => {
            grid.rowEditable = false;
            fixture.detectChanges();

            grid.rowList.first.beginAddRow();
            fixture.detectChanges();

            const banner = GridFunctions.getRowEditingOverlay(fixture);
            expect(banner).toBeNull();
            expect(grid.getRowByIndex(1).addRow).toBeFalse();
        });

        it('Should allow adding row from pinned row.', () => {
            let row = grid.getRowByIndex(0);
            row.pin();
            fixture.detectChanges();
            expect(grid.pinnedRecords.length).toBe(1);

            row = grid.getRowByIndex(0);
            row.beginAddRow();
            fixture.detectChanges();

            // add row should be pinned
            const addRow = grid.getRowByIndex(1) as IgxGridRowComponent;
            expect(addRow.addRow).toBe(true);
            expect(grid.pinnedRows[1]).toBe(addRow);

            grid.endEdit(true);
            fixture.detectChanges();

            // added record should be pinned.
            expect(grid.pinnedRecords.length).toBe(2);
            expect(grid.pinnedRecords[1]).toBe(grid.data[grid.data.length - 1]);

        });
        it('Should allow adding row from ghost row.', () => {
            const row = grid.getRowByIndex(0);
            row.pin();
            fixture.detectChanges();
            expect(grid.pinnedRecords.length).toBe(1);

            const ghostRow = grid.getRowByIndex(1);
            ghostRow.beginAddRow();
            fixture.detectChanges();

            // add row should be unpinned
            const addRow = grid.getRowByIndex(2);
            expect(addRow.addRow).toBe(true);
            expect(grid.pinnedRows.length).toBe(1);

            grid.endEdit(true);
            fixture.detectChanges();

            // added record should be unpinned.
            expect(grid.pinnedRecords.length).toBe(1);
            expect(grid.unpinnedRecords[grid.unpinnedRecords.length - 1]).toBe(grid.data[grid.data.length - 1]);
        });
        it('should navigate to added row on snackbar button click.', async() => {
            const rows = grid.rowList.toArray();
            const dataCount = grid.data.length;
            rows[0].beginAddRow();
            fixture.detectChanges();

            grid.endEdit(true);
            fixture.detectChanges();

            // check row is in data
            expect(grid.data.length).toBe(dataCount + 1);

            const addedRec = grid.data[grid.data.length - 1];

            grid.addRowSnackbar.triggerAction();
            fixture.detectChanges();

            await wait(100);
            fixture.detectChanges();

            // check added row is rendered and is in view
            const row = grid.getRowByKey(addedRec[grid.primaryKey]);
            expect(row).not.toBeNull();
            const gridOffsets = grid.tbody.nativeElement.getBoundingClientRect();
            const rowOffsets = row.nativeElement.getBoundingClientRect();
            expect(rowOffsets.top >= gridOffsets.top && rowOffsets.bottom <= gridOffsets.bottom).toBeTruthy();
        });

        it('should navigate to added row on snackbar button click when row is not in current view.', async() => {
            grid.paging = true;
            grid.perPage = 5;
            fixture.detectChanges();

            const rows = grid.rowList.toArray();
            const dataCount = grid.data.length;

            rows[0].beginAddRow();
            fixture.detectChanges();

            grid.endEdit(true);
            fixture.detectChanges();

            // check row is in data
            expect(grid.data.length).toBe(dataCount + 1);

            const addedRec = grid.data[grid.data.length - 1];

            grid.addRowSnackbar.triggerAction();
            fixture.detectChanges();

            await wait(100);
            fixture.detectChanges();

            // check page is correct
            expect(grid.page).toBe(5);

             // check added row is rendered and is in view
             const row = grid.getRowByKey(addedRec[grid.primaryKey]);
             expect(row).not.toBeNull();
             const gridOffsets = grid.tbody.nativeElement.getBoundingClientRect();
             const rowOffsets = row.nativeElement.getBoundingClientRect();
             expect(rowOffsets.top >= gridOffsets.top && rowOffsets.bottom <= gridOffsets.bottom).toBeTruthy();
        });

    });
});
