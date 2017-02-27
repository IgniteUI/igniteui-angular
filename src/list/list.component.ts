import { Component, Input, Output, ContentChildren, QueryList, Renderer, HostBinding,
     NgModule, OnInit, OnDestroy, ViewChild, Inject, forwardRef, ElementRef, EventEmitter, AfterContentInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { HammerGesturesManager } from '../core/touch';
import { IgxButtonModule } from "../button/button.directive";
import { IgxRippleModule } from "../directives/ripple.directive";

export interface IListChild {
    index: number;
}

export enum IgxListPanState { NONE, LEFT, RIGHT };

// ====================== LIST ================================
// The `<igx-list>` directive is a list container for items and headers
@Component({
    selector: 'igx-list',
    moduleId: module.id,
    templateUrl: 'list.component.html',
    host: {
        'role': "list"
    }
})
export class IgxList {
    private _innerStyle: string = "igx-list";

    @ContentChildren(forwardRef(() => IgxListItem)) children: QueryList<IgxListItem>;

    get items(): IgxListItem[] {
        let items: IgxListItem[] = [];
        if (this.children !== undefined) {
            for (let child of this.children.toArray()) {
                if (!child.isHeader) {
                    items.push(child);
                }
            }
        }

        return items;
    }
    
    get headers(): IgxListItem[] {
        let headers: IgxListItem[] = [];
        if (this.children !== undefined) {
            for (let child of this.children.toArray()) {
                if (child.isHeader) {
                    headers.push(child);
                }
            }
        }

        return headers;
    }

    @Input() allowLeftPanning: boolean = false;
    @Input() allowRightPanning: boolean = false;

    @Input() hasNoItemsTemplate: boolean = false;
    @Input() emptyListImage: string;
    @Input() emptyListMessage: string = "No items";
    @Input() emptyListButtonText: string = "Add";

    @Output() emptyListButtonClick = new EventEmitter();

    @Output() onLeftPan = new EventEmitter();
    @Output() onRightPan = new EventEmitter();
    @Output() onPanStateChange = new EventEmitter();

    private onEmptyListButtonClicked(event) {
        this.emptyListButtonClick.emit({ list: this, event: event });
    }

    constructor(private element: ElementRef) {
    }
}

// ====================== ITEM ================================
// The `<igx-item>` directive is a container intended for row items in
// a `<igx-list>` container.
@Component({
    selector: 'igx-list-item',
    moduleId: module.id,
    templateUrl: 'list-item.component.html'
})
export class IgxListItem implements OnInit, OnDestroy, IListChild {
    @ViewChild('wrapper') wrapper: ElementRef;

    private _panState: IgxListPanState = IgxListPanState.NONE;
    private _FRACTION_OF_WIDTH_TO_TRIGGER_GRIP = 0.5; // as a fraction of the item width
    private _innerStyle: string = "";
    private _previousPanDeltaX = 0;

    hidden: boolean = false;    

    get panState(): IgxListPanState {
        return  this._panState;
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
        return this.wrapper.nativeElement.offsetLeft;
    }
    set left(value: number) {
        var val = value + "";

        if (val.indexOf("px") == -1) {
            val += "px";
        }

        this.wrapper.nativeElement.style.left = val;
    }

    get maxLeft() {
        return -this.width;
    }

    get maxRight() {
        return this.width;
    }

    @HostBinding('attr.role') role;
    @Input() isHeader: boolean = false;
    @Input() href: string;
    @Input() options: Array<Object>

    constructor(@Inject(forwardRef(() => IgxList)) private list: IgxList, public element: ElementRef, private _renderer: Renderer) {
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

        this.element.nativeElement.setAttribute('aria-label', this.element.nativeElement.textContent.trim());        
    }

    public ngOnDestroy() {
    }

    private _addEventListeners() {
        // Do not attach pan events if there is no options - no need to pan the item
        if (this._renderer && this.options && (this.list.allowLeftPanning || this.list.allowRightPanning)) {
            this._renderer.listen(this.element.nativeElement, 'panstart', (event) => { this.panStart(event); });
            this._renderer.listen(this.element.nativeElement, 'panmove', (event) => { this.panMove(event); });
            this._renderer.listen(this.element.nativeElement, 'panend', (event) => { this.panEnd(event); });
        }
    }

    private panStart(ev: HammerInput) {
        this._previousPanDeltaX = 0;
    }

    private panMove(ev: HammerInput) {
        var isPanningToLeft = this.left + ev.deltaX < this.left;
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
        var oldPanState = this._panState;

        this.performMagneticGrip();

        if (oldPanState != this._panState) {
            this.list.onPanStateChange.emit({ oldState: oldPanState, newState: this._panState, item: this});
            if (this._panState == IgxListPanState.LEFT) {
                this.list.onLeftPan.emit(this);
            } else if(this._panState == IgxListPanState.RIGHT) {
                this.list.onRightPan.emit(this);
            }
        }

        this._previousPanDeltaX = 0;
    }

    private performMagneticGrip() {        
        var widthTriggeringGrip = this.width * this._FRACTION_OF_WIDTH_TO_TRIGGER_GRIP;
        var currentState = this.list
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
    imports: [CommonModule, IgxButtonModule, IgxRippleModule],
    exports: [IgxList, IgxListItem]
})
export class IgxListModule {
}