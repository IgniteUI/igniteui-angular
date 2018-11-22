import { ISortingStrategy } from './sorting-strategy';

/**
 * Represents sorting expressions.
 */
export enum SortingDirection {
    None = 0,
    Asc = 1,
    Desc = 2
}

export interface ISortingExpression {
   fieldName: string;
   dir: SortingDirection;
   ignoreCase: boolean;
   strategy: ISortingStrategy;
}
