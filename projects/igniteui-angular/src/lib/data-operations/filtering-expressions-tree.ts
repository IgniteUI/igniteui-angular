import { FilteringLogic, IFilteringExpression } from '../../public_api';

// bvk - do I need this interface
export declare interface IFilteringExpressionsTree {
    firstOperand: IFilteringExpressionsTree | IFilteringExpression;
    secondOperand?: IFilteringExpressionsTree | IFilteringExpression;
    operator?: FilteringLogic;
}

export class FilteringExpressionsTree implements IFilteringExpressionsTree {
    firstOperand: IFilteringExpressionsTree | IFilteringExpression;
    secondOperand?: IFilteringExpressionsTree | IFilteringExpression;
    operator?: FilteringLogic;
}