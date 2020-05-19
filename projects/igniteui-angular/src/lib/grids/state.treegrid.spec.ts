import { TestBed, async } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { SampleTestData } from '../test-utils/sample-test-data.spec';
import { IGridState, IColumnState, IgxGridStateDirective } from './state.directive';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IPagingState } from '../data-operations/paging-state.interface';
import { GridSelectionRange } from './selection/selection.service';
import { IgxNumberFilteringOperand } from '../data-operations/filtering-condition';
import { IGroupingState } from '../data-operations/groupby-state.interface';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { GridSelectionMode } from './common/enums';
import { configureTestSuite } from '../test-utils/configure-suite';
import { FilteringLogic } from '../data-operations/filtering-expression.interface';
import { IgxTreeGridComponent, IgxTreeGridModule } from './tree-grid';

describe('IgxGridState - input properties #grid', () => {
    configureTestSuite();
    let fix;
    let grid;
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTreeGridTreeDataTestComponent
            ],
            imports: [ NoopAnimationsModule, IgxTreeGridModule ]
        }).compileComponents();
    }));

    beforeEach(async(() => {
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
            inheritance: true,
            expansion: true
        };

        fix.detectChanges();

        const state = fix.componentInstance.state;

        expect(state).toBeDefined('IgxGridState directive is initialized');
        expect(state.options).toEqual(jasmine.objectContaining(defaultOptions));
    });

    it('getState should return corect JSON string', () => {
        // tslint:disable-next-line:max-line-length
        const initialGridState = '{"columns":[{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"207px","header":"","resizable":false,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"Name","width":"207px","header":"","resizable":false,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"HireDate","width":"207px","header":"","resizable":false,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"number","hasSummary":false,"field":"Age","width":"207px","header":"","resizable":false,"searchable":true}],"filtering":{"filteringOperands":[],"operator":0},"sorting":[],"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":4,"countRecords":18,"error":0}},"cellSelection":[],"rowSelection":[],"columnSelection":[],"expansion":[],"rowIslands":[]}';
        fix.detectChanges();

        const state = fix.componentInstance.state;

        const gridState = state.getState();
        expect(gridState).toBe(initialGridState, 'JSON string representation of the initial grid state is not correct');
    });

    it('getState should return corect IGridState object when using default options', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;

        const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        const productFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'Age');
        const productExpression = {
            condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
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
        const advancedFiltering = grid.advancedFilteringExpressionsTree;

        const gridState = state.getState(false) as IGridState;
        HelperFunctions.verifyPaging(paging, gridState);
        HelperFunctions.verifySortingExpressions(sorting, gridState);
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
        HelperFunctions.verifyAdvancedFilteringExpressions(advancedFiltering, gridState);
    });

    it('getState should return corect filtering state', () => {
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
        // tslint:disable-next-line:max-line-length
        const filteringState = '{"filtering":{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"greaterThan","isUnary":false,"iconName":"greater_than"},"searchVal":35,"fieldName":"Age","ignoreCase":true}],"operator":0,"fieldName":"Age"}],"operator":0,"type":0}}';
        const initialState = '{"filtering":{"filteringOperands":[],"operator":0}}';

        let gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(initialState);

        state.setState(filteringState);
        gridState = state.getState(false, 'filtering') as IGridState;
        HelperFunctions.verifyFilteringExpressions(grid.filteringExpressionsTree, gridState);
        gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(filteringState);
    });

    it('setState should correctly restore grid sorting state from string', () => {
        fix.detectChanges();
        const state = fix.componentInstance.state;
        // tslint:disable-next-line:max-line-length
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

    // it('setState should correctly restore grid columns state from string', () => {
    //     const fix = TestBed.createComponent(IgxGridStateComponent);
    //     fix.detectChanges();
    //     const state = fix.componentInstance.state;
    //     // tslint:disable:max-line-length
    //     const columnsState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"200px","header":"Prodyct Name","resizable":true,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}]}';
    //     const initialState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}]}';
    //     // tslint:enable:max-line-length
    //     const columns = JSON.parse(columnsState).columns;

    //     let gridState = state.getState(true, 'columns');
    //     expect(gridState).toBe(initialState);

    //     state.setState(columnsState);
    //     gridState = state.getState(false, 'columns') as IGridState;
    //     HelperFunctions.verifyColumns(columns, gridState);
    //     gridState = state.getState(true, 'columns');
    //     expect(gridState).toBe(columnsState);
    // });

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
        HelperFunctions.verifyRowSelection(grid.selectedRows(), gridState as IGridState);
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
        // tslint:disable-next-line:max-line-length
        const advFilteringState = '{"advancedFiltering":{"filteringOperands":[{"fieldName":"Age","condition":{"name":"greaterThan","isUnary":false,"iconName":"greater_than"},"searchVal":25,"ignoreCase":true},{"fieldName":"ID","condition":{"name":"greaterThan","isUnary":false,"iconName":"greater_than"},"searchVal":"3","ignoreCase":true}],"operator":0,"type":1}}';
        const initialState = '{}';

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
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" expansionDepth="2" width="900px" height="800px" igxGridState\
        [paging]="true" perPage="5" primaryKey="ID" rowSelection="multiple" cellSelection="multiple">
        <igx-column [field]="'ID'" dataType="number" [filterable]="true"></igx-column>
        <igx-column [field]="'Name'" dataType="string" [filterable]="true"></igx-column>
        <igx-column [field]="'HireDate'" dataType="date" [filterable]="true"></igx-column>
        <igx-column [field]="'Age'" dataType="number" [filterable]="true"></igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridTreeDataTestComponent {
    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
    @ViewChild(IgxGridStateDirective, { static: true }) public state: IgxGridStateDirective;
    public data = SampleTestData.employeeTreeData();
}
