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
import { SortingStrategy } from "./sorting-strategy";
var StableSortingStrategy = (function (_super) {
    __extends(StableSortingStrategy, _super);
    function StableSortingStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StableSortingStrategy.prototype.compareObjects = function (obj1, obj2) {
        var res = _super.prototype.compareObjects.apply(this, arguments);
        var replacerFn = function (key, val) {
            if (val === undefined) {
                return null;
            }
            return val;
        };
        if (!res) {
            return JSON.stringify(obj1, replacerFn)
                .localeCompare(JSON.stringify(obj2, replacerFn));
        }
        return res;
    };
    return StableSortingStrategy;
}(SortingStrategy));
export { StableSortingStrategy };
