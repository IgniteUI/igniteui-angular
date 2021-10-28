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

    public onDimDragEnter(event, dimension: PivotDimensionType) {
        const typeMismatch = dimension !== undefined ? this.grid.pivotConfiguration.values.find(x => x.member === event.dragChip.id) :
        !this.grid.pivotConfiguration.values.find(x => x.member === event.dragChip.id);
        if (typeMismatch) {
            // cannot drag between dimensions and value
            return;
        }
        event.owner.nativeElement.style.borderLeft = '1px solid red';
    }
    public onDimDragLeave(event) {
        event.owner.nativeElement.style.borderLeft = '';
    }

    public onAreaDragEnter(event, area, dimension: PivotDimensionType) {
        const dragId = event.detail.owner.element.nativeElement.parentElement.id;
        const typeMismatch = dimension !== undefined ? this.grid.pivotConfiguration.values.find(x => x.member === dragId) :
        !this.grid.pivotConfiguration.values.find(x => x.member === dragId);
        if (typeMismatch) {
            // cannot drag between dimensions and value
            return;
        }
        const lastElem = area.chipsList.last.nativeElement;
        const targetElem = event.detail.originalEvent.target;
        const targetOwner = event.detail.owner.element.nativeElement.parentElement;
        if (targetOwner !== lastElem && targetElem.getBoundingClientRect().x >= lastElem.getBoundingClientRect().x) {
            area.chipsList.last.nativeElement.style.borderRight = '1px solid red';
        }
    }
    public onAreaDragLeave(event, area) {
        area.chipsList.toArray().forEach(element => {
            element.nativeElement.style.borderRight = '';
        });
    }

    public onValueDrop(event, area) {
        //values can only be reordered
        const currentDim = this.grid.pivotConfiguration.values;
        const dragId = event.dragChip?.id || event.dragData?.chip.id;
        const chipsArray = area.chipsList.toArray();
        const chipIndex = chipsArray.indexOf(event.owner) !== -1 ? chipsArray.indexOf(event.owner) : chipsArray.length;
        const newDim = currentDim.find(x => x.member === dragId);
        if (newDim) {
            const dragChipIndex = chipsArray.indexOf(event.dragChip || event.dragData.chip);
            currentDim.splice(dragChipIndex, 1);
            currentDim.splice(dragChipIndex > chipIndex ? chipIndex : chipIndex - 1, 0, newDim);
            this.grid.setupColumns();
        }
    }

    public onDimDrop(event, area, dimension: PivotDimensionType) {
        const dragId = event.dragChip?.id || event.dragData?.chip.id;
        const currentDim = dimension === PivotDimensionType.Row ? this.grid.pivotConfiguration.rows :
        this.grid.pivotConfiguration.columns;
        const chipsArray = area.chipsList.toArray();
        const chip = chipsArray.find(x => x.id === dragId);
        const isNewChip = chip === undefined;
        const chipIndex = chipsArray.indexOf(event.owner) !== -1 ? chipsArray.indexOf(event.owner) : chipsArray.length;
        if (isNewChip) {
            // chip moved from external collection
            const oppositeDim = dimension === PivotDimensionType.Row ? this.grid.pivotConfiguration.columns :
            this.grid.pivotConfiguration.rows;
            const dim = oppositeDim.find(x => x.fieldName === dragId);
            if (!dim) {
                // you have dragged something that is not a dimension
                return;
            }
            dim.enabled = false;
            if (dimension === PivotDimensionType.Row) {
                // opposite dimension has changed.
                this.grid.setupColumns();
            }

            const newDim = Object.assign({}, dim);
            newDim.enabled = true;
            currentDim.splice(chipIndex, 0, newDim);

        } else {
            // chip from same collection, reordered.
            const newDim = currentDim.find(x => x.fieldName === dragId);
            const dragChipIndex = chipsArray.indexOf(event.dragChip || event.dragData.chip);
            currentDim.splice(dragChipIndex, 1);
            currentDim.splice(dragChipIndex > chipIndex ? chipIndex : chipIndex - 1, 0, newDim);
        }
        if (dimension === PivotDimensionType.Column) {
            // if columns have changed need to regenerate columns.
            this.grid.setupColumns();
        }
        this.grid.pipeTrigger++;
    }
}
