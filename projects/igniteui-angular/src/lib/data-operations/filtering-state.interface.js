"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var filtering_expression_interface_1 = require("./filtering-expression.interface");
var filtering_strategy_1 = require("./filtering-strategy");
exports.filteringStateDefaults = {
    logic: filtering_expression_interface_1.FilteringLogic.And,
    strategy: new filtering_strategy_1.FilteringStrategy()
};

//# sourceMappingURL=filtering-state.interface.js.map
