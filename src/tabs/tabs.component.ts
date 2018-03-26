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
import { IgxIconModule } from "../icon";

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

    public selectedIndex = -1;
    public addScroll : boolean = false;

    public calculatedWidth: number;

    public get itemStyle(): string {
        return this._itemStyle;
    }

    private _itemStyle = "igx-tabs";

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

        debugger;

        // Get container width
        let containerWidth = this.tabsContainer.nativeElement.offsetWidth;
        console.log("containerWidth " + containerWidth);

        // Get tabs number
        const tabsNumber = this.tabs.length;
        // Get calculated tabs width
        this.calculatedWidth = containerWidth/tabsNumber;
        console.log("tabs number " + this.tabs.length + " calculatedWidth " + this.calculatedWidth);

        let totalItemsWidth = 0;
        // Calculate total tabs width
        for (let tab of this.tabs.toArray()) {
            console.log("tab.index " + tab.index + " width " + tab.nativeTabItem.nativeElement.offsetWidth);
            totalItemsWidth += tab.nativeTabItem.nativeElement.offsetWidth;
        }

        console.log("totalItemsWidth " + totalItemsWidth);

        if (containerWidth <= totalItemsWidth)
        {
            this.addScroll = true;
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

    @ContentChild(IgxTabItemTemplateDirective, { read: IgxTabItemTemplateDirective })
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
        this._tabs.onTabItemSelected.emit({ tab: this._tabs.tabs.toArray()[this.index], group: this });
    }
}

// ======================================= IgxTabItemComponent ==========================================

@Component({
    selector: "igx-tab-item",
    templateUrl: "tab-item.component.html"
})

export class IgxTabItemComponent {

    @HostBinding("attr.role") public role = "tab";

    @Input() public relatedGroup: IgxTabsGroupComponent;

    private _nativeTabItem;

    private _changesCount = 0; // changes and updates accordingly applied to the tab.

    get changesCount(): number {
        return this._changesCount;
    }

    get nativeTabItem() {
        return this._nativeTabItem;
    } 

    get isDisabled(): boolean {
        const group = this.relatedGroup;

        if (group) {
            return group.isDisabled;
        }
    }

    get isSelected(): boolean {
        const group = this.relatedGroup;

        if (group) {
            return group.isSelected;
        }
    }

    get index(): number {
        return this._tabs.tabs.toArray().indexOf(this);
    }

    constructor(private _tabs: IgxTabsComponent, private _element: ElementRef) {
        this._nativeTabItem = _element;
    }

    public select() {
        this.relatedGroup.select();
    }
}

@NgModule({
    declarations: [IgxTabsComponent, IgxTabsGroupComponent, IgxTabItemComponent, IgxTabItemTemplateDirective],
    exports: [IgxTabsComponent, IgxTabsGroupComponent, IgxTabItemComponent, IgxTabItemTemplateDirective],
    imports: [CommonModule, IgxBadgeModule, IgxIconModule]
})

export class IgxTabsModule {
}
