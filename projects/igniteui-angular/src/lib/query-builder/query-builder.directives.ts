import { Directive, ElementRef, Host, Input, OnChanges, Optional, Self, TemplateRef } from '@angular/core';
import { IFieldValidator } from './query-builder-tree.component';
import { IgxDatePickerComponent, IgxDateTimeEditorDirective, IgxTimePickerComponent } from 'igniteui-angular';

/**
 * Defines the custom template that will be used for the search value input of condition in edit mode
 *
 * @igxModule IgxQueryBuilderModule
 * @igxKeywords query builder, query builder search value
 * @igxGroup Data entry and display
 *
 * @example
 * <igx-query-builder>
 *      <ng-template igxQueryBuilderSearchValue let-expression="expression">
 *          <input type="text" required [(ngModel)]="expression.searchVal"/>
 *      </ng-template>
 *  </igx-query-builder>
 */
@Directive({
    selector: '[igxQueryBuilderSearchValue]',
    standalone: true
})
export class IgxQueryBuilderSearchValueTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

/** @hidden @internal */
@Directive({
    selector: '[igxFieldValidators]',
    standalone: true
})
export class IgxFieldValidatorDirective implements OnChanges {
    private picker: any;
    constructor(private element: ElementRef,
        @Host() @Self() @Optional() datePicker: IgxDatePickerComponent,
        @Host() @Self() @Optional() timePicker: IgxTimePickerComponent,
        @Host() @Self() @Optional() dateTimePicker: IgxDateTimeEditorDirective
    ) {
        this.picker = datePicker || timePicker || dateTimePicker;
    }

    @Input()
    public validators: IFieldValidator[] = [];

    public ngOnChanges() {
        if (!this.validators)
            return;

        this.validators.forEach(validator => {
            if (this.picker && validator.type === 'mindate') {
                this.picker.minValue = validator.value;
            } else if (this.picker && validator.type === 'maxdate') {
                this.picker.maxValue = validator.value;
            } else if (!this.picker && !validator.type.includes('date')) {
                this.element.nativeElement.setAttribute(validator.type, validator.value);
            } else if (validator.type === 'required') {
                this.element.nativeElement.required = true;
            }
        });
    }
}
