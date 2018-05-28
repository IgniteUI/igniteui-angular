import { Directive, ElementRef, HostBinding, Input } from "@angular/core";
var IgxHintPosition;
(function (IgxHintPosition) {
    IgxHintPosition[IgxHintPosition["START"] = 0] = "START";
    IgxHintPosition[IgxHintPosition["END"] = 1] = "END";
})(IgxHintPosition || (IgxHintPosition = {}));
var IgxHintDirective = (function () {
    function IgxHintDirective(_element) {
        this._element = _element;
        this._position = IgxHintPosition.START;
        this.isPositionStart = false;
        this.isPositionEnd = false;
    }
    Object.defineProperty(IgxHintDirective.prototype, "position", {
        get: function () {
            return this._position.toString();
        },
        set: function (value) {
            var position = IgxHintPosition[value.toUpperCase()];
            if (position !== undefined) {
                this._position = position;
                this._applyPosition(this._position);
            }
        },
        enumerable: true,
        configurable: true
    });
    IgxHintDirective.prototype.ngOnInit = function () {
        this._applyPosition(this._position);
    };
    IgxHintDirective.prototype._applyPosition = function (position) {
        this.isPositionStart = this.isPositionEnd = false;
        switch (position) {
            case IgxHintPosition.START:
                this.isPositionStart = true;
                break;
            case IgxHintPosition.END:
                this.isPositionEnd = true;
                break;
            default: break;
        }
    };
    IgxHintDirective.decorators = [
        { type: Directive, args: [{
                    selector: "igx-hint,[igxHint]"
                },] },
    ];
    IgxHintDirective.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    IgxHintDirective.propDecorators = {
        "isPositionStart": [{ type: HostBinding, args: ["class.igx-input-group__hint-item--start",] },],
        "isPositionEnd": [{ type: HostBinding, args: ["class.igx-input-group__hint-item--end",] },],
        "position": [{ type: Input, args: ["position",] },],
    };
    return IgxHintDirective;
}());
export { IgxHintDirective };
