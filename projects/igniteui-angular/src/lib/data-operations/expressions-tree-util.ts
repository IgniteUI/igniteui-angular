import { DateTimeUtil } from '../date-common/util/date-time.util';
import { EntityType, FieldType } from '../grids/common/grid.interface';
import { GridColumnDataType } from './data-util';
import { IFilteringOperation, IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, IgxFilteringOperand, IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxTimeFilteringOperand } from './filtering-condition';
import { IFilteringExpression } from './filtering-expression.interface';
import { IExpressionTree, IFilteringExpressionsTree } from './filtering-expressions-tree';

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

/**
 * Recreates the search value for a given expression.
 * @param searchValue The search value to recreate.
 * @param dataType The data type of the field.
 * @returns The recreated search value.
 */
function recreateSearchValue(searchValue: any, dataType: string): any {
    if (!dataType && !Array.isArray(searchValue)) {
        return searchValue;
    }
    // In ESF, values are stored as a Set.
    // Those values are converted to an array before returning string in the stringifyCallback
    // now we need to convert those back to Set
    if (Array.isArray(searchValue)) {
        return new Set(searchValue);
    } else if ((dataType.toLowerCase().includes('date') || dataType.toLowerCase().includes('time')) && !(searchValue instanceof Date)) {
        return DateTimeUtil.parseIsoDate(searchValue) ?? searchValue;
    }

    return searchValue;
}

/**
 * Returns the filtering logic function for a given dataType and condition (contains, greaterThan, etc.)
 * @param dataType The data type of the field.
 * @param name The name of the filtering condition.
 * @returns The filtering logic function.
 */
function getFilteringCondition(dataType: string, name: string): IFilteringOperation {
    let filters: IgxFilteringOperand;
    switch (dataType) {
        case GridColumnDataType.Boolean:
            filters = IgxBooleanFilteringOperand.instance();
            break;
        case GridColumnDataType.Number:
        case GridColumnDataType.Currency:
        case GridColumnDataType.Percent:
            filters = IgxNumberFilteringOperand.instance();
            break;
        case GridColumnDataType.Date:
            filters = IgxDateFilteringOperand.instance();
            break;
        case GridColumnDataType.Time:
            filters = IgxTimeFilteringOperand.instance();
            break;
        case GridColumnDataType.DateTime:
            filters = IgxDateTimeFilteringOperand.instance();
            break;
        case GridColumnDataType.String:
        default:
            filters = IgxStringFilteringOperand.instance();
            break;
    }
    return filters.condition(name);
}

/**
 * Recreates the IFilteringOperation for a given expression.
 * If the `logic` is already populated - it will return the original IFilteringOperation
 * of the expression.
 * @param expression The expression for which to resolve the IFilteringOperation.
 * @param dataType The data type of the field.
 * @returns The IFilteringOperation for the given expression.
 */
function recreateOperatorFromDataType(expression: IFilteringExpression, dataType: string): IFilteringOperation {
    if (!expression.condition?.logic) {
        return getFilteringCondition(dataType, expression.conditionName || expression.condition?.name);
    }

    return expression.condition;
}

/**
 * Recreates an expression from the given fields by applying the correct operands
 * and adjusting the search value to be the correct type.
 * @param expression The expression to recreate.
 * @param fields An array of fields to use for recreating the expression.
 * @returns The recreated expression.
 */
function recreateExpression(expression: IFilteringExpression, fields: FieldType[]): IFilteringExpression {
    const field = fields?.find(f => f.field === expression.fieldName);

    if (field && !expression.condition?.logic) {
        if (!field.filters) {
            expression.condition = recreateOperatorFromDataType(expression, field.dataType);
        } else {
            expression.condition = field.filters.condition(expression.conditionName || expression.condition?.name);
        }
    }

    if (!expression.condition && expression.conditionName) {
        throw Error('Wrong `conditionName`, `condition` or `field` provided!');
    }

    if (!expression.conditionName) {
        expression.conditionName = expression.condition?.name;
    }

    expression.searchVal = recreateSearchValue(expression.searchVal, field?.dataType);

    return expression;
}

/**
 * Checks if the given entry is an IExpressionTree.
 * @param entry The entry to check.
 * @returns True if the entry is an IExpressionTree, false otherwise.
 */
export function isTree(entry: IExpressionTree | IFilteringExpression): entry is IExpressionTree {
    return 'operator' in entry;
}

/**
 * Recreates the tree from a given array of entities by applying the correct operands
 * for each expression and adjusting the search values to be the correct type.
 * @param tree The expression tree to recreate.
 * @param entities An array of entities to use for recreating the tree.
 * @returns The recreated expression tree.
 */
export function recreateTree(tree: IExpressionTree, entities: EntityType[]): IExpressionTree {
    const entity = entities.find(e => e.name === tree.entity);

    for (let i = 0; i < tree.filteringOperands.length; i++) {
        const operand = tree.filteringOperands[i];
        if (isTree(operand)) {
            tree.filteringOperands[i] = recreateTree(operand, entities);
        } else {
            if (operand.searchTree) {
                operand.searchTree = recreateTree(operand.searchTree, entities);
            }
            tree.filteringOperands[i] = recreateExpression(operand, entity?.fields);
        }
    }

    return tree;
}

/**
 * Recreates the tree from a given array of fields by applying the correct operands.
 * It is recommended to use `recreateTree` if there will be multiple entities in the tree
 * with potentially colliding field names.
 * @param tree The expression tree to recreate.
 * @param fields An array of fields to use for recreating the tree.
 */
export function recreateTreeFromFields(tree: IExpressionTree, fields: FieldType[]): IExpressionTree {
    for (let i = 0; i < tree.filteringOperands.length; i++) {
        const operand = tree.filteringOperands[i];
        if (isTree(operand)) {
            tree.filteringOperands[i] = recreateTreeFromFields(operand, fields);
        } else {
            if (operand.searchTree) {
                operand.searchTree = recreateTreeFromFields(operand.searchTree, fields);
            }
            tree.filteringOperands[i] = recreateExpression(operand, fields);
        }
    }

    return tree;
}
