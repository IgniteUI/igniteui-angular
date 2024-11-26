import { TestBed } from '@angular/core/testing';
import { IgxGridComponent } from './grid/public_api';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { SampleTestData } from '../test-utils/sample-test-data.spec';
import { IgxGridStateDirective } from './state.directive';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IPagingState } from '../data-operations/paging-state.interface';
import { IgxBooleanFilteringOperand } from '../data-operations/filtering-condition';
import { IGroupingState } from '../data-operations/groupby-state.interface';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { GridSelectionMode } from './common/enums';
import { configureTestSuite } from '../test-utils/configure-suite';
import { FilteringLogic } from '../data-operations/filtering-expression.interface';
import { DefaultSortingStrategy, ISortingExpression, SortingDirection } from '../data-operations/sorting-strategy';
import { GridSelectionRange } from './common/types';
import { CustomFilter } from '../test-utils/grid-samples.spec';
import { IgxPaginatorComponent } from '../paginator/paginator.component';
import { NgFor } from '@angular/common';
import { IgxColumnComponent, IgxColumnGroupComponent, IgxColumnLayoutComponent, IgxGridDetailTemplateDirective } from './public_api';
import { IColumnState, IGridState } from './state-base.directive';

describe('IgxGridState - input properties #grid', () => {
    configureTestSuite((() => {
        return TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxGridStateComponent,
                IgxGridStateWithOptionsComponent,
                IgxGridStateWithDetailsComponent
            ]
        });
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
            rowSelection: true,
            columnSelection: true,
            rowPinning: true,
            expansion: true,
            moving: true
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
            paging: true,
            cellSelection: true,
            rowSelection: true,
            columnSelection: true,
            rowPinning: true,
            expansion: true,
            groupBy: false,
            moving: false
        };

        const fix = TestBed.createComponent(IgxGridStateWithOptionsComponent);
        fix.detectChanges();

        const state = fix.componentInstance.state;
        expect(state.options).toEqual(jasmine.objectContaining(optionsInput));
    });

    it('getState should return correct JSON string', () => {
        const initialGridState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"key":"ProductID","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true,"selectable":false,"key":"ProductName","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true,"key":"InStock","columnGroup":false,"disableHiding":false,"disablePinning":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true,"key":"OrderDate","columnGroup":false,"disableHiding":false,"disablePinning":false}],"filtering":{"filteringOperands":[],"operator":0},"advancedFiltering":{},"sorting":[],"groupBy":{"expressions":[],"expansion":[],"defaultExpanded":true},"paging":{"index":0,"recordsPerPage":15,"metadata":{"countPages":1,"countRecords":10,"error":0}},"cellSelection":[],"rowSelection":[],"columnSelection":[],"rowPinning":[],"expansion":[],"moving":true}';
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
        const moving = grid.moving;
        const sorting = grid.sortingExpressions;
        const groupBy = grid.groupingExpressions;
        const groupByExpansion = grid.groupingExpansionState;
        const filtering = grid.filteringExpressionsTree;

        const gridState = state.getState(false) as IGridState;
        HelperFunctions.verifyColumns(columns, gridState);
        HelperFunctions.verifyPaging(paging, gridState);
        HelperFunctions.verifySortingExpressions(sorting, gridState);
        HelperFunctions.verifyGroupingExpressions(groupBy, gridState);
        HelperFunctions.verifyGroupingExpansion(groupByExpansion, gridState.groupBy);
        HelperFunctions.verifyFilteringExpressions(filtering, gridState);
        HelperFunctions.verifyMoving(moving, gridState);
    });

    it('getState should return corect IGridState object when options are not default', () => {
        const fix = TestBed.createComponent(IgxGridStateWithOptionsComponent);
        fix.detectChanges();
        const state = fix.componentInstance.state;

        let gridState = state.getState(false) as IGridState;
        expect(gridState['sorting']).toBeFalsy();
        expect(gridState['groupBy']).toBeFalsy();
        expect(gridState['moving']).toBeFalsy();

        gridState = state.getState(false, ['filtering', 'sorting', 'groupBy', 'moving']) as IGridState;
        expect(gridState['sorting']).toBeFalsy();
        expect(gridState['groupBy']).toBeFalsy();
        expect(gridState['groupBy']).toBeFalsy();
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
        const filteringState = '{"filtering":{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"true","isUnary":true,"iconName":"filter_true"},"fieldName":"InStock","ignoreCase":true}],"operator":0,"fieldName":"InStock"}],"operator":0,"type":0}}';
        const initialState = '{"filtering":{"filteringOperands":[],"operator":0}}';

        let gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(initialState);

        state.setState(filteringState);
        gridState = state.getState(false, 'filtering') as IGridState;
        HelperFunctions.verifyFilteringExpressions(grid.filteringExpressionsTree, gridState);
        gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(filteringState);
    });

    it('setState should correctly restore grid columns state from string containing a dateTime column', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        const lastDateCol = { field: 'LastDate', header: 'Last date', width: '110px', dataType: 'dateTime', pinned: false, sortable: true, filterable: false, groupable: true, hasSummary: false,
            hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: true, headerClasses: '', headerGroupClasses: '', resizable: false };
        fix.componentInstance.columns.push(lastDateCol);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        grid.getCellByColumn(0, 'LastDate').value = new Date('2021-06-05T23:59');
        fix.detectChanges();
        const state = fix.componentInstance.state;

        const filteringState = '{"filtering":{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"equals","isUnary":false,"iconName":"filter_equal"},"fieldName":"LastDate","ignoreCase":true,"searchVal":"2021-06-05T20:59:00.000Z"}],"operator":1,"fieldName":"LastDate"}],"operator":0,"type":0}}';
        const initialState = '{"filtering":{"filteringOperands":[],"operator":0}}';

        let gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(initialState);

        state.setState(filteringState);
        gridState = state.getState(false, 'filtering') as IGridState;
        HelperFunctions.verifyFilteringExpressions(grid.filteringExpressionsTree, gridState);
        gridState = state.getState(true, 'filtering');
        expect(gridState).toBe(filteringState);
    });

    it('setState should correctly restore grid filtering state from  with null date values', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        grid.getCellByColumn(0, 'OrderDate').value = null;
        fix.detectChanges();
        const state = fix.componentInstance.state;

        const filteringState = '{"filtering":{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"empty","isUnary":true,"iconName":"filter_empty"},"fieldName":"OrderDate","ignoreCase":true,"searchVal":null}],"operator":1,"fieldName":"OrderDate"}],"operator":0,"type":0}}';
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
        const filteringState = '{"filtering":{"filteringOperands":[{"filteringOperands":[{"condition":{"name":"true","isUnary":true,"iconName":"filter_true"},"fieldName":"InStock","ignoreCase":true}],"operator":0,"fieldName":"InStock"}],"operator":0,"type":0}}';
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

    it("setState should correctly restore grid filtering state for a condition with custom filtering operand", () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        grid.getColumnByName("ProductID").filters = CustomFilter.instance();
        fix.detectChanges();

        const state = fix.componentInstance.state;

        const initialState =
            '{"filtering":{"filteringOperands":[],"operator":0}}';
        const filteringState =
            '{"filtering":{"filteringOperands":[{"filteringOperands":[{"fieldName":"ProductID","condition":{"name":"custom","isUnary":false,"iconName":"custom"},"searchVal":"custom","ignoreCase":true}],"operator":1,"fieldName":"FirstName"}],"operator":0,"type":0}}';
        const filteringStateObject = JSON.parse(filteringState) as IGridState;

        let gridState = state.getState(true, "filtering");
        expect(gridState).toBe(initialState);

        state.setState(filteringStateObject);
        fix.detectChanges();

        gridState = state.getState(false, "filtering");
        HelperFunctions.verifyFilteringExpressions(
            grid.filteringExpressionsTree,
            gridState as IGridState
        );
        gridState = state.getState(true, "filtering");
        expect(gridState).toBe(filteringState);
    });

    it('setState should correctly restore grid sorting state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
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
        const columnsState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"selectable":true,"key":"ProductID","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true,"selectable":false,"key":"ProductName","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true,"selectable":true,"key":"InStock","columnGroup":false,"disableHiding":false,"disablePinning":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true,"selectable":true,"key":"OrderDate","columnGroup":false,"disableHiding":false,"disablePinning":false}]}';
        const initialState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"key":"ProductID","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true,"selectable":false,"key":"ProductName","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true,"key":"InStock","columnGroup":false,"disableHiding":false,"disablePinning":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true,"key":"OrderDate","columnGroup":false,"disableHiding":false,"disablePinning":false}]}';
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
        const grid = fix.componentInstance.grid;
        spyOn(grid.columnInit, 'emit').and.callThrough();
        const columnsState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"selectable":false,"key":"ProductID","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"200px","header":"Prodyct Name","resizable":true,"searchable":true,"selectable":true,"key":"ProductName","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true,"selectable":true,"key":"InStock","columnGroup":false,"disableHiding":false,"disablePinning":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true,"selectable":true,"key":"OrderDate","columnGroup":false,"disableHiding":false,"disablePinning":false}]}';
        const initialState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"key":"ProductID","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true,"selectable":false,"key":"ProductName","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true,"key":"InStock","columnGroup":false,"disableHiding":false,"disablePinning":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true,"key":"OrderDate","columnGroup":false,"disableHiding":false,"disablePinning":false}]}';
        const columnsStateObject = JSON.parse(columnsState);

        let gridState = state.getState(true, 'columns');
        expect(gridState).toBe(initialState);

        state.setState(columnsStateObject);
        gridState = state.getState(false, 'columns') as IGridState;
        HelperFunctions.verifyColumns(columnsStateObject.columns, gridState);
        gridState = state.getState(true, 'columns');
        expect(gridState).toBe(columnsState);
        expect(grid.columnInit.emit).toHaveBeenCalledTimes(columnsStateObject.columns.length);
    });

    it('setState should correctly restore grid columns state properties: collapsible and expanded', () => {
        const fix = TestBed.createComponent(CollapsibleColumnGroupTestComponent);
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const grid = fix.componentInstance.grid;
        const initialState = '{"columns":[{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"ID","width":"100px","header":"","resizable":false,"searchable":true,"selectable":true,"key":"ID","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"hidden":false,"dataType":"string","hasSummary":false,"width":"100px","header":"Address Information","resizable":false,"searchable":true,"selectable":true,"key":"Address_City","columnGroup":true,"disableHiding":false,"disablePinning":false,"collapsible":true,"expanded":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"hidden":true,"dataType":"string","hasSummary":false,"field":"City","width":"100px","header":"","resizable":false,"searchable":true,"selectable":true,"key":"City","parentKey":"Address_City","columnGroup":false,"disableHiding":false,"disablePinning":false,"visibleWhenCollapsed":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"Address","width":"100px","header":"","resizable":false,"searchable":true,"selectable":true,"key":"Address","parentKey":"Address_City","columnGroup":false,"disableHiding":false,"disablePinning":false,"visibleWhenCollapsed":false}]}';
        const newState = '{"columns":[{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"ID","width":"100px","header":"","resizable":false,"searchable":true,"selectable":true,"key":"ID","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"hidden":false,"dataType":"string","hasSummary":false,"width":"100px","header":"Address Information","resizable":false,"searchable":true,"selectable":true,"key":"Address_City","columnGroup":true,"disableHiding":false,"disablePinning":false,"collapsible":true,"expanded":false},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"hidden":true,"dataType":"string","hasSummary":false,"field":"City","width":"100px","header":"","resizable":false,"searchable":true,"selectable":true,"key":"City","parentKey":"Address_City","columnGroup":false,"disableHiding":false,"disablePinning":false,"visibleWhenCollapsed":true},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"Address","width":"100px","header":"","resizable":false,"searchable":true,"selectable":true,"key":"Address","parentKey":"Address_City","columnGroup":false,"disableHiding":false,"disablePinning":false,"visibleWhenCollapsed":false}]}';
        const columnsStateObject = JSON.parse(newState);
        let gridState = state.getState(true, 'columns');
        expect(gridState).toBe(initialState);
        // 1. initial state collapsible:true, expanded: true;
        // 2. new state collapsible:true, expanded: false after restoration

        state.setState(columnsStateObject); // set new state - resored state
        gridState = state.getState(false, 'columns') as IGridState;
        HelperFunctions.verifyColumns(columnsStateObject.columns, gridState);
        gridState = state.getState(true, 'columns');
        fix.detectChanges();
        expect(gridState).toBe(newState);

        const addressInfoGroup = grid.columns.find(c => c.header === "Address Information");
        expect(addressInfoGroup.collapsible).toBe(true);
        expect(addressInfoGroup.expanded).toBe(false);
    });

    it('setState should correctly restore grid columns with Column Groups and same headers', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const initialState = '{"columns":[{"pinned":true,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"number","hasSummary":false,"field":"ProductID","width":"150px","header":"Product ID","resizable":true,"searchable":false,"key":"ProductID","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductName","width":"150px","header":"Prodyct Name","resizable":true,"searchable":true,"selectable":false,"key":"ProductName","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":false,"filterable":true,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"boolean","hasSummary":true,"field":"InStock","width":"140px","header":"In Stock","resizable":true,"searchable":true,"key":"InStock","columnGroup":false,"disableHiding":false,"disablePinning":true},{"pinned":false,"sortable":true,"filterable":false,"editable":true,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"date","hasSummary":false,"field":"OrderDate","width":"110px","header":"Date ordered","resizable":false,"searchable":true,"key":"OrderDate","columnGroup":false,"disableHiding":false,"disablePinning":false}]}';
        const columnsState = '{"columns":[{"pinned":false,"sortable":false,"filterable":false,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"testCss","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"ProductID","width":"150px","header":"General Information","resizable":true,"searchable":true,"key":"ProductID","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":false,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":true,"hidden":false,"dataType":"string","hasSummary":false,"field":"","width":"398px","header":"General Information","resizable":false,"searchable":true,"selectable":true,"key":"ProductName_UnitsInStock","columnGroup":true,"disableHiding":false,"disablePinning":false,"collapsible":false,"expanded":true},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"boolean","hasSummary":false,"field":"ProductName","width":"199px","header":"","resizable":true,"searchable":true,"selectable":true,"key":"ProductName","parentKey":"ProductName_UnitsInStock","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","groupable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"UnitsInStock","width":"199px","header":"","resizable":true,"searchable":true,"selectable":true,"key":"UnitsInStock","parentKey":"ProductName_UnitsInStock","columnGroup":false,"disableHiding":false,"disablePinning":false},{"pinned":false,"sortable":true,"filterable":true,"editable":false,"sortingIgnoreCase":true,"filteringIgnoreCase":true,"headerClasses":"","headerGroupClasses":"","maxWidth":"300px","groupable":false,"hidden":false,"dataType":"string","hasSummary":false,"field":"InStock","width":"199px","header":"","resizable":true,"searchable":true,"selectable":true,"key":"InStock","columnGroup":false,"disableHiding":false,"disablePinning":true}]}';
        const columnsStateObject = JSON.parse(columnsState);
        let gridState = state.getState(true, 'columns');

        expect(gridState).toBe(initialState);
        expect(() => {
            state.setState(columnsStateObject);
        }).not.toThrow();

        gridState = state.getState(false, 'columns') as IGridState;
        HelperFunctions.verifyColumns(columnsStateObject.columns, gridState);
    });

    it('setState should reuse columns with matching keys and create new ones for the rest.', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const grid = fix.componentInstance.grid;
        const originalColumns = [...grid.columns];
        originalColumns.forEach(x => x.bodyTemplate = fix.componentInstance.template);
        expect(originalColumns.length).toEqual(fix.componentInstance.columns.length);

        const gridState = state.getState(false, 'columns') as IGridState;

        gridState.columns.push({
            field: "AnotherColumn",
            columnGroup: false,
            dataType: 'boolean',
            editable: true,
            header: "CustomHeader",
            key: "AnotherColumn",
            disableHiding: false,
            disablePinning: false,
            filterable: true,
            sortable: true,
            groupable: true,
            width: "100px",
            hidden: false,
            hasSummary: false,
            filteringIgnoreCase: true,
            expanded: false,
            collapsible: false,
            sortingIgnoreCase: true,
            searchable: true,
            resizable: true,
            visibleWhenCollapsed: undefined,
            pinned: false,
            parentKey: undefined,
            maxWidth: undefined,
            headerClasses: undefined,
            headerGroupClasses: undefined
        });

        state.setState(gridState);
        fix.detectChanges();

        expect(grid.columns.length).toEqual(gridState.columns.length);

        // all original columns are the same object refs and retain their template
        originalColumns.forEach(x => {
            expect(grid.columns.indexOf(x)).not.toBe(-1);
            expect(x.bodyTemplate).toBe(fix.componentInstance.template);
        });
        expect(grid.columns[grid.columns.length - 1 ].field).toBe("AnotherColumn");
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
        state.setState('{"rowSelection":[2]}');
        state.setState(rowSelectionState);
        gridState = state.getState(false, 'rowSelection');
        HelperFunctions.verifyRowSelection(grid.selectedRows, gridState as IGridState);
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
        HelperFunctions.verifyRowSelection(grid.selectedRows, gridState as IGridState);
        gridState = state.getState(true, 'rowSelection');
        expect(gridState).toBe(rowSelectionState);
    });

    it('setState should correctly restore grid row pinning state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        grid.primaryKey = 'ProductID';
        fix.detectChanges();
        const state = fix.componentInstance.state;
        const rowPinState = '{"rowPinning":[1,3]}';
        const initialState = '{"rowPinning":[]}';
        const rowPinStateObject = JSON.parse(rowPinState);

        let gridState = state.getState(true, 'rowPinning');
        expect(gridState).toBe(initialState);

        state.setState(rowPinStateObject);
        fix.detectChanges();

        expect(grid.pinnedRows.length).toBe(2);
        expect(grid.pinnedRows[0].key).toBe(1);
        expect(grid.pinnedRows[1].key).toBe(3);
        gridState = state.getState(true, 'rowPinning');
        expect(gridState).toBe(rowPinState);

        grid.getRowByIndex(3).pin();
        fix.detectChanges();

        state.setState(rowPinStateObject);
        fix.detectChanges();

        expect(grid.pinnedRows.length).toBe(2);
        expect(grid.pinnedRows[0].key).toBe(1);
        expect(grid.pinnedRows[1].key).toBe(3);
    });

    it('setState should correctly restore grid moving state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;

        const movingState = '{"moving":false}';
        const initialState = '{"moving":true}';

        let gridState = state.getState(true, 'moving');
        expect(gridState).toBe(initialState);

        state.setState(movingState);
        expect(grid.moving).toBeFalsy();
        gridState = state.getState(true, 'moving');
        expect(gridState).toBe(movingState);

    });

    it('setState should correctly restore grid moving state from object', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;
        const movingState = '{"moving":false}';
        const initialState = '{"moving":true}';
        const movingStateObject = JSON.parse(movingState);

        let gridState = state.getState(true, 'moving');
        expect(gridState).toBe(initialState);

        state.setState(movingStateObject);
        fix.detectChanges();

        expect(grid.moving).toBeFalsy();
        gridState = state.getState(true, 'moving');
        expect(gridState).toBe(movingState);

        grid.moving = true;
        fix.detectChanges();

        state.setState(movingStateObject);
        fix.detectChanges();

        expect(grid.moving).toBeFalsy();
        gridState = state.getState(true, 'moving');
        expect(gridState).toBe(movingState);
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
        const advFilteringState = '{"advancedFiltering":{"filteringOperands":[{"fieldName":"InStock","condition":{"name":"true","isUnary":true,"iconName":"filter_true"},"searchVal":null,"ignoreCase":true},{"fieldName":"ProductID","condition":{"name":"greaterThan","isUnary":false,"iconName":"filter_greater_than"},"searchVal":"3","ignoreCase":true}],"operator":0,"type":1}}';
        const initialState = '{"advancedFiltering":{}}';

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
        const advFilteringState = '{"advancedFiltering":{"filteringOperands":[{"fieldName":"InStock","condition":{"name":"true","isUnary":true,"iconName":"filter_true"},"searchVal":null,"ignoreCase":true},{"fieldName":"ProductID","condition":{"name":"greaterThan","isUnary":false,"iconName":"filter_greater_than"},"searchVal":"3","ignoreCase":true}],"operator":0,"type":1}}';
        const initialState = '{"advancedFiltering":{}}';
        const advFilteringStateObject = JSON.parse(advFilteringState);

        let gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(initialState);

        state.setState(advFilteringStateObject);
        gridState = state.getState(false, 'advancedFiltering') as IGridState;
        HelperFunctions.verifyAdvancedFilteringExpressions(grid.advancedFilteringExpressionsTree, gridState);
        gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(advFilteringState);
    });

    it('setState should correctly restore grid advanced filtering state when there is a custom filtering operand', () => {
        const fix = TestBed.createComponent(IgxGridStateComponent);
        fix.detectChanges();
        const grid = fix.componentInstance.grid;
        grid.getColumnByName("ProductID").filters = CustomFilter.instance();
        fix.detectChanges();

        const state = fix.componentInstance.state;
        const advFilteringState = '{"advancedFiltering":{"filteringOperands":[{"fieldName":"ProductID","condition":{"name":"custom","isUnary":false,"iconName":"custom"},"ignoreCase":true,"searchVal":"custom"}],"operator":0,"type":1}}';
        const initialState = '{"advancedFiltering":{}}';

        let gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(initialState);

        state.setState(advFilteringState);
        gridState = state.getState(false, 'advancedFiltering') as IGridState;
        HelperFunctions.verifyAdvancedFilteringExpressions(grid.advancedFilteringExpressionsTree, gridState);
        gridState = state.getState(true, 'advancedFiltering');
        expect(gridState).toBe(advFilteringState);
    });

    it('should correctly restore expansion state from string', () => {
        const fix = TestBed.createComponent(IgxGridStateWithDetailsComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;

        const expansionState = '{"expansion":[[1,true],[2,true],[3,true]]}';
        const initialState = '{"expansion":[]}';

        let gridState = state.getState(true, 'expansion');
        expect(gridState).toBe(initialState);

        state.setState(expansionState);
        fix.detectChanges();
        gridState = state.getState(false, 'expansion');
        HelperFunctions.verifyExpansionStates(grid.expansionStates, gridState as IGridState);
        gridState = state.getState(true, 'expansion');
        expect(gridState).toBe(expansionState);
    });

    it('should correctly restore mrl column states.', () => {
        const fix = TestBed.createComponent(IgxGridMRLStateComponent);
        fix.detectChanges();
        const grid  = fix.componentInstance.grid;
        const state = fix.componentInstance.state;

        const gridColumnState = state.getState(false, 'columns') as IGridState;
        const group1 = gridColumnState.columns.find(x => x.field === 'group1');
        expect(group1.columnLayout).toBeTrue();

        const prodId = gridColumnState.columns.find(x => x.field === 'ProductID');
        expect(prodId.columnLayout).toBeFalsy();
        expect(prodId.rowStart).toBe(1);
        expect(prodId.rowEnd).toBe(4);
        expect(prodId.colStart).toBe(1);
        expect(prodId.colEnd).toBe(1);

        // apply change
        group1.pinned = true;
        prodId.pinned = true;

        state.setState(gridColumnState, 'columns');
        fix.detectChanges();

        const group1Column = grid.getColumnByName("group1");
        const prodIdColumn = grid.getColumnByName("ProductID");
        expect(group1Column.columnLayout).toBeTrue();
        expect(group1Column.pinned).toBeTrue();
        expect(prodIdColumn.pinned).toBeTrue();
        expect(prodIdColumn.columnLayoutChild).toBeTrue();
        expect(prodIdColumn.parent).toBe(group1Column);
        expect(prodIdColumn.rowStart).toBe(1);
        expect(prodIdColumn.rowEnd).toBe(4);
        expect(prodIdColumn.colStart).toBe(1);
        expect(prodIdColumn.colEnd).toBe(1);
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

    public static verifyExpansionStates(expansion: Map<any, boolean>, gridState: IGridState) {
        const gridExpansion = new Map<any, boolean>(gridState.expansion);
        expansion.forEach((value, key) => {
            expect(value).toBe(gridExpansion.get(key));
        });
    }
}

@Component({
    template: `
        <igx-grid #grid [data]="data" [autoGenerate]="false" [moving]="true" igxGridState rowSelection="multiple"
            cellSelection="multiple" primaryKey="ProductID">
            <igx-column *ngFor="let c of columns"
                [width]="c.width"
                [sortable]="c.sortable"
                [editable]="c.editable"
                [sortingIgnoreCase]="c.sortingIgnoreCase"
                [filteringIgnoreCase]="c.sortingIgnoreCase"
                [maxWidth]="c.maxWidth"
                [hasSummary]="c.hasSummary"
                [filterable]="c.filterable"
                [searchable]="c.searchable"
                [selectable]="c.selectable"
                [resizable]="c.resizable"
                [headerClasses]="c.headerClasses"
                [headerGroupClasses]="c.headerGroupClasses"
                [groupable]="c.groupable"
                [field]="c.field"
                [header]="c.header"
                [dataType]="c.dataType"
                [pinned]="c.pinned"
                [hidden]="c.hidden"
                [disablePinning]="c.disablePinning">
            </igx-column>
            <igx-paginator></igx-paginator>
        </igx-grid>
        <ng-template #bodyTemplate let-cell>
            <span>Custom Content: {{cell.value}}</span>
        </ng-template>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent, IgxGridStateDirective, NgFor]
})
export class IgxGridStateComponent {
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild('bodyTemplate', { read: TemplateRef, static: true })
    public template: TemplateRef<any>;

    @ViewChild(IgxGridStateDirective, { static: true })
    public state: IgxGridStateDirective;

    public data = SampleTestData.foodProductData();

    public columns: any[] = [
        { field: 'ProductID', header: 'Product ID', width: '150px', dataType: 'number', pinned: true, sortable: true, filterable: true, groupable: false, hasSummary: false, hidden: false, maxWidth: '300px', searchable: false, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: 'testCss', headerGroupClasses: '', resizable: true, disablePinning: false },
        { field: 'ProductName', header: 'Prodyct Name', width: '150px', dataType: 'string', pinned: false, selectable: false, sortable: true, filterable: true, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: false, headerClasses: '', headerGroupClasses: '', resizable: true, disablePinning: false },
        { field: 'InStock', header: 'In Stock', width: '140px', dataType: 'boolean', pinned: false, sortable: false, filterable: true, groupable: false, hasSummary: true, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: true, headerClasses: '', headerGroupClasses: '', resizable: true, disablePinning: true },
        { field: 'OrderDate', header: 'Date ordered', width: '110px', dataType: 'date', pinned: false, sortable: true, filterable: false, groupable: true, hasSummary: false, hidden: false, maxWidth: '300px', searchable: true, sortingIgnoreCase: true, filteringIgnoreCase: true, editable: true, headerClasses: '', headerGroupClasses: '', resizable: false, disablePinning: false },
      ];
}

@Component({
    template: `
        <igx-grid #grid [data]="data" [autoGenerate]="true" [igxGridState]="options">
            <igx-paginator></igx-paginator>
        </igx-grid>
    `,
    imports: [IgxGridComponent, IgxPaginatorComponent, IgxGridStateDirective]
})
export class IgxGridStateWithOptionsComponent {
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild(IgxGridStateDirective, { static: true })
    public state: IgxGridStateDirective;

    public data = SampleTestData.foodProductData();
    public options = {
        filtering: false,
        advancedFiltering: true,
        sorting: false,
        groupBy: false,
        moving: false
    };
}

@Component({
    template: `
        <igx-grid #grid [data]="data" [autoGenerate]="true" igxGridState primaryKey="ProductID">
            <!-- Grid Detail View Template -->
            <ng-template igxGridDetail let-dataItem>
                <span>Detail view</span>
            </ng-template>
            <igx-paginator></igx-paginator>
        </igx-grid>
    `,
    imports: [IgxGridComponent, IgxGridStateDirective, IgxGridDetailTemplateDirective, IgxPaginatorComponent]
})
export class IgxGridStateWithDetailsComponent {
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild(IgxGridStateDirective, { static: true })
    public state: IgxGridStateDirective;

    public data = SampleTestData.foodProductData();
}

@Component({
    template: `
    <igx-grid #grid [data]="data" igxGridState height="500px" width="1300px" columnWidth="100px">
        <igx-column field="ID"></igx-column>
        <igx-column-group header="Address Information" [collapsible]="true">
                    <igx-column field="City" [visibleWhenCollapsed]="true"></igx-column>
                    <igx-column field="Address" [visibleWhenCollapsed]="false"></igx-column>
                </igx-column-group>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxColumnGroupComponent, IgxGridStateDirective, NgFor]
})
export class CollapsibleColumnGroupTestComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    @ViewChild(IgxGridStateDirective, { static: true })
    public state: IgxGridStateDirective;
    public data = SampleTestData.contactInfoDataFull();
}

@Component({
    template: `
        <igx-grid #grid [data]="data" igxGridState primaryKey="ProductID">
            <igx-column-layout field='group1'>
                    <igx-column [groupable]="true" [rowStart]="1" [colStart]="1" [colEnd]="1" [rowEnd]="4" field="ProductID" [width]="'200px'" [resizable]="true">
                    </igx-column>
                </igx-column-layout>
                <igx-column-layout field='group2'>
                    <igx-column [rowStart]="1" [colStart]="1" [colEnd]="3" field="ProductName" [width]="'300px'" [resizable]="true">
                    </igx-column>
                    <igx-column [rowStart]="2" [colStart]="1" field="InStock" [width]="'300px'" [resizable]="true">
                    </igx-column>
                    <igx-column [rowStart]="2" [colStart]="2" field="UnitsInStock" [width]="'400px'" [resizable]="true">
                    </igx-column>
                    <igx-column [rowStart]="3" [colStart]="1" [colEnd]="3" field="OrderDate" [width]="'300px'" [resizable]="true">
                    </igx-column>
                </igx-column-layout>
        </igx-grid>
    `,
    imports: [IgxGridComponent, IgxGridStateDirective, IgxColumnComponent, IgxColumnLayoutComponent]
})
export class IgxGridMRLStateComponent {
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild(IgxGridStateDirective, { static: true })
    public state: IgxGridStateDirective;

    public data = SampleTestData.foodProductData();
}
