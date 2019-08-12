import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    NgModule,
    Output,
    QueryList,
    ViewChild,
    ViewChildren,
    OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import { IgxBadgeModule } from '../badge/badge.component';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { IgxIconModule } from '../icon/index';
import { IgxTabItemComponent } from './tab-item.component';
import { IgxTabsGroupComponent } from './tabs-group.component';
import { IgxLeftButtonStyleDirective, IgxRightButtonStyleDirective, IgxTabItemTemplateDirective } from './tabs.directives';
import { IgxTabsBase, IgxTabItemBase } from './tabs.common';

export enum TabsType {
    FIXED = 'fixed',
    CONTENTFIT = 'contentfit'
}

@Component({
    selector: 'igx-tabs',
    templateUrl: 'tabs.component.html',
    providers: [{ provide: IgxTabsBase, useExisting: IgxTabsComponent }]
})

export class IgxTabsComponent implements IgxTabsBase, AfterViewInit, OnDestroy {

    /**
    * Provides an observable collection of all `IgxTabsGroupComponent`s.
    * ```typescript
    * const groupItems = this.myTabComponent.groups;
    * ```
    */
    @ContentChildren(forwardRef(() => IgxTabsGroupComponent))
    public groups: QueryList<IgxTabsGroupComponent>;

    /**
    * Provides an observable collection of all `IgxTabItemComponent`s defined in the page.
    * ```typescript
    * const tabItems = this.myTabComponent.contentTabs;
    * ```
    */
    @ContentChildren(forwardRef(() => IgxTabItemComponent))
    public contentTabs: QueryList<IgxTabItemComponent>;

    /**
    * An @Input property that sets the value of the `selectedIndex`.
    * Default value is 0.
    * ```html
    * <igx-tabs selectedIndex="1">
    * ```
    */
    @Input()
    public get selectedIndex(): number {
        return this._selectedIndex;
    }

    public set selectedIndex(index: number) {
        const newIndex = typeof index !== 'number' ? parseInt(index, 10) : index;
        if (this._selectedIndex !== newIndex) {
            if (this.tabs && this.tabs.length > 0) {
                const newTab = this.tabs.toArray()[newIndex];
                if (newTab) {
                   this.performSelectionChange(newTab);
                }
            } else {
                this._selectedIndex = newIndex;
            }
        }
    }

    /**
     * Defines the tab header sizing mode. You can choose between `contentfit` or `fixed`.
     * By default the header sizing mode is `contentfit`.
     * ```html
     * <igx-tabs tabsType="fixed">
     *     <igx-tabs-group label="HOME">Home</igx-tabs-group>
     * </igx-tabs>
     * ```
     */
    @Input('tabsType')
    public tabsType: string | TabsType = 'contentfit';

    /**
    * @hidden
    */
    @Input()
    public class = '';

    /**
     * Emitted when a tab item is deselected.
     * ```html
     * <igx-tabs (onTabItemDeselected)="itemDeselected($event)">
     *      <igx-tabs-group label="Tab 1">This is Tab 1 content.</igx-tabs-group>
     *      <igx-tabs-group label="Tab 2">This is Tab 2 content.</igx-tabs-group>
     * </igx-tabs>
     * ```
     * ```typescript
     * itemDeselected(e){
     *      const tabGroup = e.group;
     *      const tabItem = e.tab;
     * }
     * ```
     */
    @Output()
    public onTabItemDeselected = new EventEmitter();

    /**
    * Emitted when a tab item is selected.
    * ```html
    * <igx-tabs (onTabItemSelected)="itemSelected($event)">
    *      <igx-tabs-group label="Tab 1">This is Tab 1 content.</igx-tabs-group>
    *      <igx-tabs-group label="Tab 2">This is Tab 2 content.</igx-tabs-group>
    * </igx-tabs>
    * ```
    * ```typescript
    * itemSelected(e){
    *      const tabGroup = e.group;
    *      const tabItem = e.tab;
    * }
    * ```
    */
    @Output()
    public onTabItemSelected = new EventEmitter();

    /**
     * @hidden
     */
    @ViewChild('contentsContainer', { static: true })
    public contentsContainer: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('headerContainer', { static: true })
    public headerContainer: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('itemsContainer', { static: true })
    public itemsContainer: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('selectedIndicator', { static: false })
    public selectedIndicator: ElementRef;

    /**
    * @hidden
    */
    @ViewChild('tabsContainer', { static: true })
    public tabsContainer: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('viewPort', { static: true })
    public viewPort: ElementRef;

    /**
     * Provides an observable collection of all `IgxTabItemComponent`s.
     * ```typescript
     * const tabItems = this.myTabComponent.viewTabs;
     * ```
     */
    @ViewChildren(forwardRef(() => IgxTabItemComponent))
    public viewTabs: QueryList<IgxTabItemComponent>;

    /**
     * Provides an observable collection of all `IgxTabItemComponent`s.
     * First try to get them as content children if not available get them as view children.
     * ```typescript
     * const tabItems = this.myTabComponent.tabs;
     * ```
     */
    public get tabs(): QueryList<IgxTabItemComponent> {
        if (this.hasContentTabs) {
            return this.contentTabs;
        }
        return this.viewTabs;
    }

    /**
     *@hidden
     */
    public get hasContentTabs(): boolean {
        return (this.contentTabs && this.contentTabs.length > 0);
    }

    /**
     * @hidden
     */
    public calculatedWidth: number;

    /**
     * @hidden
     */
    public visibleItemsWidth: number;

    /**
     * @hidden
     */
    public offset = 0;

    private _groupChanges$: Subscription;
    private _selectedIndex = -1;

    /**
     * @hidden
     */
    @HostBinding('attr.class')
    public get cssClass() {
        const defaultStyle = `igx-tabs`;
        const fixedStyle = `igx-tabs--fixed`;
        const iconStyle = `igx-tabs--icons`;
        const iconLabelFoundInGroups = this.groups.find((group) => group.icon != null && group.label != null);
        const iconLabelFoundInTabs = this.contentTabs.find((tab) => tab.icon != null && tab.label != null);
        let css;
        switch (TabsType[this.tabsType.toUpperCase()]) {
            case TabsType.FIXED: {
                css = fixedStyle;
                break;
            }
            default: {
                css = defaultStyle;
                break;
            }
        }

        // Layout fix for items with icons
        if (iconLabelFoundInGroups !== undefined || iconLabelFoundInTabs !== undefined) {
            css = `${css} ${iconStyle}`;
        }

        return `${css} ${this.class}`;
    }

    /**
     * @hidden
     */
    public scrollLeft(event): void {
        this.scroll(false);
    }

    /**
     * @hidden
     */
    public scrollRight(event): void {
        this.scroll(true);
    }

    /**
     * @hidden
     */
    public scrollElement(element: any, scrollRight: boolean): void {
        const viewPortWidth = this.viewPort.nativeElement.offsetWidth;

        this.offset = (scrollRight) ? element.offsetWidth + element.offsetLeft - viewPortWidth : element.offsetLeft;
        this.itemsContainer.nativeElement.style.transform = `translate(${-this.offset}px)`;
    }

    /**
     * Gets the selected `IgxTabItemComponent`.
     * ```
     * const selectedItem = this.myTabComponent.selectedTabItem;
     * ```
     */
    get selectedTabItem(): IgxTabItemComponent {
        if (this.tabs && this.selectedIndex !== undefined) {
            return this.tabs.toArray()[this.selectedIndex];
        }
    }

    constructor(private _element: ElementRef) {
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        if (this._selectedIndex === -1) {
            this.tabs.forEach((t) => {
                if (t.isSelected) {
                    this._selectedIndex = t.index;
                }
            });
        }

        if (!this.hasContentTabs && (this.selectedIndex < 0 || this.selectedIndex >= this.groups.length)) {
            this._selectedIndex = 0;
        }

        requestAnimationFrame(() => {
            const newTab = this.tabs.toArray()[this._selectedIndex];
            if (newTab) {
                this.performSelection(newTab);
            } else {
                this.hideIndicator();
            }
        });

        this._groupChanges$ = this.groups.changes.subscribe(() => {
            this.resetSelectionOnCollectionChanged();
        });
    }

    /**
     * @hidden
     */
    public ngOnDestroy(): void {
        if (this._groupChanges$) {
            this._groupChanges$.unsubscribe();
        }
    }

    private resetSelectionOnCollectionChanged(): void {
        requestAnimationFrame(() => {
            const currentTab = this.tabs.toArray()[this.selectedIndex];
            if (currentTab) {
                this.performSelectionChange(currentTab);
            } else if (this.selectedIndex >= this.tabs.length) {
                this.performSelectionChange(this.tabs.last);
            } else {
                this.hideIndicator();
            }
        });
    }

    private scroll(scrollRight: boolean): void {
        const tabsArray = this.tabs.toArray();
        for (const tab of tabsArray) {
            const element = tab.nativeTabItem.nativeElement;
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

    /**
     * @hidden
     */
    public performSelectionChange(newTab: IgxTabItemBase): void {
        const oldTab = this.selectedTabItem;
        if (oldTab) {
            this.performDeselection(oldTab);
        }
        if (newTab) {
            this.performSelection(newTab);
        } else {
            // if there is no new selected tab hide the selection indicator
            this.hideIndicator();
        }
    }

    private performDeselection(oldTab: IgxTabItemBase): void {
        oldTab.setSelectedInternal(false);
        const oldTabRelatedGroup = this.groups.toArray()[oldTab.index];
        if (oldTabRelatedGroup) {
            oldTabRelatedGroup.setSelectedInternal(false);
        }
        this._selectedIndex = -1;
        this.onTabItemDeselected.emit({ tab: oldTab, group: oldTabRelatedGroup });
    }

    private performSelection(newTab: IgxTabItemBase): void {
        newTab.setSelectedInternal(true);
        this._selectedIndex = newTab.index;

        let newTabRelatedGroup = null;
        if (!this.hasContentTabs && this.groups) {
            newTabRelatedGroup = this.groups.toArray()[newTab.index];
            if (newTabRelatedGroup) {
                newTabRelatedGroup.setSelectedInternal(true);
            }
        }

        this.onTabItemSelected.emit({ tab: newTab, group: newTabRelatedGroup });

        requestAnimationFrame(() => {
            // bring the new selected tab into view if it is not
            this.bringNewTabIntoView(newTab);
            // animate the new selection indicator
            this.transformIndicatorAnimation(newTab.nativeTabItem.nativeElement);
            // animate the new tab's group content
            if (!this.hasContentTabs) {
                this.transformContentAnimation(newTab, 0.2);
            }
        });
    }

    private bringNewTabIntoView(newTab: IgxTabItemBase): void {
        const tabNativeElement = newTab.nativeTabItem.nativeElement;

        // Scroll left if there is need
        if (tabNativeElement.offsetLeft < this.offset) {
            this.scrollElement(tabNativeElement, false);
        }

        // Scroll right if there is need
        const viewPortOffsetWidth = this.viewPort.nativeElement.offsetWidth;
        const delta = (tabNativeElement.offsetLeft + tabNativeElement.offsetWidth) - (viewPortOffsetWidth + this.offset);

        // Fix for IE 11, a difference is accumulated from the widths calculations
        if (delta > 1) {
            this.scrollElement(tabNativeElement, true);
        }
    }

    /**
     * @hidden
     */
    // animation for the new panel/group (not needed for tab only mode)
    public transformContentAnimation(tab: IgxTabItemBase, duration: number): void {
        const contentOffset = this.tabsContainer.nativeElement.offsetWidth * tab.index;
        this.contentsContainer.nativeElement.style.transitionDuration = `${duration}s`;
        this.contentsContainer.nativeElement.style.transform = `translate(${-contentOffset}px)`;
    }

    /**
     * @hidden
     */
    public transformIndicatorAnimation(element: HTMLElement): void {
        if (this.selectedIndicator) {
            this.selectedIndicator.nativeElement.style.visibility = 'visible';
            this.selectedIndicator.nativeElement.style.width = `${element.offsetWidth}px`;
            this.selectedIndicator.nativeElement.style.transform = `translate(${element.offsetLeft}px)`;
        }
    }

    public hideIndicator(): void {
        if (this.selectedIndicator) {
            this.selectedIndicator.nativeElement.style.visibility = 'hidden';
        }
    }

}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxTabsComponent,
        IgxTabsGroupComponent,
        IgxTabItemComponent,
        IgxTabItemTemplateDirective,
        IgxRightButtonStyleDirective,
        IgxLeftButtonStyleDirective],
    exports: [IgxTabsComponent,
        IgxTabsGroupComponent,
        IgxTabItemComponent,
        IgxTabItemTemplateDirective,
        IgxRightButtonStyleDirective,
        IgxLeftButtonStyleDirective],
    imports: [CommonModule, IgxBadgeModule, IgxIconModule, IgxRippleModule]
})

export class IgxTabsModule {
}
