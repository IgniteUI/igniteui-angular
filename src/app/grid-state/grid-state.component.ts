import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IgxToastComponent, IgxGridComponent } from 'igniteui-angular';
import { employeesData } from './localData';
import { take } from 'rxjs/operators';
import { NavigationStart, Router } from '@angular/router';
import { IgxGridStateDirective, IGridState } from 'projects/igniteui-angular/src/lib/grids/state.directive';

interface IColumnState {
    field: string;
    header: string;
    width?: string;
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

export class GridSaveStateComponent implements OnInit {
  public localData: any[];
  public columns: IColumnState[];
  public gridId = 'grid1';
  public stateKey = this.gridId + '-state';
  public gridState: IGridState;

  public options = {
    selection: false,
    filtering: true,
    advancedFiltering: false,
    paging: true,
    sorting: true,
    groupby: false,
    columns: true
  };

  @ViewChild(IgxGridStateDirective, { static: true }) public state;
  @ViewChild(IgxGridComponent, { static: true }) public grid;

  public initialColumns: IColumnState[] = [
    { field: 'FirstName', header: 'First Name', width: '150px', dataType: 'string', pinned: true},
    { field: 'LastName', header: 'Last Name', width: '150px', dataType: 'string', pinned: true },
    { field: 'Country', header: 'Country', width: '140px', dataType: 'string' },
    { field: 'Age', header: 'Age', width: '110px', dataType: 'number'},
    { field: 'RegistererDate', header: 'Registerer Date', width: '180px', dataType: 'date' },
    { field: 'IsActive', header: 'Is Active', width: '140px', dataType: 'boolean' }
  ];

  constructor(private router: Router) {
  }

  public ngOnInit() {
    this.localData = employeesData;
    this.columns = this.initialColumns;

    this.router.events.pipe(take(1)).subscribe((event: NavigationStart) => {
        this.saveGridState();
    });

    this.restoreGridState();
  }

  public saveGridState() {
    const state = this.state.getState();
    window.localStorage.setItem(this.stateKey, state);
  }

  public restoreGridState() {
      const state = window.localStorage.getItem(this.stateKey);
      this.state.setState(state);
  }

  public onChange(event: any, action: string) {
    this.state.options[action] = event.checked;
  }

  public clearStorage(toast: IgxToastComponent) {
    window.localStorage.removeItem(this.stateKey);
  }

  public reloadPage() {
      window.location.reload();
  }

  // public getStoredState(action: string, gridId?: string, parseCb?: (key, val) => any): any {
  //   gridId = gridId ? gridId : this.grid.id;
  //   const actionKey = action + "-" + gridId;
  //   const item = JSON.parse(window.localStorage.getItem(actionKey), parseCb);
  //   return item ? item[action] : null;
  // }
}
