import { CommonModule } from "@angular/common";
import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    NgModule,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren
} from "@angular/core";

import { IgxBadgeModule } from "../badge/badge.component";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxIconModule } from "../icon";
import { IgxTabItemComponent } from "./tab-item.component";
import { isNullOrUndefined } from "util";

export enum TabsType {
    FIXED = "fixed",
    CONTENTFIT = "contentfit"
}

@Directive({
    selector: "[igxTab]"
})
export class IgxTabItemTemplateDirective {

    constructor(public template: TemplateRef<any>) {
    }
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

    @ViewChild("leftBtn")
    public leftButton: ElementRef;

    @ViewChild("rightBtn")
    public rightButton: ElementRef;


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
    public isScrollable = false;

    public calculatedWidth: number;
    public visibleItemsWidth: number;

    public offset = 0;

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

        // if (this.offset == 0 && !scrollRight) {
        //     this.leftButton.nativeElement.style.visibility = "hidden";
        // }
        // else {
        //     this.leftButton.nativeElement.style.visibility = "visible";
        // }

        // if (this.offset + viewPortWidth == this.itemsContainer.nativeElement.offsetWidth && scrollRight) {
        //     this.rightButton.nativeElement.style.visibility = "hidden";
        // }
        // else {
        //     this.rightButton.nativeElement.style.visibility = "visible";
        // }
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
        this._onArrowKeyDown(false);
    }

    @HostListener("keydown.arrowleft", ["$event"])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        this._onArrowKeyDown(true);
    }

    private _onArrowKeyDown(isLeftArrow: boolean) : void {
        const tabsArray = this.tabs.toArray();
        const index = (isLeftArrow)
                      ? (this.selectedIndex === 0) ? tabsArray.length - 1 : this.selectedIndex - 1
                      : (this.selectedIndex === tabsArray.length - 1) ? 0 : this.selectedIndex + 1;
        const focusDelay = (this.selectedIndex === 0) ? 200 : 100;
        const tab = tabsArray[index];
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

// ================================= IgxTabsGroupComponent ======================================

@Component({
    selector: "igx-tabs-group",
    templateUrl: "tabs-group.component.html"
})

export class IgxTabsGroupComponent implements AfterContentInit {
    private _itemStyle = "igx-tabs-group";
    public isSelected = false;

    @Input() 
    public label: string;

    @Input()
    public icon: string;

    @Input()
    public isDisabled: boolean;

    @HostBinding("attr.role") public role = "tabpanel";

    @HostBinding("class.igx-tabs__group")
    get styleClass(): boolean {
        return true;
    }

    @HostBinding("attr.aria-labelledby")
    get labelledBy(): string {
        return "igx-tab-item-" + this.index;
    }

    @HostBinding("attr.id")
    get id(): string {
        return "igx-tabs__group-" + this.index;
    }

    public get itemStyle(): string {
        return this._itemStyle;
    }

    get relatedTab(): IgxTabItemComponent {
        if (this._tabs.tabs) {
            return this._tabs.tabs.toArray()[this.index];
        }
    }

    get index() {
        return this._tabs.groups.toArray().indexOf(this);
    }

    get customTabTemplate(): TemplateRef<any> {
        return this._tabTemplate;
    }

    set customTabTemplate(template: TemplateRef<any>) {
        this._tabTemplate = template;
    }

    private _tabTemplate: TemplateRef<any>;

    @ContentChild(IgxTabItemTemplateDirective, { read: IgxTabItemTemplateDirective })
    protected tabTemplate: IgxTabItemTemplateDirective;

    constructor(private _tabs: IgxTabsComponent) {
    }

    public ngAfterContentInit(): void {
        if (this.tabTemplate) {
            this._tabTemplate = this.tabTemplate.template;
        }
    }

    public select(focusDelay = 50) {
        if (this.isDisabled || this._tabs.selectedIndex === this.index) {
            return;
        }

        this.isSelected = true;
        this.relatedTab.tabindex = 0;

        setTimeout(() => {
            this.relatedTab.nativeTabItem.nativeElement.focus();
        }, focusDelay);
        this.handleSelection();
        this._tabs.onTabItemSelected.emit({ tab: this._tabs.tabs.toArray()[this.index], group: this });
    }

    private handleSelection() {
        const tabElement = this.relatedTab.nativeTabItem.nativeElement;
        const viewPortOffsetWidth = this._tabs.viewPort.nativeElement.offsetWidth;

        if (tabElement.offsetLeft < this._tabs.offset) {
            this._tabs.scrollElement(tabElement, false);
        } else if (tabElement.offsetLeft + tabElement.offsetWidth > viewPortOffsetWidth + this._tabs.offset) {
            this._tabs.scrollElement(tabElement, true);
        }

        const contentOffset = this._tabs.tabsContainer.nativeElement.offsetWidth * this.index;
        this._tabs.contentsContainer.nativeElement.style.transform = `translate(${-contentOffset}px)`;

        this._tabs.selectedIndicator.nativeElement.style.width = `${tabElement.offsetWidth}px`;
        this._tabs.selectedIndicator.nativeElement.style.transform = `translate(${tabElement.offsetLeft}px)`;
    }
}

@NgModule({
    declarations: [IgxTabsComponent, IgxTabsGroupComponent, IgxTabItemComponent, IgxTabItemTemplateDirective],
    exports: [IgxTabsComponent, IgxTabsGroupComponent, IgxTabItemComponent, IgxTabItemTemplateDirective],
    imports: [CommonModule, IgxBadgeModule, IgxIconModule, IgxRippleModule]
})

export class IgxTabsModule {
}
