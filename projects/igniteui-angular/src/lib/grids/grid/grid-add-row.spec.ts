import { IgxGridModule, IgxGridComponent } from './public_api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { async, TestBed, fakeAsync } from '@angular/core/testing';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { DebugElement } from '@angular/core';
import { GridFunctions, GridSummaryFunctions } from '../../test-utils/grid-functions.spec';
import {
    IgxAddRowComponent, IgxGridRowEditingTransactionComponent
} from '../../test-utils/grid-samples.spec';

import { By } from '@angular/platform-browser';
import { IgxActionStripComponent } from '../../action-strip/action-strip.component';
import { IgxActionStripModule } from '../../action-strip/action-strip.module';
import { DefaultGridMasterDetailComponent } from './grid.master-detail.spec';
import { ColumnLayoutTestComponent } from './grid.multi-row-layout.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';

describe('IgxGrid - Row Adding #grid', () => {
        const SUMMARY_ROW = 'igx-grid-summary-row';
        let fixture;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        let actionStrip: IgxActionStripComponent;
    configureTestSuite();
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxAddRowComponent,
                ColumnLayoutTestComponent
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

        it('Should emit all grid editing events as per row editing specification', () => {

        });

        it('Should generate correct row ID based on the primary column type', () => {

        });

        it('Should correctly add new row as last row', () => {

        });
    });

    describe('Exit add row mode tests', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
            actionStrip = fixture.componentInstance.actionStrip;
        }));

        it('Should exit add row mode and commit on clicking DONE button in the overlay', () => {

        });

        it('Should exit add row mode and discard on clicking CANCEL button in the overlay', () => {

        });

        it('Should exit add row mode and discard on ESC KEYDOWN', () => {

        });

        it('Should exit add row mode and commit on ENTER KEYDOWN.', () => {

        });
    });

    describe('Row Adding - Paging and MRL tests', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('Should preserve the changes after page navigation', () => {

        });

        it('Should save changes when changing page count', () => {

        });
    });

    describe('Row Adding - Filtering tests', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
            actionStrip = fixture.componentInstance.actionStrip;
        }));

        it('Should exit add row mode on filter applied', () => {

        });

        it('Filtering should consider newly added rows', () => {

        });

        it('Should not show the action strip "Show" button if added row is filtered out', () => {

        });
    });

    describe('Row Adding - Sorting tests', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
            actionStrip = fixture.componentInstance.actionStrip;
        }));

        it('Should exit add row mode and discard on sorting', () => {

        });

        it('Sorting should consider newly added rows', () => {

        });

        it('Should go to correct row via the the action strip "Show" button when row is added in sorted grid', () => {

        });
    });

    describe('Row Adding - Master detail view', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(DefaultGridMasterDetailComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('Should collapse expanded detail view before spawning add row UI', () => {

        });
    });

    describe('Row Adding - MRL tests', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(ColumnLayoutTestComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('Should render adding row with correct multi row layout', () => {

        });
    });

    describe('Row Adding - Group by', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('Should show the action strip "Show" button if added row is in collapsed group and on click should expand the group and scroll to the correct added row', () => {

        });
    });

    describe('Row Adding - Summaries', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('Should update summaries after adding new row', () => {
            grid.getColumnByName('ID').hasSummary = true;
            fixture.detectChanges();
            let summaryRow = fixture.debugElement.query(By.css(SUMMARY_ROW));
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['27']);

            grid.rowList.first.beginAddRow();
            fixture.detectChanges();

            grid.endEdit(true);
            fixture.detectChanges();

            summaryRow = fixture.debugElement.query(By.css(SUMMARY_ROW));
            GridSummaryFunctions.verifyColumnSummaries(summaryRow, 0, ['Count'], ['28']);
        });
    });

    describe('Row Adding - Column manipulations', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxAddRowComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('Should exit add row mode when moving a column', () => {

        });

        it('Should exit add row mode when pinning/unpinning a column', () => {

        });

        it('Should exit add row mode when resizing a column', () => {

        });

        it('Should exit add row mode when hiding a column', () => {

        });
    });

    describe('Row Adding - Transactions', () => {
        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fixture = TestBed.createComponent(IgxGridRowEditingTransactionComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('Should create ADD transaction when adding a new row', () => {

        });

        it('All updates on uncommitted add row should be merged into one ADD transaction', () => {

        });
    });
});
