import { IFilteringExpression } from './filtering-expression.interface';
import { IFilteringExpressionsTree } from './filtering-expressions-tree';

export class ExpressionsTreeUtil {
    /**
     * Returns the filtering expression for a column with the provided tree and fieldName.
     * ```typescript
     * let filteringExpression = ExpressionsTreeUtil.find(gridExpressionTree, 'Column Field');
     * ```
     */
    public static find(tree: IFilteringExpressionsTree, fieldName: string): IFilteringExpressionsTree | IFilteringExpression {
        const index = this.findIndex(tree, fieldName);

        if (index > -1) {
            return tree.filteringOperands[index];
        }

        return null;
    }

    /**
     * Returns the index of the filtering expression for a column with the provided tree and fieldName.
     * ```typescript
     * let filteringExpressionIndex = ExpressionsTreeUtil.findIndex(gridExpressionTree, 'Column Field');
     * ```
     */
    public static findIndex(tree: IFilteringExpressionsTree, fieldName: string): number {
        for (let i = 0; i < tree.filteringOperands.length; i++) {
            const expr = tree.filteringOperands[i];
            if ((expr as IFilteringExpressionsTree).operator !== undefined) {
                if (this.isFilteringExpressionsTreeForColumn(expr as IFilteringExpressionsTree, fieldName)) {
                    return i;
                }
            } else if ((expr as IFilteringExpression).fieldName === fieldName) {
                return i;
            }
        }

        return -1;
    }

    protected static isFilteringExpressionsTreeForColumn(expressionsTree: IFilteringExpressionsTree, fieldName: string): boolean {
        if (expressionsTree.fieldName === fieldName) {
            return true;
        }

        for (const expr of expressionsTree.filteringOperands) {
            if ((expr as IFilteringExpressionsTree).operator !== undefined) {
                return this.isFilteringExpressionsTreeForColumn(expr as IFilteringExpressionsTree, fieldName);
            } else if ((expr as IFilteringExpression).fieldName === fieldName) {
                return true;
            }
        }
        return false;
    }
}
