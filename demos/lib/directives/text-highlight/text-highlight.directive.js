import { Directive, ElementRef, EventEmitter, Input, NgModule, Renderer2 } from "@angular/core";
var IgxTextHighlightDirective = (function () {
    function IgxTextHighlightDirective(element, renderer) {
        var _this = this;
        this.renderer = renderer;
        this._addedElements = [];
        this._nodeWasRemoved = false;
        this._forceEvaluation = false;
        this._activeElementIndex = -1;
        this.groupName = "";
        this.value = "";
        this.parentElement = this.renderer.parentNode(element.nativeElement);
        var callback = function (mutationList) {
            mutationList.forEach(function (mutation) {
                mutation.removedNodes.forEach(function (n) {
                    if (n === _this.container) {
                        _this._nodeWasRemoved = true;
                        _this.clearChildElements(false);
                    }
                });
                mutation.addedNodes.forEach(function (n) {
                    if (n === _this.parentElement.firstElementChild && _this._nodeWasRemoved) {
                        _this.container = _this.parentElement.firstElementChild;
                        _this._nodeWasRemoved = false;
                        _this._forceEvaluation = true;
                        _this.highlight(_this._lastSearchInfo.searchedText, _this._lastSearchInfo.caseSensitive);
                        _this._forceEvaluation = false;
                        _this.activateIfNecessary();
                    }
                });
            });
        };
        this._observer = new MutationObserver(callback);
        this._observer.observe(this.parentElement, { childList: true });
        IgxTextHighlightDirective.onActiveElementChanged.subscribe(function (groupName) {
            if (_this.groupName === groupName) {
                if (_this._activeElementIndex !== -1) {
                    _this.deactivate();
                }
                _this.activateIfNecessary();
            }
        });
    }
    IgxTextHighlightDirective.setActiveHighlight = function (groupName, column, row, index, page) {
        var group = IgxTextHighlightDirective.highlightGroupsMap.get(groupName);
        group.columnIndex = column;
        group.rowIndex = row;
        group.index = index;
        group.page = page;
        IgxTextHighlightDirective.onActiveElementChanged.emit(groupName);
    };
    IgxTextHighlightDirective.prototype.ngOnDestroy = function () {
        this._observer.disconnect();
    };
    IgxTextHighlightDirective.prototype.ngOnChanges = function (changes) {
        if (changes.value && !changes.value.firstChange) {
            this.highlight(this._lastSearchInfo.searchedText, this._lastSearchInfo.caseSensitive);
            this.activateIfNecessary();
        }
        if ((changes.row !== undefined && !changes.row.firstChange) ||
            (changes.column !== undefined && !changes.column.firstChange) ||
            (changes.page !== undefined && !changes.page.firstChange)) {
            if (this._activeElementIndex !== -1) {
                this.deactivate();
            }
            this.activateIfNecessary();
        }
    };
    IgxTextHighlightDirective.prototype.ngAfterViewInit = function () {
        if (IgxTextHighlightDirective.highlightGroupsMap.has(this.groupName) === false) {
            IgxTextHighlightDirective.highlightGroupsMap.set(this.groupName, {
                rowIndex: -1,
                columnIndex: -1,
                page: -1,
                index: -1
            });
        }
        this._lastSearchInfo = {
            searchedText: "",
            content: this.value,
            matchCount: 0,
            caseSensitive: false
        };
        this.container = this.parentElement.firstElementChild;
    };
    IgxTextHighlightDirective.prototype.highlight = function (text, caseSensitive) {
        var caseSensitiveResolved = caseSensitive ? true : false;
        if (this.searchNeedsEvaluation(text, caseSensitiveResolved)) {
            this._lastSearchInfo.searchedText = text;
            this._lastSearchInfo.caseSensitive = caseSensitiveResolved;
            this._lastSearchInfo.content = this.value;
            if (text === "" || text === undefined || text === null) {
                this.clearHighlight();
            }
            else {
                this.clearChildElements(true);
                this._lastSearchInfo.matchCount = this.getHighlightedText(text, caseSensitive);
            }
        }
        return this._lastSearchInfo.matchCount;
    };
    IgxTextHighlightDirective.prototype.clearHighlight = function () {
        this.clearChildElements(false);
        this._lastSearchInfo.searchedText = "";
        this._lastSearchInfo.matchCount = 0;
    };
    IgxTextHighlightDirective.prototype.activateIfNecessary = function () {
        var group = IgxTextHighlightDirective.highlightGroupsMap.get(this.groupName);
        if (group.columnIndex === this.column && group.rowIndex === this.row && group.page === this.page) {
            this.activate(group.index);
        }
    };
    IgxTextHighlightDirective.prototype.activate = function (index) {
        this.deactivate();
        var spans = this._addedElements.filter(function (el) { return el.nodeName === "SPAN"; });
        this._activeElementIndex = index;
        if (spans.length <= index) {
            return;
        }
        var elementToActivate = spans[index];
        this.renderer.addClass(elementToActivate, this.activeCssClass);
        this.renderer.setAttribute(elementToActivate, "style", "background:orange;font-weight:bold");
    };
    IgxTextHighlightDirective.prototype.deactivate = function () {
        if (this._activeElementIndex === -1) {
            return;
        }
        var spans = this._addedElements.filter(function (el) { return el.nodeName === "SPAN"; });
        if (spans.length <= this._activeElementIndex) {
            this._activeElementIndex = -1;
            return;
        }
        var elementToDeactivate = spans[this._activeElementIndex];
        this.renderer.removeClass(elementToDeactivate, this.activeCssClass);
        this.renderer.setAttribute(elementToDeactivate, "style", "background:yellow;font-weight:bold");
        this._activeElementIndex = -1;
    };
    IgxTextHighlightDirective.prototype.clearChildElements = function (originalContentHidden) {
        if (this.parentElement.firstElementChild) {
            this.renderer.setProperty(this.parentElement.firstElementChild, "hidden", originalContentHidden);
        }
        while (this._addedElements.length) {
            var el = this._addedElements.pop();
            this.renderer.removeChild(this.parentElement, el);
        }
        this._activeElementIndex = -1;
    };
    IgxTextHighlightDirective.prototype.getHighlightedText = function (searchText, caseSensitive) {
        var stringValue = String(this.value);
        var contentStringResolved = !caseSensitive ? stringValue.toLowerCase() : stringValue;
        var searchTextResolved = !caseSensitive ? searchText.toLowerCase() : searchText;
        var foundIndex = contentStringResolved.indexOf(searchTextResolved, 0);
        var previousMatchEnd = 0;
        var matchCount = 0;
        while (foundIndex !== -1) {
            var start = foundIndex;
            var end = foundIndex + searchTextResolved.length;
            this.appendText(stringValue.substring(previousMatchEnd, start));
            this.appendSpan("<span class=\"" + this.cssClass + "\" style=\"background:yellow;font-weight:bold\">" + stringValue.substring(start, end) + "</span>");
            previousMatchEnd = end;
            matchCount++;
            foundIndex = contentStringResolved.indexOf(searchTextResolved, end);
        }
        this.appendText(stringValue.substring(previousMatchEnd, stringValue.length));
        return matchCount;
    };
    IgxTextHighlightDirective.prototype.appendText = function (text) {
        var textElement = this.renderer.createText(text);
        this.renderer.appendChild(this.parentElement, textElement);
        this._addedElements.push(textElement);
    };
    IgxTextHighlightDirective.prototype.appendSpan = function (outerHTML) {
        var span = this.renderer.createElement("span");
        this.renderer.appendChild(this.parentElement, span);
        this.renderer.setProperty(span, "outerHTML", outerHTML);
        var childNodes = this.parentElement.childNodes;
        this._addedElements.push(childNodes[childNodes.length - 1]);
    };
    IgxTextHighlightDirective.prototype.searchNeedsEvaluation = function (text, caseSensitive) {
        var searchedText = this._lastSearchInfo.searchedText;
        return !this._nodeWasRemoved &&
            (searchedText === null ||
                searchedText !== text ||
                this._lastSearchInfo.content !== this.value ||
                this._lastSearchInfo.caseSensitive !== caseSensitive ||
                this._forceEvaluation);
    };
    IgxTextHighlightDirective.onActiveElementChanged = new EventEmitter();
    IgxTextHighlightDirective.highlightGroupsMap = new Map();
    IgxTextHighlightDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxTextHighlight]"
                },] },
    ];
    IgxTextHighlightDirective.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: Renderer2, },
    ]; };
    IgxTextHighlightDirective.propDecorators = {
        "cssClass": [{ type: Input, args: ["cssClass",] },],
        "activeCssClass": [{ type: Input, args: ["activeCssClass",] },],
        "groupName": [{ type: Input, args: ["groupName",] },],
        "value": [{ type: Input, args: ["value",] },],
        "row": [{ type: Input, args: ["row",] },],
        "column": [{ type: Input, args: ["column",] },],
        "page": [{ type: Input, args: ["page",] },],
    };
    return IgxTextHighlightDirective;
}());
export { IgxTextHighlightDirective };
var IgxTextHighlightModule = (function () {
    function IgxTextHighlightModule() {
    }
    IgxTextHighlightModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxTextHighlightDirective],
                    exports: [IgxTextHighlightDirective]
                },] },
    ];
    return IgxTextHighlightModule;
}());
export { IgxTextHighlightModule };
