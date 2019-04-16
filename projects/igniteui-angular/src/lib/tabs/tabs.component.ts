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
import { IgxTabsBase } from './tabs.common';

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
    * const groupItems = this.myTabComponent.tabs;
    * ```
    */
    @ContentChildren(forwardRef(() => IgxTabsGroupComponent))
    public groups: QueryList<IgxTabsGroupComponent>;

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
        this._selectedIndex = index;
        this.setSelectedGroup();
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
    @Output() public onTabItemDeselected = new EventEmitter();

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
    @Output() public onTabItemSelected = new EventEmitter();

    /**
     * @hidden
     */
    @ViewChild('contentsContainer')
    public contentsContainer: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('headerContainer')
    public headerContainer: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('itemsContainer')
    public itemsContainer: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('selectedIndicator')
    public selectedIndicator: ElementRef;

    /**
    * @hidden
    */
    @ViewChild('tabsContainer')
    public tabsContainer: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('viewPort')
    public viewPort: ElementRef;

    /**
     * Provides an observable collection of all `IgxTabItemComponent`s.
     * ```typescript
     * const tabItems = this.myTabComponent.tabs;
     * ```
     */
    @ViewChildren(forwardRef(() => IgxTabItemComponent))
    public tabs: QueryList<IgxTabItemComponent>;

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
    private _selectedIndex = 0;

    /**
     * @hidden
     */
    @HostBinding('attr.class')
    public get cssClass() {
        const defaultStyle = `igx-tabs`;
        const fixedStyle = `igx-tabs--fixed`;
        const iconStyle = `igx-tabs--icons`;
        const iconLabelFound = this.groups.find((group) => group.icon != null && group.label != null);
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
        if (iconLabelFound !== undefined) {
            css = `${css} ${iconStyle}`;
        }

        return `${css} ${this.class}`;
    }

    /**
     * @hidden
     */
    @HostListener('onTabItemSelected', ['$event'])
    public selectedGroupHandler(args) {
        const prevSelectedIndex = this.selectedIndex;
        if (prevSelectedIndex !== -1 && this.groups.toArray()[prevSelectedIndex] !== undefined) {
            this.onTabItemDeselected.emit(
                {
                    tab: this.groups.toArray()[prevSelectedIndex].relatedTab,
                    group: this.groups.toArray()[prevSelectedIndex]
                });
        }

        this.selectedIndex = args.group.index;
        this.groups.forEach((p) => {
            if (p.index !== this.selectedIndex) {
                this.deselectGroup(p);
            }
        });
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
        this.setSelectedGroup();
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

    private setSelectedGroup(): void {
        requestAnimationFrame(() => {
            if (this.selectedIndex <= 0 || this.selectedIndex >= this.groups.length) {
                // if nothing is selected - select the first tabs group
                this.selectGroupByIndex(0);
            } else {
                this.selectGroupByIndex(this.selectedIndex);
            }
        });
    }

    private resetSelectionOnCollectionChanged(): void {
        setTimeout(() => {
            if (this.groups.toArray()[this.selectedIndex] !== undefined) {
                // persist the selected index and applied it to the new collection
                this.selectGroupByIndex(this.selectedIndex);
            } else {
                if (this.selectedIndex >= this.groups.length) {
                    // in case the selected index is no longer valid, select the last group in the new collection
                    this.selectGroupByIndex(this.groups.length - 1);
                }
            }
        }, 0);
    }

    private selectGroupByIndex(selectedIndex: number): void {
        const selectableGroups = this.groups.filter((selectableGroup) => !selectableGroup.disabled);
        const group = selectableGroups[selectedIndex];

        if (group) {
            group.select(0);
        }
    }

    private deselectGroup(group: IgxTabsGroupComponent): void {
        // Cannot deselect the selected tab - this will mean that there will be not selected tab left
        if (group.disabled || this.selectedTabItem.index === group.index) {
            return;
        }

        group.isSelected = false;
        group.relatedTab.tabindex = -1;
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
