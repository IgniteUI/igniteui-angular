import { Directive, ElementRef, HostBinding } from '@angular/core';

@Directive({
    selector: '[igxDragHandle]'
})
export class IgxDragHandleDirective {

    @HostBinding('class.igx-drag__handle')
    public baseClass = true;

    constructor(public element: ElementRef<any>) {}
}
