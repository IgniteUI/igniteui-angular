import { AfterViewInit, Component, ElementRef, HostBinding, HostListener, NgZone, OnDestroy } from '@angular/core';
import { IgxTabItemDirective } from '../tab-item.directive';
import { IgxTabHeaderDirective } from '../tab-header.directive';
import { IgxTabHeaderBase } from '../tabs.base';
import { IgxTabsComponent } from './tabs.component';
import { getResizeObserver } from '../../core/utils';
import { PlatformUtil } from '../../core/utils';
import { IgxDirectionality } from '../../services/direction/directionality';

@Component({
    selector: 'igx-tab-header',
    templateUrl: 'tab-header.component.html',
    providers: [{ provide: IgxTabHeaderBase, useExisting: IgxTabHeaderComponent }],
    standalone: true
})
export class IgxTabHeaderComponent extends IgxTabHeaderDirective implements AfterViewInit, OnDestroy {

    /** @hidden @internal */
    @HostBinding('class.igx-tabs__header-item--selected')
    public get provideCssClassSelected(): boolean {
        return this.tab.selected;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-tabs__header-item--disabled')
    public get provideCssClassDisabled(): boolean {
        return this.tab.disabled;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-tabs__header-item')
    public cssClass = true;

    private _resizeObserver: ResizeObserver;

    /** @hidden @internal */
    constructor(
        protected override tabs: IgxTabsComponent,
        tab: IgxTabItemDirective,
        elementRef: ElementRef<HTMLElement>,
        platform: PlatformUtil,
        private ngZone: NgZone,
        private dir: IgxDirectionality
    ) {
        super(tabs, tab, elementRef, platform);
    }

    /** @hidden @internal */
    @HostListener('keydown', ['$event'])
    public keyDown(event: KeyboardEvent) {
        let unsupportedKey = false;
        const itemsArray = this.tabs.items.toArray();
        const previousIndex = itemsArray.indexOf(this.tab);
        let newIndex = previousIndex;
        const hasDisabledItems = itemsArray.some((item) => item.disabled);

        switch (event.key) {
            case this.platform.KEYMAP.ARROW_RIGHT:
                newIndex = this.getNewSelectionIndex(newIndex, itemsArray, event.key, hasDisabledItems);
                break;
            case this.platform.KEYMAP.ARROW_LEFT:
                newIndex = this.getNewSelectionIndex(newIndex, itemsArray, event.key, hasDisabledItems);
                break;
            case this.platform.KEYMAP.HOME:
                event.preventDefault();
                newIndex = 0;
                while (itemsArray[newIndex].disabled && newIndex < itemsArray.length) {
                    newIndex = newIndex === itemsArray.length - 1 ? 0 : newIndex + 1;
                }
                break;
            case this.platform.KEYMAP.END:
                event.preventDefault();
                newIndex = itemsArray.length - 1;
                while (hasDisabledItems && itemsArray[newIndex].disabled && newIndex > 0) {
                    newIndex = newIndex === 0 ? itemsArray.length - 1 : newIndex - 1;
                }
                break;
            case this.platform.KEYMAP.ENTER:
            case this.platform.KEYMAP.SPACE:
                event.preventDefault();
                if (this.tabs.activation === 'manual') {
                    this.nativeElement.click();
                }
                unsupportedKey = true;
                break;
            default:
                unsupportedKey = true;
                break;
        }

        if (!unsupportedKey) {
            itemsArray[newIndex].headerComponent.nativeElement.focus({ preventScroll: true });
            if (this.tabs.activation === 'auto') {
                this.tabs.selectedIndex = newIndex;
            }
        }
    }

    /** @hidden @internal */
    public ngAfterViewInit(): void {
        this.ngZone.runOutsideAngular(() => {
            if (this.platform.isBrowser) {
                this._resizeObserver = new (getResizeObserver())(() => {
                    this.tabs.realignSelectedIndicator();
                });
                this._resizeObserver.observe(this.nativeElement);
            }
        });
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        this.ngZone.runOutsideAngular(() => {
            this._resizeObserver?.disconnect();
        });
    }

    private getNewSelectionIndex(newIndex: number, itemsArray: any[], key: string, hasDisabledItems: boolean): number {
        if ((key === this.platform.KEYMAP.ARROW_RIGHT && !this.dir.rtl) || (key === this.platform.KEYMAP.ARROW_LEFT && this.dir.rtl)) {
            newIndex = newIndex === itemsArray.length - 1 ? 0 : newIndex + 1;
            while (hasDisabledItems && itemsArray[newIndex].disabled && newIndex < itemsArray.length) {
                newIndex = newIndex === itemsArray.length - 1 ? 0 : newIndex + 1;
            }
        } else {
            newIndex = newIndex === 0 ? itemsArray.length - 1 : newIndex - 1;
            while (hasDisabledItems && itemsArray[newIndex].disabled && newIndex >= 0) {
                newIndex = newIndex === 0 ? itemsArray.length - 1 : newIndex - 1;
            }
        }
        return newIndex;
    }
}
