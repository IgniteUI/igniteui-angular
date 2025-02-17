
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxTreeGridComponent } from './public_api';
import { IgxTreeGridEditActionsComponent, IgxTreeGridEditActionsPinningComponent } from '../../test-utils/tree-grid-components.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxActionStripComponent } from '../../action-strip/public_api';
import { IgxTreeGridRowComponent } from './tree-grid-row.component';
import { first } from 'rxjs/operators';
import { IRowDataCancelableEventArgs } from '../public_api';
import { wait } from '../../test-utils/ui-interactions.spec';

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

            expect(editActions[1].componentInstance.iconName).toBe('add_row');
            expect(editActions[2].componentInstance.iconName).toBe('add_child');
        });

        it('should show action strip "add child" button for all rows.', () => {
            actionStrip.show(treeGrid.rowList.toArray()[1]);
            fix.detectChanges();

            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));
            expect(editActions.length).toBe(3);
            expect(editActions[1].componentInstance.iconName).toBe('add_child');
        });

        it('should allow adding child to row via the UI.', () => {
            const row = treeGrid.rowList.toArray()[1];
            actionStrip.show(row);
            fix.detectChanges();

            expect(treeGrid.rowList.length).toBe(8);

            const editActions = fix.debugElement.queryAll(By.css(`igx-grid-action-button`));
            expect(editActions[1].componentInstance.iconName).toBe('add_child');
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

            expect(editActions[3].componentInstance.iconName).toBe('add_row');
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

            expect(editActions[3].componentInstance.iconName).toBe('add_row');
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
            treeGrid.rowAdd.pipe(first()).subscribe((args: IRowDataCancelableEventArgs) => {
                expect(args.rowData[treeGrid.foreignKey]).toBe(2);
                newRowId = args.rowData[treeGrid.primaryKey];
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

        it('should collapse row when child row adding begins and it added row should go under correct parent.', async() => {
            treeGrid.data = [
                { ID: 1, ParentID: -1, Name: 'Casey Houston', JobTitle: 'Vice President', Age: 32 },
                { ID: 2, ParentID: 10, Name: 'Gilberto Todd', JobTitle: 'Director', Age: 41 },
                { ID: 3, ParentID: 10, Name: 'Tanya Bennett', JobTitle: 'Director', Age: 29 },
                { ID: 4, ParentID: 6, Name: 'Jack Simon', JobTitle: 'Software Developer', Age: 33 },
                { ID: 6, ParentID: -1, Name: 'Erma Walsh', JobTitle: 'CEO', Age: 52 },
                { ID: 7, ParentID: 10, Name: 'Debra Morton', JobTitle: 'Associate Software Developer', Age: 35 },
                { ID: 9, ParentID: 10, Name: 'Leslie Hansen', JobTitle: 'Associate Software Developer', Age: 44 },
                { ID: 10, ParentID: -1, Name: 'Eduardo Ramirez', JobTitle: 'Manager', Age: 53 }
            ];
            fix.detectChanges();
            treeGrid.collapseAll();
            treeGrid.height = "350px";
            fix.detectChanges();
            const parentRow1 = treeGrid.rowList.toArray()[1] as IgxTreeGridRowComponent;
            treeGrid.expandRow(parentRow1.key);
            const parentRow2 = treeGrid.rowList.toArray()[3] as IgxTreeGridRowComponent;
            treeGrid.expandRow(parentRow2.key);
            treeGrid.triggerPipes();
            fix.detectChanges();

            // scroll bottom
            treeGrid.verticalScrollContainer.scrollTo(treeGrid.dataView.length - 1);
            await wait(50);
            fix.detectChanges();
            // start add row
            parentRow2.beginAddChild();
            fix.detectChanges();
            // last row should be add row
            const addRow = treeGrid.gridAPI.get_row_by_index(4);
            expect(addRow.addRowUI).toBeTrue();
            endTransition();

            // end edit
            treeGrid.gridAPI.crudService.endEdit(true);
            fix.detectChanges();

            // row should be added under correct parent
            expect(treeGrid.data[treeGrid.data.length - 1].ParentID).toBe(10);
        });
    });
});
