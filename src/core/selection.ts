export class IgxSelectionAPIService {
    // If primaryKey is defined, then multiple selection is based on the primaryKey, and it is array of numbers, strings, etc.
    // If the primaryKey is omitted, then selection is based on the item data
    protected selection: Map<string,  any[]> = new Map<string, any[]>();

    // Single selection is saved in a different map, because it may be independant from multiple selection.
    // E.g. cell selection, can be used together with row selection.
    protected singleSelection: Map<string,  any> = new Map<string, any>();

    // Filtering data is saved when filtering pipe is applied and cleared when filtergin is cleared.
    protected filteredSelection: Map<string,  any[]> = new Map<string, any[]>();

    public get_selection(componentID: string): any[] {
        return this.selection.get(componentID);
    }

    public get_selection_length(componentID: string): number {
        return this.get_selection(componentID).length;
    }

    public select_item(componentID: string, itemID) {
        let currSelection = this.get_selection(componentID);
        if (currSelection === undefined) {
            currSelection = [];
        }
        if (currSelection.find((item) => item === itemID) === undefined) {
            currSelection.push(itemID);
            this.selection.set(componentID, currSelection);
        }
    }

    public select_items(componentID: string, itemIDs: any[]) {
        if (itemIDs.length === 0) {
            this.selection.set(componentID, []);
        } else {
            itemIDs.forEach((item) => this.select_item(componentID, item));
        }
    }

    public deselect_item(componentID: string, itemID) {
        const currSelection = this.get_selection(componentID);
        if (currSelection === undefined) {
            return;
        }
        /*const index = currSelection.indexOf(itemID, 0);
        if (index > -1) {
            currSelection.splice(index, 1);
            this.selection.set(componentID, currSelection);
        }*/
        this.selection.set(componentID, currSelection.filter((item) => item !== itemID));
    }

    public is_item_selected(componentID: string, itemID) {
        const selection = this.get_selection(componentID);
        if (selection && selection.find((item) => item === itemID) !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    public get_all_ids(data, primaryKey?) {
        return primaryKey ? data.map((x) => x[primaryKey]) : data;
    }

    public select_all(componentID: string, data, primaryKey?) {
        if (this.is_filtering_applied(componentID)) {
            this.select_filtered_items(componentID, primaryKey);
        } else {
            this.selection.set(componentID, this.get_all_ids(data, primaryKey));
        }
    }

    public deselect_all(componentID: string, primaryKey?) {
        if (this.is_filtering_applied(componentID)) {
            this.deselect_filtered_items(componentID, primaryKey);
        } else {
            this.selection.set(componentID, []);
        }
    }

    public are_all_selected(componentID: string, data): boolean {
        return this.get_selection_length(componentID) === data.length;
    }

    public are_none_selected(componentID: string): boolean {
        return this.get_selection_length(componentID) === 0;
    }

    public select_single_item(componentID: string, itemID) {
        this.singleSelection.set(componentID, itemID);
    }

    public deselect_single_item(componentID: string) {
        this.singleSelection.set(componentID, null);
    }

    public is_single_item_selected(componentID: string, itemID) {
        const currSelection = this.singleSelection.get(componentID);
        if (currSelection) {
            for (const prop in currSelection) {
                if (currSelection[prop] !== itemID[prop]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public save_filtered_data(componentID: string, filteredData: any[]) {
        this.filteredSelection.set(componentID, filteredData);
    }

    public clear_filtered_data(componentID: string) {
        this.filteredSelection.set(componentID, null);
    }

    public is_filtering_applied(componentID: string) {
        return !!this.filteredSelection.get(componentID);
    }

    public select_filtered_items(componentID: string, primaryKey?) {
        let currSelection = this.get_selection(componentID);
        const currFilteredSelection = this.filteredSelection.get(componentID);
        const currFilteredID = this.get_all_ids(currFilteredSelection, primaryKey);
        if (currSelection === undefined) {
            currSelection = [];
        }
        this.selection.set(componentID, [...currSelection, ...currFilteredSelection]);
    }

    public deselect_filtered_items(componentID: string, primaryKey?) {
        const currSelection = this.get_selection(componentID);
        const currFilteredSelection = this.filteredSelection.get(componentID);
        const currFilteredID = this.get_all_ids(currFilteredSelection, primaryKey);
        this.selection.set(componentID, currSelection.filter((item) => currFilteredID.indexOf(item) === -1));
    }

    public filtered_items_status(componentID: string, filteredData: any[], primaryKey?) {
        const currSelection = this.get_selection(componentID);
        let atLeastOneSelected = false;
        let notAllSelected = false;
        if (currSelection) {
            for (const key of Object.keys(filteredData)) {
                const dataItem = primaryKey ? filteredData[key][primaryKey] : filteredData[key];
                if (currSelection.find((item) => item === dataItem) !== undefined) {
                    atLeastOneSelected = true;
                    if (notAllSelected) {
                        return "indeterminate";
                    }
                } else {
                    notAllSelected = true;
                    if (atLeastOneSelected) {
                        return "indeterminate";
                    }
                }
            }
        }
        return atLeastOneSelected ? "allSelected" : "noneSelected";
    }
}
