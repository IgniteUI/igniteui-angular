import { FilteringExpressionsTree, IFilteringExpression, IFilteringExpressionsTree } from 'igniteui-angular';

export class FilteringUtil {
    /**
     * Returns the filtering expression for a column with the provided tree and fieldName.
     * ```typescript
     * let filteringExpression = FilteringUtil.find(gridExpressionTree, 'Column Field');
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
     * let filteringExpressionIndex = FilteringUtil.findIndex(gridExpressionTree, 'Column Field');
     * ```
     */
    public static findIndex(tree: IFilteringExpressionsTree, fieldName: string): number {
        let expr;
        for (let i = 0; i < tree.filteringOperands.length; i++) {
            expr = tree.filteringOperands[i];
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

    protected static isFilteringExpressionsTreeForColumn(expressionsTree: IFilteringExpressionsTree, fieldName: string): boolean {
        if (expressionsTree.fieldName === fieldName) {
            return true;
        }

        for (const expr of expressionsTree.filteringOperands) {
            if ((expr instanceof FilteringExpressionsTree)) {
                return this.isFilteringExpressionsTreeForColumn(expr, fieldName);
            } else if ((expr as IFilteringExpression).fieldName === fieldName) {
                return true;
            }
        }
        return false;
    }
}
