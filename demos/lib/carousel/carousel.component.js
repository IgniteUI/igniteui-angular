import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, NgModule, Output } from "@angular/core";
import { IgxIconModule } from "../icon";
var NEXT_ID = 0;
export var Direction;
(function (Direction) {
    Direction[Direction["NONE"] = 0] = "NONE";
    Direction[Direction["NEXT"] = 1] = "NEXT";
    Direction[Direction["PREV"] = 2] = "PREV";
})(Direction || (Direction = {}));
var IgxCarouselComponent = (function () {
    function IgxCarouselComponent(element) {
        this.element = element;
        this.role = "region";
        this.id = "igx-carousel-" + NEXT_ID++;
        this.loop = true;
        this.pause = true;
        this.navigation = true;
        this.onSlideChanged = new EventEmitter();
        this.onSlideAdded = new EventEmitter();
        this.onSlideRemoved = new EventEmitter();
        this.onCarouselPaused = new EventEmitter();
        this.onCarouselPlaying = new EventEmitter();
        this.slides = [];
        this._total = 0;
    }
    Object.defineProperty(IgxCarouselComponent.prototype, "interval", {
        get: function () {
            return this._interval;
        },
        set: function (value) {
            this._interval = +value;
            this._restartInterval();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCarouselComponent.prototype, "tabIndex", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    IgxCarouselComponent.prototype.ngOnDestroy = function () {
        this._destroyed = true;
        if (this._lastInterval) {
            clearInterval(this._lastInterval);
        }
    };
    IgxCarouselComponent.prototype.setAriaLabel = function (slide) {
        return "Item " + (slide.index + 1) + " of " + this.total;
    };
    Object.defineProperty(IgxCarouselComponent.prototype, "total", {
        get: function () {
            return this._total;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCarouselComponent.prototype, "current", {
        get: function () {
            return !this._currentSlide ? 0 : this._currentSlide.index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCarouselComponent.prototype, "isPlaying", {
        get: function () {
            return this._playing;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCarouselComponent.prototype, "isDestroyed", {
        get: function () {
            return this._destroyed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IgxCarouselComponent.prototype, "nativeElement", {
        get: function () {
            return this.element.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    IgxCarouselComponent.prototype.get = function (index) {
        for (var _i = 0, _a = this.slides; _i < _a.length; _i++) {
            var each = _a[_i];
            if (each.index === index) {
                return each;
            }
        }
    };
    IgxCarouselComponent.prototype.add = function (slide) {
        slide.index = this.total;
        this.slides.push(slide);
        this._total += 1;
        if (this.total === 1 || slide.active) {
            this.select(slide);
            if (this.total === 1) {
                this.play();
            }
        }
        else {
            slide.active = false;
        }
        this.onSlideAdded.emit({ carousel: this, slide: slide });
    };
    IgxCarouselComponent.prototype.remove = function (slide) {
        this.slides.splice(slide.index, 1);
        this._total -= 1;
        if (!this.total) {
            this._currentSlide = null;
            return;
        }
        for (var i = 0; i < this.total; i++) {
            this.slides[i].index = i;
        }
        this.onSlideRemoved.emit({ carousel: this, slide: slide });
    };
    IgxCarouselComponent.prototype.select = function (slide, direction) {
        if (direction === void 0) { direction = Direction.NONE; }
        var newIndex = slide.index;
        if (direction === Direction.NONE) {
            direction = newIndex > this.current ? Direction.NEXT : Direction.PREV;
        }
        if (slide && slide !== this._currentSlide) {
            this._moveTo(slide, direction);
        }
    };
    IgxCarouselComponent.prototype.next = function () {
        var index = (this.current + 1) % this.total;
        if (index === 0 && !this.loop) {
            this.stop();
            return;
        }
        return this.select(this.get(index), Direction.NEXT);
    };
    IgxCarouselComponent.prototype.prev = function () {
        var index = this.current - 1 < 0 ?
            this.total - 1 : this.current - 1;
        if (!this.loop && index === this.total - 1) {
            this.stop();
            return;
        }
        return this.select(this.get(index), Direction.PREV);
    };
    IgxCarouselComponent.prototype.play = function () {
        if (!this._playing) {
            this._playing = true;
            this.onCarouselPlaying.emit(this);
            this._restartInterval();
        }
    };
    IgxCarouselComponent.prototype.stop = function () {
        if (this.pause) {
            this._playing = false;
            this.onCarouselPaused.emit(this);
            this._resetInterval();
        }
    };
    IgxCarouselComponent.prototype._moveTo = function (slide, direction) {
        var _this = this;
        if (this._destroyed) {
            return;
        }
        slide.direction = direction;
        slide.active = true;
        if (this._currentSlide) {
            this._currentSlide.direction = direction;
            this._currentSlide.active = false;
        }
        this._currentSlide = slide;
        this.onSlideChanged.emit({ carousel: this, slide: slide });
        this._restartInterval();
        requestAnimationFrame(function () { return _this.nativeElement.focus(); });
    };
    IgxCarouselComponent.prototype._resetInterval = function () {
        if (this._lastInterval) {
            clearInterval(this._lastInterval);
            this._lastInterval = null;
        }
    };
    IgxCarouselComponent.prototype._restartInterval = function () {
        var _this = this;
        this._resetInterval();
        if (!isNaN(this.interval) && this.interval > 0) {
            this._lastInterval = setInterval(function () {
                var tick = +_this.interval;
                if (_this._playing && _this.total && !isNaN(tick) && tick > 0) {
                    _this.next();
                }
                else {
                    _this.stop();
                }
            }, this.interval);
        }
    };
    IgxCarouselComponent.prototype.onKeydownArrowRight = function () {
        this.next();
    };
    IgxCarouselComponent.prototype.onKeydownArrowLeft = function () {
        this.prev();
    };
    IgxCarouselComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-carousel",
                    template: "<div tabindex=\"0\" aria-label=\"carousel\" class=\"igx-carousel\"         (mouseenter)=\"stop()\"         (mouseleave)=\"play()\"         (swipeleft)=\"next()\"         (swiperight)=\"prev()\"         (tap)=\"isPlaying ? stop() : play()\">     <ul class=\"igx-carousel__indicators\" [hidden]=\"slides.length <= 1\">         <li *ngFor=\"let slide of slides\" [attr.aria-label]=\"setAriaLabel(slide)\" [attr.aria-selected]=\"slide.active\" [class.active]=\"slide.active === true\"             (click)=\"select(slide)\"></li>     </ul>     <div class=\"igx-carousel__inner\" role=\"list\">         <ng-content></ng-content>     </div>     <div *ngIf=\"navigation\">         <a role=\"button\" tabindex=\"0\" class=\"igx-carousel__arrow--prev\" (click)=\"prev()\" [hidden]=\"!slides.length\">             <igx-icon fontSet=\"material\" name=\"arrow_back\"></igx-icon>         </a>         <a role=\"button\" tabindex=\"0\" class=\"igx-carousel__arrow--next\" (click)=\"next()\" [hidden]=\"!slides.length\">             <igx-icon fontSet=\"material\" name=\"arrow_forward\"></igx-icon>         </a>     </div> </div>"
                },] },
    ];
    IgxCarouselComponent.ctorParameters = function () { return [
        { type: ElementRef, },
    ]; };
    IgxCarouselComponent.propDecorators = {
        "role": [{ type: HostBinding, args: ["attr.role",] },],
        "id": [{ type: HostBinding, args: ["attr.id",] }, { type: Input },],
        "loop": [{ type: Input },],
        "pause": [{ type: Input },],
        "interval": [{ type: Input },],
        "tabIndex": [{ type: HostBinding, args: ["attr.tabindex",] },],
        "navigation": [{ type: Input },],
        "onSlideChanged": [{ type: Output },],
        "onSlideAdded": [{ type: Output },],
        "onSlideRemoved": [{ type: Output },],
        "onCarouselPaused": [{ type: Output },],
        "onCarouselPlaying": [{ type: Output },],
        "onKeydownArrowRight": [{ type: HostListener, args: ["keydown.arrowright",] },],
        "onKeydownArrowLeft": [{ type: HostListener, args: ["keydown.arrowleft",] },],
    };
    return IgxCarouselComponent;
}());
export { IgxCarouselComponent };
var IgxSlideComponent = (function () {
    function IgxSlideComponent(carousel) {
        this.carousel = carousel;
    }
    IgxSlideComponent.prototype.ngOnInit = function () {
        this.carousel.add(this);
    };
    IgxSlideComponent.prototype.ngOnDestroy = function () {
        this.carousel.remove(this);
    };
    IgxSlideComponent.decorators = [
        { type: Component, args: [{
                    selector: "igx-slide",
                    template: "<div     role=\"listitem\"     [class.active]=\"active\"     class=\"igx-slide\"     [attr.aria-selected]=\"active\"     [attr.aria-live]=\"active ? 'polite' : null\"     [attr.tabIndex]=\"active ? 0 : null\" >     <ng-content></ng-content> </div>"
                },] },
    ];
    IgxSlideComponent.ctorParameters = function () { return [
        { type: IgxCarouselComponent, },
    ]; };
    IgxSlideComponent.propDecorators = {
        "index": [{ type: Input },],
        "direction": [{ type: Input },],
        "active": [{ type: HostBinding, args: ["class.active",] }, { type: Input },],
    };
    return IgxSlideComponent;
}());
export { IgxSlideComponent };
var IgxCarouselModule = (function () {
    function IgxCarouselModule() {
    }
    IgxCarouselModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxCarouselComponent, IgxSlideComponent],
                    exports: [IgxCarouselComponent, IgxSlideComponent],
                    imports: [CommonModule, IgxIconModule]
                },] },
    ];
    return IgxCarouselModule;
}());
export { IgxCarouselModule };
