import { Component, Input, ViewChild, OnInit, DoCheck, Injectable } from "@angular/core";
import { DataContainer, DataUtil, DataState, 
        FilteringExpression, FilteringCondition, FilteringState, FilteringLogic, FilteringStrategy,
        PagingError, PagingState,
        SortingExpression, SortingDirection, SortingStrategy, StableSortingStrategy, SortingState
      } from "../../../src/main";

import {TestHelper} from "../../../src/data-operations/test-util/test-helper.spec"

import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { Http } from '@angular/http';

// service 
/* Example service */
@Injectable()
export class DataService extends BehaviorSubject<DataContainer> {
    private url: string = 'http://services.odata.org/V4/Northwind/Northwind.svc/Categories?$skip=5&$top=5&$count=true';
    
    constructor(private http: Http) {
        super(null);
    }
    public getData(): void {
        this.fetch()
            .subscribe(x => super.next(x));
    }
    private fetch(): Observable<DataContainer> {
        return this.http
            .get(this.url)
            .map(response => response.json())
            .map(function (response) {
                return (<DataContainer>{
                    data: response.value,
                    transformedData: response.value,
                    total: parseInt(response["@odata.count"], 10)
                });
            });
    }
}

@Component({
    selector: "data-iterator",
    moduleId: module.id,
    template: `
    <style>
        .my-table {
            border-spacing: 2px;
            border-collapse: collapse;
        }
        .my-table td, th {
            padding: 5px;
            border: solid 1px gray;
        }
    </style>
    <table class="my-table">
        <thead>
            <tr>
                <th *ngFor="let key of keys">
                    {{key}}
                </th>
            </tr>
        </thead>
        <tbody>
            <tr *ngFor="let dataRow of dataContainer? dataContainer.transformedData : (data || [])" >
                <td *ngFor="let key of keys">
                    {{dataRow[key]}}
                </td>
            </tr>
        </tbody>
</table>`
})
export class DataIterator {
    @Input() data: Object[] = [];
    @Input() keys: string[] = [];
    @Input() dataContainer: DataContainer;
}

@Component({
    providers: [DataService],
    selector: "data-util-sample",
    moduleId: module.id,
    templateUrl: './sample.component.html'
})
export class DataOperationsSampleComponent implements OnInit, DoCheck {
    remoteData: Observable<DataContainer>;
    helper: TestHelper;
    localData: Array<any>;
    dataContainer: DataContainer;
    ds2: DataContainer;
    DataContainerSettings;
    private dataInfo = {
        message: ""
    };

    // paging sample vars
    @ViewChild("listRemoteData") listRemoteData: DataIterator;
    @ViewChild("listData") listData: DataIterator;
    @ViewChild("filteringPanel") filteringPanel;
    constructor(private service:DataService) {
        this.remoteData = service;
        this.helper = new TestHelper();
    }
    ngOnInit() {
        this.listRemoteData.keys = ["CategoryID", "CategoryName", "Description"];
        this.service.getData();
        
        
        this.localData = this.helper.generateData(100000, 5);// generates 10 rows with 5 columns in each row
        this.dataContainer = new DataContainer(this.localData, this.localData.length);
        this.listData.keys = this.helper.columns.map(col => {return col.name;});
        this.dataContainer.state = {
          paging: {
            index: 0,
            recordsPerPage: 5
          }
        };
        this.listData.dataContainer = this.dataContainer;
        this.processData();
    }
    ngDoCheck() {
    }
    // sorting
    changeSortDirection (columnKey) {
      var dir:SortingDirection = this.getSortingDirection(columnKey),
          s: SortingState = this.dataContainer.state.sorting,
          index: number;
      if (dir === null) {
        dir = SortingDirection.Asc;
      } else {
        dir++;
        if (dir > SortingDirection.Desc) {
          dir = null; // remove sorting
        }
      }
      s = s || {
        expressions: []
      };
      index = s.expressions.findIndex((e) => e.fieldName === columnKey)
      if (dir === null) {
        if (index >= 0) {
          s.expressions.splice(index, 1);
        }
      } else {
        if (index >= 0) {
          s.expressions[index].dir = dir;
        } else {
          s.expressions.push({
            fieldName: columnKey,
            dir: dir
          });
        }
      }
      this.dataContainer.state.sorting = s;
      this.processData();
    }
    getSortingDirecitonText (columnKey: string): string {
      var s: SortingDirection = this.getSortingDirection(columnKey),
          res: string;
      switch(s) {
        case SortingDirection.Asc:
          res = "Sorted ascending";
          break;
        case SortingDirection.Desc: 
          res = "Sorted descending";
          break;
        default:
          res = "Sorting not applied";
      }
      return res;
    }
    getSortingDirection(columnKey: string): SortingDirection {
      var e:SortingExpression, s = this.dataContainer.state.sorting;
      if (!s || !s.expressions) {
        return null;
      }
      e = s.expressions.filter(expr => {return expr.fieldName === columnKey;})[0];
      if (!e) {
        return null;
      }
      return e.dir;
    }
    // filtering
    getFilteringConditions(colType: string) {
      var conds:Array<any> = DataUtil.getFilteringConditionsByDataType(colType);
      conds.unshift(null);
      return conds;
    }
    isFilteringConditionSelected(columnKey: string, filteringCond: string): boolean {
      return false;
    }
    getFilteringDataState(): void {
      var i, expressions: FilteringExpression[] = [], 
          expr: FilteringExpression,
          cond,
          searchVal,
          selCond: string,
          type: string,
          search,
          rows = this.filteringPanel.nativeElement.querySelectorAll("[data-field-name]"), 
          row: HTMLTableRowElement,
          fc;
      for (i = 0; i < rows.length; i++) {
        row = rows[i];
        fc = row.querySelector("[data-filtering-type]");
        selCond = fc.selectedOptions[0].value;
        if (selCond) {
          type = fc.attributes["data-filtering-type"].value
          search = row.querySelector("[data-filtering-search]");
          cond = (FilteringCondition[type] || {})[selCond];
          if (cond) {
            if (search) {
              // data type transformation
              searchVal = search.value;
              switch(type) {
                case "number": 
                  searchVal = + searchVal;
                  break;
                case "date":
                  searchVal = new Date(searchVal);
                  break;
              }
            }
            expressions.push({
              fieldName: row.attributes["data-field-name"].value,
              condition: cond,
              searchVal: searchVal 
            });
          }
        }
      }
      this.dataContainer.state.filtering = null;
      if (expressions.length) {
        this.dataContainer.state.filtering = {
          expressions: expressions
        };
      }
    }
    processData() {
        var p: PagingState, dt: number, metadata;
        this.getFilteringDataState();
        dt = new Date().getTime();
        this.dataContainer.process();
        p = this.dataContainer.state.paging;
        if (p) {
          metadata = p.metadata;
          this.dataInfo.message = metadata.error !== PagingError.None ? 
                                    "Incorrect arguments" : 
                                    `Page: ${p.index + 1} of ${metadata.countPages} page(s) |
                                    Total records: ${metadata.countRecords}
                                    Time to process: ${new Date().getTime() - dt} ms.`;
        }
        
    }
}