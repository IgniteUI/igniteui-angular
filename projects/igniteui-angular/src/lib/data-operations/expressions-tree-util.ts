import { DateTimeUtil } from '../date-common/util/date-time.util';
import { EntityType, FieldType } from '../grids/common/grid.interface';
import { GridColumnDataType } from './data-util';
import { IFilteringOperation, IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, IgxFilteringOperand, IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxTimeFilteringOperand } from './filtering-condition';
import { IFilteringExpression } from './filtering-expression.interface';
import { IExpressionTree } from './filtering-expressions-tree';

export class ExpressionsTreeUtil {
    public static recreateTreeFromEntities(tree: IExpressionTree, entities: EntityType[]): IExpressionTree {
        const isTree = (entry: IExpressionTree | IFilteringExpression): entry is IExpressionTree => {
            return 'operator' in entry;
        }

        const entity = entities.find(e => e.name === tree.entity);

        for (let i = 0; i < tree.filteringOperands.length; i++) {
            const operand = tree.filteringOperands[i];
            if (isTree(operand)) {
                tree.filteringOperands[i] = this.recreateTreeFromEntities(operand, entities);
            } else {
                if (operand.searchTree) {
                    operand.searchTree = this.recreateTreeFromEntities(operand.searchTree, entities);
                }
                tree.filteringOperands[i] = this.recreateExpression(operand, entity?.fields);
            }
        }

        return tree;
    }

    /**
     * Recreates the IFilteringOperation for a given expression.
     * If the `logic` is already populated - it will return the original IFilteringOperation
     * of the expression.
     * @param expression The expression for which to resolve the IFilteringOperation.
     * @param dataType The data type of the field.
     * @returns The IFilteringOperation for the given expression.
     */
    public static recreateOperatorFromDataType(expression: IFilteringExpression, dataType: string): IFilteringOperation {
        if (!expression.condition?.logic) {
            return this.generateFilteringCondition(dataType, expression.conditionName || expression.condition?.name);
        }

        return expression.condition;
    }

    public static recreateSearchValue(searchValue: any, dataType: string): any {
        if (!dataType) {
            return searchValue;
        }
        // In ESF, values are stored as a Set.
        // Those values are converted to an array before returning string in the stringifyCallback
        // now we need to convert those back to Set
        if (Array.isArray(searchValue)) {
            return new Set(searchValue);
        } else if (dataType.toLowerCase().includes('date') || dataType.toLowerCase().includes('time')) {
            return DateTimeUtil.parseIsoDate(searchValue);
        }

        return searchValue;
    }

    public static recreateExpression(expression: IFilteringExpression, fields: FieldType[]): IFilteringExpression {
        const field = fields?.find(f => f.field === expression.fieldName);

        if (field && !expression.condition?.logic) {
            if (!field.filters) {
                expression.condition = this.recreateOperatorFromDataType(expression, field.dataType);
            } else {
                expression.condition = field.filters.condition(expression.conditionName || expression.condition?.name);
            }
        }

        if (!expression.conditionName) {
            expression.conditionName = expression.condition?.name;
        }

        expression.searchVal = this.recreateSearchValue(expression.searchVal, field?.dataType);

        return expression;
    }

    /**
     * Returns the filtering logic function for a given dataType and condition (contains, greaterThan, etc.)
     */
    private static generateFilteringCondition(dataType: string, name: string): IFilteringOperation {
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
}
