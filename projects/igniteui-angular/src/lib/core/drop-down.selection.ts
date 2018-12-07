import { IDropDownItem } from '../drop-down/drop-down-utils';
import { EventEmitter } from '@angular/core';

export interface IDropDownServiceArgs {
    item: IDropDownItem;
    itemID: any;
}
export class IgxDropDownSelectionService {
    /**
     * If primaryKey is defined, then multiple selection is based on the primaryKey, and it is array of numbers, strings, etc.
     * If the primaryKey is omitted, then selection is based on the item data
     */
    protected selection: Set<any> = new Set<any>();

    public onSelection = new EventEmitter<IDropDownServiceArgs>();

    /**
     * Get current component selection.
     * @param componentID ID of the component.
     */
    public get(): Set<any> {
        return this.selection;
    }

    /**
     * Set new component selection.
     * @param componentID ID of the component.
     * @param newSelection The new component selection to be set.
     */
    public set(newSelection: Set<any>) {
        if (!newSelection) {
            throw Error('Please provide a valid collection');
        }
        this.selection = newSelection;
    }

    /**
     * Clears selection for component.
     * @param componentID ID of the component.
     */
    public clear() {
        this.selection = this.get_empty();
    }

    /**
     * Get current component selection length.
     * @param componentID ID of the component.
     */
    public size(): number {
        const sel = this.selection;
        return sel ? sel.size : 0;
    }

    /**
     * Creates new selection that consist of the new item added to the current component selection.
     * The returned collection is new Set,
     * therefore if you want to update component selection you need to call in addition the set_selection() method
     * or instead use the select_item() one.
     * @param componentID ID of the component, which we add new item to.
     * @param itemID ID of the item to add to component selection.
     * @param sel Used internally only by the selection (add_items method) to accumulate selection for multiple items.
     *
     * @returns Selection after the new item is added.
     */
    public add_item(itemID: any, sel?: Set<any>): Set<any> {
        if (!sel) {
            sel = new Set(this.get());
        }
        if (sel === undefined) {
            sel = this.get_empty();
        }
        if (!itemID && itemID !== 0) {
            throw Error('Invalid value for item id!');
        }
        sel.add(itemID);
        return sel;
    }

    /**
     * Creates new selection that consist of the new items added to the current component selection.
     * The returned collection is new Set,
     * therefore if you want to update component selection you need to call in addition the set_selection() method
     * or instead use the select_items() one.
     * @param componentID ID of the component, which we add new items to.
     * @param itemIDs Array of IDs of the items to add to component selection.
     * @param clearSelection If true it will clear previous selection.
     *
     * @returns Selection after the new items are added.
     */
    public add_items(itemIDs: any[], clearSelection?: boolean): Set<any> {
        let selection: Set<any>;
        if (clearSelection) {
            selection = this.get_empty();
        }
        itemIDs.forEach((item) => selection = this.add_item(item, selection));
        return selection;
    }

    /**
     * Add item to the current component selection.
     * @param componentID ID of the component, which we add new item to.
     * @param itemID ID of the item to add to component selection.
     * @param sel Used internally only by the selection (select_items method) to accumulate selection for multiple items.
     */
    public select_item(itemID, sel?: Set<any>) {
        this.set(this.add_item(itemID, sel));
    }

    /**
     * Add items to the current component selection.
     * @param componentID ID of the component, which we add new items to.
     * @param itemIDs Array of IDs of the items to add to component selection.
     * @param clearSelection If true it will clear previous selection.
     */
    public select_items(itemID: any[], clearSelection?: boolean) {
        this.set(this.add_items(itemID, clearSelection));
    }

    /**
     * Creates new selection that consist of the new items excluded from the current component selection.
     * The returned collection is new Set,
     * therefore if you want to update component selection you need to call in addition the set_selection() method
     * or instead use the deselect_item() one.
     * @param componentID ID of the component, which we remove items from.
     * @param itemID ID of the item to remove from component selection.
     * @param sel Used internally only by the selection (delete_items method) to accumulate deselected items.
     *
     * @returns Selection after the item is removed.
     */
    public delete_item(itemID, sel?: Set<any>): Set<any> {
        if (!sel) {
            sel = new Set(this.get());
        }
        if (sel === undefined) {
            return;
        }
        sel.delete(itemID);
        return sel;
    }

    /**
     * Creates new selection that consist of the new items removed to the current component selection.
     * The returned collection is new Set,
     * therefore if you want to update component selection you need to call in addition the set_selection() method
     * or instead use the deselect_items() one.
     * @param componentID ID of the component, which we remove items from.
     * @param itemID ID of the items to remove from component selection.
     *
     * @returns Selection after the items are removed.
     */
    public delete_items(itemIDs: any[]): Set<any> {
        let selection: Set<any>;
        itemIDs.forEach((deselectedItem) => selection = this.delete_item(deselectedItem, selection));
        return selection;
    }

    /**
     * Remove item from the current component selection.
     * @param componentID ID of the component, which we remove item from.
     * @param itemID ID of the item to remove from component selection.
     * @param sel Used internally only by the selection (deselect_items method) to accumulate selection for multiple items.
     */
    public deselect_item(itemID, sel?: Set<any>) {
        this.set(this.delete_item(itemID, sel));
    }

    /**
     * Remove items to the current component selection.
     * @param componentID ID of the component, which we add new items to.
     * @param itemIDs Array of IDs of the items to add to component selection.
     */
    public deselect_items(itemIDs: any[]) {
        this.set(this.delete_items(itemIDs));
    }

    /**
     * Check if the item is selected in the component selection.
     * @param componentID ID of the component.
     * @param itemID ID of the item to search.
     *
     * @returns If item is selected.
     */
    public is_item_selected(itemID: any): boolean {
        const sel = this.get();
        if (!sel) {
            return false;
        }
        return sel.has(itemID);
    }

    /**
     * Get first element in the selection.
     * This is correct when we have only one item in the collection (for single selection purposes)
     * and the method returns that item.
     * @param componentID ID of the component.
     *
     * @returns First element in the set.
     */
    public first_item() {
        const sel = this.get();
        if (sel && sel.size > 0) {
            return sel.values().next().value;
       }
    }

    /**
     * Returns whether all items are selected.
     * @param componentID ID of the component.
     * @param dataCount: number Number of items in the data.
     *
     * @returns If all items are selected.
     */
    public are_all_selected(dataCount: number): boolean {
        return this.size() === dataCount;
    }

    /**
     * Returns whether any of the items is selected.
     * @param componentID ID of the component.
     * @param data Entire data array.
     *
     * @returns If there is any item selected.
     */
    public are_none_selected(): boolean {
        return this.size() === 0;
    }

    /**
     * Get all primary key values from a data array. If there isn't a primary key defined that the entire data is returned instead.
     * @param data Entire data array.
     * @param primaryKey Data primary key.
     *
     * @returns Array of identifiers, either primary key values or the entire data array.
     */
    public get_all_ids(data: any[], primaryKey?): any[] {
        return primaryKey ? data.map((x) => x[primaryKey]) : data;
    }

    /**
     * Returns empty selection collection.
     * @returns empty set.
    */
    public get_empty(): Set<any> {
        return new Set();
    }
}
