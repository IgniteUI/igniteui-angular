import { TestBed, async } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { IgxGridStateDirective, IGridState, IColumnState } from './state.directive';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IPagingState } from '../data-operations/paging-state.interface';
import { GridSelectionRange } from './selection/selection.service';
import { IGroupingState } from '../data-operations/groupby-state.interface';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxHierarchicalGridComponent } from './hierarchical-grid/hierarchical-grid.component';
import { IgxRowIslandComponent } from './hierarchical-grid/row-island.component';
import { IgxHierarchicalGridModule } from './hierarchical-grid/index';
import { FilteringLogic } from '../data-operations/filtering-expression.interface';
import { IgxStringFilteringOperand } from '../data-operations/filtering-condition';

// tslint:disable:max-line-length
describe('IgxHierarchicalGridState - input properties #grid', () => {
    configureTestSuite();
    beforeAll(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridTestBaseComponent, IgxHierarchicalGridTestExpandedBaseComponent
            ],
            imports: [ NoopAnimationsModule, IgxHierarchicalGridModule ]
        }).compileComponents();
    }));

    it('should initialize an igxGridState with default options object', () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        fix.componentInstance.data = [
            {ID: 0, ProductName: 'Product: A0'},
            {ID: 1, ProductName: 'Product: A1', childData: generateDataUneven(1, 1)},
            {ID: 2, ProductName: 'Product: A2', childData: generateDataUneven(1, 1)}
        ];
        fix.detectChanges();

        const defaultOptions = {
            columns: true,
            filtering: true,
            advancedFiltering: true,
            sorting: true,
            paging: true,
            cellSelection: true,
            rowSelection: true,
            columnSelection: true,
            expansion: true,
            inheritance: true
        };

        const state = fix.componentInstance.state;
        expect(state).toBeDefined('IgxGridState directive is initialized');
        expect(state.options).toEqual(jasmine.objectContaining(defaultOptions));
    });

    it('should initialize an igxGridState with correct options input', () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        fix.componentInstance.data = [
            {ID: 0, ProductName: 'Product: A0'},
            {ID: 1, ProductName: 'Product: A1', childData: generateDataUneven(1, 1)},
            {ID: 2, ProductName: 'Product: A2', childData: generateDataUneven(1, 1)}
        ];

        fix.detectChanges();

        const optionsInput = {
            columns: true,
            filtering: false,
            advancedFiltering: true,
            sorting: false,
            paging: true,
            cellSelection: true,
            rowSelection: true,
            columnSelection: true,
            expansion: true,
            inheritance: false
        };

        const state = fix.componentInstance.state;
        state.options = optionsInput;
        expect(state.options).toEqual(jasmine.objectContaining(optionsInput));
    });

    it('getState should return corect JSON string', () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        const initialGridState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ID","width":"150px","header":"ID","resizable":true,"searchable":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Product Name","resizable":true,"searchable":true}],"filtering":{"filteringOperands":[],"operator":0},"sorting":[],"cellSelection":[],"rowSelection":[],"columnSelection":[],"expansion":[],"rowIslands":[]}';
        fix.detectChanges();

        const state = fix.componentInstance.state;
        const gridState = state.getState();
        expect(gridState).toBe(initialGridState, 'JSON string representation of the initial grid state is not correct');
    });

    it('getState should return corect JSON string, when hGrid is initially expanded', () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridTestExpandedBaseComponent);
        const initialGridState = '{"columns":[{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"ID","width":"213px","header":"","resizable":false,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"213px","header":"","resizable":false,"searchable":true}],"filtering":{"filteringOperands":[],"operator":0},"sorting":[],"cellSelection":[],"rowSelection":[],"columnSelection":[],"expansion":[],"rowIslands":[{"id":"igx-row-island-childData","state":{"columns":[{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"ID","width":"136px","header":"","resizable":false,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"136px","header":"","resizable":false,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"Col1","width":"136px","header":"","resizable":false,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"Col2","width":"136px","header":"","resizable":false,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"movable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"Col3","width":"136px","header":"","resizable":false,"searchable":true}],"filtering":{"filteringOperands":[],"operator":0},"sorting":[],"cellSelection":[],"rowSelection":[],"columnSelection":[],"expansion":[],"rowIslands":[]}}]}';
        fix.detectChanges();

        const state = fix.componentInstance.state;
        const gridState = state.getState();
        expect(gridState).toBe(initialGridState, 'JSON string representation of the initial grid state is not correct');
    });

    it('getState should return corect IGridState object when using default options', () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.hgrid;
        const state = fix.componentInstance.state;

        const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        const productFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const productExpression = {
            condition: IgxStringFilteringOperand.instance().condition('contains'),
            fieldName: 'ProductName',
            ignoreCase: true,
            searchVal: 'A0'
        };
        productFilteringExpressionsTree.filteringOperands.push(productExpression);
        gridFilteringExpressionsTree.filteringOperands.push(productFilteringExpressionsTree);

        grid.filteringExpressionsTree = gridFilteringExpressionsTree;
        fix.detectChanges();

        const columns = fix.componentInstance.columns;
        const sorting = grid.sortingExpressions;
        const filtering = grid.filteringExpressionsTree;
        const advancedFiltering = grid.advancedFilteringExpressionsTree;

        const gridState = state.getState(false) as IGridState;
        HelperFunctions.verifyColumns(columns, gridState);
        HelperFunctions.verifySortingExpressions(sorting, gridState);
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
        HelperFunctions.verifyAdvancedFilteringExpressions(advancedFiltering, gridState);
    });

    it('getState should return corect IGridState object when options are not default', () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const grid = fix.componentInstance.hgrid;
        const filtering = grid.filteringExpressionsTree;
        const sorting = grid.sortingExpressions;

        const optionsInput = {
            filtering: false,
            advancedFiltering: true,
            sorting: false
        };

        state.options = optionsInput;

        let gridState = state.getState(false) as IGridState;
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
        HelperFunctions.verifySortingExpressions(sorting, gridState);

        gridState = state.getState(false, ['filtering', 'sorting']) as IGridState;
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
        HelperFunctions.verifySortingExpressions(sorting, gridState);
    });

    it('getState should return corect filtering state', () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridTestExpandedBaseComponent);
        fix.detectChanges();

        const grid  = fix.componentInstance.hgrid;
        const state = fix.componentInstance.state;
        const filtering = grid.filteringExpressionsTree;

        const rowIslandId = 'igx-row-island-childData';
        const emptyFiltering = '"filtering":{"filteringOperands":[],"operator":0}';
        const initialState = HelperFunctions.buildStateString(emptyFiltering, emptyFiltering, rowIslandId);

        let gridState = state.getState(true, ['filtering', 'inheritance']);
        expect(gridState).toBe(initialState);

        gridState = state.getState(false, ['filtering', 'inheritance']) as IGridState;
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
    });

    it('setState should correctly restore grid filtering state from string', () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridTestExpandedBaseComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.hgrid;
        const state = fix.componentInstance.state;

        const rowIslandId = 'igx-row-island-childData';
        const emptyFiltering = '"filtering":{"filteringOperands":[],"operator":0}';
        const initialState = HelperFunctions.buildStateString(emptyFiltering, emptyFiltering, rowIslandId);
        const filtering = '"filtering":{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"contains","isUnary":false,"iconName":"contains"},"fieldName":"ProductName","ignoreCase":true,"searchVal":"A0"}],"operator":0,"fieldName":"ProductName"}],"operator":0,"type":0}';
        const filteringState = HelperFunctions.buildStateString(filtering, filtering, rowIslandId);

        let gridState = state.getState(true, ['filtering', 'inheritance']);
        expect(gridState).toBe(initialState);

        state.setState(filteringState);
        gridState = state.getState(false, ['filtering', 'inheritance']) as IGridState;
        HelperFunctions.verifyFilteringExpressions(grid.filteringExpressionsTree, gridState);
        gridState = state.getState(true, ['filtering', 'inheritance']);
        expect(gridState).toBe(filteringState);
    });

    it('setState should correctly restore grid filtering state from object', () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridTestExpandedBaseComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.hgrid;
        const state = fix.componentInstance.state;

        const rowIslandId = 'igx-row-island-childData';
        const emptyFiltering = '"filtering":{"filteringOperands":[],"operator":0}';
        const emptyChildFiltering = '"filtering":{"filteringOperands":[],"operator":0,"type":0}';
        const initialState = HelperFunctions.buildStateString(emptyFiltering, emptyFiltering, rowIslandId);
        const filtering = '"filtering":{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"contains","isUnary":false,"iconName":"contains"},"fieldName":"ProductName","ignoreCase":true,"searchVal":"A0"}],"operator":0,"fieldName":"ProductName"}],"operator":0,"type":0}';
        const filteringState = HelperFunctions.buildStateString(filtering, emptyChildFiltering, rowIslandId);

        const filteringStateObject = JSON.parse(filteringState) as IGridState;
        let gridState = state.getState(true, ['filtering', 'inheritance']);
        expect(gridState).toBe(initialState);

        state.setState(filteringStateObject);
        gridState = state.getState(false, ['filtering', 'inheritance']) as IGridState;
        HelperFunctions.verifyFilteringExpressions(grid.filteringExpressionsTree, gridState);
        gridState = state.getState(true, ['filtering', 'inheritance']);
        expect(gridState).toBe(filteringState);
    });

    it('setState should correctly restore grid sorting state from string', () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridTestExpandedBaseComponent);
        fix.detectChanges();

        const grid  = fix.componentInstance.hgrid;
        const state = fix.componentInstance.state;

        const rowIslandId = 'igx-row-island-childData';
        const emptySorting = '"sorting":[]';
        const initialState = HelperFunctions.buildStateString(emptySorting, emptySorting, rowIslandId);
        const sorting = '"sorting":[{"fieldName":"ID","dir":2,"ignoreCase":true}]';
        const sortingState = HelperFunctions.buildStateString(sorting, sorting, rowIslandId);

        let gridState = state.getState(true, ['sorting', 'inheritance']);
        expect(gridState).toBe(initialState);

        state.setState(sortingState);
        gridState = state.getState(false, ['sorting', 'inheritance']) as IGridState;
        HelperFunctions.verifySortingExpressions(grid.sortingExpressions, gridState);
        gridState = state.getState(true, ['sorting', 'inheritance']);
        expect(gridState).toBe(sortingState);
    });

    it('setState should correctly restore grid sorting state from object', () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridTestExpandedBaseComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.hgrid;
        const state = fix.componentInstance.state;

        const rowIslandId = 'igx-row-island-childData';
        const emptySorting = '"sorting":[]';
        const initialState = HelperFunctions.buildStateString(emptySorting, emptySorting, rowIslandId);
        const sorting = '"sorting":[{"fieldName":"ID","dir":2,"ignoreCase":true}]';
        const sortingState = HelperFunctions.buildStateString(sorting, sorting, rowIslandId);
        const sortingStateObject = JSON.parse(sortingState) as IGridState;

        let gridState = state.getState(true, ['sorting', 'inheritance']);
        expect(gridState).toBe(initialState);

        state.setState(sortingStateObject);
        gridState = state.getState(false, ['sorting', 'inheritance']);
        HelperFunctions.verifySortingExpressions(grid.sortingExpressions, gridState as IGridState);
        gridState = state.getState(true, ['sorting', 'inheritance']);
        expect(gridState).toBe(sortingState);
    });

    it('setState should correctly restore grid paging state from string', () => {
        const fix = TestBed.createComponent(IgxHierarchicalGridTestExpandedBaseComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.hgrid;
        const state = fix.componentInstance.state;

        const rowIslandId = 'igx-row-island-childData';
        const initialPaging = '"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":4,"countRecords":20,"error":0}}';
        const initialChiildPaging = '"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":2,"countRecords":7,"error":0}}';
        const initialState = HelperFunctions.buildStateString(initialPaging, initialChiildPaging, rowIslandId);
        const paging = '"paging":{"index":0,"recordsPerPage":10,"metadata":{"countPages":2,"countRecords":20,"error":0}}';
        const childPaging = '"paging":{"index":0,"recordsPerPage":10,"metadata":{"countPages":1,"countRecords":7,"error":0}}';
        const pagingState = HelperFunctions.buildStateString(paging, childPaging, rowIslandId);

        let gridState = state.getState(true, ['paging', 'inheritance']);
        expect(gridState).toBe(initialState);

        state.setState(pagingState);
        gridState = state.getState(false, ['paging', 'inheritance']);
        HelperFunctions.verifyPaging(grid.pagingState, gridState as IGridState);
        gridState = state.getState(true, ['paging', 'inheritance']);
        expect(gridState).toBe(pagingState);
    });

    // fit('setState should correctly restore grid columns state from string', () => {
    //     const fix = TestBed.createComponent(IgxHierarchicalGridTestExpandedBaseComponent);
    //     fix.detectChanges();
    //     const state = fix.componentInstance.state;

    //     const rowIslandId = 'igx-row-island-childData';
    //     const columns = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}]}';
    //     const initialState = HelperFunctions.buildStateString(columns, rowIslandId);
    //     const newColumns = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"200px","header":"Prodyct Name","resizable":true,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}]}';
    //     const newColumnsState = HelperFunctions.buildStateString(newColumns, rowIslandId);

    //     // const columnsState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"200px","header":"Prodyct Name","resizable":true,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}]}';
    //     // const initialState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}]}';

    //     const columnsObject = JSON.parse(initialState).columns;

    //     let gridState = state.getState(true, 'columns');
    //     expect(gridState).toBe(initialState);

    //     state.setState(newColumnsState);
    //     gridState = state.getState(false, 'columns') as IGridState;
    //     HelperFunctions.verifyColumns(columnsObject, gridState);
    //     gridState = state.getState(true, 'columns');
    //     expect(gridState).toBe(newColumnsState);
    // });
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

    public static buildStateString(featureString: string, childFeatureString, rowIslandId: string): string {
        const state = `{${featureString},"rowIslands":[{"id":"${rowIslandId}","state":{${childFeatureString},"rowIslands":[]}}]}`;
        return state;
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #hGrid [data]="data" igxGridState
     [autoGenerate]="false" [height]="'400px'" [width]="width" #hierarchicalGrid>
     <igx-column *ngFor="let c of columns"
        [width]="c.width"
        [sortable]="c.sortable"
        [movable]="c.movable"
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
        <igx-row-island [key]="'childData'" [autoGenerate]="false" #rowIsland>
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-column field="Col1"></igx-column>
            <igx-column field="Col2"></igx-column>
            <igx-column field="Col3"></igx-column>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2 >
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridTestBaseComponent {
    public data;
    public width = '500px';
    public columns: any[] = [
        // tslint:disable:max-line-length
        { field: 'ID', header: 'ID', width: '150px', dataType: 'number', pinned: true, movable: true, sortable: true, filterable: true, groupable: false, hasSummary: false, hidden: false, maxWidth: '300px', searchable: false, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: 'testCss', headerGroupClasses: '', resizable: true },
        { field: 'ProductName', header: 'Product Name', width: '150px', dataType: 'string', pinned: false, movable: true, sortable: true, filterable: true, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: '', headerGroupClasses: '', resizable: true }
        // tslint:enable:max-line-length
      ];
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    @ViewChild(IgxGridStateDirective, { static: true })
    public state: IgxGridStateDirective;

    constructor() {
        // 3 level hierarchy
        this.data = generateDataUneven(20, 3);
    }
}

@Component({
    template: `
    <igx-hierarchical-grid #hGrid [data]="data" igxGridState [expandChildren]="true" [paging]="true" perPage="5"
     [autoGenerate]="false" [height]="'800px'" [width]="'800px'">
     <igx-column field="ID"></igx-column>
     <igx-column field="ProductName"></igx-column>
        <igx-row-island [key]="'childData'" [autoGenerate]="false" #rowIsland [paging]="true" perPage="5">
            <igx-column field="ID"></igx-column>
            <igx-column field="ProductName"></igx-column>
            <igx-column field="Col1"></igx-column>
            <igx-column field="Col2"></igx-column>
            <igx-column field="Col3"></igx-column>
            <igx-row-island [key]="'childData'" [autoGenerate]="true" #rowIsland2 [paging]="true" perPage="5">
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridTestExpandedBaseComponent {
    public data;
    public options = {
        filtering: false,
        advancedFiltering: true,
        sorting: false,
        groupBy: true
    };
    @ViewChild('hGrid', { read: IgxHierarchicalGridComponent, static: true }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent, static: true }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent, static: true }) public rowIsland2: IgxRowIslandComponent;
    @ViewChild(IgxGridStateDirective, { static: true }) public state: IgxGridStateDirective;

    constructor() {
        // 3 level hierarchy
        this.data = generateDataUneven(20, 3);
    }
}

export function generateDataUneven(count: number, level: number, parendID: string = null) {
    const prods = [];
    const currLevel = level;
    let children;
    for (let i = 0; i < count; i++) {
        const rowID = parendID ? parendID + i : i.toString();
        if (level > 0 ) {
           // Have child grids for row with even id less rows by not multiplying by 2
           children = generateDataUneven((i % 2 + 1) * Math.round(count / 3) , currLevel - 1, rowID);
        }
        prods.push({
            ID: rowID, ChildLevels: currLevel,  ProductName: 'Product: A' + i, 'Col1': i,
            'Col2': i, 'Col3': i, childData: children, childData2: children });
    }
    return prods;
}

