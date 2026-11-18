import {
    AfterViewInit,
    Component,
    HostBinding,
    NgZone,
    OnDestroy,
    inject,
    ChangeDetectionStrategy,
    ViewEncapsulation,
} from '@angular/core';
import { IgxTabHeaderDirective } from '../../tab-header.directive';
import { IgxTabItemDirective } from '../../tab-item.directive';
import { IgxTabHeaderBase } from '../../tabs.base';
import { IgxTabsComponent } from './../tabs.component';
import {
    IgxKeyBindingsService,
    arrowDown,
    arrowLeft,
    arrowRight,
    arrowUp,
    endKey,
    getResizeObserver,
    homeKey,
    isLeftToRight,
    modulo
} from 'igniteui-angular/core';

@Component({
    selector: 'igx-tab-header',
    templateUrl: 'tab-header.component.html',
    styleUrl: 'tab-header.component.css',
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: IgxTabHeaderBase, useExisting: IgxTabHeaderComponent }, IgxKeyBindingsService],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class IgxTabHeaderComponent extends IgxTabHeaderDirective implements AfterViewInit, OnDestroy {
    protected override tabs = inject(IgxTabsComponent);
    private ngZone = inject(NgZone);
    private readonly _keyBindings = inject(IgxKeyBindingsService);

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

    constructor() {
        super();
        this._keyBindings
            .configure({ bindingDefaults: { repeat: true } })
            .set(arrowLeft, (event) => this.onArrowKey(event), { preventDefault: false })
            .set(arrowRight, (event) => this.onArrowKey(event), { preventDefault: false })
            .set(arrowUp, (event) => this.onArrowKey(event), { preventDefault: false })
            .set(arrowDown, (event) => this.onArrowKey(event), { preventDefault: false })
            .set(homeKey, () => this.focusItem((items) => this.getEnabledItemIndex(items, -1, 1)))
            .set(endKey, () => this.focusItem((items) => this.getEnabledItemIndex(items, items.length, -1)))
            .setActivateHandler(() => this.onActivationKey());
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

    private onArrowKey(event: KeyboardEvent): void {
        const vertical = this.tabs.verticalHeaders();
        const rtl = !isLeftToRight(this.nativeElement);
        const nextKey = vertical ? arrowDown : rtl ? arrowLeft : arrowRight;
        const prevKey = vertical ? arrowUp : rtl ? arrowRight : arrowLeft;

        if (event.key !== nextKey && event.key !== prevKey) {
            return;
        }
        if (vertical) {
            event.preventDefault();
        }

        const step = event.key === nextKey ? 1 : -1;
        this.focusItem((items) => this.getEnabledItemIndex(items, items.indexOf(this.tab), step));
    }

    private onActivationKey(): void {
        if (this.tabs.activation === 'manual') {
            this.nativeElement.click();
        }
    }

    /** Focuses the header at the index that `getIndex` returns and selects it in auto activation. */
    private focusItem(getIndex: (items: IgxTabItemDirective[]) => number): void {
        const items = this.tabs.items.toArray();
        const index = getIndex(items);
        if (index < 0) {
            return;
        }

        const header = items[index].headerComponent.nativeElement;
        header.focus({ preventScroll: true });
        if (this.tabs.activation === 'auto') {
            this.tabs.selectedIndex = index;
        }
        this.tabs.scrollToHeader(header);
    }

    private getEnabledItemIndex(itemsArray: IgxTabItemDirective[], start: number, step: 1 | -1): number {
        for (let i = 1; i <= itemsArray.length; i++) {
            const index = modulo(start + step * i, itemsArray.length);
            if (!itemsArray[index].disabled) {
                return index;
            }
        }
        return -1;
    }
}
