import { IgxDropDownItemComponent } from './../drop-down/drop-down-item.component';
import { Component, ElementRef, Input } from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxDropDownBase } from '../drop-down/drop-down.base';

@Component({
    selector: 'igx-select-item',
    templateUrl: 'select-item.component.html'
})
export class IgxSelectItemComponent extends IgxDropDownItemComponent {

    constructor(
        public dropDownBase: IgxDropDownBase,
        protected elementRef: ElementRef,
        protected selection: IgxSelectionAPIService
    ) {
        super(dropDownBase, elementRef);
    }
}
