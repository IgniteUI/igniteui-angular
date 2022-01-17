import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilteringExpressionsTree, FilteringLogic, IgxPivotDateDimension, IgxPivotGridComponent, IgxPivotGridModule, IgxPivotRowComponent, IgxPivotRowDimensionHeaderGroupComponent, IgxStringFilteringOperand } from 'igniteui-angular';
import { IgxChipsAreaComponent } from '../../chips/chips-area.component';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { IgxPivotGridTestBaseComponent, IgxPivotGridTestComplexHierarchyComponent, IgxTotalSaleAggregate } from '../../test-utils/pivot-grid-samples.spec';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { PivotDimensionType } from './pivot-grid.interface';
import { IgxPivotHeaderRowComponent } from './pivot-header-row.component';
import { IgxPivotRowDimensionHeaderComponent } from './pivot-row-dimension-header.component';
const CSS_CLASS_DROP_DOWN_BASE = 'igx-drop-down';
const CSS_CLASS_LIST = 'igx-drop-down__list';
const CSS_CLASS_ITEM = 'igx-drop-down__item';

describe('Basic IgxPivotGrid #pivotGrid', () => {
    let fixture;
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxPivotGridTestBaseComponent
            ],
            imports: [
                NoopAnimationsModule, IgxPivotGridModule]
        });
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(IgxPivotGridTestBaseComponent);
        fixture.detectChanges();
    }));

    it('should apply formatter and dataType from measures', () => {
        const pivotGrid = fixture.componentInstance.pivotGrid;
        pivotGrid.width = '1500px';
        fixture.detectChanges();

        const actualFormatterValue = pivotGrid.rowList.first.cells.first.title;
        expect(actualFormatterValue).toEqual('774$');
        const actualDataTypeValue = pivotGrid.rowList.first.cells.last.title;
        expect(actualDataTypeValue).toEqual('$71.89');
    });

    it('should apply css class to cells from measures', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const cells = pivotGrid.rowList.first.cells;
        expect(cells.first.nativeElement.classList).toContain('test');
        expect(cells.last.nativeElement.classList).not.toContain('test');
    });

    it('should remove row dimensions from chip', () => {
        const pivotGrid = fixture.componentInstance.pivotGrid;
        pivotGrid.pivotConfiguration.rows.push({
            memberName: 'SellerName',
            enabled: true
        });
        pivotGrid.pipeTrigger++;
        fixture.detectChanges();
        expect(pivotGrid.rowDimensions.length).toBe(2);
        expect(pivotGrid.rowList.first.data['SellerName']).not.toBeUndefined();

        const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
        const rowChip = headerRow.querySelector('igx-chip[id="SellerName"]');
        const removeIcon = rowChip.querySelectorAll('igx-icon')[3];
        removeIcon.click();
        fixture.detectChanges();
        expect(pivotGrid.pivotConfiguration.rows[1].enabled).toBeFalse();
        expect(pivotGrid.rowDimensions.length).toBe(1);
        expect(pivotGrid.rowList.first.data['SellerName']).toBeUndefined();

    });

    it('should remove column dimensions from chip', () => {
        const pivotGrid = fixture.componentInstance.pivotGrid;
        expect(pivotGrid.columns.length).toBe(9);
        pivotGrid.pivotConfiguration.columns.push({
            memberName: 'SellerName',
            enabled: true
        });
        pivotGrid.pipeTrigger++;
        pivotGrid.setupColumns();
        fixture.detectChanges();
        expect(pivotGrid.columnDimensions.length).toBe(2);
        expect(pivotGrid.columns.length).not.toBe(9);

        const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
        const rowChip = headerRow.querySelector('igx-chip[id="SellerName"]');
        const removeIcon = rowChip.querySelectorAll('igx-icon')[3];
        removeIcon.click();
        fixture.detectChanges();
        expect(pivotGrid.pivotConfiguration.columns[1].enabled).toBeFalse();
        expect(pivotGrid.columnDimensions.length).toBe(1);
        expect(pivotGrid.columns.length).toBe(9);
    });

    it('should remove value from chip', () => {
        const pivotGrid = fixture.componentInstance.pivotGrid;
        expect(pivotGrid.columns.length).toBe(9);
        expect(pivotGrid.values.length).toBe(2);

        const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
        const rowChip = headerRow.querySelector('igx-chip[id="UnitsSold"]');
        const removeIcon = rowChip.querySelectorAll('igx-icon')[3];
        removeIcon.click();
        fixture.detectChanges();
        expect(pivotGrid.pivotConfiguration.values[0].enabled).toBeFalse();
        expect(pivotGrid.values.length).toBe(1);
        expect(pivotGrid.columns.length).not.toBe(9);
    });

    it('should remove filter dimension from chip', () => {
        const pivotGrid = fixture.componentInstance.pivotGrid;

        const filteringExpressionTree = new FilteringExpressionsTree(FilteringLogic.And);
        filteringExpressionTree.filteringOperands = [
            {
                condition: IgxStringFilteringOperand.instance().condition('equals'),
                fieldName: 'SellerName',
                searchVal: 'Stanley'
            }
        ];
        const filterDimension = {
            memberName: 'SellerName',
            enabled: true,
            filter: filteringExpressionTree
        };
        pivotGrid.pivotConfiguration.filters = [filterDimension];
        pivotGrid.pipeTrigger++;
        fixture.detectChanges();
        expect(pivotGrid.pivotConfiguration.filters[0].enabled).toBeTrue();
        expect(pivotGrid.rowList.length).toBe(2);

        const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
        const rowChip = headerRow.querySelector('igx-chip[id="SellerName"]');
        const removeIcon = rowChip.querySelectorAll('igx-icon')[2];
        removeIcon.click();
        fixture.detectChanges();
        expect(pivotGrid.pivotConfiguration.filters[0].enabled).toBeFalse();
        expect(pivotGrid.rowList.length).toBe(5);
    });

    it('should collapse column with 1 value dimension', () => {
        const pivotGrid = fixture.componentInstance.pivotGrid;
        pivotGrid.pivotConfiguration.values.pop();
        pivotGrid.pivotConfiguration.columns = [{
            memberName: 'AllCountries',
            memberFunction: () => 'All Countries',
            enabled: true,
            childLevel: {
                memberName: 'Country',
                enabled: true
            }
        }];
        pivotGrid.pivotConfiguration.rows[0] = new IgxPivotDateDimension(
            {
                memberName: 'Date',
                enabled: true
            }, {
            total: false
        }
        );
        pivotGrid.notifyDimensionChange(true);
        expect(pivotGrid.columns.length).toBe(5);
        expect(pivotGrid.columnGroupStates.size).toBe(0);
        const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
        const header = headerRow.querySelector('igx-grid-header-group');
        const expander = header.querySelectorAll('igx-icon')[0];
        expander.click();
        fixture.detectChanges();
        expect(pivotGrid.columnGroupStates.size).toBe(1);
        const value = pivotGrid.columnGroupStates.entries().next().value;
        expect(value[0]).toEqual('All Countries');
        expect(value[1]).toBeTrue();
    });

    it('should collapse column with 2 value dimension', () => {
        const pivotGrid = fixture.componentInstance.pivotGrid;
        pivotGrid.pivotConfiguration.columns = [{
            memberName: 'AllCountries',
            memberFunction: () => 'All Countries',
            enabled: true,
            childLevel: {
                memberName: 'Country',
                enabled: true
            }
        },
        {
            memberName: 'SellerName',
            enabled: true
        }];
        pivotGrid.notifyDimensionChange(true);
        fixture.detectChanges();
        expect(pivotGrid.columnGroupStates.size).toBe(0);
        const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
        const header = headerRow.querySelector('igx-grid-header-group');
        const expander = header.querySelectorAll('igx-icon')[0];
        expander.click();
        fixture.detectChanges();
        expect(pivotGrid.columnGroupStates.size).toBe(1);
        let value = pivotGrid.columnGroupStates.entries().next().value;
        expect(value[0]).toEqual('All Countries');
        expect(value[1]).toBeTrue();

        expander.click();
        fixture.detectChanges();
        value = pivotGrid.columnGroupStates.entries().next().value;
        expect(value[0]).toEqual('All Countries');
        expect(value[1]).toBeFalse();
    });

    describe('IgxPivotGrid Features #pivotGrid', () => {
        it('should show excel style filtering via dimension chip.', () => {
            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fixture, 'igx-pivot-grid');
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const rowChip = headerRow.querySelector('igx-chip[id="All"]');
            const filterIcon = rowChip.querySelectorAll('igx-icon')[2];

            expect(excelMenu.parentElement.parentElement.attributes.hidden).not.toBeUndefined();
            filterIcon.click();
            fixture.detectChanges();
            const esfSearch = GridFunctions.getExcelFilteringSearchComponent(fixture, excelMenu, 'igx-pivot-grid');
            const checkBoxes = esfSearch.querySelectorAll('igx-checkbox');
            // should show and should display correct checkboxes.
            expect(excelMenu.parentElement.parentElement.attributes.hidden).toBeUndefined();
            expect((checkBoxes[0].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Select All');
            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Accessories');
            expect((checkBoxes[2].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Bikes');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Clothing');
            expect((checkBoxes[4].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Components');
        });

        it('should filter rows via excel style filtering dimension chip.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const rowChip = headerRow.querySelector('igx-chip[id="All"]');
            const filterIcon = rowChip.querySelectorAll('igx-icon')[2];
            filterIcon.click();
            fixture.detectChanges();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fixture, 'igx-pivot-grid');
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fixture, excelMenu, 'igx-pivot-grid'));

            // uncheck Accessories
            checkboxes[1].click();
            fixture.detectChanges();

            // uncheck Bikes
            checkboxes[2].click();
            fixture.detectChanges();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fixture, excelMenu, 'igx-pivot-grid');
            fixture.detectChanges();

            // check rows
            const rows = pivotGrid.rowList.toArray();
            expect(rows.length).toBe(3);
            const expectedHeaders = ['All', 'Clothing', 'Components'];
            const rowHeaders = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            const rowDimensionHeaders = rowHeaders.map(x => x.componentInstance.column.header);
            expect(rowDimensionHeaders).toEqual(expectedHeaders);
        });

        it('should filter columns via excel style filtering dimension chip.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const rowChip = headerRow.querySelector('igx-chip[id="Country"]');
            const filterIcon = rowChip.querySelectorAll('igx-icon')[2];
            filterIcon.click();
            fixture.detectChanges();
            const excelMenu = GridFunctions.getExcelStyleFilteringComponent(fixture, 'igx-pivot-grid');
            const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fixture, excelMenu, 'igx-pivot-grid'));

            // uncheck Bulgaria
            checkboxes[1].click();
            fixture.detectChanges();

            // uncheck Uruguay
            checkboxes[2].click();
            fixture.detectChanges();


            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fixture, excelMenu, 'igx-pivot-grid');
            fixture.detectChanges();

            // check columns
            const colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
            const expected = ['USA'];
            expect(colHeaders).toEqual(expected);
        });

        it('should apply sorting for dimension via row chip', () => {
            fixture.detectChanges();
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const rowChip = headerRow.querySelector('igx-chip[id="All"]');
            rowChip.click();
            fixture.detectChanges();
            let rowHeaders = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            let expectedOrder = ['All', 'Accessories', 'Bikes', 'Clothing', 'Components'];
            let rowDimensionHeaders = rowHeaders.map(x => x.componentInstance.column.header);
            expect(rowDimensionHeaders).toEqual(expectedOrder);

            rowChip.click();
            fixture.detectChanges();
            expectedOrder = ['All', 'Components', 'Clothing', 'Bikes', 'Accessories'];
            rowHeaders = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            rowDimensionHeaders = rowHeaders.map(x => x.componentInstance.column.header);
            expect(rowDimensionHeaders).toEqual(expectedOrder);
        });

        it('should apply sorting for dimension via column chip', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const colChip = headerRow.querySelector('igx-chip[id="Country"]');

            // sort
            colChip.click();
            fixture.detectChanges();

            let colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
            let expected = ['Bulgaria', 'USA', 'Uruguay'];
            expect(colHeaders).toEqual(expected);

            // sort
            colChip.click();
            fixture.detectChanges();

            colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
            expected = ['Uruguay', 'USA', 'Bulgaria'];
            expect(colHeaders).toEqual(expected);
        });

        it('should sort on column for single row dimension.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const headerCell = GridFunctions.getColumnHeader('USA-UnitsSold', fixture);

            // sort asc
            GridFunctions.clickHeaderSortIcon(headerCell);
            fixture.detectChanges();
            expect(pivotGrid.sortingExpressions.length).toBe(1);
            let expectedOrder = [829, undefined, 240, 293, 296];
            let columnValues = pivotGrid.dataView.map(x => x['USA-UnitsSold']);
            expect(columnValues).toEqual(expectedOrder);

            // sort desc
            GridFunctions.clickHeaderSortIcon(headerCell);
            fixture.detectChanges();
            expect(pivotGrid.sortingExpressions.length).toBe(1);
            expectedOrder = [829, 296, 293, 240, undefined];
            columnValues = pivotGrid.dataView.map(x => x['USA-UnitsSold']);
            expect(columnValues).toEqual(expectedOrder);

            // remove sort
            GridFunctions.clickHeaderSortIcon(headerCell);
            fixture.detectChanges();
            expect(pivotGrid.sortingExpressions.length).toBe(0);
            expectedOrder = [829, 293, undefined, 296, 240];
            columnValues = pivotGrid.dataView.map(x => x['USA-UnitsSold']);
            expect(columnValues).toEqual(expectedOrder);
        });

        // xit-ing because of https://github.com/IgniteUI/igniteui-angular/issues/10546
        xit('should sort on column for all sibling dimensions.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.height = '1500px';
            pivotGrid.pivotConfiguration.rows = [
                {
                    memberName: 'ProductCategory',
                    enabled: true
                },
                {
                    memberName: 'SellerName',
                    enabled: true
                }
            ];
            // add a bit more data to sort.
            pivotGrid.data = [
                {
                    ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                    Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282
                },
                {
                    ProductCategory: 'Clothing', UnitPrice: 49.57, SellerName: 'Elisa',
                    Country: 'USA', Date: '01/05/2019', UnitsSold: 296
                },
                {
                    ProductCategory: 'Bikes', UnitPrice: 3.56, SellerName: 'Lydia',
                    Country: 'Uruguay', Date: '01/06/2020', UnitsSold: 68
                },
                {
                    ProductCategory: 'Accessories', UnitPrice: 85.58, SellerName: 'David',
                    Country: 'USA', Date: '04/07/2021', UnitsSold: 293
                },
                {
                    ProductCategory: 'Components', UnitPrice: 18.13, SellerName: 'John',
                    Country: 'USA', Date: '12/08/2021', UnitsSold: 240
                },
                {
                    ProductCategory: 'Clothing', UnitPrice: 68.33, SellerName: 'Larry',
                    Country: 'Uruguay', Date: '05/12/2020', UnitsSold: 456
                },
                {
                    ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Walter',
                    Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 492
                },
                {
                    ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Elisa',
                    Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 267
                },
                {
                    ProductCategory: 'Clothing', UnitPrice: 16.05, SellerName: 'Larry',
                    Country: 'Bulgaria', Date: '02/19/2020', UnitsSold: 100
                }
            ];
            pivotGrid.pipeTrigger++;
            fixture.detectChanges();
            const headerCell = GridFunctions.getColumnHeader('Bulgaria-UnitsSold', fixture);
            // sort asc
            GridFunctions.clickHeaderSortIcon(headerCell);
            fixture.detectChanges();
            expect(pivotGrid.sortingExpressions.length).toBe(1);
            let expectedOrder = [undefined, undefined, undefined, 100, 267, 282, 492];
            let columnValues = pivotGrid.dataView.map(x => x['Bulgaria-UnitsSold']);
            expect(columnValues).toEqual(expectedOrder);

            // sort desc
            GridFunctions.clickHeaderSortIcon(headerCell);
            fixture.detectChanges();
            expect(pivotGrid.sortingExpressions.length).toBe(1);
            expectedOrder = [492, 282, 267, 100, undefined, undefined, undefined];
            columnValues = pivotGrid.dataView.map(x => x['Bulgaria-UnitsSold']);
            expect(columnValues).toEqual(expectedOrder);
        });

        it('should allow changing default aggregation via value chip drop-down.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.width = '1500px';
            fixture.detectChanges();
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const valueChip = headerRow.querySelector('igx-chip[id="UnitsSold"]');
            let content = valueChip.querySelector('.igx-chip__content');
            expect(content.textContent.trim()).toBe('SUM(UnitsSold)');

            const aggregatesIcon = valueChip.querySelectorAll('igx-icon')[1];
            aggregatesIcon.click();
            fixture.detectChanges();
            const items = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_ITEM}`));
            expect(items.length).toBe(5);
            // select count
            items[0].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();

            // check chip and row
            content = valueChip.querySelector('.igx-chip__content');
            expect(content.textContent.trim()).toBe('COUNT(UnitsSold)');
            expect(pivotGrid.gridAPI.get_cell_by_index(0, 'Bulgaria-UnitsSold').value).toBe(2);
            expect(pivotGrid.gridAPI.get_cell_by_index(0, 'USA-UnitsSold').value).toBe(3);
            expect(pivotGrid.gridAPI.get_cell_by_index(0, 'Uruguay-UnitsSold').value).toBe(2);

        });
        it('should allow showing custom aggregations via pivot configuration.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.pivotConfiguration.values = [];
            pivotGrid.pivotConfiguration.values.push({
                member: 'AmountOfSale',
                displayName: 'Amount of Sale',
                aggregate: {
                    key: 'SUM',
                    aggregator: IgxTotalSaleAggregate.totalSale,
                    label: 'Sum of Sale'
                },
                aggregateList: [{
                    key: 'SUM',
                    aggregator: IgxTotalSaleAggregate.totalSale,
                    label: 'Sum of Sale'
                }, {
                    key: 'MIN',
                    aggregator: IgxTotalSaleAggregate.totalMin,
                    label: 'Minimum of Sale'
                }, {
                    key: 'MAX',
                    aggregator: IgxTotalSaleAggregate.totalMax,
                    label: 'Maximum of Sale'
                }],
                enabled: true
            });
            pivotGrid.pipeTrigger++;
            pivotGrid.setupColumns();
            fixture.detectChanges();
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const valueChip = headerRow.querySelector('igx-chip[id="Amount of Sale"]');
            let content = valueChip.querySelector('.igx-chip__content');
            expect(content.textContent.trim()).toBe('SUM(Amount of Sale)');

            const aggregatesIcon = valueChip.querySelectorAll('igx-icon')[1];
            aggregatesIcon.click();
            fixture.detectChanges();

            const items = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_ITEM}`));
            expect(items.length).toBe(3);
            // select min
            items[1].triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();
            // check chip and row values
            content = valueChip.querySelector('.igx-chip__content');
            expect(content.textContent.trim()).toBe('MIN(Amount of Sale)');
            expect(pivotGrid.gridAPI.get_cell_by_index(0, 'Bulgaria').value).toBe(3612.42);
            expect(pivotGrid.gridAPI.get_cell_by_index(0, 'USA').value).toBe(0);
            expect(pivotGrid.gridAPI.get_cell_by_index(0, 'Uruguay').value).toBe(242.08);
        });
        it('should show one aggregations drop-down at a time', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.width = '1500px';
            fixture.detectChanges();
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const valueChipUnitsSold = headerRow.querySelector('igx-chip[id="UnitsSold"]');

            const aggregatesIconUnitsSold = valueChipUnitsSold.querySelectorAll('igx-icon')[1];
            aggregatesIconUnitsSold.click();
            fixture.detectChanges();

            let dropDown = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_LIST}`));
            expect(dropDown.length).toBe(1);

            const valueChipUnitPrice = headerRow.querySelector('igx-chip[id="UnitPrice"]');

            const aggregatesIconUnitPrice = valueChipUnitPrice.querySelectorAll('igx-icon')[1];
            aggregatesIconUnitPrice.click();
            fixture.detectChanges();

            dropDown = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_LIST}`));
            expect(dropDown.length).toBe(1);
        });

        it('should allow reorder in row chip area.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.pivotConfiguration.rows = [
                {
                    memberName: 'ProductCategory',
                    enabled: true
                },
                {
                    memberName: 'SellerName',
                    enabled: true
                }
            ];
            pivotGrid.pipeTrigger++;
            pivotGrid.setupColumns();
            fixture.detectChanges();

            const headerRow: IgxPivotHeaderRowComponent = fixture.debugElement.query(By.directive(IgxPivotHeaderRowComponent)).componentInstance;
            const chipAreas = fixture.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
            const rowChipArea: IgxChipsAreaComponent = chipAreas[3].componentInstance;
            const rowChip1 = rowChipArea.chipsList.toArray()[0];
            const rowChip2 = rowChipArea.chipsList.toArray()[1];

            // start drag in row chip area.
            headerRow.onDimDragStart({}, rowChipArea);
            fixture.detectChanges();

            // move first chip over the second one
            headerRow.onDimDragOver({
                dragChip: {
                    id: 'ProductCategory'
                },
                owner: rowChip2,
                originalEvent: {
                    offsetX: 100
                }
            }, PivotDimensionType.Row);
            fixture.detectChanges();
            
            // check drop indicator has shown after the second chip
            expect((rowChip2.nativeElement.nextElementSibling as any).style.visibility).toBe('');

            // drop chip
            headerRow.onDimDrop({
                dragChip: {
                    id: 'ProductCategory'
                },
                owner: rowChip2
            }, rowChipArea, PivotDimensionType.Row);
            pivotGrid.cdr.detectChanges();
            //check chip order is updated.
            expect(rowChipArea.chipsList.toArray()[0]).toBe(rowChip2);
            expect(rowChipArea.chipsList.toArray()[1]).toBe(rowChip1);
            // check dimension order is updated.
            expect(pivotGrid.pivotConfiguration.rows.map(x => x.memberName)).toEqual(['SellerName', 'ProductCategory']);
        });

        it('should allow reorder in column chip area.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.pivotConfiguration.columns.push({
                memberName: 'SellerName',
                enabled: true
            });
            pivotGrid.pipeTrigger++;
            pivotGrid.setupColumns();
            fixture.detectChanges();

            const headerRow: IgxPivotHeaderRowComponent = fixture.debugElement.query(By.directive(IgxPivotHeaderRowComponent)).componentInstance;
            const chipAreas = fixture.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
            const colChipArea: IgxChipsAreaComponent = chipAreas[1].componentInstance;
            const colChip1 = colChipArea.chipsList.toArray()[0];
            const colChip2 = colChipArea.chipsList.toArray()[1];

             // start drag in col chip area.
             headerRow.onDimDragStart({}, colChipArea);
             fixture.detectChanges();
 
             // move first chip over the second one
             headerRow.onDimDragOver({
                 dragChip: {
                     id: 'Country'
                 },
                 owner: colChip2,
                 originalEvent: {
                     offsetX: 100
                 }
             }, PivotDimensionType.Column);
             fixture.detectChanges();
             
             // check drop indicator has shown after the second chip
             expect((colChip2.nativeElement.nextElementSibling as any).style.visibility).toBe('');
 
             // drop chip
             headerRow.onDimDrop({
                 dragChip: {
                     id: 'Country'
                 },
                 owner: colChip2
             }, colChipArea, PivotDimensionType.Column);
             pivotGrid.cdr.detectChanges();
             //check chip order is updated.
             expect(colChipArea.chipsList.toArray()[0]).toBe(colChip2);
             expect(colChipArea.chipsList.toArray()[1]).toBe(colChip1);
             // check dimension order is updated.
             expect(pivotGrid.pivotConfiguration.columns.map(x => x.memberName)).toEqual(['SellerName', 'Country']);
             // check columns reflect new order of dims
             const cols = pivotGrid.columns;
             expect(cols.filter(x => x.level === 0).map(x => x.field)).toEqual(['Stanley', 'Elisa', 'Lydia', 'David', 'John', 'Larry', 'Walter']);
        });
        it('should allow reorder in the value chip area', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            fixture.detectChanges();
            const headerRow: IgxPivotHeaderRowComponent = fixture.debugElement.query(By.directive(IgxPivotHeaderRowComponent)).componentInstance;
            const chipAreas = fixture.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
            const valuesChipArea: IgxChipsAreaComponent = chipAreas[2].componentInstance;
            const valChip1 = valuesChipArea.chipsList.toArray()[0];
            const valChip2 = valuesChipArea.chipsList.toArray()[1];
 
             // move first chip over the second one
             headerRow.onDimDragOver({
                 dragChip: {
                     id: 'UnitsSold'
                 },
                 owner: valChip2,
                 originalEvent: {
                     offsetX: 100
                 }
             });
             fixture.detectChanges();
             
             // check drop indicator has shown after the second chip
             expect((valChip2.nativeElement.nextElementSibling as any).style.visibility).toBe('');
 
             // drop chip
             headerRow.onValueDrop({
                 dragChip: valChip1,
                 owner: valChip2
             }, valuesChipArea);
             pivotGrid.cdr.detectChanges();
             //check chip order is updated.
             expect(valuesChipArea.chipsList.toArray()[0]).toBe(valChip2);
             expect(valuesChipArea.chipsList.toArray()[1]).toBe(valChip1);
             // check dimension order is updated.
             expect(pivotGrid.pivotConfiguration.values.map(x => x.member)).toEqual(['UnitPrice', 'UnitsSold']);

        });
        it('should allow moving dimension between rows, columns and filters.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.pivotConfiguration.filters = [{
                memberName: 'SellerName',
                enabled: true
            }];
            fixture.detectChanges();
            const headerRow: IgxPivotHeaderRowComponent = fixture.debugElement.query(By.directive(IgxPivotHeaderRowComponent)).componentInstance;
            const chipAreas = fixture.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
            const colChipArea: IgxChipsAreaComponent = chipAreas[1].componentInstance;
            const rowChipArea: IgxChipsAreaComponent = chipAreas[3].componentInstance;
            const filterChipArea: IgxChipsAreaComponent = chipAreas[0].componentInstance;
            const filterChip = filterChipArea.chipsList.first;
             // start drag in filter chip area.
             headerRow.onDimDragStart({}, filterChipArea);
             fixture.detectChanges();

             // check drop here chips are displayed in other areas
             expect(headerRow.notificationChips.toArray()[1].nativeElement.hidden).toBeFalse();
             expect(headerRow.notificationChips.toArray()[2].nativeElement.hidden).toBeFalse();
            
             const dropHereRowChip = headerRow.notificationChips.toArray()[2];
             // move Seller onto the drop here chip
 
             // drop chip
             headerRow.onDimDrop({
                 dragChip: filterChip,
                 owner: dropHereRowChip
             }, rowChipArea, PivotDimensionType.Row);
             pivotGrid.cdr.detectChanges();

             // check dimensions
             expect(pivotGrid.pivotConfiguration.filters.filter(x => x.enabled).length).toBe(0);
             expect(pivotGrid.pivotConfiguration.rows.filter(x => x.enabled).length).toBe(2);

             const rowSellerChip = rowChipArea.chipsList.toArray()[1];
             const colChip = colChipArea.chipsList.first;
             // start drag in row chip area.
             headerRow.onDimDragStart({}, rowChipArea);
             fixture.detectChanges();

             // drag Seller from row dimension as first chip in columns
             headerRow.onDimDragOver({
                dragChip: rowSellerChip,
                owner: colChip,
                originalEvent: {
                    offsetX: 0
                }
            }, PivotDimensionType.Column);
            fixture.detectChanges();
            //check drop indicator between chips
            expect((colChip.nativeElement.previousElementSibling as any).style.visibility).toBe('');
            expect((colChip.nativeElement.nextElementSibling as any).style.visibility).toBe('hidden');

             // drop chip
             headerRow.onDimDrop({
                dragChip: rowSellerChip,
                owner: colChip
            }, colChipArea, PivotDimensionType.Column);
            pivotGrid.cdr.detectChanges();

             // check dimensions
             expect(pivotGrid.pivotConfiguration.filters.filter(x => x.enabled).length).toBe(0);
             expect(pivotGrid.pivotConfiguration.rows.filter(x => x.enabled).length).toBe(1);
             expect(pivotGrid.pivotConfiguration.columns.filter(x => x.enabled).length).toBe(2);

             // drag Seller over filter area
             const colSellerChip = colChipArea.chipsList.toArray()[0];
             // start drag in col chip area.
             headerRow.onDimDragStart({}, colChipArea);
              // drop chip
              headerRow.onDimDrop({
                dragChip: colSellerChip,
                owner: {}
            }, filterChipArea, PivotDimensionType.Filter);
            pivotGrid.cdr.detectChanges();

            expect(pivotGrid.pivotConfiguration.filters.filter(x => x.enabled).length).toBe(1);
            expect(pivotGrid.pivotConfiguration.rows.filter(x => x.enabled).length).toBe(1);
            expect(pivotGrid.pivotConfiguration.columns.filter(x => x.enabled).length).toBe(1);
        });

        it('should hide drop indicators when moving out of the drop area.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.pivotConfiguration.rows = [
                {
                    memberName: 'ProductCategory',
                    enabled: true
                },
                {
                    memberName: 'SellerName',
                    enabled: true
                }
            ];
            pivotGrid.pipeTrigger++;
            pivotGrid.setupColumns();
            fixture.detectChanges();

            const headerRow: IgxPivotHeaderRowComponent = fixture.debugElement.query(By.directive(IgxPivotHeaderRowComponent)).componentInstance;
            const chipAreas = fixture.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
            const rowChipArea: IgxChipsAreaComponent = chipAreas[3].componentInstance;
            const rowChip1 = rowChipArea.chipsList.toArray()[0];
            const rowChip2 = rowChipArea.chipsList.toArray()[1];

             // start drag in row chip area.
             headerRow.onDimDragStart({}, rowChipArea);
             fixture.detectChanges();

             // drag second chip before prev chip
             headerRow.onDimDragOver({
                dragChip: rowChip2,
                owner: rowChip1,
                originalEvent: {
                    offsetX: 0
                }
            }, PivotDimensionType.Row);
            fixture.detectChanges();

            // should show the prev drop indicator for the 1st chip
            expect((rowChip1.nativeElement.previousElementSibling as any).style.visibility).toBe('');
            expect((rowChip1.nativeElement.nextElementSibling as any).style.visibility).toBe('hidden');

            // simulate drag area leave
            headerRow.onAreaDragLeave({}, rowChipArea);

            expect((rowChip1.nativeElement.previousElementSibling as any).style.visibility).toBe('hidden');
            expect((rowChip1.nativeElement.nextElementSibling as any).style.visibility).toBe('hidden');
        });

        it('should auto-size row dimension via the API.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const rowDimension = pivotGrid.pivotConfiguration.rows[0];
            expect(rowDimension.width).toBeUndefined();
            expect(pivotGrid.resolveRowDimensionWidth(rowDimension)).toBe(200);
            pivotGrid.autoSizeRowDimension(rowDimension);
            fixture.detectChanges();
            expect(rowDimension.width).toBe('186px');
            expect(pivotGrid.resolveRowDimensionWidth(rowDimension)).toBe(186);
        });
    });
});

describe('IgxPivotGrid complex hierarchy #pivotGrid', () => {
    let fixture;
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxPivotGridTestComplexHierarchyComponent
            ],
            imports: [
                NoopAnimationsModule, IgxPivotGridModule]
        });
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(IgxPivotGridTestComplexHierarchyComponent);
        fixture.detectChanges();
    }));

    it('should select/deselect the correct row', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const pivotRows = GridFunctions.getPivotRows(fixture);
        const row = pivotRows[2].componentInstance;
        const rowHeaders = fixture.debugElement.queryAll(
            By.directive(IgxPivotRowDimensionHeaderComponent));
        const secondDimCell = rowHeaders.find(x => x.componentInstance.column.header === 'Clothing');
        secondDimCell.nativeElement.click();
        fixture.detectChanges();
        expect(row.selected).toBeTrue();
        expect(pivotGrid.selectedRows).not.toBeNull();
        expect(pivotGrid.selectedRows.length).toBe(1);
        const expected =
        {
            'All cities': 'All Cities', 'All cities_level': 0,
            ProductCategory: 'Clothing', ProductCategory_level: 1,
            'Bulgaria-AmountOfSale': 3612.42, 'Bulgaria-UnitsSold': 282,
            'US-AmountOfSale': 14672.72, 'US-UnitsSold': 296,
            'Uruguay-AmountOfSale': 31158.48, 'Uruguay-UnitsSold': 456
        };
        expect(pivotGrid.selectedRows[0]).toEqual(expected);

        //deselect
        secondDimCell.nativeElement.click();
        fixture.detectChanges();
        expect(row.selected).toBeFalse();
        expect(pivotGrid.selectedRows.length).toBe(0);
    });

    it('should select/deselect the correct group of rows', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const pivotRows = GridFunctions.getPivotRows(fixture);
        const row = pivotRows[2].componentInstance;
        const rowHeaders = fixture.debugElement.queryAll(
            By.directive(IgxPivotRowDimensionHeaderComponent));
        const firstDimCell = rowHeaders.find(x => x.componentInstance.column.header === 'All Cities');
        firstDimCell.nativeElement.click();
        fixture.detectChanges();
        for (let i = 0; i < 5; ++i) {
            expect(pivotRows[i].componentInstance.selected).toBeTrue();
        }
        expect(pivotGrid.selectedRows).not.toBeNull();
        expect(pivotGrid.selectedRows.length).toBe(5);
        const expected =
            [
                {
                    AllProducts: 'AllProducts', 'All cities': 'All Cities',
                    'All cities_level': 0, AllProducts_level: 0, 'Bulgaria-UnitsSold': 774,
                    'Bulgaria-AmountOfSale': 11509.02, 'US-UnitsSold': 296, 'US-AmountOfSale': 14672.72,
                    'Uruguay-UnitsSold': 524, 'Uruguay-AmountOfSale': 31400.56,
                    'UK-UnitsSold': 293, 'UK-AmountOfSale': 25074.94,
                    'Japan-UnitsSold': 240, 'Japan-AmountOfSale': 4351.2,
                }, {
                    ProductCategory: 'Bikes', 'All cities': 'All Cities',
                    ProductCategory_level: 1, 'All cities_level': 0,
                    'Uruguay-UnitsSold': 68, 'Uruguay-AmountOfSale': 242.08,
                    City: 'Ciudad de la Costa', Country: 'Uruguay',
                    Date: '01/06/2011', SellerName: 'Lydia Burson',
                    UnitPrice: 3.56, UnitsSold: 68
                }, {
                    ProductCategory: 'Clothing', 'All cities': 'All Cities',
                    ProductCategory_level: 1, 'All cities_level': 0, 'Bulgaria-UnitsSold': 282,
                    'Bulgaria-AmountOfSale': 3612.42, 'US-UnitsSold': 296, 'US-AmountOfSale': 14672.72,
                    'Uruguay-UnitsSold': 456, 'Uruguay-AmountOfSale': 31158.48
                }, {
                    ProductCategory: 'Accessories', 'All cities': 'All Cities',
                    ProductCategory_level: 1, 'All cities_level': 0,
                    'UK-UnitsSold': 293, 'UK-AmountOfSale': 25074.94,
                    City: 'London', Country: 'UK', Date: '04/07/2012',
                    SellerName: 'David Haley', UnitPrice: 85.58, UnitsSold: 293
                }, {
                    ProductCategory: 'Components', 'All cities': 'All Cities',
                    ProductCategory_level: 1, 'All cities_level': 0,
                    'Japan-UnitsSold': 240, 'Japan-AmountOfSale': 4351.2,
                    'Bulgaria-UnitsSold': 492, 'Bulgaria-AmountOfSale': 7896.6
                }
            ];
        expect(pivotGrid.selectedRows).toEqual(expected);
    });

    it('should select/deselect the correct column', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const unitsSold = pivotGrid.getColumnByName('Bulgaria-UnitsSold');
        GridFunctions.clickColumnHeaderUI('Bulgaria-UnitsSold', fixture);
        GridSelectionFunctions.verifyColumnAndCellsSelected(unitsSold);
    });

    it('should select/deselect the correct column group', () => {
        fixture.detectChanges();
        const pivotGrid = fixture.componentInstance.pivotGrid;
        const group = GridFunctions.getColGroup(pivotGrid, 'Bulgaria');
        const unitsSold = pivotGrid.getColumnByName('Bulgaria-UnitsSold');
        const amountOfSale = pivotGrid.getColumnByName('Bulgaria-AmountOfSale');
        const unitsSoldUSA = pivotGrid.getColumnByName('US-UnitsSold');
        const amountOfSaleUSA = pivotGrid.getColumnByName('US-AmountOfSale');

        GridFunctions.clickColumnGroupHeaderUI('Bulgaria', fixture);
        fixture.detectChanges();

        GridSelectionFunctions.verifyColumnSelected(unitsSold);
        GridSelectionFunctions.verifyColumnSelected(amountOfSale);
        GridSelectionFunctions.verifyColumnGroupSelected(fixture, group);

        GridSelectionFunctions.verifyColumnsSelected([unitsSoldUSA, amountOfSaleUSA], false);

        GridFunctions.clickColumnGroupHeaderUI('Bulgaria', fixture);

        GridSelectionFunctions.verifyColumnSelected(unitsSold, false);
        GridSelectionFunctions.verifyColumnSelected(amountOfSale, false);
        GridSelectionFunctions.verifyColumnGroupSelected(fixture, group, false);
    });
});

describe('IgxPivotGrid Resizing #pivotGrid', () => {
    let fixture: ComponentFixture<any>;
    let pivotGrid: IgxPivotGridComponent;
    
    configureTestSuite((() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxPivotGridTestComplexHierarchyComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxPivotGridModule
            ]
        });
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(IgxPivotGridTestComplexHierarchyComponent);
        fixture.detectChanges();

        pivotGrid = fixture.componentInstance.pivotGrid;
    }));

    it('should define grid with resizable columns.', fakeAsync(() => {
        let pivotRows = fixture.debugElement.queryAll(By.directive(IgxPivotRowComponent));
        
        let rowHeaders = pivotRows[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders.length).toEqual(2);
        expect(rowHeaders[0].componentInstance.column.resizable).toBeTrue();
        expect(rowHeaders[1].componentInstance.column.resizable).toBeTrue();

        rowHeaders = pivotRows[3].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.resizable).toBeTrue();
        expect(rowHeaders[1].componentInstance.column.resizable).toBeTrue();

        rowHeaders = pivotRows[7].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.resizable).toBeTrue();
        expect(rowHeaders[1].componentInstance.column.resizable).toBeTrue();
    }));

    it('should update grid after resizing a top dimension header to be bigger.', fakeAsync(() => {
        let pivotRows = fixture.debugElement.queryAll(By.directive(IgxPivotRowComponent));
        
        let rowHeaders = pivotRows[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders.length).toEqual(2);
        expect(rowHeaders[0].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');

        const headerResArea = GridFunctions.getHeaderResizeArea(rowHeaders[0]).nativeElement;

        // Resize first column
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick(200);
        fixture.detectChanges();

        const resizer = GridFunctions.getResizer(fixture).nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
        UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
        fixture.detectChanges();

        expect(rowHeaders[0].componentInstance.column.width).toEqual('400px');
        expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');

        rowHeaders = pivotRows[3].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.width).toEqual('400px');
        expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');

        rowHeaders = pivotRows[7].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.width).toEqual('400px');
        expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');
    }));

    it('should update grid after resizing a child dimension header to be bigger.', fakeAsync(() => {
        let pivotRows = fixture.debugElement.queryAll(By.directive(IgxPivotRowComponent));
        
        let rowHeaders = pivotRows[7].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders.length).toEqual(2);
        expect(rowHeaders[0].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');

        const headerResArea = GridFunctions.getHeaderResizeArea(rowHeaders[0]).nativeElement;

        // Resize first column
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick(200);
        fixture.detectChanges();

        const resizer = GridFunctions.getResizer(fixture).nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
        UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
        fixture.detectChanges();

        expect(rowHeaders[0].componentInstance.column.width).toEqual('400px');
        expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');

        rowHeaders = pivotRows[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.width).toEqual('400px');
        expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');

        rowHeaders = pivotRows[3].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.width).toEqual('400px');
        expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');
    }));
});
