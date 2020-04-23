import { Component, OnInit, ViewChild, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { IgxGridComponent, FilteringExpressionsTree, FilteringLogic,
  IPagingState, ISortingExpression, IgxNumberSummaryOperand,
  IgxSummaryResult, IGroupingState, IGridState, IColumnState, IgxGridStateDirective, IgxHierarchicalGridComponent } from 'igniteui-angular';
import { employeesData } from './localData';
import { take } from 'rxjs/operators';
import { Router, NavigationStart } from '@angular/router';
import { HierarchicalGridSampleComponent } from '../hierarchical-grid/hierarchical-grid.sample';

class MySummary extends IgxNumberSummaryOperand {

  constructor() {
      super();
  }

  operate(data?: any[]): IgxSummaryResult[] {
      const result = super.operate(data);
      result.push({
          key: 'test',
          label: 'Test',
          summaryResult: data.filter(rec => rec > 10 && rec < 30).length
      });
      return result;
  }
}

@Component({
  selector: 'app-grid',
  styleUrls: ['./grid-state.component.scss'],
  templateUrl: './grid-state.component.html'
})

export class GridSaveStateComponent implements OnInit, AfterViewInit {
  public localData: any[];
  public localData2: any[];
  public columns: IColumnState[];
  public gridId = 'grid1';
  public stateKey = this.gridId + '-state';
  public stateKey2 = 'hgrid-state';
  public gridState: IGridState;
  public serialize = true;

  public options = {
    cellSelection: true,
    rowSelection: true,
    columnSelection: true,
    filtering: true,
    advancedFiltering: true,
    paging: true,
    sorting: true,
    groupBy: true,
    columns: true
  };

  private readonly newProperty = { static: true };

  @ViewChildren(IgxGridStateDirective) public state: QueryList<IgxGridStateDirective>;
  @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;
  @ViewChild('hGrid', { static: true }) hGrid: IgxHierarchicalGridComponent;

  public initialColumns: any[] = [
    // tslint:disable:max-line-length
    { field: 'FirstName', header: 'First Name', width: '150px', dataType: 'string', pinned: true, movable: true, sortable: true, filterable: true, summaries: MySummary},
    { field: 'LastName', header: 'Last Name', width: '150px', dataType: 'string', pinned: true, movable: true, sortable: true, filterable: true},
    { field: 'Country', header: 'Country', width: '140px', dataType: 'string', groupable: true, movable: true, sortable: true, filterable: true, resizable: true },
    { field: 'Age', header: 'Age', width: '110px', dataType: 'number', movable: true, sortable: true, filterable: true, hasSummary: true, summaries: MySummary, resizable: true},
    { field: 'RegistererDate', header: 'Registerer Date', width: '180px', dataType: 'date', movable: true, sortable: true, filterable: true, resizable: true },
    { field: 'IsActive', header: 'Is Active', width: '140px', dataType: 'boolean', groupable: true, movable: true, sortable: true, filterable: true }
    // tslint:enable:max-line-length
  ];

  public selectionMode = 'multiple';
  public selectionModes = [];

  constructor(private router: Router) {
    this.localData2 = this.generateDataUneven(100, 3);
    this.selectionModes = [
      { label: 'none', selected: this.selectionMode === 'none', togglable: true },
      { label: 'single', selected: this.selectionMode === 'single', togglable: true },
      { label: 'multiple', selected: this.selectionMode === 'multiple', togglable: true }
  ];
  }

  public ngOnInit() {
    this.localData = employeesData;
    this.columns = this.initialColumns;

    this.router.events.pipe(take(1)).subscribe((event: NavigationStart) => {
        this.saveGridState();
    });
  }

  public ngAfterViewInit() {
    // const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
    // const productFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, 'ProductName');
    // const productExpression = {
    //     condition: IgxStringFilteringOperand.instance().condition('contains'),
    //     fieldName: 'FirstName',
    //     ignoreCase: true,
    //     searchVal: 'c'
    // };
    // productFilteringExpressionsTree.filteringOperands.push(productExpression);
    // gridFilteringExpressionsTree.filteringOperands.push(productFilteringExpressionsTree);

    // this.grid.filteringExpressionsTree = gridFilteringExpressionsTree;
    // this.restoreGridState();

}

  public saveGridState() {
      const state = this.state.first.getState(this.serialize);
      const state2 = this.state.last.getState(this.serialize);
      // const state = this.state.getState(this.serialize, ['sorting', 'filtering']);
      if (typeof state === 'string') {
        window.localStorage.setItem(this.stateKey, state);
        window.localStorage.setItem(this.stateKey2, state2 as string);
      } else {
        window.localStorage.setItem(this.stateKey, JSON.stringify(state));
        window.localStorage.setItem(this.stateKey2, JSON.stringify(state2));
      }
  }

  public restoreGridState() {
      const state = window.localStorage.getItem(this.stateKey);
      const state2 = window.localStorage.getItem(this.stateKey2);
      if (state) {
        this.state.first.setState(state);
        this.state.last.setState(state2);
      }
  }

  public restoreColumns() {
    const state = this.getColumnsState(this.stateKey);
    const state2 = this.getColumnsState(this.stateKey2);
    if (state) {
      this.state.first.setState({ columns: state });
      this.state.last.setState({ columns: state2 });
    }
  }

  public getColumnsState(stateKey: string): any {
    let state = window.localStorage.getItem(stateKey);
    state =  state ? JSON.parse(state).columns : null;
    return state;
  }

  public restoreFiltering() {
    const state = window.localStorage.getItem(this.stateKey);
    const state2 = window.localStorage.getItem(this.stateKey2);
    const filteringState: FilteringExpressionsTree = state ? JSON.parse(state).filtering : null;
    const filteringState2: FilteringExpressionsTree = state2 ? JSON.parse(state2).filtering : null;
    if (filteringState) {
      const gridFilteringState: IGridState = { filtering: filteringState};
      const gridFilteringState2: IGridState = { filtering: filteringState2};
      this.state.first.setState(gridFilteringState);
      this.state.last.setState(gridFilteringState2);
    }
  }

  public restoreAdvancedFiltering() {
    // const state = window.localStorage.getItem(this.stateKey);
    // const advFilteringState: FilteringExpressionsTree = state ? JSON.parse(state).advancedFiltering : null;
    // if (advFilteringState) {
    //   const gridAdvancedFilteringState: IGridState = { advancedFiltering: advFilteringState};
    //   this.state.setState(gridAdvancedFilteringState);
    // }
  }

  public restoreSorting() {
    const state = window.localStorage.getItem(this.stateKey);
    const sortingState: ISortingExpression[] =  state ? JSON.parse(state).sorting : null;
    if (sortingState) {
      const gridSortingState: IGridState = { sorting: sortingState};
      this.state.first.setState(gridSortingState);
    }

    const state2 = window.localStorage.getItem(this.stateKey2);
    const sortingState2: ISortingExpression[] =  state2 ? JSON.parse(state2).sorting : null;
    if (sortingState2) {
      const gridSortingState2: IGridState = { sorting: sortingState2};
      this.state.last.setState(gridSortingState2);
    }
  }

  public restoreGroupby() {
    const state = window.localStorage.getItem(this.stateKey);
    const groupByState: IGroupingState = state ? JSON.parse(state).groupBy : null;
    if (groupByState) {
      const gridGroupByState: IGridState = { groupBy: groupByState };
      this.state.first.setState(gridGroupByState);
    }

    const state2 = window.localStorage.getItem(this.stateKey2);
    const groupByState2: IGroupingState = state2 ? JSON.parse(state2).groupBy : null;
    if (groupByState2) {
      const gridGroupByState2: IGridState = { groupBy: groupByState2 };
      this.state.last.setState(gridGroupByState2);
    }
  }

  public restoreRowSelection() {
    const state = window.localStorage.getItem(this.stateKey);
    const rowSelectionState = state ? JSON.parse(state).rowSelection : null;
    if (rowSelectionState) {
      const gridRowSelectionState: IGridState = { rowSelection: rowSelectionState };
      this.state.first.setState(gridRowSelectionState);
    }

    const state2 = window.localStorage.getItem(this.stateKey2);
    const rowSelectionState2 = state ? JSON.parse(state2).rowSelection : null;
    if (rowSelectionState2) {
      const gridRowSelectionState2: IGridState = { rowSelection: rowSelectionState2 };
      this.state.last.setState(gridRowSelectionState2);
    }
  }

  public restoreColumnSelection() {
    const state = window.localStorage.getItem(this.stateKey);
    const columnSelectionState = state ? JSON.parse(state).columnSelection : null;
    if (columnSelectionState) {
      const gridColumnSelectionState: IGridState = { columnSelection: columnSelectionState };
      this.state.first.setState(gridColumnSelectionState);
    }

    const state2 = window.localStorage.getItem(this.stateKey2);
    const columnSelectionState2 = state ? JSON.parse(state).columnSelection : null;
    if (columnSelectionState2) {
      const gridColumnSelectionState2: IGridState = { columnSelection: columnSelectionState2 };
      this.state.last.setState(gridColumnSelectionState2);
    }
  }

  public restoreCellSelection() {
    const state = window.localStorage.getItem(this.stateKey);
    const cellSelectionState = state ? JSON.parse(state).cellSelection : null;
    if (state) {
      const gridCellSelectionState: IGridState = { cellSelection: cellSelectionState };
      this.state.first.setState(gridCellSelectionState);
    }

    const state2 = window.localStorage.getItem(this.stateKey2);
    const cellSelectionState2 = state2 ? JSON.parse(state2).cellSelection : null;
    if (state2) {
      const gridCellSelectionState2: IGridState = { cellSelection: cellSelectionState2 };
      this.state.last.setState(gridCellSelectionState2);
    }
  }

  public restorePaging() {
    const state = window.localStorage.getItem(this.stateKey);
    const pagingState: IPagingState = state ? JSON.parse(state).paging : null;
    if (state) {
      const gridPagingState: IGridState = { paging: pagingState };
      this.state.first.setState(gridPagingState);
    }

    const state2 = window.localStorage.getItem(this.stateKey2);
    const pagingState2: IPagingState = state2 ? JSON.parse(state2).paging : null;
    if (state2) {
      const gridPagingState2: IGridState = { paging: pagingState2};
      this.state.last.setState(gridPagingState2);
    }
  }

  public resetGridState() {
    this.grid.filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
    this.grid.advancedFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
    this.grid.sortingExpressions = [];
    this.grid.groupingExpressions = [];
  }

  public onChange(event: any, action: string) {
    this.state.first.options[action] = event.checked;
  }

  public selectCellSelectionMode(args) {
    this.selectionMode = this.selectionModes[args.index].label;
}

  public clearStorage() {
    window.localStorage.removeItem(this.stateKey);
  }

  public reloadPage() {
      window.location.reload();
  }

  generateDataUneven(count: number, level: number, parendID: string = null) {
    const prods = [];
    const currLevel = level;
    let children;
    for (let i = 0; i < count; i++) {
        const rowID = parendID ? parendID + i : i.toString();
        if (level > 0) {
            // Have child grids for row with even id less rows by not multiplying by 2
            children = this.generateDataUneven(((i % 2) + 1) * Math.round(count / 3), currLevel - 1, rowID);
        }
        prods.push({
            ID: rowID,
            ChildLevels: currLevel,
            ProductName: 'Product: A' + i,
            Col1: i,
            Col2: i,
            Col3: i,
            childData: children,
            childData2: i % 2 ? [] : children,
            hasChild: true
        });
    }
    return prods;
}
}
