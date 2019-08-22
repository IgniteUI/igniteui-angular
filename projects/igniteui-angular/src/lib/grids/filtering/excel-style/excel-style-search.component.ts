import {
    AfterViewInit,
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewChild,
    ChangeDetectorRef,
    TemplateRef,
    Directive
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IChangeCheckboxEventArgs } from '../../../checkbox/checkbox.component';
import { IgxInputDirective } from '../../../directives/input/input.directive';
import { DisplayDensity } from '../../../core/density';
import { IgxForOfDirective } from '../../../directives/for-of/for_of.directive';
import { FilterListItem } from './grid.excel-style-filtering.component';

@Directive({
    selector: '[igxExcelStyleLoading]'
})
export class IgxExcelStyleLoadingValuesTemplateDirective {
    constructor(public template: TemplateRef<any>) {}
}

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

    private _isLoading;

    public get isLoading() {
        return this._isLoading;
    }

    public set isLoading(value: boolean) {
        this._isLoading = value;
        if (!(this._cdr as any).destroyed) {
            this._cdr.detectChanges();
        }
    }

    public searchValue: any;

    @Input()
    public grid: any;

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

    @ViewChild('defaultExcelStyleLoadingValuesTemplate', { read: TemplateRef, static: true })
    protected defaultExcelStyleLoadingValuesTemplate: TemplateRef<any>;

    public get valuesLoadingTemplate() {
        if (this.grid.excelStyleLoadingValuesTemplateDirective) {
            return this.grid.excelStyleLoadingValuesTemplateDirective.template;
        } else {
            return this.defaultExcelStyleLoadingValuesTemplate;
        }
    }

    constructor(private _cdr: ChangeDetectorRef) { }

    public ngAfterViewInit() {
        this.refreshSize();
    }

    public refreshSize() {
        requestAnimationFrame(() => {
            this.virtDir.recalcUpdateSizes();
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
