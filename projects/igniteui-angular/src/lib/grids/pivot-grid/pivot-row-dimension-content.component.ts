import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';
import { IgxGridHeaderRowComponent } from '../headers/grid-header-row.component';
import { IgxRowDirective } from '../row.directive';

/**
 *
 * For all intents & purposes treat this component as what a <thead> usually is in the default <table> element.
 *
 * This container holds the pivot grid header elements and their behavior/interactions.
 *
 * @hidden @internal
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row-dimension-content',
    templateUrl: './pivot-row-dimension-content.component.html'
})
export class IgxPivotRowDimensionContentComponent extends IgxGridHeaderRowComponent {
    /**
     * @hidden
     * @internal
     */
    @Input()
    public intRow: IgxRowDirective;
}
