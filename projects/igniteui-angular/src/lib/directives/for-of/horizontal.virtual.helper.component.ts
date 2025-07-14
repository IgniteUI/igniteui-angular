import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef, ChangeDetectorRef, NgZone, inject } from '@angular/core';
import { VirtualHelperBaseDirective } from './base.helper.component';
import { DOCUMENT } from '@angular/common';
import { PlatformUtil } from '../../core/utils';

/**
 * @hidden
 */
@Component({
    selector: 'igx-horizontal-virtual-helper',
    template: '<div #horizontal_container class="igx-vhelper__placeholder-content" [style.width.px]="size"></div>',
    standalone: true
})
export class HVirtualHelperComponent extends VirtualHelperBaseDirective {
    @ViewChild('horizontal_container', { read: ViewContainerRef, static: true }) public _vcr;

    @Input() public width: number;

    @HostBinding('class')
    public cssClasses = 'igx-vhelper--horizontal';

    constructor() {
        const elementRef = inject(ElementRef);
        const cdr = inject(ChangeDetectorRef);
        const zone = inject(NgZone);
        const document = inject(DOCUMENT);
        const platformUtil = inject(PlatformUtil);

        super(elementRef, cdr, zone, document, platformUtil);
    }

    protected override restoreScroll() {
        this.nativeElement.scrollLeft = this.scrollAmount;
    }
}
