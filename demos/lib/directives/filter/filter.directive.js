import { CommonModule } from "@angular/common";
import { Directive, ElementRef, EventEmitter, Input, NgModule, Output, Pipe, Renderer2 } from "@angular/core";
var IgxFilterDirective = (function () {
    function IgxFilterDirective(element, renderer) {
        this.element = element;
        this.filtering = new EventEmitter(false);
        this.filtered = new EventEmitter();
    }
    IgxFilterDirective.prototype.ngOnChanges = function (changes) {
        if (changes.filterOptions &&
            changes.filterOptions.currentValue &&
            changes.filterOptions.currentValue.inputValue !== undefined &&
            changes.filterOptions.previousValue &&
            changes.filterOptions.currentValue.inputValue !== changes.filterOptions.previousValue.inputValue) {
            this.filter();
        }
    };
    IgxFilterDirective.prototype.filter = function () {
        if (!this.filterOptions.items) {
            return;
        }
        var args = { cancel: false, items: this.filterOptions.items };
        this.filtering.emit(args);
        if (args.cancel) {
            return;
        }
        var pipe = new IgxFilterPipe();
        var filtered = pipe.transform(this.filterOptions.items, this.filterOptions);
        this.filtered.emit({ filteredItems: filtered });
    };
    IgxFilterDirective.decorators = [
        { type: Directive, args: [{
                    selector: "[igxFilter]"
                },] },
    ];
    IgxFilterDirective.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: Renderer2, },
    ]; };
    IgxFilterDirective.propDecorators = {
        "filtering": [{ type: Output },],
        "filtered": [{ type: Output },],
        "filterOptions": [{ type: Input, args: ["igxFilter",] },],
    };
    return IgxFilterDirective;
}());
export { IgxFilterDirective };
var IgxFilterPipe = (function () {
    function IgxFilterPipe() {
    }
    IgxFilterPipe.prototype.transform = function (items, options) {
        var result = [];
        if (!items || !items.length || !options) {
            return;
        }
        if (options.items) {
            items = options.items;
        }
        result = items.filter(function (item) {
            var match = options.matchFn(options.formatter(options.get_value(item, options.key)), options.inputValue);
            if (match) {
                if (options.metConditionFn) {
                    options.metConditionFn(item);
                }
            }
            else {
                if (options.overdueConditionFn) {
                    options.overdueConditionFn(item);
                }
            }
            return match;
        });
        return result;
    };
    IgxFilterPipe.decorators = [
        { type: Pipe, args: [{
                    name: "igxFilter",
                    pure: false
                },] },
    ];
    return IgxFilterPipe;
}());
export { IgxFilterPipe };
var IgxFilterOptions = (function () {
    function IgxFilterOptions() {
        this.inputValue = "";
    }
    IgxFilterOptions.prototype.get_value = function (item, key) {
        var result = "";
        if (key) {
            result = item[key].toString();
        }
        else if (item.element) {
            if (item.element.nativeElement) {
                result = item.element.nativeElement.textContent.trim();
            }
            else if (item.element.textContent) {
                result = item.element.textContent.trim();
            }
        }
        return result;
    };
    IgxFilterOptions.prototype.formatter = function (valueToTest) {
        return valueToTest.toLowerCase();
    };
    IgxFilterOptions.prototype.matchFn = function (valueToTest, inputValue) {
        return valueToTest.indexOf(inputValue && inputValue.toLowerCase() || "") > -1;
    };
    IgxFilterOptions.prototype.metConditionFn = function (item) {
        if (item.hasOwnProperty("hidden")) {
            item.hidden = false;
        }
    };
    IgxFilterOptions.prototype.overdueConditionFn = function (item) {
        if (item.hasOwnProperty("hidden")) {
            item.hidden = true;
        }
    };
    return IgxFilterOptions;
}());
export { IgxFilterOptions };
var IgxFilterModule = (function () {
    function IgxFilterModule() {
    }
    IgxFilterModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [IgxFilterDirective, IgxFilterPipe],
                    exports: [IgxFilterDirective, IgxFilterPipe],
                    imports: [CommonModule]
                },] },
    ];
    return IgxFilterModule;
}());
export { IgxFilterModule };
