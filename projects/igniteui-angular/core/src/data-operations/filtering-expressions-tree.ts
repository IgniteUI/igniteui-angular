import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { IBaseEventArgs } from '../core/utils';
import { ExpressionsTreeUtil } from './expressions-tree-util';

/* mustCoerceToInt */
export enum FilteringExpressionsTreeType {
    Regular,
    Advanced
}

/* marshalByValue */
export declare interface IExpressionTree {
    filteringOperands: (IExpressionTree | IFilteringExpression)[];
    operator: FilteringLogic;
    fieldName?: string | null;
    entity?: string | null;
    returnFields?: string[] | null;
}

/* alternateBaseType: ExpressionTree */
/* marshalByValue */
export declare interface IFilteringExpressionsTree extends IBaseEventArgs, IExpressionTree {
    filteringOperands: (IFilteringExpressionsTree | IFilteringExpression)[];
    /* alternateName: treeType */
    type?: FilteringExpressionsTreeType;

    /* blazorSuppress */
    /**
     * @deprecated in version 18.2.0. Use `ExpressionsTreeUtil.find` instead.
     */
    find?: (fieldName: string) => IFilteringExpressionsTree | IFilteringExpression;

    /* blazorSuppress */
    /**
     * @deprecated in version 18.2.0. Use `ExpressionsTreeUtil.findIndex` instead.
     */
    findIndex?: (fieldName: string) => number;
}

/* marshalByValue */
/* jsonAPIPlainObject */
export class FilteringExpressionsTree implements IFilteringExpressionsTree {

    /**
     * Sets/gets the filtering operands.
     *
     * @memberof FilteringExpressionsTree
     */
    public filteringOperands: (IFilteringExpressionsTree | IFilteringExpression)[] = [];

    /**
     * Sets/gets the operator.
     *
     * @memberof FilteringExpressionsTree
     */
    public operator: FilteringLogic;

    /**
     * Sets/gets the field name of the column where the filtering expression is placed.
     *
     * @memberof FilteringExpressionsTree
     */
    public fieldName?: string;

    /* alternateName: treeType */
    /**
     * Sets/gets the type of the filtering expressions tree.
     *
     * @memberof FilteringExpressionsTree
     */
    public type?: FilteringExpressionsTreeType;

    /**
     * Sets/gets the entity.
     *
     * @memberof FilteringExpressionsTree
     */
    public entity?: string;

    /**
     * Sets/gets the return fields.
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

    /* blazorSuppress */
    /**
     * Returns the filtering expression for a column with the provided fieldName.
     *
     * @memberof FilteringExpressionsTree
     * @deprecated in version 18.2.0. Use `ExpressionsTreeUtil.find` instead.
     */
    public find(fieldName: string): IFilteringExpressionsTree | IFilteringExpression {
        return ExpressionsTreeUtil.find(this, fieldName);
    }

    /* blazorSuppress */
    /**
     * Returns the index of the filtering expression for a column with the provided fieldName.
     *
     * @memberof FilteringExpressionsTree
     * @deprecated in version 18.2.0. Use `ExpressionsTreeUtil.findIndex` instead.
     */
    public findIndex(fieldName: string): number {
        return ExpressionsTreeUtil.findIndex(this, fieldName);
    }
}
