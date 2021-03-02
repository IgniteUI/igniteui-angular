import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild } from '@angular/core';
import {
    DefaultSortingStrategy,
    IgxGridComponent,
    SortingDirection
} from 'igniteui-angular';
import { Contract, REGIONS } from '../shared/financialData';
import { LocalService } from '../shared/local.service';

@Component({
    selector: 'app-finjs-grid',
    styleUrls: ['./grid-finjs.component.scss'],
    templateUrl: './grid-finjs.component.html'
})
export class GridFinJSComponent implements OnInit, OnDestroy {
    @ViewChild('grid1', { static: true }) public grid: IgxGridComponent;

    @Output() public selectedDataChanged = new EventEmitter<any>();
    @Output() public keyDown = new EventEmitter<any>();
    @Output() public chartColumnKeyDown = new EventEmitter<any>();

    public data = [];
    public selectionMode = 'multiple';
    public contracts = Contract;
    public regions = REGIONS;
    public columnFormat = { digitsInfo: '1.3-3'};
    public showToolbar = true;
    public volume = 1000;
    public frequency = 500;
    private subscription$;

    constructor(public finService: LocalService) {
        this.finService.getFinancialData(this.volume);
        this.subscription$ = this.finService.records.subscribe(x => {
            this.data = x;
        });
    }

    public ngOnInit() {
        this.grid.groupingExpressions = [{
            dir: SortingDirection.Desc,
            fieldName: 'Category',
            ignoreCase: false,
            strategy: DefaultSortingStrategy.instance()
        },
        {
            dir: SortingDirection.Desc,
            fieldName: 'Type',
            ignoreCase: false,
            strategy: DefaultSortingStrategy.instance()
        },
        {
            dir: SortingDirection.Desc,
            fieldName: 'Settlement',
            ignoreCase: false,
            strategy: DefaultSortingStrategy.instance()
        }
        ];
    }

    public ngOnDestroy() {
        if (this.subscription$) {
            this.subscription$.unsubscribe();
        }
    }

    /** Event Handlers */

    public onChange() {
        if (this.grid.groupingExpressions.length > 0) {
            this.grid.groupingExpressions = [];
        } else {
            this.grid.groupingExpressions = [{
                dir: SortingDirection.Desc,
                fieldName: 'Category',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            },
            {
                dir: SortingDirection.Desc,
                fieldName: 'Type',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            },
            {
                dir: SortingDirection.Desc,
                fieldName: 'Contract',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            }
            ];
        }
    }

    public toggleGrouping() {
        if (this.grid.groupingExpressions.length > 0) {
            this.grid.groupingExpressions = [];
        } else {
            this.grid.groupingExpressions = [{
                dir: SortingDirection.Desc,
                fieldName: 'Category',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            },
            {
                dir: SortingDirection.Desc,
                fieldName: 'Type',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            },
            {
                dir: SortingDirection.Desc,
                fieldName: 'Contract',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            }
            ];
        }
    }

    /** Grid CellStyles and CellClasses */
    private negative = (rowData: any): boolean => rowData['Change(%)'] < 0;
    private positive = (rowData: any): boolean => rowData['Change(%)'] > 0;
    private changeNegative = (rowData: any): boolean => rowData['Change(%)'] < 0 && rowData['Change(%)'] > -1;
    private changePositive = (rowData: any): boolean => rowData['Change(%)'] > 0 && rowData['Change(%)'] < 1;
    private strongPositive = (rowData: any): boolean => rowData['Change(%)'] >= 1;
    private strongNegative = (rowData: any): boolean => rowData['Change(%)'] <= -1;

    /* eslint-disable @typescript-eslint/member-ordering */
    public trends = {
        changeNeg: this.changeNegative,
        changePos: this.changePositive,
        negative: this.negative,
        positive: this.positive,
        strongNegative: this.strongNegative,
        strongPositive: this.strongPositive
    };

    public trendsChange = {
        changeNeg2: this.changeNegative,
        changePos2: this.changePositive,
        strongNegative2: this.strongNegative,
        strongPositive2: this.strongPositive
    };
    /* eslint-enable @typescript-eslint/member-ordering */

    public get grouped(): boolean {
        return this.grid.groupingExpressions.length > 0;
    }
}
