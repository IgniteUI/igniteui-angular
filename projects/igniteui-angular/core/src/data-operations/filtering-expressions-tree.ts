import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { IBaseEventArgs } from '../core/utils';

/* mustCoerceToInt */
export enum FilteringExpressionsTreeType {
    Regular,
    Advanced
}

/* marshalByValue */
export declare interface IExpressionTree {
    filteringOperands: (IExpressionTree | IFilteringExpression)[];
    /* mustCoerceToInt */
    operator: FilteringLogic;
    fieldName?: string | null;
    entity?: string | null;
    returnFields?: string[] | null;
}

/* alternateBaseType: ExpressionTree */
/* marshalByValue */
/* skipEventDetails */
export declare interface IFilteringExpressionsTree extends IBaseEventArgs, IExpressionTree {
    filteringOperands: (IFilteringExpressionsTree | IFilteringExpression)[];
    /* alternateName: treeType */
    /* mustCoerceToInt */
    type?: FilteringExpressionsTreeType;
}

/* marshalByValue */
/* jsonAPIPlainObject */
/* skipEventDetails */
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
}
