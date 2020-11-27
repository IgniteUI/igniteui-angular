import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    ViewChild } from '@angular/core';
import {
    DefaultSortingStrategy,
    IgxGridComponent,
    SortingDirection
} from 'igniteui-angular';
import { Contract, REGIONS } from '../shared/financialData';

@Component({
    selector: 'app-finjs-grid',
    styleUrls: ['./grid-finjs.component.scss'],
    templateUrl: './grid-finjs.component.html'
})
export class GridFinJSComponent implements OnInit, AfterViewInit {
    @ViewChild('grid1', { static: true }) public grid: IgxGridComponent;

    public properties;
    public data = [];
    public multiCellSelection: { data: any[] } = { data: [] };
    public selectionMode = 'multiple';
    public contracts = Contract;
    public regions = REGIONS;
    public showToolbar = true;

    constructor(private elRef: ElementRef, public cdr: ChangeDetectorRef) { }

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
        // this.volumeChanged = this.volumeSlider.onValueChange.pipe(debounce(() => timer(200)));
        // this.volumeChanged.subscribe(
        //     (x) => {
        //         this.localService.getFinancialData(this.volume);
        //     },
        //     (err) => console.log('Error: ' + err));
    }

    public ngAfterViewInit() {
        this.grid.hideGroupedColumns = true;
        this.grid.reflow();
    }

    /** Event Handlers */

    public onChange(event: any) {
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

    /** Grid Formatters */
    public formatNumber(value: number) {
        return value.toFixed(2);
    }

    public percentage(value: number) {
        return value.toFixed(2) + '%';
    }

    public formatCurrency(value: number) {
        return '$' + value.toFixed(3);
    }

    public formatYAxisLabel(item: any): string {
        return item + 'test test';
    }

    public toggleToolbar(event: any) {
        this.grid.showToolbar = !this.grid.showToolbar;
    }

    /** Grid CellStyles and CellClasses */
    private negative = (rowData: any): boolean => {
        return rowData['Change(%)'] < 0;
    }
    private positive = (rowData: any): boolean => {
        return rowData['Change(%)'] > 0;
    }
    private changeNegative = (rowData: any): boolean => {
        return rowData['Change(%)'] < 0 && rowData['Change(%)'] > -1;
    }
    private changePositive = (rowData: any): boolean => {
        return rowData['Change(%)'] > 0 && rowData['Change(%)'] < 1;
    }
    private strongPositive = (rowData: any): boolean => {
        return rowData['Change(%)'] >= 1;
    }
    private strongNegative = (rowData: any, key: string): boolean => {
        return rowData['Change(%)'] <= -1;
    }

    // tslint:disable:member-ordering
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
    // tslint:enable:member-ordering

    get grouped(): boolean {
        return this.grid.groupingExpressions.length > 0;
    }

}
