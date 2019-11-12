import { Component, ViewChild, EventEmitter, OnInit } from '@angular/core';
import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { UIInteractions, wait} from '../../test-utils/ui-interactions.spec';
import { IgxGridModule } from './index';
import { IgxGridComponent } from './grid.component';
import { IgxGridRowComponent } from './grid-row.component';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxGridExpandableCellComponent } from './expandable-cell.component';

const COLLAPSED_ICON_NAME = 'chevron_right';
const EXPANDED_ICON_NAME = 'expand_more';
const DEBOUNCETIME = 30;

describe('IgxGrid Master Detail #grid', () => {
    let fix: ComponentFixture<any>;
    let grid: IgxGridComponent;

    configureTestSuite();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultGridMasterDetailComponent,
                AllExpandedGridMasterDetailComponent
            ],
            imports: [IgxGridModule, NoopAnimationsModule]
        }).compileComponents();
    }));


    describe('Basic', () => {
        beforeEach(async(() => {
            fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should render an expand icon for all rows', () => {
            const expandIcons = grid.rowList.map((row) => {
                const icon = row.element.nativeElement.querySelector('igx-icon');
                if (icon.innerText === 'chevron_right') {
                    return icon;
                }
                return null;
            }).filter(icon => icon !== null);
            expect(grid.rowList.length).toEqual(expandIcons.length);
        });

        it('Should correctly expand a basic detail view, update expansionStates and the context proved should be correct', (async() => {
            await GridFunctions.expandMasterRowByClick(fix, grid.rowList.first);

            const firstRowIcon = grid.rowList.first.element.nativeElement.querySelector('igx-icon');
            const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);

            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.first.rowID)).toBeTruthy();
            expect(grid.expansionStates.get(grid.rowList.first.rowID)).toBeTruthy();
            expect(firstRowIcon.innerText).toEqual(EXPANDED_ICON_NAME);
            expect(firstRowDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');
        }));

        it('Should expand and collapse a row in view by using the expand(rowID) and collapse(rowID) methods.', () => {
            grid.expand(fix.componentInstance.data[0].ID);
            fix.detectChanges();
            let firstRowIcon = grid.rowList.first.element.nativeElement.querySelector('igx-icon');
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.first.rowID)).toBeTruthy();
            expect(grid.rowList.toArray()[0].expanded).toBeTruthy();
            expect(firstRowIcon.innerText).toEqual(EXPANDED_ICON_NAME);
            grid.collapse(fix.componentInstance.data[0].ID);
            fix.detectChanges();
            firstRowIcon = grid.rowList.first.element.nativeElement.querySelector('igx-icon');
            expect(grid.expansionStates.get(fix.componentInstance.data[0].ID)).toBeFalsy();
            expect(grid.rowList.toArray()[0].expanded).toBeFalsy();
            expect(firstRowIcon.innerText).toEqual(COLLAPSED_ICON_NAME);
        });

        it('Should expand a row out of view by using the collapse() method and update expansionStates.', () => {
            const lastIndex = fix.componentInstance.data.length - 1;
            const lastDataRecID = fix.componentInstance.data[lastIndex].ID;
            grid.expand(lastDataRecID);
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.get(lastDataRecID)).toBeTruthy();
        });

        it('Should collapse a row out of view by using the collapse() method and update expansionStates.', () => {
            GridFunctions.setAllExpanded(grid, fix.componentInstance.data);
            fix.detectChanges();
            const lastIndex = fix.componentInstance.data.length - 1;
            const lastDataRecID = fix.componentInstance.data[lastIndex].ID;
            grid.collapse(lastDataRecID);
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(fix.componentInstance.data.length);
            expect(grid.expansionStates.get(lastDataRecID)).toBeFalsy();
        });

        it('Should toggle a row expand state by using the toggleRow(rowID) method.', () => {
            grid.toggleRow(fix.componentInstance.data[0].ID);
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(1);
            expect(grid.expansionStates.has(grid.rowList.first.rowID)).toBeTruthy();
            expect(grid.rowList.toArray()[0].expanded).toBeTruthy();
            grid.toggleRow(fix.componentInstance.data[0].ID);
            fix.detectChanges();
            expect(grid.expansionStates.get(fix.componentInstance.data[0].ID)).toBeFalsy();
            expect(grid.rowList.toArray()[0].expanded).toBeFalsy();
        });

        it('Should expand all rows using the expandAll() method and the expansion state should be updated.', () => {
            grid.expandAll();
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(fix.componentInstance.data.length);
            grid.rowList.toArray().forEach(row => {
                expect(row.expanded).toBeTruthy();
            });
        });

        it('Should collapse all rows using the collapseAll() method and the expansion state should be updated.', () => {
            GridFunctions.setAllExpanded(grid, fix.componentInstance.data);
            fix.detectChanges();
            grid.rowList.toArray().forEach(row => {
                expect(row.expanded).toBeTruthy();
            });
            grid.collapseAll();
            fix.detectChanges();
            expect(grid.expansionStates.size).toEqual(0);
            grid.rowList.toArray().forEach(row => {
                expect(row.expanded).toBeFalsy();
            });
        });
    });

    describe('Keyboard Navigation ', () => {

        beforeEach(async(() => {
            fix = TestBed.createComponent(AllExpandedGridMasterDetailComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        }));

        it('Should navigate down through a detail view by focusing the whole row and continuing onto the next with arrow down.',
        async() => {
            const targetCellElement = grid.getCellByColumn(0, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);
            expect(document.activeElement).toBe(firstRowDetail);
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', firstRowDetail, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(grid.getCellByColumn(2, 'ContactName').selected).toBeTruthy();
        });

        it('Should navigate down through a detail view partially out of view by scrolling it so it becomes fully visible.', async() => {
            const row = grid.getRowByIndex(4) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(4, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = GridFunctions.getMasterRowDetail(row);
            expect(document.activeElement).toBe(detailRow);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();
        });

        it('Should navigate down through a detail view completely out of view by scrolling to it.', async() => {
            grid.navigateTo(6, 0);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(6) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(6, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = GridFunctions.getMasterRowDetail(row);
            expect(document.activeElement).toBe(detailRow);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();
        });

        it('Should navigate up through a detail view by focusing the whole row and continuing onto the next with arrow up.', async() => {
            const prevRow = grid.getRowByIndex(0) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(2, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = GridFunctions.getMasterRowDetail(prevRow);
            expect(document.activeElement).toBe(detailRow);
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', detailRow, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(prevRow.cells.toArray()[0].selected).toBeTruthy();
        });

        it('Should navigate up through a detail view partially out of view by scrolling it so it becomes fully visible.', async() => {
            grid.verticalScrollContainer.addScrollTop(90);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(2);
            const targetCellElement = grid.getCellByColumn(2, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = row.element.nativeElement.previousElementSibling;
            expect(document.activeElement).toBe(detailRow);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();
        });

        it('Should navigate up through a detail view completely out of view by scrolling to it.', async() => {
            grid.verticalScrollContainer.addScrollTop(170);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(2);
            const targetCellElement = grid.getCellByColumn(2, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = row.element.nativeElement.previousElementSibling;
            expect(document.activeElement).toBe(detailRow);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();
        });

        it(`Should focus detail row first, then continue to the focusable elements in
         it and continue onto the next row when using Tab.`, async() => {
            const row = grid.getRowByIndex(0) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(0, 'CompanyName');
            UIInteractions.triggerKeyDownEvtUponElem('tab', targetCellElement, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = GridFunctions.getMasterRowDetail(row);
            expect(document.activeElement).toBe(detailRow);
            const lastTabbable = detailRow.querySelector('input[name="Comment"]');
            UIInteractions.triggerKeyDownEvtUponElem('tab', lastTabbable, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            expect(document.activeElement).toBe(grid.getCellByColumn(2, 'ContactName').nativeElement);
         });

         it(`Should focus the last focusable element in detail first
         and go in reverse order of all elements when tabbing through detail view using Shift+Tab.`, async() => {
            const prevRow = grid.getRowByIndex(0) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(2, 'ContactName');
            UIInteractions.triggerKeyDownEvtUponElem('tab', targetCellElement, true, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const detailRow = GridFunctions.getMasterRowDetail(prevRow);
            const lastTabbable = detailRow.querySelector('input[name="Comment"]');
            expect(document.activeElement).toBe(lastTabbable);
            UIInteractions.triggerKeyDownEvtUponElem('tab', detailRow, true, false, true);
            await wait(DEBOUNCETIME);
            fix.detectChanges();

            expect(document.activeElement).toBe(grid.getCellByColumn(0, 'CompanyName').nativeElement);
         });

         it('Should expand and collapse using Alt + Right/Down and Alt + Left/Up without losing focus on current row.', async() => {
            const row = grid.getRowByIndex(0) as IgxGridRowComponent;
            const targetCellElement = grid.getCellByColumn(0, 'ContactName');
            UIInteractions.clickElement(targetCellElement);
            fix.detectChanges();
            expect(targetCellElement.focused).toBeTruthy();
            // collapse with alt + arrowup
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true, true, false);
            fix.detectChanges();
            expect(row.expanded).toBeFalsy();
            expect(targetCellElement.focused).toBeTruthy();

            // expand with alt + arrowdown
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true, true, false);
            fix.detectChanges();
            expect(row.expanded).toBeTruthy();
            expect(targetCellElement.focused).toBeTruthy();

             // collapse with alt + arrowleft
             UIInteractions.triggerKeyDownEvtUponElem('arrowleft', targetCellElement, true, true, false);
             fix.detectChanges();
             expect(row.expanded).toBeFalsy();
             expect(targetCellElement.focused).toBeTruthy();

            // expand with alt + arrowright
            UIInteractions.triggerKeyDownEvtUponElem('arrowright', targetCellElement, true, true, false);
            fix.detectChanges();
            expect(row.expanded).toBeTruthy();
            expect(targetCellElement.focused).toBeTruthy();
         });

        it(`Should expand and collapse using Alt + Right/Down and Alt + Left/Up
            at the bottom of the grid without losing focus.`, async() => {
            // navigate to last
            grid.verticalScrollContainer.scrollTo(grid.verticalScrollContainer.igxForOf.length - 1);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            const row = grid.getRowByIndex(52) as IgxGridRowComponent;
            let targetCellElement = grid.getCellByColumn(52, 'ContactName');
            UIInteractions.clickElement(targetCellElement);
            fix.detectChanges();
            expect(targetCellElement.focused).toBeTruthy();

            // collapse with alt + arrowup
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', targetCellElement, true, true, false);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            expect(row.expanded).toBeFalsy();
            targetCellElement = grid.getCellByColumn(52, 'ContactName');
            expect(targetCellElement.focused).toBeTruthy();

            // expand with alt + arrowdown
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', targetCellElement, true, true, false);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            await wait(DEBOUNCETIME);
            expect(row.expanded).toBeTruthy();
            targetCellElement = grid.getCellByColumn(52, 'ContactName');
            expect(targetCellElement.focused).toBeTruthy();
        });

        it('Should navigate to the correct row/cell when using the navigateTo method in a grid with expanded detail views.', async() => {
            grid.navigateTo(20, 0);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            let row = grid.getRowByIndex(20) as IgxGridRowComponent;
            expect(row).not.toBeNull();
            expect(GridFunctions.elementInGridView(grid, row.nativeElement)).toBeTruthy();
            grid.navigateTo(21, 0);
            await wait(DEBOUNCETIME);
            fix.detectChanges();
            row = grid.getRowByIndex(20) as IgxGridRowComponent;
            const detailRow = GridFunctions.getMasterRowDetail(row);
            expect(GridFunctions.elementInGridView(grid, detailRow)).toBeTruthy();

         });
    });

    describe('Integration', () => {

        describe('Paging', () => {
            it('Should not take into account expanded detail views as additional records.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                fix.componentInstance.paging = true;
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                const initialTotalRecords = grid.pagingState.metadata.countRecords;
                grid.expand(fix.componentInstance.data[0].ID);
                fix.detectChanges();
                expect(grid.pagingState.metadata.countRecords).toEqual(initialTotalRecords);
            });

            it('Should persist template state after paging to a page with fewer records and paging back.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                fix.componentInstance.paging = true;
                fix.componentInstance.perPage = 5;
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                grid.expand(fix.componentInstance.data[4].ID);
                fix.detectChanges();
                // click the template checkbox
                let checkbox = fix.debugElement.query(By.css('.igx-checkbox__input'));
                checkbox.nativeElement.click();
                fix.detectChanges();
                // go to last page that doesn't contain this view
                grid.page = grid.pagingState.metadata.countPages - 1;
                fix.detectChanges();
                // go back to first page
                grid.page = 0;
                fix.detectChanges();
                // check checkbox state
                checkbox = fix.debugElement.query(By.css('.igx-checkbox__input'));
                expect(checkbox.nativeElement.attributes['aria-checked'].value).toEqual('true');
            });
        });

        describe('Hiding', () => {
            it('Should set the expand/collapse icon to the new first visible column when hiding the first column.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                grid.columnList.first.hidden = true;
                fix.detectChanges();
                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
            });
        });

        describe('Pinning', () => {
            it('Should keep/move the expand/collapse icon to the correct column when pinning the first column or another one.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                grid.columnList.last.pin();
                fix.detectChanges();
                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
                grid.pinnedColumns[0].unpin();
                fix.detectChanges();
                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
            });

            it('Should render detail view correctly when expanding a master row and there are pinned columns.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                grid.columnList.last.pin();
                grid.expand(fix.componentInstance.data[0].ID);
                fix.detectChanges();
                const firstRowDetail = GridFunctions.getMasterRowDetail(grid.rowList.first);

                expect(firstRowDetail.querySelector('.addressArea').innerText).toEqual('Obere Str. 57');
                expect(firstRowDetail.querySelector('.igx-grid__hierarchical-indent')).toBeDefined();
            });
        });

        describe('Column Moving', () => {
            it('Should keep the expand/collapse icon in the first column, even when moving a column in first place.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                grid.moveColumn(grid.columnList.last, grid.columnList.first);
                fix.detectChanges();
                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
            });
            it('Should keep the expand/collapse icon in the first column, even when moving a column out of first place.', () => {
                fix = TestBed.createComponent(DefaultGridMasterDetailComponent);
                grid = fix.componentInstance.grid;
                fix.detectChanges();
                grid.moveColumn(grid.columnList.first, grid.columnList.last);
                fix.detectChanges();
                expect(grid.rowList.first.cells.first instanceof IgxGridExpandableCellComponent).toBeTruthy();
            });
        });
    });
});

@Component({
    template: `
        <igx-grid [data]="data" [width]="width" [height]="height" [primaryKey]="'ID'"
        [paging]="paging" [perPage]="perPage" [rowSelectable]="rowSelectable">
            <igx-column *ngFor="let c of columns" [field]="c.field" [header]="c.field" [width]="c.width" [dataType]='c.dataType'
                [hidden]='c.hidden' [sortable]="c.sortable" [movable]='c.movable' [groupable]='c.groupable' [editable]="c.editable"
                [hasSummary]="c.hasSummary" [pinned]='c.pinned'>
            </igx-column>

            <ng-template igxGridDetail let-dataItem>
                <div>
                    <div class="checkboxArea">
                        <igx-checkbox (change)="onCheckboxClicked($event, dataItem)" [disableRipple]="true"></igx-checkbox>
                        <span style="font-weight: 600">Available</span>
                    </div>
                    <div class="addressArea">{{dataItem.Address}}</div>
                    <div class="inputArea"><input type="text" name="Comment"></div>
                </div>
            </ng-template>
        </igx-grid>
    `
})
export class DefaultGridMasterDetailComponent {

    public width = '800px';
    public height = '500px';
    public data = SampleTestData.contactInfoDataFull();
    public columns = [
        { field: 'ContactName', width: 400, dataType: 'string' },
        { field: 'CompanyName', width: 400, dataType: 'string' }
    ];
    public paging = false;
    public perPage = 15;
    public rowSelectable = false;

    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    public checkboxChanged: EventEmitter<any>;

    public onCheckboxClicked() {

    }

    public checkboxClicked(event, context) {
        this.checkboxChanged.emit({ event: event, context: context });
    }
}

@Component({
    template: `
        <igx-grid [data]="data" [expansionStates]='expStates'
         [width]="width" [height]="height" [primaryKey]="'ID'" [paging]="paging" [rowSelectable]="rowSelectable">
            <igx-column *ngFor="let c of columns" [field]="c.field" [header]="c.field" [width]="c.width" [dataType]='c.dataType'
                [hidden]='c.hidden' [sortable]="c.sortable" [movable]='c.movable' [groupable]='c.groupable' [editable]="c.editable"
                [hasSummary]="c.hasSummary" [pinned]='c.pinned'>
            </igx-column>

            <ng-template igxGridDetail let-dataItem>
                <div>
                    <div class="checkboxArea">
                        <igx-checkbox (change)="onCheckboxClicked($event, dataItem)" [disableRipple]="true"></igx-checkbox>
                        <span style="font-weight: 600">Available</span>
                    </div>
                    <div class="addressArea">{{dataItem.Address}}</div>
                    <div class="inputArea"><input type="text" name="Comment"></div>
                </div>
            </ng-template>
        </igx-grid>
    `
})
export class AllExpandedGridMasterDetailComponent extends DefaultGridMasterDetailComponent implements OnInit {
    public expStates = new Map<any, boolean>();
    ngOnInit(): void {
        const allExpanded = new Map<any, boolean>();
        this.data.forEach(item => {
            allExpanded.set(item['ID'], true);
        });
        this.expStates = allExpanded;
    }
}
