import { DOCUMENT } from "@angular/common";
import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, NgModule, Output, Renderer2 } from "@angular/core";
import { Subject } from "rxjs";
import { map, switchMap, takeUntil } from "rxjs/operators";
export var RestrictDrag;
(function (RestrictDrag) {
    RestrictDrag[RestrictDrag["VERTICALLY"] = 0] = "VERTICALLY";
    RestrictDrag[RestrictDrag["HORIZONTALLY"] = 1] = "HORIZONTALLY";
    RestrictDrag[RestrictDrag["NONE"] = 2] = "NONE";
})(RestrictDrag || (RestrictDrag = {}));
var IgxDragDirective = (function () {
    function IgxDragDirective(element, cdr, document) {
        var _this = this;
        this.element = element;
        this.cdr = cdr;
        this.document = document;
        this.restrictDrag = RestrictDrag.NONE;
        this.restrictHDragMin = Number.MIN_SAFE_INTEGER;
        this.restrictHDragMax = Number.MAX_SAFE_INTEGER;
        this.restrictVDragMin = Number.MIN_SAFE_INTEGER;
        this.restrictVDragMax = Number.MAX_SAFE_INTEGER;
        this.dragEnd = new Subject();
        this.dragStart = new Subject();
        this.drag = new Subject();
        this.dragStart.pipe(map(function (event) { return ({ left: event.clientX, top: event.clientY }); }), switchMap(function (offset) {
            return _this.drag.pipe(map(function (event) { return ({ left: event.clientX - offset.left, top: event.clientY - offset.top }); }), takeUntil(_this.dragEnd));
        })).subscribe(function (pos) {
            var left = _this._left + pos.left;
            var top = _this._top + pos.top;
            if (_this.restrictDrag === RestrictDrag.HORIZONTALLY || _this.restrictDrag === RestrictDrag.NONE) {
                _this.left = left < _this.restrictHDragMin ? _this.restrictHDragMin + "px" : left + "px";
                if (left > _this.restrictHDragMax) {
                    _this.left = _this.restrictHDragMax + "px";
                }
                else if (left > _this.restrictHDragMin) {
                    _this.left = left + "px";
                }
            }
            if (_this.restrictDrag === RestrictDrag.VERTICALLY || _this.restrictDrag === RestrictDrag.NONE) {
                _this.top = top < _this.restrictVDragMin ? _this.restrictVDragMin + "px" : top + "px";
                if (top > _this.restrictVDragMax) {
                    _this.top = _this.restrictVDragMax + "px";
                }
                else if (top > _this.restrictVDragMin) {
                    _this.top = top + "px";
                }
            }
        });
    }
    Object.defineProperty(IgxDragDirective.prototype, "left", {
        set: function (val) {
            this.element.nativeElement.style.left = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxDragDirective.prototype, "top", {
        set: function (val) {
            this.element.nativeElement.style.top = val;
        },
        enumerable: true,
        configurable: true
    });
    IgxDragDirective.prototype.onMouseup = function (event) {
        this.dragEnd.next(event);
        this.cdr.reattach();
    };
    IgxDragDirective.prototype.onMousedown = function (event) {
        this.dragStart.next(event);
        var elStyle = this.document.defaultView.getComputedStyle(this.element.nativeElement);
        this._left = Number.isNaN(parseInt(elStyle.left, 10)) ? 0 : parseInt(elStyle.left, 10);
        this._top = Number.isNaN(parseInt(elStyle.top, 10)) ? 0 : parseInt(elStyle.top, 10);
        this.cdr.detach();
    };
    IgxDragDirective.prototype.onMousemove = function (event) {
        event.preventDefault();
        this.drag.next(event);
    };
    IgxDragDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxDrag]"
                },] },
    ];
    IgxDragDirective.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: ChangeDetectorRef, },
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
    ]; };
    IgxDragDirective.propDecorators = {
        "restrictDrag": [{ type: Input },],
        "restrictHDragMin": [{ type: Input },],
        "restrictHDragMax": [{ type: Input },],
        "restrictVDragMin": [{ type: Input },],
        "restrictVDragMax": [{ type: Input },],
        "dragEnd": [{ type: Output },],
        "dragStart": [{ type: Output },],
        "drag": [{ type: Output },],
        "onMouseup": [{ type: HostListener, args: ["document:mouseup", ["$event"],] },],
        "onMousedown": [{ type: HostListener, args: ["mousedown", ["$event"],] },],
        "onMousemove": [{ type: HostListener, args: ["document:mousemove", ["$event"],] },],
    };
    return IgxDragDirective;
}());
export { IgxDragDirective };
var IgxDraggableDirective = (function () {
    function IgxDraggableDirective(_elementRef, _renderer) {
        this._elementRef = _elementRef;
        this._renderer = _renderer;
        this.effectAllowed = "move";
    }
    IgxDraggableDirective.prototype.ngOnInit = function () {
        this.draggable = true;
    };
    IgxDraggableDirective.prototype.ngOnDestroy = function () {
        this.draggable = false;
    };
    IgxDraggableDirective.prototype.onDragStart = function (event) {
        if (this.dragClass) {
            this._renderer.addClass(this._elementRef.nativeElement, this.dragClass);
        }
        event.dataTransfer.effectAllowed = this.effectAllowed;
        event.dataTransfer.setData("data", JSON.stringify(this.data));
    };
    IgxDraggableDirective.prototype.onDragEnd = function (event) {
        event.preventDefault();
        if (this.dragClass) {
            this._renderer.removeClass(this._elementRef.nativeElement, this.dragClass);
        }
    };
    IgxDraggableDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxDraggable]"
                },] },
    ];
    IgxDraggableDirective.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: Renderer2, },
    ]; };
    IgxDraggableDirective.propDecorators = {
        "data": [{ type: Input, args: ["igxDraggable",] },],
        "dragClass": [{ type: Input },],
        "effectAllowed": [{ type: Input },],
        "draggable": [{ type: HostBinding, args: ["draggable",] },],
        "onDragStart": [{ type: HostListener, args: ["dragstart", ["$event"],] },],
        "onDragEnd": [{ type: HostListener, args: ["dragend", ["$event"],] },],
    };
    return IgxDraggableDirective;
}());
export { IgxDraggableDirective };
var IgxDroppableDirective = (function () {
    function IgxDroppableDirective(_elementRef, _renderer) {
        this._elementRef = _elementRef;
        this._renderer = _renderer;
        this.dropEffect = "move";
        this.onDrop = new EventEmitter();
    }
    IgxDroppableDirective.prototype.onDragEnter = function (event) {
        if (this.dropClass) {
            this._renderer.addClass(this._elementRef.nativeElement, this.dropClass);
        }
    };
    IgxDroppableDirective.prototype.onDragLeave = function (event) {
        if (this.dropClass) {
            this._renderer.removeClass(this._elementRef.nativeElement, this.dropClass);
        }
    };
    IgxDroppableDirective.prototype.onDragOver = function (event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.dataTransfer.dropEffect = this.dropEffect;
        return false;
    };
    IgxDroppableDirective.prototype.onDragDrop = function (event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        if (this.dropClass) {
            this._renderer.removeClass(this._elementRef.nativeElement, this.dropClass);
        }
        var eventData = JSON.parse(event.dataTransfer.getData("data"));
        var args = {
            dragData: eventData,
            dropData: this.data,
            event: event
        };
        this.onDrop.emit(args);
    };
    IgxDroppableDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxDroppable]"
                },] },
    ];
    IgxDroppableDirective.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: Renderer2, },
    ]; };
    IgxDroppableDirective.propDecorators = {
        "data": [{ type: Input, args: ["igxDroppable",] },],
        "dropClass": [{ type: Input },],
        "dropEffect": [{ type: Input },],
        "onDrop": [{ type: Output },],
        "onDragEnter": [{ type: HostListener, args: ["dragenter", ["$event"],] },],
        "onDragLeave": [{ type: HostListener, args: ["dragleave", ["$event"],] },],
        "onDragOver": [{ type: HostListener, args: ["dragover", ["$event"],] },],
        "onDragDrop": [{ type: HostListener, args: ["drop", ["$event"],] },],
    };
    return IgxDroppableDirective;
}());
export { IgxDroppableDirective };
var IgxDragDropModule = (function () {
    function IgxDragDropModule() {
    }
    IgxDragDropModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxDraggableDirective, IgxDroppableDirective, IgxDragDirective],
                    exports: [IgxDraggableDirective, IgxDroppableDirective, IgxDragDirective]
                },] },
    ];
    return IgxDragDropModule;
}());
export { IgxDragDropModule };
