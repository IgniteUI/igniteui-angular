import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTreeGridComponent } from './tree-grid.component';
import { By } from '@angular/platform-browser';
import {
    IgxTreeGridWrappedInContComponent,
    IgxTreeGridDefaultLoadingComponent,
    IgxTreeGridCellSelectionComponent,
    IgxTreeGridSummariesTransactionsComponent,
    IgxTreeGridNoDataComponent,
    IgxTreeGridWithNoForeignKeyComponent,
    IgxTreeGridColumnLayoutComponent
} from '../../../test-utils/tree-grid-components.spec';
import { wait } from '../../../test-utils/ui-interactions.spec';
import { GridSelectionMode } from 'igniteui-angular/grids/core';
import { SampleTestData } from '../../../test-utils/sample-test-data.spec';
import { SAFE_DISPOSE_COMP_ID } from '../../../test-utils/grid-functions.spec';
import { setElementSize } from '../../../test-utils/helper-utils.spec';
import { FilteringExpressionsTree, FilteringLogic, GridColumnDataType, IgxNumberFilteringOperand, IgxStringFilteringOperand, SortingDirection, ɵSize } from 'igniteui-angular/core';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { IGX_TREE_GRID_DIRECTIVES, IgxRowLoadingIndicatorTemplateDirective } from 'igniteui-angular/grids/tree-grid';


describe('IgxTreeGrid Component Tests #tGrid', () => {
    const TBODY_CLASS = '.igx-grid__tbody-content';
    let fix;
    let grid: IgxTreeGridComponent;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxTreeGridWrappedInContComponent,
                IgxTreeGridDefaultLoadingComponent,
                IgxTreeGridCellSelectionComponent,
                IgxTreeGridSummariesTransactionsComponent,
                IgxTreeGridNoDataComponent,
                IgxTreeGridWithNoForeignKeyComponent,
                IgxTreeGridColumnLayoutComponent
            ]
        }).compileComponents();
    }));

    describe('IgxTreeGrid - default rendering for rows and columns', () => {

        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
            grid = fix.componentInstance.treeGrid;
            fix.detectChanges();
        }));

        it('should render 10 records if height is unset and parent container\'s height is unset', () => {
            fix.detectChanges();
            const defaultHeight = fix.debugElement.query(By.css(TBODY_CLASS)).styles.height;
            expect(defaultHeight).not.toBeNull();
            expect(parseInt(defaultHeight, 10)).toBeGreaterThan(400);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
            expect(grid.rowList.length).toBeGreaterThanOrEqual(10);
        });

        it('should match width and height of parent container when width/height are set in %', () => {
            fix.componentInstance.outerWidth = 800;
            fix.componentInstance.outerHeight = 600;
            grid.width = '50%';
            grid.height = '50%';
            fix.detectChanges();
            // fakeAsync is not needed. Need a second change detection cycle for height changes to be applied.
            fix.detectChanges();

            expect(window.getComputedStyle(grid.nativeElement).height).toMatch('300px');
            expect(window.getComputedStyle(grid.nativeElement).width).toMatch('400px');
            expect(grid.rowList.length).toBeGreaterThan(0);
        });

        it('should render 10 records if height is 100% and parent container\'s height is unset', () => {
            grid.height = '600px';
            fix.detectChanges();
            // fakeAsync is not needed. Need a second change detection cycle for height changes to be applied.
            fix.detectChanges();
            const defaultHeight = fix.debugElement.query(By.css(TBODY_CLASS)).styles.height;
            expect(defaultHeight).not.toBeNull();
            expect(parseInt(defaultHeight, 10)).toBeGreaterThan(400);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
            expect(grid.rowList.length).toBeGreaterThanOrEqual(10);
        });

        it(`should render all records exactly if height is 100% and parent container\'s height is unset and
            there are fewer than 10 records in the data view`, () => {
                grid.height = '100%';
                fix.componentInstance.data = fix.componentInstance.data.slice(0, 1);
                fix.detectChanges();
                // fakeAsync is not needed. Need a second change detection cycle for height changes to be applied.
                fix.detectChanges();
                const defaultHeight = fix.debugElement.query(By.css(TBODY_CLASS)).styles.height;
                expect(defaultHeight).toBeFalsy();
                expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeFalsy();
                expect(grid.rowList.length).toEqual(6);
        });

        it(`should render 11 records if height is 100% and parent container\'s height is unset and grid size is changed`, async () => {
            grid.height = '100%';
            fix.detectChanges();
            const initialRowHeight = grid.rowHeight;
            setElementSize(grid.nativeElement, ɵSize.Small);
            fix.detectChanges();
            // The size change is handled by the throttled (40ms, animation frame) resize notifier and the change of
            // the height above may have already started a throttle window, so wait for the new size to be applied.
            for (let i = 0; i < 30 && grid.rowHeight === initialRowHeight; i++) {
                await wait(16);
            }
            expect(grid.rowHeight).toBeLessThan(initialRowHeight);
            fix.detectChanges();

            const defaultHeight = fix.debugElement.query(By.css(TBODY_CLASS)).styles.height;
            const defaultHeightNum = parseInt(defaultHeight, 10);
            expect(defaultHeight).not.toBeFalsy();
            expect(defaultHeightNum).toBeGreaterThan(300);
            expect(defaultHeightNum).toBeLessThanOrEqual(330);
            expect(fix.componentInstance.isVerticalScrollbarVisible()).toBeTruthy();
            expect(grid.rowList.length).toEqual(11);
        });

        it('should display horizontal scroll bar when column width is set in %', () => {
            fix.detectChanges();

            grid.columnList.get(0).width = '50%';
            fix.detectChanges();

            const horizontalScroll = fix.nativeElement.querySelector('igx-horizontal-virtual-helper');
            expect(horizontalScroll.offsetWidth).toBeGreaterThanOrEqual(782);
            expect(horizontalScroll.offsetWidth).toBeLessThanOrEqual(786);
            expect(horizontalScroll.children[0].offsetWidth).toBeGreaterThanOrEqual(799);
            expect(horizontalScroll.children[0].offsetWidth).toBeLessThanOrEqual(801);
        });

        it('checks if attributes are correctly assigned when grid has or does not have data', fakeAsync(() => {
            // With data, igx-grid__tbody-content is the rowgroup focus host
            const container = fix.nativeElement.querySelectorAll('.igx-grid__tbody-content')[0];
            expect(container.getAttribute('role')).toBe('rowgroup');

            //Filter grid so no results are available and grid is empty
            grid.filter('Name', '111', IgxStringFilteringOperand.instance().condition('contains'), true);
            fix.detectChanges();
            fix.detectChanges();
            expect(container.getAttribute('role')).toMatch('row');

            // clear grid data and check if attribute is now 'row'
            grid.clearFilter();
            fix.componentInstance.clearData();
            fix.detectChanges();
            tick();

            expect(container.getAttribute('role')).toMatch('row');
        }));

        it('should have correct ARIA role structure on tbody and tfoot', fakeAsync(() => {
            // Outer tbody wrapper is layout-only
            const tbodyWrapper = fix.nativeElement.querySelector('.igx-grid__tbody');
            expect(tbodyWrapper.getAttribute('role')).toBe('presentation');

            // Inner focus host is the rowgroup
            const tbodyContent = fix.nativeElement.querySelector('.igx-grid__tbody-content');
            expect(tbodyContent.getAttribute('role')).toBe('rowgroup');
            expect(tbodyContent.getAttribute('tabindex')).toBe('0');

            // Outer tfoot wrapper is layout-only
            const tfootWrapper = fix.nativeElement.querySelector('.igx-grid__tfoot');
            expect(tfootWrapper.getAttribute('role')).toBe('presentation');

            // Inner tfoot div is the rowgroup focus host
            const tfootContent = fix.nativeElement.querySelector('.igx-grid__tfoot > div');
            expect(tfootContent.getAttribute('role')).toBe('rowgroup');
            expect(tfootContent.getAttribute('tabindex')).toBe('0');
        }));

        it('should display flat data even if no foreignKey is set', () => {
            fix = TestBed.createComponent(IgxTreeGridWithNoForeignKeyComponent);
            grid = fix.componentInstance.treeGrid;
            fix.detectChanges();

            expect(grid.dataView.length).toBeGreaterThan(0);
        });

        it('should throw a warning when primaryKey is set to a non-existing data field', () => {
            jasmine.getEnv().allowRespy(true);
            const warnSpy = spyOn(console, 'warn');
            grid.primaryKey = 'testField';
            fix.detectChanges();

            expect(console.warn).toHaveBeenCalledTimes(1);
            expect(console.warn).toHaveBeenCalledWith(
                `Field "${grid.primaryKey}" is not defined in the data. Set \`primaryKey\` to a valid field.`
            );
            warnSpy.calls.reset();

            const oldData = fix.componentInstance.data;
            const newData = fix.componentInstance.data.map(rec => Object.assign({}, rec, { testField: 0 }));
            fix.componentInstance.data = newData;
            fix.detectChanges();

            expect(console.warn).toHaveBeenCalledTimes(0);

            fix.componentInstance.data = oldData;
            fix.detectChanges();

            expect(console.warn).toHaveBeenCalledTimes(1);
            expect(console.warn).toHaveBeenCalledWith(
                `Field "${grid.primaryKey}" is not defined in the data. Set \`primaryKey\` to a valid field.`
            );
            jasmine.getEnv().allowRespy(false);
        });
    });

    describe('Auto-generated columns', () => {
        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridComponent);
            grid = fix.componentInstance;
            grid.autoGenerate = true;

            // When doing pure unit tests, the grid doesn't get removed after the test, because it overrides
            // the element ID and the testbed cannot find it to remove it.
            // The testbed is looking up components by [id^=root], so working around this by forcing root id
            grid.id = SAFE_DISPOSE_COMP_ID;
        }));

        // afterEach(() => {
        //     // When doing pure unit tests, the grid doesn't get removed after the test, because it overrides
        //     // the element ID and the testbed cannot find it to remove it.
        //     // this is needed when we don't force a root id
        //     grid.ngOnDestroy();
        //     element.remove();
        // });

        it('should auto-generate all columns', async () => {
            grid.data = [];
            await fix.whenStable();
            fix.detectChanges();

            grid.data = SampleTestData.employeePrimaryForeignKeyTreeData();
            await fix.whenStable();
            fix.detectChanges();

            grid.primaryKey = 'ID';
            grid.foreignKey = 'ParentID';
            await wait(100);
            await fix.whenStable();
            fix.detectChanges();

            const expectedColumns = [...Object.keys(grid.data[0])];

            expect(grid.columns.map(c => c.field)).toEqual(expectedColumns);
            // Verify that records are also rendered by checking the first record cell
            expect(grid.getCellByColumn(0, 'ID').value).toEqual(1);
        });

        it('should auto-generate columns without childDataKey', fakeAsync(() => {
            grid.data = [];
            tick();
            fix.detectChanges();

            grid.childDataKey = 'Employees';
            tick();
            fix.detectChanges();

            grid.data = SampleTestData.employeeAllTypesTreeData();
            tick();
            fix.detectChanges();

            const expectedColumns = [...Object.keys(grid.data[0])].filter(col => col !== grid.childDataKey);

            // Employees shouldn't be in the columns
            expect(grid.columns.map(c => c.field)).toEqual(expectedColumns);
            // Verify that records are also rendered by checking the first record cell
            expect(grid.getCellByColumn(0, 'ID').value).toEqual(147);
        }));

        it('should recreate columns when data changes and autoGenerate is true', fakeAsync(() => {
            grid.width = '500px';
            grid.height = '500px';
            grid.autoGenerate = true;
            fix.detectChanges();

            const initialData = [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' }
            ];
            grid.data = initialData;
            tick();
            fix.detectChanges();

            expect(grid.columns.length).toBe(2);
            expect(grid.columns[0].field).toBe('id');
            expect(grid.columns[1].field).toBe('name');

            const newData = [
                { id: 1, firstName: 'John', lastName: 'Doe' },
                { id: 2, firstName: 'Jane', lastName: 'Smith' }
            ];
            grid.data = newData;
            tick();
            fix.detectChanges();

            expect(grid.columns.length).toBe(3);
            expect(grid.columns[0].field).toBe('id');
            expect(grid.columns[1].field).toBe('firstName');
            expect(grid.columns[2].field).toBe('lastName');
        }));
    });

    describe('Loading Template', () => {
        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridDefaultLoadingComponent);
            grid = fix.componentInstance.treeGrid;
        }));

        it('should auto-generate columns', async () => {
            fix.detectChanges();
            const gridElement = fix.debugElement.query(By.css('.igx-grid'));
            let loadingIndicator = gridElement.query(By.css('.igx-grid__loading'));
            expect(loadingIndicator).not.toBeNull();
            expect(grid.dataRowList.length).toBe(0);

            await wait(1000);
            fix.detectChanges();
            loadingIndicator = gridElement.query(By.css('.igx-grid__loading'));
            expect(loadingIndicator).toBeNull();
            expect(grid.dataRowList.length).toBeGreaterThan(0);
        });
    });

    describe('Hide All', () => {
        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridCellSelectionComponent);
            grid = fix.componentInstance.treeGrid;
            fix.detectChanges();
        }));

        it('should not render rows and headers group when all cols are hidden', fakeAsync(() => {
            grid.rowSelection = GridSelectionMode.multiple;
            grid.rowDraggable = true;
            tick();
            fix.detectChanges();

            let fixEl = fix.nativeElement; let gridEl = grid.nativeElement;
            let tHeadItems = fixEl.querySelector('igx-grid-header-group');
            let gridRows = fixEl.querySelector('igx-tree-grid-row');
            let paging = fixEl.querySelector('.igx-paginator');
            let rowSelectors = gridEl.querySelector('.igx-checkbox');
            let dragIndicators = gridEl.querySelector('.igx-grid__drag-indicator');
            let verticalScrollBar = gridEl.querySelector('.igx-grid__tbody-scrollbar[hidden]');

            expect(tHeadItems).not.toBeNull();
            expect(gridRows).not.toBeNull();
            expect(paging).not.toBeNull();
            expect(rowSelectors).not.toBeNull();
            expect(dragIndicators).not.toBeNull();
            expect(verticalScrollBar).toBeNull();

            grid.columnList.forEach((col) => col.hidden = true);
            tick();
            fix.detectChanges();
            fixEl = fix.nativeElement;
            gridEl = grid.nativeElement;

            tHeadItems = fixEl.querySelector('igx-grid-header-group');
            gridRows = fixEl.querySelector('igx-tree-grid-row');
            paging = fixEl.querySelector('.igx-paginator');
            rowSelectors = gridEl.querySelector('.igx-checkbox');
            dragIndicators = gridEl.querySelector('.igx-grid__drag-indicator');
            verticalScrollBar = gridEl.querySelector('.igx-grid__tbody-scrollbar[hidden]');

            expect(tHeadItems).toBeNull();
            expect(gridRows).toBeNull();
            expect(paging).not.toBeNull();
            expect(rowSelectors).toBeNull();
            expect(dragIndicators).toBeNull();
            expect(verticalScrollBar).not.toBeNull();
        }));

    });

    describe('Setting null data', () => {
        it('should not throw error when data is null', () => {
            fix = TestBed.createComponent(IgxTreeGridNoDataComponent);
            fix.componentInstance.treeGrid.batchEditing = true;
            expect(() => fix.detectChanges()).not.toThrow();
        });

        it('should not throw error when data is set to null', () => {
            fix = TestBed.createComponent(IgxTreeGridCellSelectionComponent);
            fix.componentInstance.data = null;
            expect(() => fix.detectChanges()).not.toThrow();
        });

        it('should not throw error when data is set to null and transactions are enabled', () => {
            fix = TestBed.createComponent(IgxTreeGridSummariesTransactionsComponent);
            fix.componentInstance.data = null;
            expect(() => fix.detectChanges()).not.toThrow();
        });

        it('should not throw error when data is null and row is pinned', () => {
            fix = TestBed.createComponent(IgxTreeGridNoDataComponent);
            grid = fix.componentInstance.treeGrid;
            grid.pinRow(4);
            expect(() => fix.detectChanges()).not.toThrow();
        });
    });

    describe('Public API', () => {
        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
            grid = fix.componentInstance.treeGrid;
            fix.detectChanges();
        }));

        it('getCellByColumn should return undefined for a non-existing row index or column', () => {
            expect(grid.getCellByColumn(0, 'Name').value).toBe('John Winchester');
            expect(grid.getCellByColumn(0, 'NonExisting')).toBeUndefined();
            expect(grid.getCellByColumn(-1, 'Name')).toBeUndefined();
            expect(grid.getCellByColumn(grid.dataView.length, 'Name')).toBeUndefined();
        });

        it('getCellByKey should return undefined for a non-existing key or column', () => {
            expect(grid.getCellByKey(957, 'Name').value).toBe('Thomas Hardy');
            expect(grid.getCellByKey(957, 'NonExisting')).toBeUndefined();
            expect(grid.getCellByKey(123456, 'Name')).toBeUndefined();
        });

        it('getCellByKey should return undefined for a record in a collapsed parent', () => {
            grid.collapseRow(147);
            fix.detectChanges();

            expect(grid.getRowByKey(957)).toBeUndefined();
            expect(grid.getCellByKey(957, 'Name')).toBeUndefined();
        });

        it('getDefaultExpandState should take into account the children and the expansionDepth', () => {
            const parentRecord = grid.records.get(147);
            const nestedParentRecord = grid.records.get(317);
            const leafRecord = grid.records.get(711);

            expect(grid.getDefaultExpandState(parentRecord)).toBeTrue();
            expect(grid.getDefaultExpandState(nestedParentRecord)).toBeTrue();
            expect(grid.getDefaultExpandState(leafRecord)).toBeFalse();

            grid.expansionDepth = 1;
            fix.detectChanges();

            expect(grid.getDefaultExpandState(parentRecord)).toBeTrue();
            expect(grid.getDefaultExpandState(nestedParentRecord)).toBeFalse();

            grid.expansionDepth = 0;
            fix.detectChanges();

            expect(grid.getDefaultExpandState(parentRecord)).toBeFalse();
        });
    });

    describe('Tree grid API service', () => {
        let gridAPI: IgxTreeGridAPIService;

        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
            grid = fix.componentInstance.treeGrid;
            fix.detectChanges();
            gridAPI = grid.gridAPI as IgxTreeGridAPIService;
        }));

        it('should not apply number styles to the tree column', () => {
            const idColumn = grid.getColumnByName('ID');
            const ageColumn = grid.getColumnByName('Age');
            const nameColumn = grid.getColumnByName('Name');

            expect(idColumn.visibleIndex).toBe(0);
            expect(gridAPI.should_apply_number_style(idColumn)).toBeFalse();
            expect(gridAPI.should_apply_number_style(ageColumn)).toBeTrue();
            expect(gridAPI.should_apply_number_style(nameColumn)).toBeFalse();

            ageColumn.dataType = GridColumnDataType.Currency;
            expect(gridAPI.should_apply_number_style(ageColumn)).toBeTrue();
            ageColumn.dataType = GridColumnDataType.Percent;
            expect(gridAPI.should_apply_number_style(ageColumn)).toBeTrue();
        });

        it('filterTreeDataByExpressions should return the root records when there are no expressions', () => {
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            expect(gridAPI.filterTreeDataByExpressions(tree)).toBe(grid.rootRecords);
        });

        it('filterTreeDataByExpressions should keep the parents of the matching records', () => {
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Name',
                searchVal: 'Sven',
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                ignoreCase: true
            });

            const result = gridAPI.filterTreeDataByExpressions(tree);

            expect(result.length).toBe(1);
            expect(result[0].key).toBe(147);
            expect(result[0].isFilteredOutParent).toBeTrue();
            expect(result[0].children.map(c => c.key)).toEqual([317]);
            expect(result[0].children[0].isFilteredOutParent).toBeTrue();
            expect(result[0].children[0].children.map(c => c.key)).toEqual([998]);
            expect(result[0].children[0].children[0].isFilteredOutParent).toBeFalsy();
            // the source records should not be modified
            expect(grid.records.get(147).isFilteredOutParent).toBeUndefined();
        });

        it('filterDataByExpressions should return a flat list with the data of the matching records only', () => {
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Age',
                searchVal: 43,
                condition: IgxNumberFilteringOperand.instance().condition('greaterThan')
            });

            const result = gridAPI.filterDataByExpressions(tree);
            const expectedData = grid.flatData.filter(rec => rec.Age > 43);

            // the data records are returned (same as the other grids), not the ITreeGridRecord wrappers
            expect(result.length).toBe(expectedData.length);
            result.forEach((rec, index) => expect(rec).toBe(expectedData[index]));
        });

        it('filterDataByExpressions should return the data of all records when there are no expressions', () => {
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            const result = gridAPI.filterDataByExpressions(tree);

            expect(result.length).toBe(grid.flatData.length);
            result.forEach((rec, index) => expect(rec).toBe(grid.flatData[index]));
        });

        it('filterDataByExpressions should return an empty list when nothing matches', () => {
            const tree = new FilteringExpressionsTree(FilteringLogic.And);
            tree.filteringOperands.push({
                fieldName: 'Name',
                searchVal: 'NonExistingName',
                condition: IgxStringFilteringOperand.instance().condition('equals'),
                ignoreCase: true
            });

            expect(gridAPI.filterDataByExpressions(tree)).toEqual([]);
        });

        it('sortDataByExpressions should sort tree grid records and return their data', () => {
            const records = grid.rootRecords;
            const sorted = gridAPI.sortDataByExpressions(records,
                [{ fieldName: 'Age', dir: SortingDirection.Desc, ignoreCase: false }]);

            expect(sorted.map(rec => rec.ID)).toEqual([17, 147, 19, 847]);
            // the original collection should not be modified
            expect(records.map(rec => rec.key)).toEqual([147, 847, 19, 17]);
        });

        it('get_rec_index_by_id should find the index of a record in a collection of tree records', () => {
            expect(gridAPI.get_rec_index_by_id(147, grid.dataView)).toBe(0);
            expect(gridAPI.get_rec_index_by_id(317, grid.dataView)).toBe(3);
            expect(gridAPI.get_rec_index_by_id(123456, grid.dataView)).toBe(-1);

            grid.primaryKey = undefined;
            expect(gridAPI.get_rec_index_by_id(147, grid.dataView)).toBe(-1);
        });

        it('get_all_data should return an empty array when there is no flat data', () => {
            expect(gridAPI.get_all_data().length).toBe(grid.flatData.length);

            grid.flatData = null;
            expect(gridAPI.get_all_data()).toEqual([]);
        });
    });

    describe('Paging', () => {
        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridCellSelectionComponent);
            grid = fix.componentInstance.treeGrid;
            fix.detectChanges();
        }));

        it('should not page the data locally when pagingMode is remote', () => {
            const allRecordsCount = grid.flatData.length;
            expect(allRecordsCount).toBeGreaterThan(10);
            expect(grid.dataView.length).toBe(10);

            grid.pagingMode = 'remote';
            fix.detectChanges();

            expect(grid.dataView.length).toBe(allRecordsCount);
        });

        it('should use the totalRecords value, when set, to calculate the paging state', () => {
            grid.totalRecords = 25;
            fix.detectChanges();

            expect(grid.pagingState.metadata.countRecords).toBe(25);
            expect(grid.pagingState.metadata.countPages).toBe(3);
            expect(grid.dataView.length).toBe(10);
        });
    });

    describe('Column layouts', () => {
        it('should ignore column layouts as they are not supported by the tree grid', () => {
            fix = TestBed.createComponent(IgxTreeGridColumnLayoutComponent);
            grid = fix.componentInstance.treeGrid;
            fix.detectChanges();

            expect(grid.hasColumnLayouts).toBeFalse();
            expect(grid.columns.map(col => col.field)).toEqual(['HireDate', 'Age']);
            expect(grid.getCellByColumn(0, 'HireDate')).toBeDefined();
            expect(grid.getCellByColumn(0, 'Age').value).toBe(55);
            expect(grid.getCellByColumn(0, 'ID')).toBeUndefined();
            expect(fix.nativeElement.querySelectorAll('igx-grid-header-group').length).toBe(2);
        });
    });

    describe('Standalone directives', () => {
        it('should expose the row loading indicator template directive', () => {
            expect(IGX_TREE_GRID_DIRECTIVES).toContain(IgxRowLoadingIndicatorTemplateDirective);
        });
    });

    describe('Displaying empty grid message', () => {
        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTreeGridWrappedInContComponent);
            grid = fix.componentInstance.treeGrid;
            fix.detectChanges();
        }));

        it('should display empty grid message when there is no data', () => {
            const data: any[] = grid.data;
            grid.data = [];
            fix.detectChanges();
            let emptyGridMessage = fix.debugElement.query(By.css('.igx-grid__tbody-message'));
            expect(emptyGridMessage).toBeTruthy();
            expect(emptyGridMessage.nativeElement.innerText).toBe('Grid has no data.');

            grid.data = data;
            fix.detectChanges();
            emptyGridMessage = fix.debugElement.query(By.css('.igx-grid__tbody-message'));
            expect(emptyGridMessage).toBeFalsy();
        });

        it('should display empty grid message when last row is deleted', () => {
            grid.data = [];
            grid.addRow({
                ID: 0,
                Name: 'John Winchester',
                HireDate: new Date(2008, 3, 20),
                Age: 55,
                OnPTO: false,
                Employees: []
            });

            fix.detectChanges();
            let emptyGridMessage = fix.debugElement.query(By.css('.igx-grid__tbody-message'));
            expect(emptyGridMessage).toBeFalsy();

            grid.deleteRowById(0);
            fix.detectChanges();
            emptyGridMessage = fix.debugElement.query(By.css('.igx-grid__tbody-message'));
            expect(emptyGridMessage).toBeTruthy();
            expect(emptyGridMessage.nativeElement.innerText).toBe('Grid has no data.');
        });
    });

});
