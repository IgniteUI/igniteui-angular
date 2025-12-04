import { cloneValue, cloneValueCached } from "../core/utils";

export interface IDataCloneStrategy {
    /**
     * Clones provided data
     * @param data primitive value, date and object to be cloned
     * @returns deep copy of provided value
     */
    clone(data: any): any;
}

/**
 * Simplified data clone strategy that deep clones primitive values, dates and objects.
 * Does not support circular references in objects.
 */
export class DefaultDataCloneStrategy implements IDataCloneStrategy {
    public clone(data: any): any {
        return cloneValue(data);
    }
}

/**
 * Data clone strategy that is uses cache to deep clone primitive values, dates and objects.
 * It allows using circular references inside object.
 */
export class CachedDataCloneStrategy implements IDataCloneStrategy {
    public clone(data: any): any {
        return cloneValueCached(data, new Map<any, any>);
    }
}
