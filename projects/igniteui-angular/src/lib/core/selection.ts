export class IgxSelectionAPIService {
    // If primaryKey is defined, then multiple selection is based on the primaryKey, and it is array of numbers, strings, etc.
    // If the primaryKey is omitted, then selection is based on the item data
    protected selection: Map<string,  any[]> = new Map<string, any[]>();

    protected prevSelection: Map<string,  any[]> = new Map<string, any[]>();

    public get_selection(componentID: string): any[] {
        return this.selection.get(componentID);
    }

    public get_prev_selection(componentID: string): any[] {
        return this.prevSelection.get(componentID);
    }
    public set_prev_selection(componentID: string, currSelection: any[]) {
       this.prevSelection.set(componentID, currSelection);
    }

    public set_selection(componentID: string, currSelection: any[]) {
        const sel = this.get_selection(componentID);
        if (sel && sel.length > 0) {
            this.set_prev_selection(componentID, sel);
        }
        this.selection.set(componentID, currSelection);
    }

    public get_selection_length(componentID: string): number {
        return (this.get_selection(componentID) || []).length;
    }

    /**
     * Add item to component selection using item's ID.
     * @param componentID ID of the component, which we add new item to.
     * @param itemID ID of the item to add to component selection.
     * @param compareFunc Custom function that search for already existing item with the provided ID.
     *     If not presented then item is compared by reference (using ===).
     * @param currSelection Used internally only by the selection (select_items method) to accumulate selection for multiple items.
     *
     * @returns selection after the new item is added
     */
    public select_item(componentID: string, itemID, compareFunc?: (item) => boolean, currSelection?: any[]): any[] {
        let itemPresented;
        if (!currSelection) {
            currSelection = this.get_selection(componentID);
        }
        if (currSelection === undefined) {
            currSelection = [];
        }
        currSelection = [...currSelection];

        if (!compareFunc) {
            itemPresented = currSelection.indexOf(itemID) !== -1;
        } else {
            itemPresented = currSelection.find(compareFunc) !== undefined;
        }
        if (!itemPresented) {
            currSelection.push(itemID);
        }
        return currSelection;
    }

    /**
     * Add items to component selection using their IDs.
     * @param componentID ID of the component, which we add new items to.
     * @param itemIDs Array of IDs of the items to add to component selection.
     * @param compareFunc Custom function that search for already existing items with the provided IDs.
     * If not presented then items are compared by reference (using ===).
     *
     * @returns selection after the new item is added
     */
    public select_items(componentID: string, itemIDs: any[], compareFunc?: (item) => boolean): any[] {
        let selection: any[];
        itemIDs.forEach((item) => selection = this.select_item(componentID, item, compareFunc, selection));
        return selection;
    }

    public append_items(componentID: string, itemIDs: any[]): any[] {
        let selection = this.get_selection(componentID);
        if (selection === undefined) {
            selection = [];
        }
        return [...selection, ...itemIDs];
    }

    /**
     * Remove item from component selection using item's ID.
     * @param componentID ID of the component, which we remove items from.
     * @param itemID ID of the item to remove from component selection.
     * @param compareFunc Custom function that compares item to deselect with those presented in the current selection.
     * If not presented, then the item equal by reference to any item from the selection (using ===) is removed.
     * @param currSelection Used internally only by the selection (deselect_items method) to accumulate deselected items.
     *
     * @returns selection after the item is removed
     */
    public deselect_item(componentID: string, itemID, compareFunc?: (item) => boolean, currSelection?: any[]) {
        if (!currSelection) {
            currSelection = this.get_selection(componentID);
        }
        if (currSelection === undefined) {
            return;
        }
        if (!compareFunc) {
            return currSelection.filter((item) => item !== itemID);
        } else {
            return currSelection.filter(compareFunc);
        }
    }

    /**
     * Remove items from component selection using their IDs.
     * @param componentID ID of the component, which we remove items from.
     * @param itemID ID of the items to remove from component selection.
     * @param compareFunc Custom function that compares items to deselect with those presented in the current selection.
     * If not presented, then all items equal by reference to any item from the selection (using ===) are removed.
     *
     * @returns selection after the item is removed
     */
    public deselect_items(componentID: string, itemIDs: any[], compareFunc?: (item) => boolean, ): any[] {
        let selection: any[];
        itemIDs.forEach((deselectedItem) => selection = this.deselect_item(componentID, deselectedItem, compareFunc, selection));
        return selection;
    }

    public subtract_items(componentID: string, itemIDs: any[]) {
        const selection = this.get_selection(componentID);
        return selection.filter((selectedItemID) => itemIDs.indexOf(selectedItemID) === -1);
    }

    public is_item_selected(componentID: string, currItemID, compareFunc?: (item) => boolean) {
        const currSelection = this.get_selection(componentID);
        if (!currSelection) {
            return false;
        }
        if (!compareFunc) {
            return currSelection.indexOf(currItemID) !== -1;
        } else {
            return currSelection.find(compareFunc) !== undefined;
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
