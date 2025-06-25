import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef, ChangeDetectorRef, Inject, NgZone, Renderer2, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { VirtualHelperBaseDirective } from './base.helper.component';
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

    constructor(
        elementRef: ElementRef,
        cdr: ChangeDetectorRef,
        zone: NgZone,
        @Inject(DOCUMENT) document: any,
        platformUtil: PlatformUtil,
        renderer: Renderer2,
        @Inject(PLATFORM_ID) platformId: Object,
        ngZone: NgZone
    ) {
        super(elementRef, cdr, zone, document, platformUtil, renderer, platformId, ngZone);
    }

    protected override restoreScroll() {
        this.nativeElement.scrollLeft = this.scrollAmount;
    }
}
