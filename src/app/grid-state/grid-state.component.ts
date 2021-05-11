import { Component, OnInit, ViewChild, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { FilteringExpressionsTree, FilteringLogic,
  IgxNumberSummaryOperand, IgxSummaryResult, IGridState, IgxGridStateDirective,
  IgxExpansionPanelComponent, IgxGridBaseDirective,
  IGridStateOptions, GridFeatures, GridColumnDataType } from 'igniteui-angular';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TREEGRID_FLAT_DATA, EMPLOYEE_DATA, employeesData } from './data';

class MySummary extends IgxNumberSummaryOperand {

  constructor() {
      super();
  }

  public operate(data?: any[]): IgxSummaryResult[] {
      const result = super.operate(data);
      result.push({
          key: 'test',
          label: 'Test',
          summaryResult: data.filter(rec => rec > 10 && rec < 30).length
      });
      return result;
  }
}

interface GridState {
    field: string;
    header: string;
    width: any;
    maxWidth?: any;
    minWidth?: any;
    dataType: GridColumnDataType;
    pinned?: boolean;
    groupable?: boolean;
    movable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    hasSummary?: boolean;
    resizable?: boolean;
    hidden?: boolean;
    summaries?: any;
}

@Component({
  selector: 'app-grid',
  styleUrls: ['./grid-state.component.scss'],
  templateUrl: './grid-state.component.html'
})

export class GridSaveStateComponent implements OnInit, AfterViewInit {
    @ViewChild(IgxExpansionPanelComponent, { static: true })
    private igxExpansionPanel: IgxExpansionPanelComponent;
    @ViewChildren(IgxGridStateDirective)
    private state: QueryList<IgxGridStateDirective>;

    public localData = employeesData;
    public hierData = this.generateDataUneven(10, 3);
    public treeGridFlatData = TREEGRID_FLAT_DATA;
    public employees = EMPLOYEE_DATA;
    public gridId = 'grid1';
    public hGridId = 'hGrid1';
    public treeGridId = 'treeGrid1';
    public treeGridHierId = 'treeGridH1';
    public gridState: IGridState;
    public serialize = true;
    public templatedIcon = false;
    public features: { key: GridFeatures; shortName: string }[] = [
        { key: 'advancedFiltering', shortName: 'Adv Filt' },
        { key: 'cellSelection', shortName: 'Cell Sel' },
        { key: 'columns', shortName: 'Columns' } ,
        { key: 'columnSelection', shortName: 'Cols Sel' },
        { key: 'expansion', shortName: 'Expansion' },
        { key: 'filtering', shortName: 'Filt' },
        { key: 'paging', shortName: 'Paging' },
        { key: 'rowPinning', shortName: 'Row Pining' },
        { key: 'rowSelection', shortName: 'Row Sel' },
        { key: 'sorting', shortName: 'Sorting' },
        { key: 'groupBy', shortName: 'GroupBy'}
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

    public initialColumns: GridState [] = [
        /* eslint-disable max-len */
        { field: 'FirstName', header: 'First Name', width: '150px', dataType: 'string', pinned: true, movable: true, sortable: true, filterable: true, summaries: MySummary },
        { field: 'LastName', header: 'Last Name', width: '150px', dataType: 'string', pinned: true, movable: true, sortable: true, filterable: true},
        { field: 'Country', header: 'Country', width: '140px', dataType: 'string', groupable: true, movable: true, sortable: true, filterable: true, resizable: true },
        { field: 'Age', header: 'Age', width: '110px', dataType: 'number', movable: true, sortable: true, filterable: true, hasSummary: true, summaries: MySummary, resizable: true},
        { field: 'RegistererDate', header: 'Registerer Date', width: '180px', dataType: 'date', movable: true, sortable: true, filterable: true, resizable: true },
        { field: 'IsActive', header: 'Is Active', width: '140px', dataType: 'boolean', groupable: true, movable: true, sortable: true, filterable: true }
    ];

    public treeGridColumns: GridState [] = [
        { field: 'employeeID', header: 'ID', width: 200, resizable: true, movable: true, dataType: 'number', hasSummary: false },
        { field: 'Salary', header: 'Salary', width: 200, resizable: true, movable: true, dataType: 'number', hasSummary: true },
        { field: 'firstName', header: 'First Name', width: 300, resizable: true, movable: true, dataType: 'string', hasSummary: false },
        { field: 'lastName', header: 'Last Name', width: 150, resizable: true, movable: true, dataType: 'string', hasSummary: false },
        { field: 'Title', header: 'Title', width: 200, resizable: true, movable: true, dataType: 'string', hasSummary: true }
    ];

    public hierGridColumns: GridState [] = [
        { field: 'ID', header: 'ID', width: 200, resizable: true, sortable: true, filterable: true, pinned: true, dataType: 'number', hasSummary: true },
        { field: 'ChildLevels', header: 'Child Levels', width: 200, resizable: true, sortable: true, filterable: true, groupable: true, dataType: 'number', hasSummary: true },
        { field: 'ProductName', header: 'Product Name', width: 300, resizable: true, sortable: true, filterable: true, movable: true, dataType: 'string', hasSummary: false }
    ];
    /* eslint-enable max-len */

    constructor(private router: Router) { }

    public ngOnInit() {
        this.router.events.pipe(take(1)).subscribe(() => {
            this.saveGridState(null);
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
        return { $implicit: grid, stateDirective};
        }
        return { $implicit: grid };
    }

    // save state for all grids on the page
    public saveGridState(stateDirective: IgxGridStateDirective) {
        if (stateDirective) {
        let state = stateDirective.getState(this.serialize);
        if (typeof state !== 'string') {
            state = JSON.stringify(state);
        }
        try {
            window.localStorage.setItem(`${stateDirective.grid.id}-state`, state);
        } catch (e) {
            console.log('Storage is full, or the value that you try to se is too long to be written in single item, Please empty data');
        }
        } else {
        this.state.forEach(stateDir => {
            let state = stateDir.getState(this.serialize);
            if (typeof state !== 'string') {
            state = JSON.stringify(state);
            }
            try {
            window.localStorage.setItem(`${stateDir.grid.id}-state`, state);
            } catch (e) {
                console.log('Storage is full, or the value that you try to se is too long to be written in single item, Please empty data');
            }
        });
        }
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
        stateDirective.setState(featureState);
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

    public generateDataUneven(count: number, level: number, parentID: string = null) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parentID ? parentID + i : i.toString();
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
