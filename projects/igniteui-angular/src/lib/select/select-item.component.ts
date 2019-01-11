import { IgxDropDownItemComponent } from './../drop-down/drop-down-item.component';
import { Component, ElementRef, Input, Inject } from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { IGX_DROPDOWN_BASE, IDropDownBase } from '../drop-down/drop-down.common';

@Component({
    selector: 'igx-select-item',
    templateUrl: 'select-item.component.html'
})
export class IgxSelectItemComponent extends IgxDropDownItemComponent {

    constructor(
        @Inject(IGX_DROPDOWN_BASE) protected dropDown: IDropDownBase,
        protected elementRef: ElementRef,
        protected selection: IgxSelectionAPIService
    ) {
        super(dropDown, elementRef);
    }
}
