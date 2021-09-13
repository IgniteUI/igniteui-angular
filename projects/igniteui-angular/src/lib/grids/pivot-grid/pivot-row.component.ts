import {
    ChangeDetectionStrategy,
    Component,
    forwardRef
} from '@angular/core';
import { IgxPivotGridComponent } from './pivot-grid.component';
import { IgxRowDirective } from '../row.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row',
    templateUrl: './pivot-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxPivotRowComponent) }]
})
export class IgxPivotRowComponent extends IgxRowDirective<IgxPivotGridComponent> {

    /**
     * @hidden
     * @internal
     */
     get viewIndex(): number {
        return this.index;
    }

}

