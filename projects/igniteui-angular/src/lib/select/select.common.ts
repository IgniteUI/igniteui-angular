import { IgxDropDownItemBaseDirective } from '../drop-down/drop-down-item.base';
import { IgxDropDownBaseDirective } from '../drop-down/drop-down.base';
import { IgxInputDirective } from '../input-group/public_api';
import { OverlaySettings } from '../services/overlay/utilities';

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
