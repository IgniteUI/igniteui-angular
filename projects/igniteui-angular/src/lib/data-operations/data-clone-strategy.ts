import { cloneValue } from "../core/utils";

export interface IDataCloneStrategy {
    clone(data: any[]): any[];
}

export class DefaultDataCloneStrategy implements IDataCloneStrategy {
    constructor() {  }

    public clone(data: any[]): any[] {
        return cloneValue(data);
    }
}
