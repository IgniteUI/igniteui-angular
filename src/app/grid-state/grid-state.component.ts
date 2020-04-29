import { Component, OnInit, ViewChild, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { IgxGridComponent, FilteringExpressionsTree, FilteringLogic,
  IgxNumberSummaryOperand, IgxSummaryResult, IGridState, IgxGridStateDirective,
  IgxHierarchicalGridComponent, IgxExpansionPanelComponent, IgxGridBaseDirective,
  IGridStateOptions, IgxTreeGridComponent, GridFeatures, FlatGridFeatures } from 'igniteui-angular';
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
  public localData = employeesData;
  public localData2 = this.generateDataUneven(100, 3);
  public gridId = 'grid1';
  public hGridId = 'hGrid1';
  public treeGridId = 'treeGrid1';
  public gridState: IGridState;
  public serialize = true;
  public templatedIcon = false;
  public features = [
    { key: GridFeatures.ADVANCED_FILTERING, shortName: 'Adv Filt' },
    { key: GridFeatures.CELL_SELECTION, shortName: 'Cell Sel' },
    { key: GridFeatures.COLUMNS, shortName: 'Columns' } ,
    { key: GridFeatures.COLUMN_SELECTION, shortName: 'Cols Sel' },
    { key: GridFeatures.EXPANSION, shortName: 'Expansion' },
    { key: GridFeatures.FILTERING, shortName: 'Filt' },
    { key: GridFeatures.PAGING, shortName: 'Paging' },
    { key: GridFeatures.ROW_PINNING, shortName: 'Row Pining' },
    { key: GridFeatures.ROW_SELECTION, shortName: 'Row Sel' },
    { key: GridFeatures.SORTING, shortName: 'Sorting' },
    { key: FlatGridFeatures.GROUP_BY, shortName: 'GroupBy'}
  ];

  public options: IGridStateOptions = {
    cellSelection: true,
    rowSelection: true,
    columnSelection: true,
    filtering: true,
    advancedFiltering: true,
    paging: true,
    sorting: true,
    groupBy: true,
    columns: true,
    expansion: true,
    rowPinning: true
  };

  @ViewChild(IgxExpansionPanelComponent, { static: true }) public igxExpansionPanel: IgxExpansionPanelComponent;
  @ViewChildren(IgxGridStateDirective) public gridStateDirective: IgxGridStateDirective;
  @ViewChildren(IgxGridStateDirective) public state: QueryList<IgxGridStateDirective>;
  @ViewChild('grid', { static: true }) public grid: IgxGridComponent;
  @ViewChild('hGrid', { static: true }) hGrid: IgxHierarchicalGridComponent;
  @ViewChild('treeGrid', { static: true }) treeGrid: IgxTreeGridComponent;

  public initialColumns: any[] = [
    // tslint:disable:max-line-length
    { field: 'FirstName', header: 'First Name', width: '150px', dataType: 'string', pinned: true, movable: true, sortable: true, filterable: true, summaries: MySummary },
    { field: 'LastName', header: 'Last Name', width: '150px', dataType: 'string', pinned: true, movable: true, sortable: true, filterable: true},
    { field: 'Country', header: 'Country', width: '140px', dataType: 'string', groupable: true, movable: true, sortable: true, filterable: true, resizable: true },
    { field: 'Age', header: 'Age', width: '110px', dataType: 'number', movable: true, sortable: true, filterable: true, hasSummary: true, summaries: MySummary, resizable: true},
    { field: 'RegistererDate', header: 'Registerer Date', width: '180px', dataType: 'date', movable: true, sortable: true, filterable: true, resizable: true },
    { field: 'IsActive', header: 'Is Active', width: '140px', dataType: 'boolean', groupable: true, movable: true, sortable: true, filterable: true }
    // tslint:enable:max-line-length
  ];
  public treeGridData = [
      { 'Salary': 2500, 'employeeID': 0, 'PID': -1, 'firstName': 'Andrew', 'lastName': 'Fuller', 'Title': 'Vice President, Sales' },
      { 'Salary': 3500, 'employeeID': 1, 'PID': -1, 'firstName': 'Jonathan', 'lastName': 'Smith', 'Title': 'Human resources' },
      { 'Salary': 1500, 'employeeID': 2, 'PID': -1, 'firstName': 'Nancy', 'lastName': 'Davolio', 'Title': 'CFO' },
      { 'Salary': 2500, 'employeeID': 3, 'PID': -1, 'firstName': 'Steven', 'lastName': 'Buchanan', 'Title': 'CTO' },
      // sub of ID 0
      { 'Salary': 2500, 'employeeID': 4, 'PID': 0, 'firstName': 'Janet', 'lastName': 'Leverling', 'Title': 'Sales Manager' },
      { 'Salary': 3500, 'employeeID': 5, 'PID': 0, 'firstName': 'Laura', 'lastName': 'Callahan', 'Title': 'Inside Sales Coordinator' },
      { 'Salary': 1500, 'employeeID': 6, 'PID': 0, 'firstName': 'Margaret', 'lastName': 'Peacock', 'Title': 'Sales Representative' },
      { 'Salary': 2500, 'employeeID': 7, 'PID': 0, 'firstName': 'Michael', 'lastName': 'Suyama', 'Title': 'Sales Representative' },
      // sub of ID 4
      { 'Salary': 2500, 'employeeID': 8, 'PID': 4, 'firstName': 'Anne', 'lastName': 'Dodsworth', 'Title': 'Sales Representative' },
      { 'Salary': 3500, 'employeeID': 9, 'PID': 4, 'firstName': 'Danielle', 'lastName': 'Davis', 'Title': 'Sales Representative' },
      { 'Salary': 1500, 'employeeID': 10, 'PID': 4, 'firstName': 'Robert', 'lastName': 'King', 'Title': 'Sales Representative' },
      // sub of ID 2
      { 'Salary': 2500, 'employeeID': 11, 'PID': 2, 'firstName': 'Peter', 'lastName': 'Lewis', 'Title': 'Chief Accountant' },
      { 'Salary': 3500, 'employeeID': 12, 'PID': 2, 'firstName': 'Ryder', 'lastName': 'Zenaida', 'Title': 'Accountant' },
      { 'Salary': 1500, 'employeeID': 13, 'PID': 2, 'firstName': 'Wang', 'lastName': 'Mercedes', 'Title': 'Accountant' },
      // sub of ID 3
      { 'Salary': 1500, 'employeeID': 14, 'PID': 3, 'firstName': 'Theodore', 'lastName': 'Zia', 'Title': 'Software Architect' },
      { 'Salary': 4500, 'employeeID': 15, 'PID': 3, 'firstName': 'Lacota', 'lastName': 'Mufutau', 'Title': 'Product Manager' },
      // sub of ID 16
      { 'Salary': 2500, 'employeeID': 16, 'PID': 15, 'firstName': 'Jin', 'lastName': 'Elliott', 'Title': 'Product Owner' },
      { 'Salary': 3500, 'employeeID': 17, 'PID': 15, 'firstName': 'Armand', 'lastName': 'Ross', 'Title': 'Product Owner' },
      { 'Salary': 1500, 'employeeID': 18, 'PID': 15, 'firstName': 'Dane', 'lastName': 'Rodriquez', 'Title': 'Team Leader' },
      // sub of ID 19
      { 'Salary': 2500, 'employeeID': 19, 'PID': 18, 'firstName': 'Declan', 'lastName': 'Lester', 'Title': 'Senior Software Developer' },
      { 'Salary': 3500, 'employeeID': 20, 'PID': 18, 'firstName': 'Bernard', 'lastName': 'Jarvis', 'Title': 'Senior Software Developer' },
      { 'Salary': 1500, 'employeeID': 21, 'PID': 18, 'firstName': 'Jason', 'lastName': 'Clark', 'Title': 'QA' },
      { 'Salary': 1500, 'employeeID': 22, 'PID': 18, 'firstName': 'Mark', 'lastName': 'Young', 'Title': 'QA' },
      // sub of ID 20
      { 'Salary': 1500, 'employeeID': 23, 'PID': 20, 'firstName': 'Jeremy', 'lastName': 'Donaldson', 'Title': 'Software Developer' }
  ];
  public treeGridColumns = [
      { field: 'employeeID', label: 'ID', width: 200, resizable: true, movable: true, dataType: 'number', hasSummary: false },
      { field: 'Salary', label: 'Salary', width: 200, resizable: true, movable: true, dataType: 'number', hasSummary: true },
      { field: 'firstName', label: 'First Name', width: 300, resizable: true, movable: true, dataType: 'string', hasSummary: false },
      { field: 'lastName', label: 'Last Name', width: 150, resizable: true, movable: true, dataType: 'string', hasSummary: false },
      { field: 'Title', label: 'Title', width: 200, resizable: true, movable: true, dataType: 'string', hasSummary: true }
  ];

  constructor(private router: Router) { }

  public ngOnInit() {
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

  public getContext(grid: IgxGridBaseDirective) {
    if (this.state) {
      const stateDirective = this.state.find(st => st.grid.id === grid.id);
      return { $implicit: grid, stateDirective: stateDirective};
    }
    return { $implicit: grid };
  }

  // save state for all grids on the page
  public saveGridState() {
      this.state.forEach(stateDirective => {
        let state = stateDirective.getState(this.serialize);
        if (typeof state !== 'string') {
          state = JSON.stringify(state);
        }
        try {
          window.localStorage.setItem(`${stateDirective.grid.id}-state`, state);
        } catch (e) {
            console.log('Storage is full, or the value that you try to se is too long to be written in single item, Please empty data');
        }
      });
  }

  // restores grid state for the passed stateDirective only
  public restoreGridState(stateDirective: IgxGridStateDirective) {
      const key = `${stateDirective.grid.id}-state`;
      const state = window.localStorage.getItem(key);
      if (state) {
        stateDirective.setState(state);
      }
  }

  public restoreFeature(stateDirective: IgxGridStateDirective, feature: string) {
    const key = `${stateDirective.grid.id}-state`;
    const state = this.getFeatureState(key, feature);
    if (state) {
      const featureState = { } as IGridState;
      featureState[feature] = state;
      stateDirective.setState(state);
    }
  }

  public getFeatureState(stateKey: string, feature: string) {
    let state = window.localStorage.getItem(stateKey);
    state =  state ? JSON.parse(state)[feature] : null;
    return state;
  }

  public resetGridState(grid) {
    grid.filteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
    grid.advancedFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
    grid.sortingExpressions = [];
    grid.groupingExpressions = [];
    grid.deselectAllRows();
    grid.clearCellSelection();
  }

  public onChange(event: any, action: string, state: IgxGridStateDirective) {
    state.options[action] = event.checked;
  }

  public clearStorage(grid) {
    const key = `${grid.id}-state`;
    window.localStorage.removeItem(key);
  }

  public reloadPage() {
      window.location.reload();
  }

  public templateIcon() {
    this.templatedIcon = !this.templatedIcon;
  }

  public collapsed() {
    return this.igxExpansionPanel && this.igxExpansionPanel.collapsed;
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
