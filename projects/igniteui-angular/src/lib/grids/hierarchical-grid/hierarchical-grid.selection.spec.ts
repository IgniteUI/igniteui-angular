import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, fakeAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait } from '../../test-utils/ui-interactions.spec';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxIconModule } from '../../icon';
import { IgxHierarchicalGridTestBaseComponent,
        IgxHierarchicalGridRowSelectionComponent } from '../../test-utils/hierarhical-grid-components.spec';
import { HelperUtils } from '../../test-utils/helper-utils.spec';

describe('IgxHierarchicalGrid selection #hGrid', () => {
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

        it('should have checkboxes on each row', () => {
            HelperUtils.verifyHeaderRowHasCheckbox(fix);
            HelperUtils.verifyHeaderAndRowCheckBoxesAlignment(fix, hierarchicalGrid);

            for (const row of hierarchicalGrid.rowList.toArray()) {
                HelperUtils.verifyRowHasCheckbox(row.nativeElement);
            }
        });

        it('should retain selected row when filtering', () => {
            const firstRow = hierarchicalGrid.getRowByIndex(0);
            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            hierarchicalGrid.filter('ID', '1', IgxStringFilteringOperand.instance().condition('doesNotContain'), true);
            fix.detectChanges();

            HelperUtils.verifyRowSelected( hierarchicalGrid.getRowByIndex(0));
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
        });

        it('should have correct header checkbox state when selecting rows', () => {
            const firstRow = hierarchicalGrid.getRowByIndex(0);
            const secondRow = hierarchicalGrid.getRowByIndex(1);
            HelperUtils.verifyHeaderRowCheckboxState(fix);

            // Select all rows
            hierarchicalGrid.rowList.toArray().forEach(row => {
                HelperUtils.clickRowCheckbox(row);
                fix.detectChanges();
                HelperUtils.verifyRowSelected(row);
            });

            HelperUtils.verifyHeaderRowCheckboxState(fix, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['0', '1', '2', '3', '4']);

            // Unselect a row
            HelperUtils.clickRowCheckbox(firstRow);
            fix.detectChanges();

            HelperUtils.verifyRowSelected(firstRow, false);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['1', '2', '3', '4']);

            // Click on a row
            secondRow.nativeElement.dispatchEvent(new MouseEvent('click'));
            fix.detectChanges();

            HelperUtils.verifyRowSelected(secondRow);
            HelperUtils.verifyHeaderRowCheckboxState(fix, false, true);
            expect(hierarchicalGrid.selectedRows()).toEqual(['1']);
        });
    });
});
