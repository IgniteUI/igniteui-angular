import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, HostBinding, Input, NgModule, Output, Renderer2, ViewChild } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
export var SliderType;
(function (SliderType) {
    SliderType[SliderType["SLIDER"] = 0] = "SLIDER";
    SliderType[SliderType["RANGE"] = 1] = "RANGE";
})(SliderType || (SliderType = {}));
var SliderHandle;
(function (SliderHandle) {
    SliderHandle[SliderHandle["FROM"] = 0] = "FROM";
    SliderHandle[SliderHandle["TO"] = 1] = "TO";
})(SliderHandle || (SliderHandle = {}));
var noop = function () {
};
var ɵ0 = noop;
var NEXT_ID = 0;
var IgxSliderComponent = (function () {
    function IgxSliderComponent(renderer) {
        this.renderer = renderer;
        this.id = "igx-slider-" + NEXT_ID++;
        this.isContinuous = false;
        this.type = SliderType.SLIDER;
        this.thumbLabelVisibilityDuration = 750;
        this.step = 1;
        this.onValueChange = new EventEmitter();
        this.isActiveLabel = false;
        this.activeHandle = SliderHandle.TO;
        this._minValue = 0;
        this.width = 0;
        this.xOffset = 0;
        this.xPointer = 0;
        this.pPointer = 0;
        this.pMin = 0;
        this.pMax = 1;
        this.hasViewInit = false;
        this._maxValue = 100;
        this._onChangeCallback = noop;
        this._onTouchedCallback = noop;
    }
    Object.defineProperty(IgxSliderComponent.prototype, "isRange", {
        get: function () {
            var isRange = this.type === SliderType.RANGE;
            return isRange;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxSliderComponent.prototype, "minValue", {
        get: function () {
            return this._minValue;
        },
        set: function (value) {
            if (value >= this.maxValue) {
                this._minValue = this.maxValue - 1;
                return;
            }
            this._minValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxSliderComponent.prototype, "maxValue", {
        get: function () {
            return this._maxValue;
        },
        set: function (value) {
            if (value <= this._minValue) {
                this._maxValue = this._minValue + 1;
                return;
            }
            this._maxValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxSliderComponent.prototype, "lowerBound", {
        get: function () {
            return this._lowerBound;
        },
        set: function (value) {
            if (value >= this.upperBound) {
                this._lowerBound = this.minValue;
                return;
            }
            this._lowerBound = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxSliderComponent.prototype, "upperBound", {
        get: function () {
            return this._upperBound;
        },
        set: function (value) {
            if (value <= this.lowerBound) {
                this._upperBound = this.maxValue;
                return;
            }
            this._upperBound = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxSliderComponent.prototype, "lowerValue", {
        get: function () {
            return this._lowerValue;
        },
        set: function (value) {
            if (value < this.lowerBound || this.upperBound < value) {
                return;
            }
            if (this.isRange && value > this.upperValue) {
                return;
            }
            this._lowerValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxSliderComponent.prototype, "upperValue", {
        get: function () {
            return this._upperValue;
        },
        set: function (value) {
            if (value < this.lowerBound || this.upperBound < value) {
                return;
            }
            if (this.isRange && value < this.lowerValue) {
                return;
            }
            this._upperValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxSliderComponent.prototype, "value", {
        get: function () {
            if (this.isRange) {
                return {
                    lower: this.snapValueToStep(this.lowerValue),
                    upper: this.snapValueToStep(this.upperValue)
                };
            }
            else {
                var val = this.snapValueToStep(this.upperValue);
                return val;
            }
        },
        set: function (value) {
            if (!this.isRange) {
                this.upperValue = this.snapValueToStep(value);
            }
            else {
                this.upperValue =
                    this.snapValueToStep(value == null ? null : value.upper);
                this.lowerValue =
                    this.snapValueToStep(value == null ? null : value.lower);
            }
            this._onChangeCallback(this.value);
            if (this.hasViewInit) {
                this.positionHandlesAndUpdateTrack();
            }
        },
        enumerable: true,
        configurable: true
    });
    IgxSliderComponent.prototype.ngOnInit = function () {
        if (this.lowerBound === undefined) {
            this.lowerBound = this.minValue;
        }
        if (this.upperBound === undefined) {
            this.upperBound = this.maxValue;
        }
        if (this.isRange) {
            if (Number.isNaN(this.value.lower)) {
                this.value = {
                    lower: this.lowerBound,
                    upper: this.value.upper
                };
            }
            if (Number.isNaN(this.value.upper)) {
                this.value = {
                    lower: this.value.lower,
                    upper: this.upperBound
                };
            }
        }
        else {
            if (Number.isNaN(this.value)) {
                this.value = this.lowerBound;
            }
        }
        this.pMin = this.valueToFraction(this.lowerBound) || 0;
        this.pMax = this.valueToFraction(this.upperBound) || 1;
    };
    IgxSliderComponent.prototype.ngAfterViewInit = function () {
        this.hasViewInit = true;
        this.positionHandlesAndUpdateTrack();
        this.setTickInterval();
    };
    IgxSliderComponent.prototype.writeValue = function (value) {
        this.value = value;
    };
    IgxSliderComponent.prototype.registerOnChange = function (fn) {
        this._onChangeCallback = fn;
    };
    IgxSliderComponent.prototype.registerOnTouched = function (fn) {
        this._onTouchedCallback = fn;
    };
    IgxSliderComponent.prototype.showThumbsLabels = function () {
        if (this.disabled) {
            return;
        }
        if (this.isContinuous) {
            return;
        }
        if (this.timer !== null) {
            clearInterval(this.timer);
        }
        this.isActiveLabel = true;
    };
    IgxSliderComponent.prototype.onFocus = function ($event) {
        if (this.isRange && $event.target === this.thumbFrom.nativeElement) {
            this.activeHandle = SliderHandle.FROM;
        }
        if ($event.target === this.thumbTo.nativeElement) {
            this.activeHandle = SliderHandle.TO;
        }
        this.toggleThumbLabel();
    };
    IgxSliderComponent.prototype.onPanEnd = function ($event) {
        this.hideThumbsLabels();
        this.emitValueChanged(null);
    };
    IgxSliderComponent.prototype.hideThumbLabelsOnBlur = function () {
        if (this.timer !== null) {
            clearInterval(this.timer);
        }
        this.isActiveLabel = false;
    };
    IgxSliderComponent.prototype.onKeyDown = function ($event) {
        if (this.disabled) {
            return true;
        }
        var incrementSign;
        if ($event.key.endsWith("Left")) {
            incrementSign = -1;
        }
        else if ($event.key.endsWith("Right")) {
            incrementSign = 1;
        }
        else {
            return;
        }
        var value = this.value;
        if (this.isRange) {
            if (this.activeHandle === SliderHandle.FROM) {
                var newLower = this.value.lower + incrementSign * this.step;
                if (newLower >= this.value.upper) {
                    this.thumbTo.nativeElement.focus();
                    return;
                }
                this.value = {
                    lower: newLower,
                    upper: this.value.upper
                };
            }
            else {
                var newUpper = this.value.upper + incrementSign * this.step;
                if (newUpper <= this.value.lower) {
                    this.thumbFrom.nativeElement.focus();
                    return;
                }
                this.value = {
                    lower: this.value.lower,
                    upper: this.value.upper + incrementSign * this.step
                };
            }
        }
        else {
            this.value = this.value + incrementSign * this.step;
        }
        if (this.hasValueChanged(value)) {
            this.emitValueChanged(value);
        }
        this.showThumbsLabels();
    };
    IgxSliderComponent.prototype.onTap = function ($event) {
        var value = this.value;
        this.update($event);
        if (this.hasValueChanged(value)) {
            this.emitValueChanged(value);
        }
    };
    IgxSliderComponent.prototype.update = function ($event) {
        if (this.disabled) {
            return;
        }
        if ($event.type === "tap") {
            this.toggleThumbLabel();
        }
        this.setSliderWidth();
        this.setSliderOffset();
        this.setPointerPosition($event);
        this.setPointerPercent();
        if (this.isRange) {
            this.closestHandle();
        }
        this.setValues();
        this.positionHandlesAndUpdateTrack();
        this._onTouchedCallback();
    };
    IgxSliderComponent.prototype.hideThumbsLabels = function () {
        var _this = this;
        if (this.disabled) {
            return;
        }
        if (this.isContinuous) {
            return;
        }
        this.timer = setTimeout(function () { return _this.isActiveLabel = false; }, this.thumbLabelVisibilityDuration);
    };
    IgxSliderComponent.prototype.generateTickMarks = function (color, interval) {
        return "repeating-linear-gradient(\n            " + "to left" + ",\n            " + color + ",\n            " + color + " 1.5px,\n            transparent 1.5px,\n            transparent " + interval + "%\n        ), repeating-linear-gradient(\n            " + "to right" + ",\n            " + color + ",\n            " + color + " 1.5px,\n            transparent 1.5px,\n            transparent " + interval + "%\n        )";
    };
    IgxSliderComponent.prototype.toggleThumbLabel = function () {
        this.showThumbsLabels();
        this.hideThumbsLabels();
    };
    IgxSliderComponent.prototype.getSliderOffset = function () {
        return this.xOffset;
    };
    IgxSliderComponent.prototype.toFixed = function (num) {
        num = parseFloat(num.toFixed(20));
        return num;
    };
    IgxSliderComponent.prototype.positionHandle = function (handle, position) {
        handle.nativeElement.style.left = this.valueToFraction(position) * 100 + "%";
    };
    IgxSliderComponent.prototype.positionHandlesAndUpdateTrack = function () {
        if (!this.isRange) {
            this.positionHandle(this.thumbTo, this.value);
        }
        else {
            this.positionHandle(this.thumbTo, this.value.upper);
            this.positionHandle(this.thumbFrom, this.value.lower);
        }
        this.updateTrack();
    };
    IgxSliderComponent.prototype.closestHandle = function () {
        var fromOffset = this.thumbFrom.nativeElement.offsetLeft + this.thumbFrom.nativeElement.offsetWidth / 2;
        var toOffset = this.thumbTo.nativeElement.offsetLeft + this.thumbTo.nativeElement.offsetWidth / 2;
        var match = this.closestTo(this.xPointer, [fromOffset, toOffset]);
        if (match === toOffset) {
            this.thumbTo.nativeElement.focus();
        }
        else if (match === fromOffset) {
            this.thumbFrom.nativeElement.focus();
        }
    };
    IgxSliderComponent.prototype.setTickInterval = function () {
        if (this.isContinuous) {
            return;
        }
        var interval = this.step > 1 ? this.step : null;
        this.renderer.setStyle(this.ticks.nativeElement, "background", this.generateTickMarks("white", interval));
    };
    IgxSliderComponent.prototype.snapValueToStep = function (value) {
        var valueModStep = (value - this.minValue) % this.step;
        var snapValue = value - valueModStep;
        if (Math.abs(valueModStep) * 2 >= this.step) {
            snapValue += (valueModStep > 0) ? this.step : (-this.step);
        }
        return parseFloat(snapValue.toFixed(20));
    };
    IgxSliderComponent.prototype.closestTo = function (goal, positions) {
        return positions.reduce(function (previous, current) {
            return (Math.abs(goal - current) < Math.abs(goal - previous) ? current : previous);
        });
    };
    IgxSliderComponent.prototype.setValues = function () {
        if (this.activeHandle === SliderHandle.TO) {
            if (this.isRange) {
                this.value = {
                    lower: this.value.lower,
                    upper: this.fractionToValue(this.pPointer)
                };
            }
            else {
                this.value = this.fractionToValue(this.pPointer);
            }
        }
        if (this.activeHandle === SliderHandle.FROM) {
            this.value = {
                lower: this.fractionToValue(this.pPointer),
                upper: this.value.upper
            };
        }
    };
    IgxSliderComponent.prototype.setSliderWidth = function () {
        this.width = this.slider.nativeElement.offsetWidth;
    };
    IgxSliderComponent.prototype.setPointerPosition = function (e) {
        this.xPointer = e.center.x - this.getSliderOffset();
    };
    IgxSliderComponent.prototype.setSliderOffset = function () {
        var rect = this.slider.nativeElement.getBoundingClientRect();
        this.xOffset = rect.left;
    };
    IgxSliderComponent.prototype.setPointerPercent = function () {
        this.pPointer = this.limit(this.toFixed(this.xPointer / this.width));
    };
    IgxSliderComponent.prototype.valueToFraction = function (value) {
        return this.limit((value - this.minValue) / (this.maxValue - this.minValue));
    };
    IgxSliderComponent.prototype.fractionToValue = function (fraction) {
        var max = this.maxValue;
        var min = this.minValue;
        return (max - min) * fraction + min;
    };
    IgxSliderComponent.prototype.fractionToPercent = function (fraction) {
        return this.toFixed(fraction * 100);
    };
    IgxSliderComponent.prototype.limit = function (num) {
        return Math.max(this.pMin, Math.min(num, this.pMax));
    };
    IgxSliderComponent.prototype.updateTrack = function () {
        var fromPosition = this.valueToFraction(this.lowerValue);
        var toPosition = this.valueToFraction(this.upperValue);
        var positionGap = (this.valueToFraction(this.upperValue) - this.valueToFraction(this.lowerValue));
        if (!this.isRange) {
            this.track.nativeElement.style.transform = "scaleX(" + toPosition + ")";
        }
        if (this.isRange) {
            this.track.nativeElement.style.transform = "scaleX(" + 1 + ")";
            this.track.nativeElement.style.left = fromPosition * 100 + "%";
            this.track.nativeElement.style.width = positionGap * 100 + "%";
        }
    };
    IgxSliderComponent.prototype.hasValueChanged = function (oldValue) {
        var isSliderWithDifferentValue = !this.isRange && oldValue !== this.value;
        var isRangeWithOneDifferentValue = this.isRange &&
            (oldValue.lower !== this.value.lower ||
                oldValue.upper !== this.value.upper);
        return isSliderWithDifferentValue || isRangeWithOneDifferentValue;
    };
    IgxSliderComponent.prototype.emitValueChanged = function (oldValue) {
        this.onValueChange.emit({ oldValue: oldValue, value: this.value });
    };
    IgxSliderComponent.decorators = [
        { type: Component, args: [{
                    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxSliderComponent, multi: true }],
                    selector: "igx-slider",
                    template: "<div class=\"igx-slider\" [class.igx-slider--disabled]=\"disabled\" #slider (panstart)=\"showThumbsLabels()\" (panend)=\"onPanEnd($event)\"     (pan)=\"update($event)\" (tap)=\"onTap($event)\">     <div class=\"igx-slider__track\">         <div #track class=\"igx-slider__track-fill\"></div>         <div #ticks class=\"igx-slider__track-ticks\"></div>     </div>     <div class=\"igx-slider__thumbs\">         <div (keydown)=\"onKeyDown($event);\" (keyup)=\"hideThumbsLabels()\" (blur)=\"hideThumbLabelsOnBlur()\" (focus)=\"onFocus($event);\"             *ngIf=\"isRange\" class=\"igx-slider__thumb-from\" tabindex=\"1\" [ngClass]=\"{ 'igx-slider__thumb-from--active': isActiveLabel }\"             #thumbFrom>             <span class=\"label\">{{ lowerValue}}</span>             <span class=\"dot\"></span>         </div>         <div (keydown)=\"onKeyDown($event);\" (keyup)=\"hideThumbsLabels()\" (blur)=\"hideThumbLabelsOnBlur()\" (focus)=\"onFocus($event);\"             class=\"igx-slider__thumb-to\" tabindex=\"1\" [ngClass]=\"{ 'igx-slider__thumb-to--active': isActiveLabel }\" #thumbTo>             <span *ngIf=\"isRange\" class=\"label\">{{ upperValue}}</span>             <span *ngIf=\"!isRange\" class=\"label\">{{ value }}</span>             <span class=\"dot\"></span>         </div>     </div> </div>"
                },] },
    ];
    IgxSliderComponent.ctorParameters = function () { return [
        { type: Renderer2, },
    ]; };
    IgxSliderComponent.propDecorators = {
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "disabled": [{ type: Input },],
        "isContinuous": [{ type: Input },],
        "type": [{ type: Input },],
        "thumbLabelVisibilityDuration": [{ type: Input },],
        "step": [{ type: Input },],
        "onValueChange": [{ type: Output },],
        "slider": [{ type: ViewChild, args: ["slider",] },],
        "track": [{ type: ViewChild, args: ["track",] },],
        "ticks": [{ type: ViewChild, args: ["ticks",] },],
        "thumbFrom": [{ type: ViewChild, args: ["thumbFrom",] },],
        "thumbTo": [{ type: ViewChild, args: ["thumbTo",] },],
        "minValue": [{ type: Input },],
        "maxValue": [{ type: Input },],
        "lowerBound": [{ type: Input },],
        "upperBound": [{ type: Input },],
        "value": [{ type: Input },],
    };
    return IgxSliderComponent;
}());
export { IgxSliderComponent };
var IgxSliderModule = (function () {
    function IgxSliderModule() {
    }
    IgxSliderModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxSliderComponent],
                    exports: [IgxSliderComponent],
                    imports: [CommonModule]
                },] },
    ];
    return IgxSliderModule;
}());
export { IgxSliderModule };
export { ɵ0 };
