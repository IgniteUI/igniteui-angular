import {
    AfterViewInit,
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewChild,
    Injectable
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IgxFilterOptions } from '../../../directives/filter/filter.directive';
import { IChangeCheckboxEventArgs } from '../../../checkbox/checkbox.component';
import { IgxInputDirective } from '../../../directives/input/input.directive';
import { DisplayDensity } from '../../../core/density';
import { IgxForOfDirective } from '../../../directives/for-of/for_of.directive';
import { FilterListItem } from './grid.excel-style-filtering.component';
import { cloneArray } from '../../../core/utils';

/**
 * @hidden
 */
 @Injectable()
 @Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-search',
    templateUrl: './excel-style-search.component.html'
})
export class IgxExcelStyleSearchComponent implements AfterViewInit {

    public searchValue: any;

    @Input()
    public data: FilterListItem[];

    public filteredData: FilterListItem[];

    @Input()
    public column: IgxColumnComponent;

    @ViewChild('input', { read: IgxInputDirective, static: true })
    public searchInput: IgxInputDirective;

    @Input()
    public displayDensity: DisplayDensity;

    @ViewChild(IgxForOfDirective, { static: true })
    protected virtDir: IgxForOfDirective<any>;

    constructor() { }

    public ngAfterViewInit() {
        requestAnimationFrame(() => {
            this.virtDir.recalcUpdateSizes();
            this.filteredData = cloneArray(this.data);
        });
    }

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

    public get itemSize() {
        let itemSize = '40px';
        switch (this.displayDensity) {
            case DisplayDensity.cosy: itemSize = '32px'; break;
            case DisplayDensity.compact: itemSize = '24px'; break;
            default: break;
        }
        return itemSize;
    }
}
