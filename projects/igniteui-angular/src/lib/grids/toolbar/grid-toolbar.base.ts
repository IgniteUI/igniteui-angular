import { Directive, Host, Input } from '@angular/core';
import { first } from 'rxjs/operators';
import { IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import {
    AbsoluteScrollStrategy,
    ConnectedPositioningStrategy,
    HorizontalAlignment,
    OverlaySettings,
    PositionSettings,
    VerticalAlignment
} from '../../services/public_api';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
import { IgxGridToolbarComponent } from './grid-toolbar.component';


/**
 * Base class for the pinning/hiding column actions.
 * @hidden @internal
 */
@Directive()
export abstract class BaseToolbarDirective {

    /**
     * Sets the height of the column list in the dropdown.
     */
    @Input()
    columnListHeight: string;

    /**
     * Returns the grid containing this component.
     */
    public get grid() {
        return this.toolbar.grid;
    }

    constructor(@Host() protected toolbar: IgxGridToolbarComponent) { }

    public toggle(anchorElement: HTMLElement, toggleRef: IgxToggleDirective, actions?: IgxColumnActionsComponent): void {
        if (actions) {
            const setHeight = () => actions.columnsAreaMaxHeight = this.columnListHeight ?? `${Math.max(this.grid.calcHeight, 200)}px`;
            toggleRef.onOpening.pipe(first()).subscribe(setHeight);
        }
        toggleRef.toggle({ ..._makeOverlaySettings(), ...{ target: anchorElement, outlet: this.grid.outlet }});
    }

    /** @hidden @internal */
    public focusSearch(columnActions: HTMLElement) {
        columnActions.querySelector('input')?.focus();
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
        closeOnEscape: true,
        closeOnOutsideClick: true
    };
}
