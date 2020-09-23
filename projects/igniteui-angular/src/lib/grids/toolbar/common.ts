import { Directive, TemplateRef } from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxHierarchicalGridComponent } from '../hierarchical-grid/public_api';
import { GridType } from '../common/grid.interface';
import { IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import {
    AbsoluteScrollStrategy,
    ConnectedPositioningStrategy,
    HorizontalAlignment,
    OverlaySettings,
    PositionSettings,
    VerticalAlignment
} from '../../services/public_api';


// tslint:disable-next-line: directive-selector
@Directive({ selector: '[excelText],excel-text' })
export class IgxExcelTextDirective { }


// tslint:disable-next-line: directive-selector
@Directive({ selector: '[csvText],csv-text' })
export class IgxCSVTextDirective { }

/**
 * Provides a way to template the title portion of the toolbar in the grid.
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridToolbarComponent
 *
 * @example
 * ```html
 * <igx-grid-toolbar-title>My custom title</igx-grid-toolbar-title>
 * ```
 */
@Directive({ selector: '[igxGridToolbarTitle],igx-grid-toolbar-title' })
export class IgxGridToolbarTitleDirective { }

/**
 * Provides a way to template the action portion of the toolbar in the grid.
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridToolbarComponent
 *
 * @example
 * ```html
 * <igx-grid-toolbar-actions>
 *  <some-toolbar-action-here />
 * </igx-grid-toolbar-actions>
 * ```
 */
@Directive({ selector: '[igxGridToolbarActions],igx-grid-toolbar-actions' })
export class IgxGridToolbarActionsDirective { }

export interface IgxGridToolbarTemplateContext {
    $implicit: IgxHierarchicalGridComponent;
}

@Directive({ selector: '[igxGridToolbar]'})
export class IgxGridToolbarDirective {
    constructor(public template: TemplateRef<IgxGridToolbarTemplateContext>) {}
}

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
        return this.api.grid;
    }

    constructor(protected api: GridBaseAPIService<IgxGridBaseDirective & GridType>) { }

    public toggle(anchorElement: HTMLElement, toggleRef: IgxToggleDirective): void {
        const settings = _makeOverlaySettings();
        settings.positionStrategy.settings.target = anchorElement;
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
