import { IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, IgxFilteringOperand, IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxTimeFilteringOperand } from './filtering-condition';
import { IFilteringExpression, ISerializedFilteringExpression } from './filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree, ISerializedFilteringExpressionTree } from './filtering-expressions-tree';

export class FilteringUtil {
    /**
     * Recreates a `FilteringExpressionsTree` from a given JSON serialized string.
     * @param jsonString The serialized string to recreate the tree from.
     * @returns A fully reconstructed `FilteringExpressionsTree`.
     */
    public static recreateTreeFromJson(jsonString: string): FilteringExpressionsTree {
        return this.recreateTree(JSON.parse(jsonString));
    }

    /**
     * Recreates a `FilteringExpressionsTree` from its serialized model.
     * @param model The serialized model to recreate the tree from.
     * @returns A fully reconstructed `FilteringExpressionsTree`.
     */
    public static recreateTree(model: ISerializedFilteringExpressionTree): FilteringExpressionsTree {
        const isTree = (entry: ISerializedFilteringExpressionTree | ISerializedFilteringExpression): entry is IFilteringExpressionsTree => {
            return 'operator' in entry;
        }

        const tree = new FilteringExpressionsTree(model.operator, model.fieldName, model.entity, model.returnFields);
        for (const entry of model.filteringOperands) {
            if (isTree(entry)) {
                tree.filteringOperands.push(this.recreateTree(entry));
            } else {
                const op = this.recreateOperand({ ...entry as ISerializedFilteringExpression });
                if (op.searchTree) {
                    const subCond = op.searchTree as IFilteringExpressionsTree;
                    op.searchTree = this.recreateTree(subCond);
                }
                tree.filteringOperands.push(op);
            }
        }

        return tree;
    }

    /**
     * Reconstructs an `IFilteringExpression` from its serialized state, recreating the condition logic in the process.
     * @param operand The operand to reconstruct.
     * @returns A reconstructed operand with its condition instance populated.
     */
    protected static recreateOperand(operand: ISerializedFilteringExpression): IFilteringExpression {
        if (!operand.expressionType || operand.expressionType === 'unknown') {
            return this.recreateOperandFromValueType(operand);
        }

        switch (operand.expressionType) {
            case 'IgxStringFilteringOperand':
                operand.condition = { ...IgxStringFilteringOperand.instance().condition(operand.conditionName || operand.condition.name) };
                break;
            case 'IgxNumberFilteringOperand':
                operand.condition = { ...IgxNumberFilteringOperand.instance().condition(operand.conditionName || operand.condition.name) };
                break;
            case 'IgxBooleanFilteringOperand':
                operand.condition = { ...IgxBooleanFilteringOperand.instance().condition(operand.conditionName || operand.condition.name) };
                break;
            case 'IgxDateTimeFilteringOperand':
                operand.condition = { ...IgxDateTimeFilteringOperand.instance().condition(operand.conditionName || operand.condition.name) };
                break;
            case 'IgxTimeFilteringOperand':
                operand.condition = { ...IgxTimeFilteringOperand.instance().condition(operand.conditionName || operand.condition.name) };
                break;
            case 'IgxDateFilteringOperand':
                operand.condition = { ...IgxDateFilteringOperand.instance().condition(operand.conditionName || operand.condition.name) };
                break;
            case 'IgxFilteringOperand':
                operand.condition = { ...IgxFilteringOperand.instance().condition(operand.conditionName || operand.condition.name) };
                break;
        }

        return operand as IFilteringExpression;
    }

    /**
     * Recreates a `IFilteringExpression` from its serialized state by using the operand's `searchVal` to infer the filtering logic type.
     * @param operand The operand to reconstruct.
     * @returns A reconstructed operand with its condition instance populated.
     */
    protected static recreateOperandFromValueType(operand: ISerializedFilteringExpression): IFilteringExpression {
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
