import { AnimationBuilder } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, HostBinding, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { mkenum } from '../../core/utils';
import { IgxTabsBase } from '../tabs.base';
import { IgxTabsDirective } from '../tabs.directive';
import ResizeObserver from 'resize-observer-polyfill';

export const IgxTabsAlignment = mkenum({
    start: 'start',
    end: 'end',
    center: 'center',
    justify: 'justify'
});

/** @hidden */
enum TabScrollButtonStyle {
    Visible = 'visible',
    Hidden = 'hidden',
    NotDisplayed = 'not_displayed'
}

const getTabItemsContainerWidth = (tabs: IgxTabsComponent) => {
    // We use this hacky way to get the width of the itemsContainer,
    // because there is inconsistency in IE we cannot use offsetWidth or scrollOffset.
    const itemsContainerChildrenCount = tabs.itemsContainer.nativeElement.children.length;
    let itemsContainerWidth = 0;
    if (itemsContainerChildrenCount > 1) {
        const lastTab = tabs.itemsContainer.nativeElement.children[itemsContainerChildrenCount - 2] as HTMLElement;
        itemsContainerWidth = lastTab.offsetLeft + lastTab.offsetWidth;
    }

    return itemsContainerWidth;
};

export type IgxTabsAlignment = (typeof IgxTabsAlignment)[keyof typeof IgxTabsAlignment];

/** @hidden */
let NEXT_TAB_ID = 0;

/**
 * Tabs component is used to organize or switch between similar data sets.
 *
 * @igxModule IgxTabsModule
 *
 * @igxTheme igx-tabs-theme
 *
 * @igxKeywords tabs
 *
 * @igxGroup Layouts
 *
 * @remarks
 * The Ignite UI for Angular Tabs component places tabs at the top and allows for scrolling when there are multiple tab items on the screen.
 *
 * @example
 * ```html
 * <igx-tabs>
 *     <igx-tab-item>
 *         <igx-tab-header>
 *             <igx-icon igxTabHeaderIcon>folder</igx-icon>
 *             <span igxTabHeaderLabel>Tab 1</span>
 *         </igx-tab-header>
 *         <igx-tab-content>
 *             Content 1
 *         </igx-tab-content>
 *     </igx-tab-item>
 *     ...
 * </igx-tabs>
 * ```
 */
@Component({
    selector: 'igx-tabs',
    templateUrl: 'tabs.component.html',
    providers: [{ provide: IgxTabsBase, useExisting: IgxTabsComponent }]
})

export class IgxTabsComponent extends IgxTabsDirective implements AfterViewInit, OnDestroy {

    /**
     * An @Input property which determines the tab alignment. Defaults to `start`.
     */
    @Input()
    public get tabAlignment(): string | IgxTabsAlignment {
        return this._tabAlignment;
    };

    public set tabAlignment(value: string | IgxTabsAlignment) {
        this._tabAlignment = value;
        requestAnimationFrame(() => {
            this.realignSelectedIndicator();
        });
    }

    /** @hidden */
    @ViewChild('headerContainer', { static: true })
    public headerContainer: ElementRef<HTMLElement>;

    /** @hidden */
    @ViewChild('viewPort', { static: true })
    public viewPort: ElementRef<HTMLElement>;

    /** @hidden */
    @ViewChild('itemsContainer', { static: true })
    public itemsContainer: ElementRef<HTMLElement>;

    /** @hidden */
    @ViewChild('selectedIndicator')
    public selectedIndicator: ElementRef<HTMLElement>;

    /** @hidden */
    @ViewChild('leftButton')
    public leftButton: ElementRef<HTMLElement>;

    /** @hidden */
    @ViewChild('rightButton')
    public rightButton: ElementRef<HTMLElement>;

    /** @hidden */
    @HostBinding('class.igx-tabs')
    public defaultClass = true;

    /**  @hidden */
     public offset = 0;

    /** @hidden */
    protected componentName = 'igx-tabs';

    private _tabAlignment: string | IgxTabsAlignment = 'start';
    private _resizeObserver: ResizeObserver;

    constructor(builder: AnimationBuilder, private ngZone: NgZone) {
        super(builder);
    }


    /** @hidden @internal */
    public ngAfterViewInit(): void {
        super.ngAfterViewInit();

        this.ngZone.runOutsideAngular(() => {
            this._resizeObserver = new ResizeObserver(() => {
                Promise.resolve().then(() => {
                    this.setTabRightButtonStyle();
                    this.setTabLeftButtonStyle();
                });
            });
            this._resizeObserver.observe(this.headerContainer.nativeElement);
            this._resizeObserver.observe(this.viewPort.nativeElement);
            this._resizeObserver.observe(this.itemsContainer.nativeElement);
        });
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        super.ngOnDestroy();

        this.ngZone.runOutsideAngular(() => {
            this._resizeObserver.disconnect();
        });
    }

    /** @hidden */
    public scrollLeft() {
        this.scroll(false);
    }

    /** @hidden */
    public scrollRight() {
        this.scroll(true);
    }

    /** @hidden */
    public realignSelectedIndicator() {
        if (this.selectedIndex >=0 && this.selectedIndex < this.items.length) {
            const header = this.items.get(this.selectedIndex).headerComponent.nativeElement;
            this.alignSelectedIndicator(header, 0);
        }
    }

    /** @hidden */
    public resolveTabLeftButtonClasses() {
        return 'igx-tabs__header-button';
    }

    /** @hidden */
    public resolveTabRightButtonClasses() {
        return 'igx-tabs__header-button';
    }

    /** @hidden */
    public resolveHeaderScrollClasses() {
        return {
            'igx-tabs__header-scroll': true,
            'igx-tabs__header-scroll--start': this.tabAlignment === 'start',
            'igx-tabs__header-scroll--end': this.tabAlignment === 'end',
            'igx-tabs__header-scroll--center': this.tabAlignment === 'center',
            'igx-tabs__header-scroll--justify': this.tabAlignment === 'justify',
        };
    }

    /** @hidden */
    protected scrollTabHeaderIntoView() {
        if (this.selectedIndex >= 0) {
            const tabItems = this.items.toArray();
            const tabHeaderNativeElement = tabItems[this.selectedIndex].headerComponent.nativeElement;

            // Scroll left if there is need
            if (tabHeaderNativeElement.offsetLeft < this.offset) {
                this.scrollElement(tabHeaderNativeElement, false);
            }

            // Scroll right if there is need
            const viewPortOffsetWidth = this.viewPort.nativeElement.offsetWidth;
            const delta = (tabHeaderNativeElement.offsetLeft + tabHeaderNativeElement.offsetWidth) - (viewPortOffsetWidth + this.offset);

            // Fix for IE 11, a difference is accumulated from the widths calculations
            if (delta > 1) {
                this.scrollElement(tabHeaderNativeElement, true);
            }

            this.alignSelectedIndicator(tabHeaderNativeElement);
        } else {
            this.hideSelectedIndicator();
        }
    }

    /** @hidden */
    protected getNextTabId() {
        return NEXT_TAB_ID++;
    }

    private alignSelectedIndicator(element: HTMLElement, duration = 0.3): void {
        if (this.selectedIndicator) {
            this.selectedIndicator.nativeElement.style.visibility = 'visible';
            this.selectedIndicator.nativeElement.style.transitionDuration = duration > 0 ? `${duration}s` : 'initial';
            this.selectedIndicator.nativeElement.style.width = `${element.offsetWidth}px`;
            this.selectedIndicator.nativeElement.style.transform = `translate(${element.offsetLeft}px)`;
        }
    }

    private hideSelectedIndicator(): void {
        if (this.selectedIndicator) {
            this.selectedIndicator.nativeElement.style.visibility = 'hidden';
        }
    }

    private scroll(scrollRight: boolean): void {
        const tabsArray = this.items.toArray();
        for (const tab of tabsArray) {
            const element = tab.headerComponent.nativeElement;
            if (scrollRight) {
                if (element.offsetWidth + element.offsetLeft > this.viewPort.nativeElement.offsetWidth + this.offset) {
                    this.scrollElement(element, scrollRight);
                    break;
                }
            } else {
                if (element.offsetWidth + element.offsetLeft >= this.offset) {
                    this.scrollElement(element, scrollRight);
                    break;
                }
            }
        }
    }

    private scrollElement(element: any, scrollRight: boolean): void {
        const viewPortWidth = this.viewPort.nativeElement.offsetWidth;

        this.offset = (scrollRight) ? element.offsetWidth + element.offsetLeft - viewPortWidth : element.offsetLeft;
        this.itemsContainer.nativeElement.style.transform = `translate(${-this.offset}px)`;
        Promise.resolve().then (() => {
            this.setTabLeftButtonStyle();
            this.setTabRightButtonStyle();
        });
    }

    private setTabLeftButtonStyle() {
        const tabLeftButtonStyle = this.tabLeftButtonStyle();

        if (tabLeftButtonStyle === TabScrollButtonStyle.Visible) {
            this.leftButton.nativeElement.style.visibility = 'visible';
            this.leftButton.nativeElement.style.display = '';
        }
        if (tabLeftButtonStyle === TabScrollButtonStyle.Hidden) {
            this.leftButton.nativeElement.style.visibility = 'hidden';
            this.leftButton.nativeElement.style.display = '';
        }
        if (tabLeftButtonStyle === TabScrollButtonStyle.NotDisplayed) {
            this.leftButton.nativeElement.style.display = 'none';
        }
    }

    private setTabRightButtonStyle() {
        const tabRightButtonStyle = this.tabRightButtonStyle();

        if (tabRightButtonStyle === TabScrollButtonStyle.Visible) {
            this.rightButton.nativeElement.style.visibility = 'visible';
            this.rightButton.nativeElement.style.display = '';
        }
        if (tabRightButtonStyle === TabScrollButtonStyle.Hidden) {
            this.rightButton.nativeElement.style.visibility = 'hidden';
            this.rightButton.nativeElement.style.display = '';
        }
        if (tabRightButtonStyle === TabScrollButtonStyle.NotDisplayed) {
            this.rightButton.nativeElement.style.display = 'none';
        }
    }

    private tabLeftButtonStyle(): string {
        const itemsContainerWidth = getTabItemsContainerWidth(this);
        const headerContainerWidth = this.headerContainer.nativeElement.offsetWidth;
        const offset = this.offset;

        if (offset === 0) {
            // Fix for IE 11, a difference is accumulated from the widths calculations.
            if (itemsContainerWidth - headerContainerWidth <= 1) {
                return TabScrollButtonStyle.NotDisplayed;
            }
            return TabScrollButtonStyle.Hidden;
        } else {
            return TabScrollButtonStyle.Visible;
        }
    }

    private tabRightButtonStyle(): string {
        const viewPortWidth = this.viewPort.nativeElement.offsetWidth;
        const itemsContainerWidth = getTabItemsContainerWidth(this);
        const headerContainerWidth = this.headerContainer.nativeElement.offsetWidth;
        const offset = this.offset;
        const total = offset + viewPortWidth;

        // Fix for IE 11, a difference is accumulated from the widths calculations.
        if (itemsContainerWidth - headerContainerWidth <= 1 && offset === 0) {
            return TabScrollButtonStyle.NotDisplayed;
        }

        if (itemsContainerWidth > total) {
            return TabScrollButtonStyle.Visible;
        } else {
            return TabScrollButtonStyle.Hidden;
        }
    }
}

