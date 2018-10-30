import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef, ChangeDetectorRef, OnDestroy } from '@angular/core';

@Component({
    selector: 'igx-virtual-helper',
    template: '<div #container class="igx-vhelper__placeholder-content" [style.height.px]="height"></div>'
})
export class VirtualHelperComponent implements OnDestroy {
    @ViewChild('container', { read: ViewContainerRef }) public _vcr;
    @Input() public itemsLength: number;
    public height: number;

    @HostBinding('class')
    public cssClasses = 'igx-vhelper--vertical';

    public destroyed;

    constructor(public elementRef: ElementRef, public cdr: ChangeDetectorRef) { }

    public ngOnDestroy() {
        this.destroyed = true;
    }

}
