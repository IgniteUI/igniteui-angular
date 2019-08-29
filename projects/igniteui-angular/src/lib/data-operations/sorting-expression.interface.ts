import { ISortingStrategy } from './sorting-strategy';
import { IBaseEventArgs } from '../core/utils';

/**
 * Represents sorting expressions.
 */
export enum SortingDirection {
    None = 0,
    Asc = 1,
    Desc = 2
}

export interface ISortingExpression extends IBaseEventArgs {
   fieldName: string;
   dir: SortingDirection;
   ignoreCase?: boolean;
   strategy?: ISortingStrategy;
}
