import { SortingStrategy } from "./sorting-strategy";

export class StableSortingStrategy extends SortingStrategy {
    compareObjects(obj1: any, obj2: any): number {
        var res = super.compareObjects.apply(this, arguments), 
            replacerFn = function (key, val) { 
                            if (val === undefined)
                                return null;
                            return val;
                        };
        if (!res) {
            return JSON.stringify(obj1, replacerFn)
                        .localeCompare(JSON.stringify(obj2, replacerFn));
        }
        return res;
    }
}