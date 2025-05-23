import { TestBed, waitForAsync } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { SampleTestData } from '../test-utils/sample-test-data.spec';
import { IgxGridStateDirective } from './state.directive';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IPagingState } from '../data-operations/paging-state.interface';
import { IgxNumberFilteringOperand } from '../data-operations/filtering-condition';
import { IGroupingState } from '../data-operations/groupby-state.interface';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { GridSelectionMode } from './common/enums';
import { FilteringLogic } from '../data-operations/filtering-expression.interface';
import { IgxTreeGridComponent } from './tree-grid/public_api';
import { ISortingExpression } from '../data-operations/sorting-strategy';
import { GridSelectionRange } from './common/types';
import { IgxPaginatorComponent } from '../paginator/paginator.component';
import { IgxColumnComponent } from './public_api';
import { IColumnState, IGridState } from './state-base.directive';

describe('IgxTreeGridState - input properties #tGrid', () => {
    let fix;
    let grid;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, IgxTreeGridTreeDataTestComponent]
        }).compileComponents();
    }));

    beforeEach(waitForAsync(() => {
        fix = TestBed.createComponent(IgxTreeGridTreeDataTestComponent);
        fix.detectChanges();
        grid = fix.componentInstance.treeGrid;
    }));

    it('should initialize an IgxGridState with default options object', () => {
        const defaultOptions = {
            columns: true,
            filtering: true,
            advancedFiltering: true,
            sorting: true,
            paging: true,
            cellSelection: true,
            rowSelection: true,
            columnSelection: true,
            rowIslands: true,
            rowPinning: true,
            expansion: true,
            moving: true
        };

        fix.detectChanges();

        const state = fix.componentInstance.state;

        expect(state).toBeDefined('IgxGridState directive is initialized');
        expect(state.options).toEqual(jasmine.objectContaining(defaultOptions));
    });

    it('getState should return correct IGridState object when options are not default', () => {
        const options = {
            sorting: false,
            paging: false,
            moving: false
        };
        fix.detectChanges();
        const state = fix.componentInstance.state;
        state.options = options;
        fix.detectChanges();

        let gridState = state.getState(false) as IGridState;
        expect(gridState['sorting']).toBeFalsy();
        expect(gridState['groupBy']).toBeFalsy();
        expect(gridState['moving']).toBeFalsy();

        gridState = state.getState(false, ['filtering', 'sorting', 'groupBy']) as IGridState;
        expect(gridState['sorting']).toBeFalsy();
        expect(gridState['groupBy']).toBeFalsy();
        expect(gridState['moving']).toBeFalsy();
    });

    it('getState should return correct JSON string', () => {
        const initialGridState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"150px","header":"ID","resizable":true,"searchable":false,"selectable":true,"key":"ID","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"Name","width":"150px","header":"Name","resizable":true,"searchable":true,"selectable":true,"key":"Name","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"date","hasSummary":true,"field":"Hire Date","width":"140px","header":"Hire Date","resizable":true,"searchable":true,"selectable":true,"key":"Hire Date","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":true,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"Age","width":"110px","header":"Age","resizable":false,"searchable":true,"selectable":true,"key":"Age","columnGroup":false,"disableHiding":false,"disablePinning":false}],"filtering":{"filteringOperands":[],"operator":0},"advancedFiltering":{},"sorting":[],"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":4,"countRecords":18,"error":0}},"cellSelection":[],"rowSelection":[],"columnSelection":[],"rowPinning":[],"expansion":[],"moving":true,"rowIslands":[]}';
        fix.detectChanges();

        const state = fix.componentInstance.state;

        const gridState = state.getState();
        expect(gridState).toBe(initialGridState, 'JSON string representation of the initial grid state is not correct');
    });

    it('getState should return correct IGridState object when using default options', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;

        const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        const productFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'Age');
        const productExpression = {
            condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
            conditionName: 'greaterThan',
            fieldName: 'Age',
            ignoreCase: true,
            searchVal: 35
        };
        productFilteringExpressionsTree.filteringOperands.push(productExpression);
        gridFilteringExpressionsTree.filteringOperands.push(productFilteringExpressionsTree);
        grid.filteringExpressionsTree = gridFilteringExpressionsTree;
        fix.detectChanges();

        const paging = grid.pagingState;
        const sorting = grid.sortingExpressions;
        const filtering = grid.filteringExpressionsTree;

        const gridState = state.getState(false) as IGridState;
        HelperFunctions.verifyPaging(paging, gridState);
        HelperFunctions.verifySortingExpressions(sorting, gridState);
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
    });

    it('getState should return correct filtering state', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const filtering = grid.filteringExpressionsTree;

        let gridState = state.getState(true, 'filtering');
        expect(gridState).toBe('{"filtering":{"filteringOperands":[],"operator":0}}', 'JSON string');

        gridState = state.getState(false, ['filtering']) as IGridState;
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
    });

    it('setState should correctly restore grid filtering state from string', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const filteringState = '{"filtering":{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"greaterThan","isUnary":false,"iconName":"filter_greater_than"},"searchVal":35,"fieldName":"Age","ignoreCase":true,"conditionName":"greaterThan"}],"operator":0,"fieldName":"Age"}],"operator":0,"type":0}}';
        const initialState = '{"filtering":{"filteringOperands":[],"operator":0}}';

        let gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(initialState);

        state.setState(filteringState);
        gridState = state.getState(false, 'filtering') as IGridState;
        HelperFunctions.verifyFilteringExpressions(grid.filteringExpressionsTree, gridState);
        gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(filteringState);
    });

    it('getState should return correct moving state', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const moving = grid.moving;

        let gridState = state.getState(true, 'moving');
        expect(gridState).toBe('{"moving":true}', 'JSON string');

        gridState = state.getState(false, ['moving']) as IGridState;
        HelperFunctions.verifyMoving(moving, gridState);
    });

    it('setState should correctly restore grid moving state from string', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const movingState = '{"moving":false}';
        const initialState = '{"moving":true}';

        let gridState = state.getState(true, 'moving');
        expect(gridState).toBe(initialState);

        state.setState(movingState);
        gridState = state.getState(false, 'moving') as IGridState;
        HelperFunctions.verifyMoving(grid.moving, gridState);
        gridState = state.getState(true, 'moving');
        expect(gridState).toBe(movingState);
    });

    it('setState should correctly restore grid sorting state from string', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const sortingState = '{"sorting":[{"fieldName":"HireDate","dir":1,"ignoreCase":true}]}';
        const initialState = '{"sorting":[]}';

        let gridState = state.getState(true, 'sorting');
        expect(gridState).toBe(initialState);

        state.setState(sortingState);
        gridState = state.getState(false, 'sorting') as IGridState;
        HelperFunctions.verifySortingExpressions(grid.sortingExpressions, gridState);
        gridState = state.getState(true, 'sorting');
        expect(gridState).toBe(sortingState);
    });

    it('setState should correctly restore grid columns state from string', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const initialColumnsState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"150px","header":"ID","resizable":true,"searchable":false,"selectable":true,"key":"ID","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"Name","width":"150px","header":"Name","resizable":true,"searchable":true,"selectable":true,"key":"Name","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"date","hasSummary":true,"field":"Hire Date","width":"140px","header":"Hire Date","resizable":true,"searchable":true,"selectable":true,"key":"Hire Date","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":true,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"Age","width":"110px","header":"Age","resizable":false,"searchable":true,"selectable":true,"key":"Age","columnGroup":false,"disableHiding":false,"disablePinning":false}]}';
        const newColumnsState = '{"columns":[{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"150px","header":"ID","resizable":true,"searchable":false,"selectable":true,"key":"ID","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"Name","width":"150px","header":"Name","resizable":true,"searchable":true,"selectable":true,"key":"Name","columnGroup":false,"disableHiding":true,"disablePinning":false},{"pinned":false,"sortable":true,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"Age","width":"110px","header":"Age","resizable":false,"searchable":true,"selectable":true,"key":"Age","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"date","hasSummary":true,"field":"Hire Date","width":"140px","header":"Hire Date","resizable":true,"searchable":true,"selectable":true,"key":"Hire Date","columnGroup":false,"disableHiding":false,"disablePinning":false}]}';
        const columns = JSON.parse(newColumnsState).columns;

        let gridState = state.getState(true, 'columns');
        expect(gridState).toBe(initialColumnsState);

        state.setState(newColumnsState);
        gridState = state.getState(false, 'columns') as IGridState;
        HelperFunctions.verifyColumns(columns, gridState);
        gridState = state.getState(true, 'columns');
        expect(gridState).toBe(newColumnsState);
    });

    it('setState should correctly restore grid paging state from string', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const pagingState = '{"paging":{"index":0,"recordsPerPage":15,"metadata":{"countPages":2,"countRecords":18,"error":0}}}';
        const initialState = '{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":4,"countRecords":18,"error":0}}}';

        let gridState = state.getState(true, 'paging');
        expect(gridState).toBe(initialState);

        state.setState(pagingState);
        gridState = state.getState(false, 'paging');
        HelperFunctions.verifyPaging(grid.pagingState, gridState as IGridState);
        gridState = state.getState(true, 'paging');
        expect(gridState).toBe(pagingState);
    });

    it('setState should correctly restore grid row selection state from string', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const rowSelectionState = '{"rowSelection":[1,3,5,6]}';
        const initialState = '{"rowSelection":[]}';

        let gridState = state.getState(true, 'rowSelection');
        expect(gridState).toBe(initialState);

        state.setState(rowSelectionState);
        gridState = state.getState(false, 'rowSelection');
        HelperFunctions.verifyRowSelection(grid.selectedRows, gridState as IGridState);
        gridState = state.getState(true, 'rowSelection');
        expect(gridState).toBe(rowSelectionState);
    });

    it('setState should correctly restore grid cell selection state from string', () => {
        fix.detectChanges();
        grid.rowSelection = GridSelectionMode.none;
        const state = fix.componentInstance.state;
        const cellSelectionState = '{"cellSelection":[{"rowStart":0,"rowEnd":2,"columnStart":1,"columnEnd":3}]}';
        const initialState = '{"cellSelection":[]}';

        let gridState = state.getState(true, 'cellSelection');
        expect(gridState).toBe(initialState);

        state.setState(cellSelectionState);
        gridState = state.getState(false, 'cellSelection');
        HelperFunctions.verifyCellSelection(grid.getSelectedRanges(), gridState as IGridState);
        gridState = state.getState(true, 'cellSelection');
        expect(gridState).toBe(cellSelectionState);
    });

    it('setState should correctly restore grid advanced filtering state from string', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const advFilteringState = '{"advancedFiltering":{"filteringOperands":[{"fieldName":"Age","condition":{"name":"greaterThan","isUnary":false,"iconName":"filter_greater_than"},"searchVal":25,"ignoreCase":true,"conditionName":"greaterThan"},{"fieldName":"ID","condition":{"name":"greaterThan","isUnary":false,"iconName":"filter_greater_than"},"searchVal":"3","ignoreCase":true,"conditionName":"greaterThan"}],"operator":0,"type":1}}';
        const initialState = '{"advancedFiltering":{}}';

        let gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(initialState);

        state.setState(advFilteringState);
        gridState = state.getState(false, 'advancedFiltering') as IGridState;
        HelperFunctions.verifyAdvancedFilteringExpressions(grid.advancedFilteringExpressionsTree, gridState);
        gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(advFilteringState);
    });
});

class HelperFunctions {
    public static verifyColumns(columns: IColumnState[], gridState: IGridState) {
        columns.forEach((c, index) => {
            expect(gridState.columns[index]).toEqual(jasmine.objectContaining(c));
        });
    }

    public static verifySortingExpressions(sortingExpressions: ISortingExpression[], gridState: IGridState) {
        sortingExpressions.forEach((expr, i) => {
            expect(expr).toEqual(jasmine.objectContaining(gridState.sorting[i]));
        });
    }

    public static verifyGroupingExpressions(groupingExpressions: IGroupingExpression[], gridState: IGridState) {
        groupingExpressions.forEach((expr, i) => {
            expect(expr).toEqual(jasmine.objectContaining(gridState.groupBy.expressions[i]));
        });
    }

    public static verifyGroupingExpansion(groupingExpansion: IGroupByExpandState[], groupBy: IGroupingState) {
        groupingExpansion.forEach((exp, i) => {
            expect(exp).toEqual(jasmine.objectContaining(groupBy.expansion[i]));
        });
    }

    public static verifyFilteringExpressions(expressions: IFilteringExpressionsTree, gridState: IGridState) {
        expect(expressions.fieldName).toBe(gridState.filtering.fieldName, 'Filtering expression field name is not correct');
        expect(expressions.operator).toBe(gridState.filtering.operator, 'Filtering expression operator value is not correct');
        expressions.filteringOperands.forEach((expr, i) => {
            expect(expr).toEqual(jasmine.objectContaining(gridState.filtering.filteringOperands[i]));
        });
    }

    public static verifyAdvancedFilteringExpressions(expressions: IFilteringExpressionsTree, gridState: IGridState) {
        if (gridState.advancedFiltering) {
            expect(expressions.fieldName).toBe(gridState.advancedFiltering.fieldName, 'Filtering expression field name is not correct');
            expect(expressions.operator).toBe(gridState.advancedFiltering.operator, 'Filtering expression operator value is not correct');
            expressions.filteringOperands.forEach((expr, i) => {
                expect(expr).toEqual(jasmine.objectContaining(gridState.advancedFiltering.filteringOperands[i]));
            });
        } else {
            expect(expressions).toBeFalsy();
        }
    }

    public static verifyPaging(paging: IPagingState, gridState: IGridState) {
        expect(paging).toEqual(jasmine.objectContaining(gridState.paging));
    }

    public static verifyMoving(moving: boolean, gridState: IGridState){
        expect(moving).toEqual(gridState.moving);
    }

    public static verifyRowSelection(selectedRows: any[], gridState: IGridState) {
        gridState.rowSelection.forEach((s, index) => {
            expect(s).toBe(selectedRows[index]);
        });
    }

    public static verifyCellSelection(selectedCells: GridSelectionRange[], gridState: IGridState) {
        selectedCells.forEach((expr, i) => {
            expect(expr).toEqual(jasmine.objectContaining(gridState.cellSelection[i]));
        });
    }
}

@Component({
    template: `
    <igx-tree-grid [moving]="true" #treeGrid [data]="data" childDataKey="Employees" [expansionDepth]="2" width="900px" height="800px" igxGridState
        primaryKey="ID" rowSelection="multiple" cellSelection="multiple">

        @for (c of columns; track c.field) {
            <igx-column
                [width]="c.width"
                [sortable]="c.sortable"
                [editable]="c.editable"
                [sortingIgnoreCase]="c.sortingIgnoreCase"
                [filteringIgnoreCase]="c.sortingIgnoreCase"
                [maxWidth]="c.maxWidth"
                [hasSummary]="c.hasSummary"
                [filterable]="c.filterable"
                [searchable]="c.searchable"
                [resizable]="c.resizable"
                [headerClasses]="c.headerClasses"
                [headerGroupClasses]="c.headerGroupClasses"
                [groupable]="c.groupable"
                [field]="c.field"
                [header]="c.header"
                [dataType]="c.dataType"
                [pinned]="c.pinned"
                [hidden]="c.hidden">
            </igx-column>
        }
        <igx-paginator [perPage]="5"></igx-paginator>
    </igx-tree-grid>
    `,
    imports: [IgxTreeGridComponent, IgxColumnComponent, IgxPaginatorComponent, IgxGridStateDirective]
})
export class IgxTreeGridTreeDataTestComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    @ViewChild(IgxGridStateDirective, { static: true }) public state: IgxGridStateDirective;

    public columns: any[] = [
        { field: 'ID', header: 'ID', width: '150px', dataType: 'number', pinned: true, sortable: true, filterable: true, groupable: false, hasSummary: false, hidden: false, maxWidth: '300px', searchable: false, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: 'testCss', headerGroupClasses: '', resizable: true },
        { field: 'Name', header: 'Name', width: '150px', dataType: 'string', pinned: false, sortable: true, filterable: true, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: '', headerGroupClasses: '', resizable: true },
        { field: 'Hire Date', header: 'Hire Date', width: '140px', dataType: 'date', pinned: false, sortable: false, filterable: true, groupable: false, hasSummary: true, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: true, headerClasses: '', headerGroupClasses: '', resizable: true },
        { field: 'Age', header: 'Age', width: '110px', dataType: 'number', pinned: false, sortable: true, filterable: true, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: true, headerClasses: '', headerGroupClasses: '', resizable: false }
    ];
    public data = SampleTestData.employeeTreeData();
}
