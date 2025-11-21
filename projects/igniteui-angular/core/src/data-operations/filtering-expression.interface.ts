import { IFilteringOperation } from './filtering-condition';
import { IExpressionTree } from './filtering-expressions-tree';

/**
 * Enumeration representing different filtering logic operators.
 * - And: Logical AND operator - all conditions must be met.
 * - Or: Logical OR operator - at least one condition must be met.
 */
export const FilteringLogic = {
    And: 'and',
    Or: 'or'
} as const;
export type FilteringLogic = (typeof FilteringLogic)[keyof typeof FilteringLogic];

/* marshalByValue */
/**
 * Represents filtering expressions.
 */
export declare interface IFilteringExpression {
    fieldName: string;
    condition?: IFilteringOperation | null;
    conditionName?: string | null;
    searchVal?: any;
    searchTree?: IExpressionTree | null;
    ignoreCase?: boolean;
}
