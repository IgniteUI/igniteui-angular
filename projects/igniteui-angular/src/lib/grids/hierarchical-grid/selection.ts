import { IgxSelectionAPIService } from '../../core/selection';
import { Injectable } from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';

/** @hidden */
export class IgxHierarchicalSelectionAPIService extends IgxSelectionAPIService {
    protected hSelection: Map<string,  Map<string, any>> = new Map<string,   Map<string, any>>();

    public add_sub_item(rootID: string,  parentID: string, cell: any) {
        const selItem = new Map<string, any>();
        selItem.set(parentID, cell);
        this.hSelection.set(rootID, selItem);
    }

    public get_sub_item(rootID: string) {
        let selItem;
        const sel = this.hSelection.get(rootID);
        if (sel) {
            selItem = {
                gridID: this.hSelection.get(rootID).keys().next().value ,
                cell: this.hSelection.get(rootID).values().next().value
            };
        }
        return selItem;
    }

    public clear_sub_item(rootID: string) {
        return this.hSelection.set(rootID, null);
    }

}
