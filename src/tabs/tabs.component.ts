import {CommonModule} from "@angular/common";
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
import {IgxBadgeModule} from "../badge/badge.component";
import {IgxIconModule} from "../icon";
import {IgxTabItemComponent} from "./tab-item.component";
import {IgxRippleModule} from "../directives/ripple/ripple.directive";

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

    @Output() public onTabItemSelected = new EventEmitter();
    @Output() public onTabItemDeselected = new EventEmitter();

    @ViewChild("tabsContainer")
    public tabsContainer: ElementRef;

    @ViewChild("headerContainer")
    public headerContainer: ElementRef;

    @ViewChild("itemsContainer")
    public itemsContainer: ElementRef;

    @ViewChild("selectedIndicator")
    public selectedIndicator: ElementRef;

    @ViewChild("viewPort")
    public viewPort: ElementRef;

    @HostBinding("class.igx-tabs")
    public cssClass = "igx-tabs";

    public selectedIndex = -1;
    public isScrollable = false;

    public calculatedWidth: number;
    public visibleItemsWidth: number;

    private _itemStyle = "igx-tabs";

    public get itemStyle(): string {
        return this._itemStyle;
    }

    public offset = 0;

    public scrollLeft(event) {
        this._scroll(false);
    }

    public scrollRight(event) {
        this._scroll(true);
    }

    private _scroll(scrollRight: boolean) {
        const tabsArray = this.tabs.toArray();
        for (let index = 0; index < tabsArray.length; index++) {
            const element = tabsArray[index].nativeTabItem.nativeElement;
            if (scrollRight) {
                if (element.offsetWidth + element.offsetLeft > this.viewPort.nativeElement.offsetWidth + this.offset) {
                    this.scrollElement(element, scrollRight);
                    break;
                }
            } else {
                if(element.offsetWidth + element.offsetLeft >= this.offset) {
                    this.scrollElement(element, scrollRight);
                    break;
                }
            }
        }
    }

    public scrollElement(element: any, scrollRight: boolean): void {
        const viewPortWidth = this.viewPort.nativeElement.offsetWidth;
        this.offset = (scrollRight) ? element.offsetWidth + element.offsetLeft - viewPortWidth : element.offsetLeft;
        this.itemsContainer.nativeElement.style.transform = `translate(${-this.offset}px)`;
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
                this.selectedIndicator.nativeElement.style.width = `${this.selectedTab.nativeTabItem.nativeElement.offsetWidth}px`;
                this.selectedIndicator.nativeElement.style.transform = `translate(${this.selectedTab.nativeTabItem.nativeElement.offsetLeft}px)`;
            }
        }, 0);

        // Get container width
        const containerWidth = this.tabsContainer.nativeElement.offsetWidth;
        console.log("containerWidth " + containerWidth);

        // Get tabs number
        const tabsNumber = this.tabs.length;

        // Get calculated tabs width
        this.calculatedWidth = containerWidth / tabsNumber;
        console.log("tabs number " + this.tabs.length + " calculatedWidth " + this.calculatedWidth);

        const visibleItemsWidth = containerWidth - 80;

        console.log("visibleItemsWidth " + visibleItemsWidth);

        let totalItemsWidth = 0;

        // Calculate total tabs width
        for (const tab of this.tabs.toArray()) {
            console.log("tab.index " + tab.index + " width " + tab.nativeTabItem.nativeElement.offsetWidth);
            totalItemsWidth += tab.nativeTabItem.nativeElement.offsetWidth;
        }

        console.log("totalItemsWidth " + totalItemsWidth);

        if (containerWidth <= totalItemsWidth) {
            this.isScrollable = true;
        }
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

    private _deselectGroup(group: IgxTabsGroupComponent) {
        // Cannot deselect the selected tab - this will mean that there will be not selected tab left
        if (group.isDisabled || this.selectedTab.index === group.index) {
            return;
        }

        group.isSelected = false;
        this.onTabItemDeselected.emit({tab: this.tabs[group.index], group});
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

    @Input() public label: string;
    @Input() public icon: string;
    @Input() public isDisabled: boolean;

    @HostBinding("attr.role") public role = "tabpanel";

    @HostBinding("class.igx-tabs__group")
    get styleClass(): boolean {
        return (!this.isSelected);
    }

    @HostBinding("class.igx-tabs__group--selected")
    get selected(): boolean {
        return this.isSelected;
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

    @ContentChild(IgxTabItemTemplateDirective, {read: IgxTabItemTemplateDirective})
    protected tabTemplate: IgxTabItemTemplateDirective;

    constructor(private _tabs: IgxTabsComponent) {
    }

    public ngAfterContentInit(): void {
        if (this.tabTemplate) {
            this._tabTemplate = this.tabTemplate.template;
        }
    }

    public select() {
        if (this.isDisabled || this._tabs.selectedIndex === this.index) {
            return;
        }

        this.isSelected = true;
        this._tabs.onTabItemSelected.emit({tab: this._tabs.tabs.toArray()[this.index], group: this});
    }
}

@NgModule({
    declarations: [IgxTabsComponent, IgxTabsGroupComponent, IgxTabItemComponent, IgxTabItemTemplateDirective],
    exports: [IgxTabsComponent, IgxTabsGroupComponent, IgxTabItemComponent, IgxTabItemTemplateDirective],
    imports: [CommonModule, IgxBadgeModule, IgxIconModule, IgxRippleModule]
})

export class IgxTabsModule {
}
