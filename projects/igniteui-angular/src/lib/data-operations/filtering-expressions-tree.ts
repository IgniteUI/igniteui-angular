import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { IBaseEventArgs } from '../core/utils';
import { IFilteringOperation, IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, IgxFilteringOperand, IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxTimeFilteringOperand } from './filtering-condition';

/* mustCoerceToInt */
export enum FilteringExpressionsTreeType {
    Regular,
    Advanced
}

export declare interface IExpressionTree {
    filteringOperands: (IExpressionTree | IFilteringExpression)[];
    operator: FilteringLogic;
    fieldName?: string;
    entity?: string;
    returnFields?: string[];
}

/* marshalByValue */
export declare interface IFilteringExpressionsTree extends IBaseEventArgs, IExpressionTree {
    filteringOperands: (IFilteringExpressionsTree | IFilteringExpression)[];
    /* alternateName: treeType */
    type?: FilteringExpressionsTreeType;

    find(fieldName: string): IFilteringExpressionsTree | IFilteringExpression;

    findIndex(fieldName: string): number;
}

/* marshalByValue */
/* jsonAPIPlainObject */
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
     *
     * @memberof FilteringExpressionsTree
     */
    public filteringOperands: (IFilteringExpressionsTree | IFilteringExpression)[] = [];

    /**
     * Sets/gets the operator.
     * ```typescript
     * gridExpressionsTree.operator = FilteringLogic.And;
     * ```
     * ```typescript
     * let operator = gridExpressionsTree.operator;
     * ```
     *
     * @memberof FilteringExpressionsTree
     */
    public operator: FilteringLogic;

    /**
     * Sets/gets the field name of the column where the filtering expression is placed.
     * ```typescript
     * gridExpressionTree.fieldName = 'Column Field';
     * ```
     * ```typescript
     * let columnField = expressionTree.fieldName;
     * ```
     *
     * @memberof FilteringExpressionsTree
     */
    public fieldName?: string;

    /* alternateName: treeType */
    /**
     * Sets/gets the type of the filtering expressions tree.
     * ```typescript
     * gridExpressionTree.type = FilteringExpressionsTree.Advanced;
     * ```
     * ```typescript
     * let type = expressionTree.type;
     * ```
     *
     * @memberof FilteringExpressionsTree
     */
    public type?: FilteringExpressionsTreeType;

    /**
     * Sets/gets the entity.
     * ```typescript
     * gridExpressionsTree.entity = 'Entity A';
     * ```
     * ```typescript
     * let entity = gridExpressionsTree.entity;
     * ```
     *
     * @memberof FilteringExpressionsTree
     */
    public entity?: string;

    /**
     * Sets/gets the return fields.
     * ```typescript
     * gridExpressionsTree.returnFields = ['Column Field 1', 'Column Field 2'];
     * ```
     * ```typescript
     * let returnFields = gridExpressionsTree.returnFields;
     * ```
     *
     * @memberof FilteringExpressionsTree
     */
    public returnFields?: string[];

    /**
     * Array of filtering operand providers to be used when generating type hints
     * during serialization.
     * @memberof FilteringExpressionsTree
     */
    public static expressionTypes? = [
        IgxStringFilteringOperand,
        IgxNumberFilteringOperand,
        IgxBooleanFilteringOperand,
        IgxDateTimeFilteringOperand,
        IgxTimeFilteringOperand,
        IgxDateFilteringOperand,
        IgxFilteringOperand,
    ];

    constructor(operator: FilteringLogic, fieldName?: string, entity?: string, returnFields?: string[]) {
        this.operator = operator;
        this.entity = entity;
        this.returnFields = returnFields;
        this.fieldName = fieldName;
    }

    /**
     * Checks if filtering expressions tree is empty.
     *
     * @param expressionTree filtering expressions tree.
     */
    public static empty(expressionTree: IFilteringExpressionsTree): boolean {
        return !expressionTree || !expressionTree.filteringOperands || !expressionTree.filteringOperands.length;
    }

    /**
     * Returns the filtering expression for a column with the provided fieldName.
     * ```typescript
     * let filteringExpression = gridExpressionTree.find('Column Field');
     * ```
     *
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
     *
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
