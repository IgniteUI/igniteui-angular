import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef, ChangeDetectorRef, OnDestroy, OnInit, NgZone, inject } from '@angular/core';
import { VirtualHelperBaseDirective } from './base.helper.component';
import { DOCUMENT } from '@angular/common';
import { PlatformUtil } from '../../core/utils';

@Component({
    selector: 'igx-virtual-helper',
    template: '<div #container class="igx-vhelper__placeholder-content" [style.height.px]="size"></div>',
    standalone: true
})
export class VirtualHelperComponent extends VirtualHelperBaseDirective implements OnInit, OnDestroy  {
    @HostBinding('scrollTop')
    public scrollTop;

    public scrollWidth;

    @ViewChild('container', { read: ViewContainerRef, static: true }) public _vcr;
    @Input() public itemsLength: number;

    @HostBinding('class')
    public cssClasses = 'igx-vhelper--vertical';

    constructor() {
        const elementRef = inject(ElementRef);
        const cdr = inject(ChangeDetectorRef);
        const zone = inject(NgZone);
        const document = inject(DOCUMENT);
        const platformUtil = inject(PlatformUtil);

        super(elementRef, cdr, zone, document, platformUtil);
    }

    public ngOnInit() {
        this.scrollWidth = this.scrollNativeSize;
        this.document.documentElement.style.setProperty(
            '--vhelper-scrollbar-size',
            `${this.scrollNativeSize}px`
        );
    }

    protected override restoreScroll() {
        this.nativeElement.scrollTop = this.scrollAmount;
    }
}
