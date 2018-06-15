import {
    ChangeDetectionStrategy,
    Component,
} from '@angular/core';
import { IgxDensityEnabledComponent } from '../core/density';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-groupby-drop-area',
    templateUrl: './groupby-drop-area.component.html'
})
export class IgxGridGroupByDropAreaComponent extends IgxDensityEnabledComponent {

    constructor() {
        super();
    }

    protected get hostClassPrefix() {
        return 'igx-drop-area';
    }
}
