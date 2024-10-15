import { EntityType, FieldType } from '../grids/common/grid.interface';
import { GridColumnDataType } from './data-util';
import { IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, IgxFilteringOperand, IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxTimeFilteringOperand } from './filtering-condition';
import { IFilteringExpression } from './filtering-expression.interface';
import { FilteringExpressionsTree, IExpressionTree, IFilteringExpressionsTree } from './filtering-expressions-tree';

export class ExpressionsTreeUtil {
    /**
     * Returns the filtering logic function for a given dataType and condition (contains, greaterThan, etc.)
     */
    private static generateFilteringCondition(dataType: string, name: string) {
        let filters;
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
                tree.filteringOperands[i] = this.recreateExpression(operand, entity.fields);
                if(operand.searchTree) {
                    operand.searchTree = this.recreateTreeFromEntities(operand.searchTree, entities);
                }
            }
        }

        return tree;
    }

    public static recreateExpression(expression: IFilteringExpression, fields: FieldType[]): IFilteringExpression {
        const field = fields.find(f => f.field === expression.fieldName);
        if (field) {
            if (!field.filters) {
                expression.condition = this.generateFilteringCondition(field.dataType, expression.conditionName || expression.condition?.name);
            } else {
                expression.condition = field.filters.condition(expression.conditionName || expression.condition?.name);
            }
        } else {
            expression = this.recreateOperandFromValueType(expression);
        }

        return expression;
    }

    /**
     * Recreates a `IFilteringExpression` from its serialized state by using the operand's `searchVal` to infer the filtering logic type.
     * @param operand The operand to reconstruct.
     * @returns A reconstructed operand with its condition instance populated.
     */
    protected static recreateOperandFromValueType(operand: IFilteringExpression): IFilteringExpression {
        const isValidDate = (str: string) => {
            const date = Date.parse(str);
            return !isNaN(date);
        }

        const hasTime = (str: string) => {
            const parts = str.split(':');
            return parts.length === 3;
        };

        if (operand.searchVal === undefined || operand.searchVal === null) {
            operand.condition = { ...IgxFilteringOperand.instance().condition(operand.conditionName) };
            return operand;
        }

        if (typeof operand.searchVal === 'number') {
            operand.condition = { ...IgxNumberFilteringOperand.instance().condition(operand.conditionName) };
        } else if (typeof operand.searchVal === 'boolean') {
            operand.condition = { ...IgxBooleanFilteringOperand.instance().condition(operand.conditionName) };
        } else if (typeof operand.searchVal === 'string') {
            const hasTimeComponent = hasTime(operand.searchVal);

            // Check for date and time components
            if (isValidDate(operand.searchVal)) {
                operand.searchVal = new Date(operand.searchVal);
                if (hasTimeComponent) {
                    operand.condition = { ...IgxDateTimeFilteringOperand.instance().condition(operand.conditionName) };
                } else {
                    operand.condition = { ...IgxDateFilteringOperand.instance().condition(operand.conditionName) };
                }
                return operand;
            } else if(hasTimeComponent) {
                operand.searchVal = new Date('2024/12/30 ' + operand.searchVal);
                operand.condition = { ...IgxTimeFilteringOperand.instance().condition(operand.conditionName) };
                return operand;
            }

            operand.condition = { ...IgxStringFilteringOperand.instance().condition(operand.conditionName) };
        }

        return operand as IFilteringExpression;
    }
}
