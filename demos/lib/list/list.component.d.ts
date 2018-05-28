import { ElementRef, EventEmitter, QueryList, TemplateRef } from "@angular/core";
import { IgxListItemComponent } from "./list-item.component";
import { IgxEmptyListTemplateDirective, IgxListPanState } from "./list.common";
export interface IPanStateChangeEventArgs {
    oldState: IgxListPanState;
    newState: IgxListPanState;
    item: IgxListItemComponent;
}
export interface IListItemClickEventArgs {
    item: IgxListItemComponent;
    event: Event;
}
export declare class IgxListComponent {
    private element;
    constructor(element: ElementRef);
    children: QueryList<IgxListItemComponent>;
    emptyListTemplate: IgxEmptyListTemplateDirective;
    protected defaultEmptyListTemplate: TemplateRef<any>;
    id: string;
    allowLeftPanning: boolean;
    allowRightPanning: boolean;
    onLeftPan: EventEmitter<IgxListItemComponent>;
    onRightPan: EventEmitter<IgxListItemComponent>;
    onPanStateChange: EventEmitter<IPanStateChangeEventArgs>;
    onItemClicked: EventEmitter<IListItemClickEventArgs>;
    readonly role: string;
    readonly isListEmpty: boolean;
    readonly cssClass: boolean;
    readonly items: IgxListItemComponent[];
    readonly headers: IgxListItemComponent[];
    readonly context: any;
    readonly template: TemplateRef<any>;
}
export declare class IgxListModule {
}
