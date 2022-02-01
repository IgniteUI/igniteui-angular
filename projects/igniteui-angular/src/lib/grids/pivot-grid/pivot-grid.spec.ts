import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxChipComponent } from '../../chips/chip.component';
import { FilteringExpressionsTree, FilteringLogic, IgxPivotGridComponent, IgxPivotRowDimensionHeaderGroupComponent, IgxStringFilteringOperand } from 'igniteui-angular';
import { IgxChipsAreaComponent } from '../../chips/chips-area.component';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { IgxPivotGridTestBaseComponent, IgxPivotGridTestComplexHierarchyComponent, IgxTotalSaleAggregate } from '../../test-utils/pivot-grid-samples.spec';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { PivotDimensionType } from './pivot-grid.interface';
import { IgxPivotHeaderRowComponent } from './pivot-header-row.component';
import { IgxPivotDateDimension, IgxPivotGridModule } from './public_api';
import { IgxPivotRowDimensionHeaderComponent } from './pivot-row-dimension-header.component';
import { IgxPivotDateAggregate } from './pivot-grid-aggregate';
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
        let headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
        let header = headerRow.querySelector('igx-grid-header-group');
        let expander = header.querySelectorAll('igx-icon')[0];
        expander.click();
        fixture.detectChanges();
        expect(pivotGrid.columnGroupStates.size).toBe(1);
        let value = pivotGrid.columnGroupStates.entries().next().value;
        expect(value[0]).toEqual('All Countries');
        expect(value[1]).toBeTrue();

        headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
        header = headerRow.querySelector('igx-grid-header-group');
        expander = header.querySelectorAll('igx-icon')[0];
        expander.click();
        fixture.detectChanges();
        value = pivotGrid.columnGroupStates.entries().next().value;
        expect(value[0]).toEqual('All Countries');
        expect(value[1]).toBeFalse();
    });

    it('should display aggregations when no row dimensions are enabled', () => {
        const pivotGrid = fixture.componentInstance.pivotGrid;
        pivotGrid.pivotConfiguration.columns = [
            new IgxPivotDateDimension(
                {
                    memberName: 'Date',
                    enabled: true
                },
                {
                    months: false
                }
            )
        ];
        pivotGrid.pivotConfiguration.rows = [];
        pivotGrid.notifyDimensionChange(true);
        fixture.detectChanges();
        expect(pivotGrid.rowList.first.cells.length).toBeGreaterThanOrEqual(1);
        expect(pivotGrid.rowList.first.cells.first.title).toEqual('282$');
    });

    it('should display aggregations when no col dimensions are enabled', () => {
        const pivotGrid = fixture.componentInstance.pivotGrid;
        pivotGrid.pivotConfiguration.rows = [
            {
                memberName: 'City',
                enabled: true,
            }
        ];
        pivotGrid.pivotConfiguration.columns = [];
        pivotGrid.notifyDimensionChange(true);
        fixture.detectChanges();
        expect(pivotGrid.rowList.first.cells.length).toEqual(pivotGrid.values.length);
        expect(pivotGrid.rowList.first.cells.first.title).toEqual('2127$');
    });

    it('should display aggregations when neither col nor row dimensions are set', () => {
        const pivotGrid = fixture.componentInstance.pivotGrid;
        pivotGrid.pivotConfiguration.rows = [];
        pivotGrid.pivotConfiguration.columns = [];
        pivotGrid.notifyDimensionChange(true);
        fixture.detectChanges();

        expect(pivotGrid.rowList.first.cells.length).toEqual(pivotGrid.values.length);
        expect(pivotGrid.rowList.first.cells.first.title).toEqual('2127$');
    });

    it('should reevaluate aggregated values when all row dimensions are removed', () => {
        const pivotGrid = fixture.componentInstance.pivotGrid;
        pivotGrid.pivotConfiguration.columns = [
            new IgxPivotDateDimension(
                {
                    memberName: 'Date',
                    enabled: true
                },
                {
                    months: false
                }
            )
        ];
        pivotGrid.pivotConfiguration.rows = [
            {
                memberName: 'AllSeller',
                memberFunction: () => 'All Sellers',
                enabled: true,
                childLevel: {
                    enabled: true,
                    memberName: 'SellerName'
                }
            }
        ];
        pivotGrid.notifyDimensionChange(true);
        fixture.detectChanges();

        let uniqueVals = Array.from(new Set(pivotGrid.data.map(x => x.SellerName))).length;
        expect(pivotGrid.rowList.length).toEqual(uniqueVals + 1);
        expect(pivotGrid.rowList.first.cells.first.title).toEqual('282$');

        pivotGrid.pivotConfiguration.rows = [];
        pivotGrid.notifyDimensionChange(true);
        fixture.detectChanges();
        expect(pivotGrid.rowList.length).toEqual(1);
    });

    it('should reevaluate aggregated values when all col dimensions are removed', () => {
        const pivotGrid = fixture.componentInstance.pivotGrid;
        pivotGrid.pivotConfiguration.columns = [
            new IgxPivotDateDimension(
                {
                    memberName: 'Date',
                    enabled: true
                },
                {
                    months: false
                }
            )
        ];
        pivotGrid.pivotConfiguration.rows = [
            {
                memberName: 'AllSeller',
                memberFunction: () => 'All Sellers',
                enabled: true,
                childLevel: {
                    enabled: true,
                    memberName: 'SellerName'
                }
            }
        ];
        pivotGrid.notifyDimensionChange(true);
        fixture.detectChanges();

        let uniqueVals = Array.from(new Set(pivotGrid.data.map(x => x.SellerName))).length;
        expect(pivotGrid.rowList.length).toEqual(uniqueVals + 1);
        expect(pivotGrid.rowList.first.cells.first.title).toEqual('282$');
        expect(pivotGrid.rowList.first.cells.length).toEqual(5);

        pivotGrid.pivotConfiguration.columns = [];
        pivotGrid.notifyDimensionChange(true);
        fixture.detectChanges();

        expect(pivotGrid.rowList.first.cells.length).toEqual(pivotGrid.values.length);
    });

    describe('IgxPivotGrid Features #pivotGrid', () => {
        it('should show excel style filtering via dimension chip.', () => {
            const excelMenu = GridFunctions.getExcelStyleFilteringComponents(fixture, 'igx-pivot-grid')[1];
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

            const excelMenu = GridFunctions.getExcelStyleFilteringComponents(fixture, 'igx-pivot-grid')[1];
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
            const excelMenu = GridFunctions.getExcelStyleFilteringComponents(fixture, 'igx-pivot-grid')[1];
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

        it('should show filters chips', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.pivotConfiguration.filters = [{
                memberName: 'SellerName',
                enabled: true
            }];
            pivotGrid.pipeTrigger++;
            pivotGrid.setupColumns();
            fixture.detectChanges();
            const excelMenu = GridFunctions.getExcelStyleFilteringComponents(fixture, 'igx-pivot-grid')[1];
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const filtersChip = headerRow.querySelector('igx-chip[id="SellerName"]');
            const filterIcon = filtersChip.querySelectorAll('igx-icon')[1];

            expect(excelMenu.parentElement.parentElement.attributes.hidden).not.toBeUndefined();
            filterIcon.click();
            fixture.detectChanges();
            const esfSearch = GridFunctions.getExcelFilteringSearchComponent(fixture, excelMenu, 'igx-pivot-grid');
            const checkBoxes = esfSearch.querySelectorAll('igx-checkbox');
            // should show and should display correct checkboxes.
            expect(excelMenu.parentElement.parentElement.attributes.hidden).toBeUndefined();
            expect((checkBoxes[0].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Select All');
            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('David');
            expect((checkBoxes[2].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Elisa');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('John');
            expect((checkBoxes[4].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Larry');
        });

        it('should show filters in chips dropdown button', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.pivotConfiguration.filters = [
                {
                    memberName: 'SellerName',
                    enabled: true
                },
                {
                    memberName: 'ProductCategory',
                    enabled: true
                }
            ];
            pivotGrid.pipeTrigger++;
            pivotGrid.setupColumns();
            fixture.detectChanges();
            const excelMenu = GridFunctions.getExcelStyleFilteringComponents(fixture, 'igx-pivot-grid')[0];
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const dropdownIcon = headerRow.querySelector('.igx-grid__tr-pivot--filter').querySelectorAll('igx-icon')[1];

            expect(excelMenu.parentElement.parentElement.attributes.hidden).not.toBeUndefined();
            dropdownIcon.click();
            fixture.detectChanges();

            const chips = excelMenu.querySelectorAll('igx-chip');
            expect(chips[0].id).toBe('SellerName');
            expect(chips[0].attributes.getNamedItem('ng-reflect-selected').nodeValue).toEqual('true');
            expect(chips[1].id).toBe('ProductCategory');
            expect(chips[1].attributes.getNamedItem('ng-reflect-selected').nodeValue).toEqual('false');

            let esfSearch = GridFunctions.getExcelFilteringSearchComponent(fixture, excelMenu, 'igx-pivot-grid');
            let checkBoxes = esfSearch.querySelectorAll('igx-checkbox');
            // should show and should display correct checkboxes.
            expect(excelMenu.parentElement.parentElement.attributes.hidden).toBeUndefined();
            expect((checkBoxes[0].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Select All');
            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('David');
            expect((checkBoxes[2].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Elisa');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('John');
            expect((checkBoxes[4].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Larry');

            // switch to the `ProductCategory` filters
            const chipAreaElement = fixture.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
            const chipComponents = chipAreaElement[4].queryAll(By.directive(IgxChipComponent));
            chipComponents[1].triggerEventHandler('chipClick', {
                owner: {
                    id: chips[1].id
                }
            });
            fixture.detectChanges();

            esfSearch = GridFunctions.getExcelFilteringSearchComponent(fixture, excelMenu, 'igx-pivot-grid');
            checkBoxes = esfSearch.querySelectorAll('igx-checkbox');
            expect((checkBoxes[0].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Select All');
            expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Accessories');
            expect((checkBoxes[2].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Bikes');
            expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Clothing');
            expect((checkBoxes[4].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Components');
        });

        it('should be able to filter from chips dropdown button', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.pivotConfiguration.filters = [
                {
                    memberName: 'SellerName',
                    enabled: true
                },
                {
                    memberName: 'ProductCategory',
                    enabled: true
                }
            ];
            pivotGrid.pipeTrigger++;
            pivotGrid.setupColumns();
            fixture.detectChanges();
            const excelMenu = GridFunctions.getExcelStyleFilteringComponents(fixture, 'igx-pivot-grid')[0];
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const dropdownIcon = headerRow.querySelector('.igx-grid__tr-pivot--filter').querySelectorAll('igx-icon')[1];

            expect(excelMenu.parentElement.parentElement.attributes.hidden).not.toBeUndefined();
            dropdownIcon.click();
            fixture.detectChanges();

            const checkBoxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fixture, excelMenu, 'igx-pivot-grid'));

            // uncheck David
            checkBoxes[1].click();
            fixture.detectChanges();

            // uncheck Elisa
            checkBoxes[5].click();
            fixture.detectChanges();

            // Click 'apply' button to apply filter.
            GridFunctions.clickApplyExcelStyleFiltering(fixture, excelMenu, 'igx-pivot-grid');
            fixture.detectChanges();

            // check rows
            const expectedHeaders = ['All', 'Clothing', 'Components'];
            const rowHeaders = fixture.debugElement.queryAll(
                By.directive(IgxPivotRowDimensionHeaderComponent));
            const rowDimensionHeaders = rowHeaders.map(x => x.componentInstance.column.header);
            expect(rowHeaders.length).toBe(3);
            expect(rowDimensionHeaders).toEqual(expectedHeaders);
        });

        it('should show chips and dropdown if enough space', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.pivotConfiguration.filters = [
                {
                    memberName: 'Date',
                    enabled: true
                },
                {
                    memberName: 'ProductCategory',
                    enabled: true
                }
            ];

            pivotGrid.pivotConfiguration.rows = [{
                memberName: 'SellerName',
                enabled: true
            }];
            pivotGrid.pipeTrigger++;
            pivotGrid.setupColumns();
            fixture.detectChanges();
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const dropdownIcon = headerRow.querySelector('.igx-grid__tr-pivot--filter').querySelectorAll('igx-icon')[4];
            expect(dropdownIcon).not.toBeUndefined();
            expect(headerRow.querySelector('igx-badge').innerText).toBe('1');
            const filtersChip = headerRow.querySelector('igx-chip[id="Date"]');
            expect(filtersChip).not.toBeUndefined();
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
            let headerCell = GridFunctions.getColumnHeader('USA-UnitsSold', fixture);

            // sort asc
            GridFunctions.clickHeaderSortIcon(headerCell);
            fixture.detectChanges();
            expect(pivotGrid.sortingExpressions.length).toBe(1);
            let expectedOrder = [829, undefined, 240, 293, 296];
            let columnValues = pivotGrid.dataView.map(x => x['USA-UnitsSold']);
            expect(columnValues).toEqual(expectedOrder);

            headerCell = GridFunctions.getColumnHeader('USA-UnitsSold', fixture);
            // sort desc
            GridFunctions.clickHeaderSortIcon(headerCell);
            fixture.detectChanges();
            expect(pivotGrid.sortingExpressions.length).toBe(1);
            expectedOrder = [829, 296, 293, 240, undefined];
            columnValues = pivotGrid.dataView.map(x => x['USA-UnitsSold']);
            expect(columnValues).toEqual(expectedOrder);

            // remove sort
            headerCell = GridFunctions.getColumnHeader('USA-UnitsSold', fixture);
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
            expect(rowChipArea.chipsList.toArray()[0].id).toBe(rowChip2.id);
            expect(rowChipArea.chipsList.toArray()[1].id).toBe(rowChip1.id);
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
            expect(colChipArea.chipsList.toArray()[0].id).toBe(colChip2.id);
            expect(colChipArea.chipsList.toArray()[1].id).toBe(colChip1.id);
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
            expect(valuesChipArea.chipsList.toArray()[0].id).toBe(valChip2.id);
            expect(valuesChipArea.chipsList.toArray()[1].id).toBe(valChip1.id);
            // check dimension order is updated.
            expect(pivotGrid.pivotConfiguration.values.map(x => x.member)).toEqual(['UnitPrice', 'UnitsSold']);

        });
        it('should allow moving dimension between rows, columns and filters.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.pivotConfiguration.filters = [{
                memberName: 'SellerName',
                enabled: true
            }];
            pivotGrid.pipeTrigger++;
            pivotGrid.setupColumns();
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
            fixture.detectChanges();
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
            fixture.detectChanges();

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
            pivotGrid.pipeTrigger++;
            fixture.detectChanges();

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
        pivotGrid.width = '1500px';
        fixture.detectChanges();
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
        let dimensionContents = fixture.debugElement.queryAll(By.css('.igx-grid__tbody-pivot-dimension'));

        let rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.resizable).toBeTrue();
        expect(rowHeaders[3].componentInstance.column.resizable).toBeTrue();

        rowHeaders = dimensionContents[1].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.resizable).toBeTrue();
        expect(rowHeaders[1].componentInstance.column.resizable).toBeTrue();
        expect(rowHeaders[5].componentInstance.column.resizable).toBeTrue();
        expect(rowHeaders[7].componentInstance.column.resizable).toBeTrue();
    }));

    it('should update grid after resizing a top dimension header to be bigger.', fakeAsync(() => {
        let dimensionContents = fixture.debugElement.queryAll(By.css('.igx-grid__tbody-pivot-dimension'));

        let rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[3].componentInstance.column.width).toEqual('200px');

        rowHeaders = dimensionContents[1].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[5].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[7].componentInstance.column.width).toEqual('200px');

        rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
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

        rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.width).toEqual('400px');
        expect(rowHeaders[3].componentInstance.column.width).toEqual('400px');

        rowHeaders = dimensionContents[1].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[5].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[7].componentInstance.column.width).toEqual('200px');
    }));

    it('should update grid after resizing a child dimension header to be bigger.', fakeAsync(() => {
        let dimensionContents = fixture.debugElement.queryAll(By.css('.igx-grid__tbody-pivot-dimension'));

        let rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[3].componentInstance.column.width).toEqual('200px');

        const headerResArea = GridFunctions.getHeaderResizeArea(rowHeaders[3]).nativeElement;

        // Resize first column
        UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
        tick(200);
        fixture.detectChanges();

        const resizer = GridFunctions.getResizer(fixture).nativeElement;
        expect(resizer).toBeDefined();
        UIInteractions.simulateMouseEvent('mousemove', resizer, 300, 5);
        UIInteractions.simulateMouseEvent('mouseup', resizer, 300, 5);
        fixture.detectChanges();

        rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.width).toEqual('400px');
        expect(rowHeaders[3].componentInstance.column.width).toEqual('400px');

        rowHeaders = dimensionContents[1].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        expect(rowHeaders[0].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[5].componentInstance.column.width).toEqual('200px');
        expect(rowHeaders[7].componentInstance.column.width).toEqual('200px');
    }));
});

describe('IgxPivotGrid APIs #pivotGrid', () => {
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

    it('should allow inserting new dimension at index.', () => {
        // insert in rows
        pivotGrid.insertDimensionAt({ memberName: 'SellerName', enabled: true }, PivotDimensionType.Row, 1);
        fixture.detectChanges();
        expect(pivotGrid.pivotConfiguration.rows[1].memberName).toBe('SellerName');
        // check rows
        let dimensionContents = fixture.debugElement.queryAll(By.css('.igx-grid__tbody-pivot-dimension'));
        let rowHeaders = dimensionContents[1].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        const first = rowHeaders.map(x => x.componentInstance.column.header)[0];
        expect(first).toBe('Larry Lieb');

        // insert in columns
        pivotGrid.insertDimensionAt({ memberName: 'SellerNameColumn', memberFunction: (rec) => rec.SellerName, enabled: true }, PivotDimensionType.Column, 0);
        fixture.detectChanges();
        expect(pivotGrid.pivotConfiguration.columns[0].memberName).toBe('SellerNameColumn');
        expect(pivotGrid.columnDimensions.length).toBe(2);
        expect(pivotGrid.columns.length).toBe(28);

        // insert in filter
        pivotGrid.insertDimensionAt({ memberName: 'SellerNameFilter', memberFunction: (rec) => rec.SellerName, enabled: true }, PivotDimensionType.Filter, 1);
        fixture.detectChanges();
        expect(pivotGrid.pivotConfiguration.filters.length).toBe(1);
        expect(pivotGrid.pivotConfiguration.filters[0].memberName).toBe('SellerNameFilter');

        const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
        const chip = headerRow.querySelector('igx-chip[id="SellerNameFilter"]');
        expect(chip).not.toBeNull();
    });

    it('should allow removing dimension.', () => {
        const filter = { memberName: 'SellerNameFilter', memberFunction: (rec) => rec.SellerName, enabled: true };
        pivotGrid.pivotConfiguration.filters = [filter];
        fixture.detectChanges();

        // remove row
        pivotGrid.removeDimension(pivotGrid.pivotConfiguration.rows[0]);
        fixture.detectChanges();

        expect(pivotGrid.pivotConfiguration.rows.length).toBe(1);
        expect(pivotGrid.pivotConfiguration.rows[0].memberName).toBe('AllProducts');

        let dimensionContents = fixture.debugElement.queryAll(By.css('.igx-grid__tbody-pivot-dimension'));
        let rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        const headers = rowHeaders.map(x => x.componentInstance.column.header);
        expect(headers.length).toBe(5);

        // remove col
        pivotGrid.removeDimension(pivotGrid.pivotConfiguration.columns[0]);
        fixture.detectChanges();

        expect(pivotGrid.pivotConfiguration.columns.length).toBe(0);
        expect(pivotGrid.columnDimensions.length).toBe(0);
        expect(pivotGrid.columns.length).toBe(0);

        // remove filter
        pivotGrid.removeDimension(filter);
        fixture.detectChanges();

        expect(pivotGrid.pivotConfiguration.filters.length).toBe(0);
        const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
        const chip = headerRow.querySelector('igx-chip[id="SellerNameFilter"]');
        expect(chip).toBeNull();

        // remove something that is not part of the config
        pivotGrid.removeDimension({ memberName: 'Test', enabled: true });
        fixture.detectChanges();
        // nothing should change
        expect(pivotGrid.pivotConfiguration.filters.length).toBe(0);
        expect(pivotGrid.pivotConfiguration.columns.length).toBe(0);
        expect(pivotGrid.pivotConfiguration.rows.length).toBe(1);
    });

    it('should allow toggling dimension.', () => {
        const filter = { memberName: 'SellerNameFilter', memberFunction: (rec) => rec.SellerName, enabled: true };
        pivotGrid.pivotConfiguration.filters = [filter];
        fixture.detectChanges();

        // toggle row
        pivotGrid.toggleDimension(pivotGrid.pivotConfiguration.rows[0]);
        fixture.detectChanges();

        // there are still 2
        expect(pivotGrid.pivotConfiguration.rows.length).toBe(2);
        // 1 is disabled
        expect(pivotGrid.rowDimensions.length).toBe(1);

        let dimensionContents = fixture.debugElement.queryAll(By.css('.igx-grid__tbody-pivot-dimension'));
        let rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        const headers = rowHeaders.map(x => x.componentInstance.column.header);
        expect(headers.length).toBe(5);

        // toggle column
        pivotGrid.toggleDimension(pivotGrid.pivotConfiguration.columns[0]);
        fixture.detectChanges();

        expect(pivotGrid.pivotConfiguration.columns.length).toBe(1);
        expect(pivotGrid.columnDimensions.length).toBe(0);
        expect(pivotGrid.columns.length).toBe(0);

        // toggle filter
        pivotGrid.toggleDimension(filter);
        fixture.detectChanges();

        expect(pivotGrid.pivotConfiguration.filters.length).toBe(1);
        expect(pivotGrid.filterDimensions.length).toBe(0);
        const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
        const chip = headerRow.querySelector('igx-chip[id="SellerNameFilter"]');
        expect(chip).toBeNull();

        // toggle something that is not part of the config
        pivotGrid.toggleDimension({ memberName: 'Test', enabled: false });
        fixture.detectChanges();

        // nothing should change
        expect(pivotGrid.filterDimensions.length).toBe(0);
        expect(pivotGrid.columnDimensions.length).toBe(0);
        expect(pivotGrid.rowDimensions.length).toBe(1);

        expect(pivotGrid.pivotConfiguration.filters.length).toBe(1);
        expect(pivotGrid.pivotConfiguration.columns.length).toBe(1);
        expect(pivotGrid.pivotConfiguration.rows.length).toBe(2);

    });

    it('should allow moving dimension.', () => {
        const dim = pivotGrid.pivotConfiguration.rows[0];

        // from row to column
        pivotGrid.moveDimension(dim, PivotDimensionType.Column, 0);
        fixture.detectChanges();

        expect(pivotGrid.rowDimensions.length).toBe(1);
        expect(pivotGrid.columnDimensions.length).toBe(2);

        let dimensionContents = fixture.debugElement.queryAll(By.css('.igx-grid__tbody-pivot-dimension'));
        let rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        const headers = rowHeaders.map(x => x.componentInstance.column.header);
        expect(headers.length).toBe(5);

        expect(pivotGrid.pivotConfiguration.columns[0].memberName).toBe(dim.memberName);
        expect(pivotGrid.columnDimensions.length).toBe(2);
        expect(pivotGrid.columns.length).toBe(28);

         // from column to filter
         pivotGrid.moveDimension(dim, PivotDimensionType.Filter, 0);
         fixture.detectChanges();

         expect(pivotGrid.pivotConfiguration.columns.length).toBe(1);
         expect(pivotGrid.pivotConfiguration.filters.length).toBe(1);
         expect(pivotGrid.columns.length).toBe(15);

         let headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
         let chip = headerRow.querySelector('igx-chip[id="All cities"]');
         expect(chip).not.toBeNull();


        // from filter to row
        pivotGrid.moveDimension(dim, PivotDimensionType.Row, 1);
        fixture.detectChanges();

        expect(pivotGrid.pivotConfiguration.rows.length).toBe(2);
        expect(pivotGrid.pivotConfiguration.rows[1].memberName).toBe('All cities');
        expect(pivotGrid.pivotConfiguration.filters.length).toBe(0);

        dimensionContents = fixture.debugElement.queryAll(By.css('.igx-grid__tbody-pivot-dimension'));
        rowHeaders = dimensionContents[1].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
        const first = rowHeaders.map(x => x.componentInstance.column.header)[0];
        expect(first).toBe('All Cities');
     });

     it('should allow inserting new value at index.', () => {
         const value = {
            member: 'Date',
            aggregate: {
                aggregator: IgxPivotDateAggregate.latest,
                key: 'LATEST',
                label: 'Latest'
            },
            enabled: true
        };
        pivotGrid.insertValueAt(value, 1);
        fixture.detectChanges();
        expect(pivotGrid.values.length).toBe(3);
        expect(pivotGrid.values[1].member).toBe('Date');
        expect(pivotGrid.columns.length).toBe(20);
     });

     it('should allow removing value.', () => {
         pivotGrid.removeValue(pivotGrid.values[1]);
         fixture.detectChanges();
         expect(pivotGrid.pivotConfiguration.values.length).toBe(1);
         expect(pivotGrid.values[0].member).toBe('UnitsSold');
         expect(pivotGrid.columns.length).toBe(5);
     });

     it('should allow toggling value.', () => {
        // toggle off
        pivotGrid.toggleValue(pivotGrid.pivotConfiguration.values[1]);
        fixture.detectChanges();
        expect(pivotGrid.pivotConfiguration.values.length).toBe(2);
        expect(pivotGrid.values.length).toBe(1);
        expect(pivotGrid.values[0].member).toBe('UnitsSold');
        expect(pivotGrid.columns.length).toBe(5);
        // toggle on
        pivotGrid.toggleValue(pivotGrid.pivotConfiguration.values[1]);
        fixture.detectChanges();
        expect(pivotGrid.pivotConfiguration.values.length).toBe(2);
        expect(pivotGrid.values.length).toBe(2);
        expect(pivotGrid.values[0].member).toBe('UnitsSold');
        expect(pivotGrid.values[1].member).toBe('AmountOfSale');
        expect(pivotGrid.columns.length).toBe(15);
     });

     it('should allow moving value.', () => {
         const val = pivotGrid.pivotConfiguration.values[0];
         // move after
         pivotGrid.moveValue(val, 1);
         fixture.detectChanges();

         expect(pivotGrid.values[0].member).toBe('AmountOfSale');
         expect(pivotGrid.values[1].member).toBe('UnitsSold');

         let valueCols = pivotGrid.columns.filter(x => x.level === 1);
         expect(valueCols[0].header).toBe('Amount of Sale');
         expect(valueCols[1].header).toBe('UnitsSold');

         // move before
         pivotGrid.moveValue(val, 0);
         fixture.detectChanges();

         expect(pivotGrid.values[0].member).toBe('UnitsSold');
         expect(pivotGrid.values[1].member).toBe('AmountOfSale');
         valueCols = pivotGrid.columns.filter(x => x.level === 1);
         expect(valueCols[0].header).toBe('UnitsSold');
         expect(valueCols[1].header).toBe('Amount of Sale');
     });
});