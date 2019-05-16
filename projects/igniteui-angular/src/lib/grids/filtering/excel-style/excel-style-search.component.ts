import {
    AfterViewInit,
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewChild
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IgxFilterOptions } from '../../../directives/filter/filter.directive';
import { IChangeCheckboxEventArgs } from '../../../checkbox/checkbox.component';
import { IgxInputDirective } from '../../../directives/input/input.directive';
import { DisplayDensity } from '../../../core/density';
import { IgxListComponent } from '../../../list';
import { IgxForOfDirective } from '../../../directives/for-of/for_of.directive';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-search',
    templateUrl: './excel-style-search.component.html'
})
export class IgxExcelStyleSearchComponent implements AfterViewInit {

    public searchValue: any;

    @Input()
    public data: any[];

    @Input()
    public column: IgxColumnComponent;

    @ViewChild('input', { read: IgxInputDirective })
    public searchInput: IgxInputDirective;

    @Input()
    public displayDensity: DisplayDensity;

    @ViewChild('searchList', { read: IgxListComponent })
    protected searchList: IgxListComponent;

    @ViewChild(IgxForOfDirective)
    protected virtDir: IgxForOfDirective<any>;

    constructor() {}

    public ngAfterViewInit() {
        requestAnimationFrame(() => {
            this.virtDir.recalcUpdateSizes();
        });
    }

    get filterOptions() {
        const fo = new IgxFilterOptions();
        fo.key = 'value';
        fo.inputValue = this.searchValue;
        return fo;
    }

    public clearInput() {
        this.searchValue = null;
    }

    public onCheckboxChange(eventArgs: IChangeCheckboxEventArgs) {
        const selectAll = this.column.grid.resourceStrings.igx_grid_excel_select_all;
        if (eventArgs.checkbox.value.value === selectAll) {
            this.data.forEach(element => {
                element.isSelected = eventArgs.checked;
                this.data[0].indeterminate = false;
            });
        } else {
            eventArgs.checkbox.value.isSelected = eventArgs.checked;
            if (!this.data.filter(el => el.value !== selectAll).find(el => el.isSelected === false)) {
                this.data[0].indeterminate = false;
                this.data[0].isSelected = true;
            } else if (!this.data.filter(el => el.value !== selectAll).find(el => el.isSelected === true)) {
                this.data[0].indeterminate = false;
                this.data[0].isSelected = false;
            } else {
                this.data[0].indeterminate = true;
            }
        }
        eventArgs.checkbox.nativeCheckbox.nativeElement.blur();
    }

    public get itemSize() {
        let itemSize = '48px';
        switch (this.displayDensity) {
            case DisplayDensity.cosy: itemSize = '32px'; break;
            case DisplayDensity.compact: itemSize = '28px'; break;
            default: break;
        }
        return itemSize;
    }
}
