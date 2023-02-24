import { Component, OnInit, ViewChild } from '@angular/core';
import { IColumnPipeArgs, IgxGridComponent, IgxStringFilteringOperand } from 'igniteui-angular';
import { data, dataWithoutPK } from '../shared/data';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxSelectItemComponent } from '../../../projects/igniteui-angular/src/lib/select/select-item.component';
import { NgFor, NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { IgxSelectComponent } from '../../../projects/igniteui-angular/src/lib/select/select.component';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { FormsModule } from '@angular/forms';
import { IgxLabelDirective } from '../../../projects/igniteui-angular/src/lib/directives/label/label.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';
import { IgxCardComponent, IgxCardHeaderComponent, IgxCardHeaderTitleDirective, IgxCardContentDirective } from '../../../projects/igniteui-angular/src/lib/card/card.component';
import { IgxPaginatorComponent } from '../../../projects/igniteui-angular/src/lib/paginator/paginator.component';
import { IgxCellTemplateDirective } from '../../../projects/igniteui-angular/src/lib/grids/columns/templates.directive';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/columns/column.component';
import { IgxGridComponent as IgxGridComponent_1 } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';
 @Component({
    providers: [],
    selector: 'app-grid-percantge-widths.sample',
    templateUrl: 'grid-percantge-widths.sample.html',
    standalone: true,
    imports: [IgxGridComponent_1, IgxColumnComponent, IgxCellTemplateDirective, IgxPaginatorComponent, IgxCardComponent, IgxCardHeaderComponent, IgxCardHeaderTitleDirective, IgxCardContentDirective, IgxInputGroupComponent, IgxLabelDirective, FormsModule, IgxInputDirective, IgxSelectComponent, NgFor, IgxSelectItemComponent, IgxButtonDirective, NgIf, CurrencyPipe, DatePipe]
})
 export class GridColumnPercentageWidthsSampleComponent implements OnInit {
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public grid1: IgxGridComponent;
    public data: Array<any>;
    public data1: Array<any>;
    public leadingDigits = 1;
    public trailingDigitsMin = 0;
    public trailingDigitsMax = 2;
    public currencyCode = '';
    public pipeArgs: IColumnPipeArgs = {
        digitsInfo: `${this.leadingDigits}.${this.trailingDigitsMin}-${this.trailingDigitsMax}`,
        currencyCode: this.currencyCode,
        display: 'symbol'
    };
    public currencies = ['', 'USD', 'EUR', 'JPY', 'GBP'];
    public locales = ['en', 'fr-FR', 'ja', 'bg'];
    public locale = 'en';

    public ngOnInit(): void {
        this.data1 = data;
        this.data = dataWithoutPK;
    }

    public changePipeArgs() {
        this.pipeArgs = {
            digitsInfo: `${this.leadingDigits}.${this.trailingDigitsMin}-${this.trailingDigitsMax}`,
            currencyCode: this.currencyCode,
            display: 'symbol'
        };
    }

    public formatDate(val: Date) {
        return new Intl.DateTimeFormat('en-US').format(val);
    }

    public formatCurrency(val: string) {
        return parseInt(val, 10).toFixed(2);
    }

    public filter(term) {
        this.grid1.filter('ProductName', term, IgxStringFilteringOperand.instance().condition('contains'));
    }
}
