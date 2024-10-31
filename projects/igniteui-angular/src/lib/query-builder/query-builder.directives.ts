import { Directive, ElementRef, Input, OnChanges, TemplateRef } from '@angular/core';
import { IFieldValidator } from './query-builder-tree.component';

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
    constructor(private element: ElementRef) { }

    @Input()
    public validators: IFieldValidator[] = [];

    public ngOnChanges() {
        if (this.validators) {
            this.validators.forEach(validator => {
                if (validator.type === 'required') {
                    this.element.nativeElement.required = true;
                } else {
                    this.element.nativeElement.setAttribute(validator.type, validator.value);
                }
            });
        }
    }
}
