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
var IgxSummaryOperand = (function () {
    function IgxSummaryOperand() {
    }
    IgxSummaryOperand.prototype.operate = function (data) {
        return [{
                key: "count",
                label: "Count",
                summaryResult: this.count(data)
            }];
    };
    IgxSummaryOperand.prototype.count = function (data) {
        return data.length;
    };
    return IgxSummaryOperand;
}());
export { IgxSummaryOperand };
var IgxNumberSummaryOperand = (function (_super) {
    __extends(IgxNumberSummaryOperand, _super);
    function IgxNumberSummaryOperand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IgxNumberSummaryOperand.prototype.operate = function (data) {
        var result = _super.prototype.operate.call(this, data);
        result.push({
            key: "min",
            label: "Min",
            summaryResult: this.min(data)
        });
        result.push({
            key: "max",
            label: "Max",
            summaryResult: this.max(data)
        });
        result.push({
            key: "sum",
            label: "Sum",
            summaryResult: this.sum(data)
        });
        result.push({
            key: "average",
            label: "Avg",
            summaryResult: this.average(data)
        });
        return result;
    };
    IgxNumberSummaryOperand.prototype.min = function (data) {
        if (data.length > 0) {
            return data.reduce(function (a, b) { return Math.min(a, b); });
        }
        else {
            return;
        }
    };
    IgxNumberSummaryOperand.prototype.max = function (data) {
        if (data.length > 0) {
            return data.reduce(function (a, b) { return Math.max(a, b); });
        }
        else {
            return;
        }
    };
    IgxNumberSummaryOperand.prototype.sum = function (data) {
        if (data.length > 0) {
            return data.reduce(function (a, b) { return +a + +b; });
        }
        else {
            return;
        }
    };
    IgxNumberSummaryOperand.prototype.average = function (data) {
        if (data.length > 0) {
            return this.sum(data) / this.count(data);
        }
        else {
            return;
        }
    };
    return IgxNumberSummaryOperand;
}(IgxSummaryOperand));
export { IgxNumberSummaryOperand };
var IgxDateSummaryOperand = (function (_super) {
    __extends(IgxDateSummaryOperand, _super);
    function IgxDateSummaryOperand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IgxDateSummaryOperand.prototype.operate = function (data) {
        var result = _super.prototype.operate.call(this, data);
        result.push({
            key: "earliest",
            label: "Earliest",
            summaryResult: this.earliest(data)
        });
        result.push({
            key: "latest",
            label: "Latest",
            summaryResult: this.latest(data)
        });
        return result;
    };
    IgxDateSummaryOperand.prototype.latest = function (data) {
        if (data.length > 0) {
            return data.sort(function (a, b) { return new Date(b).valueOf() - new Date(a).valueOf(); })[0];
        }
        else {
            return;
        }
    };
    IgxDateSummaryOperand.prototype.earliest = function (data) {
        if (data.length > 0) {
            return data.sort(function (a, b) { return new Date(b).valueOf() - new Date(a).valueOf(); })[data.length - 1];
        }
        else {
            return;
        }
    };
    return IgxDateSummaryOperand;
}(IgxSummaryOperand));
export { IgxDateSummaryOperand };
