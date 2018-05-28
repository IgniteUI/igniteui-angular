import { QueryList as viewEngine_QueryList } from '../linker/query_list';
import { Type } from '../type';
import { LNode } from './interfaces/node';
import { LQueries, QueryReadType } from './interfaces/query';
/**
 * A predicate which determines if a given element/directive should be included in the query
 * results.
 */
export interface QueryPredicate<T> {
    /**
     * If looking for directives then it contains the directive type.
     */
    type: Type<T> | null;
    /**
     * If selector then contains local names to query for.
     */
    selector: string[] | null;
    /**
     * Indicates which token should be read from DI for this query.
     */
    read: QueryReadType<T> | Type<T> | null;
}
/**
 * An object representing a query, which is a combination of:
 * - query predicate to determines if a given element/directive should be included in the query
 * - values collected based on a predicate
 * - `QueryList` to which collected values should be reported
 */
export interface LQuery<T> {
    /**
     * Next query. Used when queries are stored as a linked list in `LQueries`.
     */
    next: LQuery<any> | null;
    /**
     * Destination to which the value should be added.
     */
    list: QueryList<T>;
    /**
     * A predicate which determines if a given element/directive should be included in the query
     * results.
     */
    predicate: QueryPredicate<T>;
    /**
     * Values which have been located.
     *
     * This is what builds up the `QueryList._valuesTree`.
     */
    values: any[];
}
export declare class LQueries_ implements LQueries {
    shallow: LQuery<any> | null;
    deep: LQuery<any> | null;
    constructor(deep?: LQuery<any>);
    track<T>(queryList: viewEngine_QueryList<T>, predicate: Type<T> | string[], descend?: boolean, read?: QueryReadType<T> | Type<T>): void;
    child(): LQueries | null;
    container(): LQueries | null;
    enterView(index: number): LQueries | null;
    addNode(node: LNode): void;
    removeView(index: number): void;
}
export declare type QueryList<T> = viewEngine_QueryList<T>;
export declare const QueryList: typeof viewEngine_QueryList;
/**
 * Creates and returns a QueryList.
 *
 * @param memoryIndex The index in memory where the QueryList should be saved. If null,
 * this is is a content query and the QueryList will be saved later through directiveCreate.
 * @param predicate The type for which the query will search
 * @param descend Whether or not to descend into children
 * @param read What to save in the query
 * @returns QueryList<T>
 */
export declare function query<T>(memoryIndex: number | null, predicate: Type<any> | string[], descend?: boolean, read?: QueryReadType<T> | Type<T>): QueryList<T>;
/**
 * Refreshes a query by combining matches from all active views and removing matches from deleted
 * views.
 * Returns true if a query got dirty during change detection, false otherwise.
 */
export declare function queryRefresh(queryList: QueryList<any>): boolean;
