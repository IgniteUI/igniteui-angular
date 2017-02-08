import { Component, Input, Output, ContentChildren, QueryList, Renderer,
     NgModule, OnInit, OnDestroy, ViewChild, Inject, forwardRef, ElementRef, EventEmitter } from '@angular/core';
import { CommonModule } from "@angular/common";
import { HammerGesturesManager } from '../core/touch';

export interface IListChild
{
    index: number;
}

// ====================== LIST ================================
// The `<igx-list>` directive is a list container for items and headers
@Component({
    selector: 'igx-list',
    moduleId: module.id, // commonJS standard
    templateUrl: 'list-content.component.html',
    host: {
        'role': "list"
    },
})

export class IgxList {
    private _innerStyle: string = "igx-list";

    children: IListChild[] = [];
    items: IgxListItem[] = [];
    headers: IgxListHeader[] = [];

    //get items() {
    //    return this.children.filter((item: IListChild) => {
    //        return item instanceof IgxListItem;
    //    });
    //}

    //get headers() {
    //    return this.children.filter((header: IListChild) => {
    //        return header instanceof IgxListHeader;
    //    });
    //}

    @Input() allowLeftPanning: boolean = false;
    @Input() allowRightPanning: boolean = false;

    @Output() onLeftPan = new EventEmitter();
    @Output() onRightPan = new EventEmitter();
    @Output() onPanStateChange = new EventEmitter();

    constructor(private element: ElementRef) {
    }

    removeChild(index: number) {
        let child: IListChild = this.children[index];

        this.children.splice(index, 1);

        if (child instanceof IgxListItem) {
            let itemIndex = this.items.indexOf(child);
            this.items.splice(itemIndex, 1);
        } else if (child instanceof IgxListHeader) {
            let headerIndex = this.headers.indexOf(child);
            this.headers.splice(headerIndex, 1);
        }
    }

    addChild(child: IListChild) {
        this.children.push(child);

        if (child instanceof IgxListItem) {
            this.items.push(child);
        } else if (child instanceof IgxListHeader) {
            this.headers.push(child);
        }
    }
}

// ====================== HEADER ================================
// The `<igx-header>` directive is a header intended for row items in
// a `<igx-list>` container.
@Component({
    selector: 'igx-list-header',
    moduleId: module.id, // commonJS standard
    templateUrl: 'list-content.component.html',
    host: {
        'role': "separator"
    },
})

export class IgxListHeader implements OnInit, IListChild {
    private _innerStyle: string = "igx-list__header";
    get index(): number {
        return this.list.children.indexOf(this);
    }

    constructor( @Inject(forwardRef(() => IgxList)) private list: IgxList, public element: ElementRef) { }

    public ngOnInit() {
        this.list.addChild(this);
        this.element.nativeElement.setAttribute('aria-label', this.element.nativeElement.textContent.trim());
    }
}

export enum IgxListPanState { NONE, LEFT, RIGHT };

// ====================== ITEM ================================
// The `<igx-item>` directive is a container intended for row items in
// a `<igx-list>` container.
@Component({
    selector: 'igx-list-item',
    moduleId: module.id, // commonJS standard
    templateUrl: 'list-content.component.html',
    host: {
        'role': "listitem"
    },
})

export class IgxListItem implements OnInit, OnDestroy, IListChild {
    @ViewChild('wrapper') wrapper: ElementRef;

    private _panState: IgxListPanState = IgxListPanState.NONE;
    private _FRACTION_OF_WIDTH_TO_TRIGGER_GRIP = 0.5; // as a fraction of the item width
    private _innerStyle: string = "igx-list__item";
    private _previousPanDeltaX = 0;

    hidden: boolean = false;

    get panState(): IgxListPanState {
        return  this._panState;
    }

    get index(): number {
        return this.list.children.indexOf(this);
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

    @Input() href: string;
    @Input() options: Array<Object>

    constructor( @Inject(forwardRef(() => IgxList)) private list: IgxList, public element: ElementRef, private _renderer: Renderer) {
    }

    public ngOnInit() {
        this.list.addChild(this);

        this._addEventListeners();
        this.element.nativeElement.setAttribute('aria-label', this.element.nativeElement.textContent.trim());

        this.element.nativeElement.style.touchAction = "pan-y";
    }

    public ngOnDestroy() {
        this.list.removeChild(this.index);
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
    declarations: [IgxList, IgxListItem, IgxListHeader],
    imports: [CommonModule],
    exports: [IgxList, IgxListItem, IgxListHeader]
})
export class IgxListModule {
}