import { IgxInputDirective } from 'igniteui-angular/input-group';
import { OverlaySettings } from 'igniteui-angular/core';
import { IgxDropDownBaseDirective, IgxDropDownItemBaseDirective } from 'igniteui-angular/drop-down';

/** @hidden @internal */
export interface IgxSelectBase extends IgxDropDownBaseDirective {
    input: IgxInputDirective;
    readonly selectedItem: IgxDropDownItemBaseDirective;
    open(overlaySettings?: OverlaySettings);
    close();
    toggle(overlaySettings?: OverlaySettings);
    calculateScrollPosition(item: IgxDropDownItemBaseDirective): number;
    getFirstItemElement(): HTMLElement;
    getEditElement(): HTMLElement; // returns input HTMLElement
}
