import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';
import { IBaseChipEventArgs } from '../../chips/chip.component';
import { IChipsAreaReorderEventArgs } from '../../chips/chips-area.component';
import { IgxGridHeaderRowComponent } from '../headers/grid-header-row.component';
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
    selector: 'igx-pivot-header-row',
    templateUrl: './pivot-header-row.component.html'
})
export class IgxPivotHeaderRowComponent extends IgxGridHeaderRowComponent {
    @Input()
    public row: IgxPivotRowComponent;

    public columnsOrderChanged(event: IChipsAreaReorderEventArgs) {
        const newOrder = [];
        for (const chip of event.chipsArray) {
            const chipItem = this.grid.pivotConfiguration.columns.filter((item) => item.fieldName === chip.id)[0];
            newOrder.push(chipItem);
        }
        this.grid.pivotConfiguration.columns = newOrder;
        this.grid.setupColumns();
        this.grid.pipeTrigger++;
    }

    public rowsOrderChanged(event: IChipsAreaReorderEventArgs) {
        const newOrder = [];
        for (const chip of event.chipsArray) {
            const chipItem = this.grid.pivotConfiguration.rows.filter((item) => item.fieldName === chip.id)[0];
            newOrder.push(chipItem);
        }
        this.grid.pivotConfiguration.rows = newOrder;
    }

    public rowRemoved(event: IBaseChipEventArgs) {
        const row = this.grid.pivotConfiguration.rows.find(x => x.fieldName === event.owner.id);
        row.enabled = false;
        this.grid.pipeTrigger++;
    }

    public columnRemoved(event: IBaseChipEventArgs) {
        const col = this.grid.pivotConfiguration.columns.find(x => x.fieldName === event.owner.id);
        col.enabled = false;
        this.grid.setupColumns();
        this.grid.pipeTrigger++;
    }

    public valueRemoved(event: IBaseChipEventArgs) {
        const value = this.grid.pivotConfiguration.values.find(x => x.member === event.owner.id);
        value.enabled = false;
        this.grid.setupColumns();
        this.grid.pipeTrigger++;
    }
}
