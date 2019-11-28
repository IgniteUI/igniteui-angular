import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IgxGridComponent, FilteringExpressionsTree, FilteringLogic,
  IPagingState, ISortingExpression, IgxNumberSummaryOperand,
  IgxSummaryResult, IGroupingState, IGridState, IColumnState, IgxGridStateDirective } from 'igniteui-angular';
import { employeesData } from './localData';
import { take } from 'rxjs/operators';
import { Router, NavigationStart } from '@angular/router';

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
  public columns: IColumnState[];
  public gridId = 'grid1';
  public stateKey = this.gridId + '-state';
  public gridState: IGridState;
  public serialize = true;

  public options = {
    cellSelection: true,
    rowSelection: true,
    filtering: true,
    advancedFiltering: true,
    paging: true,
    sorting: true,
    groupBy: true,
    columns: true
  };

  @ViewChild(IgxGridStateDirective, { static: true }) public state: IgxGridStateDirective;
  @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;

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
      const state = this.state.getState(this.serialize);
      // const state = this.state.getState(this.serialize, ['sorting', 'filtering']);
      if (typeof state === 'string') {
        window.localStorage.setItem(this.stateKey, state);
      } else {
        window.localStorage.setItem(this.stateKey, JSON.stringify(state));
      }
  }

  public restoreGridState() {
      const state = window.localStorage.getItem(this.stateKey);
      if (state) {
        this.state.setState(state);
      }
  }

  public restoreColumns() {
    const state = this.getColumnsState();
    if (state) {
      this.state.setState({ columns: state });
    }
  }

  public getColumnsState(): any {
    let state = window.localStorage.getItem(this.stateKey);
    state =  state ? JSON.parse(state).columns : null;
    return state;
  }

  public restoreFiltering() {
    const state = window.localStorage.getItem(this.stateKey);
    const filteringState: FilteringExpressionsTree = state ? JSON.parse(state).filtering : null;
    if (filteringState) {
      const gridFilteringState: IGridState = { filtering: filteringState};
      this.state.setState(gridFilteringState);
    }
  }

  public restoreAdvancedFiltering() {
    const state = window.localStorage.getItem(this.stateKey);
    const advFilteringState: FilteringExpressionsTree = state ? JSON.parse(state).advancedFiltering : null;
    if (advFilteringState) {
      const gridAdvancedFilteringState: IGridState = { advancedFiltering: advFilteringState};
      this.state.setState(gridAdvancedFilteringState);
    }
  }

  public restoreSorting() {
    const state = window.localStorage.getItem(this.stateKey);
    const sortingState: ISortingExpression[] =  state ? JSON.parse(state).sorting : null;
    if (sortingState) {
      const gridSortingState: IGridState = { sorting: sortingState};
      this.state.setState(gridSortingState);
    }
  }

  public restoreGroupby() {
    const state = window.localStorage.getItem(this.stateKey);
    const groupByState: IGroupingState = state ? JSON.parse(state).groupBy : null;
    if (groupByState) {
      const gridGroupByState: IGridState = { groupBy: groupByState };
      this.state.setState(gridGroupByState);
    }
  }

  public restoreRowSelection() {
    const state = window.localStorage.getItem(this.stateKey);
    const rowSelectionState = state ? JSON.parse(state).rowSelection : null;
    if (rowSelectionState) {
      const gridRowSelectionState: IGridState = { rowSelection: rowSelectionState };
      this.state.setState(gridRowSelectionState);
    }
  }

  public restoreCellSelection() {
    const state = window.localStorage.getItem(this.stateKey);
    const cellSelectionState = state ? JSON.parse(state).cellSelection : null;
    if (state) {
      const gridCellSelectionState: IGridState = { cellSelection: cellSelectionState };
      this.state.setState(gridCellSelectionState);
    }
  }

  public restorePaging() {
    const state = window.localStorage.getItem(this.stateKey);
    const pagingState: IPagingState = state ? JSON.parse(state).paging : null;
    if (state) {
      const gridPagingState: IGridState = { paging: pagingState };
      this.state.setState(gridPagingState);
    }
  }

  public resetGridState() {
    this.grid.filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
    this.grid.advancedFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
    this.grid.sortingExpressions = [];
    this.grid.groupingExpressions = [];
  }

  public onChange(event: any, action: string) {
    this.state.options[action] = event.checked;
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
}
