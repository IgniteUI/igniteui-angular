import { IDropDownBase, IDropDownItem } from './drop-down-utils';

export class IgxDropDownAPIService {
    constructor(protected dropdown: IDropDownBase) {}

    public item_index(itemID: any): number {
        return this.dropdown.items.indexOf(itemID);
    }

    public find_item(compareFunc: (item) => boolean): IDropDownItem {
        return this.dropdown.items.find(compareFunc);
    }

    public get item_focusable(): boolean {
        return this.dropdown.allowItemsFocus;
    }
}
