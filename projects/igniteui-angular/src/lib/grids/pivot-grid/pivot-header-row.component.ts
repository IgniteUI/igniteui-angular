import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';
import { IBaseChipEventArgs } from '../../chips/chip.component';
import { IChipsAreaReorderEventArgs } from '../../chips/chips-area.component';
import { IgxGridHeaderRowComponent } from '../headers/grid-header-row.component';
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
    selector: 'igx-pivot-header-row',
    templateUrl: './pivot-header-row.component.html'
})
export class IgxPivotHeaderRowComponent extends IgxGridHeaderRowComponent {
    @Input()
    public row: IgxPivotRowComponent;

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

    public onDimDragEnter(event) {
        const isValue = this.grid.pivotConfiguration.values.find(x => x.member === event.dragChip.id);
        if (isValue) {
            // cannot drag value in dimensions
            return;
        }
        event.owner.nativeElement.style.borderLeft = '1px solid red';
    }
    public onDimDragLeave(event) {
        event.owner.nativeElement.style.borderLeft = '';
    }

    public onDimDrop(event, area, dimension: PivotDimensionType) {
        const currentDim = dimension === PivotDimensionType.Row ? this.grid.pivotConfiguration.rows :
        this.grid.pivotConfiguration.columns;
        const chipsArray = area.chipsList.toArray();
        const chip = chipsArray.find(x => x.id === event.dragChip.id);
        const isNewChip = chip === undefined;
        const currIndex = area.chipsList.toArray().indexOf(event.owner);
        if (isNewChip) {
            // chip moved from external collection
            const oppositeDim = dimension === PivotDimensionType.Row ? this.grid.pivotConfiguration.columns :
            this.grid.pivotConfiguration.rows;
            const dim = oppositeDim.find(x => x.fieldName === event.dragChip.id);
            if(!dim) {
                // you have dragged something that is not a dimension
                return;
            }
            dim.enabled = false;

            const newDim = Object.assign({}, dim);
            newDim.enabled = true;
            currentDim.splice(currIndex, 0, newDim);
            this.grid.setupColumns();
        } else {
            // chip from same collection, reordered.
            const newDim = currentDim.find(x => x.fieldName === event.dragChip.id);
            const dragChipIndex = chipsArray.indexOf(event.dragChip);
            currentDim.splice(dragChipIndex, 1);
            currentDim.splice(currIndex, 0, newDim);
        }
        this.grid.pipeTrigger++;
    }
}
