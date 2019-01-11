import { Component, ElementRef, ChangeDetectorRef, ViewChildren, QueryList, Input } from '@angular/core';
import { IgxDropDownBase, IgxDropDownItemBase } from '../../drop-down/drop-down.base';
import { IgxSelectionAPIService } from '../../core/selection';
import { IgxDropDownItemComponent } from '../../drop-down/drop-down-item.component';

@Component({
    selector: 'igx-autocomplete-dropdown',
    templateUrl: 'autocomplete.dropdown.component.html',
    providers: [{ provide: IgxDropDownBase, useExisting: IgxAutocompleteDropDownComponent }]
})
export class IgxAutocompleteDropDownComponent extends IgxDropDownBase {
    constructor(
        protected elementRef: ElementRef,
        protected cdr: ChangeDetectorRef,
        protected selection: IgxSelectionAPIService) {
        super(elementRef, cdr, selection);
    }

    @Input()
    data = [];

    @Input()
    width: any;

    private _list: QueryList<IgxDropDownItemBase>;

    @ViewChildren(IgxDropDownItemComponent, { read: IgxDropDownItemComponent })
    public set children(list: QueryList<IgxDropDownItemBase>) {
        this._list = list;
    }

    public get children(): QueryList<IgxDropDownItemBase> {
        return this._list;
    }

    // private _collapsed: boolean;
    // public setCollapsed(v: boolean) {
    //     this._collapsed = v;
    // }
}
