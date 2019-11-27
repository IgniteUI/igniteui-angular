import { TestBed, async } from '@angular/core/testing';
import { IgxGridModule, IgxGridComponent } from './grid';
import { Component, ViewChild } from '@angular/core';
import { SampleTestData } from '../test-utils/sample-test-data.spec';
import { IgxGridStateDirective, IGridState, IColumnState } from './state.directive';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IPagingState } from '../data-operations/paging-state.interface';
import { GridSelectionRange } from './selection/selection.service';
import { FilteringLogic, DefaultSortingStrategy } from 'igniteui-angular';
import { IgxBooleanFilteringOperand } from '../data-operations/filtering-condition';
import { IGroupingState } from '../data-operations/groupby-state.interface';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { GridSelectionMode } from './common/enums';

describe('IgxGridState - input properties #grid', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxGridStateComponent,
                IgxGridStateWithOptionsComponent
            ],
            imports: [ NoopAnimationsModule, IgxGridModule ]
        }).compileComponents();
    }));

    it('should initialize an IgxGridState with default options object', () => {
        const defaultOptions = {
            columns: true,
            filtering: true,
            advancedFiltering: true,
            sorting: true,
            groupBy: true,
            paging: true,
            cellSelection: true,
            rowSelection: true
        };

        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();

        const state = fix.componentInstance.state;

        expect(state).toBeDefined('IgxGridState directive is initialized');
        expect(state.options).toEqual(jasmine.objectContaining(defaultOptions));
    });

    it('should initialize an IgxGridState with correct options input', () => {
        const optionsInput = {
            columns: true,
            filtering: false,
            advancedFiltering: true,
            sorting: false,
            groupBy: true,
            paging: true,
            cellSelection: true,
            rowSelection: true
        };

        const fix = TestBed.createComponent(IgxGridStateWithOptionsComponent);
        fix.detectChanges();

        const state = fix.componentInstance.state;
        expect(state.options).toEqual(jasmine.objectContaining(optionsInput));
    });

    it('getState should return corect JSON string', () => {
        // tslint:disable-next-line:max-line-length
        const initialGridState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}],"filtering":{"filteringOperands":[],"operator":0},"sorting":[],"groupBy":{"expressions":[],"expansion":[],"defaultExpanded":true},"paging":{"index":0,"recordsPerPage":15,"metadata":{"countPages":1,"countRecords":10,"error":0}},"cellSelection":[],"rowSelection":[]}';
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();

        const state = fix.componentInstance.state;

        const gridState = state.getState();
        expect(gridState).toBe(initialGridState, 'JSON string representation of the initial grid state is not correct');
    });

    it('getState should return corect IGridState object when using default options', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;

        const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
        const productFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
        const productExpression = {
            condition: IgxBooleanFilteringOperand.instance().condition('true'),
            fieldName: 'InStock',
            ignoreCase: true
        };
        productFilteringExpressionsTree.filteringOperands.push(productExpression);
        gridFilteringExpressionsTree.filteringOperands.push(productFilteringExpressionsTree);

        const groupingExpressions = [
            { dir: SortingDirection.Asc, fieldName: 'ProductID', ignoreCase: false,
              strategy: DefaultSortingStrategy.instance() },
            { dir: SortingDirection.Asc, fieldName: 'OrderDate', ignoreCase: false,
              strategy: DefaultSortingStrategy.instance() }
        ];

        grid.filteringExpressionsTree = gridFilteringExpressionsTree;
        grid.groupingExpressions = groupingExpressions;
        fix.detectChanges();

        const columns = fix.componentInstance.columns;
        const paging = grid.pagingState;
        const sorting = grid.sortingExpressions;
        const groupBy = grid.groupingExpressions;
        const groupByExpansion = grid.groupingExpansionState;
        const filtering = grid.filteringExpressionsTree;
        const advancedFiltering = grid.advancedFilteringExpressionsTree;

        const gridState = state.getState(false) as IGridState;
        HelperFunctions.verifyColumns(columns, gridState);
        HelperFunctions.verifyPaging(paging, gridState);
        HelperFunctions.verifySortingExpressions(sorting, gridState);
        HelperFunctions.verifyGroupingExpressions(groupBy, gridState);
        HelperFunctions.verifyGroupingExpansion(groupByExpansion, gridState.groupBy);
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
        HelperFunctions.verifyAdvancedFilteringExpressions(advancedFiltering, gridState);
    });

    it('getState should return corect IGridState object when options are not default', () => {
        const fix = TestBed.createComponent(IgxGridStateWithOptionsComponent);
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const grid = fix.componentInstance.grid;
        const pagingState = grid.pagingState;
        const filtering = grid.filteringExpressionsTree;
        const sorting = grid.sortingExpressions;

        let gridState = state.getState(false) as IGridState;
        expect(gridState.filtering).toBeFalsy();
        expect(gridState.sorting).toBeFalsy();
        HelperFunctions.verifyPaging(pagingState, gridState);

        gridState = state.getState(false, ['filtering', 'sorting', 'paging']) as IGridState;
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
        HelperFunctions.verifySortingExpressions(sorting, gridState);
        HelperFunctions.verifyPaging(pagingState, gridState);
    });

    it('getState should return corect filtering state', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();

        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const filtering = grid.filteringExpressionsTree;

        let gridState = state.getState(true, 'filtering');
        expect(gridState).toBe('{"filtering":{"filteringOperands":[],"operator":0}}', 'JSON string');

        gridState = state.getState(false, ['filtering']) as IGridState;
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
    });

    it('setState should correctly restore grid filtering state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        // tslint:disable-next-line:max-line-length
        const filteringState = '{"filtering":{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"true","isUnary":true,"iconName":"is_true"},"fieldName":"InStock","ignoreCase":true}],"operator":0,"fieldName":"InStock"}],"operator":0,"type":0}}';
        const initialState = '{"filtering":{"filteringOperands":[],"operator":0}}';

        let gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(initialState);

        state.setState(filteringState);
        gridState = state.getState(false, 'filtering') as IGridState;
        HelperFunctions.verifyFilteringExpressions(grid.filteringExpressionsTree, gridState);
        gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(filteringState);
    });

    it('setState should correctly restore grid filtering state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        // tslint:disable-next-line:max-line-length
        const filteringState = '{"filtering":{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"true","isUnary":true,"iconName":"is_true"},"fieldName":"InStock","ignoreCase":true}],"operator":0,"fieldName":"InStock"}],"operator":0,"type":0}}';
        const filteringStateObject = JSON.parse(filteringState) as IGridState;
        const initialState = '{"filtering":{"filteringOperands":[],"operator":0}}';

        let gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(initialState);

        state.setState(filteringStateObject);
        gridState = state.getState(false, 'filtering');
        HelperFunctions.verifyFilteringExpressions(grid.filteringExpressionsTree, gridState as IGridState);
        gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(filteringState);
    });

    it('setState should correctly restore grid sorting state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        // tslint:disable-next-line:max-line-length
        const sortingState = '{"sorting":[{"fieldName":"OrderDate","dir":1,"ignoreCase":true}]}';
        const initialState = '{"sorting":[]}';

        let gridState = state.getState(true, 'sorting');
        expect(gridState).toBe(initialState);

        state.setState(sortingState);
        gridState = state.getState(false, 'sorting') as IGridState;
        HelperFunctions.verifySortingExpressions(grid.sortingExpressions, gridState);
        gridState = state.getState(true, 'sorting');
        expect(gridState).toBe(sortingState);
    });

    it('setState should correctly restore grid sorting state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const sortingState = '{"sorting":[{"fieldName":"OrderDate","dir":1,"ignoreCase":true}]}';
        const sortingStateObject = JSON.parse(sortingState) as IGridState;
        const initialState = '{"sorting":[]}';

        let gridState = state.getState(true, 'sorting');
        expect(gridState).toBe(initialState);

        state.setState(sortingStateObject);
        gridState = state.getState(false, 'sorting');
        HelperFunctions.verifySortingExpressions(grid.sortingExpressions, gridState as IGridState);
        gridState = state.getState(true, 'sorting');
        expect(gridState).toBe(sortingState);
    });

    it('setState should correctly restore grid groupBy state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        // tslint:disable-next-line:max-line-length
        const groupingState = '{"groupBy":{"expressions":[{"dir":1,"fieldName":"ProductID","ignoreCase":false},{"dir":1,"fieldName":"OrderDate","ignoreCase":false}],"expansion":[],"defaultExpanded":true}}';
        const initialState = '{"groupBy":{"expressions":[],"expansion":[],"defaultExpanded":true}}';

        let gridState = state.getState(true, 'groupBy');
        expect(gridState).toBe(initialState);

        state.setState(groupingState);
        gridState = state.getState(false, 'groupBy') as IGridState;
        HelperFunctions.verifyGroupingExpressions(grid.groupingExpressions, gridState);
        gridState = state.getState(true, 'groupBy');
        expect(gridState).toBe(groupingState);
    });

    it('setState should correctly restore grid groupBy state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        // tslint:disable-next-line:max-line-length
        const groupingState = '{"groupBy":{"expressions":[{"dir":1,"fieldName":"ProductID","ignoreCase":false},{"dir":1,"fieldName":"OrderDate","ignoreCase":false}],"expansion":[],"defaultExpanded":true}}';
        const initialState = '{"groupBy":{"expressions":[],"expansion":[],"defaultExpanded":true}}';
        const groupingStateObject = JSON.parse(groupingState) as IGridState;

        let gridState = state.getState(true, 'groupBy');
        expect(gridState).toBe(initialState);

        state.setState(groupingStateObject);
        gridState = state.getState(false, 'groupBy');
        HelperFunctions.verifyGroupingExpressions(grid.groupingExpressions, gridState as IGridState);
        gridState = state.getState(true, 'groupBy');
        expect(gridState).toBe(groupingState);
    });

    it('setState should correctly restore grid columns state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const state = fix.componentInstance.state;
        // tslint:disable:max-line-length
        const columnsState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"200px","header":"Prodyct Name","resizable":true,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}]}';
        const initialState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}]}';
        // tslint:enable:max-line-length
        const columns = JSON.parse(columnsState).columns;

        let gridState = state.getState(true, 'columns');
        expect(gridState).toBe(initialState);

        state.setState(columnsState);
        gridState = state.getState(false, 'columns') as IGridState;
        HelperFunctions.verifyColumns(columns, gridState);
        gridState = state.getState(true, 'columns');
        expect(gridState).toBe(columnsState);
    });

    it('setState should correctly restore grid columns state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const state = fix.componentInstance.state;
        // tslint:disable:max-line-length
        const columnsState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"200px","header":"Prodyct Name","resizable":true,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}]}';
        const initialState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":true,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"movable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"movable":false,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true}]}';
        // tslint:enable:max-line-length
        const columnsStateObject = JSON.parse(columnsState);

        let gridState = state.getState(true, 'columns');
        expect(gridState).toBe(initialState);

        state.setState(columnsStateObject);
        gridState = state.getState(false, 'columns') as IGridState;
        HelperFunctions.verifyColumns(columnsStateObject.columns, gridState);
        gridState = state.getState(true, 'columns');
        expect(gridState).toBe(columnsState);
    });

    it('setState should correctly restore grid paging state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const pagingState = '{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":2,"countRecords":10,"error":0}}}';
        const initialState = '{"paging":{"index":0,"recordsPerPage":15,"metadata":{"countPages":1,"countRecords":10,"error":0}}}';

        let gridState = state.getState(true, 'paging');
        expect(gridState).toBe(initialState);

        state.setState(pagingState);
        gridState = state.getState(false, 'paging');
        HelperFunctions.verifyPaging(grid.pagingState, gridState as IGridState);
        gridState = state.getState(true, 'paging');
        expect(gridState).toBe(pagingState);
    });

    it('setState should correctly restore grid paging state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const pagingState = '{"paging":{"index":0,"recordsPerPage":5,"metadata":{"countPages":2,"countRecords":10,"error":0}}}';
        const pagingStateObject = JSON.parse(pagingState) as IGridState;
        const initialState = '{"paging":{"index":0,"recordsPerPage":15,"metadata":{"countPages":1,"countRecords":10,"error":0}}}';

        let gridState = state.getState(true, 'paging');
        expect(gridState).toBe(initialState);

        state.setState(pagingStateObject);
        gridState = state.getState(false, 'paging');
        HelperFunctions.verifyPaging(grid.pagingState, gridState as IGridState);
        gridState = state.getState(true, 'paging');
        expect(gridState).toBe(pagingState);
    });

    it('setState should correctly restore grid row selection state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
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

    it('setState should correctly restore grid row selection state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const rowSelectionState = '{"rowSelection":[1,3,5,6]}';
        const initialState = '{"rowSelection":[]}';
        const rowSelectionStateObject = JSON.parse(rowSelectionState);

        let gridState = state.getState(true, 'rowSelection');
        expect(gridState).toBe(initialState);

        state.setState(rowSelectionStateObject);
        gridState = state.getState(false, 'rowSelection');
        HelperFunctions.verifyRowSelection(grid.selectedRows(), gridState as IGridState);
        gridState = state.getState(true, 'rowSelection');
        expect(gridState).toBe(rowSelectionState);
    });

    it('setState should correctly restore grid cell selection state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
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

    it('setState should correctly restore grid cell selection state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        grid.rowSelection = GridSelectionMode.none;
        const state = fix.componentInstance.state;
        const cellSelectionState = '{"cellSelection":[{"rowStart":0,"rowEnd":2,"columnStart":1,"columnEnd":3}]}';
        const initialState = '{"cellSelection":[]}';
        const cellSelectionStateObject = JSON.parse(cellSelectionState);

        let gridState = state.getState(true, 'cellSelection');
        expect(gridState).toBe(initialState);

        state.setState(cellSelectionStateObject);
        gridState = state.getState(false, 'cellSelection');
        HelperFunctions.verifyCellSelection(grid.getSelectedRanges(), gridState as IGridState);
        gridState = state.getState(true, 'cellSelection');
        expect(gridState).toBe(cellSelectionState);
    });

    it('setState should correctly restore grid advanced filtering state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        // tslint:disable-next-line:max-line-length
        const advFilteringState = '{"advancedFiltering":{"filteringOperands":[{"fieldName":"InStock","condition":{"name":"true","isUnary":true,"iconName":"is_true"},"searchVal":null,"ignoreCase":true},{"fieldName":"ProductID","condition":{"name":"greaterThan","isUnary":false,"iconName":"greater_than"},"searchVal":"3","ignoreCase":true}],"operator":0,"type":1}}';
        const initialState = '{}';

        let gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(initialState);

        state.setState(advFilteringState);
        gridState = state.getState(false, 'advancedFiltering') as IGridState;
        HelperFunctions.verifyAdvancedFilteringExpressions(grid.advancedFilteringExpressionsTree, gridState);
        gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(advFilteringState);
    });

    it('setState should correctly restore grid advanced filtering state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        // tslint:disable-next-line:max-line-length
        const advFilteringState = '{"advancedFiltering":{"filteringOperands":[{"fieldName":"InStock","condition":{"name":"true","isUnary":true,"iconName":"is_true"},"searchVal":null,"ignoreCase":true},{"fieldName":"ProductID","condition":{"name":"greaterThan","isUnary":false,"iconName":"greater_than"},"searchVal":"3","ignoreCase":true}],"operator":0,"type":1}}';
        const initialState = '{}';
        const advFilteringStateObject = JSON.parse(advFilteringState);

        let gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(initialState);

        state.setState(advFilteringStateObject);
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
        <igx-grid #grid [data]="data" [paging]="true" [autoGenerate]="false" igxGridState rowSelection="multiple"
            cellSelection="multiple" primaryKey="ProductID">
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
        </igx-grid>
    `
})
export class IgxGridStateComponent {
    public data = SampleTestData.foodProductData();

    public columns: any[] = [
        // tslint:disable:max-line-length
        { field: 'ProductID', header: 'Product ID', width: '150px', dataType: 'number', pinned: true, movable: true, sortable: true, filterable: true, groupable: false, hasSummary: false, hidden: false, maxWidth: '300px', searchable: false, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: 'testCss', headerGroupClasses: '', resizable: true },
        { field: 'ProductName', header: 'Prodyct Name', width: '150px', dataType: 'string', pinned: false, movable: true, sortable: true, filterable: true, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: '', headerGroupClasses: '', resizable: true },
        { field: 'InStock', header: 'In Stock', width: '140px', dataType: 'boolean', pinned: false, movable: false, sortable: false, filterable: true, groupable: false, hasSummary: true, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: true, headerClasses: '', headerGroupClasses: '', resizable: true },
        { field: 'OrderDate', header: 'Date ordered', width: '110px', dataType: 'date', pinned: false, movable: false, sortable: true, filterable: false, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: true, headerClasses: '', headerGroupClasses: '', resizable: false },
        // tslint:enable:max-line-length
      ];

    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild(IgxGridStateDirective, { static: true })
    public state: IgxGridStateDirective;
}

@Component({
    template: `
        <igx-grid #grid [data]="data" [paging]="true" [autoGenerate]="true" [igxGridState]="options">
        </igx-grid>
    `
})
export class IgxGridStateWithOptionsComponent {
    public data = SampleTestData.foodProductData();
    public options = {
        filtering: false,
        advancedFiltering: true,
        sorting: false,
        groupBy: true
    };

    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild(IgxGridStateDirective, { static: true })
    public state: IgxGridStateDirective;
}
