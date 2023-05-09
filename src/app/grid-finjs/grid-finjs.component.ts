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
import { IgxRippleDirective } from '../../../projects/igniteui-angular/src/lib/directives/ripple/ripple.directive';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxSelectItemComponent } from '../../../projects/igniteui-angular/src/lib/select/select-item.component';
import { IgxFocusDirective } from '../../../projects/igniteui-angular/src/lib/directives/focus/focus.directive';
import { FormsModule } from '@angular/forms';
import { IgxSelectComponent } from '../../../projects/igniteui-angular/src/lib/select/select.component';
import { IgxCellEditorTemplateDirective, IgxCellTemplateDirective } from '../../../projects/igniteui-angular/src/lib/grids/columns/templates.directive';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/columns/column.component';
import { IgxGridToolbarExporterComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-exporter.component';
import { IgxGridToolbarPinningComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-pinning.component';
import { IgxGridToolbarHidingComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar-hiding.component';
import { IgxGridToolbarActionsComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/common';
import { IgxGridToolbarComponent } from '../../../projects/igniteui-angular/src/lib/grids/toolbar/grid-toolbar.component';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { IgxGridComponent as IgxGridComponent_1 } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';

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
    templateUrl: './grid-finjs.component.html',
    standalone: true,
    imports: [IgxGridComponent_1, NgIf, IgxGridToolbarComponent, IgxGridToolbarActionsComponent, IgxGridToolbarHidingComponent, IgxGridToolbarPinningComponent, IgxGridToolbarExporterComponent, IgxColumnComponent, IgxCellEditorTemplateDirective, IgxSelectComponent, FormsModule, IgxFocusDirective, NgFor, IgxSelectItemComponent, IgxCellTemplateDirective, IgxIconComponent, IgxButtonDirective, IgxRippleDirective, CurrencyPipe]
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
