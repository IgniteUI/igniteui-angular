import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef, ChangeDetectorRef, OnDestroy } from '@angular/core';

@Component({
    selector: 'igx-virtual-helper',
    template: '<div #container class="igx-vhelper__placeholder-content" [style.height.px]="height"></div>'
})
export class VirtualHelperComponent implements OnDestroy {
    @HostBinding('scrollTop')
    public scrollTop;

    @ViewChild('container', { read: ViewContainerRef, static: true }) public _vcr;
    @Input() public itemsLength: number;

    public set height(value) {
        if (this.destroyed) {
            return;
        }
        this._height = value;
        this.cdr.detectChanges();
    }

    public get height() {
        return this._height;
    }

    @HostBinding('class')
    public cssClasses = 'igx-vhelper--vertical';

    public destroyed;
    private _height: number;

    constructor(public elementRef: ElementRef, public cdr: ChangeDetectorRef) { }

    public ngOnDestroy() {
        this.destroyed = true;
    }

}
