import {
    Component,
    Input,
    ViewChild } from '@angular/core';
import {
    DefaultSortingStrategy,
    GridSelectionMode,
    IGroupingExpression,
    IgxGridComponent,
    SortingDirection
} from 'igniteui-angular';
import { Contract, REGIONS } from '../shared/financialData';

const GROUPING_EXPRESSIONS: IGroupingExpression[] = [{
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

@Component({
    selector: 'app-finjs-grid',
    styleUrls: ['./grid-finjs.component.scss'],
    templateUrl: './grid-finjs.component.html'
})
export class GridFinJSComponent {
    @ViewChild('grid1', { static: true }) public grid: IgxGridComponent;

    @Input()
    public data: any;

    public selectionMode: GridSelectionMode = GridSelectionMode.multiple;
    public contracts = Contract;
    public regions = REGIONS;
    public columnFormat = { digitsInfo: '1.3-3'};
    public showToolbar = true;
    public groupingExpressions: IGroupingExpression[] = GROUPING_EXPRESSIONS;

    constructor() { }

    public toggleGrouping(newValue: boolean) {
        this.groupingExpressions = newValue ? GROUPING_EXPRESSIONS : [];
    }

    /** Grid CellStyles and CellClasses */
    private negative = (rowData: any): boolean => rowData['Change(%)'] < 0;
    private positive = (rowData: any): boolean => rowData['Change(%)'] > 0;
    private changeNegative = (rowData: any): boolean => rowData['Change(%)'] < 0 && rowData['Change(%)'] > -1;
    private changePositive = (rowData: any): boolean => rowData['Change(%)'] > 0 && rowData['Change(%)'] < 1;
    private strongPositive = (rowData: any): boolean => rowData['Change(%)'] >= 1;
    private strongNegative = (rowData: any): boolean => rowData['Change(%)'] <= -1;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public trends = {
        changeNeg: this.changeNegative,
        changePos: this.changePositive,
        negative: this.negative,
        positive: this.positive,
        strongNegative: this.strongNegative,
        strongPositive: this.strongPositive
    };
    // eslint-disable-next-line @typescript-eslint/member-ordering
    public trendsChange = {
        changeNeg2: this.changeNegative,
        changePos2: this.changePositive,
        strongNegative2: this.strongNegative,
        strongPositive2: this.strongPositive
    };
}
