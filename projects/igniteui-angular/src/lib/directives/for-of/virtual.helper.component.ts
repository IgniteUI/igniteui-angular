import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef,
     ChangeDetectorRef, OnDestroy, Inject, NgZone } from '@angular/core';
import { VirtualHelperBaseDirective } from './base.helper.component';
import { DOCUMENT } from '@angular/common';
import { PlatformUtil } from '../../core/utils';

@Component({
    selector: 'igx-virtual-helper',
    template: '<div #container class="igx-vhelper__placeholder-content" [style.height.px]="size"></div>',
    standalone: true
})
export class VirtualHelperComponent extends VirtualHelperBaseDirective implements OnDestroy  {
    @HostBinding('scrollTop')
    public scrollTop;

    @HostBinding('style.--igx-vhelper--scrollbar-size')
    public get scrollbarSize(): string {
        const value = `${this.scrollNativeSize}px`;
        this.document.documentElement.style.setProperty('--igx-vhelper--scrollbar-size', value);
        return value;
    }

    @ViewChild('container', { read: ViewContainerRef, static: true }) public _vcr;
    @Input() public itemsLength: number;

    @HostBinding('class')
    public cssClasses = 'igx-vhelper--vertical';

    constructor(elementRef: ElementRef, cdr: ChangeDetectorRef, zone: NgZone, @Inject(DOCUMENT) document, platformUtil: PlatformUtil) {
        super(elementRef, cdr, zone, document, platformUtil);
    }

    protected override restoreScroll() {
        this.nativeElement.scrollTop = this.scrollAmount;
    }
}
