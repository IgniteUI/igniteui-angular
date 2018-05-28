import { Inject, Injectable, NgZone } from "@angular/core";
import { DOCUMENT, ɵgetDOM as getDOM } from "@angular/platform-browser";
var EVENT_SUFFIX = "precise";
var HammerGesturesManager = (function () {
    function HammerGesturesManager(_zone, doc) {
        this._zone = _zone;
        this.doc = doc;
        this.hammerOptions = {
            inputClass: Hammer.TouchInput,
            recognizers: [
                [Hammer.Pan, { threshold: 0 }],
                [Hammer.Pinch, { enable: true }],
                [Hammer.Rotate, { enable: true }],
                [Hammer.Swipe, {
                        direction: Hammer.DIRECTION_HORIZONTAL
                    }]
            ]
        };
        this._hammerManagers = [];
    }
    HammerGesturesManager.prototype.supports = function (eventName) {
        return eventName.toLowerCase().endsWith("." + EVENT_SUFFIX);
    };
    HammerGesturesManager.prototype.addEventListener = function (element, eventName, eventHandler, options) {
        var _this = this;
        if (options === void 0) { options = null; }
        return this._zone.runOutsideAngular(function () {
            var mc = _this.getManagerForElement(element);
            if (mc === null) {
                mc = new Hammer(element, _this.hammerOptions);
                _this.addManagerForElement(element, mc);
            }
            var handler = function (eventObj) { _this._zone.run(function () { eventHandler(eventObj); }); };
            mc.on(eventName, handler);
            return function () { mc.off(eventName, handler); };
        });
    };
    HammerGesturesManager.prototype.addGlobalEventListener = function (target, eventName, eventHandler) {
        var element = this.getGlobalEventTarget(target);
        return this.addEventListener(element, eventName, eventHandler);
    };
    HammerGesturesManager.prototype.getGlobalEventTarget = function (target) {
        return getDOM().getGlobalEventTarget(this.doc, target);
    };
    HammerGesturesManager.prototype.setManagerOption = function (element, event, options) {
        var manager = this.getManagerForElement(element);
        manager.get(event).set(options);
    };
    HammerGesturesManager.prototype.addManagerForElement = function (element, manager) {
        this._hammerManagers.push({ element: element, manager: manager });
    };
    HammerGesturesManager.prototype.getManagerForElement = function (element) {
        var result = this._hammerManagers.filter(function (value, index, array) {
            return value.element === element;
        });
        return result.length ? result[0].manager : null;
    };
    HammerGesturesManager.prototype.removeManagerForElement = function (element) {
        var index = null;
        for (var i = 0; i < this._hammerManagers.length; i++) {
            if (element === this._hammerManagers[i].element) {
                index = i;
                break;
            }
        }
        if (index !== null) {
            var item = this._hammerManagers.splice(index, 1)[0];
            item.manager.destroy();
        }
    };
    HammerGesturesManager.prototype.destroy = function () {
        for (var _i = 0, _a = this._hammerManagers; _i < _a.length; _i++) {
            var item = _a[_i];
            item.manager.destroy();
        }
        this._hammerManagers = [];
    };
    HammerGesturesManager.decorators = [
        { type: Injectable },
    ];
    HammerGesturesManager.ctorParameters = function () { return [
        { type: NgZone, },
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
    ]; };
    return HammerGesturesManager;
}());
export { HammerGesturesManager };
