import { IDropDownItem } from './drop-down-utils';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { IComboSelectionChangeEventArgs } from '../combo/combo.component';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface IDropDownServiceArgs {
    item: IDropDownItem;
    itemID: any;
}

export interface IDropDownSelectionServiceEvent {
    componentID: string;
    selectionEvent: IComboSelectionChangeEventArgs;
}
@Injectable({
    providedIn: 'root',
})
export class IgxDropDownSelectionService extends IgxSelectionAPIService {

    /**
     * Emitted when the selection is changed
     */
    protected onSelection = new Subject<IDropDownSelectionServiceEvent>();

    /**
     * Set new component selection.
     * @param componentID ID of the component.
     * @param newSelection The new component selection to be set.
     */
    public set(componentID: string, newSelection: Set<any>) {
        if (!componentID) {
            throw Error('Invalid value for component id!');
        }
        const oldSelection = this.get(componentID);
        if (oldSelection !== null && oldSelection !== undefined) {
            const selectionArgs: IDropDownSelectionServiceEvent = {
                componentID,
                selectionEvent: {
                    oldSelection: Array.from(oldSelection),
                    newSelection: Array.from(newSelection)
                }
            };
            this.onSelection.next(selectionArgs);
        }
        this.selection.set(componentID, newSelection);
    }

    public get selectionEmitter(): Observable<IDropDownSelectionServiceEvent> {
        return this.onSelection.asObservable();
    }

    public set_selected_item(componentID: string, itemID: any) {
        const selected = this.is_item_selected(componentID, itemID);
        if (!selected) {
            this.select_item(componentID, itemID);
        } else {
            this.deselect_item(componentID, itemID);
        }
    }
}
