import { configureTestSuite } from '../../test-utils/configure-suite';
import { TestBed, fakeAsync, tick, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IGridCreatedEventArgs } from './public_api';
import { ChangeDetectorRef, Component, ViewChild, AfterViewInit, QueryList } from '@angular/core';
import { IgxChildGridRowComponent, IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { By } from '@angular/platform-browser';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { IgxHeaderCollapsedIndicatorDirective, IgxHeaderExpandedIndicatorDirective, IgxRowCollapsedIndicatorDirective, IgxRowExpandedIndicatorDirective } from '../public_api';
import { GridSelectionMode, Size } from '../common/enums';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { IgxGridCellComponent } from '../cell.component';
import { NgFor, NgIf } from '@angular/common';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxExcelStyleColumnOperationsTemplateDirective, IgxExcelStyleFilterOperationsTemplateDirective, IgxGridExcelStyleFilteringComponent } from '../filtering/excel-style/excel-style-filtering.component';
import { IgxExcelStyleHeaderComponent } from '../filtering/excel-style/excel-style-header.component';
import { IgxExcelStyleSortingComponent } from '../filtering/excel-style/excel-style-sorting.component';
import { IgxExcelStyleSearchComponent } from '../filtering/excel-style/excel-style-search.component';
import { IgxCellHeaderTemplateDirective } from '../columns/templates.directive';
import { CellType, ColumnType, IGridCellEventArgs, IgxColumnComponent, IgxColumnGroupComponent, IgxRowEditActionsDirective, IgxRowEditTextDirective } from '../public_api';
import { getComponentSize } from '../../core/utils';
import { setElementSize } from '../../test-utils/helper-utils.spec';

describe('Basic IgxHierarchicalGrid #hGrid', () => {
    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxHierarchicalGridTestBaseComponent,
                IgxHierarchicalGridMultiLayoutComponent,
                IgxHierarchicalGridSizingComponent,
                IgxHGridRemoteOnDemandComponent,
                IgxHierarchicalGridColumnsUpdateComponent,
                IgxHierarchicalGridHidingPinningColumnsComponent,
                IgxHierarchicalGridToggleRIComponent,
                IgxHierarchicalGridCustomRowEditOverlayComponent,
                IgxHierarchicalGridAutoSizeColumnsComponent,
                IgxHierarchicalGridCustomTemplateComponent,
                IgxHierarchicalGridCustomFilteringTemplateComponent,
                IgxHierarchicalGridToggleRIAndColsComponent,
                IgxHierarchicalGridMCHComponent
            ]
        }).compileComponents();
    }))

    describe('Init IgxHierarchicalGrid #hGrid', () => {
        let fixture;
        let hierarchicalGrid: IgxHierarchicalGridComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
        });

        it('should render expansion indicator as the first element of each expandable row.', () => {
            fixture.componentInstance.data = [
                {ID: 0, ProductName: 'Product: A0'},
                {ID: 1, ProductName: 'Product: A1', childData: fixture.componentInstance.generateDataUneven(1, 1)},
                {ID: 2, ProductName: 'Product: A2', childData: fixture.componentInstance.generateDataUneven(1, 1)}
            ];
            fixture.detectChanges();
            const row1 = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            expect(row1.hasChildren).toBe(true);
            const rowElems = fixture.debugElement.queryAll(By.directive(IgxHierarchicalRowComponent));
            expect(rowElems[0].query(By.css('igx-icon')).nativeElement.innerText).toEqual('chevron_right');
            const row2 = hierarchicalGrid.gridAPI.get_row_by_index(1) as IgxHierarchicalRowComponent;
            expect(row2.hasChildren).toBe(true);
            expect(rowElems[1].query(By.css('igx-icon')).nativeElement.innerText).toEqual('chevron_right');

            const row3 = hierarchicalGrid.gridAPI.get_row_by_index(1) as IgxHierarchicalRowComponent;
            expect(row3.hasChildren).toBe(true);
            expect(rowElems[2].query(By.css('igx-icon')).nativeElement.innerText).toEqual('chevron_right');
        });

        it('should allow expand/collapse rows through the UI', () => {
            const row1 = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            expect(row1.expanded).toBe(false);
            UIInteractions.simulateClickAndSelectEvent(row1.expander);
            fixture.detectChanges();
            expect(row1.expanded).toBe(true);
            expect(hierarchicalGrid.gridAPI.getChildGrids(false).length).toBe(1);
            expect(hierarchicalGrid.gridAPI.get_row_by_index(1) instanceof IgxChildGridRowComponent).toBe(true);
            UIInteractions.simulateClickAndSelectEvent(row1.expander);
            fixture.detectChanges();
            expect(row1.expanded).toBe(false);
            expect(hierarchicalGrid.gridAPI.get_row_by_index(1) instanceof IgxHierarchicalRowComponent).toBe(true);
        });

        it('should change expand/collapse indicators when state of the row changes', () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            const rowElem = fixture.debugElement.queryAll(By.directive(IgxHierarchicalRowComponent))[0];
            expect(rowElem.query(By.css('igx-icon')).nativeElement.innerText).toEqual('chevron_right');
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            expect(rowElem.query(By.css('igx-icon')).nativeElement.innerText).toEqual('expand_more');
        });

        it('should collapse all rows that belongs to a grid via header collapse icon', () => {
            const headerExpanderElem = fixture.debugElement.queryAll(By.css('.igx-grid__hierarchical-expander--header'))[0];
            let icon = headerExpanderElem.query(By.css('igx-icon')).componentInstance;
            let iconTxt = headerExpanderElem.query(By.css('igx-icon')).nativeElement.textContent.toLowerCase();
            expect(iconTxt).toBe('unfold_less');
            expect(icon.getActive).toBe(false);
            // expand row
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            icon = headerExpanderElem.query(By.css('igx-icon')).componentInstance;
            iconTxt = headerExpanderElem.query(By.css('igx-icon')).nativeElement.textContent.toLowerCase();
            expect(iconTxt).toBe('unfold_less');
            expect(icon.getActive).toBe(true);
            expect(hierarchicalGrid.expansionStates.size).toEqual(1);

            UIInteractions.simulateClickAndSelectEvent(icon.el);
            fixture.detectChanges();
            const rows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];
            rows.forEach((r) => {
                expect(r.expanded).toBe(false);
            });
            icon = headerExpanderElem.query(By.css('igx-icon')).componentInstance;
            iconTxt = headerExpanderElem.query(By.css('igx-icon')).nativeElement.textContent.toLowerCase();
            expect(iconTxt).toBe('unfold_less');
            expect(icon.getActive).toBe(false);
            expect(hierarchicalGrid.expansionStates.size).toEqual(0);
        });

        it ('checks if attributes are correctly assigned when grid has or does not have data', () => {

            // Checks if igx-grid__tbody-content attribute is null when there is data in the grid
            const container = fixture.nativeElement.querySelectorAll('.igx-grid__tbody-content')[0];
            expect(container.getAttribute('role')).toBe(null);

            //Filter grid so no results are available and grid is empty
            hierarchicalGrid.filter('index','111',IgxStringFilteringOperand.instance().condition('contains'),true);
            hierarchicalGrid.markForCheck();
            fixture.detectChanges();
            expect(container.getAttribute('role')).toMatch('row');

            // clear grid data and check if attribute is now 'row'
            hierarchicalGrid.clearFilter();
            fixture.componentInstance.clearData();
            fixture.detectChanges();

            expect(container.getAttribute('role')).toMatch('row');
        });

        it('should allow applying initial expansions state for certain rows through expansionStates option', () => {
            // set first row as expanded.
            const state = new Map<any, boolean>();
            state.set(fixture.componentInstance.data[0], true);
            hierarchicalGrid.expansionStates = state;
            hierarchicalGrid.cdr.detectChanges();
            const row1 = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            // verify row is expanded
            expect(row1.expanded).toBe(true);
            expect(hierarchicalGrid.gridAPI.getChildGrids(false).length).toBe(1);
            expect(hierarchicalGrid.gridAPI.get_row_by_index(1) instanceof IgxChildGridRowComponent).toBe(true);
        });

        it('should allow defining more than one nested row islands', () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const childRow = childGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(childRow.expander);
            fixture.detectChanges();

            // should have 3 level hierarchy
            const allChildren =  hierarchicalGrid.gridAPI.getChildGrids(true);
            expect(allChildren.length).toBe(2);
            expect(hierarchicalGrid.gridAPI.get_row_by_index(1) instanceof IgxChildGridRowComponent).toBe(true);
            expect(childGrid.gridAPI.get_row_by_index(1) instanceof IgxChildGridRowComponent).toBe(true);
        });

        it('should retain expansion states when scrolling', async () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            expect(row.expanded).toBe(true);
            // scroll to bottom
            hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.dataView.length - 1);
            await wait(100);
            fixture.detectChanges();
            // scroll to top
            hierarchicalGrid.verticalScrollContainer.scrollTo(0);
            await wait(100);
            fixture.detectChanges();
            expect((hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent).expanded).toBe(true);
        });

        it('should show header collapse button if grid has data and row island is defined.', () => {
            fixture.componentInstance.data = [
                {ID: 0, ProductName: 'Product: A0'}
            ];
            fixture.detectChanges();
            const headerExpanderElem = fixture.debugElement.queryAll(By.css('.igx-grid__hierarchical-expander--header'))[0];
            const icon = headerExpanderElem.query(By.css('igx-icon'));
            expect(icon).toBeDefined();
        });

        it('should render last cell of rows fully visible when columns does not have width specified and without scrollbar', () => {
            const firstRowCell: HTMLElement = (hierarchicalGrid.gridAPI.get_row_by_index(0).cells as QueryList<CellType>).first.nativeElement;
            const cellLeftOffset = firstRowCell.offsetLeft + firstRowCell.parentElement.offsetLeft + firstRowCell.offsetWidth;
            const gridWidth = hierarchicalGrid.nativeElement.offsetWidth;
            expect(cellLeftOffset).not.toBeGreaterThan(gridWidth);

            const hScroll = hierarchicalGrid.headerContainer.getScroll();
            expect((hScroll.firstElementChild as HTMLElement).offsetWidth).not.toBeGreaterThan(hScroll.offsetWidth);
        });

        it('should allow extracting child grids using hgridAPI', () => {
            // set first row as expanded.
            const state = new Map<any, boolean>();
            state.set(fixture.componentInstance.data[0], true);
            hierarchicalGrid.expansionStates = state;
            hierarchicalGrid.cdr.detectChanges();
            const row1 = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            // verify row is expanded
            expect(row1.expanded).toBe(true);
            const childGrid = hierarchicalGrid.gridAPI.getChildGrid([{ rowID: fixture.componentInstance.data[0], rowKey: fixture.componentInstance.data[0], rowIslandKey: 'childData' }]);
            expect(childGrid).not.toBeNull();
            const childState = new Map<any, boolean>();
            childState.set(fixture.componentInstance.data[0].childData[0], true);
            childGrid.expansionStates = childState;
            childGrid.cdr.detectChanges();
            const grandChildGrid = hierarchicalGrid.gridAPI.getChildGrid([
                { rowID: fixture.componentInstance.data[0], rowKey: fixture.componentInstance.data[0], rowIslandKey: 'childData' },
                { rowID: fixture.componentInstance.data[0].childData[0], rowKey: fixture.componentInstance.data[0].childData[0], rowIslandKey: 'childData' }
            ]);
            expect(grandChildGrid).not.toBeNull();

            const rowIsland1 = hierarchicalGrid.gridAPI.getChildRowIsland('childData');
            const rowIsland2 = hierarchicalGrid.allLayoutList.find(layout => layout.id === 'igx-row-island-childData-childData');
            expect(rowIsland1.key).toBe('childData');
            expect(rowIsland2.key).toBe('childData');
        });

        it('should allow setting expandChildren after bound to data', () => {
            // set first row as expanded.
            const state = new Map<any, boolean>();
            state.set(fixture.componentInstance.data[0], true);
            hierarchicalGrid.expansionStates = state;
            hierarchicalGrid.cdr.detectChanges();
            let row1 = hierarchicalGrid.gridAPI.get_row_by_index(0);
            // verify row is expanded
            expect(row1.expanded).toBe(true);
            hierarchicalGrid.expandChildren = false;
            hierarchicalGrid.cdr.detectChanges();
            row1 = hierarchicalGrid.gridAPI.get_row_by_index(0);
            expect(row1.expanded).toBe(false);
            const expandIcons = fixture.debugElement.queryAll(By.css('#igx-icon-15'));
            expect(expandIcons.length).toBe(0);
            let rows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];
            rows.forEach((r) => {
                expect(r.expanded).toBe(false);
            });
            hierarchicalGrid.expandChildren = true;
            hierarchicalGrid.cdr.detectChanges();
            rows = hierarchicalGrid.dataRowList.toArray() as IgxHierarchicalRowComponent[];
            rows.forEach((r) => {
                expect(r.expanded).toBe(true);
            });

            row1 = hierarchicalGrid.gridAPI.get_row_by_index(0);
            expect(row1.expanded).toBe(true);
        });

        it('should correctly expand children on init if parents have hasChild key', () => {
            hierarchicalGrid.expandChildren = true;
            hierarchicalGrid.hasChildrenKey = 'hasChild';
            fixture.componentInstance.data = [
                { ID: 1, ProductName: 'Product: A1', hasChild: false, childData: fixture.componentInstance.generateDataUneven(1, 1) },
                { ID: 2, ProductName: 'Product: A2', hasChild: true, childData: fixture.componentInstance.generateDataUneven(1, 1) }
            ];
            fixture.detectChanges();
            expect(hierarchicalGrid.gridAPI.get_row_by_index(0)).toBeInstanceOf(IgxHierarchicalRowComponent);
            expect(hierarchicalGrid.gridAPI.get_row_by_index(1)).toBeInstanceOf(IgxHierarchicalRowComponent);
            expect(hierarchicalGrid.gridAPI.get_row_by_index(2)).toBeInstanceOf(IgxChildGridRowComponent);
            const rowElems = fixture.debugElement.queryAll(By.directive(IgxHierarchicalRowComponent));
            expect(rowElems[0].query(By.css('igx-icon')).nativeElement.innerText).toEqual('');
            expect(rowElems[1].query(By.css('igx-icon')).nativeElement.innerText).toEqual('expand_more');
        });

        it('should allow setting expandChildren after bound to data to rowIsland', () => {
            // set first row as expanded.
            const state = new Map<any, boolean>();
            state.set(fixture.componentInstance.data[0], true);
            hierarchicalGrid.expansionStates = state;
            hierarchicalGrid.cdr.detectChanges();
            const row1 = hierarchicalGrid.gridAPI.get_row_by_index(0);
            // verify row is expanded
            expect(row1.expanded).toBe(true);
            // expand children for the rowIsland should be false by default
            expect(fixture.componentInstance.rowIsland.expandChildren).toBeFalsy();
            fixture.componentInstance.rowIsland.expandChildren = true;
            fixture.detectChanges();
            const childGrid = hierarchicalGrid.gridAPI.getChildGrid([{ rowID: fixture.componentInstance.data[0], rowKey: fixture.componentInstance.data[0], rowIslandKey: 'childData' }]);
            const childRow = childGrid.getRowByIndex(0);
            expect(childRow.expanded).toBe(true);
            let rows = childGrid.dataRowList.toArray();
            rows.forEach((r) => {
                expect(r.expanded).toBe(true);
            });
            fixture.componentInstance.rowIsland.expandChildren = false;
            fixture.detectChanges();
            rows = childGrid.dataRowList.toArray();
            rows.forEach((r) => {
                expect(r.expanded).toBe(false);
            });

        });

        it('should be able to prevent exiting of edit mode when a row is toggled #10634', async () => {
            hierarchicalGrid.primaryKey = 'ID';
            hierarchicalGrid.rowEditable = true;
            hierarchicalGrid.rowToggle.subscribe((e) => {
                e.cancel = true;
            });
            fixture.detectChanges();
            wait();

            const masterGridFirstRow = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            expect(masterGridFirstRow.expanded).toBe(false);

            const masterGridSecondCell = masterGridFirstRow.cells.find((c: IgxGridCellComponent) => c.columnIndex === 1);
            expect(masterGridSecondCell.editMode).toBe(false);

            masterGridSecondCell.setEditMode(true);
            fixture.detectChanges();
            wait();

            expect(masterGridSecondCell.editMode).toBe(true);

            UIInteractions.simulateClickAndSelectEvent(masterGridFirstRow.expander);
            fixture.detectChanges();
            wait();

            expect(masterGridFirstRow.expanded).toBe(false);
            expect(masterGridSecondCell.editMode).toBe(true);

            hierarchicalGrid.rowToggle.subscribe((e) => {
                e.cancel = false;
            });
            UIInteractions.simulateClickAndSelectEvent(masterGridFirstRow.expander);
            fixture.detectChanges();
            wait();

            expect(masterGridFirstRow.expanded).toBe(true);
            expect(masterGridSecondCell.editMode).toBe(true);

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0] as IgxHierarchicalGridComponent;
            expect(childGrid).toBeDefined();

            childGrid.primaryKey = 'ID';
            childGrid.rowEditable = true;
            childGrid.rowToggle.subscribe((e) => {
                e.cancel = true;
            });
            fixture.detectChanges();
            wait();

            childGrid.columns.find(c => c.index === 1).editable = true;
            const childGridSecondRow = childGrid.gridAPI.get_row_by_index(1) as IgxHierarchicalRowComponent;
            expect(childGridSecondRow.expanded).toBe(false);

            const childGridSecondCell = childGridSecondRow.cells.find((c: IgxGridCellComponent) => c.columnIndex === 1);
            expect(childGridSecondCell.editMode).toBe(false);

            childGridSecondCell.setEditMode(true);
            fixture.detectChanges();
            wait();

            expect(childGridSecondCell.editMode).toBe(true);

            UIInteractions.simulateClickAndSelectEvent(childGridSecondRow.expander);
            fixture.detectChanges();
            wait();

            expect(childGrid.gridAPI.crudService.cellInEditMode).toBe(true);
            expect(childGridSecondRow.inEditMode).toBe(true);
        });

        it('should render correctly when grid size is changed', () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            expect(hierarchicalGrid.gridSize).toEqual(Size.Large);
            expect(getComponentSize(hierarchicalGrid.nativeElement)).toEqual('3');

            setElementSize(hierarchicalGrid.nativeElement, Size.Medium)
            fixture.detectChanges();

            expect(childGrid.gridSize).toBe(Size.Medium);
            expect(getComponentSize(hierarchicalGrid.nativeElement)).toEqual('2');

            setElementSize(hierarchicalGrid.nativeElement, Size.Small)
            fixture.detectChanges();

            expect(childGrid.gridSize).toBe(Size.Small);
            expect(getComponentSize(hierarchicalGrid.nativeElement)).toEqual('1');
        });

        it('should update child grid data when root grid data is changed.', () => {
            const newData1 = [
                {
                    ID: 0, ChildLevels: 0,  ProductName: 'Product: A', childData: [ {   ID: 1, ProductName: 'Product: Child A' } ]
                },
                {
                    ID: 1, ChildLevels: 0,  ProductName: 'Product: A1', childData: [ {   ID: 2, ProductName: 'Product: Child A' } ]
                },
                {
                    ID: 2, ChildLevels: 0,  ProductName: 'Product: A2', childData: [ {   ID: 3, ProductName: 'Product: Child A' } ]
                }
            ];
            fixture.componentInstance.data = newData1;
            fixture.detectChanges();
            let row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            let childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            let childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            expect(childGrid.data).toBe(newData1[0].childData);

            const newData2 = [
                {
                    ID: 0, ChildLevels: 0,  ProductName: 'Product: A', childData: [ {   ID: 10, ProductName: 'Product: New Child A' } ]
                },
                {
                    ID: 1, ChildLevels: 0,  ProductName: 'Product: A1', childData: [ {   ID: 20, ProductName: 'Product: New Child A' } ]
                },
                {
                    ID: 2, ChildLevels: 0,  ProductName: 'Product: A2', childData: [ {   ID: 30, ProductName: 'Product: New Child A' } ]
                }
            ];
            fixture.componentInstance.data = newData2;
            fixture.detectChanges();

            row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            expect(childGrid.data).toBe(newData2[0].childData);
        });

        it('should update already created child grid with new records added to the root data', () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            // check by adding multiple rows
            for (let i = 0; i < 3; i++) {
                let childGrids = fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
                let childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

                fixture.componentInstance.data[0].childData = [...hierarchicalGrid.data[0].childData ?? [], { ID: i * 10, ProductName: 'New child' + i.toString() }];
                fixture.componentInstance.data = [...fixture.componentInstance.data];
                fixture.detectChanges();

                childGrids = fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
                childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

                const length = fixture.componentInstance.data[0].childData.length;
                const newRow = childGrid.gridAPI.get_row_by_index(length - 1) as IgxHierarchicalRowComponent;

                expect(newRow).not.toBeUndefined();
                expect(childGrid.data).toBe(fixture.componentInstance.data[0].childData);
            }
        });

        it('when child width is in percents its width should be update if parent width changes while parent row is collapsed. ', async () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            expect(childGrid.calcWidth - 370).toBeLessThan(3);
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            fixture.componentInstance.width = '300px';
            fixture.detectChanges();
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            await wait();
            fixture.detectChanges();

            expect(childGrid.calcWidth - 170).toBeLessThan(3);
        });

        it('should exit edit mode on row expand/collapse through the UI', () => {
            hierarchicalGrid.primaryKey = 'ID';
            hierarchicalGrid.rowEditable = true;
            fixture.detectChanges();

            const masterGridFirstRow = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            expect(masterGridFirstRow.expanded).toBe(false);

            const masterGridSecondCell = masterGridFirstRow.cells.find((c: IgxGridCellComponent) => c.columnIndex === 1);
            expect(masterGridSecondCell.editMode).toBe(false);

            masterGridSecondCell.setEditMode(true);
            fixture.detectChanges();

            expect(masterGridSecondCell.editMode).toBe(true);

            UIInteractions.simulateClickAndSelectEvent(masterGridFirstRow.expander);
            fixture.detectChanges();

            expect(masterGridFirstRow.expanded).toBe(true);
            expect(masterGridSecondCell.editMode).toBe(true);

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0] as IgxHierarchicalGridComponent;
            expect(childGrid).toBeDefined();

            childGrid.columns.find(c => c.index === 1).editable = true;
            const childGridSecondRow = childGrid.gridAPI.get_row_by_index(1) as IgxHierarchicalRowComponent;
            expect(childGridSecondRow.expanded).toBe(false);

            const childGridSecondCell = childGridSecondRow.cells.find((c: IgxGridCellComponent) => c.columnIndex === 1);
            expect(childGridSecondCell.editMode).toBe(false);

            childGridSecondCell.setEditMode(true);
            fixture.detectChanges();

            expect(childGridSecondCell.editMode).toBe(true);

            UIInteractions.simulateClickAndSelectEvent(masterGridFirstRow.expander);
            fixture.detectChanges();

            expect(childGrid.gridAPI.crudService.cellInEditMode).toBe(true);
            expect(childGridSecondRow.inEditMode).toBe(false);
        });

        it('child grid width should be recalculated if parent no longer shows scrollbar.', fakeAsync(() => {
            hierarchicalGrid.height = '1000px';
            fixture.detectChanges();
            hierarchicalGrid.filter('ProductName', 'A0', IgxStringFilteringOperand.instance().condition('contains'), true);
            fixture.detectChanges();
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            expect(childGrid.calcWidth - 370 - childGrid.scrollSize).toBeLessThanOrEqual(5);

            hierarchicalGrid.clearFilter();
            // Required to recalculate and reflect child grid size
            tick();
            fixture.detectChanges();

            expect(childGrid.calcWidth - 370).toBeLessThan(3);
        }));

        it('should not expand children when hasChildrenKey is false for the row', () => {
            hierarchicalGrid.hasChildrenKey = 'hasChild';
            fixture.componentInstance.data = [
                {ID: 1, ProductName: 'Product: A1', hasChild: false, childData: fixture.componentInstance.generateDataUneven(1, 1)},
                {ID: 2, ProductName: 'Product: A2', hasChild: true, childData: fixture.componentInstance.generateDataUneven(1, 1)}
            ];
            fixture.detectChanges();
            const row1 = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            const rowElems = fixture.debugElement.queryAll(By.directive(IgxHierarchicalRowComponent));
            expect(rowElems[0].query(By.css('igx-icon')).nativeElement.innerText).toEqual('');
            const row2 = hierarchicalGrid.gridAPI.get_row_by_index(1) as IgxHierarchicalRowComponent;
            expect(rowElems[1].query(By.css('igx-icon')).nativeElement.innerText).toEqual('chevron_right');
            hierarchicalGrid.expandRow(row1.data);
            hierarchicalGrid.expandRow(row2.data);
            expect(row1.expanded).toBe(false);
            expect(row2.expanded).toBe(true);
            hierarchicalGrid.expandAll();
            expect(row1.expanded).toBe(false);
        });

        it('should not expand children when hasChildrenKey is false for the row and there is primaryKey', () => {
            hierarchicalGrid.hasChildrenKey = 'hasChild';
            hierarchicalGrid.primaryKey = 'ID';
            fixture.componentInstance.data = [
                {ID: 1, ProductName: 'Product: A1', hasChild: false, childData: fixture.componentInstance.generateDataUneven(1, 1)},
                {ID: 2, ProductName: 'Product: A2', hasChild: true, childData: fixture.componentInstance.generateDataUneven(1, 1)}
            ];
            fixture.detectChanges();
            const row1 = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            const rowElems = fixture.debugElement.queryAll(By.directive(IgxHierarchicalRowComponent));
            expect(rowElems[0].query(By.css('igx-icon')).nativeElement.innerText).toEqual('');
            const row2 = hierarchicalGrid.gridAPI.get_row_by_index(1) as IgxHierarchicalRowComponent;
            expect(rowElems[1].query(By.css('igx-icon')).nativeElement.innerText).toEqual('chevron_right');
            hierarchicalGrid.expandRow(1);
            hierarchicalGrid.expandRow(2);
            expect(row1.expanded).toBe(false);
            expect(row2.expanded).toBe(true);
        });

        it('should update aria-activeDescendants when navigating around', () => {
            hierarchicalGrid.cellSelection = 'single';
            expect(hierarchicalGrid.tbody.nativeElement.attributes['aria-activedescendant'].value).toEqual(hierarchicalGrid.id);

            let cellElem = (hierarchicalGrid.gridAPI.get_row_by_index(0).cells as QueryList<CellType>).toArray()[1];
            UIInteractions.simulatePointerOverElementEvent('pointerdown', cellElem.nativeElement);
            fixture.detectChanges();
            expect(hierarchicalGrid.tbody.nativeElement.attributes['aria-activedescendant'].value).toEqual(`${hierarchicalGrid.id}_0_1`);

            const row1 = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row1.expander);
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.getChildGrids()[0];
            expect(childGrid.tbody.nativeElement.attributes['aria-activedescendant'].value).toEqual(childGrid.id);

            cellElem = (childGrid.gridAPI.get_row_by_index(0).cells as QueryList<CellType>).toArray()[1];
            UIInteractions.simulatePointerOverElementEvent('pointerdown', cellElem.nativeElement);
            fixture.detectChanges();

            expect(hierarchicalGrid.tbody.nativeElement.attributes['aria-activedescendant'].value).toEqual(hierarchicalGrid.id);
            expect(childGrid.tbody.nativeElement.attributes['aria-activedescendant'].value).toEqual(`${childGrid.id}_0_1`);
        });

        it('should emit columnInit when a column is added runtime.', async() => {
            spyOn(hierarchicalGrid.columnInit, 'emit').and.callThrough();
            fixture.detectChanges();
            fixture.componentInstance.showAnotherCol = true;
            fixture.detectChanges();
            await wait(30);
            fixture.detectChanges();
            expect(hierarchicalGrid.columnInit.emit).toHaveBeenCalled();
        });

        it('should throw a warning when primaryKey is set to a non-existing data field', () => {
            spyOn(console, 'warn');
            hierarchicalGrid.primaryKey = 'testField';
            fixture.componentInstance.rowIsland.primaryKey = 'testField-rowIsland';
            fixture.componentInstance.rowIsland2.primaryKey = 'testField-rowIsland2';
            fixture.detectChanges();

            expect(console.warn).toHaveBeenCalledWith(
                `Field "${hierarchicalGrid.primaryKey}" is not defined in the data. Set \`primaryKey\` to a valid field.`
            );

            let row1 = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row1.expander);
            fixture.detectChanges();

            let rowIsland = fixture.componentInstance.rowIsland;
            expect(console.warn).toHaveBeenCalledWith(
                `Field "${rowIsland.primaryKey}" is not defined in the data. Set \`primaryKey\` to a valid field.`
            );

            const secondLevelGrid = hierarchicalGrid.gridAPI.getChildGrids()[0];
            row1 = secondLevelGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row1.expander);
            fixture.detectChanges();

            rowIsland = fixture.componentInstance.rowIsland2;
            expect(console.warn).toHaveBeenCalledWith(
                `Field "${rowIsland.primaryKey}" is not defined in the data. Set \`primaryKey\` to a valid field.`
            );
        });
    });

    describe('IgxHierarchicalGrid Row Islands #hGrid', () => {
        let fixture;
        let hierarchicalGrid: IgxHierarchicalGridComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridMultiLayoutComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
        });

        it('should allow defining row islands on the same level', () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            const childGrids = hierarchicalGrid.gridAPI.getChildGrids(false);
            const childRows = fixture.debugElement.queryAll(By.directive(IgxChildGridRowComponent));
            expect(childGrids.length).toBe(2);
            expect(childRows.length).toBe(2);
            const ri1 = fixture.componentInstance.rowIsland1;
            const ri2 = fixture.componentInstance.rowIsland2;
            expect(childRows[0].componentInstance.layout).toBe(ri1);
            expect(childRows[1].componentInstance.layout).toBe(ri2);
        });

        it('should display correct data for sibling row islands', () => {
            const uniqueData = [
                {
                    ID: 1,
                    ProductName : 'Parent Name',
                    childData: [
                        {
                            ID: 11,
                            ProductName : 'Child1 Name'
                        }
                    ],
                    childData2: [
                        {
                            ID: 12,
                            Col1: 'Child2 Col1',
                            Col2: 'Child2 Col2',
                            Col3: 'Child2 Col3'
                        }
                    ]
                }
            ];

            fixture.componentInstance.data = uniqueData;
            fixture.detectChanges();

            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            const childGrids = hierarchicalGrid.gridAPI.getChildGrids(false);

            // check if data for each is correct
            const child1 = childGrids[0] as IgxHierarchicalGridComponent;
            const child2 = childGrids[1] as IgxHierarchicalGridComponent;

            expect(child1.data).toBe(fixture.componentInstance.data[0].childData);
            expect(child2.data).toBe(fixture.componentInstance.data[0].childData2);

            expect(child1.getCellByColumn(0, 'ID').value).toBe(11);
            expect(child1.getColumnByVisibleIndex(0).field).toBe('ID');
            expect(child1.getCellByColumn(0, 'ProductName').value).toBe('Child1 Name');

            expect(child2.getCellByColumn(0, 'Col1').value).toBe('Child2 Col1');
            expect(child2.getCellByColumn(0, 'Col2').value).toBe('Child2 Col2');
            expect(child2.getCellByColumn(0, 'Col3').value).toBe('Child2 Col3');

        });

        it('should apply the set options on the row island to all of its related child grids.', () => {
            fixture.componentInstance.height = '200px';
            fixture.detectChanges();
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            const childGrids = hierarchicalGrid.gridAPI.getChildGrids(false) as IgxHierarchicalGridComponent [];
            expect(childGrids[0].height).toBe('200px');
            expect(childGrids[1].height).toBe('200px');
        });

        it('Should apply runtime option changes to all related child grids (both existing and not yet initialized).', () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const ri1 = fixture.componentInstance.rowIsland1;
            ri1.rowSelection = GridSelectionMode.multiple;
            fixture.detectChanges();

            // check rendered grid
            let childGrids = hierarchicalGrid.gridAPI.getChildGrids(false);
            expect(childGrids[0].rowSelection).toBe( GridSelectionMode.multiple);
            expect(childGrids[1].rowSelection).toBe(GridSelectionMode.none);

            // expand new row and check newly generated grid
            const row2 = hierarchicalGrid.gridAPI.get_row_by_index(3) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row2.expander);
            fixture.detectChanges();

            childGrids = hierarchicalGrid.gridAPI.getChildGrids(false);
            expect(childGrids[0].rowSelection).toBe( GridSelectionMode.multiple);
            expect(childGrids[1].rowSelection).toBe( GridSelectionMode.multiple);
            expect(childGrids[2].rowSelection).toBe(GridSelectionMode.none);
            expect(childGrids[3].rowSelection).toBe(GridSelectionMode.none);
        });

        it('should apply column settings applied to the row island to all related child grids.', () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const ri1 = fixture.componentInstance.rowIsland1 as IgxRowIslandComponent;
            const ri2 = fixture.componentInstance.rowIsland2 as IgxRowIslandComponent;

            const childGrids = hierarchicalGrid.gridAPI.getChildGrids(false);

            const child1Cols = childGrids[0].columns;
            const riCols = ri1.columns;
            expect(child1Cols.length).toEqual(riCols.length);
            for (const column of riCols) {
                const col = child1Cols.find((c) => c.field === column.field);
                expect(col).not.toBeNull();
            }
            const child2Cols = childGrids[1].columns;
            const ri2Cols = ri2.columns;
            expect(child2Cols.length).toEqual(ri2Cols.length);
            for (let j = 0; j < riCols.length; j++) {
                const col = child2Cols.find((c) => c.field === ri2Cols[j].field);
                expect(col).not.toBeNull();
            }
        });

        it('should allow setting different height/width in px/percent for row islands and grids should be rendered correctly.', () => {
            const ri1 = fixture.componentInstance.rowIsland1;

            // test px
            ri1.height = '200px';
            ri1.width = '200px';

            fixture.detectChanges();

            let row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            let childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            let childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            // check sizes are applied
            expect(childGrid.width).toBe(ri1.width);
            expect(childGrid.height).toBe(ri1.height);
            expect(childGrid.nativeElement.style.height).toBe(ri1.height);
            expect(childGrid.nativeElement.style.width).toBe(ri1.width);
            // check virtualization state
            expect(childGrid.verticalScrollContainer.state.chunkSize).toBe(4);
            expect(childGrid.verticalScrollContainer.getScroll().scrollHeight).toBe(357);

            let hVirt = childGrid.gridAPI.get_row_by_index(0).virtDirRow;
            expect(hVirt.state.chunkSize).toBe(2);
            expect(hVirt.getScroll().scrollWidth).toBe(272);
            // collapse row
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            // test %
            ri1.height = '50%';
            ri1.width = '50%';

            fixture.detectChanges();
            row = hierarchicalGrid.gridAPI.get_row_by_index(1) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();


            childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            // check sizes are applied
            expect(childGrid.width).toBe(ri1.width);
            expect(childGrid.height).toBe(ri1.height);
            expect(childGrid.nativeElement.style.height).toBe(ri1.height);
            expect(childGrid.nativeElement.style.width).toBe(ri1.width);
            // check virtualization state
            expect(childGrid.verticalScrollContainer.state.chunkSize).toBe(11);
            expect(childGrid.verticalScrollContainer.getScroll().scrollHeight).toBe(714);
            hVirt = childGrid.gridAPI.get_row_by_index(0).virtDirRow;
            expect(hVirt.getScroll().scrollWidth).toBe(272);
        });

        it('should destroy cached instances of child grids when root grid is destroyed', async () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const children = hierarchicalGrid.gridAPI.getChildGrids(true);
            expect(children.length).toBe(2);
            const child1 = children[0] as IgxHierarchicalGridComponent;
            const child2 = children[1] as IgxHierarchicalGridComponent;
            expect(child1._destroyed).toBeFalsy();
            expect(child2._destroyed).toBeFalsy();
            hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.dataView.length - 1);
            await wait();
            fixture.detectChanges();

            // check that we have child is not destroyed
            expect(child1._destroyed).toBeFalsy();
            expect(child2._destroyed).toBeFalsy();

            // destroy hgrid
            fixture.destroy();

            expect(child1._destroyed).toBeTruthy();
            expect(child2._destroyed).toBeTruthy();
        });

        it('should emit child grid events with the related child grid instance as an event arg.', () => {
            hierarchicalGrid.cellSelection = 'single';
            fixture.detectChanges();
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            const cellElem = childGrid.gridAPI.get_row_by_index(0).cells.toArray()[0];
            const cell = childGrid.getRowByIndex(0).cells[0] as CellType;
            const ri1 = fixture.componentInstance.rowIsland1;

            expect(cell.active).toBeFalse();
            expect(cell.selected).toBeFalse();

            spyOn(ri1.cellClick, 'emit').and.callThrough();

            const event = new Event('click');
            cellElem.nativeElement.dispatchEvent(event);
            const args: IGridCellEventArgs = {
                cell,
                event,
                owner: childGrid
            };

            fixture.detectChanges();
            expect(ri1.cellClick.emit).toHaveBeenCalledTimes(1);
            expect(ri1.cellClick.emit).toHaveBeenCalledWith(args);

            cell.selected = true;
            fixture.detectChanges();

            expect(cell.selected).toBeTrue();
            expect(childGrid.selectedCells[0].row.index).toEqual(cell.row.index);
            expect(childGrid.selectedCells[0].column.field).toEqual(cell.column.field);
        });

        it('should filter correctly on row island', () => {
            const uniqueData = [
                {
                    ID: 1,
                    ProductName : 'Parent Name',
                    childData: [
                        {
                            ID: 11,
                            ProductName : 'Child11 ProductName'
                        },
                        {
                            ID: 12,
                            ProductName : 'Child12 ProductName'
                        }
                    ],
                    childData2: [
                        {
                            ID: 21,
                            Col1: 'Child21 Col1',
                            Col2: 'Child21 Col2',
                            Col3: 'Child21 Col3'
                        },
                        {
                            ID: 22,
                            Col1: 'Child22 Col1',
                            Col2: 'Child22 Col2',
                            Col3: 'Child22 Col3'
                        }
                    ]
                }
            ];
            fixture.componentInstance.data = uniqueData;
            fixture.detectChanges();

            const rowIsland1 = fixture.componentInstance.rowIsland1 as IgxRowIslandComponent;
            rowIsland1.filter('ProductName', 'Child12', IgxStringFilteringOperand.instance().condition('contains'), true);

            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid1 = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            expect(childGrid1.data.length).toEqual(2);
            expect(childGrid1.filteredData.length).toEqual(1);
            expect(childGrid1.rowList.length).toEqual(1);
            expect(childGrid1.gridAPI.get_cell_by_index(0, 'ProductName').nativeElement.innerText).toEqual('Child12 ProductName');
        });

        it('should allow binding to complex object.', () => {
            const rowIsland1 = fixture.componentInstance.rowIsland1 as IgxRowIslandComponent;
            const rowIsland2 = fixture.componentInstance.rowIsland2 as IgxRowIslandComponent;
            rowIsland1.key = 'childData.Records';
            rowIsland2.key = 'childData2.Records';

            hierarchicalGrid.childLayoutKeys = ['childData.Records', 'childData2.Records'];
            const complexObjData = [
                {
                    ID: 1,
                    ProductName : 'Parent Name',
                    childData: {
                        Records: [
                            {
                                ID: 11,
                                ProductName : 'Child11 ProductName'
                            },
                            {
                                ID: 12,
                                ProductName : 'Child12 ProductName'
                            }
                        ]
                    },
                    childData2: {
                        Records: [
                        {
                            ID: 21,
                            Col1: 'Child21 Col1',
                            Col2: 'Child21 Col2',
                            Col3: 'Child21 Col3'
                        },
                        {
                            ID: 22,
                            Col1: 'Child22 Col1',
                            Col2: 'Child22 Col2',
                            Col3: 'Child22 Col3'
                        }
                        ]
                    }
                }
            ];
            fixture.componentInstance.data = complexObjData;
            fixture.detectChanges();

            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid1 = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            const childGrid2 = childGrids[1].query(By.css('igx-hierarchical-grid')).componentInstance;
            expect(childGrid1.data.length).toEqual(2);
            expect(childGrid2.data.length).toEqual(2);

            expect(childGrid1.data[0].ID).toBe(11);
            expect(childGrid2.data[0].ID).toBe(21);
        });

        it('should expose the (child) grid instance as context of the empty grid template', () => {
            fixture = TestBed.createComponent(IgxHierarchicalGridEmptyTemplateComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            expect(fixture.componentInstance.childGridRef).toBe(null);

            const firstDataItem = fixture.componentInstance.data[0];
            firstDataItem.childData = [];
            fixture.componentInstance.data[0] = firstDataItem;
            fixture.detectChanges();

            hierarchicalGrid.expandRow(fixture.componentInstance.data[0]);
            fixture.detectChanges();

            const child1Grids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const child1Grid = child1Grids[0].query(By.css('igx-hierarchical-grid'));
            const gridBody = child1Grid.query(By.css('.igx-grid__tbody'));
            expect(gridBody.nativeElement.innerText).toBe('Get child grid ref'); //text from custom template button

            const button = gridBody.nativeElement.querySelector('button');
            button.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.childGridRef.elementRef.nativeElement).toEqual(child1Grid.nativeElement);
        });

        it('should update columns property of row islands on columns change.', fakeAsync(() => {

            expect(hierarchicalGrid.childLayoutList.first.columns.length).toEqual(2, 'Initial columns length should be 2');
            expect(hierarchicalGrid.childLayoutList.first.columnList.length).toEqual(2, 'Initial columnList length should be 2');

            fixture.componentInstance.toggleColumns = false;
            fixture.detectChanges();
            tick();

            expect(hierarchicalGrid.childLayoutList.first.columns.length).toEqual(0, 'Columns length should be 0 after toggle');
            expect(hierarchicalGrid.childLayoutList.first.columnList.length).toEqual(0, 'ColumnList length should be 0 after toggle');
        }));

        it('should resolve child grid cols default editable prop correctly based on row island\'s rowEditable.', () => {
            hierarchicalGrid.rowEditable = false;
            hierarchicalGrid.childLayoutList.first.rowEditable = true;
            fixture.detectChanges();
            // expand row
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            //check child grid column are editable
            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid1 = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            expect(childGrid1.columns[0].editable).toBeTrue();
            expect(childGrid1.columns[1].editable).toBeTrue();
        });
    });

    describe('IgxHierarchicalGrid Children Sizing #hGrid', () => {
        let fixture: ComponentFixture<IgxHierarchicalGridSizingComponent>;
        let hierarchicalGrid: IgxHierarchicalGridComponent;
        const TBODY_CLASS = '.igx-grid__tbody-content';

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridSizingComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
        });

        it('should create a child grid with null height when its data is unset then set to a number under 10', () => {
            fixture.detectChanges();
            // expansion
            const row = hierarchicalGrid.rowList.first as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            let defaultHeight = childGrids[0].query(By.css(TBODY_CLASS)).styles.height;
            expect(defaultHeight).toBeFalsy();
            expect(childGrid.calcHeight).toBeNull();
            childGrid.data = fixture.componentInstance.data;
            fixture.detectChanges();

            defaultHeight = childGrids[0].query(By.css(TBODY_CLASS)).styles.height;
            expect(defaultHeight).toBeFalsy();
            expect(childGrid.calcHeight).toBeNull();
            expect(childGrid.data.length).toEqual(1);
            expect(childGrid.rowList.length).toEqual(1);
        });

        it('should create a child grid with auto-size when its data is unset then set to a number above 10', () => {
            fixture.detectChanges();
            // expansion
            const row = hierarchicalGrid.rowList.first as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            let defaultHeight = childGrids[0].query(By.css(TBODY_CLASS)).styles.height;
            expect(defaultHeight).toBeFalsy();
            expect(childGrid.calcHeight).toBeNull();
            childGrid.data = fixture.componentInstance.fullData;
            fixture.detectChanges();

            defaultHeight = childGrids[0].query(By.css(TBODY_CLASS)).styles.height;
            expect(defaultHeight).toBe('510px');
            expect(childGrid.calcHeight).toBe(510);
            expect(childGrid.data.length).toEqual(100000);
            expect(childGrid.rowList.length).toEqual(11);
        });

        it('should create a child grid with auto-size when its data is unset then set to a number above 10 and height is 50%', () => {
            fixture.componentInstance.childHeight = '50%';
            fixture.detectChanges();
            // expansion
            const row = hierarchicalGrid.rowList.first as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            let defaultHeight = childGrids[0].query(By.css(TBODY_CLASS)).styles.height;
            expect(defaultHeight).toBeFalsy();
            expect(childGrid.calcHeight).toBeNull();
            childGrid.data = fixture.componentInstance.fullData;
            fixture.detectChanges();

            defaultHeight = childGrids[0].query(By.css(TBODY_CLASS)).styles.height;
            expect(defaultHeight).toBe('510px');
            expect(childGrid.calcHeight).toBe(510);
            expect(childGrid.data.length).toEqual(100000);
            expect(childGrid.rowList.length).toEqual(11);
        });

        it('should create a child grid fixed size when height is set to px', () => {
            fixture.componentInstance.childHeight = '600px';
            fixture.detectChanges();
            // expansion
            const row = hierarchicalGrid.rowList.first as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            let defaultHeight = childGrids[0].query(By.css(TBODY_CLASS)).styles.height;
            let defaultHeightNum = parseInt(defaultHeight, 10);
            expect(defaultHeightNum).toBeGreaterThan(500);
            expect(defaultHeightNum).toBeLessThan(600);
            expect(childGrid.calcHeight).toBeGreaterThan(500);
            expect(childGrid.calcHeight).toBeLessThan(600);
            expect(childGrid.rowList.length).toEqual(0);
            childGrid.data = fixture.componentInstance.fullData;
            fixture.detectChanges();

            defaultHeight = childGrids[0].query(By.css(TBODY_CLASS)).styles.height;
            defaultHeightNum = parseInt(defaultHeight, 10);
            expect(defaultHeightNum).toBeGreaterThan(500);
            expect(defaultHeightNum).toBeLessThan(600);
            expect(childGrid.calcHeight).toBeGreaterThan(500);
            expect(childGrid.calcHeight).toBeLessThan(600);
            expect(childGrid.data.length).toEqual(100000);
            expect(childGrid.rowList.length).toEqual(12);
        });

        it('should create a child grid null height regardless of data when height is set to null', () => {
            fixture.componentInstance.childHeight = null;
            fixture.detectChanges();
            // expansion
            const row = hierarchicalGrid.rowList.first as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();
            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            let defaultHeight = childGrids[0].query(By.css(TBODY_CLASS)).styles.height;
            expect(defaultHeight).toBeFalsy();
            expect(childGrid.calcHeight).toBeNull();
            childGrid.data = fixture.componentInstance.semiData;
            fixture.detectChanges();

            defaultHeight = childGrids[0].query(By.css(TBODY_CLASS)).styles.height;
            expect(defaultHeight).toBeFalsy();
            expect(childGrid.calcHeight).toBeNull();
            expect(childGrid.data.length).toEqual(15);
            expect(childGrid.rowList.length).toEqual(15);
        });
    });

    describe('IgxHierarchicalGrid Remote Scenarios #hGrid', () => {
        let fixture: ComponentFixture<IgxHGridRemoteOnDemandComponent>;
        const TBODY_CLASS = '.igx-grid__tbody-content';
        const THEAD_CLASS = '.igx-grid-thead';

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxHGridRemoteOnDemandComponent);
            fixture.detectChanges();
        });

        // To investigate why it times out
        it('should render loading indicator when loading and autoGenerate are enabled', fakeAsync(() => {
            fixture.detectChanges();

            const grid = fixture.componentInstance.instance;
            const gridBody = fixture.debugElement.query(By.css(TBODY_CLASS));
            const gridHead = fixture.debugElement.query(By.css(THEAD_CLASS));
            let loadingIndicator = gridBody.query(By.css('.igx-grid__loading'));
            let colHeaders = gridHead.queryAll(By.css('igx-grid-header'));

            expect(loadingIndicator).not.toBeNull();
            expect(colHeaders.length).toBe(0);
            expect(gridBody.nativeElement.textContent).not.toEqual(grid.emptyFilteredGridMessage);

            // Check for loaded rows in grid's container
            fixture.componentInstance.databind();
            fixture.detectChanges();

            loadingIndicator = gridBody.query(By.css('.igx-grid__loading'));
            colHeaders = gridHead.queryAll(By.css('igx-grid-header'));
            expect(colHeaders.length).toBeGreaterThan(0);
            expect(loadingIndicator).toBeNull();

            const row = grid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            // Tick is required for height to be recalculated and rerendered
            tick();
            fixture.detectChanges();

            const rowIslandDOM = fixture.debugElement.query(By.css('.igx-grid__hierarchical-indent .igx-grid'));
            const rowIslandBody = rowIslandDOM.query(By.css('.igx-grid__tbody-content'));
            expect(parseInt(window.getComputedStyle(rowIslandBody.nativeElement).height, 10)).toBe(255);
        }));

        it('should render disabled collapse all icon for child grid even when it has no data but with child row island', () => {
            const hierarchicalGrid = fixture.componentInstance.instance;

            fixture.componentInstance.databind();
            fixture.detectChanges();

            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const gridHead = fixture.debugElement.queryAll(By.css(THEAD_CLASS))[1];
            const headerExpanderElem = gridHead.queryAll(By.css('.igx-grid__hierarchical-expander--header'))[0];
            const icon = headerExpanderElem.query(By.css('igx-icon')).componentInstance;
            const iconTxt = headerExpanderElem.query(By.css('igx-icon')).nativeElement.textContent.toLowerCase();
            expect(iconTxt).toBe('unfold_less');
            expect(icon.getActive).toBe(false);
        });

        it('should keep already expanded child grids\' data when expanding subsequent ones', fakeAsync(() => {
            const hierarchicalGrid = fixture.componentInstance.instance;

            fixture.componentInstance.databind();
            fixture.detectChanges();

            const row0 = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row0.expander);
            fixture.detectChanges();
            tick();

            let childGrids = hierarchicalGrid.gridAPI.getChildGrids();
            expect(childGrids.length).toBe(1);
            expect(childGrids[0].data.length).toBeGreaterThan(0);

            const row1 = hierarchicalGrid.gridAPI.get_row_by_index(2) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row1.expander);
            fixture.detectChanges();
            tick();

            childGrids = hierarchicalGrid.gridAPI.getChildGrids();
            expect(childGrids.length).toBe(2);
            expect(childGrids[0].data.length).toBeGreaterThan(0);
            expect(childGrids[1].data.length).toBeGreaterThan(0);
        }));
    });

    describe('IgxHierarchicalGrid Template Changing Scenarios #hGrid', () => {
        const THEAD_CLASS = '.igx-grid-thead';
        let fixture: ComponentFixture<IgxHierarchicalGridColumnsUpdateComponent>;
        let hierarchicalGrid: IgxHierarchicalGridComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridColumnsUpdateComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
        });

        it('should render correct columns when setting columns for child in AfterViewInit using ngFor', () => {
            const gridHead = fixture.debugElement.query(By.css(THEAD_CLASS));
            const colHeaders = gridHead.queryAll(By.css('igx-grid-header'));
            expect(colHeaders.length).toEqual(2);
            expect(colHeaders[0].nativeElement.innerText).toEqual('ID');
            expect(colHeaders[1].nativeElement.innerText).toEqual('ProductName');

            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const child1Grids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const child1Grid = child1Grids[0].query(By.css('igx-hierarchical-grid'));
            const child1Headers = child1Grid.queryAll(By.css('igx-grid-header'));

            expect(child1Headers.length).toEqual(5);
            expect(child1Headers[0].nativeElement.innerText).toEqual('ID');
            expect(child1Headers[1].nativeElement.innerText).toEqual('ProductName');
            expect(child1Headers[2].nativeElement.innerText).toEqual('Col1');
            expect(child1Headers[3].nativeElement.innerText).toEqual('Col2');
            expect(child1Headers[4].nativeElement.innerText).toEqual('Col3');

            const row1 = child1Grid.componentInstance.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row1.expander);
            fixture.detectChanges();

            const child2Grids =  child1Grid.queryAll(By.css('igx-child-grid-row'));
            const child2Grid = child2Grids[0].query(By.css('igx-hierarchical-grid'));
            const child2Headers = child2Grid.queryAll(By.css('igx-grid-header'));

            expect(child2Headers.length).toEqual(3);
            expect(child2Headers[0].nativeElement.innerText).toEqual('ID');
            expect(child2Headers[1].nativeElement.innerText).toEqual('ProductName');
            expect(child2Headers[2].nativeElement.innerText).toEqual('Col1');
        });

        it('should render correct columns when setting columns for parent and child post init using ngFor', fakeAsync(() => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const child1Grids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const child1Grid = child1Grids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            fixture.componentInstance.parentCols = ['Col1', 'Col2'];
            fixture.componentInstance.islandCols1 = ['ID', 'ProductName', 'Col1'];
            fixture.detectChanges();
            tick();

            // check parent cols
            expect(hierarchicalGrid.columns.length).toBe(4);
            expect(hierarchicalGrid.columns[0].field).toBe('ID');
            expect(hierarchicalGrid.columns[1].field).toBe('ProductName');
            expect(hierarchicalGrid.columns[2].field).toBe('Col1');
            expect(hierarchicalGrid.columns[3].field).toBe('Col2');
            // check child cols
            expect(child1Grid.columns.length).toBe(3);
            expect(child1Grid.columns[0].field).toBe('ID');
            expect(child1Grid.columns[1].field).toBe('ProductName');
            expect(child1Grid.columns[2].field).toBe('Col1');
        }));

        it('should update columns for expanded child when adding column to row island', fakeAsync(() => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const child1Grids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const child1Grid = child1Grids[0].query(By.css('igx-hierarchical-grid'));

            const row1 = child1Grid.componentInstance.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row1.expander);
            fixture.detectChanges();

            const child2Grids =  child1Grid.queryAll(By.css('igx-child-grid-row'));
            const child2Grid = child2Grids[0].query(By.css('igx-hierarchical-grid'));
            let child2Headers = child2Grid.queryAll(By.css('igx-grid-header'));

            expect(child2Headers.length).toEqual(3);
            expect(child2Headers[0].nativeElement.innerText).toEqual('ID');
            expect(child2Headers[1].nativeElement.innerText).toEqual('ProductName');
            expect(child2Headers[2].nativeElement.innerText).toEqual('Col1');

            fixture.componentInstance.islandCols2.push('Col2');
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            child2Headers = child2Grid.queryAll(By.css('igx-grid-header'));
            expect(child2Headers.length).toEqual(4);
            expect(child2Headers[0].nativeElement.innerText).toEqual('ID');
            expect(child2Headers[1].nativeElement.innerText).toEqual('ProductName');
            expect(child2Headers[2].nativeElement.innerText).toEqual('Col1');
            expect(child2Headers[3].nativeElement.innerText).toEqual('Col2');

            const child1Headers = child1Grid.query(By.css(THEAD_CLASS)).queryAll(By.css('igx-grid-header'));
            expect(child1Headers.length).toEqual(5);
            expect(child1Headers[0].nativeElement.innerText).toEqual('ID');
            expect(child1Headers[1].nativeElement.innerText).toEqual('ProductName');
            expect(child1Headers[2].nativeElement.innerText).toEqual('Col1');
            expect(child1Headers[3].nativeElement.innerText).toEqual('Col2');
            expect(child1Headers[4].nativeElement.innerText).toEqual('Col3');

            const gridHead = fixture.debugElement.query(By.css(THEAD_CLASS));
            const colHeaders = gridHead.queryAll(By.css('igx-grid-header'));
            expect(colHeaders.length).toEqual(2);
            expect(colHeaders[0].nativeElement.innerText).toEqual('ID');
            expect(colHeaders[1].nativeElement.innerText).toEqual('ProductName');
        }));

        it('should update columns for rendered child that is collapsed when adding column to row island', fakeAsync(() => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const child1Grids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const child1Grid = child1Grids[0].query(By.css('igx-hierarchical-grid'));

            const row1 = child1Grid.componentInstance.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row1.expander);
            fixture.detectChanges();

            const child2Grids =  child1Grid.queryAll(By.css('igx-child-grid-row'));
            const child2Grid = child2Grids[0].query(By.css('igx-hierarchical-grid'));
            let child2Headers = child2Grid.queryAll(By.css('igx-grid-header'));

            expect(child2Headers.length).toEqual(3);
            expect(child2Headers[0].nativeElement.innerText).toEqual('ID');
            expect(child2Headers[1].nativeElement.innerText).toEqual('ProductName');
            expect(child2Headers[2].nativeElement.innerText).toEqual('Col1');

            UIInteractions.simulateClickAndSelectEvent(row1.expander);
            fixture.detectChanges();

            fixture.componentInstance.islandCols2.push('Col2');
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            UIInteractions.simulateClickAndSelectEvent(row1.expander);
            fixture.detectChanges();

            child2Headers = child2Grid.queryAll(By.css('igx-grid-header'));
            expect(child2Headers.length).toEqual(4);
            expect(child2Headers[0].nativeElement.innerText).toEqual('ID');
            expect(child2Headers[1].nativeElement.innerText).toEqual('ProductName');
            expect(child2Headers[2].nativeElement.innerText).toEqual('Col1');
            expect(child2Headers[3].nativeElement.innerText).toEqual('Col2');
        }));

        it('test getRowByIndex API methods', () => {
            const nonExistingRow = hierarchicalGrid.getRowByKey('nonexisting');
            expect(nonExistingRow).toBeUndefined();

            const nonExistingRow2 = hierarchicalGrid.getRowByIndex(-1);
            expect(nonExistingRow2).toBeUndefined();

            const cell00 = hierarchicalGrid.getCellByColumn(0, 'ID');
            expect(cell00.row.index).toBe(0);
            expect(cell00.column.visibleIndex).toBe(0);

            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const child1Grids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const child1Grid = child1Grids[0].query(By.css('igx-hierarchical-grid'));

            const firstRow = child1Grid.componentInstance.getRowByIndex(0);
            firstRow.expanded = true;

            expect(firstRow.hasChildren).toBe(true);
            expect(firstRow.children).toBeUndefined();
            expect(firstRow.viewIndex).toEqual(0);
            expect(firstRow.key).toBeDefined();
            expect(firstRow.data.ID).toEqual('00');
            expect(firstRow.pinned).toBe(false);
            expect(firstRow.selected).toBe(false);
            expect(firstRow.expanded).toBe(true);
            expect(firstRow.deleted).toBe(false);
            expect(firstRow.inEditMode).toBe(false);

            // Toggle expanded state
            firstRow.expanded = false;
            expect(firstRow.expanded).toBe(false);
        });
    });

    describe('IgxHierarchicalGrid hide child columns', () => {
        let fixture: ComponentFixture<IgxHierarchicalGridHidingPinningColumnsComponent>;
        let hierarchicalGrid: IgxHierarchicalGridComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridHidingPinningColumnsComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
        });

        it('should fire hiddenChange and pinnedChange events for child grid.', () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            const child1Grids = fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const child1Grid = child1Grids[0].query(By.css('igx-hierarchical-grid'));

            // Pinning

            const childHeader1 = GridFunctions.getColumnHeaders(fixture)[2];

            const firstHeaderIcon = childHeader1.query(By.css('.igx-icon'));

            spyOn(child1Grid.componentInstance.columns[0].pinnedChange, 'emit').and.callThrough();

            expect(GridFunctions.isHeaderPinned(childHeader1.parent)).toBeFalsy();
            expect(child1Grid.componentInstance.columns[0].pinned).toBeFalsy();
            expect(firstHeaderIcon).toBeDefined();

            UIInteractions.simulateClickAndSelectEvent(firstHeaderIcon);
            fixture.detectChanges();

            expect(child1Grid.componentInstance.columns[0].pinnedChange.emit).toHaveBeenCalledTimes(1);
            expect(child1Grid.componentInstance.columns[0].pinned).toBeTruthy();

            // Hiding

            const childHeader2 = GridFunctions.getColumnHeaders(fixture)[4];

            const secondHeaderIcon = childHeader2.query(By.css('.igx-icon'));

            const lastIndex = child1Grid.componentInstance.columns.length - 1;
            spyOn(child1Grid.componentInstance.columns[lastIndex].hiddenChange, 'emit').and.callThrough();

            expect(child1Grid.componentInstance.columns[lastIndex].hidden).toBeFalsy();
            expect(secondHeaderIcon).toBeDefined();

            UIInteractions.simulateClickAndSelectEvent(secondHeaderIcon);
            fixture.detectChanges();

            expect(child1Grid.componentInstance.columns[lastIndex].hiddenChange.emit).toHaveBeenCalledTimes(1);
            expect(child1Grid.componentInstance.columns[lastIndex].hidden).toBeTruthy();
        });
    });

    describe('IgxHierarchicalGrid Runtime Row Island change Scenarios #hGrid', () => {
        let fixture: ComponentFixture<IgxHierarchicalGridToggleRIComponent>;
        let hierarchicalGrid: IgxHierarchicalGridComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridToggleRIComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
        });

        it('should allow changing row islands runtime in root grid.', () => {
            let row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            let hGrids = fixture.debugElement.queryAll(By.css('igx-hierarchical-grid'));
            let childGrids = hierarchicalGrid.gridAPI.getChildGrids();
            expect(childGrids.length).toBe(1);
            expect(hGrids.length).toBe(2);

            fixture.componentInstance.toggleRI = false;
            fixture.detectChanges();

            hGrids = fixture.debugElement.queryAll(By.css('igx-hierarchical-grid'));
            childGrids = hierarchicalGrid.gridAPI.getChildGrids();
            expect(childGrids.length).toBe(0);
            expect(hGrids.length).toBe(1);
            expect(row.expander).toBe(undefined);

            fixture.componentInstance.toggleRI = true;
            fixture.detectChanges();

            hGrids = fixture.debugElement.queryAll(By.css('igx-hierarchical-grid'));
            childGrids = hierarchicalGrid.gridAPI.getChildGrids();
            row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            expect(childGrids.length).toBe(1);
            expect(hGrids.length).toBe(2);
            expect(row.expander).not.toBe(undefined);
        });

        it('should allow changing row islands runtime in child grid.', () => {
            const row = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(row.expander);
            fixture.detectChanges();

            let childGrid = hierarchicalGrid.gridAPI.getChildGrids()[0];
            const childRow = childGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(childRow.expander);
            fixture.detectChanges();

            let hGrids = fixture.debugElement.queryAll(By.css('igx-hierarchical-grid'));
            expect(hGrids.length).toBe(3);
            expect(childGrid.gridAPI.getChildGrids().length).toBe(1);

            fixture.componentInstance.toggleChildRI = false;
            fixture.detectChanges();

            hGrids = fixture.debugElement.queryAll(By.css('igx-hierarchical-grid'));
            childGrid = hierarchicalGrid.gridAPI.getChildGrids()[0];
            expect(hGrids.length).toBe(2);
            expect(childGrid.gridAPI.getChildGrids().length).toBe(0);

            fixture.componentInstance.toggleChildRI = true;
            fixture.detectChanges();

            hGrids = fixture.debugElement.queryAll(By.css('igx-hierarchical-grid'));
            childGrid = hierarchicalGrid.gridAPI.getChildGrids()[0];
            expect(hGrids.length).toBe(3);
            expect(childGrid.gridAPI.getChildGrids().length).toBe(1);

        });

        it(`Should apply template to both parent and child grids`, () => {
            const customFixture = TestBed.createComponent(IgxHierarchicalGridCustomRowEditOverlayComponent);
            customFixture.detectChanges();
            hierarchicalGrid = customFixture.componentInstance.hgrid;
            hierarchicalGrid.primaryKey = 'ID';
            hierarchicalGrid.rowEditable = true;

            let cellElem = hierarchicalGrid.gridAPI.get_cell_by_index(0, 'ProductName');
            let row = hierarchicalGrid.gridAPI.get_row_by_index(0);

            UIInteractions.simulateDoubleClickAndSelectEvent(cellElem);
            customFixture.detectChanges();
            expect(row.inEditMode).toBe(true);

            const mainGridOverlay = GridFunctions.getRowEditingOverlay(customFixture);
            expect(mainGridOverlay).not.toBeNull();

            const mainGridOverlayTextContent = mainGridOverlay.querySelector('.igx-banner__text').textContent;
            const mainGridOverlayActionsContent = mainGridOverlay.querySelector('.igx-banner__actions').textContent;

            expect(mainGridOverlayTextContent).toBe(' You have 0 changes in this row and 0 hidden columns\n');
            expect(mainGridOverlayActionsContent).toBe('CancelDone');

            hierarchicalGrid.expandRow(hierarchicalGrid.getRowByIndex(0).key);
            customFixture.detectChanges();

            const secondLevelGrid = hierarchicalGrid.gridAPI.getChildGrids()[0];
            expect(secondLevelGrid).not.toBeNull();

            secondLevelGrid.primaryKey = 'ID';
            customFixture.detectChanges();

            expect(GridFunctions.getRowEditingOverlay(customFixture)).toBeDefined();

            cellElem = secondLevelGrid.gridAPI.get_cell_by_index(0, 'ProductName');
            row = secondLevelGrid.gridAPI.get_row_by_index(0);

            UIInteractions.simulateDoubleClickAndSelectEvent(cellElem);
            customFixture.detectChanges();
            expect(row.inEditMode).toBe(true);

            const nestedGridOverlay = GridFunctions.getRowEditingOverlay(customFixture);
            expect(nestedGridOverlay).not.toBeNull();

            const nestedGridOverlayTextContent = nestedGridOverlay.querySelector('.igx-banner__text').textContent;
            const nestedGridOverlayActionsContent = nestedGridOverlay.querySelector('.igx-banner__actions').textContent;

            expect(nestedGridOverlayTextContent).toBe('Row Edit Text');
            expect(nestedGridOverlayActionsContent).toBe('Row Edit Actions');
        });

        it(`Should set ID column's width property to auto on init`, () => {
            const customFixture = TestBed.createComponent(IgxHierarchicalGridAutoSizeColumnsComponent);
            hierarchicalGrid.primaryKey = 'ID';
            hierarchicalGrid = customFixture.componentInstance.hgrid;
            customFixture.detectChanges();

            expect(hierarchicalGrid).not.toBeNull();
            expect(hierarchicalGrid).not.toBeUndefined();
        });

        it(`Should keep the overlay when scrolling an igxHierarchicalGrid with an opened
                row island with <= 2 data records`, async () => {
            hierarchicalGrid.primaryKey = 'ID';
            hierarchicalGrid.rowEditable = true;
            hierarchicalGrid.getRowByIndex(0).expanded = true;
            fixture.detectChanges();

            const secondLevelGrid = hierarchicalGrid.gridAPI.getChildGrids()[0];
            expect(secondLevelGrid).not.toBeNull();
            secondLevelGrid.getRowByIndex(0).expanded = true;
            fixture.detectChanges();

            const thirdLevelGrid = secondLevelGrid.gridAPI.getChildGrids()[0];
            thirdLevelGrid.primaryKey = 'ID';
            thirdLevelGrid.rowEditable = true;
            fixture.detectChanges();

            expect(thirdLevelGrid).not.toBeNull();
            expect(thirdLevelGrid.data.length).toBe(2);

            const cellElem = thirdLevelGrid.gridAPI.get_cell_by_index(0, 'ChildLevels');
            const row = thirdLevelGrid.gridAPI.get_row_by_index(0);

            UIInteractions.simulateDoubleClickAndSelectEvent(cellElem);
            fixture.detectChanges();
            expect(row.inEditMode).toBe(true);
            fixture.detectChanges();

            let overlay = GridFunctions.getRowEditingOverlay(fixture);
            expect(overlay).not.toBeNull();

            await hierarchicalGrid.dragScroll({ left: 0, top: 10 });
            fixture.detectChanges();
            await wait(30);

            overlay = GridFunctions.getRowEditingOverlay(fixture);
            expect(overlay).not.toBeNull();
        });

    });

    describe('Columns and row islands runtime change', () => {
        let fixture: ComponentFixture<IgxHierarchicalGridToggleRIAndColsComponent>;
        let hierarchicalGrid: IgxHierarchicalGridComponent;

        it('should allow changing columns runtime in root grid when there are no row islands.', fakeAsync(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridToggleRIAndColsComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hgrid;
            expect(hierarchicalGrid.childLayoutList.length).toBe(0);
            expect(hierarchicalGrid.columns.length).toBe(0);
            fixture.componentInstance.toggleColumns = true;
            fixture.detectChanges();
            tick();

            expect(hierarchicalGrid.columns.length).toBe(2);

            fixture.componentInstance.toggleRI = true;
            fixture.detectChanges();
            expect(hierarchicalGrid.childLayoutList.length).toBe(1);
        }));
    });

    describe('IgxHierarchicalGrid custom template #hGrid', () => {

        it('should allow setting custom template for expand/collapse icons', () => {
            const fixture = TestBed.createComponent(IgxHierarchicalGridCustomTemplateComponent);
            fixture.detectChanges();

            const hierarchicalGrid = fixture.componentInstance.hgrid;

            let rows = hierarchicalGrid.dataRowList.toArray();
            for (const row of rows) {
                const expander =  row.nativeElement.querySelector('.igx-grid__hierarchical-expander');
                expect((expander as HTMLElement).innerText).toBe('COLLAPSED');
            }
            hierarchicalGrid.expandChildren = true;
            fixture.detectChanges();
            rows = hierarchicalGrid.dataRowList.toArray();
            for (const row of rows) {
                const expander =  row.nativeElement.querySelector('.igx-grid__hierarchical-expander');
                expect((expander as HTMLElement).innerText).toBe('EXPANDED');
            }

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const childRows = childGrid.dataRowList.toArray();
            for (const row of childRows) {
                const expander =  row.nativeElement.querySelector('.igx-grid__hierarchical-expander');
                expect((expander as HTMLElement).innerText).toBe('COLLAPSED');
            }

            expect((hierarchicalGrid as any).headerHierarchyExpander.nativeElement.innerText).toBe('EXPANDED');
            expect((childGrid as any).headerHierarchyExpander.nativeElement.innerText).toBe('COLLAPSED');

            childRows[0].toggle();
            fixture.detectChanges();
            expect((childGrid as any).headerHierarchyExpander.nativeElement.innerText).toBe('EXPANDED');
            hierarchicalGrid.expandChildren = false;
            fixture.detectChanges();
            expect((hierarchicalGrid as any).headerHierarchyExpander.nativeElement.innerText).toBe('COLLAPSED');
        });

        it('should allow setting custom template for excel style filtering on row island.', () => {
            const fixture = TestBed.createComponent(IgxHierarchicalGridCustomFilteringTemplateComponent);
            fixture.detectChanges();

            const hierarchicalGrid = fixture.componentInstance.hgrid;
            const ri = fixture.componentInstance.rowIsland;
            const firstRow = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(firstRow.expander);
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.gridAPI.getChildGrids()[0] as IgxHierarchicalGridComponent;
            expect(childGrid.excelStyleFilteringComponent).toBe(ri.excelStyleFilteringComponent);
        });

        it('should correctly filter templated row island in hierarchical grid', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxHierarchicalGridCustomFilteringTemplateComponent);
            fixture.detectChanges();

            const hierarchicalGrid = fixture.componentInstance.hgrid;
            const firstRow = hierarchicalGrid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
            UIInteractions.simulateClickAndSelectEvent(firstRow.expander);
            fixture.detectChanges();

            GridFunctions.clickExcelFilterIconFromCode(fixture, hierarchicalGrid, 'ProductName');

            const searchComponent = GridFunctions.getExcelStyleSearchComponent(fixture, null, 'igx-hierarchical-grid');
            const inputNativeElement = GridFunctions.getExcelStyleSearchComponentInput(fixture, searchComponent, 'igx-hierarchical-grid');
            UIInteractions.clickAndSendInputElementValue(inputNativeElement, 'A4', fixture);

            GridFunctions.clickApplyExcelStyleFiltering(fixture, null, 'igx-hierarchical-grid');
            fixture.detectChanges();

            const gridCellValues = GridFunctions.getColumnCells(fixture, 'ProductName', 'igx-hierarchical-grid-cell')
                .map(c => c.nativeElement.innerText)
                .sort();

            expect(gridCellValues.length).toBe(1);
        }));
    });

    describe('IgxHierarchicalGrid Multi-Column Headers', () => {
        let fixture: ComponentFixture<IgxHierarchicalGridMCHComponent>;
        let hierarchicalGrid: IgxHierarchicalGridComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxHierarchicalGridMCHComponent);
            fixture.detectChanges();
            hierarchicalGrid = fixture.componentInstance.hGrid;
        });

        it('should fire expandedChange, hiddenChange and pinnedChange events for child grid.', () => {
            const childGrid = hierarchicalGrid.gridAPI.getChildGrids(false)[0];
            const columnGroup2 = childGrid.columns[4] as IgxColumnGroupComponent;
            const columnGroup2Header = GridFunctions.getColumnGroupHeaders(fixture)[3];
            const expandIcon = columnGroup2Header.queryAll(By.css('.igx-icon'))[0];
            const pinIcon = columnGroup2Header.queryAll(By.css('.igx-icon'))[1];

            expect(columnGroup2.expanded).toBeFalse();
            expect(columnGroup2.pinned).toBeFalse();

            UIInteractions.simulateClickEvent(expandIcon.nativeElement);
            fixture.detectChanges();

            expect(columnGroup2.expanded).toBeTrue();

            expect(fixture.componentInstance.expandedArgs).toBeDefined();
            expect(fixture.componentInstance.expandedArgs.args).toBeTrue();
            expect(fixture.componentInstance.hiddenArgs).toBeDefined();
            expect(fixture.componentInstance.hiddenArgs.args).toBeTrue();

            UIInteractions.simulateClickEvent(pinIcon.nativeElement);
            fixture.detectChanges();

            expect(columnGroup2.pinned).toBeTrue();
            expect(fixture.componentInstance.pinnedArgs).toBeDefined();
            expect(fixture.componentInstance.pinnedArgs.args).toBeTrue();
        });
    });
});

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data"
     [autoGenerate]="false" [height]="'400px'" [width]="width" #hierarchicalGrid>
     <igx-column field="ID"></igx-column>
     <igx-column field="AnotherColumn" *ngIf="showAnotherCol"></igx-column>
     <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" #rowIsland>
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-column field="Col1"></igx-column>
            <igx-column field="Col2"></igx-column>
            <igx-column field="Col3"></igx-column>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2 >
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent, NgIf]
})
export class IgxHierarchicalGridTestBaseComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    public data;
    public width = '500px';
    public showAnotherCol = false;
    constructor() {
        // 3 level hierarchy
        this.data = this.generateDataUneven(20, 3);
    }
    public generateDataUneven(count: number, level: number, parentID: string = null) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parentID ? parentID + i : i.toString();
            if (level > 0 ) {
               // Have child grids for row with even id less rows by not multiplying by 2
               children = this.generateDataUneven((i % 2 + 1) * Math.round(count / 3) , currLevel - 1, rowID);
            }
            prods.push({
                ID: rowID, ChildLevels: currLevel,  ProductName: 'Product: A' + i, Col1: i,
                Col2: i, Col3: i, childData: children, childData2: children });
        }
        return prods;
    }

    public clearData(){
        this.data = [];
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="false" [height]="'400px'" [width]="'500px'" #hierarchicalGrid>
    <igx-column field="ID"></igx-column>
    <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" [height]="height" #rowIsland1>
            <igx-column field="ID" *ngIf="toggleColumns"></igx-column>
            <igx-column field="ProductName" *ngIf="toggleColumns"></igx-column>
        </igx-row-island>
        <igx-row-island [key]="'childData2'" [autoGenerate]="false" [height]="height" #rowIsland2>
            <igx-column field="Col1"></igx-column>
            <igx-column field="Col2"></igx-column>
            <igx-column field="Col3"></igx-column>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent, NgIf]
})
export class IgxHierarchicalGridMultiLayoutComponent extends IgxHierarchicalGridTestBaseComponent {
    @ViewChild('rowIsland1', { read: IgxRowIslandComponent, static: true }) public rowIsland1: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public override rowIsland2: IgxRowIslandComponent;
    public height = '100px';
    public toggleColumns = true;
}

@Component({
    template: `
        <igx-hierarchical-grid [data]="data" [isLoading]="true" [autoGenerate]="true" [height]="'600px'">
            <igx-row-island [key]="'childData'" [autoGenerate]="false" #rowIsland1 (gridCreated)="gridCreated($event, rowIsland1)">
                <igx-column field="ID"></igx-column>
                <igx-column field="ProductName"></igx-column>
                <igx-row-island [key]="'childData2'" [autoGenerate]="true" #rowIsland2>
                </igx-row-island>
            </igx-row-island>
        </igx-hierarchical-grid>
    `,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent]
})
export class IgxHGridRemoteOnDemandComponent {
    @ViewChild(IgxHierarchicalGridComponent, { read: IgxHierarchicalGridComponent, static: true })
    public instance: IgxHierarchicalGridComponent;

    @ViewChild('rowIsland1', { read: IgxRowIslandComponent, static: true })
    public rowIsland: IgxRowIslandComponent;

    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true })
    public rowIsland2: IgxRowIslandComponent;

    public data;

    constructor(public cdr: ChangeDetectorRef) { }

    public generateDataUneven(count: number, level: number, parendID: string = null) {
        const prods = [];
        const currLevel = level;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
            prods.push({
                ID: rowID, ChildLevels: currLevel,  ProductName: 'Product: A' + i, Col1: i,
                Col2: i, Col3: i });
        }
        return prods;
    }

    public databind() {
        this.data = this.generateDataUneven(20, 3);
    }

    public generateRowIslandData(count: number) {
        const prods = [];
        for (let i = 0; i < count; i++) {
            prods.push({ ID: i, ProductName: 'Product: A' + i });
        }
        return prods;
    }

    public gridCreated(event: IGridCreatedEventArgs, _rowIsland: IgxRowIslandComponent) {
        setTimeout(() => {
            event.grid.data = this.generateRowIslandData(5);
            event.grid.cdr.detectChanges();
        });
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #hierarchicalGrid [data]="data" [autoGenerate]="false" [height]="'500px'" [width]="'800px'" >
        <igx-column field="ID"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-column *ngFor="let colField of parentCols" [field]="colField"></igx-column>
        <igx-row-island key="childData" [autoGenerate]="false" #rowIsland [height]="'350px'">
            <igx-column *ngFor="let colField of islandCols1" [field]="colField"></igx-column>
            <igx-row-island key="childData" [autoGenerate]="false" #rowIsland2 [height]="'200px'">
                <igx-column *ngFor="let colField of islandCols2" [field]="colField"></igx-column>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent, NgFor]
})
export class IgxHierarchicalGridColumnsUpdateComponent extends IgxHierarchicalGridTestBaseComponent implements AfterViewInit {
    public cols1 = ['ID', 'ProductName', 'Col1', 'Col2', 'Col3'];
    public cols2 =  ['ID', 'ProductName', 'Col1'];
    public parentCols = [];
    public islandCols1 = [];
    public islandCols2 = [];
    constructor(public cdr: ChangeDetectorRef) {
        super();
    }

    public ngAfterViewInit() {
        this.islandCols1 = this.cols1;
        this.islandCols2 = this.cols2;
        this.cdr.detectChanges();
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data"
        [autoGenerate]="false" [height]="'600px'" [width]="'700px'" #hierarchicalGrid>
        <igx-column field="ID"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island key="childData" [autoGenerate]="false" [width]="'500px'" [height]="childHeight" #rowIsland>
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridSizingComponent {
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true })
    public hgrid: IgxHierarchicalGridComponent;

    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true })
    public rowIsland: IgxRowIslandComponent;

    public childHeight = '100%';
    public data = [
        {
            ID: 1,
            ProductName: 'Car'
        }
    ];
    public fullData = Array.from({ length: 100000 }, (_, i) => ({ ID: i, ProductName: 'PN' + i }));
    public semiData = Array.from({ length: 15 }, (_, i) => ({ ID: i, ProductName: 'PN' + i }));
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data"
     [autoGenerate]="true" [height]="'400px'" [width]="'500px'" #hierarchicalGrid>
     <igx-row-island *ngIf="toggleRI" key="childData" [autoGenerate]="true">
        <igx-row-island *ngIf="toggleChildRI" key="childData" [autoGenerate]="true">
        </igx-row-island>
     </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent, NgIf]
})
export class IgxHierarchicalGridToggleRIComponent  extends IgxHierarchicalGridTestBaseComponent {
public toggleRI = true;
public toggleChildRI = true;
}

@Component({
    template: `
    <igx-hierarchical-grid #hierarchicalGrid [data]="data"
     [autoGenerate]="false" [height]="'400px'" [width]="'500px'">
     <igx-column field="ID" *ngIf="toggleColumns"></igx-column>
     <igx-column field="ProductName" *ngIf="toggleColumns"></igx-column>
     <igx-row-island *ngIf="toggleRI" [key]="'childData'" [autoGenerate]="true">
     </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent, NgIf]
})
export class IgxHierarchicalGridToggleRIAndColsComponent  extends IgxHierarchicalGridToggleRIComponent {
    public override toggleRI = false;
    public toggleColumns = false;
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [showExpandAll]='true'
     [autoGenerate]="false" [height]="'400px'" [width]="width" #hierarchicalGrid>
     <igx-column field="ID"></igx-column>
     <igx-column field="ProductName"></igx-column>
        <igx-row-island [showExpandAll]="true" key="childData" [autoGenerate]="false" #rowIsland>
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island key="childData" [autoGenerate]="true" #rowIsland2 >
            </igx-row-island>
        </igx-row-island>
        <ng-template igxRowExpandedIndicator>
                <span>EXPANDED</span>
        </ng-template>
        <ng-template igxRowCollapsedIndicator>
                <span>COLLAPSED</span>
        </ng-template>
        <ng-template igxHeaderCollapsedIndicator>
            <span>COLLAPSED</span>
        </ng-template>
        <ng-template igxHeaderExpandedIndicator>
            <span>EXPANDED</span>
        </ng-template>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent, IgxRowExpandedIndicatorDirective, IgxRowCollapsedIndicatorDirective, IgxHeaderExpandedIndicatorDirective, IgxHeaderCollapsedIndicatorDirective]
})
export class IgxHierarchicalGridCustomTemplateComponent extends IgxHierarchicalGridTestBaseComponent {}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [showExpandAll]='true'
        [autoGenerate]="false" [height]="'400px'" [width]="width" [allowFiltering]="true" filterMode="excelStyleFilter" #hierarchicalGrid>
     <igx-column field="ID"></igx-column>
     <igx-column field="ProductName"></igx-column>
    <igx-row-island [showExpandAll]='true' [key]="'childData'" [autoGenerate]="false"
        [allowFiltering]="true" filterMode="excelStyleFilter" #rowIsland>
        <ng-template igxExcelStyleHeaderIcon>
            <igx-icon>filter_alt</igx-icon>
        </ng-template>
        <igx-grid-excel-style-filtering [minHeight]="'280px'" [maxHeight]="'300px'">
            <igx-excel-style-column-operations>
                <igx-excel-style-header
                    [showPinning]="true"
                    [showHiding]="true"
                >
                </igx-excel-style-header>
                <igx-excel-style-sorting></igx-excel-style-sorting>
            </igx-excel-style-column-operations>
            <igx-excel-style-filter-operations>
                <igx-excel-style-search></igx-excel-style-search>
            </igx-excel-style-filter-operations>
        </igx-grid-excel-style-filtering>
        <igx-column field="ID"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2 >
        </igx-row-island>
    </igx-row-island>
        <ng-template igxRowExpandedIndicator>
                <span>EXPANDED</span>
        </ng-template>
        <ng-template igxRowCollapsedIndicator>
                <span>COLLAPSED</span>
        </ng-template>
        <ng-template igxHeaderCollapsedIndicator>
            <span>COLLAPSED</span>
        </ng-template>
        <ng-template igxHeaderExpandedIndicator>
            <span>EXPANDED</span>
        </ng-template>
    </igx-hierarchical-grid>`,
    imports: [
        IgxHierarchicalGridComponent,
        IgxColumnComponent,
        IgxRowIslandComponent,
        IgxIconComponent,
        IgxGridExcelStyleFilteringComponent,
        IgxExcelStyleColumnOperationsTemplateDirective,
        IgxExcelStyleHeaderComponent,
        IgxExcelStyleSortingComponent,
        IgxExcelStyleFilterOperationsTemplateDirective,
        IgxExcelStyleSearchComponent,
        IgxRowExpandedIndicatorDirective,
        IgxRowCollapsedIndicatorDirective,
        IgxHeaderExpandedIndicatorDirective,
        IgxHeaderCollapsedIndicatorDirective
    ]
})
export class IgxHierarchicalGridCustomFilteringTemplateComponent extends IgxHierarchicalGridTestBaseComponent {}

@Component({
    template: `
    <ng-template igxHeader let-column #pinTemplate>
        <div class="title-inner">
            <span style="float:left">{{column.header || column.field}}</span>
            <igx-icon fontSet="material"(click)="pinColumn(column)">lock</igx-icon>
        </div>
    </ng-template>
    <ng-template igxHeader let-column #hideTemplate>
        <div class="title-inner">
            <span style="float:left">{{column.header || column.field}}</span>
            <igx-icon (click)="hideColumn(column)">hide_source</igx-icon>
        </div>
    </ng-template>
    <igx-hierarchical-grid #hierarchicalGrid [data]="data" [autoGenerate]="false" [height]="'500px'" [width]="'800px'" >
        <igx-column field="ID"></igx-column>
        <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" #rowIsland [height]="'350px'">
            <igx-column field="ID" [headerTemplate]="pinTemplate"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-column field="Col1" [headerTemplate]="hideTemplate"></igx-column>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent, IgxIconComponent, IgxCellHeaderTemplateDirective]
})
export class IgxHierarchicalGridHidingPinningColumnsComponent extends IgxHierarchicalGridTestBaseComponent {
    constructor(public cdr: ChangeDetectorRef) {
        super();
    }

    public pinColumn(col: ColumnType) {
        col.pin();
    }

    public hideColumn(col: ColumnType){
        col.hidden = true;
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="false"
    [height]="'400px'" [width]="width" [rowEditable]="true" #hierarchicalGrid>
     <igx-column field="ID"></igx-column>
     <igx-column field="ProductName"></igx-column>
        <igx-row-island key="childData" [autoGenerate]="false" [rowEditable]="true"
            #rowIsland>
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island key="childData" [autoGenerate]="true" #rowIsland2 >
            </igx-row-island>
            <ng-template igxRowEditText let-rowChangesCount>
                <span>Row Edit Text</span>
            </ng-template>
            <ng-template igxRowEditActions let-endRowEdit>
                <span>Row Edit Actions</span>
            </ng-template>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent, IgxRowEditTextDirective, IgxRowEditActionsDirective]
})
export class IgxHierarchicalGridCustomRowEditOverlayComponent extends IgxHierarchicalGridTestBaseComponent{}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="false"
    [height]="'400px'" [width]="width" [rowEditable]="true" #hierarchicalGrid>
     <igx-column field="ID" width="auto"></igx-column>
     <igx-column field="ProductName" width="auto"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" [rowEditable]="true"
            #rowIsland>
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2 >
            </igx-row-island>
            <ng-template igxRowEditText let-rowChangesCount>
                <span>Row Edit Text</span>
            </ng-template>
            <ng-template igxRowEditActions let-endRowEdit>
                <span>Row Edit Actions</span>
            </ng-template>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent, IgxRowEditTextDirective, IgxRowEditActionsDirective]
})
export class IgxHierarchicalGridAutoSizeColumnsComponent extends IgxHierarchicalGridTestBaseComponent {}

@Component({
    template: `
    <ng-template #headerTemplate igxHeader let-col>
        <span >{{ col.header ? col.header : col.field}}</span>
        <igx-icon (click)="pinColumn(col)">push_pin</igx-icon>
    </ng-template>
    <igx-hierarchical-grid #hGrid [data]="data" [height]="'400px'" [width]="'800px'" [expandChildren]="true">
        <igx-column field="CustomerID"></igx-column>
        <igx-column-group header="General Information" [collapsible]="true" [expanded]="false">
            <igx-column field="CompanyName" [visibleWhenCollapsed]="true"></igx-column>
            <igx-column field="ContactName" [visibleWhenCollapsed]="false"></igx-column>
            <igx-column field="ContactTitle" [visibleWhenCollapsed]="false"></igx-column>
        </igx-column-group>
        <igx-column-group header="Address Information" [collapsible]="true" [expanded]="false">
            <igx-column field="Location" [visibleWhenCollapsed]="true"></igx-column>
            <igx-column field="Address" [visibleWhenCollapsed]="false"></igx-column>
            <igx-column field="City" [visibleWhenCollapsed]="false"></igx-column>
            <igx-column field="Country" [visibleWhenCollapsed]="false"></igx-column>
            <igx-column field="PostalCode" [visibleWhenCollapsed]="false"></igx-column>
        </igx-column-group>
        <igx-row-island [height]="null" [key]="'Orders'" [autoGenerate]="false">
            <igx-column-group header="Order Details" [collapsible]="true" [expanded]="false">
                <igx-column field="OrderID" [visibleWhenCollapsed]="true"></igx-column>
                <igx-column field="OrderDate" [dataType]="'date'" [visibleWhenCollapsed]="false"></igx-column>
                <igx-column field="RequiredDate" [dataType]="'date'" [visibleWhenCollapsed]="false"></igx-column>
            </igx-column-group>
            <igx-column-group header="General Shipping Information" [collapsible]="true" [expanded]="false"
                [headerTemplate]="headerTemplate" (expandedChange)="expandedChange($event)">
                <igx-column field="ShippedDate" [dataType]="'date'" [visibleWhenCollapsed]="true"
                    (hiddenChange)="hiddenChange($event)" (pinnedChange)="pinnedChange($event)"></igx-column>
                <igx-column field="ShipVia" [visibleWhenCollapsed]="false" ></igx-column>
                <igx-column field="Freight" [visibleWhenCollapsed]="false"></igx-column>
                <igx-column field="ShipName" [visibleWhenCollapsed]="false"></igx-column>
            </igx-column-group>
        </igx-row-island>
    </igx-hierarchical-grid>
    `,
    imports: [IgxHierarchicalGridComponent, IgxRowIslandComponent, IgxColumnComponent, IgxColumnGroupComponent, IgxIconComponent, IgxCellHeaderTemplateDirective]
})
export class IgxHierarchicalGridMCHComponent {
    @ViewChild('hGrid', { read: IgxHierarchicalGridComponent, static: true })
    public hGrid: IgxHierarchicalGridComponent;

    public expandedArgs: any;
    public hiddenArgs: any;
    public pinnedArgs: any;

    public data = [
        {
            CustomerID: "VINET",
            CompanyName: "Vins et alcools Chevalier",
            ContactName: "Paul Henriot",
            ContactTitle: "Accounting Manager",
            Location: "59 rue de l'Abbaye, Reims, France",
            Address: "59 rue de l'Abbaye",
            City: "Reims",
            Country: "France",
            PostalCode: "51100",
            Orders: [
                {
                    OrderID: 10248,
                    OrderDate: new Date("1996-07-04T00:00:00"),
                    RequiredDate: new Date("1996-08-01T00:00:00"),
                    ShippedDate: new Date("1996-07-16T00:00:00"),
                    ShipVia: 3,
                    Freight: 32.38,
                    ShipName: "Vins et alcools Chevalier",
                },
            ],
        },
    ];

    public pinColumn(col: ColumnType) {
        col.pinned ? col.unpin() : col.pin();
    }

    public expandedChange(args: any) {
        this.expandedArgs = args;
    }

    public hiddenChange(args: any) {
        this.hiddenArgs = args;
    }

    public pinnedChange(args: any) {
        this.pinnedArgs = args;
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [autoGenerate]="false" [height]="'400px'" [width]="'500px'" #hierarchicalGrid
        [emptyGridTemplate]="emptyTemplate">
    <igx-column field="ID"></igx-column>
    <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" [emptyGridTemplate]="emptyTemplate">
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <ng-template #emptyTemplate let-grid>
                <button (click)="getChildGridRef(grid)">
                    Get child grid ref
                </button>
      </ng-template>
        </igx-row-island>
    </igx-hierarchical-grid>`,
    imports: [IgxHierarchicalGridComponent, IgxColumnComponent, IgxRowIslandComponent]
})
export class IgxHierarchicalGridEmptyTemplateComponent extends IgxHierarchicalGridTestBaseComponent {
    public childGridRef: IgxHierarchicalGridComponent = null;
    constructor() {
        super();
        const firstDataItem = this.data[0];
        firstDataItem.childData = [];
        this.data[0] = firstDataItem;
    }

    public getChildGridRef(grid: IgxHierarchicalGridComponent) {
        this.childGridRef = grid;
    }
}
