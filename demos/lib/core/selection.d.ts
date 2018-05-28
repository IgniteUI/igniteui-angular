export declare class IgxSelectionAPIService {
    protected selection: Map<string, any[]>;
    protected filteredSelection: Map<string, any[]>;
    protected prevSelection: Map<string, any[]>;
    get_selection(componentID: string): any[];
    get_prev_selection(componentID: string): any[];
    set_prev_selection(componentID: string, currSelection: any[]): void;
    set_selection(componentID: string, currSelection: any[]): void;
    get_selection_length(componentID: string): number;
    select_item(componentID: string, itemID: any, currSelection?: any[]): any[];
    select_items(componentID: string, itemIDs: any[]): any[];
    append_items(componentID: string, itemIDs: any[]): any[];
    deselect_item(componentID: string, itemID: any, currSelection?: any[]): any[];
    deselect_items(componentID: string, itemIDs: any[]): any[];
    subtract_items(componentID: string, itemIDs: any[]): any[];
    is_item_selected(componentID: string, itemID: any): boolean;
    get_all_ids(data: any, primaryKey?: any): any;
    are_all_selected(componentID: string, data: any): boolean;
    are_none_selected(componentID: string): boolean;
}
