import { Injectable } from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { IComboSelectionChangeEventArgs } from '../combo/combo.component';
import { Observable, Subject } from 'rxjs';
import { IgxDropDownItemBase } from './drop-down-item.base';

export interface IDropDownServiceArgs {
    item: IgxDropDownItemBase;
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
    public set(componentID: string, newSelection: Set<any>, event?: Event): void {
        if (!componentID) {
            throw Error('Invalid value for component id!');
        }
        const oldSelection = this.get(componentID);
        const selectionEvent: IComboSelectionChangeEventArgs = {
            oldSelection: Array.from(oldSelection || this.get_empty()),
            newSelection: Array.from(newSelection || this.get_empty())
        };
        if (event) {
            selectionEvent.event = event;
        }
        const selectionArgs: IDropDownSelectionServiceEvent = {
            componentID,
            selectionEvent
        };
        this.onSelection.next(selectionArgs);
        const newSet = this.add_items(componentID, selectionEvent.newSelection, true);
        super.set(componentID, newSet);
    }

    public get selectionEmitter(): Observable<IDropDownSelectionServiceEvent> {
        return this.onSelection.asObservable();
    }

    public set_selected_item(componentID: string, itemID: any, event?: Event): void {
        const selected = this.is_item_selected(componentID, itemID);
        let newSelection;
        if (itemID === null || itemID === undefined) {
            return;
        }
        if (!selected) {
            newSelection = this.add_item(componentID, itemID);
        } else {
            newSelection = this.delete_item(componentID, itemID);
        }
        this.set(componentID, newSelection, event);
    }
}
