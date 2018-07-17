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

export enum TabsType {
    FIXED = 'fixed',
    CONTENTFIT = 'contentfit'
}

@Component({
    selector: 'igx-tabs',
    templateUrl: 'tabs.component.html'
})

export class IgxTabsComponent implements AfterViewInit, OnDestroy {
    @ViewChildren(forwardRef(() => IgxTabItemComponent)) public tabs: QueryList<IgxTabItemComponent>;
    @ContentChildren(forwardRef(() => IgxTabsGroupComponent)) public groups: QueryList<IgxTabsGroupComponent>;

    @Input('tabsType')
    public tabsType: string | TabsType = 'contentfit';

    @Output() public onTabItemSelected = new EventEmitter();
    @Output() public onTabItemDeselected = new EventEmitter();

    @ViewChild('tabsContainer')
    public tabsContainer: ElementRef;

    @ViewChild('headerContainer')
    public headerContainer: ElementRef;

    @ViewChild('itemsContainer')
    public itemsContainer: ElementRef;

    @ViewChild('contentsContainer')
    public contentsContainer: ElementRef;

    @ViewChild('selectedIndicator')
    public selectedIndicator: ElementRef;

    @ViewChild('viewPort')
    public viewPort: ElementRef;

    @HostBinding('attr.class')
    public get class() {
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

        return css;
    }

    public selectedIndex = -1;
    public calculatedWidth: number;
    public visibleItemsWidth: number;
    public offset = 0;

    private _groupChanges$: Subscription;

    public scrollLeft(event) {
        this._scroll(false);
    }

    public scrollRight(event) {
        this._scroll(true);
    }

    private _scroll(scrollRight: boolean): void {
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

    public scrollElement(element: any, scrollRight: boolean): void {
        requestAnimationFrame(() => {
            const viewPortWidth = this.viewPort.nativeElement.offsetWidth;

            this.offset = (scrollRight) ? element.offsetWidth + element.offsetLeft - viewPortWidth : element.offsetLeft;
            this.itemsContainer.nativeElement.style.transform = `translate(${-this.offset}px)`;
        });
    }

    get selectedTabItem(): IgxTabItemComponent {
        if (this.tabs && this.selectedIndex !== undefined) {
            return this.tabs.toArray()[this.selectedIndex];
        }
    }

    constructor(private _element: ElementRef) {
    }

    public ngAfterViewInit() {
        this._groupChanges$ = this.groups.changes.subscribe(() => {
            this.resetSelectionOnCollectionChanged();
        });
    }

    public ngOnDestroy(): void {
        if (this._groupChanges$) {
            this._groupChanges$.unsubscribe();
        }
    }

    private resetSelectionOnCollectionChanged() {
        setTimeout(() => {
            if (this.selectedIndex === -1) {
                // if nothing is selected - select the first tabs group
                this._selectGroupByIndex(0);
                return;
            }

            if (this.groups.toArray()[this.selectedIndex] !== undefined) {
                // persist the selected index and applied it to the new collection
                this._selectGroupByIndex(this.selectedIndex);
            } else {
                if (this.selectedIndex >= this.groups.length) {
                    // in case the selected index is no longer valid, select the last group in the new collection
                    this._selectGroupByIndex(this.groups.length - 1);
                }
            }
        }, 0);
    }

    private _selectGroupByIndex(selectedIndex: number) {
        const selectableGroups = this.groups.filter((selectableGroup) => !selectableGroup.disabled);
        const group = selectableGroups[selectedIndex];

        if (group) {
            group.select(0, true);
        }
    }

    @HostListener('onTabItemSelected', ['$event'])
    public _selectedGroupHandler(args) {
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
                this._deselectGroup(p);
            }
        });
    }

    private _deselectGroup(group: IgxTabsGroupComponent) {
        // Cannot deselect the selected tab - this will mean that there will be not selected tab left
        if (group.disabled || this.selectedTabItem.index === group.index) {
            return;
        }

        group.isSelected = false;
        group.relatedTab.tabindex = -1;
    }
}

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
