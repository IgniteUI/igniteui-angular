import { FilteringLogic, IFilteringExpression } from '../../../data-operations/filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../../data-operations/filtering-expressions-tree';

/**
 * @hidden @internal
 */
export class FilterListItem {
    public value: any;
    public label: any;
    public isSelected: boolean;
    public indeterminate: boolean;
    public isFiltered: boolean;
    public isSpecial = false;
    public isBlanks = false;
    public children?: Array<FilterListItem>;
    public parent?: FilterListItem;
}

/**
 * @hidden
 */
export class ExpressionUI {
    public expression: IFilteringExpression;
    public beforeOperator: FilteringLogic;
    public afterOperator: FilteringLogic;
    public isSelected = false;
    public isVisible = true;
}

/**
 * @hidden @internal
 */
export class ActiveElement {
    public index: number;
    public id: string;
    public checked: boolean;
}

export function generateExpressionsList(expressions: IFilteringExpressionsTree | IFilteringExpression,
    operator: FilteringLogic,
    expressionsUIs: ExpressionUI[]): void {
    generateExpressionsListRecursive(expressions, operator, expressionsUIs);

    // The beforeOperator of the first expression and the afterOperator of the last expression should be null
    if (expressionsUIs.length) {
        expressionsUIs[expressionsUIs.length - 1].afterOperator = null;
    }
}


function generateExpressionsListRecursive(expressions: IFilteringExpressionsTree | IFilteringExpression,
    operator: FilteringLogic,
    expressionsUIs: ExpressionUI[]): void {
    if (!expressions) {
        return;
    }

    if (expressions instanceof FilteringExpressionsTree) {
        const expressionsTree = expressions as FilteringExpressionsTree;
        for (const operand of expressionsTree.filteringOperands) {
            generateExpressionsListRecursive(operand, expressionsTree.operator, expressionsUIs);
        }
        if (expressionsUIs.length) {
            expressionsUIs[expressionsUIs.length - 1].afterOperator = operator;
        }
    } else {
        const exprUI = new ExpressionUI();
        exprUI.expression = expressions as IFilteringExpression;
        exprUI.afterOperator = operator;

        const prevExprUI = expressionsUIs[expressionsUIs.length - 1];
        if (prevExprUI) {
            exprUI.beforeOperator = prevExprUI.afterOperator;
        }

        expressionsUIs.push(exprUI);
    }
}
