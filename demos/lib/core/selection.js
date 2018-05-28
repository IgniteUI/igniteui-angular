var IgxSelectionAPIService = (function () {
    function IgxSelectionAPIService() {
        this.selection = new Map();
        this.filteredSelection = new Map();
        this.prevSelection = new Map();
    }
    IgxSelectionAPIService.prototype.get_selection = function (componentID) {
        return this.selection.get(componentID);
    };
    IgxSelectionAPIService.prototype.get_prev_selection = function (componentID) {
        return this.prevSelection.get(componentID);
    };
    IgxSelectionAPIService.prototype.set_prev_selection = function (componentID, currSelection) {
        this.prevSelection.set(componentID, currSelection);
    };
    IgxSelectionAPIService.prototype.set_selection = function (componentID, currSelection) {
        var sel = this.get_selection(componentID);
        if (sel && sel.length > 0) {
            this.set_prev_selection(componentID, sel);
        }
        this.selection.set(componentID, currSelection);
    };
    IgxSelectionAPIService.prototype.get_selection_length = function (componentID) {
        return (this.get_selection(componentID) || []).length;
    };
    IgxSelectionAPIService.prototype.select_item = function (componentID, itemID, currSelection) {
        if (!currSelection) {
            currSelection = this.get_selection(componentID);
        }
        if (currSelection === undefined) {
            currSelection = [];
        }
        currSelection = currSelection.slice();
        if (currSelection.indexOf(itemID) === -1) {
            currSelection.push(itemID);
        }
        return currSelection;
    };
    IgxSelectionAPIService.prototype.select_items = function (componentID, itemIDs) {
        var _this = this;
        var selection;
        itemIDs.forEach(function (item) { return selection = _this.select_item(componentID, item, selection); });
        return selection;
    };
    IgxSelectionAPIService.prototype.append_items = function (componentID, itemIDs) {
        var selection = this.get_selection(componentID);
        if (selection === undefined) {
            selection = [];
        }
        return selection.concat(itemIDs);
    };
    IgxSelectionAPIService.prototype.deselect_item = function (componentID, itemID, currSelection) {
        if (!currSelection) {
            currSelection = this.get_selection(componentID);
        }
        if (currSelection === undefined) {
            return;
        }
        return currSelection.filter(function (item) { return item !== itemID; });
    };
    IgxSelectionAPIService.prototype.deselect_items = function (componentID, itemIDs) {
        var _this = this;
        var selection;
        itemIDs.forEach(function (deselectedItem) { return selection = _this.deselect_item(componentID, deselectedItem, selection); });
        return selection;
    };
    IgxSelectionAPIService.prototype.subtract_items = function (componentID, itemIDs) {
        var selection = this.get_selection(componentID);
        return selection.filter(function (selectedItemID) { return itemIDs.indexOf(selectedItemID) === -1; });
    };
    IgxSelectionAPIService.prototype.is_item_selected = function (componentID, itemID) {
        var selection = this.get_selection(componentID);
        if (selection && selection.indexOf(itemID) !== -1) {
            return true;
        }
        else {
            return false;
        }
    };
    IgxSelectionAPIService.prototype.get_all_ids = function (data, primaryKey) {
        return primaryKey ? data.map(function (x) { return x[primaryKey]; }) : data;
    };
    IgxSelectionAPIService.prototype.are_all_selected = function (componentID, data) {
        return this.get_selection_length(componentID) === data.length;
    };
    IgxSelectionAPIService.prototype.are_none_selected = function (componentID) {
        return this.get_selection_length(componentID) === 0;
    };
    return IgxSelectionAPIService;
}());
export { IgxSelectionAPIService };
