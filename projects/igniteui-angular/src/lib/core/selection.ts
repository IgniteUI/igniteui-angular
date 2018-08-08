export class IgxSelectionAPIService {
    // If primaryKey is defined, then multiple selection is based on the primaryKey, and it is array of numbers, strings, etc.
    // If the primaryKey is omitted, then selection is based on the item data
    protected selection: Map<string,  Set<any>> = new Map<string, Set<any>>();

    public get_selection(componentID: string): Set<any> {
        return this.selection.get(componentID);
    }

    public set_selection(componentID: string, currSelection: Set<any>) {
        this.selection.set(componentID, currSelection);
    }

    public get_selection_length(componentID: string): number {
        const sel = this.get_selection(componentID);
        return sel ? sel.size : 0;
    }

    /**
     * Add item to component selection using item's ID.
     * @param componentID ID of the component, which we add new item to.
     * @param itemID ID of the item to add to component selection.
     * @param sel Used internally only by the selection (select_items method) to accumulate selection for multiple items.
     *
     * @returns selection after the new item is added
     */
    public select_item(componentID: string, itemID, sel?: Set<any>): Set<any> {
        if (!sel) {
            sel = new Set(this.get_selection(componentID));
        }
        if (sel === undefined) {
            sel = new Set();
        }
        sel.add(itemID);
        return sel;
    }

    /**
     * Add items to component selection using their IDs.
     * @param componentID ID of the component, which we add new items to.
     * @param itemIDs Array of IDs of the items to add to component selection.
     *
     * @returns selection after the new item is added
     */
    public select_items(componentID: string, itemIDs: any[], clearSelection?: boolean): Set<any> {
        let selection: Set<any>;
        if (clearSelection) {
            selection = new Set();
        }
        itemIDs.forEach((item) => selection = this.select_item(componentID, item, selection));
        return selection;
    }

    /**
     * Remove item from component selection using item's ID.
     * @param componentID ID of the component, which we remove items from.
     * @param itemID ID of the item to remove from component selection.
     * @param sel Used internally only by the selection (deselect_items method) to accumulate deselected items.
     *
     * @returns selection after the item is removed
     */
    public deselect_item(componentID: string, itemID, sel?: Set<any>) {
        if (!sel) {
            sel = new Set(this.get_selection(componentID));
        }
        if (sel === undefined) {
            return;
        }
        sel.delete(itemID);
        return sel;
    }

    /**
     * Remove items from component selection using their IDs.
     * @param componentID ID of the component, which we remove items from.
     * @param itemID ID of the items to remove from component selection.
     *
     * @returns selection after the item is removed
     */
    public deselect_items(componentID: string, itemIDs: any[]): Set<any> {
        let selection: Set<any>;
        itemIDs.forEach((deselectedItem) => selection = this.deselect_item(componentID, deselectedItem, selection));
        return selection;
    }

    public is_item_selected(componentID: string, itemID) {
        const sel = this.get_selection(componentID);
        if (!sel) {
            return false;
        }
        return sel.has(itemID);
    }

    public get_selection_first(componentID: string) {
        const sel = this.get_selection(componentID);
        if (sel && sel.size > 0) {
            return sel.values().next().value;
       }
    }

    public get_all_ids(data, primaryKey?) {
        return primaryKey ? data.map((x) => x[primaryKey]) : data;
    }

    public are_all_selected(componentID: string, data): boolean {
        return this.get_selection_length(componentID) === data.length;
    }

    public are_none_selected(componentID: string): boolean {
        return this.get_selection_length(componentID) === 0;
    }
}
