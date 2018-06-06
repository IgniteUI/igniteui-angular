import { FilteringLogic, IFilteringExpression } from '../../public_api';

// bvk - do I need this interface
export declare interface IFilteringExpressionsTree {
    filteringOperands: (IFilteringExpressionsTree | IFilteringExpression)[];
    operator: FilteringLogic;
}

export class FilteringExpressionsTree implements IFilteringExpressionsTree {
    filteringOperands: (IFilteringExpressionsTree | IFilteringExpression)[] = [];
    operator: FilteringLogic;

    constructor(operator: FilteringLogic) {
        this.operator = operator;
    }
}