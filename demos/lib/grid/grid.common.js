import { DOCUMENT } from "@angular/common";
import { Directive, ElementRef, Inject, Input, NgZone, Output, TemplateRef } from "@angular/core";
import { animationFrameScheduler, fromEvent, interval, Subject } from "rxjs";
import { map, switchMap, takeUntil, throttle } from "rxjs/operators";
var IgxColumnResizerDirective = (function () {
    function IgxColumnResizerDirective(element, document, zone) {
        var _this = this;
        this.element = element;
        this.document = document;
        this.zone = zone;
        this.restrictHResizeMin = Number.MIN_SAFE_INTEGER;
        this.restrictHResizeMax = Number.MAX_SAFE_INTEGER;
        this.resizeEndTimeout = 0;
        this.resizeEnd = new Subject();
        this.resizeStart = new Subject();
        this.resize = new Subject();
        this._destroy = new Subject();
        this.resizeStart.pipe(map(function (event) { return event.clientX; }), takeUntil(this._destroy), switchMap(function (offset) {
            return _this.resize.pipe(map(function (event) { return event.clientX - offset; }), takeUntil(_this.resizeEnd));
        })).subscribe(function (pos) {
            var left = _this._left + pos;
            _this.left = left < _this.restrictHResizeMin ? _this.restrictHResizeMin + "px" : left + "px";
            if (left > _this.restrictHResizeMax) {
                _this.left = _this.restrictHResizeMax + "px";
            }
            else if (left > _this.restrictHResizeMin) {
                _this.left = left + "px";
            }
        });
    }
    IgxColumnResizerDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.zone.runOutsideAngular(function () {
            fromEvent(_this.document.defaultView, "mousedown").pipe(takeUntil(_this._destroy))
                .subscribe(function (res) { return _this.onMousedown(res); });
            fromEvent(_this.document.defaultView, "mousemove").pipe(takeUntil(_this._destroy), throttle(function () { return interval(0, animationFrameScheduler); })).subscribe(function (res) { return _this.onMousemove(res); });
            fromEvent(_this.document.defaultView, "mouseup").pipe(takeUntil(_this._destroy))
                .subscribe(function (res) { return _this.onMouseup(res); });
        });
    };
    IgxColumnResizerDirective.prototype.ngOnDestroy = function () {
        this._destroy.next(true);
        this._destroy.unsubscribe();
    };
    Object.defineProperty(IgxColumnResizerDirective.prototype, "left", {
        set: function (val) {
            var _this = this;
            requestAnimationFrame(function () { return _this.element.nativeElement.style.left = val; });
        },
        enumerable: true,
        configurable: true
    });
    IgxColumnResizerDirective.prototype.onMouseup = function (event) {
        var _this = this;
        setTimeout(function () {
            _this.resizeEnd.next(event);
            _this.resizeEnd.complete();
        }, this.resizeEndTimeout);
    };
    IgxColumnResizerDirective.prototype.onMousedown = function (event) {
        this.resizeStart.next(event);
        event.preventDefault();
        var elStyle = this.document.defaultView.getComputedStyle(this.element.nativeElement);
        this._left = Number.isNaN(parseInt(elStyle.left, 10)) ? 0 : parseInt(elStyle.left, 10);
    };
    IgxColumnResizerDirective.prototype.onMousemove = function (event) {
        this.resize.next(event);
        event.preventDefault();
    };
    IgxColumnResizerDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxResizer]"
                },] },
    ];
    IgxColumnResizerDirective.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
        { type: NgZone, },
    ]; };
    IgxColumnResizerDirective.propDecorators = {
        "restrictHResizeMin": [{ type: Input },],
        "restrictHResizeMax": [{ type: Input },],
        "resizeEndTimeout": [{ type: Input },],
        "resizeEnd": [{ type: Output },],
        "resizeStart": [{ type: Output },],
        "resize": [{ type: Output },],
    };
    return IgxColumnResizerDirective;
}());
export { IgxColumnResizerDirective };
var IgxCellTemplateDirective = (function () {
    function IgxCellTemplateDirective(template) {
        this.template = template;
    }
    IgxCellTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxCell]"
                },] },
    ];
    IgxCellTemplateDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    return IgxCellTemplateDirective;
}());
export { IgxCellTemplateDirective };
var IgxCellHeaderTemplateDirective = (function () {
    function IgxCellHeaderTemplateDirective(template) {
        this.template = template;
    }
    IgxCellHeaderTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxHeader]"
                },] },
    ];
    IgxCellHeaderTemplateDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    return IgxCellHeaderTemplateDirective;
}());
export { IgxCellHeaderTemplateDirective };
var IgxGroupByRowTemplateDirective = (function () {
    function IgxGroupByRowTemplateDirective(template) {
        this.template = template;
    }
    IgxGroupByRowTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxGroupByRow]"
                },] },
    ];
    IgxGroupByRowTemplateDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    return IgxGroupByRowTemplateDirective;
}());
export { IgxGroupByRowTemplateDirective };
var IgxCellFooterTemplateDirective = (function () {
    function IgxCellFooterTemplateDirective(template) {
        this.template = template;
    }
    IgxCellFooterTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxFooter]"
                },] },
    ];
    IgxCellFooterTemplateDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    return IgxCellFooterTemplateDirective;
}());
export { IgxCellFooterTemplateDirective };
var IgxCellEditorTemplateDirective = (function () {
    function IgxCellEditorTemplateDirective(template) {
        this.template = template;
    }
    IgxCellEditorTemplateDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxCellEditor]"
                },] },
    ];
    IgxCellEditorTemplateDirective.ctorParameters = function () { return [
        { type: TemplateRef, },
    ]; };
    return IgxCellEditorTemplateDirective;
}());
export { IgxCellEditorTemplateDirective };
export function autoWire(markForCheck) {
    if (markForCheck === void 0) { markForCheck = false; }
    return function decorator(target, name, descriptor) {
        var old = descriptor.value || descriptor.set;
        var wrapped = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var result = old.apply(this, args);
            if (markForCheck) {
                this.cdr.markForCheck();
            }
            this.gridAPI.notify(this.gridID);
            return result;
        };
        if (descriptor.set) {
            descriptor.set = wrapped;
        }
        else if (descriptor.value) {
            descriptor.value = wrapped;
        }
        else {
            throw Error("Can bind only to setter properties and methods");
        }
        return descriptor;
    };
}
