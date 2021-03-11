import { AfterViewInit, Component, ElementRef, HostBinding, NgZone, OnDestroy } from '@angular/core';
import { IgxTabItemDirective } from '../tab-item.directive';
import { IgxTabHeaderDirective } from '../tab-header.directive';
import { IgxTabHeaderBase } from '../tabs.base';
import { IgxTabsComponent } from './tabs.component';
import ResizeObserver from 'resize-observer-polyfill';

@Component({
    selector: 'igx-tab-header',
    templateUrl: 'tab-header.component.html',
    providers: [{ provide: IgxTabHeaderBase, useExisting: IgxTabHeaderComponent }]
})
export class IgxTabHeaderComponent extends IgxTabHeaderDirective implements AfterViewInit, OnDestroy {
    private _resizeObserver: ResizeObserver;

    /** @hidden */
    @HostBinding('class.igx-tabs__header-menu-item--selected')
    public get provideCssClassSelected(): boolean {
        return this.tab.selected;
    }

    /** @hidden */
    @HostBinding('class.igx-tabs__header-menu-item--disabled')
    public get provideCssClassDisabled(): boolean {
        return this.tab.disabled;
    }

    /** @hidden */
    @HostBinding('class.igx-tabs__header-menu-item')
    public get provideCssClass(): boolean {
        return (!this.tab.disabled && !this.tab.selected);
    }

    /** @hidden */
    constructor(protected tabs: IgxTabsComponent, tab: IgxTabItemDirective, elementRef: ElementRef, private ngZone: NgZone) {
        super(tabs, tab, elementRef);
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        this.ngZone.runOutsideAngular(() => {
            this._resizeObserver = new ResizeObserver(() => {
                this.tabs.realignSelectedIndicator();
            });
            this._resizeObserver.observe(this.nativeElement);
        });
    }

    /** @hidden */
    public ngOnDestroy(): void {
        this.ngZone.runOutsideAngular(() => {
            this._resizeObserver.disconnect();
        });
    }
}
