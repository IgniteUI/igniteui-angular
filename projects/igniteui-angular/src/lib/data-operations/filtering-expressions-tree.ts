import { FilteringLogic, IFilteringExpression } from '../../public_api';

export declare interface IFilteringExpressionsTree {
    filteringOperands: (IFilteringExpressionsTree | IFilteringExpression)[];
    operator: FilteringLogic;
    fieldName?: string;

    find(fieldName: string): IFilteringExpressionsTree | IFilteringExpression;
    findIndex(fieldName: string): number;
}

export class FilteringExpressionsTree implements IFilteringExpressionsTree {
    filteringOperands: (IFilteringExpressionsTree | IFilteringExpression)[] = [];
    operator: FilteringLogic;
    fieldName?: string;

    constructor(operator: FilteringLogic, fieldName?: string) {
        this.operator = operator;
        this.fieldName = fieldName;
    }

    public find(fieldName: string): IFilteringExpressionsTree | IFilteringExpression {
        const index = this.findIndex(fieldName);

        if (index > -1) {
            return this.filteringOperands[index];
        }

        return null;
    }

    public findIndex(fieldName: string): number {
        let expr;
        for (let i = 0; i < this.filteringOperands.length; i++) {
            expr = this.filteringOperands[i];
            if (expr instanceof FilteringExpressionsTree) {
                if (this.isFilteringExpressionsTreeForColumn(expr, fieldName)) {
                    return i;
                }
            } else {
                if ((expr as IFilteringExpression).fieldName === fieldName) {
                    return i;
                }
            }
        }

        return -1;
    }

    protected isFilteringExpressionsTreeForColumn(expressionsTree: IFilteringExpressionsTree, fieldName: string): boolean {
        if (expressionsTree.fieldName === fieldName) {
            return true;
        }

        let expr;
        for (let i = 0; i < expressionsTree.filteringOperands.length; i++) {
            expr = expressionsTree.filteringOperands[i];
            if ((expr instanceof FilteringExpressionsTree)) {
                return this.isFilteringExpressionsTreeForColumn(expr, fieldName);
            } else {
                return (expr as IFilteringExpression).fieldName === fieldName;
            }
        }

        return false;
    }
}
