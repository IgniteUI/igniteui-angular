import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef,
    ChangeDetectorRef, OnDestroy, OnInit, Inject, NgZone, DOCUMENT, Renderer2,
    PLATFORM_ID} from '@angular/core';
import { VirtualHelperBaseDirective } from './base.helper.component';
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
