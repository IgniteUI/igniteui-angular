import { IgxSelectionAPIService } from '../../core/selection';
import { Injectable } from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';

/** @hidden */
export class IgxHierarchicalSelectionAPIService extends IgxSelectionAPIService {
    protected hSelection: Map<string,  any> = new Map<string,  any>();

    public add_sub_item(rootID: string,  item?: any) {
        this.hSelection.set(rootID, item);
    }

    public get_sub_item(rootID: string) {
        return this.hSelection.get(rootID);
    }

    public clear_sub_item(rootID: string) {
        return this.hSelection.set(rootID, null);
    }

}
