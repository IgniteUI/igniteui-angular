var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, ComponentFactoryResolver, Directive, EventEmitter, Input, IterableDiffers, NgModule, NgZone, Output, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { DeprecateProperty } from "../../core/deprecateDecorators";
import { DisplayContainerComponent } from "./display.container";
import { HVirtualHelperComponent } from "./horizontal.virtual.helper.component";
import { VirtualHelperComponent } from "./virtual.helper.component";
var IgxForOfDirective = (function () {
    function IgxForOfDirective(_viewContainer, _template, _differs, resolver, cdr, _zone) {
        this._viewContainer = _viewContainer;
        this._template = _template;
        this._differs = _differs;
        this.resolver = resolver;
        this.cdr = cdr;
        this._zone = _zone;
        this.state = {
            startIndex: 0,
            chunkSize: 0
        };
        this.totalItemCount = null;
        this.igxForRemote = false;
        this.onChunkLoad = new EventEmitter();
        this.onChunkPreload = new EventEmitter();
        this._differ = null;
        this._lastTouchX = 0;
        this._lastTouchY = 0;
        this._isScrolledToBottom = false;
        this._virtHeight = 0;
        this._virtHeightRatio = 1;
        this._virtScrollTop = 0;
        this._bScrollInternal = false;
        this._embeddedViews = [];
    }
    Object.defineProperty(IgxForOfDirective.prototype, "isRemote", {
        get: function () {
            return this.totalItemCount !== null;
        },
        enumerable: true,
        configurable: true
    });
    IgxForOfDirective.prototype.ngOnInit = function () {
        var _this = this;
        var totalWidth = 0;
        var vc = this.igxForScrollContainer ? this.igxForScrollContainer._viewContainer : this._viewContainer;
        var dcFactory = this.resolver.resolveComponentFactory(DisplayContainerComponent);
        this.dc = this._viewContainer.createComponent(dcFactory, 0);
        if (this.igxForOf && this.igxForOf.length) {
            this.dc.instance.notVirtual = !(this.igxForContainerSize && this.state.chunkSize < this.igxForOf.length);
            if (this.igxForScrollOrientation === "horizontal") {
                totalWidth = this.initHCache(this.igxForOf);
                this.hScroll = this.getElement(vc, "igx-horizontal-virtual-helper");
                if (this.hScroll) {
                    this.state.startIndex = this.getHorizontalIndexAt(this.hScroll.scrollLeft, this.hCache, 0);
                }
            }
            this.state.chunkSize = this._calculateChunkSize();
            for (var i = 0; i < this.state.chunkSize && this.igxForOf[i] !== undefined; i++) {
                var input = this.igxForOf[i];
                var embeddedView = this.dc.instance._vcr.createEmbeddedView(this._template, { $implicit: input, index: this.igxForOf.indexOf(input) });
                this._embeddedViews.push(embeddedView);
            }
        }
        if (this.igxForScrollOrientation === "vertical") {
            this.dc.instance._viewContainer.element.nativeElement.style.top = "0px";
            var factory = this.resolver.resolveComponentFactory(VirtualHelperComponent);
            this.vh = this._viewContainer.createComponent(factory, 1);
            this._maxHeight = this._calcMaxBrowserHeight();
            this.vh.instance.height = this.igxForOf ? this._calcHeight() : 0;
            this._zone.runOutsideAngular(function () {
                _this.vh.instance.elementRef.nativeElement.addEventListener("scroll", function (evt) { _this.onScroll(evt); });
                _this.dc.instance._viewContainer.element.nativeElement.addEventListener("wheel", function (evt) { _this.onWheel(evt); });
                _this.dc.instance._viewContainer.element.nativeElement.addEventListener("touchstart", function (evt) { _this.onTouchStart(evt); });
                _this.dc.instance._viewContainer.element.nativeElement.addEventListener("touchmove", function (evt) { _this.onTouchMove(evt); });
                _this.dc.instance._viewContainer.element.nativeElement.addEventListener("pointerdown", function (evt) { _this.onPointerDown(evt); });
                _this.dc.instance._viewContainer.element.nativeElement.addEventListener("pointerup", function (evt) { _this.onPointerUp(evt); });
                _this.dc.instance._viewContainer.element.nativeElement.addEventListener("MSGestureStart", function (evt) { _this.onMSGestureStart(evt); });
                _this.dc.instance._viewContainer.element.nativeElement.addEventListener("MSGestureChange", function (evt) { _this.onMSGestureChange(evt); });
            });
        }
        if (this.igxForScrollOrientation === "horizontal") {
            this.func = function (evt) { _this.onHScroll(evt); };
            this.hScroll = this.getElement(vc, "igx-horizontal-virtual-helper");
            if (!this.hScroll) {
                var hvFactory = this.resolver.resolveComponentFactory(HVirtualHelperComponent);
                this.hvh = vc.createComponent(hvFactory);
                this.hvh.instance.width = totalWidth;
                this.hScroll = this.hvh.instance.elementRef.nativeElement;
                this._zone.runOutsideAngular(function () {
                    _this.hvh.instance.elementRef.nativeElement.addEventListener("scroll", _this.func);
                });
            }
            else {
                this._zone.runOutsideAngular(function () {
                    _this.hScroll.addEventListener("scroll", _this.func);
                    _this.dc.instance._viewContainer.element.nativeElement.addEventListener("wheel", function (evt) { _this.onWheel(evt); });
                    _this.dc.instance._viewContainer.element.nativeElement.addEventListener("touchstart", function (evt) { _this.onTouchStart(evt); });
                    _this.dc.instance._viewContainer.element.nativeElement.addEventListener("touchmove", function (evt) { _this.onTouchMove(evt); });
                    _this.dc.instance._viewContainer.element.nativeElement.addEventListener("pointerdown", function (evt) { _this.onPointerDown(evt); });
                    _this.dc.instance._viewContainer.element.nativeElement.addEventListener("pointerup", function (evt) { _this.onPointerUp(evt); });
                    _this.dc.instance._viewContainer.element.nativeElement.addEventListener("MSGestureStart", function (evt) { _this.onMSGestureStart(evt); });
                    _this.dc.instance._viewContainer.element.nativeElement.addEventListener("MSGestureChange", function (evt) { _this.onMSGestureChange(evt); });
                });
            }
            var scrollOffset = this.hScroll.scrollLeft - (this.hCache && this.hCache.length ? this.hCache[this.state.startIndex] : 0);
            this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + "px";
            this.dc.instance._viewContainer.element.nativeElement.style.height = "100%";
        }
    };
    IgxForOfDirective.prototype.ngOnDestroy = function () {
        if (this.hScroll) {
            this.hScroll.removeEventListener("scroll", this.func);
        }
    };
    IgxForOfDirective.prototype.ngOnChanges = function (changes) {
        var forOf = "igxForOf";
        if (forOf in changes) {
            var value = changes[forOf].currentValue;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this.igxForTrackBy);
                }
                catch (e) {
                    throw new Error("Cannot find a differ supporting object \"" + value + "\" of type \"" + getTypeNameForDebugging(value) + "\".\n                     NgFor only supports binding to Iterables such as Arrays.");
                }
            }
        }
        var containerSize = "igxForContainerSize";
        if (containerSize in changes && !changes[containerSize].firstChange) {
            this._recalcOnContainerChange(changes);
        }
    };
    IgxForOfDirective.prototype.ngDoCheck = function () {
        if (this._differ) {
            var changes = this._differ.diff(this.igxForOf);
            if (changes) {
                if (this.igxForScrollOrientation === "horizontal") {
                    this.initHCache(this.igxForOf);
                }
                this._applyChanges(changes);
            }
        }
    };
    IgxForOfDirective.prototype.addScrollTop = function (addTop) {
        if (addTop === 0 && this.igxForScrollOrientation === "horizontal") {
            return;
        }
        var containerSize = parseInt(this.igxForContainerSize, 10);
        var maxVirtScrollTop = this._virtHeight - containerSize;
        this._bScrollInternal = true;
        this._virtScrollTop += addTop;
        this._virtScrollTop = this._virtScrollTop > 0 ?
            (this._virtScrollTop < maxVirtScrollTop ? this._virtScrollTop : maxVirtScrollTop) :
            0;
        this.vh.instance.elementRef.nativeElement.scrollTop += addTop / this._virtHeightRatio;
        if (Math.abs(addTop / this._virtHeightRatio) < 1) {
            var scrollOffset = this.fixedUpdateAllRows(this._virtScrollTop, this._virtHeight);
            scrollOffset = scrollOffset !== parseInt(this.igxForItemSize, 10) ? scrollOffset : 0;
            this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + "px";
        }
        var curScrollTop = this.vh.instance.elementRef.nativeElement.scrollTop;
        var maxRealScrollTop = this.vh.instance.elementRef.nativeElement.scrollHeight - containerSize;
        if ((this._virtScrollTop > 0 && curScrollTop === 0) ||
            (this._virtScrollTop < maxVirtScrollTop && curScrollTop === maxRealScrollTop)) {
            this.vh.instance.elementRef.nativeElement.scrollTop = this._virtScrollTop / this._virtHeightRatio;
        }
        else if (this._virtScrollTop === 0 && curScrollTop > 0) {
            this.vh.instance.elementRef.nativeElement.scrollTop = 0;
        }
        else if (this._virtScrollTop === maxVirtScrollTop && curScrollTop < maxRealScrollTop) {
            this.vh.instance.elementRef.nativeElement.scrollTop = maxRealScrollTop;
        }
    };
    IgxForOfDirective.prototype.scrollTo = function (index) {
        if (index < 0 || index > (this.isRemote ? this.totalItemCount : this.igxForOf.length)) {
            return;
        }
        if (this.igxForScrollOrientation === "horizontal") {
            this.hScroll.scrollLeft = this.hCache[index] + 1;
        }
        else {
            this._bScrollInternal = true;
            this._virtScrollTop = index * parseInt(this.igxForItemSize, 10);
            this.vh.instance.elementRef.nativeElement.scrollTop = this._virtScrollTop * this._virtHeightRatio;
        }
    };
    IgxForOfDirective.prototype.scrollNext = function () {
        this.scrollTo(this.state.startIndex + 1);
    };
    IgxForOfDirective.prototype.scrollPrev = function () {
        this.scrollTo(this.state.startIndex - 1);
    };
    IgxForOfDirective.prototype.getColumnScrollLeft = function (colIndex) {
        return this.hCache[colIndex];
    };
    IgxForOfDirective.prototype.getVerticalScroll = function () {
        if (this.vh) {
            return this.vh.instance.elementRef.nativeElement;
        }
        return null;
    };
    IgxForOfDirective.prototype.getHorizontalScroll = function () {
        return this.getElement(this._viewContainer, "igx-horizontal-virtual-helper");
    };
    IgxForOfDirective.prototype.onScroll = function (event) {
        if (!parseInt(this.vh.instance.elementRef.nativeElement.style.height, 10)) {
            return;
        }
        var containerSize = parseInt(this.igxForContainerSize, 10);
        var maxRealScrollTop = event.target.children[0].scrollHeight - containerSize;
        var realPercentScrolled = event.target.scrollTop / maxRealScrollTop;
        if (!this._bScrollInternal) {
            var maxVirtScrollTop = this._virtHeight - containerSize;
            this._virtScrollTop = realPercentScrolled * maxVirtScrollTop;
        }
        else {
            this._bScrollInternal = false;
        }
        var scrollOffset = this.fixedUpdateAllRows(this._virtScrollTop, this._virtHeight);
        if (scrollOffset === undefined) {
            return;
        }
        scrollOffset = scrollOffset !== parseInt(this.igxForItemSize, 10) ? scrollOffset : 0;
        this.dc.instance._viewContainer.element.nativeElement.style.top = -(scrollOffset) + "px";
        this.dc.changeDetectorRef.detectChanges();
        this.onChunkLoad.emit(this.state);
    };
    IgxForOfDirective.prototype.fixedUpdateAllRows = function (inScrollTop, scrollHeight) {
        var ratio = scrollHeight !== 0 ? inScrollTop / scrollHeight : 0;
        var embeddedViewCopy = Object.assign([], this._embeddedViews);
        var count = this.isRemote ? this.totalItemCount : this.igxForOf.length;
        var currIndex = Math.floor(ratio * count);
        var endingIndex = this.state.chunkSize + currIndex;
        var bUpdatedStart = this.state.startIndex !== currIndex;
        this.state.startIndex = currIndex;
        if (endingIndex > this.igxForOf.length) {
            endingIndex = this.igxForOf.length;
            this._isScrolledToBottom = true;
            this.applyChunkSizeChange();
        }
        else if (this._isScrolledToBottom && bUpdatedStart) {
            if (endingIndex < this.igxForOf.length) {
                this._isScrolledToBottom = false;
            }
            this.applyChunkSizeChange();
        }
        if (bUpdatedStart) {
            this.onChunkPreload.emit(this.state);
        }
        if (this.isRemote) {
            return;
        }
        for (var i = this.state.startIndex; i < endingIndex && this.igxForOf[i] !== undefined; i++) {
            var input = this.igxForOf[i];
            var embView = embeddedViewCopy.shift();
            var cntx = embView.context;
            cntx.$implicit = input;
            cntx.index = this.igxForOf.indexOf(input);
        }
        return inScrollTop - this.state.startIndex * (scrollHeight / count);
    };
    IgxForOfDirective.prototype.onHScroll = function (event) {
        if (!parseInt(this.hScroll.children[0].style.width, 10)) {
            return;
        }
        var curScrollLeft = event.target.scrollLeft;
        var scrollOffset = this.fixedUpdateAllCols(curScrollLeft);
        this.dc.instance._viewContainer.element.nativeElement.style.left = -scrollOffset + "px";
        this.dc.changeDetectorRef.detectChanges();
        this.onChunkLoad.emit();
    };
    IgxForOfDirective.prototype.fixedUpdateAllCols = function (inScrollLeft) {
        this.state.startIndex = this.getHorizontalIndexAt(inScrollLeft, this.hCache, 0);
        this.onChunkPreload.emit(this.state);
        this.applyChunkSizeChange();
        var embeddedViewCopy = Object.assign([], this._embeddedViews);
        var endingIndex = this.state.chunkSize + this.state.startIndex;
        for (var i = this.state.startIndex; i < endingIndex && this.igxForOf[i] !== undefined; i++) {
            var input = this.igxForOf[i];
            var embView = embeddedViewCopy.shift();
            var cntx = embView.context;
            cntx.$implicit = input;
            cntx.index = this.igxForOf.indexOf(input);
        }
        return inScrollLeft - this.hCache[this.state.startIndex];
    };
    IgxForOfDirective.prototype.onWheel = function (event) {
        if (this.igxForScrollOrientation === "horizontal") {
            var scrollStepX = 10;
            this.hScroll.scrollLeft += Math.sign(event.deltaX) * scrollStepX;
        }
        else if (this.igxForScrollOrientation === "vertical") {
            var scrollStepY = /Edge/.test(navigator.userAgent) ? 25 : 100;
            this.vh.instance.elementRef.nativeElement.scrollTop += Math.sign(event.deltaY) * scrollStepY / this._virtHeightRatio;
            var curScrollTop = this.vh.instance.elementRef.nativeElement.scrollTop;
            var maxScrollTop = this.vh.instance.height - this.vh.instance.elementRef.nativeElement.offsetHeight;
            if (0 < curScrollTop && curScrollTop < maxScrollTop) {
                event.preventDefault();
            }
        }
    };
    IgxForOfDirective.prototype.onTouchStart = function (event) {
        if (typeof MSGesture === "function") {
            return false;
        }
        if (this.igxForScrollOrientation === "horizontal") {
            this._lastTouchX = event.changedTouches[0].screenX;
        }
        else if (this.igxForScrollOrientation === "vertical") {
            this._lastTouchY = event.changedTouches[0].screenY;
        }
    };
    IgxForOfDirective.prototype.onTouchMove = function (event) {
        if (typeof MSGesture === "function") {
            return false;
        }
        if (this.igxForScrollOrientation === "horizontal") {
            var movedX = this._lastTouchX - event.changedTouches[0].screenX;
            this.hScroll.scrollLeft += movedX;
            this._lastTouchX = event.changedTouches[0].screenX;
        }
        else if (this.igxForScrollOrientation === "vertical") {
            var maxScrollTop = this.vh.instance.elementRef.nativeElement.children[0].offsetHeight -
                this.dc.instance._viewContainer.element.nativeElement.offsetHeight;
            var movedY = this._lastTouchY - event.changedTouches[0].screenY;
            this.vh.instance.elementRef.nativeElement.scrollTop += movedY;
            if (this.vh.instance.elementRef.nativeElement.scrollTop !== 0 &&
                this.vh.instance.elementRef.nativeElement.scrollTop !== maxScrollTop) {
                event.preventDefault();
            }
            this._lastTouchY = event.changedTouches[0].screenY;
        }
    };
    IgxForOfDirective.prototype.onPointerDown = function (event) {
        if (!event || (event.pointerType !== 2 && event.pointerType !== "touch") ||
            typeof MSGesture !== "function") {
            return true;
        }
        if (!this._gestureObject) {
            this._gestureObject = new MSGesture();
            this._gestureObject.target = this.dc.instance._viewContainer.element.nativeElement;
        }
        event.target.setPointerCapture(this._pointerCapture = event.pointerId);
        this._gestureObject.addPointer(this._pointerCapture);
    };
    IgxForOfDirective.prototype.onPointerUp = function (event) {
        if (!this._pointerCapture) {
            return true;
        }
        event.target.releasePointerCapture(this._pointerCapture);
        delete this._pointerCapture;
    };
    IgxForOfDirective.prototype.onMSGestureStart = function (event) {
        if (this.igxForScrollOrientation === "horizontal") {
            this._lastTouchX = event.screenX;
        }
        else if (this.igxForScrollOrientation === "vertical") {
            this._lastTouchY = event.screenY;
        }
        return false;
    };
    IgxForOfDirective.prototype.onMSGestureChange = function (event) {
        if (this.igxForScrollOrientation === "horizontal") {
            var movedX = this._lastTouchX - event.screenX;
            this.hScroll.scrollLeft += movedX;
            this._lastTouchX = event.screenX;
        }
        else if (this.igxForScrollOrientation === "vertical") {
            var movedY = this._lastTouchY - event.screenY;
            this.vh.instance.elementRef.nativeElement.scrollTop += movedY;
            this._lastTouchY = event.screenY;
        }
        return false;
    };
    Object.defineProperty(IgxForOfDirective.prototype, "igxForTrackBy", {
        get: function () { return this._trackByFn; },
        set: function (fn) { this._trackByFn = fn; },
        enumerable: true,
        configurable: true
    });
    IgxForOfDirective.prototype._applyChanges = function (changes) {
        this.applyChunkSizeChange();
        this._recalcScrollBarSize();
        if (this.igxForOf && this.igxForOf.length && this.dc) {
            var embeddedViewCopy = Object.assign([], this._embeddedViews);
            var startIndex = this.state.startIndex;
            var endIndex = this.state.chunkSize + this.state.startIndex;
            if (this.isRemote) {
                startIndex = 0;
                endIndex = this.igxForOf.length;
            }
            for (var i = startIndex; i < endIndex && this.igxForOf[i] !== undefined; i++) {
                var input = this.igxForOf[i];
                var embView = embeddedViewCopy.shift();
                var cntx = embView.context;
                cntx.$implicit = input;
                cntx.index = this.igxForOf.indexOf(input);
            }
            this.dc.changeDetectorRef.detectChanges();
            this.onChunkLoad.emit();
        }
    };
    IgxForOfDirective.prototype._calcMaxBrowserHeight = function () {
        var div = document.createElement("div");
        var style = div.style;
        style.position = "absolute";
        style.top = "9999999999999999px";
        document.body.appendChild(div);
        var size = Math.abs(div.getBoundingClientRect()["top"]);
        document.body.removeChild(div);
        return size;
    };
    IgxForOfDirective.prototype._calculateChunkSize = function () {
        var chunkSize = 0;
        if (this.igxForContainerSize !== null && this.igxForContainerSize !== undefined) {
            if (this.igxForScrollOrientation === "horizontal") {
                var vc = this.igxForScrollContainer ?
                    this.igxForScrollContainer._viewContainer :
                    this._viewContainer;
                var hScroll = this.getElement(vc, "igx-horizontal-virtual-helper");
                var left = hScroll && hScroll.scrollLeft !== 0 ?
                    hScroll.scrollLeft + parseInt(this.igxForContainerSize, 10) :
                    parseInt(this.igxForContainerSize, 10);
                if (!this.hCache) {
                    this.initHCache(this.igxForOf);
                }
                var endIndex = this.getHorizontalIndexAt(left, this.hCache, 0) + 1;
                chunkSize = endIndex - this.state.startIndex;
                chunkSize = chunkSize > this.igxForOf.length ? this.igxForOf.length : chunkSize;
            }
            else {
                chunkSize = Math.ceil(parseInt(this.igxForContainerSize, 10) /
                    parseInt(this.igxForItemSize, 10));
                if (chunkSize !== 0 && !this._isScrolledToBottom) {
                    chunkSize++;
                }
                if (chunkSize > this.igxForOf.length) {
                    chunkSize = this.igxForOf.length;
                }
            }
        }
        else {
            chunkSize = this.igxForOf.length;
        }
        return chunkSize;
    };
    IgxForOfDirective.prototype.getElement = function (viewref, nodeName) {
        var elem = viewref.element.nativeElement.parentNode.getElementsByTagName(nodeName);
        return elem.length > 0 ? elem[0] : null;
    };
    IgxForOfDirective.prototype.initHCache = function (cols) {
        var totalWidth = 0;
        var i = 0;
        this.hCache = [];
        this.hCache.push(0);
        for (i; i < cols.length; i++) {
            totalWidth += parseInt(cols[i].width, 10) || 0;
            this.hCache.push(totalWidth);
        }
        return totalWidth;
    };
    IgxForOfDirective.prototype.getHorizontalIndexAt = function (left, set, index) {
        var midIdx;
        var midLeft;
        if (set.length === 1) {
            return index;
        }
        midIdx = Math.floor(set.length / 2);
        midLeft = set[midIdx];
        return this.getHorizontalIndexAt(left, midLeft >= left ? set.slice(0, midIdx) : set.slice(midIdx), midLeft >= left ? index : index + midIdx);
    };
    IgxForOfDirective.prototype._recalcScrollBarSize = function () {
        var count = this.isRemote ? this.totalItemCount : this.igxForOf.length;
        this.dc.instance.notVirtual = !(this.igxForContainerSize && this.dc && this.state.chunkSize < count);
        if (this.igxForScrollOrientation === "horizontal") {
            var totalWidth = this.igxForContainerSize ? this.initHCache(this.igxForOf) : 0;
            this.hScroll.children[0].style.width = totalWidth + "px";
        }
        if (this.igxForScrollOrientation === "vertical") {
            this.vh.instance.elementRef.nativeElement.style.height = parseInt(this.igxForContainerSize, 10) + "px";
            this.vh.instance.height = this._calcHeight();
        }
    };
    IgxForOfDirective.prototype._calcHeight = function () {
        var count = this.totalItemCount || this.igxForOf.length;
        var height = count * parseInt(this.igxForItemSize, 10);
        this._virtHeight = height;
        if (height > this._maxHeight) {
            this._virtHeightRatio = height / this._maxHeight;
            height = this._maxHeight;
        }
        return height;
    };
    IgxForOfDirective.prototype._recalcOnContainerChange = function (changes) {
        this.dc.instance._viewContainer.element.nativeElement.style.top = "0px";
        this.dc.instance._viewContainer.element.nativeElement.style.left = "0px";
        if (this.hCache) {
            this.state.startIndex = 0;
            if (this.hScroll.scrollLeft !== 0) {
                this.scrollTo(0);
            }
            else {
                this.fixedUpdateAllCols(0);
            }
            this.cdr.detectChanges();
            return;
        }
        this.applyChunkSizeChange();
        this._recalcScrollBarSize();
    };
    IgxForOfDirective.prototype.removeLastElem = function () {
        var oldElem = this._embeddedViews.pop();
        oldElem.destroy();
        this.state.chunkSize--;
    };
    IgxForOfDirective.prototype.addLastElem = function () {
        var elemIndex = this.state.startIndex + this.state.chunkSize;
        if (elemIndex > this.igxForOf.length) {
            return;
        }
        if (elemIndex === this.igxForOf.length) {
            elemIndex = this.igxForOf.length - 1;
        }
        var input = this.igxForOf[elemIndex];
        var embeddedView = this.dc.instance._vcr.createEmbeddedView(this._template, { $implicit: input, index: elemIndex });
        this._embeddedViews.push(embeddedView);
        this.state.chunkSize++;
    };
    IgxForOfDirective.prototype.applyChunkSizeChange = function () {
        var chunkSize = this.isRemote ? this.igxForOf.length : this._calculateChunkSize();
        if (chunkSize > this.state.chunkSize) {
            var diff = chunkSize - this.state.chunkSize;
            for (var i = 0; i < diff; i++) {
                this.addLastElem();
            }
        }
        else if (chunkSize < this.state.chunkSize) {
            var diff = this.state.chunkSize - chunkSize;
            for (var i = 0; i < diff; i++) {
                this.removeLastElem();
            }
        }
    };
    IgxForOfDirective.decorators = [
        { type: Directive, args: [{ selector: "[igxFor][igxForOf]" },] },
    ];
    IgxForOfDirective.ctorParameters = function () { return [
        { type: ViewContainerRef, },
        { type: TemplateRef, },
        { type: IterableDiffers, },
        { type: ComponentFactoryResolver, },
        { type: ChangeDetectorRef, },
        { type: NgZone, },
    ]; };
    IgxForOfDirective.propDecorators = {
        "igxForOf": [{ type: Input },],
        "igxForScrollOrientation": [{ type: Input },],
        "igxForScrollContainer": [{ type: Input },],
        "igxForContainerSize": [{ type: Input },],
        "igxForItemSize": [{ type: Input },],
        "igxForRemote": [{ type: Input },],
        "onChunkLoad": [{ type: Output },],
        "onChunkPreload": [{ type: Output },],
        "displayContiner": [{ type: ViewChild, args: [DisplayContainerComponent,] },],
        "virtualHelper": [{ type: ViewChild, args: [VirtualHelperComponent,] },],
        "igxForTrackBy": [{ type: Input },],
    };
    __decorate([
        DeprecateProperty("igxForRemote is deprecated, setting this property is no longer needed for remote virtualization"),
        __metadata("design:type", Object)
    ], IgxForOfDirective.prototype, "igxForRemote", void 0);
    return IgxForOfDirective;
}());
export { IgxForOfDirective };
export function getTypeNameForDebugging(type) {
    var name = "name";
    return type[name] || typeof type;
}
var IgxForOfModule = (function () {
    function IgxForOfModule() {
    }
    IgxForOfModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxForOfDirective, DisplayContainerComponent, VirtualHelperComponent, HVirtualHelperComponent],
                    entryComponents: [DisplayContainerComponent, VirtualHelperComponent, HVirtualHelperComponent],
                    exports: [IgxForOfDirective],
                    imports: [CommonModule]
                },] },
    ];
    return IgxForOfModule;
}());
export { IgxForOfModule };
