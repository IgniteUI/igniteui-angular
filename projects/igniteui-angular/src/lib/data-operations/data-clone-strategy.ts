import { cloneValue, cloneValueCached } from "../core/utils";

export interface IDataCloneStrategy {
    clone(data: any): any;
}

export class DefaultDataCloneStrategy implements IDataCloneStrategy {
    public clone(data: any): any {
        return cloneValue(data);
    }
}

export class CachedDataCloneStrategy implements IDataCloneStrategy {
    public clone(data: any): any {
        return cloneValueCached(data, new Map<any, any>);
    }
}
