import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef, ChangeDetectorRef, Inject } from '@angular/core';
import { VirtualHelperBaseDirective } from './base.helper.component';
import { DOCUMENT } from '@angular/common';

/**
 * @hidden
 */
@Component({
    selector: 'igx-horizontal-virtual-helper',
    template: '<div #horizontal_container class="igx-vhelper__placeholder-content" [style.width.px]="size"></div>'
})
export class HVirtualHelperComponent extends VirtualHelperBaseDirective {
    @ViewChild('horizontal_container', { read: ViewContainerRef, static: true }) public _vcr;
    @Input() public width: number;
    @HostBinding('class')
    public cssClasses = 'igx-vhelper--horizontal';

    constructor(public elementRef: ElementRef, public cdr: ChangeDetectorRef, @Inject(DOCUMENT) public document) {
        super(elementRef, cdr, document);
    }

    protected restoreScroll() {
        this.nativeElement.scrollLeft = this.scrollAmount;
    }
}
