import { FilteringLogic } from "./filtering-expression.interface";
import { FilteringStrategy } from "./filtering-strategy";
export var filteringStateDefaults = {
    logic: FilteringLogic.And,
    strategy: new FilteringStrategy()
};
