import { Directive, Host } from '@angular/core';
import { IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import {
    AbsoluteScrollStrategy,
    ConnectedPositioningStrategy,
    HorizontalAlignment,
    OverlaySettings,
    PositionSettings,
    VerticalAlignment
} from '../../services/public_api';
import { IgxGridToolbarComponent } from './grid-toolbar.component';


/**
 * Base class for the pinning/hiding column actions.
 *
 * @hidden
 * @internal
 */
@Directive()
export abstract class BaseToolbarDirective {

    /**
     * Returns the grid containing this component.
     */
    public get grid() {
        return this.toolbar.grid;
    }

    constructor(@Host() protected toolbar: IgxGridToolbarComponent) { }

    public toggle(anchorElement: HTMLElement, toggleRef: IgxToggleDirective): void {
        const settings = _makeOverlaySettings();
        settings.target = anchorElement;
        settings.outlet = this.grid.outlet;
        toggleRef.toggle(settings);
    }
}


function _makeOverlaySettings(): OverlaySettings {
    const positionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Left,
        horizontalStartPoint: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        verticalStartPoint: VerticalAlignment.Bottom
    };
    return {
        positionStrategy: new ConnectedPositioningStrategy(positionSettings),
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true,
        excludePositionTarget: true
    };
}
