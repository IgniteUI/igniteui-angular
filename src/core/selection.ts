export class IgxSelectionAPIService {
    // If primaryKey is defined, then multiple selection is based on the primaryKey, and it is array of numbers, strings, etc.
    // If the primaryKey is omitted, then selection is based on the item data
    protected selection: Map<string,  any[]> = new Map<string, any[]>();

    // Filtering data is saved when filtering pipe is applied and cleared when filtering is cleared.
    protected filteredSelection: Map<string,  any[]> = new Map<string, any[]>();

    public get_selection(componentID: string): any[] {
        return this.selection.get(componentID);
    }

    public set_selection(componentID: string, currSelection: any[]) {
        this.selection.set(componentID, currSelection);
    }

    public get_selection_length(componentID: string): number {
        return (this.get_selection(componentID) || []).length;
    }

    public select_item(componentID: string, itemID, currSelection?: any[]): any[] {
        if (!currSelection) {
            currSelection = this.get_selection(componentID);
        }
        if (currSelection === undefined) {
            currSelection = [];
        }
        if (currSelection.indexOf(itemID) === -1) {
            currSelection.push(itemID);
        }
        return currSelection;
    }

    public select_items(componentID: string, itemIDs: any[]): any[] {
        let selection: any[];
        itemIDs.forEach((item) => selection = this.select_item(componentID, item, selection));
        return selection;
    }

    public append_items(componentID: string, itemIDs: any[]): any[] {
        let selection = this.get_selection(componentID);
        if (selection === undefined) {
            selection = [];
        }
        return [...selection, ...itemIDs];
    }

    public deselect_item(componentID: string, itemID, currSelection?: any[]) {
        if (!currSelection) {
            currSelection = this.get_selection(componentID);
        }
        if (currSelection === undefined) {
            return;
        }
        return currSelection.filter((item) => item !== itemID);
    }

    public deselect_items(componentID: string, itemIDs: any[]): any[] {
        let selection: any[];
        itemIDs.forEach((deselectedItem) => selection = this.deselect_item(componentID, deselectedItem, selection));
        return selection;
    }

    public subtract_items(componentID: string, itemIDs: any[]) {
        const selection = this.get_selection(componentID);
        return selection.filter((selectedItemID) => itemIDs.indexOf(selectedItemID) === -1);
    }

    public is_item_selected(componentID: string, itemID) {
        const selection = this.get_selection(componentID);
        if (selection && selection.indexOf(itemID) !== -1) {
            return true;
        } else {
            return false;
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
