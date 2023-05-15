
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxTreeGridComponent } from './public_api';
import { IgxTreeGridEditActionsComponent, IgxTreeGridEditActionsPinningComponent } from '../../test-utils/tree-grid-components.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxActionStripComponent } from '../../action-strip/public_api';
import { IgxTreeGridRowComponent } from './tree-grid-row.component';
import { first } from 'rxjs/operators';
import { IGridEditEventArgs } from '../public_api';

describe('IgxTreeGrid - Add Row UI #tGrid', () => {
    configureTestSuite();
    let fix;
    let treeGrid: IgxTreeGridComponent;
    let actionStrip: IgxActionStripComponent;
    const endTransition = () => {
        // transition end needs to be simulated
        const animationElem = fix.nativeElement.querySelector('.igx-grid__tr--inner');
        const endEvent = new AnimationEvent('animationend');
        animationElem.dispatchEvent(endEvent);
    };

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxTreeGridEditActionsComponent,
                IgxTreeGridEditActionsPinningComponent
            ]
        }).compileComponents();
    }));

    describe('Basic', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTreeGridEditActionsComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            actionStrip = fix.componentInstance.actionStrip;
        });

        it('should show action strip "add row" button only for root level rows.', () => {
            actionStrip.show(treeGrid.rowList.first);
            fix.detectChanges();

            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));
            expect(editActions.length).toBe(4);

            expect(editActions[1].componentInstance.iconName).toBe('add-row');
            expect(editActions[2].componentInstance.iconName).toBe('add-child');
        });

        it('should show action strip "add child" button for all rows.', () => {
            actionStrip.show(treeGrid.rowList.toArray()[1]);
            fix.detectChanges();

            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));
            expect(editActions.length).toBe(3);
            expect(editActions[1].componentInstance.iconName).toBe('add-child');
        });

        it('should allow adding child to row via the UI.', () => {
            const row = treeGrid.rowList.toArray()[1];
            actionStrip.show(row);
            fix.detectChanges();

            expect(treeGrid.rowList.length).toBe(8);

            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));
            expect(editActions[1].componentInstance.iconName).toBe('add-child');
            const addChildBtn = editActions[1].componentInstance;
            addChildBtn.actionClick.emit();
            fix.detectChanges();
            endTransition();

            const addRow = treeGrid.gridAPI.get_row_by_index(2);
            expect(addRow.addRowUI).toBeTrue();

            treeGrid.gridAPI.crudService.endEdit(true);
            fix.detectChanges();

            expect(treeGrid.rowList.length).toBe(9);
            const addedRow = treeGrid.getRowByIndex(4);
            expect(addedRow.data.Name).toBe(undefined);

        });

        it('should be able to enter add row mode through the exposed API method - beginAddChild', () => {
            const row = treeGrid.rowList.toArray()[1] as IgxTreeGridRowComponent;
            row.beginAddChild();
            fix.detectChanges();
            const addRow = treeGrid.gridAPI.get_row_by_index(2);
            expect(addRow.addRowUI).toBeTrue();
        });

        it('should allow adding sibling to child row via the API.', () => {
            const row = treeGrid.rowList.toArray()[2] as IgxTreeGridRowComponent;
            // adds row as sibling
            row.beginAddRow();
            fix.detectChanges();
            endTransition();

            treeGrid.gridAPI.crudService.endEdit(true);
            fix.detectChanges();

            // check row is added as sibling
            expect(treeGrid.rowList.length).toBe(9);
            const addedRow = treeGrid.rowList.toArray()[4] as IgxTreeGridRowComponent;
            expect(addedRow.data.Name).toBe(undefined);
            // should have same parent record.
            expect(addedRow.treeRow.parent).toBe(row.treeRow.parent);
        });

        it('should allow adding row to empty grid', () => {
            treeGrid.data = [];
            fix.detectChanges();

            expect(treeGrid.rowList.length).toBe(0);

            // begin add row for empty grid
            // TODO how to start begin add row for empty grid?
            treeGrid.crudService.enterAddRowMode(null);
            fix.detectChanges();
            endTransition();

            treeGrid.gridAPI.crudService.endEdit(true);
            fix.detectChanges();

            expect(treeGrid.rowList.length).toBe(1);
        });

        it('should add row on correct position and enter edit mode from pinned row - pinning position: Top', () => {
            fix = TestBed.createComponent(IgxTreeGridEditActionsPinningComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            actionStrip = fix.componentInstance.actionStrip;

            treeGrid.pinRow(1);
            treeGrid.pinRow(6);

            expect(treeGrid.getRowByKey(1).pinned).toBeTrue();
            expect(treeGrid.getRowByKey(6).pinned).toBeTrue();

            actionStrip.show(treeGrid.rowList.toArray()[1]);
            fix.detectChanges();

            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));

            expect(editActions[3].componentInstance.iconName).toBe('add-row');
            const addRowBtn = editActions[3].componentInstance;
            addRowBtn.actionClick.emit();
            fix.detectChanges();
            endTransition();

            const addRow = treeGrid.gridAPI.get_row_by_index(2);
            expect(addRow.addRowUI).toBeTrue();
            expect(addRow.inEditMode).toBeTrue();

            treeGrid.gridAPI.crudService.endEdit(true);
            fix.detectChanges();
        });

        it('should add row on correct position and enter edit mode from pinned row - pinning position: Bottom', () => {
            fix = TestBed.createComponent(IgxTreeGridEditActionsPinningComponent);
            fix.detectChanges();
            treeGrid = fix.componentInstance.treeGrid;
            actionStrip = fix.componentInstance.actionStrip;

            treeGrid.pinning = fix.componentInstance.pinningConfig;
            fix.detectChanges();

            treeGrid.pinRow(1);
            treeGrid.pinRow(6);

            expect(treeGrid.getRowByKey(1).pinned).toBeTrue();
            expect(treeGrid.getRowByKey(6).pinned).toBeTrue();

            actionStrip.show(treeGrid.rowList.last);
            fix.detectChanges();

            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));

            expect(editActions[3].componentInstance.iconName).toBe('add-row');
            const addRowBtn = editActions[3].componentInstance;
            addRowBtn.actionClick.emit();
            fix.detectChanges();
            endTransition();

            const addRow = treeGrid.gridAPI.get_row_by_index(10);
            expect(addRow.addRowUI).toBeTrue();
            expect(addRow.inEditMode).toBeTrue();

            treeGrid.gridAPI.crudService.endEdit(true);
            fix.detectChanges();
        });

        it('should have correct foreignKey value for the data record in rowAdd event arguments', () => {
            let newRowId = null;
            treeGrid.rowAdd.pipe(first()).subscribe((args: IGridEditEventArgs) => {
                expect(args.newValue[treeGrid.foreignKey]).toBe(2);
                expect(args.rowData[treeGrid.foreignKey]).toBe(2);
                newRowId = args.newValue[treeGrid.primaryKey];
            });

            treeGrid.beginAddRowById(2, true);
            fix.detectChanges();
            endTransition();

            const addRow = treeGrid.gridAPI.get_row_by_index(2);
            expect(addRow.addRowUI).toBeTrue();

            treeGrid.gridAPI.crudService.endEdit(true);
            fix.detectChanges();

            expect(treeGrid.rowList.length).toBe(9);
            const addedRow = treeGrid.getRowByKey(newRowId);
            expect(addedRow.data[treeGrid.foreignKey]).toBe(2);
        });
    });
});
