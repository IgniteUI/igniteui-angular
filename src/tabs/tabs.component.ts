import { CommonModule } from "@angular/common";
import {
    AfterViewInit,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    Host,
    HostBinding,
    HostListener,
    Inject,
    Input,
    NgModule,
    Output,
    QueryList,
    ViewChild,
    ViewChildren
} from "@angular/core";

import { isNullOrUndefined } from "util";
import { IgxBadgeModule } from "../badge/badge.component";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxIconModule } from "../icon";
import { IgxTabItemComponent } from "./tab-item.component";
import { IgxTabsGroupComponent } from "./tabs-group.component";
import { IgxLeftButtonStyleDirective, IgxRightButtonStyleDirective, IgxTabItemTemplateDirective } from "./tabs.directives";

export enum TabsType {
    FIXED = "fixed",
    CONTENTFIT = "contentfit"
}

@Component({
    selector: "igx-tabs",
    templateUrl: "tabs.component.html"
})

export class IgxTabsComponent implements AfterViewInit {
    @ViewChildren(forwardRef(() => IgxTabItemComponent)) public tabs: QueryList<IgxTabItemComponent>;
    @ContentChildren(forwardRef(() => IgxTabsGroupComponent)) public groups: QueryList<IgxTabsGroupComponent>;

    @Input("tabsType")
    public tabsType: string | TabsType = "contentfit";

    @Output() public onTabItemSelected = new EventEmitter();
    @Output() public onTabItemDeselected = new EventEmitter();

    @ViewChild("tabsContainer")
    public tabsContainer: ElementRef;

    @ViewChild("headerContainer")
    public headerContainer: ElementRef;

    @ViewChild("itemsContainer")
    public itemsContainer: ElementRef;

    @ViewChild("contentsContainer")
    public contentsContainer: ElementRef;

    @ViewChild("selectedIndicator")
    public selectedIndicator: ElementRef;

    @ViewChild("viewPort")
    public viewPort: ElementRef;

    @HostBinding("attr.class")
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
        if (!isNullOrUndefined(iconLabelFound)) {
            css = `${css} ${iconStyle}`;
        }

        return css;
    }

    public selectedIndex = -1;
    public calculatedWidth: number;
    public visibleItemsWidth: number;
    public offset = 0;
    public isRightButtonVisible = false;
    public isLeftButtonVisible = false;

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
            const itemsContainerWidth = this.itemsContainer.nativeElement.offsetWidth;

            this.offset = (scrollRight) ? element.offsetWidth + element.offsetLeft - viewPortWidth : element.offsetLeft;
            this.itemsContainer.nativeElement.style.transform = `translate(${-this.offset}px)`;


            let total = this.offset + viewPortWidth;
            this.isLeftButtonVisible = (this.offset === 0 && !scrollRight) ? false : true;
            this.isRightButtonVisible = (itemsContainerWidth <= total) ? false : true;

            console.log("viewPortWidth " + viewPortWidth + " itemsContainerWidth " + itemsContainerWidth + " this.offset + viewPortWidth " + total);
        });
    }

    get selectedTab(): IgxTabItemComponent {
        if (this.tabs && this.selectedIndex !== undefined) {
            return this.tabs.toArray()[this.selectedIndex];
        }
    }

    constructor(private _element: ElementRef) {
    }

    public ngAfterViewInit() {
        // initial selection
        setTimeout(() => {
            if (this.selectedIndex === -1) {
                const selectableGroups = this.groups.filter((p) => !p.isDisabled);
                const group = selectableGroups[0];

                if (group) {
                    group.select();
                }

            }
        }, 0);

        const itemsContainerWidth = this.itemsContainer.nativeElement.offsetWidth;
        const headerContainerWidth = this.headerContainer.nativeElement.offsetWidth;

        if (itemsContainerWidth > headerContainerWidth) {
            this.isRightButtonVisible = true;
        }
    }

    @HostListener("window:resize")
    public onResize() {
        const itemsContainerWidth = this.itemsContainer.nativeElement.offsetWidth;
        const viewPortContainerWidth = this.viewPort.nativeElement.offsetWidth;

        this.isRightButtonVisible = (itemsContainerWidth <= viewPortContainerWidth + this.offset) ? false : true;
        this.isLeftButtonVisible = (this.offset > 0) ? true : false;
    }

    @HostListener("onTabItemSelected", ["$event"])
    public _selectedGroupHandler(args) {
        this.selectedIndex = args.group.index;

        this.groups.forEach((p) => {
            if (p.index !== this.selectedIndex) {
                this._deselectGroup(p);
            }
        });
    }

    @HostListener("keydown.arrowright", ["$event"])
    public onKeydownArrowRight(event: KeyboardEvent) {
        this._onKeyDown(false);
    }

    @HostListener("keydown.arrowleft", ["$event"])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        this._onKeyDown(true);
    }

    @HostListener("keydown.home", ["$event"])
    public onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();
        this._onKeyDown(false, 0);
    }

    @HostListener("keydown.end", ["$event"])
    public onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();
        this._onKeyDown(false, this.tabs.toArray().length - 1);
    }

    private _onKeyDown(isLeftArrow: boolean, index = null): void {
        const tabsArray = this.tabs.toArray();
        if (index === null) {
            index = (isLeftArrow)
                ? (this.selectedIndex === 0) ? tabsArray.length - 1 : this.selectedIndex - 1
                : (this.selectedIndex === tabsArray.length - 1) ? 0 : this.selectedIndex + 1;
        }
        const tab = tabsArray[index];
        const viewPortWidth = this.viewPort.nativeElement.offsetWidth;
        const nativeTabElement = tab.nativeTabItem.nativeElement;
        const focusDelay = (nativeTabElement.offsetWidth + nativeTabElement.offsetLeft - this.offset > viewPortWidth) ? 200 : 50;
        tab.select(focusDelay);
    }

    private _deselectGroup(group: IgxTabsGroupComponent) {
        // Cannot deselect the selected tab - this will mean that there will be not selected tab left
        if (group.isDisabled || this.selectedTab.index === group.index) {
            return;
        }

        group.isSelected = false;
        group.relatedTab.tabindex = -1;
        this.onTabItemDeselected.emit({ tab: this.tabs[group.index], group });
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
