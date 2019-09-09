import { IgxDropDownBase, IgxDropDownItemBase } from '../drop-down';
import { OverlaySettings } from '../services';
import { IgxInputDirective } from '../input-group';

/** @hidden @internal */
export interface IgxSelectBase extends IgxDropDownBase {
    input: IgxInputDirective;
    readonly selectedItem: IgxDropDownItemBase;
    open(overlaySettings?: OverlaySettings);
    close();
    toggle(overlaySettings?: OverlaySettings);
    calculateScrollPosition(item: IgxDropDownItemBase): number;
    getFirstItemElement(): HTMLElement;
}
