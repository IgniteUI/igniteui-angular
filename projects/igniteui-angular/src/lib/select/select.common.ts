import { IgxDropDownBase } from '../drop-down';
import { OverlaySettings } from '../services';

export interface IgxSelectBase extends IgxDropDownBase {
    open(overlaySettings?: OverlaySettings);
    close();
    toggle(overlaySettings?: OverlaySettings);
}
