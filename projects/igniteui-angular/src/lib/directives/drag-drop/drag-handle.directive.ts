import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[igxDragHandle]'
})
export class IgxDragHandleDirective {
    constructor(public element: ElementRef<any>) {}
}
