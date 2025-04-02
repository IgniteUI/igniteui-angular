import { expect, vi } from 'vitest';
import { Component, OnInit, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { IgxGridComponent } from '../../grids/grid/public_api';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxHierarchicalGridActionStripComponent } from '../../test-utils/hierarchical-grid-components.spec';
import { IgxHierarchicalGridComponent } from '../../grids/hierarchical-grid/public_api';
import { IgxHierarchicalRowComponent } from '../../grids/hierarchical-grid/hierarchical-row.component';
import { IgxTreeGridComponent } from '../../grids/tree-grid/public_api';
import { IgxTreeGridEditActionsComponent } from '../../test-utils/tree-grid-components.spec';
import { IgxGridEditingActionsComponent } from './grid-editing-actions.component';
import { IgxGridPinningActionsComponent } from './grid-pinning-actions.component';
import { IgxActionStripComponent } from '../action-strip.component';
import { IRowDataCancelableEventArgs, IgxColumnComponent } from '../../grids/public_api';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';

describe('igxGridEditingActions #grid ', () => {
    let actionStrip: IgxActionStripComponent;
    let grid: IgxGridComponent;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                IgxHierarchicalGridActionStripComponent,
                IgxTreeGridEditActionsComponent,
                IgxActionStripTestingComponent,
                IgxActionStripPinEditComponent,
                IgxActionStripEditMenuComponent,
                IgxActionStripOneRowComponent,
                IgxActionStripMenuOneRowComponent
            ]
        }).compileComponents();
    }));

    afterEach(() => vi.restoreAllMocks());

    describe('Base ', () => {
        let fixture: ComponentFixture<IgxActionStripTestingComponent>;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxActionStripTestingComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip();
            grid = fixture.componentInstance.grid();
        });

        it('should allow editing and deleting row', () => {
            let deleteIcon;
            actionStrip.show(grid.rowList.first);
            fixture.detectChanges();
            const editIcon = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`))[0];
            expect(editIcon.nativeElement.innerText).toBe('edit');
            editIcon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();
            expect(grid.gridAPI.crudService.rowInEditMode).not.toBeNull();
            expect(grid.rowList.first.inEditMode).toBe(true);

            expect(grid.rowList.first.data['ID']).toBe('ALFKI');
            const dataLength = grid.dataLength;
            actionStrip.show(grid.rowList.first);
            fixture.detectChanges();
            deleteIcon = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`))[1];
            // grid actions should not showing when the row is in edit mode #
            expect(deleteIcon).toBeUndefined();
            grid.gridAPI.crudService.endEdit();
            actionStrip.show(grid.rowList.first);
            fixture.detectChanges();
            deleteIcon = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`))[1];
            expect(deleteIcon.nativeElement.innerText).toBe('delete');
            deleteIcon.parent.triggerEventHandler('click', new Event('click'));
            actionStrip.hide();
            fixture.detectChanges();
            expect(grid.rowList.first.data['ID']).toBe('ANATR');
            expect(dataLength - 1).toBe(grid.dataLength);
        });

        it('should focus the first cell when editing mode is cell', () => {
            fixture.detectChanges();
            grid.selectRange({ rowStart: 0, rowEnd: 0, columnStart: 'ContactName', columnEnd: 'ContactName' });
            fixture.detectChanges();
            grid.actionStrip.show(grid.rowList.first);
            fixture.detectChanges();
            const editIcon = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`))[0];
            expect(editIcon.nativeElement.innerText).toBe('edit');
            editIcon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();
            // first cell of the row should be the active one, excluding ID as primaryKey
            expect(grid.selectionService.activeElement.column).toBe(1);
            expect(grid.selectionService.activeElement.row).toBe(0);
        });

        it('should allow hiding/showing the edit/delete actions via the related property.', () => {
            const editActions = fixture.componentInstance.actionStrip().actionButtons.first as IgxGridEditingActionsComponent;
            editActions.editRow = false;
            fixture.detectChanges();

            grid.actionStrip.show(grid.rowList.first);
            fixture.detectChanges();
            let icons = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`));
            let iconsText = icons.map(x => x.nativeElement.innerText);
            expect(iconsText).toEqual(['delete']);

            editActions.editRow = true;
            editActions.deleteRow = false;
            fixture.detectChanges();

            icons = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions igx-icon`));
            iconsText = icons.map(x => x.nativeElement.innerText);
            expect(iconsText).toEqual(['edit']);
        });
    });

    describe('Menu ', () => {
        let fixture: ComponentFixture<IgxActionStripEditMenuComponent>

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxActionStripEditMenuComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip();
            grid = fixture.componentInstance.grid();
        });
        it('should allow editing and deleting row via menu', async () => {
            const row = grid.rowList.toArray()[0];
            actionStrip.show(row);
            fixture.detectChanges();

            actionStrip.menu.open();
            fixture.detectChanges();
            expect(actionStrip.menu.items.length).toBe(2);
            const editMenuItem = actionStrip.menu.items[0];

            // select edit
            actionStrip.menu.selectItem(editMenuItem);
            fixture.detectChanges();

            expect(row.inEditMode).toBe(true);

            grid.gridAPI.crudService.endEdit();
            fixture.detectChanges();
            actionStrip.menu.open();
            fixture.detectChanges();
            const deleteMenuItem = actionStrip.menu.items[1];

            // select delete
            actionStrip.menu.selectItem(deleteMenuItem);
            fixture.detectChanges();

            expect(grid.rowList.first.data['ID']).toBe('ANATR');
        });
        it('should not auto-hide on mouse leave of row if action strip is menu', () => {
            fixture = TestBed.createComponent(IgxActionStripMenuOneRowComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip();
            grid = fixture.componentInstance.grid();

            const row = grid.getRowByIndex(0);
            row.pin();
            const rowElem = grid.pinnedRows[0];
            row.unpin();

            actionStrip.show(row);
            fixture.detectChanges();

            actionStrip.menu.open();
            fixture.detectChanges();

            UIInteractions.simulateMouseEvent('mouseleave', rowElem.element.nativeElement, 0, 200);
            fixture.detectChanges();

            expect(actionStrip.hidden).toBe(false);
        });
    });

    describe('integration with pinning actions ', () => {
        let fixture: ComponentFixture<IgxActionStripPinEditComponent>;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxActionStripPinEditComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip();
            grid = fixture.componentInstance.grid();
        });
        it('should remove editing actions on disabled rows', () => {
            grid.rowList.first.pin();
            fixture.detectChanges();
            actionStrip.show(grid.rowList.toArray()[1]);
            fixture.detectChanges();
            const editingIcons = fixture.debugElement.queryAll(By.css(`igx-grid-editing-actions button`));
            const pinningIcons = fixture.debugElement.queryAll(By.css(`igx-grid-pinning-actions button`));
            expect(editingIcons.length).toBe(0);
            expect(pinningIcons.length).toBe(1);
            expect(pinningIcons[0].nativeElement.className.indexOf('igx-button--disabled') === -1).toBeTruthy();
        });

        it('should emit correct rowPinning arguments with pinning actions', () => {
            const rowPinningSpy = vi.spyOn(grid.rowPinning, 'emit');
            const row = grid.getRowByIndex(1);

            actionStrip.show(grid.rowList.toArray()[1]);
            fixture.detectChanges();
            let pinningIcon = fixture.debugElement.queryAll(By.css(`igx-grid-pinning-actions igx-icon`))[0];

            pinningIcon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();

            expect(rowPinningSpy).toHaveBeenCalledTimes(1);
            expect(rowPinningSpy).toHaveBeenCalledWith({
                rowID: row.key,
                rowKey: row.key,
                insertAtIndex: 0,
                isPinned: true,
                row,
                cancel: false
            });

            const row5 = grid.getRowByIndex(4);
            actionStrip.show(grid.rowList.toArray()[4]);
            fixture.detectChanges();
            pinningIcon = fixture.debugElement.queryAll(By.css(`igx-grid-pinning-actions igx-icon`))[0];

            pinningIcon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();

            expect(rowPinningSpy).toHaveBeenCalledTimes(2);
            expect(rowPinningSpy).toHaveBeenCalledWith({
                rowID: row5.key,
                rowKey: row5.key,
                insertAtIndex: 1,
                isPinned: true,
                row: row5,
                cancel: false
            });
        });
    });

    describe('auto show/hide', () => {
        let fixture: ComponentFixture<IgxActionStripPinEditComponent>;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxActionStripPinEditComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip();
            grid = fixture.componentInstance.grid();
        });
        it('should auto-show on mouse enter of row.', () => {
            const row = grid.gridAPI.get_row_by_index(0);
            const rowElem = row.nativeElement;
            UIInteractions.simulateMouseEvent('mouseenter', rowElem, 0, 0);
            fixture.detectChanges();

            expect(actionStrip.context).toBe(row);
            expect(actionStrip.hidden).toBe(false);
        });
        it('should auto-hide on mouse leave of row.', async () => {
            fixture = TestBed.createComponent(IgxActionStripOneRowComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip();
            grid = fixture.componentInstance.grid();

            const row = grid.getRowByIndex(0);
            row.pin();
            const rowElem = grid.pinnedRows[0];

            actionStrip.show(row);
            fixture.detectChanges();

            expect(actionStrip.hidden).toBe(false);
            UIInteractions.simulateMouseEvent('mouseleave', rowElem.element.nativeElement, 0, 200);
            fixture.detectChanges();

            expect(actionStrip.hidden).toBe(true);
        });
        it('should auto-hide on mouse leave of grid.', () => {
            const row = grid.getRowByIndex(0);
            actionStrip.show(row);
            fixture.detectChanges();

            expect(actionStrip.hidden).toBe(false);
            UIInteractions.simulateMouseEvent('mouseleave', grid.nativeElement, 0, 0);
            fixture.detectChanges();

            expect(actionStrip.hidden).toBe(true);
        });
    });

    describe('auto show/hide in HierarchicalGrid', () => {
        let fixture: ComponentFixture<IgxHierarchicalGridActionStripComponent>;

        let actionStripRoot: IgxActionStripComponent;
        let actionStripChild: IgxActionStripComponent;
        let hierarchicalGrid: IgxHierarchicalGridComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridActionStripComponent);
            fixture.detectChanges();
            actionStripRoot = fixture.componentInstance.actionStripRoot;
            actionStripChild = fixture.componentInstance.actionStripChild;
            hierarchicalGrid = fixture.componentInstance.hgrid;
        });

        it('should auto-show root actionStrip on mouse enter of root row.', () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0);
            const rowElem = row.nativeElement;
            UIInteractions.simulateMouseEvent('mouseenter', rowElem, 0, 0);
            fixture.detectChanges();

            expect(actionStripRoot.context).toBe(row);
            expect(actionStripRoot.hidden).toBe(false);
            expect(actionStripChild.context).toBeUndefined();
        });

        it('should auto-show row island actionStrip on mouse enter of child row.', () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            row.toggle();
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[1];

            const childRow = childGrid.gridAPI.get_row_by_index(0);
            const rowElem = childRow.nativeElement;
            UIInteractions.simulateMouseEvent('mouseenter', rowElem, 0, 0);
            fixture.detectChanges();

            expect(actionStripChild.context).toBe(childRow);
            expect(actionStripChild.hidden).toBe(false);

            expect(actionStripRoot.context).toBeUndefined();
        });

        it('should auto-hide all actionStrip on mouse leave of root grid.', () => {
            const row = hierarchicalGrid.getRowByIndex(0);
            row.expanded = !row.expanded;
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const childRow = childGrid.gridAPI.get_row_by_index(0);

            actionStripRoot.show(row);
            actionStripChild.show(childRow);
            fixture.detectChanges();

            UIInteractions.simulateMouseEvent('mouseleave', hierarchicalGrid.nativeElement, 0, 0);
            fixture.detectChanges();

            expect(actionStripRoot.hidden).toBe(true);
            expect(actionStripChild.hidden).toBe(true);
        });
    });

    describe('TreeGrid - action strip', () => {
        let fixture: ComponentFixture<IgxTreeGridEditActionsComponent>;
        let treeGrid: IgxTreeGridComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxTreeGridEditActionsComponent);
            fixture.detectChanges();
            treeGrid = fixture.componentInstance.treeGrid;
            actionStrip = fixture.componentInstance.actionStrip;
        });

        it('should allow deleting row', () => {
            const rowDeleteSpy = vi.spyOn(treeGrid.rowDelete, 'emit');
            const rowDeletedSpy = vi.spyOn(treeGrid.rowDeleted, 'emit');

            const row = treeGrid.rowList.toArray()[0];
            actionStrip.show(row);
            fixture.detectChanges();

            const editActions = fixture.debugElement.queryAll(By.css(`igx-grid-action-button`));
            expect(editActions[3].componentInstance.iconName).toBe('delete');
            const deleteChildBtn = editActions[3].componentInstance;

            const rowDeleteArgs: IRowDataCancelableEventArgs = {
                rowID: row.key,
                primaryKey: row.key,
                rowKey: row.key,
                cancel: false,
                rowData: treeGrid.getRowData(row.key),
                data: treeGrid.getRowData(row.key),
                oldValue: null,
                owner: treeGrid,
            };

            const rowDeletedArgs = {
                data: treeGrid.getRowData(row.key),
                rowData: treeGrid.getRowData(row.key),
                primaryKey: row.key,
                rowKey: row.key,
                owner: treeGrid
            };

            // select delete
            deleteChildBtn.actionClick.emit();
            fixture.detectChanges();

            expect(rowDeleteSpy).toHaveBeenCalledExactlyOnceWith(rowDeleteArgs);
            expect(rowDeletedSpy).toHaveBeenCalledExactlyOnceWith(rowDeletedArgs);
            expect(treeGrid.rowList.first.data['ID']).toBe(6);
        });
    });
});

@Component({
    template: `
    <igx-grid [data]="data" [width]="'800px'" [height]="'500px'"
        [rowEditable]="true" [primaryKey]="'ID'">
        @for (c of columns; track c.field) {
            <igx-column [sortable]="true" [field]="c.field" [header]="c.field"
                [width]="c.width" [pinned]='c.pinned' [hidden]='c.hidden'>
            </igx-column>
        }

        <igx-action-strip>
            <igx-grid-editing-actions></igx-grid-editing-actions>
        </igx-action-strip>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxActionStripComponent, IgxGridEditingActionsComponent]
})
class IgxActionStripTestingComponent implements OnInit {
    public actionStrip = viewChild.required(IgxActionStripComponent);
    public grid = viewChild.required(IgxGridComponent);

    public data: any[];
    public dataOneRow: any[];
    public columns: any[];

    public ngOnInit() {

        this.columns = [
            { field: 'ID', width: '200px', hidden: false },
            { field: 'CompanyName', width: '200px' },
            { field: 'ContactName', width: '200px', pinned: false },
            { field: 'ContactTitle', width: '300px', pinned: false },
            { field: 'Address', width: '250px' },
            { field: 'City', width: '200px' },
            { field: 'Region', width: '300px' },
            { field: 'PostalCode', width: '150px' },
            { field: 'Phone', width: '200px' },
            { field: 'Fax', width: '200px' }
        ];

        this.data = SampleTestData.contactInfoDataFull();

        this.dataOneRow = [
            { ID: 'ALFKI', CompanyName: 'Alfreds Futterkiste', ContactName: 'Maria Anders', ContactTitle: 'Sales Representative', Address: 'Obere Str. 57', City: 'Berlin', Region: null, PostalCode: '12209', Country: 'Germany', Phone: '030-0074321', Fax: '030-0076545' },
        ];
    }
}

@Component({
    template: `
    <igx-grid [data]="data" [width]="'800px'" [height]="'500px'"
        [rowEditable]="true" [primaryKey]="'ID'">
        @for (c of columns; track c.field) {
            <igx-column [sortable]="true" [field]="c.field" [header]="c.field"
                [width]="c.width" [pinned]='c.pinned' [hidden]='c.hidden'>
            </igx-column>
        }

        <igx-action-strip>
            <igx-grid-pinning-actions></igx-grid-pinning-actions>
            <igx-grid-editing-actions></igx-grid-editing-actions>
        </igx-action-strip>
    </igx-grid>
    `,
    selector: 'igx-action-strip-pin-edit-component',
    imports: [IgxGridComponent, IgxColumnComponent, IgxActionStripComponent, IgxGridPinningActionsComponent, IgxGridEditingActionsComponent]
})
class IgxActionStripPinEditComponent extends IgxActionStripTestingComponent {
}

@Component({
    template: `
    <igx-grid [data]="data" [width]="'800px'" [height]="'500px'"
        [rowEditable]="true" [primaryKey]="'ID'">
        @for (c of columns; track c.field) {
            <igx-column [sortable]="true" [field]="c.field" [header]="c.field"
                [width]="c.width" [pinned]='c.pinned' [hidden]='c.hidden'>
            </igx-column>
        }

        <igx-action-strip>
            <igx-grid-editing-actions [asMenuItems]='true'></igx-grid-editing-actions>
        </igx-action-strip>
    </igx-grid>
    `,
    selector: 'igx-action-strip-edit-menu-component',
    imports: [IgxGridComponent, IgxColumnComponent, IgxActionStripComponent, IgxGridEditingActionsComponent]
})
class IgxActionStripEditMenuComponent extends IgxActionStripTestingComponent {
}

@Component({
    template: `
    <igx-grid [data]="dataOneRow" [width]="'800px'" [height]="'500px'"
        [rowEditable]="true" [primaryKey]="'ID'">
        @for (c of columns; track c.field) {
            <igx-column [sortable]="true" [field]="c.field" [header]="c.field"
                [width]="c.width" [pinned]='c.pinned' [hidden]='c.hidden'>
            </igx-column>
        }

        <igx-action-strip>
            <igx-grid-pinning-actions></igx-grid-pinning-actions>
            <igx-grid-editing-actions></igx-grid-editing-actions>
        </igx-action-strip>
    </igx-grid>
    `,
    selector: 'igx-action-strip-one-row-component',
    imports: [IgxGridComponent, IgxColumnComponent, IgxActionStripComponent, IgxGridEditingActionsComponent, IgxGridPinningActionsComponent]
})
class IgxActionStripOneRowComponent extends IgxActionStripTestingComponent {
}

@Component({
    template: `
    <igx-grid [data]="dataOneRow" [width]="'800px'" [height]="'500px'"
        [rowEditable]="true" [primaryKey]="'ID'">
        @for (c of columns; track c.field) {
            <igx-column [sortable]="true" [field]="c.field" [header]="c.field"
                [width]="c.width" [pinned]='c.pinned' [hidden]='c.hidden'>
            </igx-column>
        }

        <igx-action-strip>
            <igx-grid-editing-actions [asMenuItems]='true'></igx-grid-editing-actions>
        </igx-action-strip>
    </igx-grid>
    `,
    selector: 'igx-action-strip-menu-one-row-component',
    imports: [IgxGridComponent, IgxColumnComponent, IgxActionStripComponent, IgxGridEditingActionsComponent]
})
class IgxActionStripMenuOneRowComponent extends IgxActionStripTestingComponent {
}
