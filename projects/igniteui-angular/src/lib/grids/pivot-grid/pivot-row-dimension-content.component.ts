import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    Renderer2
} from '@angular/core';
import { IBaseChipEventArgs } from '../../chips/chip.component';
import { IgxGridHeaderRowComponent } from '../headers/grid-header-row.component';
import { DropPosition } from '../moving/moving.service';
import { PivotDimensionType } from './pivot-grid.interface';
import { IgxPivotRowComponent } from './pivot-row.component';

export interface IgxGridRowSelectorsTemplateContext {
    $implicit: {
        selectedCount: number;
        totalCount: number;
        selectAll?: () => void;
        deselectAll?: () => void;
    };
}

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
    @Input()
    public row: IgxPivotRowComponent;
}
