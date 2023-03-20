import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilteringExpressionsTree, FilteringLogic, GridColumnDataType, IgxPivotGridComponent, IgxPivotRowDimensionHeaderGroupComponent, IgxStringFilteringOperand } from 'igniteui-angular';
import { IgxChipComponent } from '../../chips/chip.component';
import { IgxChipsAreaComponent } from '../../chips/chips-area.component';
import { DefaultPivotSortingStrategy } from '../../data-operations/pivot-sort-strategy';
import { DimensionValuesFilteringStrategy, NoopPivotDimensionsStrategy } from '../../data-operations/pivot-strategy';
import { ISortingExpression, SortingDirection } from '../../data-operations/sorting-strategy';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { PivotGridFunctions } from '../../test-utils/pivot-grid-functions.spec';
import { IgxPivotGridTestBaseComponent, IgxPivotGridTestComplexHierarchyComponent, IgxTotalSaleAggregate } from '../../test-utils/pivot-grid-samples.spec';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { IgxPivotDateAggregate, IgxPivotNumericAggregate } from './pivot-grid-aggregate';
import { IgxPivotDateDimension } from './pivot-grid-dimensions';
import { IPivotGridColumn, IPivotGridRecord, PivotDimensionType } from './pivot-grid.interface';
import { IgxPivotGridModule } from './pivot-grid.module';
import { IgxPivotHeaderRowComponent } from './pivot-header-row.component';
import { IgxPivotRowDimensionHeaderComponent } from './pivot-row-dimension-header.component';
import { IgxPivotRowComponent } from './pivot-row.component';

const CSS_CLASS_LIST = 'igx-drop-down__list';
const CSS_CLASS_ITEM = 'igx-drop-down__item';
describe('IgxPivotGrid #pivotGrid', () => {

    configureTestSuite();

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxPivotGridTestBaseComponent,
                IgxPivotGridTestComplexHierarchyComponent
            ],
            imports: [
                NoopAnimationsModule, IgxPivotGridModule
            ]
        }).compileComponents();
    }));

    describe('Basic IgxPivotGrid #pivotGrid', () => {
        let fixture: ComponentFixture<IgxPivotGridTestBaseComponent>;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(IgxPivotGridTestBaseComponent);
            fixture.detectChanges();
        }));

        it('should show empty template when there are no dimensions and values', () => {
            // whole pivotConfiguration is undefined
            const pivotGrid = fixture.componentInstance.pivotGrid as IgxPivotGridComponent;
            pivotGrid.pivotConfiguration = undefined;
            fixture.detectChanges();

            // no rows, just empty message
            expect(pivotGrid.rowList.length).toBe(0);
            expect(pivotGrid.tbody.nativeElement.textContent).toBe('Pivot grid has no dimensions and values.');

            // configuration is defined but all collections are empty
            pivotGrid.pivotConfiguration = {
                columns: [],
                rows: [],
                values: []
            };
            fixture.detectChanges();

            // no rows, just empty message
            expect(pivotGrid.rowList.length).toBe(0);
            expect(pivotGrid.tbody.nativeElement.textContent).toBe('Pivot grid has no dimensions and values.');


            // has dimensions and values, but they are disabled
            pivotGrid.pivotConfiguration = {
                columns: [
                    {
                        enabled: false,
                        memberName: 'Country'
                    }
                ],
                rows: [
                    {
                        enabled: false,
                        memberName: 'ProductCategory'
                    }
                ],
                values: [
                    {
                        enabled: false,
                        member: 'UnitsSold',
                        aggregate: {
                            aggregator: IgxPivotNumericAggregate.sum,
                            key: 'SUM',
                            label: 'Sum',
                        },
                    }
                ]
            };
            fixture.detectChanges();

            // no rows, just empty message
            expect(pivotGrid.rowList.length).toBe(0);
            expect(pivotGrid.tbody.nativeElement.textContent).toBe('Pivot grid has no dimensions and values.');
        });

        it('should show allow setting custom empty template.', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid as IgxPivotGridComponent;
            pivotGrid.emptyPivotGridTemplate = fixture.componentInstance.emptyTemplate;
            pivotGrid.pivotConfiguration = undefined;
            fixture.detectChanges();

            // no rows, just empty message
            expect(pivotGrid.rowList.length).toBe(0);
            expect(pivotGrid.tbody.nativeElement.textContent).toBe('Custom empty template.');
        });

        it('should allow setting custom chip value template', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid as IgxPivotGridComponent;
            pivotGrid.valueChipTemplate = fixture.componentInstance.chipValueTemplate;
            fixture.detectChanges();

            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const valueChip = headerRow.querySelector('igx-chip[id="UnitsSold"]');
            let content = valueChip.querySelector('.igx-chip__content');
            expect(content.textContent.trim()).toBe('UnitsSold');
        });

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
            let pivotRecord = (pivotGrid.rowList.first as IgxPivotRowComponent).data;
            expect(pivotRecord.dimensionValues.get('SellerName')).not.toBeUndefined();

            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const rowChip = headerRow.querySelector('igx-chip[id="SellerName"]');
            const removeIcon = rowChip.querySelectorAll('igx-icon')[3];
            removeIcon.click();
            fixture.detectChanges();
            expect(pivotGrid.pivotConfiguration.rows[1].enabled).toBeFalse();
            expect(pivotGrid.rowDimensions.length).toBe(1);
            pivotRecord = (pivotGrid.rowList.first as IgxPivotRowComponent).data;
            expect(pivotRecord.dimensionValues.get('SellerName')).toBeUndefined();
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
            pivotGrid.pivotConfiguration.values[1].displayName = 'Units Price';
            pivotGrid.notifyDimensionChange(true);
            fixture.detectChanges();

            expect(pivotGrid.columns.length).toBe(9);
            expect(pivotGrid.values.length).toBe(2);

            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            let rowChip = headerRow.querySelector('igx-chip[id="UnitsSold"]');
            let removeIcon = rowChip.querySelectorAll('igx-icon')[3];
            removeIcon.click();
            fixture.detectChanges();
            expect(pivotGrid.pivotConfiguration.values[0].enabled).toBeFalse();
            expect(pivotGrid.values.length).toBe(1);
            expect(pivotGrid.columns.length).not.toBe(9);

            // should remove the second one as well
            rowChip = headerRow.querySelector('igx-chip[id="Units Price"]');
            removeIcon = rowChip.querySelectorAll('igx-icon')[3];
            removeIcon.click();
            fixture.detectChanges();
            expect(pivotGrid.pivotConfiguration.values[1].enabled).toBeFalse();
            expect(pivotGrid.values.length).toBe(0);
            expect(pivotGrid.columns.length).toBe(3);
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

        it('should correctly remove chip from filters dropdown', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.pivotConfiguration = {
                columns: [],
                rows: [
                    {
                        memberName: 'SellerName',
                        enabled: true
                    }
                ],
                filters: [
                    {
                        memberName: 'Date',
                        enabled: true
                    },
                    {
                        memberName: 'ProductCategory',
                        enabled: true
                    },
                    {
                        memberName: 'Country',
                        enabled: true
                    }
                ],
                values: null
            };
            pivotGrid.pipeTrigger++;
            pivotGrid.setupColumns();
            fixture.detectChanges();

            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const dropdownIcon = headerRow.querySelector('.igx-grid__tr-pivot--filter').querySelectorAll('igx-icon')[4];
            expect(dropdownIcon).not.toBeUndefined();
            expect(headerRow.querySelector('igx-badge').innerText).toBe('2');
            dropdownIcon.click();
            fixture.detectChanges();

            const excelMenu = GridFunctions.getExcelStyleFilteringComponents(fixture, 'igx-pivot-grid')[0];
            const chip = excelMenu.querySelectorAll('igx-chip')[0];
            const removeIcon = chip.querySelectorAll('igx-icon')[1];
            removeIcon.click();
            fixture.detectChanges();

            const filtersChip = headerRow.querySelector('igx-chip[id="Date"]');
            expect(filtersChip).toBeDefined();
            expect(headerRow.querySelector('igx-chip[id="ProductCategory"]')).toBeNull();
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

        it('should collapse row', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;

            expect(pivotGrid.rowList.length).toEqual(5);
            expect(pivotGrid.expansionStates.size).toEqual(0);
            const headerRow = fixture.nativeElement.querySelector('igx-pivot-row-dimension-content');
            const header = headerRow.querySelector('igx-pivot-row-dimension-header');
            const expander = header.querySelectorAll('igx-icon')[0];
            expander.click();
            fixture.detectChanges();
            expect(pivotGrid.rowList.length).toEqual(1);
            expect(pivotGrid.expansionStates.size).toEqual(1);
            expect(pivotGrid.expansionStates.get('All')).toBeFalse();
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
            pivotGrid.height = '700px';
            pivotGrid.width = '1000px';
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
            expect(pivotGrid.rowDimensions.length).toEqual(1);

            pivotGrid.pivotConfiguration.rows = [];
            pivotGrid.notifyDimensionChange(true);
            fixture.detectChanges();
            expect(pivotGrid.rowList.length).toEqual(1);
            expect(pivotGrid.rowDimensions.length).toEqual(0);
        });

        it('should reevaluate aggregated values when all col dimensions are removed', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.height = '700px';
            pivotGrid.width = '1000px';
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
            expect(pivotGrid.columnDimensions.length).toEqual(1);

            pivotGrid.pivotConfiguration.columns = [];
            pivotGrid.notifyDimensionChange(true);
            fixture.detectChanges();

            expect(pivotGrid.rowList.first.cells.length).toEqual(pivotGrid.values.length);
            expect(pivotGrid.columnDimensions.length).toEqual(0);
        });

        it('should change display density', fakeAsync(() => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            const minWidthComf = '80';
            const minWidthSupercompact = '56';
            const cellHeightComf = 50;
            const cellHeightSuperCompact = 24;

            pivotGrid.superCompactMode = true;
            tick();
            fixture.detectChanges();

            expect(pivotGrid.displayDensity).toBe('compact')
            let dimensionContents = fixture.debugElement.queryAll(By.css('.igx-grid__tbody-pivot-dimension'));
            let rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
            expect(rowHeaders[0].componentInstance.column.minWidth).toBe(minWidthSupercompact);
            expect(pivotGrid.rowList.first.cellHeight).toBe(cellHeightSuperCompact);

            pivotGrid.superCompactMode = false;
            fixture.detectChanges();

            pivotGrid.displayDensity = 'comfortable';
            tick();
            fixture.detectChanges();

            expect(pivotGrid.displayDensity).toBe('comfortable')
            rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
            expect(rowHeaders[0].componentInstance.column.minWidth).toBe(minWidthComf);
            expect(pivotGrid.rowList.first.cellHeight).toBe(cellHeightComf);
        }));

        it('should render correct auto-widths for dimensions with no width', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid as IgxPivotGridComponent;
            pivotGrid.data = [{
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282
            }];
            fixture.detectChanges();

            // there should be just 1 dimension column and 2 value columns and they should auto-fill the available space
            expect(pivotGrid.columns.length).toBe(3);
            const dimColumn = pivotGrid.columns.find(x => x.field === 'Bulgaria');
            expect(dimColumn.width).toBe((pivotGrid.calcWidth - pivotGrid.featureColumnsWidth()) + 'px');
            const unitPriceCol = pivotGrid.columns.find(x => x.field === 'Bulgaria-UnitPrice');
            const unitsSoldCol = pivotGrid.columns.find(x => x.field === 'Bulgaria-UnitsSold');
            expect(unitPriceCol.width).toBe(parseInt(dimColumn.width, 10) / 2 + 'px');
            expect(unitsSoldCol.width).toBe(parseInt(dimColumn.width, 10) / 2 + 'px');

            // change data to have many columns so that they no longer fit in the grid
            pivotGrid.data = [{
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                Country: 'Bulgaria', Date: '01/01/2021', UnitsSold: 282
            }, {
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                Country: 'USA', Date: '01/01/2021', UnitsSold: 282
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                Country: 'Spain', Date: '01/01/2021', UnitsSold: 282
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                Country: 'Italy', Date: '01/01/2021', UnitsSold: 282
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                Country: 'Greece', Date: '01/01/2021', UnitsSold: 282
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                Country: 'Uruguay', Date: '01/01/2021', UnitsSold: 282
            },
            {
                ProductCategory: 'Clothing', UnitPrice: 12.81, SellerName: 'Stanley',
                Country: 'Mexico', Date: '01/01/2021', UnitsSold: 282
            }
            ];
            fixture.detectChanges();

            // all should take density default min-width (200 for default density) as they exceed the size of the grid
            const colGroups = pivotGrid.columns.filter(x => x.columnGroup);
            const childCols = pivotGrid.columns.filter(x => !x.columnGroup);
            expect(colGroups.every(x => x.width === '400px')).toBeTrue();
            expect(childCols.every(x => x.width === '200px')).toBeTrue();
        });

        it('should render correct grid with noop strategies', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.data = [
                {
                    AllProducts: 'All Products', All: 2127, 'Bulgaria': 774, 'USA': 829, 'Uruguay': 524, 'AllProducts_records': [
                        { ProductCategory: 'Clothing', All: 1523, 'Bulgaria': 774, 'USA': 296, 'Uruguay': 456, },
                        { ProductCategory: 'Bikes', All: 68, 'Uruguay': 68 },
                        { ProductCategory: 'Accessories', All: 293, 'USA': 293 },
                        { ProductCategory: 'Components', All: 240, 'USA': 240 }
                    ]
                }
            ];

            pivotGrid.pivotConfiguration = {
                columnStrategy: NoopPivotDimensionsStrategy.instance(),
                rowStrategy: NoopPivotDimensionsStrategy.instance(),
                columns: [
                    {
                        memberName: 'Country',
                        enabled: true
                    },
                ]
                ,
                rows: [
                    {
                        memberFunction: () => 'All',
                        memberName: 'AllProducts',
                        enabled: true,
                        width: '25%',
                        childLevel: {
                            memberName: 'ProductCategory',
                            enabled: true
                        }
                    }
                ],
                values: [
                    {
                        member: 'UnitsSold',
                        aggregate: {
                            aggregator: IgxPivotNumericAggregate.sum,
                            key: 'sum',
                            label: 'Sum'
                        },
                        enabled: true
                    },
                ],
                filters: null
            };

            pivotGrid.notifyDimensionChange(true);
            fixture.detectChanges();

            expect(pivotGrid.rowList.first.cells.toArray().map(x => x.value)).toEqual([2127, 774, 829, 524]);
        });


        describe('IgxPivotGrid Features #pivotGrid', () => {
            it('should show excel style filtering via dimension chip.', async () => {
                const pivotGrid = fixture.componentInstance.pivotGrid;
                expect(pivotGrid.filterStrategy).toBeInstanceOf(DimensionValuesFilteringStrategy);
                const excelMenu = GridFunctions.getExcelStyleFilteringComponents(fixture, 'igx-pivot-grid')[1];
                const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
                const rowChip = headerRow.querySelector('igx-chip[id="All"]');
                const filterIcon = rowChip.querySelectorAll('igx-icon')[2];

                expect(excelMenu.parentElement.parentElement.attributes.hidden).not.toBeUndefined();
                filterIcon.click();
                await wait(100);
                fixture.detectChanges();
                const esfSearch = GridFunctions.getExcelFilteringSearchComponent(fixture, excelMenu, 'igx-pivot-grid');

                const checkBoxes = esfSearch.querySelectorAll('igx-checkbox');
                // should show Select All checkbox
                expect(excelMenu.parentElement.parentElement.attributes.hidden).toBeUndefined();
                expect((checkBoxes[0].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Select All');

                // expand tree hierarchy
                GridFunctions.clickExcelTreeNodeExpandIcon(fixture, 0);
                await wait(100);
                fixture.detectChanges();
                // should show correct tree items
                const treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fixture, excelMenu, 'igx-pivot-grid');
                expect(treeItems.length).toBe(5);

                expect(treeItems[1].innerText).toBe('Clothing');
                expect(treeItems[2].innerText).toBe('Bikes');
                expect(treeItems[3].innerText).toBe('Accessories');
                expect(treeItems[4].innerText).toBe('Components');
            });

            it('should filter rows via excel style filtering dimension chip.', async () => {
                const pivotGrid = fixture.componentInstance.pivotGrid;
                const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
                const rowChip = headerRow.querySelector('igx-chip[id="All"]');
                const filterIcon = rowChip.querySelectorAll('igx-icon')[2];
                filterIcon.click();
                await wait(100);
                fixture.detectChanges();

                // expand tree hierarchy
                GridFunctions.clickExcelTreeNodeExpandIcon(fixture, 0);
                await wait(100);
                fixture.detectChanges();

                const excelMenu = GridFunctions.getExcelStyleFilteringComponents(fixture, 'igx-pivot-grid')[1];
                const checkboxes = GridFunctions.getExcelStyleFilteringCheckboxes(fixture, excelMenu, 'igx-tree-grid');
                // uncheck Accessories
                checkboxes[4].click();
                fixture.detectChanges();

                // uncheck Bikes
                checkboxes[3].click();
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

            it('should filter columns via excel style filtering dimension chip.', async () => {
                const pivotGrid = fixture.componentInstance.pivotGrid;
                const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
                const rowChip = headerRow.querySelector('igx-chip[id="Country"]');
                const filterIcon = rowChip.querySelectorAll('igx-icon')[2];
                filterIcon.click();
                await wait(100);
                fixture.detectChanges();
                const excelMenu = GridFunctions.getExcelStyleFilteringComponents(fixture, 'igx-pivot-grid')[1];
                const checkboxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fixture, excelMenu, 'igx-pivot-grid'));

                // uncheck Bulgaria
                checkboxes[1].click();
                fixture.detectChanges();

                // uncheck Uruguay
                checkboxes[3].click();
                fixture.detectChanges();


                // Click 'apply' button to apply filter.
                GridFunctions.clickApplyExcelStyleFiltering(fixture, excelMenu, 'igx-pivot-grid');
                fixture.detectChanges();

                // check columns
                const colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
                const expected = ['USA'];
                expect(colHeaders).toEqual(expected);
            });

            it('should show filters chips', async () => {
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
                await wait(100);
                fixture.detectChanges();
                const esfSearch = GridFunctions.getExcelFilteringSearchComponent(fixture, excelMenu, 'igx-pivot-grid');
                const checkBoxes = esfSearch.querySelectorAll('igx-checkbox');
                // should show and should display correct checkboxes.
                expect(excelMenu.parentElement.parentElement.attributes.hidden).toBeUndefined();
                expect((checkBoxes[0].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Select All');
                expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Stanley');
                expect((checkBoxes[2].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Elisa');
                expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Lydia');
                expect((checkBoxes[4].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('David');
            });

            it('should show filters in chips dropdown button', async () => {
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
                await wait(100);
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
                expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Stanley');
                expect((checkBoxes[2].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Elisa');
                expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Lydia');
                expect((checkBoxes[4].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('David');

                // switch to the `ProductCategory` filters
                const chipAreaElement = fixture.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
                const chipComponents = chipAreaElement[4].queryAll(By.directive(IgxChipComponent));
                chipComponents[1].triggerEventHandler('chipClick', {
                    owner: {
                        id: chips[1].id
                    }
                });
                await wait(500);
                fixture.detectChanges();

                esfSearch = GridFunctions.getExcelFilteringSearchComponent(fixture, excelMenu, 'igx-pivot-grid');
                checkBoxes = esfSearch.querySelectorAll('igx-checkbox');
                expect((checkBoxes[0].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Select All');
                expect((checkBoxes[1].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Clothing');
                expect((checkBoxes[2].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Bikes');
                expect((checkBoxes[3].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Accessories');
                expect((checkBoxes[4].querySelector('.igx-checkbox__label') as HTMLElement).innerText).toEqual('Components');
            });

            it('should be able to filter from chips dropdown button', async () => {
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
                await wait(100);
                fixture.detectChanges();

                const checkBoxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fixture, excelMenu, 'igx-pivot-grid'));
                // uncheck David
                checkBoxes[4].click();
                fixture.detectChanges();

                // uncheck Lydia
                checkBoxes[3].click();
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

            it('should show complex tree and allow filtering for Date dimension', async () => {
                const pivotGrid = fixture.componentInstance.pivotGrid;
                pivotGrid.pivotConfiguration.rows = [new IgxPivotDateDimension(
                    {
                        memberName: 'Date',
                        enabled: true
                    },
                    {
                        months: true,
                        quarters: true,
                        years: true,
                        fullDate: true,
                        total: true
                    }
                )];

                pivotGrid.pipeTrigger++;
                pivotGrid.setupColumns();
                fixture.detectChanges();

                const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
                const rowChip = headerRow.querySelector('igx-chip[id="AllPeriods"]');
                const filterIcon = rowChip.querySelectorAll('igx-icon')[2];
                filterIcon.click();
                await wait(100);
                fixture.detectChanges();

                const excelMenu = GridFunctions.getExcelStyleFilteringComponents(fixture, 'igx-pivot-grid')[1];

                // expand tree hierarchy
                GridFunctions.clickExcelTreeNodeExpandIcon(fixture, 0);
                await wait(100);
                fixture.detectChanges();
                // should show correct tree items
                let treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fixture, excelMenu, 'igx-pivot-grid');

                expect(treeItems.length).toBe(4);
                expect(treeItems[0].querySelector('.igx-tree-node__content').textContent).toBe('All Periods');
                expect(treeItems[1].querySelector('.igx-tree-node__content').textContent).toBe('2021');
                expect(treeItems[2].querySelector('.igx-tree-node__content').textContent).toBe('2019');
                expect(treeItems[3].querySelector('.igx-tree-node__content').textContent).toBe('2020');


                // expand tree hierarchy 2021
                GridFunctions.clickExcelTreeNodeExpandIcon(fixture, 1);
                await wait(100);
                fixture.detectChanges();

                treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fixture, excelMenu, 'igx-pivot-grid');

                expect(treeItems.length).toBe(7);
                expect(treeItems[0].querySelector('.igx-tree-node__content').textContent).toBe('All Periods');
                expect(treeItems[1].querySelector('.igx-tree-node__content').textContent).toBe('2021');
                expect(treeItems[2].querySelector('.igx-tree-node__content').textContent).toBe('Q1');
                expect(treeItems[3].querySelector('.igx-tree-node__content').textContent).toBe('Q2');
                expect(treeItems[4].querySelector('.igx-tree-node__content').textContent).toBe('Q4');
                expect(treeItems[5].querySelector('.igx-tree-node__content').textContent).toBe('2019');
                expect(treeItems[6].querySelector('.igx-tree-node__content').textContent).toBe('2020');

                // expand tree hierarchy Q1
                GridFunctions.clickExcelTreeNodeExpandIcon(fixture, 2);
                await wait(100);
                fixture.detectChanges();

                treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fixture, excelMenu, 'igx-pivot-grid');
                expect(treeItems.length).toBe(8);
                expect(treeItems[0].querySelector('.igx-tree-node__content').textContent).toBe('All Periods');
                expect(treeItems[1].querySelector('.igx-tree-node__content').textContent).toBe('2021');
                expect(treeItems[2].querySelector('.igx-tree-node__content').textContent).toBe('Q1');
                expect(treeItems[3].querySelector('.igx-tree-node__content').textContent).toBe('January');
                expect(treeItems[4].querySelector('.igx-tree-node__content').textContent).toBe('Q2');
                expect(treeItems[5].querySelector('.igx-tree-node__content').textContent).toBe('Q4');
                expect(treeItems[6].querySelector('.igx-tree-node__content').textContent).toBe('2019');
                expect(treeItems[7].querySelector('.igx-tree-node__content').textContent).toBe('2020');

                // expand tree hierarchy January
                GridFunctions.clickExcelTreeNodeExpandIcon(fixture, 3);
                await wait(100);
                fixture.detectChanges();

                treeItems = GridFunctions.getExcelStyleSearchComponentTreeNodes(fixture, excelMenu, 'igx-pivot-grid');
                expect(treeItems.length).toBe(9);
                expect(treeItems[0].querySelector('.igx-tree-node__content').textContent).toBe('All Periods');
                expect(treeItems[1].querySelector('.igx-tree-node__content').textContent).toBe('2021');
                expect(treeItems[2].querySelector('.igx-tree-node__content').textContent).toBe('Q1');
                expect(treeItems[3].querySelector('.igx-tree-node__content').textContent).toBe('January');
                expect(treeItems[4].querySelector('.igx-tree-node__content').textContent).toBe('01/01/2021');
                expect(treeItems[5].querySelector('.igx-tree-node__content').textContent).toBe('Q2');
                expect(treeItems[6].querySelector('.igx-tree-node__content').textContent).toBe('Q4');
                expect(treeItems[7].querySelector('.igx-tree-node__content').textContent).toBe('2019');
                expect(treeItems[8].querySelector('.igx-tree-node__content').textContent).toBe('2020');


                const checkBoxes: any[] = Array.from(GridFunctions.getExcelStyleFilteringCheckboxes(fixture, excelMenu, 'igx-pivot-grid'));
                // uncheck Q1
                checkBoxes[3].click();
                fixture.detectChanges();

                // uncheck Q2
                checkBoxes[6].click();
                fixture.detectChanges();

                // uncheck 2019
                checkBoxes[8].click();
                fixture.detectChanges();

                // uncheck 2020
                checkBoxes[9].click();
                fixture.detectChanges();

                // Click 'apply' button to apply filter.
                GridFunctions.clickApplyExcelStyleFiltering(fixture, excelMenu, 'igx-pivot-grid');
                fixture.detectChanges();

                // check rows
                const rows = pivotGrid.rowList.toArray();
                expect(rows.length).toBe(5);
                const expectedHeaders = ['All Periods', '2021', 'Q4', 'December', '12/08/2021'];
                const rowHeaders = fixture.debugElement.queryAll(
                    By.directive(IgxPivotRowDimensionHeaderComponent));
                const rowDimensionHeaders = rowHeaders.map(x => x.componentInstance.column.header);
                expect(rowDimensionHeaders).toEqual(expectedHeaders);
            });

            it('should do nothing on filtering pointer down', () => {
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

                const headerRow = fixture.debugElement.queryAll(
                    By.directive(IgxPivotHeaderRowComponent))[0].componentInstance;
                const filtersChip = headerRow.nativeElement.querySelector('igx-chip[id="Date"]');
                expect(filtersChip).not.toBeUndefined();
                const filterIcon = filtersChip.querySelectorAll('igx-icon')[1];

                spyOn(headerRow, 'onFilteringIconPointerDown').and.callThrough();
                filterIcon.dispatchEvent(new Event('pointerdown'));
                expect(headerRow.onFilteringIconPointerDown).toHaveBeenCalledTimes(1);
            });

            it('should apply sorting for dimension via row chip', () => {
                fixture.detectChanges();
                const pivotGrid = fixture.componentInstance.pivotGrid;
                spyOn(pivotGrid.dimensionsSortingExpressionsChange, 'emit');
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

                // should have emitted event
                expect(pivotGrid.dimensionsSortingExpressionsChange.emit).toHaveBeenCalledTimes(2);
                const expectedExpressions: ISortingExpression[] = [
                    { dir: SortingDirection.Desc, fieldName: 'All', strategy: DefaultPivotSortingStrategy.instance() },
                    { dir: SortingDirection.Desc, fieldName: 'ProductCategory', strategy: DefaultPivotSortingStrategy.instance() },
                    { dir: SortingDirection.None, fieldName: 'Country', strategy: DefaultPivotSortingStrategy.instance() }
                ];
                expect(pivotGrid.dimensionsSortingExpressionsChange.emit).toHaveBeenCalledWith(expectedExpressions);
            });

            it('should apply sorting for dimension via column chip', () => {
                const pivotGrid = fixture.componentInstance.pivotGrid;
                const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
                const colChip = headerRow.querySelector('igx-chip[id="Country"]');
                spyOn(pivotGrid.dimensionsSortingExpressionsChange, 'emit');
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
                const expectedExpressions: ISortingExpression[] = [
                    { dir: SortingDirection.None, fieldName: 'All', strategy: DefaultPivotSortingStrategy.instance()},
                    { dir: SortingDirection.None, fieldName: 'ProductCategory', strategy: DefaultPivotSortingStrategy.instance()},
                    { dir: SortingDirection.Desc, fieldName: 'Country', strategy: DefaultPivotSortingStrategy.instance() }
                ];
                expect(pivotGrid.dimensionsSortingExpressionsChange.emit).toHaveBeenCalledWith(expectedExpressions);
                expect(pivotGrid.dimensionsSortingExpressions).toEqual(expectedExpressions);
            });

            it('should apply sorting for dimension via column chip when dimension has memberFunction', () => {
                const pivotGrid = fixture.componentInstance.pivotGrid;
                pivotGrid.pivotConfiguration.columns = [{
                    memberName: 'Country',
                    memberFunction: (data) => {
                        return data['Country'];
                    },
                    enabled: true
                }];
                pivotGrid.notifyDimensionChange(true);
                fixture.detectChanges();

                const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
                const colChip = headerRow.querySelector('igx-chip[id="Country"]');
                spyOn(pivotGrid.dimensionsSortingExpressionsChange, 'emit');
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
                const expectedExpressions: ISortingExpression[] = [
                    { dir: SortingDirection.None, fieldName: 'All', strategy: DefaultPivotSortingStrategy.instance()},
                    { dir: SortingDirection.None, fieldName: 'ProductCategory', strategy: DefaultPivotSortingStrategy.instance()},
                    { dir: SortingDirection.Desc, fieldName: 'Country', strategy: DefaultPivotSortingStrategy.instance() }
                ];
                expect(pivotGrid.dimensionsSortingExpressionsChange.emit).toHaveBeenCalledWith(expectedExpressions);
                expect(pivotGrid.dimensionsSortingExpressions).toEqual(expectedExpressions);
            });

            it('should apply correct sorting for IgxPivotDateDimension', () => {
                const pivotGrid = fixture.componentInstance.pivotGrid;

                pivotGrid.pivotConfiguration.columns = [
                    new IgxPivotDateDimension(
                        {
                            memberName: 'Date',
                            memberFunction: (data) => {
                                return data['Date'];
                            },
                            enabled: true,
                            dataType: GridColumnDataType.Date
                        },
                        {
                            total: false,
                            years: false,
                            quarters: false,
                            months: false,
                            fullDate: true
                        }
                    )
                ];
                pivotGrid.notifyDimensionChange(true);
                fixture.detectChanges();

                const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
                const colChip = headerRow.querySelector('igx-chip[id="Date"]');

                //sort asc
                colChip.click();
                fixture.detectChanges();

                let colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
                let expected = ['01/05/2019', '01/06/2020', '02/19/2020', '05/12/2020', '01/01/2021', '04/07/2021', '12/08/2021']
                expect(colHeaders).toEqual(expected);

                // sort desc
                colChip.click();
                fixture.detectChanges();

                colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
                expected = ['12/08/2021', '04/07/2021', '01/01/2021', '05/12/2020', '02/19/2020', '01/06/2020', '01/05/2019'];
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
                let columnValues = pivotGrid.dataView.map(x => (x as IPivotGridRecord).aggregationValues.get('USA-UnitsSold'));
                expect(columnValues).toEqual(expectedOrder);

                headerCell = GridFunctions.getColumnHeader('USA-UnitsSold', fixture);
                // sort desc
                GridFunctions.clickHeaderSortIcon(headerCell);
                fixture.detectChanges();
                expect(pivotGrid.sortingExpressions.length).toBe(1);
                expectedOrder = [829, 296, 293, 240, undefined];
                columnValues = pivotGrid.dataView.map(x => (x as IPivotGridRecord).aggregationValues.get('USA-UnitsSold'));
                expect(columnValues).toEqual(expectedOrder);

                // remove sort
                headerCell = GridFunctions.getColumnHeader('USA-UnitsSold', fixture);
                GridFunctions.clickHeaderSortIcon(headerCell);
                fixture.detectChanges();
                expect(pivotGrid.sortingExpressions.length).toBe(0);
                expectedOrder = [829, 293, undefined, 296, 240];
                columnValues = pivotGrid.dataView.map(x => (x as IPivotGridRecord).aggregationValues.get('USA-UnitsSold'));
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

            it('should sort date values', () => {
                const pivotGrid = fixture.componentInstance.pivotGrid;
                pivotGrid.height = '700px';
                pivotGrid.width = '1000px';
                pivotGrid.pivotConfiguration.columns = [
                    {
                        memberName: 'Date',
                        enabled: true,
                        dataType: 'date'
                    }
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

                const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
                const colChip = headerRow.querySelector('igx-chip[id="Date"]');

                // sort asc
                colChip.click();
                fixture.detectChanges();

                let colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
                let expected = ['01/05/2019', '01/06/2020', '02/19/2020', '05/12/2020', '01/01/2021', '04/07/2021', '12/08/2021']
                expect(colHeaders).toEqual(expected);

                // sort desc
                colChip.click();
                fixture.detectChanges();

                colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
                expected = ['12/08/2021', '04/07/2021', '01/01/2021', '05/12/2020', '02/19/2020', '01/06/2020', '01/05/2019'];
                expect(colHeaders).toEqual(expected);

                //remove sort
                colChip.click();
                fixture.detectChanges();

                colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
                expected = ['01/01/2021', '01/05/2019', '01/06/2020', '04/07/2021', '12/08/2021', '05/12/2020', '02/19/2020']
                expect(colHeaders).toEqual(expected);

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
                expect(dropDown.length).toBe(2);

                const valueChipUnitPrice = headerRow.querySelector('igx-chip[id="UnitPrice"]');

                const aggregatesIconUnitPrice = valueChipUnitPrice.querySelectorAll('igx-icon')[1];
                aggregatesIconUnitPrice.click();
                fixture.detectChanges();

                dropDown = fixture.debugElement.queryAll(By.css(`.${CSS_CLASS_LIST}`));
                expect(dropDown.length).toBe(2);
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
                        id: 'ProductCategory',
                        data: { pivotArea: 'row' }
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
                        id: 'ProductCategory',
                        data: { pivotArea: 'row' }
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
                        id: 'Country',
                        data: { pivotArea: 'column' }
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
                        id: 'Country',
                        data: { pivotArea: 'column' }
                    },
                    owner: colChip2
                }, colChipArea, PivotDimensionType.Column);
                pivotGrid.cdr.detectChanges();

                headerRow.onDimDragLeave({
                    owner: colChip2
                });
                expect((colChip2.nativeElement.previousElementSibling as any).style.visibility).toBe('hidden');
                expect((colChip2.nativeElement.nextElementSibling as any).style.visibility).toBe('hidden');

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
                let chipAreas = fixture.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
                let valuesChipArea: IgxChipsAreaComponent = chipAreas[2].componentInstance;
                let valChip1 = valuesChipArea.chipsList.toArray()[0];
                let valChip2 = valuesChipArea.chipsList.toArray()[1];

                // move first chip over the second one
                headerRow.onDimDragOver({
                    dragChip: {
                        id: 'UnitsSold',
                        data: { pivotArea: 'value' }
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
                fixture.detectChanges();

                //check chip order is updated.
                expect(valuesChipArea.chipsList.toArray()[0].id).toBe(valChip2.id);
                expect(valuesChipArea.chipsList.toArray()[1].id).toBe(valChip1.id);
                // check dimension order is updated.
                expect(pivotGrid.pivotConfiguration.values.map(x => x.member)).toEqual(['UnitPrice', 'UnitsSold']);

                // should be able to move on the opposite side
                chipAreas = fixture.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
                valuesChipArea = chipAreas[2].componentInstance;
                valChip1 = valuesChipArea.chipsList.toArray()[0];
                valChip2 = valuesChipArea.chipsList.toArray()[1];
                headerRow.onDimDragOver({
                    dragChip: {
                        id: 'UnitsSold',
                        data: { pivotArea: 'value' }
                    },
                    owner: valChip1,
                    originalEvent: {
                        offsetX: -100
                    }
                });
                fixture.detectChanges();

                headerRow.onValueDrop({
                    dragChip: valChip2,
                    owner: valChip1
                }, valuesChipArea);
                pivotGrid.cdr.detectChanges();
                fixture.detectChanges();
                //check chip order is updated.
                expect(valuesChipArea.chipsList.toArray()[0].id).toBe(valChip2.id);
                expect(valuesChipArea.chipsList.toArray()[1].id).toBe(valChip1.id);
                // check dimension order is updated.
                expect(pivotGrid.pivotConfiguration.values.map(x => x.member)).toEqual(['UnitsSold', 'UnitPrice']);

                //should not be able to drag value to row
                headerRow.onDimDragOver({
                    dragChip: {
                        id: 'UnitsSold',
                        data: { pivotArea: 'value' }
                    },
                    owner: valChip2,
                    originalEvent: {
                        offsetX: 100
                    }
                }, PivotDimensionType.Row);
                fixture.detectChanges();

                expect(pivotGrid.pivotConfiguration.values.map(x => x.member)).toEqual(['UnitsSold', 'UnitPrice']);
                expect(pivotGrid.pivotConfiguration.rows.length).toBe(1);
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
                expect(pivotGrid.rowDimensionWidthToPixels(rowDimension)).toBe(200);
                pivotGrid.autoSizeRowDimension(rowDimension);
                fixture.detectChanges();
                expect(rowDimension.width).toBe('186px');
                expect(pivotGrid.rowDimensionWidthToPixels(rowDimension)).toBe(186);
            });
        });
    });

    describe('IgxPivotGrid complex hierarchy #pivotGrid', () => {
        let fixture: ComponentFixture<IgxPivotGridTestComplexHierarchyComponent>;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(IgxPivotGridTestComplexHierarchyComponent);
            fixture.detectChanges();
        }));

        it('should select/deselect the correct row', () => {
            fixture.detectChanges();
            const pivotGrid = fixture.componentInstance.pivotGrid;
            expect(pivotGrid.selectedRows).toEqual([]);
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
            expect((pivotGrid.selectedRows[0] as IPivotGridRecord).dimensionValues.get('All cities')).toBe('All Cities');
            expect((pivotGrid.selectedRows[0] as IPivotGridRecord).dimensionValues.get('ProductCategory')).toBe('Clothing');

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
            const dimensionValues = PivotGridFunctions.getDimensionValues(pivotGrid.selectedRows);
            const expected =
                [
                    {
                        AllProducts: 'AllProducts', 'All cities': 'All Cities'
                    }, {
                        ProductCategory: 'Bikes', 'All cities': 'All Cities'
                    }, {
                        ProductCategory: 'Clothing', 'All cities': 'All Cities'
                    }, {
                        ProductCategory: 'Accessories', 'All cities': 'All Cities'
                    }, {
                        ProductCategory: 'Components', 'All cities': 'All Cities'
                    }
                ];
            expect(dimensionValues).toEqual(expected);
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

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(IgxPivotGridTestComplexHierarchyComponent);
            fixture.detectChanges();
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

        it('should update grid after resizing with double click', fakeAsync(() => {
            let dimensionContents = fixture.debugElement.queryAll(By.css('.igx-grid__tbody-pivot-dimension'));

            let rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
            expect(rowHeaders[0].componentInstance.column.width).toEqual('200px');
            expect(rowHeaders[3].componentInstance.column.width).toEqual('200px');

            const headerResArea = GridFunctions.getHeaderResizeArea(rowHeaders[3]).nativeElement;

            // Resize first column
            UIInteractions.simulateMouseEvent('dblclick', headerResArea, 100, 0);
            tick(200);
            fixture.detectChanges();

            rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
            expect(parseFloat(rowHeaders[0].componentInstance.column.width)).toBeGreaterThan(200);
            expect(parseFloat(rowHeaders[3].componentInstance.column.width)).toBeGreaterThan(200);

            rowHeaders = dimensionContents[1].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
            expect(rowHeaders[0].componentInstance.column.width).toEqual('200px');
            expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');
            expect(rowHeaders[5].componentInstance.column.width).toEqual('200px');
            expect(rowHeaders[7].componentInstance.column.width).toEqual('200px');
        }));

        it('should update grid after resizing to equal min width', fakeAsync(() => {
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
            UIInteractions.simulateMouseEvent('mousemove', resizer, -400, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, -400, 5);
            fixture.detectChanges();

            rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
            const minWdith = parseFloat(rowHeaders[0].componentInstance.column.minWidth);
            expect(parseFloat(rowHeaders[0].componentInstance.column.width)).toEqual(minWdith);
            expect(parseFloat(rowHeaders[3].componentInstance.column.width)).toEqual(minWdith);

            rowHeaders = dimensionContents[1].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
            expect(rowHeaders[0].componentInstance.column.width).toEqual('200px');
            expect(rowHeaders[1].componentInstance.column.width).toEqual('200px');
            expect(rowHeaders[5].componentInstance.column.width).toEqual('200px');
            expect(rowHeaders[7].componentInstance.column.width).toEqual('200px');
        }));

        it('should update grid after resizing with percentages', fakeAsync(() => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.width = '1000px';
            pivotGrid.pivotConfiguration.rows[0].width = '20%';
            pivotGrid.notifyDimensionChange(true);
            fixture.detectChanges;

            let dimensionContents = fixture.debugElement.queryAll(By.css('.igx-grid__tbody-pivot-dimension'));

            let rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
            expect(parseFloat(rowHeaders[0].componentInstance.column.width)).toBeGreaterThan(150);
            expect(parseFloat(rowHeaders[3].componentInstance.column.width)).toBeGreaterThan(150);
            expect(pivotGrid.pivotConfiguration.rows[0].width).toEqual('20%');

            const headerResArea = GridFunctions.getHeaderResizeArea(rowHeaders[3]).nativeElement;

            // Resize first column
            UIInteractions.simulateMouseEvent('mousedown', headerResArea, 100, 0);
            tick(200);
            fixture.detectChanges();

            const resizer = GridFunctions.getResizer(fixture).nativeElement;
            expect(resizer).toBeDefined();
            UIInteractions.simulateMouseEvent('mousemove', resizer, -100, 5);
            UIInteractions.simulateMouseEvent('mouseup', resizer, -100, 5);
            fixture.detectChanges();

            rowHeaders = dimensionContents[0].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
            expect(parseFloat(rowHeaders[0].componentInstance.column.width)).toBeLessThan(150);
            expect(parseFloat(rowHeaders[3].componentInstance.column.width)).toBeLessThan(150);
            // less than 10%
            expect(parseFloat(pivotGrid.pivotConfiguration.rows[0].width)).toBeLessThan(10);


            rowHeaders = dimensionContents[1].queryAll(By.directive(IgxPivotRowDimensionHeaderGroupComponent));
            expect(rowHeaders[0].componentInstance.column.width).toEqual('200px');
        }));


        it('Should not expand columns if collapsed after sorting', () => {
            const pivotGrid = fixture.componentInstance.pivotGrid;
            pivotGrid.width = '1600px';
            fixture.detectChanges();
            pivotGrid.pivotConfiguration.columns = [
                pivotGrid.pivotConfiguration.rows[1]
            ];
            pivotGrid.pivotConfiguration.rows.pop();
            pivotGrid.notifyDimensionChange(true);
            fixture.detectChanges();

            expect(pivotGrid.columns.length).toBe(16);
            expect(pivotGrid.rowList.first.cells.length).toBe(8);

            const headerRow = fixture.nativeElement.querySelector('igx-pivot-header-row');
            const header = headerRow.querySelector('igx-grid-header-group');
            const expander = header.querySelectorAll('igx-icon')[0];
            expander.click();
            fixture.detectChanges();
            expect(pivotGrid.columnGroupStates.size).toBe(1);
            expect(pivotGrid.rowList.first.cells.length).toBe(2);

            const colChip = headerRow.querySelector('igx-chip[id="AllProducts"]');

            // sort
            colChip.click();
            fixture.detectChanges();

            expect(pivotGrid.columnGroupStates.size).toBe(1);
            expect(pivotGrid.rowList.first.cells.length).toBe(2);
        });
    });

    describe('IgxPivotGrid APIs #pivotGrid', () => {
        let fixture: ComponentFixture<any>;
        let pivotGrid: IgxPivotGridComponent;

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(IgxPivotGridTestComplexHierarchyComponent);
            fixture.detectChanges();

            pivotGrid = fixture.componentInstance.pivotGrid;
        }));


        it('should allow inserting new dimension.', () => {
            //insert wtihout index
            pivotGrid.insertDimensionAt({ memberName: 'Date', enabled: true }, PivotDimensionType.Row);
            fixture.detectChanges();
            expect(pivotGrid.pivotConfiguration.rows[2].memberName).toBe('Date');

            // At Index
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
            expect(pivotGrid.columns.length).toBe(pivotGrid.values.length);

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
            expect(pivotGrid.columns.length).toBe(pivotGrid.values.length);

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

        it('should allow inserting new value.', () => {
            let value = {
                member: 'Date',
                aggregate: {
                    aggregator: IgxPivotDateAggregate.latest,
                    key: 'LATEST',
                    label: 'Latest'
                },
                enabled: true
            };
            // At Index
            pivotGrid.insertValueAt(value, 1);
            fixture.detectChanges();
            expect(pivotGrid.values.length).toBe(3);
            expect(pivotGrid.values[1].member).toBe('Date');
            expect(pivotGrid.columns.length).toBe(20);

            // With no Index
            pivotGrid.pivotConfiguration.values = undefined;
            pivotGrid.notifyDimensionChange(true);
            fixture.detectChanges();
            pivotGrid.insertValueAt({
                member: 'Date',
                displayName: 'DateNew',
                aggregate: {
                    aggregator: IgxPivotDateAggregate.earliest,
                    key: 'EARLIEST',
                    label: 'Earliest'
                },
                enabled: true
            });
            expect(pivotGrid.values.length).toBe(1);
            expect(pivotGrid.values[0].member).toBe('Date');
            expect(pivotGrid.values[0].displayName).toBe('DateNew');
            expect(pivotGrid.columns.length).toBe(5);
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

            //should do nothing if value is not present in the configuration
            pivotGrid.moveValue({
                member: 'NotPresent',
                enabled: true,
                aggregate: {
                    aggregator: () => { },
                    key: 'Test',
                    label: 'test'
                }
            });
            fixture.detectChanges();
            expect(pivotGrid.values.length).toBe(2);
            expect(pivotGrid.values[0].member).toBe('UnitsSold');
            expect(pivotGrid.values[1].member).toBe('AmountOfSale');

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

        it('should allow changing the whole pivotConfiguration object', () => {
            pivotGrid.pivotConfiguration = {
                columns: [
                    {
                        memberName: 'City',
                        enabled: true
                    }
                ],
                rows: [
                    {
                        memberName: 'ProductCategory',
                        enabled: true
                    }],
                values: [
                    {
                        member: 'UnitsSold',
                        aggregate: {
                            aggregator: IgxPivotNumericAggregate.sum,
                            key: 'SUM',
                            label: 'Sum'
                        },
                        enabled: true
                    }
                ]
            };
            fixture.detectChanges();

            //check rows
            const rows = pivotGrid.rowList.toArray();
                expect(rows.length).toBe(4);
                const expectedHeaders = ['Accessories', 'Bikes', 'Clothing', 'Components'];
                const rowHeaders = fixture.debugElement.queryAll(
                    By.directive(IgxPivotRowDimensionHeaderComponent));
                const rowDimensionHeaders = rowHeaders.map(x => x.componentInstance.column.header);
                expect(rowDimensionHeaders).toEqual(expectedHeaders);

            // check columns
            let colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
            let expected = ['Plovdiv', 'New York', 'Ciudad de la Costa', 'London', 'Yokohama', 'Sofia'];
            expect(colHeaders).toEqual(expected);

            // check data
            let pivotRecord = (pivotGrid.rowList.first as IgxPivotRowComponent).data;
            expect(pivotRecord.aggregationValues.get('London')).toBe(293);

        });

        it('should allow formatting based on additional record and column data',() => {
            pivotGrid.pivotConfiguration = {
                columns: [
                    {
                        memberName: 'City',
                        enabled: true
                    }
                ],
                rows: [
                    {
                        memberName: 'ProductCategory',
                        enabled: true
                    }],
                values: [
                    {
                        member: 'UnitsSold',
                        aggregate: {
                            aggregator: IgxPivotNumericAggregate.sum,
                            key: 'SUM',
                            label: 'Sum'
                        },
                        enabled: true,
                        formatter: (value, rowData: IPivotGridRecord, columnData: IPivotGridColumn) => {
                          return  rowData.dimensionValues.get('ProductCategory') + '/' + columnData.dimensionValues.get('City')+':' + value;
                        }
                    }
                ]
            };
            fixture.detectChanges();
            expect(pivotGrid.gridAPI.get_cell_by_index(0, 0).nativeElement.innerText).toBe('Accessories/Plovdiv:undefined');
            expect(pivotGrid.gridAPI.get_cell_by_index(0, 3).nativeElement.innerText).toBe('Accessories/London:293');
        });

        it('should allow filtering a dimension runtime.', () => {
            const colValues = new Set();
            colValues.add('US');
            colValues.add('UK');
            pivotGrid.filterDimension(pivotGrid.pivotConfiguration.columns[0], colValues, IgxStringFilteringOperand.instance().condition('in'));
            expect(pivotGrid.columns.length).toBe(6);
            expect(pivotGrid.columns.filter(x => x.columnGroup).map(x => x.field)).toEqual(['US', 'UK']);
            expect(pivotGrid.filteringExpressionsTree.filteringOperands.length).toEqual(1);

            const rowValues = new Set();
            rowValues.add('Clothing');
            pivotGrid.filterDimension(pivotGrid.pivotConfiguration.rows[1].childLevel, rowValues, IgxStringFilteringOperand.instance().condition('in'));
            expect(pivotGrid.rowList.length).toBe(4);
            const rowDimData = pivotGrid.rowList.map(x => (x as IgxPivotRowComponent).data.dimensionValues.get('ProductCategory'))
            expect(rowDimData).toEqual([undefined, 'Clothing', undefined, 'Clothing']);
            expect(pivotGrid.filteringExpressionsTree.filteringOperands.length).toEqual(2);
        });

        it('should update filtering on pivot configuration change.', () => {
            fixture.detectChanges();
            expect(pivotGrid.filteringExpressionsTree.filteringOperands.length).toEqual(0);
            const filterColumnExpTree = new FilteringExpressionsTree(FilteringLogic.And);
            filterColumnExpTree.filteringOperands = [
                {
                    condition: IgxStringFilteringOperand.instance().condition('in'),
                    fieldName: 'City',
                    searchVal: new Set(['Ciudad de la Costa'])
                }
            ];
            const filterRowExpTree = new FilteringExpressionsTree(FilteringLogic.And);
            filterRowExpTree.filteringOperands = [
                {
                    condition: IgxStringFilteringOperand.instance().condition('in'),
                    fieldName: 'ProductCategory',
                    searchVal: new Set(['Bikes'])
                }
            ];
            pivotGrid.pivotConfiguration = {
                columns: [
                    {
                        memberName: 'City',
                        enabled: true,
                        filter: filterColumnExpTree
                    }
                ],
                rows: [
                    {
                        memberName: 'ProductCategory',
                        enabled: true,
                        filter: filterRowExpTree
                    }],
                values: [
                    {
                        member: 'UnitsSold',
                        aggregate: {
                            aggregator: IgxPivotNumericAggregate.sum,
                            key: 'SUM',
                            label: 'Sum'
                        },
                        enabled: true
                    }
                ]
            };
            fixture.detectChanges();
            expect(pivotGrid.filteringExpressionsTree.filteringOperands.length).toEqual(2);

            expect(pivotGrid.columns.length).toBe(1);
            expect(pivotGrid.columns[0].field).toEqual('Ciudad de la Costa');
            expect(pivotGrid.rowList.length).toBe(1);
            expect(pivotGrid.rowList.toArray()[0].data.dimensionValues.get('ProductCategory')).toBe('Bikes');
        });

        it('should allow setting aggregatorName instead of aggregator.', () => {
            pivotGrid.pivotConfiguration.values = [
                {
                    member: 'UnitsSold',
                    aggregate: {
                        aggregatorName: 'SUM',
                        key: 'SUM',
                        label: 'Sum',
                    },
                    enabled: true
                }
            ];
            pivotGrid.notifyDimensionChange(true);
            fixture.detectChanges();
            let pivotRecord = (pivotGrid.rowList.first as IgxPivotRowComponent).data;
            expect(pivotRecord.aggregationValues.get('US')).toBe(296);
            expect(pivotRecord.aggregationValues.get('Bulgaria')).toBe(774);
            expect(pivotRecord.aggregationValues.get('UK')).toBe(293);
            expect(pivotRecord.aggregationValues.get('Japan')).toBe(240);
        });

        it('should use aggregatorName if both aggregatorName and aggregator are set at the same time.', () => {
            pivotGrid.pivotConfiguration.values = [
                {
                    member: 'UnitsSold',
                    aggregate: {
                        aggregatorName: 'SUM',
                        aggregator: IgxPivotNumericAggregate.average,
                        key: 'SUM',
                        label: 'Sum',
                    },
                    enabled: true
                }
            ];
            pivotGrid.notifyDimensionChange(true);
            fixture.detectChanges();
            let pivotRecord = (pivotGrid.rowList.first as IgxPivotRowComponent).data;
            expect(pivotRecord.aggregationValues.get('US')).toBe(296);
            expect(pivotRecord.aggregationValues.get('Bulgaria')).toBe(774);
            expect(pivotRecord.aggregationValues.get('UK')).toBe(293);
            expect(pivotRecord.aggregationValues.get('Japan')).toBe(240);
        });
    });
});
