import { AfterViewInit, Component, ElementRef, HostBinding, HostListener, NgZone, OnDestroy } from '@angular/core';
import { IgxTabItemDirective } from '../tab-item.directive';
import { IgxTabHeaderDirective } from '../tab-header.directive';
import { IgxTabHeaderBase } from '../tabs.base';
import { IgxTabsComponent } from './tabs.component';
import ResizeObserver from 'resize-observer-polyfill';
import { KEYS } from '../../core/utils';

@Component({
    selector: 'igx-tab-header',
    templateUrl: 'tab-header.component.html',
    providers: [{ provide: IgxTabHeaderBase, useExisting: IgxTabHeaderComponent }]
})
export class IgxTabHeaderComponent extends IgxTabHeaderDirective implements AfterViewInit, OnDestroy {

    /** @hidden */
    @HostBinding('class.igx-tabs__header-item--selected')
    public get provideCssClassSelected(): boolean {
        return this.tab.selected;
    }

    /** @hidden */
    @HostBinding('class.igx-tabs__header-item--disabled')
    public get provideCssClassDisabled(): boolean {
        return this.tab.disabled;
    }

    /** @hidden */
    @HostBinding('class.igx-tabs__header-item')
    public cssClass = true;

    private _resizeObserver: ResizeObserver;

    /** @hidden */
    constructor(protected tabs: IgxTabsComponent, tab: IgxTabItemDirective, elementRef: ElementRef, private ngZone: NgZone) {
        super(tabs, tab, elementRef);
    }

     /** @hidden */
    @HostListener('keydown', ['$event'])
    public keyDown(event: KeyboardEvent) {
        let unsupportedKey = false;
        const itemsArray = this.tabs.items.toArray();
        const previousIndex = itemsArray.indexOf(this.tab);
        let newIndex = previousIndex;
        const hasDisabledItems = itemsArray.some((item) => item.disabled);
        switch (event.key) {
            case KEYS.RIGHT_ARROW:
            case KEYS.RIGHT_ARROW_IE:
                newIndex = newIndex === itemsArray.length - 1 ? 0 : newIndex + 1;
                while (hasDisabledItems && itemsArray[newIndex].disabled && newIndex < itemsArray.length) {
                    newIndex = newIndex === itemsArray.length - 1 ? 0 : newIndex + 1;
                }
                break;
            case KEYS.LEFT_ARROW:
            case KEYS.LEFT_ARROW_IE:
                newIndex = newIndex === 0 ? itemsArray.length - 1 : newIndex - 1;
                while (hasDisabledItems && itemsArray[newIndex].disabled && newIndex >= 0) {
                    newIndex = newIndex === 0 ? itemsArray.length - 1 : newIndex - 1;
                }
                break;
            case KEYS.HOME:
                event.preventDefault();
                newIndex = 0;
                while (itemsArray[newIndex].disabled && newIndex < itemsArray.length) {
                    newIndex = newIndex === itemsArray.length - 1 ? 0 : newIndex + 1;
                }
                break;
            case KEYS.END:
                event.preventDefault();
                newIndex = itemsArray.length - 1;
                while (hasDisabledItems && itemsArray[newIndex].disabled && newIndex > 0) {
                    newIndex = newIndex === 0 ? itemsArray.length - 1 : newIndex - 1;
                }
                break;
            case KEYS.ENTER:
                if (!this.tab.panelComponent) {
                    this.nativeElement.click();
                }
                unsupportedKey = true;
                break;
            case KEYS.SPACE:
            case KEYS.SPACE_IE:
                event.preventDefault();

                if (!this.tab.panelComponent) {
                    this.nativeElement.click();
                }
                unsupportedKey = true;
                break;
            default:
                unsupportedKey = true;
                break;
        }

        if (!unsupportedKey) {
            itemsArray[newIndex].headerComponent.nativeElement.focus();
            if (this.tab.panelComponent) {
                this.tabs.selectedIndex = newIndex;
            }
        }
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

