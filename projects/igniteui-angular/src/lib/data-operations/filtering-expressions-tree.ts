import { IFilteringExpression, FilteringLogic } from './filtering-expression.interface';
import { IBaseEventArgs } from '../core/utils';

export declare interface IFilteringExpressionsTree extends IBaseEventArgs {
    filteringOperands: (IFilteringExpressionsTree | IFilteringExpression)[];
    operator: FilteringLogic;
    fieldName?: string;

    find(fieldName: string): IFilteringExpressionsTree | IFilteringExpression;
    findIndex(fieldName: string): number;
}

export class FilteringExpressionsTree implements IFilteringExpressionsTree {

    /**
     * Sets/gets the filtering operands.
     * ```typescript
     * const gridExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
     * const expression = [
     * {
     *   condition: IgxStringFilteringOperand.instance().condition('contains'),
     *   fieldName: 'Column Field',
     *   searchVal: 'Value',
     *   ignoreCase: false
     * }];
     * gridExpressionsTree.filteringOperands.push(expression);
     * this.grid.filteringExpressionsTree = gridExpressionsTree;
     * ```
     * ```typescript
     * let filteringOperands = gridExpressionsTree.filteringOperands;
     * ```
     * @memberof FilteringExpressionsTree
     */
    filteringOperands: (IFilteringExpressionsTree | IFilteringExpression)[] = [];

    /**
     * Sets/gets the operator.
     * ```typescript
     * gridExpressionsTree.operator = FilteringLogic.And;
     * ```
     * ```typescript
     * let operator = gridExpressionsTree.operator;
     * ```
     * @memberof FilteringExpressionsTree
     */
    operator: FilteringLogic;

    /**
     * Sets/gets the field name of the column where the filtering expression is placed.
     * ```typescript
     *  gridExpressionTree.fieldName = 'Column Field';
     * ```
     * ```typescript
     * let columnField = expressionTree.fieldName;
     * ```
     * @memberof FilteringExpressionsTree
     */
    fieldName?: string;

    constructor(operator: FilteringLogic, fieldName?: string) {
        this.operator = operator;
        this.fieldName = fieldName;
    }

    /**
     * Returns the filtering expression for a column with the provided fieldName.
     * ```typescript
     * let filteringExpression = gridExpressionTree.find('Column Field');
     * ```
     * @memberof FilteringExpressionsTree
     */
    public find(fieldName: string): IFilteringExpressionsTree | IFilteringExpression {
        const index = this.findIndex(fieldName);

        if (index > -1) {
            return this.filteringOperands[index];
        }

        return null;
    }

    /**
     * Returns the index of the filtering expression for a column with the provided fieldName.
     * ```typescript
     * let filteringExpressionIndex = gridExpressionTree.findIndex('Column Field');
     * ```
     * @memberof FilteringExpressionsTree
     */
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
