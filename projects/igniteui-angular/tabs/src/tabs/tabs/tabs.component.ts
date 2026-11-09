import {
    AfterViewInit,
    Component,
    ElementRef,
    HostBinding,
    Input,
    NgZone,
    OnDestroy,
    ViewChild,
    afterNextRender,
    afterRenderEffect,
    computed,
    inject,
    signal,
    untracked,
    ChangeDetectionStrategy,
    ViewEncapsulation,
} from '@angular/core';
import { IgxTabsBase } from '../tabs.base';
import { IgxTabsDirective } from '../tabs.directive';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { IgxIconButtonDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { getResizeObserver, PlatformUtil, isLeftToRight } from 'igniteui-angular/core';

export const IgxTabsAlignment = {
    start: 'start',
    end: 'end',
    center: 'center',
    justify: 'justify'
} as const;

/** @hidden */
const enum TabScrollButtonStyle {
    Enabled = 'enabled',
    Disabled = 'disabled',
    NotDisplayed = 'not_displayed'
}

export type IgxTabsAlignment = (typeof IgxTabsAlignment)[keyof typeof IgxTabsAlignment];

/** The side of the content on which `igx-tabs` places its tab headers. */
export const IgxTabsHeaderPosition = {
    top: 'top',
    start: 'start',
    end: 'end'
} as const;

export type IgxTabsHeaderPosition = (typeof IgxTabsHeaderPosition)[keyof typeof IgxTabsHeaderPosition];

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
 * The Ignite UI for Angular Tabs component places tabs at the top, or before or after the content with `headerPosition`,
 * and allows for scrolling when there are multiple tab items on the screen.
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
    styleUrl: 'tabs.component.css',
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: IgxTabsBase, useExisting: IgxTabsComponent }],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRippleDirective, IgxIconComponent, NgClass, NgTemplateOutlet, IgxIconButtonDirective],
    host: {
        '[class.igx-tabs--start]': 'headerPosition === "start"',
        '[class.igx-tabs--end]': 'headerPosition === "end"'
    }
})

export class IgxTabsComponent extends IgxTabsDirective implements AfterViewInit, OnDestroy {
    private ngZone = inject(NgZone);
    private platform = inject(PlatformUtil);


    /**
     * Gets/Sets the tab alignment. Defaults to `start`.
     */
    @Input()
    public get tabAlignment(): string | IgxTabsAlignment {
        return this._tabAlignment;
    }

    public set tabAlignment(value: string | IgxTabsAlignment) {
        this._tabAlignment = value;
        requestAnimationFrame(() => {
            this.updateScrollButtons();
            this.realignSelectedIndicator();
        });
    }

    /**
     * Determines the tab activation.
     * When set to auto, the tab is instantly selected while navigating with the arrow keys (Left/Right in a row of headers,
     * Up/Down in a column), Home or End, and the corresponding panel is displayed.
     * When set to manual, the tab is only focused. The selection happens after pressing Space or Enter.
     * Defaults to auto.
     */
    @Input()
    public activation: 'auto' | 'manual' = 'auto';

    /**
     * The side of the content on which the tab headers are placed. Defaults to `top`.
     *
     * @remarks
     * `start` and `end` place the headers in a column before or after the content in the text direction,
     * so `start` is on the right in right-to-left layouts.
     * The column is navigated with the Up and Down arrow keys and scrolls when the headers do not fit in its height.
     *
     * @example
     * ```html
     * <igx-tabs headerPosition="start">...</igx-tabs>
     * ```
     */
    @Input()
    public get headerPosition(): IgxTabsHeaderPosition {
        return this._headerPosition();
    }

    public set headerPosition(value: IgxTabsHeaderPosition) {
        this._headerPosition.set(value);
    }

    /** @hidden @internal */
    public readonly verticalHeaders = computed(() => {
        const position = this._headerPosition();
        return position === IgxTabsHeaderPosition.start || position === IgxTabsHeaderPosition.end;
    });

    /** @hidden */
    @ViewChild('headerContainer', { static: true })
    public headerContainer!: ElementRef<HTMLElement>;

    /** @hidden */
    @ViewChild('viewPort', { static: true })
    public viewPort!: ElementRef<HTMLElement>;

    /** @hidden */
    @ViewChild('itemsWrapper', { static: true })
    public itemsWrapper!: ElementRef<HTMLElement>;

    /** @hidden */
    @ViewChild('itemsContainer', { static: true })
    public itemsContainer!: ElementRef<HTMLElement>;

    /** @hidden */
    @ViewChild('selectedIndicator')
    public selectedIndicator!: ElementRef<HTMLElement>;

    /** @hidden */
    @ViewChild('scrollPrevButton')
    public scrollPrevButton!: ElementRef<HTMLButtonElement>;

    /** @hidden */
    @ViewChild('scrollNextButton')
    public scrollNextButton!: ElementRef<HTMLButtonElement>;

    /** @hidden */
    @HostBinding('class.igx-tabs')
    public defaultClass = true;

    /**  @hidden */
    public offset = 0;

    /** @hidden */
    protected override componentName = 'igx-tabs';

    private _tabAlignment: string | IgxTabsAlignment = 'start';
    private readonly _headerPosition = signal<IgxTabsHeaderPosition>(IgxTabsHeaderPosition.top);
    private _resizeObserver!: ResizeObserver;
    private _layoutFrame = 0;
    private _headersRendered = false;

    constructor() {
        super();

        afterNextRender(() => this.updateHeaderLayout());

        let firstRun = true;
        afterRenderEffect(() => {
            this.verticalHeaders();
            if (!firstRun) {
                untracked(() => this.updateHeaderAxis());
            }
            firstRun = false;
        });
    }

    /** @hidden @internal */
    public override ngAfterViewInit(): void {
        super.ngAfterViewInit();

        this.ngZone.runOutsideAngular(() => {
            if (this.platform.isBrowser) {
                this._resizeObserver = new (getResizeObserver())((entries: ResizeObserverEntry[]) => {
                    // Toggling the scroll buttons resizes the viewport, and in a column it can resize the header container too.
                    // Only a row whose header container is notified can be updated in this frame without a "ResizeObserver loop" error.
                    if (!this.verticalHeaders() && entries.some(entry => entry.target === this.headerContainer.nativeElement)) {
                        this.updateHeaderLayout();
                    } else {
                        cancelAnimationFrame(this._layoutFrame);
                        this._layoutFrame = requestAnimationFrame(() => this.updateHeaderLayout());
                    }
                });
                this._resizeObserver.observe(this.headerContainer.nativeElement);
                this._resizeObserver.observe(this.viewPort.nativeElement);
                this._resizeObserver.observe(this.itemsContainer.nativeElement);
            }
        });
    }

    /** @hidden @internal */
    public override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.ngZone.runOutsideAngular(() => {
            this._resizeObserver?.disconnect();
            if (this._layoutFrame) {
                cancelAnimationFrame(this._layoutFrame);
            }
        });
    }

    /** @hidden */
    public scrollPrev() {
        this.scroll(false);
    }

    /** @hidden */
    public scrollNext() {
        this.scroll(true);
    }

    /** @hidden */
    public realignSelectedIndicator() {
        const header = this.selectedHeader;
        if (header) {
            this.alignSelectedIndicator(header, 0);
        }
    }

    /** @hidden */
    public resolveHeaderScrollClasses() {
        return {
            'igx-tabs-header-scroll--start': this.tabAlignment === 'start',
            'igx-tabs-header-scroll--end': this.tabAlignment === 'end',
            'igx-tabs-header-scroll--center': this.tabAlignment === 'center',
            'igx-tabs-header-scroll--justify': this.tabAlignment === 'justify',
        };
    }

    /** @hidden @internal */
    public scrollToHeader(header: HTMLElement): void {
        const headerOffset = this.getElementOffset(header);
        const headerSize = this.getElementSize(header);
        const viewPortSize = this.getElementSize(this.viewPort.nativeElement);

        if (headerOffset < this.offset || headerSize > viewPortSize) {
            this.scrollElement(header, false);
        } else if (headerOffset + headerSize - (viewPortSize + this.offset) > 1) {
            this.scrollElement(header, true);
        }
    }

    /** @hidden */
    protected override scrollTabHeaderIntoView() {
        const header = this.selectedHeader;

        if (header) {
            this.scrollToHeader(header);
            this.alignSelectedIndicator(header);
        } else {
            this.hideSelectedIndicator();
        }
    }

    /** @hidden */
    protected getNextTabId() {
        return NEXT_TAB_ID++;
    }

    /** @hidden */
    protected override onItemChanges() {
        // Taken before the selection settles, so that scroll buttons appearing or
        // disappearing because of this change show up as a different size below.
        const viewPortSize = this.getElementSize(this.viewPort.nativeElement);

        super.onItemChanges();

        Promise.resolve().then(() => {
            this.updateScrollButtons();

            // The selected tab is scrolled into view against the viewport size it had
            // when the selection settled. When the change made the header overflow, the
            // buttons that appeared shrink the viewport, so the tab has to be brought
            // back into view. Only then, so that adding or removing other tabs keeps a
            // header the user scrolled away from the selected tab where it is.
            if (this.getElementSize(this.viewPort.nativeElement) !== viewPortSize) {
                this.scrollTabHeaderIntoView();
            }
        });
    }

    private updateHeaderAxis(): void {
        // The headers are measured in their final size, without the transitions of the themes
        const headers = this.items.map(item => item.headerComponent.nativeElement);
        const transitions = headers.map(element => element.style.transition);
        headers.forEach(element => element.style.transition = 'none');

        this.offset = 0;
        this.viewPort.nativeElement.scrollLeft = 0;
        this.viewPort.nativeElement.scrollTop = 0;
        this.updateScrollButtons();

        const root = this._element.nativeElement.getRootNode() as Document | ShadowRoot;
        const header = headers.find(element => element.contains(root.activeElement)) ?? this.selectedHeader;
        if (header) {
            this.scrollToHeader(header);
        }

        this.realignSelectedIndicator();
        headers.forEach((element, i) => element.style.transition = transitions[i]);
    }

    private get selectedHeader(): HTMLElement | undefined {
        return this.selectedItem?.headerComponent.nativeElement;
    }

    private updateHeaderLayout(): void {
        const headersRendered = this.headerContainer.nativeElement.offsetWidth > 0;
        this.updateScrollButtons();

        if (headersRendered && !this._headersRendered && this.selectedHeader) {
            this.scrollToHeader(this.selectedHeader);
        }

        this._headersRendered = headersRendered;
        this.realignSelectedIndicator();
    }

    private alignSelectedIndicator(element: HTMLElement, duration = 0.3): void {
        if (this.selectedIndicator) {
            const indicatorStyle = this.selectedIndicator.nativeElement.style;
            indicatorStyle.visibility = 'visible';
            indicatorStyle.transitionDuration = duration > 0 ? `${duration}s` : 'initial';

            if (this.verticalHeaders()) {
                indicatorStyle.width = '';
                indicatorStyle.height = `${element.offsetHeight}px`;
                indicatorStyle.transform = `translateY(${element.offsetTop}px)`;
            } else {
                indicatorStyle.height = '';
                indicatorStyle.width = `${element.offsetWidth}px`;
                indicatorStyle.transform = `translate(${element.offsetLeft}px)`;
            }
        }
    }

    private hideSelectedIndicator(): void {
        if (this.selectedIndicator) {
            this.selectedIndicator.nativeElement.style.visibility = 'hidden';
        }
    }

    private scroll(scrollNext: boolean): void {
        const headers = this.items.map(item => item.headerComponent.nativeElement).filter(header => header.offsetParent !== null);
        const viewPortSize = this.getElementSize(this.viewPort.nativeElement);

        const header = scrollNext
            ? headers.find(element => this.getElementOffset(element) + this.getElementSize(element) > viewPortSize + this.offset)
            : headers.findLast(element => this.getElementOffset(element) < this.offset);

        if (header) {
            this.scrollElement(header, scrollNext);
        }
    }

    private scrollElement(element: HTMLElement, scrollNext: boolean): void {
        const viewPortSize = this.getElementSize(this.viewPort.nativeElement);

        this.offset = (scrollNext) ? this.getElementSize(element) + this.getElementOffset(element) - viewPortSize : this.getElementOffset(element);
        this.scrollViewPort();
        this.updateScrollButtons();
    }

    private scrollViewPort(): void {
        if (this.verticalHeaders()) {
            this.viewPort.nativeElement.scrollTop = this.offset;
        } else {
            this.viewPort.nativeElement.scrollLeft = this.getOffset(this.offset);
        }
    }

    private updateScrollButtons() {
        this.headerContainer.nativeElement.classList.add('igx-tabs-header--measured');
        const itemsContainerSize = this.getTabItemsContainerSize();
        const maxOffset = this.headersFit(itemsContainerSize)
            ? 0
            : Math.max(0, itemsContainerSize - this.getElementSize(this.viewPort.nativeElement));

        if (this.offset > maxOffset) {
            this.offset = maxOffset;
            this.scrollViewPort();
        }

        const scrollPrevButtonStyle = this.resolvePrevScrollButtonStyle(itemsContainerSize);
        this.setScrollButtonStyle(this.scrollPrevButton.nativeElement, scrollPrevButtonStyle);

        const scrollNextButtonStyle = this.resolveNextScrollButtonStyle(itemsContainerSize);
        this.setScrollButtonStyle(this.scrollNextButton.nativeElement, scrollNextButtonStyle);
    }

    private setScrollButtonStyle(button: HTMLButtonElement, buttonStyle: TabScrollButtonStyle) {
        if (buttonStyle === TabScrollButtonStyle.NotDisplayed) {
            button.style.display = 'none';
        } else {
            button.disabled = buttonStyle === TabScrollButtonStyle.Disabled;
            button.style.display = '';
        }
    }

    private resolvePrevScrollButtonStyle(itemsContainerSize: number): TabScrollButtonStyle {
        if (this.offset === 0) {
            return this.headersFit(itemsContainerSize) ? TabScrollButtonStyle.NotDisplayed : TabScrollButtonStyle.Disabled;
        }

        return TabScrollButtonStyle.Enabled;
    }

    private resolveNextScrollButtonStyle(itemsContainerSize: number): TabScrollButtonStyle {
        if (this.offset === 0 && this.headersFit(itemsContainerSize)) {
            return TabScrollButtonStyle.NotDisplayed;
        }

        const viewPortSize = this.getElementSize(this.viewPort.nativeElement);
        return itemsContainerSize > this.offset + viewPortSize ? TabScrollButtonStyle.Enabled : TabScrollButtonStyle.Disabled;
    }

    private headersFit(itemsContainerSize: number): boolean {
        // A difference is accumulated from the size calculations
        return itemsContainerSize - this.getElementSize(this.headerContainer.nativeElement) <= 1;
    }

    private getTabItemsContainerSize() {
        const headers = Array.from(this.itemsContainer.nativeElement.children) as HTMLElement[];
        const lastHeader = headers.findLast(header => header.offsetParent !== null);
        return lastHeader ? this.getElementOffset(lastHeader) + this.getElementSize(lastHeader) : 0;
    }

    private getOffset(offset: number): number {
        return isLeftToRight(this._element.nativeElement) ? offset : -offset;
    }

    private getElementSize(element: HTMLElement): number {
        return this.verticalHeaders() ? element.offsetHeight : element.offsetWidth;
    }

    private getElementOffset(element: HTMLElement): number {
        if (this.verticalHeaders()) {
            return element.offsetTop;
        }

        const rtl = !isLeftToRight(this._element.nativeElement);
        return rtl ? this.itemsWrapper.nativeElement.offsetWidth - element.offsetLeft - element.offsetWidth : element.offsetLeft;
    }
}
