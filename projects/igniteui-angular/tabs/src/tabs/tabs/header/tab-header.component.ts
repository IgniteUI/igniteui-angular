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
import { IgxTabItemDirective } from '../../tab-item.directive';
import { IgxTabHeaderBase } from '../../tabs.base';
import { IgxTabsComponent } from './../tabs.component';
import { getResizeObserver, isLeftToRight, modulo } from 'igniteui-angular/core';

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
        const itemsArray = this.tabs.items.toArray();
        const index = itemsArray.indexOf(this.tab);
        let newIndex: number;

        switch (event.key) {
            case this.platform.KEYMAP.ARROW_RIGHT:
            case this.platform.KEYMAP.ARROW_LEFT: {
                const rtl = !isLeftToRight(this.nativeElement);
                const next = (event.key === this.platform.KEYMAP.ARROW_RIGHT) !== rtl;
                newIndex = this.getEnabledItemIndex(itemsArray, index, next ? 1 : -1);
                break;
            }
            case this.platform.KEYMAP.HOME:
                event.preventDefault();
                newIndex = this.getEnabledItemIndex(itemsArray, -1, 1);
                break;
            case this.platform.KEYMAP.END:
                event.preventDefault();
                newIndex = this.getEnabledItemIndex(itemsArray, itemsArray.length, -1);
                break;
            case this.platform.KEYMAP.ENTER:
            case this.platform.KEYMAP.SPACE:
                event.preventDefault();
                if (this.tabs.activation === 'manual') {
                    this.nativeElement.click();
                }
                return;
            default:
                return;
        }

        if (newIndex < 0) {
            return;
        }

        itemsArray[newIndex].headerComponent.nativeElement.focus({ preventScroll: true });
        if (this.tabs.activation === 'auto') {
            this.tabs.selectedIndex = newIndex;
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
