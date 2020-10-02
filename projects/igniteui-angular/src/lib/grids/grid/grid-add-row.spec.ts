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
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

describe('IgxGrid - Row Adding #grid', () => {
        let fixture;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;
        let actionStrip: IgxActionStripComponent;
    configureTestSuite();
    beforeAll(async(() => {
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

        it('Should not be able to enter add row mode when rowEditing is disabled', () => {
            grid.rowEditable = false;
            fixture.detectChanges();

            grid.rowList.first.beginAddRow();
            fixture.detectChanges();

            const banner = GridFunctions.getRowEditingOverlay(fixture);
            expect(banner).toBeNull();
            expect(grid.getRowByIndex(1).addRow).toBeFalse();
        });

    });
});
