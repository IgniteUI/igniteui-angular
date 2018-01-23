import { CommonModule } from "@angular/common";
import {
    AfterContentInit, Component, ContentChildren, ElementRef, EventEmitter, forwardRef, HostBinding,
    Inject, Input, NgModule, OnDestroy, OnInit, Output, QueryList, Renderer2, ViewChild
} from "@angular/core";
import { IgxButtonModule } from "../button/button.directive";
import { HammerGesturesManager } from "../core/touch";
import { IgxRippleModule } from "../directives/ripple.directive";

export interface IListChild {
    index: number;
}

export enum IgxListPanState { NONE, LEFT, RIGHT }

// ====================== LIST ================================
// The `<igx-list>` directive is a list container for items and headers
@Component({
    host: {
        role: "list"
    },
    selector: "igx-list",
    styleUrls: ["./list.component.scss"],
    templateUrl: "list.component.html"
})
export class IgxList {
    @ContentChildren(forwardRef(() => IgxListItem)) public children: QueryList<IgxListItem>;

    @Input() public allowLeftPanning: boolean = false;
    @Input() public allowRightPanning: boolean = false;

    @Input() public hasNoItemsTemplate: boolean = false;
    @Input() public emptyListImage: string;
    @Input() public emptyListMessage: string = "No items";
    @Input() public emptyListButtonText: string = "Add";

    @Output() public emptyListButtonClick = new EventEmitter();

    @Output() public onLeftPan = new EventEmitter();
    @Output() public onRightPan = new EventEmitter();
    @Output() public onPanStateChange = new EventEmitter();

    public get innerStyle(): string {
        return this._innerStyle;
    }

    private _innerStyle: string = "igx-list";

    get items(): IgxListItem[] {
        const items: IgxListItem[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (!child.isHeader) {
                    items.push(child);
                }
            }
        }

        return items;
    }

    get headers(): IgxListItem[] {
        const headers: IgxListItem[] = [];
        if (this.children !== undefined) {
            for (const child of this.children.toArray()) {
                if (child.isHeader) {
                    headers.push(child);
                }
            }
        }

        return headers;
    }

    constructor(private element: ElementRef) {
    }

    public onEmptyListButtonClicked(event) {
        this.emptyListButtonClick.emit({ list: this, event });
    }
}

// ====================== ITEM ================================
// The `<igx-item>` directive is a container intended for row items in
// a `<igx-list>` container.
@Component({
    providers: [HammerGesturesManager],
    selector: "igx-list-item",
    styleUrls: ["./list.component.scss"],
    templateUrl: "list-item.component.html"
})
export class IgxListItem implements OnInit, OnDestroy, IListChild {
    @ViewChild("wrapper") public element: ElementRef;

    public hidden: boolean = false;

    @HostBinding("attr.role") public role;
    @Input() public isHeader: boolean = false;
    @Input() public href: string;
    @Input() public options: object[];

    public get innerStyle(): string {
        return this._innerStyle;
    }

    private _panState: IgxListPanState = IgxListPanState.NONE;
    private _FRACTION_OF_WIDTH_TO_TRIGGER_GRIP = 0.5; // as a fraction of the item width
    private _innerStyle: string = "";
    private _previousPanDeltaX = 0;

    get panState(): IgxListPanState {
        return this._panState;
    }

    get index(): number {
        return this.list.children.toArray().indexOf(this);
    }

    get width() {
        if (this.element && this.element.nativeElement) {
            return this.element.nativeElement.offsetWidth;
        } else {
            return 0;
        }
    }

    get left() {
        return this.element.nativeElement.offsetLeft;
    }
    set left(value: number) {
        let val = value + "";

        if (val.indexOf("px") === -1) {
            val += "px";
        }

        this.element.nativeElement.style.left = val;
    }

    get maxLeft() {
        return -this.width;
    }

    get maxRight() {
        return this.width;
    }

    constructor(
        @Inject(forwardRef(() => IgxList))
        private list: IgxList,
        private _renderer: Renderer2) {
    }

    public ngOnInit() {
        if (this.isHeader) {
            this._innerStyle = "igx-list__header";
            this.role = "separator";
        } else {
            this._innerStyle = "igx-list__item";
            this.role = "listitem";

            this._addEventListeners();
            this.element.nativeElement.style.touchAction = "pan-y";
        }

        this.element.nativeElement.setAttribute("aria-label", this.element.nativeElement.textContent.trim());
    }

    public ngOnDestroy() {
    }

    private _addEventListeners() {
        // Do not attach pan events if there is no options - no need to pan the item
        if (this._renderer && this.options && (this.list.allowLeftPanning || this.list.allowRightPanning)) {
            this._renderer.listen(this.element.nativeElement, "panstart", (event) => { this.panStart(event); });
            this._renderer.listen(this.element.nativeElement, "panmove", (event) => { this.panMove(event); });
            this._renderer.listen(this.element.nativeElement, "panend", (event) => { this.panEnd(event); });
        }
    }

    private panStart(ev: HammerInput) {
        this._previousPanDeltaX = 0;
    }

    private panMove(ev: HammerInput) {
        const isPanningToLeft = this.left + ev.deltaX < this.left;
        if (isPanningToLeft) {
            this.left += ev.deltaX - this._previousPanDeltaX;
            if (this.list.allowRightPanning && !this.list.allowLeftPanning && this.left < 0) {
                this.left = 0;
            } else if (this.left < this.maxLeft) {
                this.left = this.maxLeft;
            }
        } else if (!isPanningToLeft) {
            this.left += ev.deltaX - this._previousPanDeltaX;
            if (this.list.allowLeftPanning && !this.list.allowRightPanning && this.left > 0) {
                this.left = 0;
            } else if (this.left > this.maxRight) {
                this.left = this.maxRight;
            }
        }

        this._previousPanDeltaX = ev.deltaX;
    }

    private panEnd(ev: HammerInput) {
        const oldPanState = this._panState;

        this.performMagneticGrip();

        if (oldPanState !== this._panState) {
            this.list.onPanStateChange.emit({ oldState: oldPanState, newState: this._panState, item: this });
            if (this._panState === IgxListPanState.LEFT) {
                this.list.onLeftPan.emit(this);
            } else if (this._panState === IgxListPanState.RIGHT) {
                this.list.onRightPan.emit(this);
            }
        }

        this._previousPanDeltaX = 0;
    }

    private performMagneticGrip() {
        const widthTriggeringGrip = this.width * this._FRACTION_OF_WIDTH_TO_TRIGGER_GRIP;

        if (this.left > 0) {
            if (this.left > widthTriggeringGrip) {
                this.left = this.maxRight;
                this._panState = IgxListPanState.RIGHT;
            } else {
                this.left = 0;
                this._panState = IgxListPanState.NONE;
            }
        } else {
            if (-this.left > widthTriggeringGrip) {
                this.left = this.maxLeft;
                this._panState = IgxListPanState.LEFT;
            } else {
                this.left = 0;
                this._panState = IgxListPanState.NONE;
            }
        }
    }
}

@NgModule({
    declarations: [IgxList, IgxListItem],
    exports: [IgxList, IgxListItem],
    imports: [CommonModule, IgxButtonModule, IgxRippleModule]
})
export class IgxListModule {
}
