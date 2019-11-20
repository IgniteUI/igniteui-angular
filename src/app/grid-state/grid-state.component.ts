import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IgxGridComponent, FilteringExpressionsTree, FilteringLogic,
  IPagingState, IGroupingExpression, ISortingExpression } from 'igniteui-angular';
import { employeesData } from './localData';
import { take } from 'rxjs/operators';
import { NavigationStart, Router } from '@angular/router';
import { IgxGridStateDirective, IGridState } from 'projects/igniteui-angular/src/lib/grids/state.directive';

interface IColumnState {
    field: string;
    header: string;
    width?: string;
    groupable?: boolean;
    dataType?: string;
    pinned?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    movable?: true;
    hidden?: boolean;
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
    groupby: true,
    columns: true
  };

  @ViewChild(IgxGridStateDirective, { static: true }) public state: IgxGridStateDirective;
  @ViewChild(IgxGridComponent, { static: true }) public grid: IgxGridComponent;

  public initialColumns: IColumnState[] = [
    // tslint:disable:max-line-length
    { field: 'FirstName', header: 'First Name', width: '150px', dataType: 'string', pinned: true, movable: true, sortable: true, filterable: true},
    { field: 'LastName', header: 'Last Name', width: '150px', dataType: 'string', pinned: true, movable: true, sortable: true, filterable: true },
    { field: 'Country', header: 'Country', width: '140px', dataType: 'string', groupable: true, movable: true, sortable: true, filterable: true },
    { field: 'Age', header: 'Age', width: '110px', dataType: 'number', movable: true, sortable: true, filterable: true},
    { field: 'RegistererDate', header: 'Registerer Date', width: '180px', dataType: 'date', movable: true, sortable: true, filterable: true },
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
    state = JSON.parse(state)['columns'];
    return state;
  }

  public restoreFiltering() {
    const state = window.localStorage.getItem(this.stateKey);
    const filteringState: FilteringExpressionsTree = JSON.parse(state).filtering;
    if (filteringState) {
      const gridFilteringState: IGridState = { filtering: filteringState};
      this.state.setState(gridFilteringState);
    }
  }

  public restoreAdvancedFiltering() {
    const state = window.localStorage.getItem(this.stateKey);
    const advFilteringState: FilteringExpressionsTree = JSON.parse(state).advancedFiltering;
    if (advFilteringState) {
      const gridAdvancedFilteringState: IGridState = { advancedFiltering: advFilteringState};
      this.state.setState(gridAdvancedFilteringState);
    }
  }

  public restoreSorting() {
    const state = window.localStorage.getItem(this.stateKey);
    const sortingState: ISortingExpression[] = JSON.parse(state).sorting;
    if (state) {
      const gridSortingState: IGridState = { sorting: sortingState};
      this.state.setState(gridSortingState);
    }
  }

  public restoreGroupby() {
    const state = window.localStorage.getItem(this.stateKey);
    const groupByState: IGroupingExpression[] = JSON.parse(state).groupby;
    if (state) {
      const gridGroupiByState: IGridState = { groupBy: groupByState};
      this.state.setState(gridGroupiByState);
    }
  }

  public restoreRowSelection() {
    const state = window.localStorage.getItem(this.stateKey);
    const rowSelectionState = JSON.parse(state).rowSelection;
    if (state) {
      const gridRowSelectionState: IGridState = { rowSelection: rowSelectionState };
      this.state.setState(gridRowSelectionState);
    }
  }

  public restoreCellSelection() {
    const state = window.localStorage.getItem(this.stateKey);
    const cellSelectionState = JSON.parse(state).cellSelection;
    if (state) {
      const gridCellSelectionState: IGridState = { cellSelection: cellSelectionState };
      this.state.setState(gridCellSelectionState);
    }
  }

  public restorePaging() {
    const state = window.localStorage.getItem(this.stateKey);
    const pagingState: IPagingState = JSON.parse(state).paging;
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
