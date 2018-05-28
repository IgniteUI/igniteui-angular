var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, HostBinding, Input, NgModule, Output, Renderer2, ViewChild } from "@angular/core";
export var IgxTextAlign;
(function (IgxTextAlign) {
    IgxTextAlign["START"] = "start";
    IgxTextAlign["CENTER"] = "center";
    IgxTextAlign["END"] = "end";
})(IgxTextAlign || (IgxTextAlign = {}));
var BaseProgress = (function () {
    function BaseProgress() {
        this.requestAnimationId = undefined;
        this._valueInPercent = 0;
        this._max = 100;
        this._value = 0;
        this._animate = true;
    }
    Object.defineProperty(BaseProgress.prototype, "valueInPercent", {
        get: function () {
            return this._valueInPercent;
        },
        set: function (valInPercent) {
            var valueInRange = getValueInProperRange(valInPercent, this._max);
            var valueIntoPercentage = convertInPercentage(valueInRange, this._max);
            this._valueInPercent = valueIntoPercentage;
        },
        enumerable: true,
        configurable: true
    });
    BaseProgress.prototype.runAnimation = function (val) {
        var _this = this;
        var direction = this.directionFlow(this._value, val);
        if (!this.requestAnimationId) {
            this.requestAnimationId = requestAnimationFrame(function () { return _this.updateProgressSmoothly.call(_this, val, direction); });
        }
    };
    BaseProgress.prototype.updateProgressSmoothly = function (val, direction) {
        var _this = this;
        if (this._value === val) {
            this.requestAnimationId = undefined;
            return;
        }
        this._value += direction;
        this.valueInPercent = this._value;
        requestAnimationFrame(function () { return _this.updateProgressSmoothly.call(_this, val, direction); });
    };
    BaseProgress.prototype.updateProgressDirectly = function (val) {
        this._value = val;
        this.valueInPercent = this._value;
    };
    BaseProgress.prototype.directionFlow = function (currentValue, prevValue) {
        if (currentValue < prevValue) {
            return 1;
        }
        return -1;
    };
    return BaseProgress;
}());
export { BaseProgress };
var NEXT_LINEAR_ID = 0;
var NEXT_CIRCULAR_ID = 0;
var IgxLinearProgressBarComponent = (function (_super) {
    __extends(IgxLinearProgressBarComponent, _super);
    function IgxLinearProgressBarComponent(elementRef) {
        var _this = _super.call(this) || this;
        _this.elementRef = elementRef;
        _this.id = "igx-linear-bar-" + NEXT_LINEAR_ID++;
        _this.textAlign = IgxTextAlign.START;
        _this.textVisibility = true;
        _this.textTop = false;
        _this.striped = false;
        _this.type = "default";
        _this.onProgressChanged = new EventEmitter();
        return _this;
    }
    Object.defineProperty(IgxLinearProgressBarComponent.prototype, "animate", {
        get: function () {
            return this._animate;
        },
        set: function (animate) {
            this._animate = animate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxLinearProgressBarComponent.prototype, "max", {
        get: function () {
            return this._max;
        },
        set: function (maxNum) {
            this._max = maxNum;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxLinearProgressBarComponent.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (val) {
            if (this._value === val) {
                return;
            }
            var valueInRange = getValueInProperRange(val, this.max);
            var changedValues = {
                currentValue: valueInRange,
                previousValue: this._value
            };
            if (this._animate) {
                _super.prototype.runAnimation.call(this, valueInRange);
            }
            else {
                _super.prototype.updateProgressDirectly.call(this, valueInRange);
            }
            this.onProgressChanged.emit(changedValues);
        },
        enumerable: true,
        configurable: true
    });
    IgxLinearProgressBarComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-linear-bar",
                    template: "<div class=\"progress-linear\" [class.progress-linear--striped]=\"striped\">     <div class=\"progress-linear__bar\" #linearBar role=\"progressbar\" aria-valuemin=\"0\" [attr.aria-valuemax]=\"max\" [attr.aria-valuenow]=\"value\">         <div class=\"progress-linear__bar-base\"></div>         <div class=\"progress-linear__bar-progress{{type ? '--' + type : ''}}\" [style.width.%]=\"valueInPercent\"></div>     </div>     <span          class=\"progress-linear__value{{textAlign ? '--' + textAlign : ''}}\"         [class.progress-linear__value--top]=\"textTop\"         [class.progress-linear__value--hidden]=\"!textVisibility\">             {{text ? text : valueInPercent + '%'}}     </span> </div>"
                },] },
    ];
    IgxLinearProgressBarComponent.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    IgxLinearProgressBarComponent.propDecorators = {
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "textAlign": [{ type: Input },],
        "textVisibility": [{ type: Input },],
        "textTop": [{ type: Input },],
        "text": [{ type: Input },],
        "striped": [{ type: Input },],
        "type": [{ type: Input },],
        "animate": [{ type: Input },],
        "max": [{ type: Input },],
        "value": [{ type: Input },],
        "onProgressChanged": [{ type: Output },],
    };
    return IgxLinearProgressBarComponent;
}(BaseProgress));
export { IgxLinearProgressBarComponent };
var IgxCircularProgressBarComponent = (function (_super) {
    __extends(IgxCircularProgressBarComponent, _super);
    function IgxCircularProgressBarComponent(elementRef, renderer) {
        var _this = _super.call(this) || this;
        _this.elementRef = elementRef;
        _this.renderer = renderer;
        _this.STROKE_OPACITY_DVIDER = 100;
        _this.STROKE_OPACITY_ADDITION = .2;
        _this.onProgressChanged = new EventEmitter();
        _this.id = "igx-circular-bar-" + NEXT_CIRCULAR_ID++;
        _this.textVisibility = true;
        _this._radius = 0;
        return _this;
    }
    Object.defineProperty(IgxCircularProgressBarComponent.prototype, "animate", {
        get: function () {
            return this._animate;
        },
        set: function (animate) {
            this._animate = animate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCircularProgressBarComponent.prototype, "max", {
        get: function () {
            return this._max;
        },
        set: function (maxNum) {
            this._max = maxNum;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCircularProgressBarComponent.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (val) {
            if (this._value === val) {
                return;
            }
            var valueInProperRange = getValueInProperRange(val, this.max);
            var changedValues = {
                currentValue: valueInProperRange,
                previousValue: this._value
            };
            if (this.animate) {
                _super.prototype.runAnimation.call(this, valueInProperRange);
            }
            else {
                this.updateProgressDirectly(valueInProperRange);
            }
            this.onProgressChanged.emit(changedValues);
        },
        enumerable: true,
        configurable: true
    });
    IgxCircularProgressBarComponent.prototype.ngAfterViewInit = function () {
        this._radius = parseInt(this._svgCircle.nativeElement.getAttribute("r"), 10);
        this._circumference = 2 * Math.PI * this._radius;
    };
    IgxCircularProgressBarComponent.prototype.updateProgressSmoothly = function (val, direction) {
        var FRAMES = [{
                strokeDashoffset: this.getProgress(this._value),
                strokeOpacity: (this._value / this.STROKE_OPACITY_DVIDER) + this.STROKE_OPACITY_ADDITION
            }, {
                strokeDashoffset: this.getProgress(this.valueInPercent),
                strokeOpacity: (this.valueInPercent / this.STROKE_OPACITY_DVIDER) + this.STROKE_OPACITY_ADDITION
            }];
        this._svgCircle.nativeElement.animate(FRAMES, {
            easing: "ease-out",
            fill: "forwards"
        });
        _super.prototype.updateProgressSmoothly.call(this, val, direction);
    };
    IgxCircularProgressBarComponent.prototype.updateProgressDirectly = function (val) {
        _super.prototype.updateProgressDirectly.call(this, val);
        this.renderer.setStyle(this._svgCircle.nativeElement, "stroke-dashoffset", this.getProgress(this.valueInPercent));
        this.renderer.setStyle(this._svgCircle.nativeElement, "stroke-opacity", (this.valueInPercent / this.STROKE_OPACITY_DVIDER) + this.STROKE_OPACITY_ADDITION);
    };
    IgxCircularProgressBarComponent.prototype.getProgress = function (percentage) {
        return this._circumference - (percentage * this._circumference / 100);
    };
    IgxCircularProgressBarComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-circular-bar",
                    template: "<svg #svg class=\"progress-circular\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\"     viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\" role=\"progressbar\" aria-valuemin=\"0\" [attr.aria-valuemax]=\"max\" [attr.aria-valuenow]=\"value\">     <circle class=\"progress-circular__innercircle\" cx=\"50\" cy=\"50\" r=\"46\" />     <circle #circle class=\"progress-circular__circle\" cx=\"50\" cy=\"50\" r=\"46\" />     <text #text class=\"progress-circular__text\" [class.progress-circular__text--hidden]=\"!textVisibility\" id=\"myTimer\" text-anchor=\"middle\" x=\"50\" y=\"60\">         {{valueInPercent}}%     </text> </svg>"
                },] },
    ];
    IgxCircularProgressBarComponent.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: Renderer2, },
    ]; };
    IgxCircularProgressBarComponent.propDecorators = {
        "onProgressChanged": [{ type: Output },],
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "textVisibility": [{ type: Input },],
        "animate": [{ type: Input },],
        "max": [{ type: Input },],
        "value": [{ type: Input },],
        "_svgCircle": [{ type: ViewChild, args: ["circle",] },],
        "_svgText": [{ type: ViewChild, args: ["text",] },],
    };
    return IgxCircularProgressBarComponent;
}(BaseProgress));
export { IgxCircularProgressBarComponent };
export function getValueInProperRange(value, max, min) {
    if (min === void 0) { min = 0; }
    return Math.max(Math.min(value, max), min);
}
export function convertInPercentage(value, max) {
    return Math.floor(100 * value / max);
}
var IgxProgressBarModule = (function () {
    function IgxProgressBarModule() {
    }
    IgxProgressBarModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxLinearProgressBarComponent, IgxCircularProgressBarComponent],
                    exports: [IgxLinearProgressBarComponent, IgxCircularProgressBarComponent],
                    imports: [CommonModule]
                },] },
    ];
    return IgxProgressBarModule;
}());
export { IgxProgressBarModule };
