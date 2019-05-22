import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewChild
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IgxFilterOptions } from '../../../directives/filter/filter.directive';
import { IChangeCheckboxEventArgs } from '../../../checkbox/checkbox.component';
import { IgxInputDirective } from '../../../directives/input/input.directive';
import { FilterListItem } from './grid.excel-style-filtering.component';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-search',
    templateUrl: './excel-style-search.component.html'
})
export class IgxExcelStyleSearchComponent {

    public searchValue: any;

    @Input()
    public data: FilterListItem[];

    @Input()
    public column: IgxColumnComponent;

    @ViewChild('input', { read: IgxInputDirective })
    public searchInput: IgxInputDirective;

    constructor() {}

    public clearInput() {
        this.searchValue = null;
    }

    public onCheckboxChange(eventArgs: IChangeCheckboxEventArgs) {
        const selectedIndex = this.data.indexOf(eventArgs.checkbox.value);
        if (selectedIndex === 0) {
            this.data.forEach(element => {
                element.isSelected = eventArgs.checked;
                this.data[0].indeterminate = false;
            });
        } else {
            eventArgs.checkbox.value.isSelected = eventArgs.checked;
            if (!this.data.slice(1, this.data.length).find(el => el.isSelected === false)) {
                this.data[0].indeterminate = false;
                this.data[0].isSelected = true;
            } else if (!this.data.slice(1, this.data.length).find(el => el.isSelected === true)) {
                this.data[0].indeterminate = false;
                this.data[0].isSelected = false;
            } else {
                this.data[0].indeterminate = true;
            }
        }
        eventArgs.checkbox.nativeCheckbox.nativeElement.blur();
    }
}
