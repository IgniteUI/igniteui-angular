/**
 * Represents sorting expressions.
 */
export enum SortingDirection {
    Asc = 1,
    Desc = 2
}

export interface SortingExpression {
   fieldName: string;
   dir: SortingDirection;
   ignoreCase?: boolean;
}