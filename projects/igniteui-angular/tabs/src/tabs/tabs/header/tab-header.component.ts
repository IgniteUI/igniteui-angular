import {
    AfterViewInit,
    Component,
    HostBinding,
    HostListener,
    NgZone,
    OnDestroy,
    inject,
    ChangeDetectionStrategy,
    ViewEncapsulation,
} from '@angular/core';
import { IgxTabHeaderDirective } from '../../tab-header.directive';
import { IgxTabHeaderBase } from '../../tabs.base';
import { IgxTabsComponent } from './../tabs.component';
import { getResizeObserver, isLeftToRight } from 'igniteui-angular/core';

@Component({
    selector: 'igx-tab-header',
    templateUrl: 'tab-header.component.html',
    styleUrl: 'tab-header.component.css',
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: IgxTabHeaderBase, useExisting: IgxTabHeaderComponent }],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class IgxTabHeaderComponent extends IgxTabHeaderDirective implements AfterViewInit, OnDestroy {
    protected override tabs = inject(IgxTabsComponent);
    private ngZone = inject(NgZone);

    /** @hidden @internal */
    @HostBinding('class.igx-tab-header--selected')
    public get provideCssClassSelected(): boolean {
        return this.tab.selected;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-tab-header--disabled')
    public get provideCssClassDisabled(): boolean {
        return this.tab.disabled;
    }

    /** @hidden @internal */
    @HostBinding('class.igx-tab-header--justify')
    public get applyJustifyClass(): boolean {
        return this.tabs.tabAlignment === 'justify'; // Correctly accessing tabsAlignment
    }

    /** @hidden @internal */
    @HostBinding('class.igx-tab-header')
    public cssClass = true;

    private _resizeObserver!: ResizeObserver;

    /** @hidden @internal */
    @HostListener('keydown', ['$event'])
    public keyDown(event: KeyboardEvent) {
        let unsupportedKey = false;
        const itemsArray = this.tabs.items.toArray();
        const previousIndex = itemsArray.indexOf(this.tab);
        let newIndex = previousIndex;
        const hasDisabledItems = itemsArray.some((item) => item.disabled);
        const { ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT } = this.platform.KEYMAP;
        const vertical = this.tabs.verticalHeaders();
        const rtl = !isLeftToRight(this.nativeElement);
        const nextKey = vertical ? ARROW_DOWN : rtl ? ARROW_LEFT : ARROW_RIGHT;
        const prevKey = vertical ? ARROW_UP : rtl ? ARROW_RIGHT : ARROW_LEFT;

        switch (event.key) {
            case nextKey:
            case prevKey:
                if (vertical) {
                    event.preventDefault();
                }
                newIndex = this.getNewSelectionIndex(newIndex, itemsArray, event.key === nextKey, hasDisabledItems);
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
            const header = itemsArray[newIndex].headerComponent.nativeElement;
            header.focus({ preventScroll: true });
            if (this.tabs.activation === 'auto') {
                this.tabs.selectedIndex = newIndex;
            }
            this.tabs.scrollToHeader(header);
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

    private getNewSelectionIndex(newIndex: number, itemsArray: any[], next: boolean, hasDisabledItems: boolean): number {
        if (next) {
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
