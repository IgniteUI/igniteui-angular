import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ChangeDetectorRef
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IgxFilteringService } from '../grid-filtering.service';
import { IgxFilterOptions } from '../../../directives/filter/filter.directive';
import { IChangeCheckboxEventArgs } from '../../../checkbox/checkbox.component';

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
    public data: any[];

    @Input()
    public column: IgxColumnComponent;

    constructor(private cdr: ChangeDetectorRef, private filteringService: IgxFilteringService) {
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
        if (eventArgs.checkbox.value.value === 'Select All') {
            this.data.forEach(element => {
                element.isSelected = eventArgs.checked;
                this.data[0].indeterminate = false;
            });
        } else {
            eventArgs.checkbox.value.isSelected = eventArgs.checked;
            if (!this.data.filter(el => el.value !== 'Select All').find(el => el.isSelected === false)) {
                this.data[0].indeterminate = false;
                this.data[0].isSelected = true;
            } else if (!this.data.filter(el => el.value !== 'Select All').find(el => el.isSelected === true)) {
                this.data[0].indeterminate = false;
                this.data[0].isSelected = false;
            } else {
                this.data[0].indeterminate = true;
            }
        }
    }

}