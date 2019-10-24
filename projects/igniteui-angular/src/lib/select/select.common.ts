import { IgxDropDownBaseDirective, IgxDropDownItemBaseDirective } from '../drop-down';
import { OverlaySettings } from '../services';
import { IgxInputDirective } from '../input-group';

/** @hidden @internal */
export interface IgxSelectBase extends IgxDropDownBaseDirective {
    input: IgxInputDirective;
    readonly selectedItem: IgxDropDownItemBaseDirective;
    open(overlaySettings?: OverlaySettings);
    close();
    toggle(overlaySettings?: OverlaySettings);
    calculateScrollPosition(item: IgxDropDownItemBaseDirective): number;
    getFirstItemElement(): HTMLElement;
}
