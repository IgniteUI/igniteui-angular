import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { first, take } from 'rxjs/operators';
import { NoopPivotDimensionsStrategy } from '../data-operations/pivot-strategy';
import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxPivotGridPersistanceComponent } from '../test-utils/pivot-grid-samples.spec';
import { IgxPivotNumericAggregate } from './pivot-grid/pivot-grid-aggregate';
import { IgxPivotDateDimension } from './pivot-grid/pivot-grid-dimensions';
import { IPivotDimension, IPivotGridRecord } from './pivot-grid/pivot-grid.interface';
import { IgxPivotRowDimensionHeaderComponent } from './pivot-grid/pivot-row-dimension-header.component';

describe('IgxPivotGridState #pivotGrid :', () => {
    configureTestSuite();
    let fixture;
    let pivotGrid;
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, IgxPivotGridPersistanceComponent]
        }).compileComponents();
    }));

    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(IgxPivotGridPersistanceComponent);
        fixture.detectChanges();
        pivotGrid = fixture.componentInstance.pivotGrid;
    }));

    it('getState should return correct JSON string.', () => {
        const state = fixture.componentInstance.state;
        expect(state).toBeDefined('IgxGridState directive is initialized');
        const jsonString = state.getState(true);
        const expectedObj = {
            "columns": [
                { "pinned": false, "sortable": true, "filterable": true, "sortingIgnoreCase": true, "filteringIgnoreCase": true, "headerClasses": "", "headerGroupClasses": "", "groupable": false, "hidden": false, "dataType": "number", "hasSummary": false, "field": "Bulgaria", "width": "220px", "header": "Bulgaria", "resizable": false, "searchable": true, "selectable": true, "key": "Bulgaria", "columnGroup": false, "disableHiding": false, "disablePinning": false },
                { "pinned": false, "sortable": true, "filterable": true, "sortingIgnoreCase": true, "filteringIgnoreCase": true, "headerClasses": "", "headerGroupClasses": "", "groupable": false, "hidden": false, "dataType": "number", "hasSummary": false, "field": "US", "width": "220px", "header": "US", "resizable": false, "searchable": true, "selectable": true, "key": "US", "columnGroup": false, "disableHiding": false, "disablePinning": false },
                { "pinned": false, "sortable": true, "filterable": true, "sortingIgnoreCase": true, "filteringIgnoreCase": true, "headerClasses": "", "headerGroupClasses": "", "groupable": false, "hidden": false, "dataType": "number", "hasSummary": false, "field": "Uruguay", "width": "220px", "header": "Uruguay", "resizable": false, "searchable": true, "selectable": true, "key": "Uruguay", "columnGroup": false, "disableHiding": false, "disablePinning": false },
                { "pinned": false, "sortable": true, "filterable": true, "sortingIgnoreCase": true, "filteringIgnoreCase": true, "headerClasses": "", "headerGroupClasses": "", "groupable": false, "hidden": false, "dataType": "number", "hasSummary": false, "field": "UK", "width": "220px", "header": "UK", "resizable": false, "searchable": true, "selectable": true, "key": "UK", "columnGroup": false, "disableHiding": false, "disablePinning": false },
                { "pinned": false, "sortable": true, "filterable": true, "sortingIgnoreCase": true, "filteringIgnoreCase": true, "headerClasses": "", "headerGroupClasses": "", "groupable": false, "hidden": false, "dataType": "number", "hasSummary": false, "field": "Japan", "width": "220px", "header": "Japan", "resizable": false, "searchable": true, "selectable": true, "key": "Japan", "columnGroup": false, "disableHiding": false, "disablePinning": false }
            ],
            "filtering": { "filteringOperands": [], "operator": 0, "type": 0 },
            "advancedFiltering": {}, "sorting": [], "cellSelection": [], "rowSelection": [], "columnSelection": [],
            "expansion": [], "moving": false, "rowIslands": [],
            "pivotConfiguration": {
                "columns": [
                    { "memberName": "Country", "enabled": true, "level": 0 }
                ], "rows": [
                    { "memberName": "City", "enabled": true, "level": 0 },
                    { "memberName": "ProductCategory", "enabled": true, "level": 0 }],
                "values": [{
                    "member": "UnitsSold", "aggregate": { "key": "SUM", "label": "Sum" },
                    "enabled": true
                }],
                "filters" : []
            }
        };

        expect(jsonString).toBe(JSON.stringify(expectedObj));
    });

    it('getState should return correct pivot configuration state.', () => {
        const state = fixture.componentInstance.state;
        const jsonString = state.getState(true, 'pivotConfiguration');
        const jsonObj = JSON.parse(jsonString);
        expect(jsonObj.pivotConfiguration).toBeDefined();
        expect(jsonObj.pivotConfiguration.rows.length).toEqual(pivotGrid.pivotConfiguration.rows.length);
        expect(jsonObj.pivotConfiguration.columns.length).toEqual(pivotGrid.pivotConfiguration.columns.length);
        expect(jsonObj.pivotConfiguration.values.length).toEqual(pivotGrid.pivotConfiguration.values.length);

        // json string object cannot contain functions
        expect(jsonObj.pivotConfiguration.values[0].aggregate.aggregator).toBeUndefined();
    });

    it('setState should correctly restore simple configuration state from string.', () => {
        const state = fixture.componentInstance.state;
        const stateToRestore = `{ "pivotConfiguration" : {
            "columns": [
                { "memberName": "ProductCategory", "enabled": true }
            ],
            "rows": [
                { "memberName": "City", "enabled": true },
                { "memberName": "Country", "enabled": true }
            ],
            "values": [
                { "member": "UnitsSold", "aggregate": { "key": "SUM", "label": "Sum" },
                 "enabled": true
                }
                ]
            }
        }`;

        state.setState(stateToRestore, 'pivotConfiguration');
        fixture.detectChanges();
        expect(pivotGrid.pivotConfiguration.rows.length).toBe(2);
        expect(pivotGrid.pivotConfiguration.rows[0].memberName).toBe('City');
        expect(pivotGrid.pivotConfiguration.rows[1].memberName).toBe('Country');

        expect(pivotGrid.pivotConfiguration.columns.length).toBe(1);
        expect(pivotGrid.pivotConfiguration.columns[0].memberName).toBe('ProductCategory');

        expect(pivotGrid.pivotConfiguration.values.length).toBe(1);
        expect(pivotGrid.pivotConfiguration.values[0].member).toBe('UnitsSold');
        expect(pivotGrid.pivotConfiguration.values[0].aggregate.aggregator).toBe(IgxPivotNumericAggregate.sum);

        expect(pivotGrid.columns.length).toBe(4);
        expect(pivotGrid.rowList.length).toBe(6);
    });

    it('setState should correctly restore value sorting state from string.', () => {
        const state = fixture.componentInstance.state;
        const sortState = '{ "sorting" : [{"fieldName":"US","dir":2,"ignoreCase":true}] }';
        state.setState(sortState, 'sorting');
        fixture.detectChanges();

        // check column is sorted
        expect(pivotGrid.sortingExpressions.length).toBe(1);
        const expectedOrder = [296, undefined, undefined, undefined, undefined, undefined, undefined];
        const columnValues = pivotGrid.dataView.map(x => (x as IPivotGridRecord).aggregationValues.get('US'));
        expect(columnValues).toEqual(expectedOrder);

    });

    it('setState should correctly restore dimension sorting state from string.', () => {
        const state = fixture.componentInstance.state;
        const stateToRestore = `{ "pivotConfiguration" : {
            "columns": [
                { "memberName": "ProductCategory", "enabled": true, "sortDirection": 1 }
            ],
            "rows": [
                { "memberName": "City", "enabled": true, "sortDirection": 2 }
            ],
            "values": [
                { "member": "UnitsSold", "aggregate": { "key": "SUM", "label": "Sum" },
                 "enabled": true
                }
                ]
            }
        }`;

        state.setState(stateToRestore, 'pivotConfiguration');
        fixture.detectChanges();

        // check sorting

        // rows
        const expectedOrder = ['Yokohama', 'Sofia', 'Plovdiv', 'New York', 'London', 'Ciudad de la Costa'];
        const rowHeaders = fixture.debugElement.queryAll(
            By.directive(IgxPivotRowDimensionHeaderComponent));
        const rowDimensionHeaders = rowHeaders.map(x => x.componentInstance.column.header);
        expect(rowDimensionHeaders).toEqual(expectedOrder);

        // columns
        const colHeaders = pivotGrid.columns.filter(x => x.level === 0).map(x => x.header);
        const expected = ['Accessories', 'Bikes', 'Clothing', 'Components'];
        expect(colHeaders).toEqual(expected);
    });

    it('setState should correctly restore excel style filtering.', () => {
        const state = fixture.componentInstance.state;
        const stateToRestore = `{ "pivotConfiguration" : {
            "columns": [
                { "memberName": "ProductCategory", "enabled": true }
            ],
            "rows": [
                { "memberName": "City", "enabled": true,
                    "filter" : {
                        "filteringOperands":[
                            {
                                "filteringOperands":[
                                    {
                                        "condition": {"name":"in","isUnary":false,"iconName":"is-in","hidden":true},
                                        "fieldName":"City","ignoreCase":true,"searchVal":["Sofia"]
                                    }
                                    ],
                                    "operator":1,"fieldName":"City"
                            }],
                            "operator":0
                    }
                }
            ],
            "values": [
                { "member": "UnitsSold", "aggregate": { "key": "SUM", "label": "Sum" },
                 "enabled": true
                }
                ]
            }
        }`;

        // set filtering
        state.setState(stateToRestore, 'pivotConfiguration');
        fixture.detectChanges();

        const rowHeaders = fixture.debugElement.queryAll(
            By.directive(IgxPivotRowDimensionHeaderComponent));
        const rowDimensionHeaders = rowHeaders.map(x => x.componentInstance.column.header);
        expect(rowDimensionHeaders).toEqual(['Sofia']);
    });

    it('should successfully restore the IgxPivotDateDimension.', () => {
        const state = fixture.componentInstance.state;
        pivotGrid.pivotConfiguration.rows = [
            new IgxPivotDateDimension(
                {
                    memberName: 'Date',
                    enabled: true
                },
                {
                    months: true,
                    quarters: false,
                    years: true
                }
            )
        ];
        pivotGrid.pipeTrigger++;
        fixture.detectChanges();
        const stateString = state.getState(true, 'pivotConfiguration');
        state.setState(stateString, 'pivotConfiguration');
        fixture.detectChanges();

        const rows = pivotGrid.rowList.toArray();
        expect(rows.length).toBe(1);
        const expectedHeaders = ['All Periods'];
        const rowHeaders = fixture.debugElement.queryAll(
            By.directive(IgxPivotRowDimensionHeaderComponent));
        const rowDimensionHeaders = rowHeaders.map(x => x.componentInstance.column.header);
        expect(rowDimensionHeaders).toEqual(expectedHeaders);
    });

    it('should successfully restore the selected rows.', () => {
        pivotGrid.rowSelection = 'single';
        const state = fixture.componentInstance.state;
        expect(state).toBeDefined('IgxGridState directive is initialized');
        const headerRow = fixture.nativeElement.querySelector('igx-pivot-row-dimension-content');
        const header = headerRow.querySelector('igx-pivot-row-dimension-header');
        header.click();
        fixture.detectChanges();
        expect(pivotGrid.selectedRows.length).toBe(2);
        const jsonString = state.getState(true);
        // clear
        pivotGrid. selectionService.rowSelection.clear();
        expect(pivotGrid.selectedRows.length).toBe(0);
        // set old state
        state.setState(jsonString);
        fixture.detectChanges();
        expect(pivotGrid.selectedRows.length).toBe(2);
    });

    it('should allow setting back custom functions on init.', async() => {
        const state = fixture.componentInstance.state;
        const customFunc = () => 'All';
        pivotGrid.pivotConfiguration.rows = [
            {
                memberName: 'All',
                memberFunction: customFunc,
                enabled: true,
                childLevel: { memberName: "ProductCategory", enabled: true }
            }
        ];
        pivotGrid.pipeTrigger++;
        fixture.detectChanges();
        pivotGrid.dimensionInit.pipe(first()).subscribe((dim: IPivotDimension) => {
            if (dim.memberName === 'All') {
                dim.memberFunction = customFunc;
            }
        });
        const stateString = state.getState(true, 'pivotConfiguration');
        state.setState(stateString, 'pivotConfiguration');
        fixture.detectChanges();
        const rows = pivotGrid.rowList.toArray();
        expect(rows.length).toBe(1);
        const expectedHeaders = ['All'];
        const rowHeaders = fixture.debugElement.queryAll(
            By.directive(IgxPivotRowDimensionHeaderComponent));
        const rowDimensionHeaders = rowHeaders.map(x => x.componentInstance.column.header);
        expect(rowDimensionHeaders).toEqual(expectedHeaders);
    });

    it('should allow restoring noop strategies', () => {
        const noopInstance = NoopPivotDimensionsStrategy.instance();
        pivotGrid.pivotConfiguration.rowStrategy = noopInstance;
        pivotGrid.pivotConfiguration.columnStrategy = noopInstance;
        pivotGrid.data = [];
        const state = fixture.componentInstance.state;
        state.stateParsed.pipe(take(1)).subscribe(parsedState => {
            parsedState.pivotConfiguration.rowStrategy = noopInstance;
            parsedState.pivotConfiguration.columnStrategy = noopInstance;
        });
        const stateToRestore = `{ "pivotConfiguration" : {
            "columns": [
                { "memberName": "ProductCategory", "enabled": true }
            ],
            "rows": [
                { "memberName": "City", "enabled": true },
                { "memberName": "Country", "enabled": true }
            ],
            "values": [
                ]
            }
        }`;

        state.setState(stateToRestore, 'pivotConfiguration');
        fixture.detectChanges();
        fixture.detectChanges();
        expect(pivotGrid.pivotConfiguration.rowStrategy).toBe(noopInstance);
        expect(pivotGrid.pivotConfiguration.columnStrategy).toBe(noopInstance);
    });
});
