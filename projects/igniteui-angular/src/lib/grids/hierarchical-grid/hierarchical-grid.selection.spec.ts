import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { Component, ViewChild } from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxGridGroupByRowComponent, IgxColumnMovingDragDirective, IgxColumnComponent, GridSelectionMode } from '../grid';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { take } from 'rxjs/operators';
import { IgxHierarchicalTransactionServiceFactory } from './hierarchical-grid-base.component';
import { IgxIconModule } from '../../icon';
import { IgxHierarchicalGridTestBaseComponent,
        IgxHierarchicalGridRowSelectionComponent } from '../../test-utils/hierarhical-grid-components.spec';
import { HelperUtils } from '../../test-utils/helper-utils.spec';

describe('IgxHierarchicalGrid selection', () => {
    configureTestSuite();
    let fix;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    let rowIsland1;
    let rowIsland2;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridTestBaseComponent,
                IgxHierarchicalGridRowSelectionComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule, IgxIconModule]
        }).compileComponents();
    }));

    describe('Cell selection', () => {
        beforeEach(async(() => {
            fix = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
            fix.detectChanges();
            hierarchicalGrid = fix.componentInstance.hgrid;
            rowIsland1 = fix.componentInstance.rowIsland;
            rowIsland2 = fix.componentInstance.rowIsland2;
        }));

        it('should select cells only in current grid with mouse drag.', () => {

        });

        it('should select cells only in current grid keyboard.', () => {

        });

        it('should be able to change cellSelection per rowIsland', () => {

        });

        it('should be able to change cellSelection per rowIsland', () => {

        });

        it('should be able to change cellSelection', () => {

        });

        it('should allow only one cell to be selected in the whole hierarchical grid.', (async () => {
            hierarchicalGrid.height = '500px';
            hierarchicalGrid.reflow();
            fix.detectChanges();

        let firstRow = hierarchicalGrid.dataRowList.toArray()[0] as IgxHierarchicalRowComponent;
            firstRow.nativeElement.children[0].click();
            fix.detectChanges();
            expect(firstRow.expanded).toBeTruthy();

            let fCell = firstRow.cells.toArray()[0];

            // select parent cell
            fCell.nativeElement.focus();
            await wait(100);
            fix.detectChanges();

            expect(fCell.selected).toBeTruthy();

            const childGrid =  hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const firstChildRow = childGrid.dataRowList.toArray()[0];
            const fChildCell =  firstChildRow.cells.toArray()[0];

            // select child cell
            fChildCell.nativeElement.focus();
            await wait(100);
            fix.detectChanges();

            expect(fChildCell.selected).toBeTruthy();
            expect(fCell.selected).toBeFalsy();

            // select parent cell
            firstRow = hierarchicalGrid.dataRowList.toArray()[0] as IgxHierarchicalRowComponent;
            fCell = firstRow.cells.toArray()[0];
            fCell.nativeElement.focus();
            await wait(100);
            fix.detectChanges();
            expect(fChildCell.selected).toBeFalsy();
            expect(fCell.selected).toBeTruthy();
        }));

    });

    describe('Row Selection', () => {

        beforeEach(fakeAsync(/** height/width setter rAF */() => {
            fix = TestBed.createComponent(IgxHierarchicalGridRowSelectionComponent);
            fix.detectChanges();
            hierarchicalGrid = fix.componentInstance.hgrid;
            rowIsland1 = fix.componentInstance.rowIsland;
            rowIsland2 = fix.componentInstance.rowIsland2;
        }));

        it('should retain selected row when filtering', fakeAsync(() => {
            const firstRow = hierarchicalGrid.getRowByIndex(0);
            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            hierarchicalGrid.filter('ID', '0', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();

            HelperUtils.verifyRowSelected( hierarchicalGrid.getRowByIndex(0));
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
        }));

        it('should be able to change rowSelection per rowIsland', () => {

        });

        it('should be able to change rowSelection', () => {

        });

        it('should be able to select/deselect all rows', () => {

        });

        it('should have correct header checkbox state when selecting rows', () => {

        });

        it('should remain selected rows when change page', () => {

        });

        it('should be able to hideRowSelectors ', () => {

        });
    });
});
