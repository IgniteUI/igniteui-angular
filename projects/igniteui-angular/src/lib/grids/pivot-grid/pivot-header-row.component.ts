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

    private _dropIndicatorClass = 'igx-pivot-grid__drop-indicator';

    constructor(
        protected ref: ElementRef<HTMLElement>,
        protected cdr: ChangeDetectorRef,
        protected renderer: Renderer2,
        ) {
            super(ref, cdr);
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

    public filterRemoved(event: IBaseChipEventArgs) {
        const filter = this.grid.pivotConfiguration.filters.find(x => x.fieldName === event.owner.id);
        filter.enabled = false;
    }

    public onDimDragEnter(event, dimension: PivotDimensionType) {
        const typeMismatch = dimension !== undefined ? this.grid.pivotConfiguration.values.find(x => x.member === event.dragChip.id) :
        !this.grid.pivotConfiguration.values.find(x => x.member === event.dragChip.id);
        if (typeMismatch) {
            // cannot drag between dimensions and value
            return;
        }
        this.renderer.addClass(event.owner.nativeElement, this._dropIndicatorClass);
        // TODO- remove once classes are added.
        event.owner.nativeElement.style.borderLeft = '1px solid red';
    }
    public onDimDragLeave(event) {
        this.renderer.removeClass(event.owner.nativeElement, this._dropIndicatorClass);
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
        const lastElem = area.chipsList.last?.nativeElement;
        if (lastElem) {
            const targetElem = event.detail.originalEvent.target;
            const targetOwner = event.detail.owner.element.nativeElement.parentElement;
            if (targetOwner !== lastElem && targetElem.getBoundingClientRect().x >= lastElem.getBoundingClientRect().x) {
                this.renderer.addClass(area.chipsList.last.nativeElement, this._dropIndicatorClass);
                // TODO- remove once classes are added.
                area.chipsList.last.nativeElement.style.borderRight = '1px solid red';
            }
        }
    }
    public onAreaDragLeave(event, area) {
        area.chipsList.toArray().forEach(element => {
            this.renderer.removeClass(element.nativeElement, this._dropIndicatorClass);
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
        const currentDim = this.getDimensionsByType(dimension);
        const chipsArray = area.chipsList.toArray();
        const chip = chipsArray.find(x => x.id === dragId);
        const isNewChip = chip === undefined;
        //const chipIndex = chipsArray.indexOf(event.owner) !== -1 ? chipsArray.indexOf(event.owner) : chipsArray.length;
        const chipIndex = currentDim.findIndex(x => x.fieldName === event.owner.id) !== -1 ?
        currentDim.findIndex(x => x.fieldName === event.owner.id) : currentDim.length;
        if (isNewChip) {
            const allDims = this.grid.pivotConfiguration.rows
            .concat(this.grid.pivotConfiguration.columns)
            .concat(this.grid.pivotConfiguration.filters);
            // chip moved from external collection
            const dims = allDims.filter(x => x && x.fieldName === dragId);
            if (dims.length === 0) {
                // you have dragged something that is not a dimension
                return;
            }
            dims.forEach(element => {
                element.enabled = false;
            });

            const currentDimChild = currentDim.find(x => x && x.fieldName === dragId);
            if (currentDimChild) {
                currentDimChild.enabled = true;
                const dragChipIndex = currentDim.indexOf(currentDimChild);
                currentDim.splice(dragChipIndex, 1);
                currentDim.splice(dragChipIndex > chipIndex ? chipIndex : chipIndex - 1, 0, currentDimChild);
            } else {
                const newDim = Object.assign({}, dims[0]);
                newDim.enabled = true;
                currentDim.splice(chipIndex, 0, newDim);
            }
            const isDraggedFromColumn = !!this.grid.pivotConfiguration.columns?.find(x => x && x.fieldName === dragId);
            if (isDraggedFromColumn) {
                // columns have changed.
                this.grid.setupColumns();
            }
        } else {
            // chip from same collection, reordered.
            const newDim = currentDim.find(x => x.fieldName === dragId);
            //const dragChipIndex = chipsArray.indexOf(event.dragChip || event.dragData.chip);
            const dragChipIndex = currentDim.findIndex(x => x.fieldName === dragId);
            currentDim.splice(dragChipIndex, 1);
            currentDim.splice(dragChipIndex > chipIndex ? chipIndex : chipIndex - 1, 0, newDim);
        }
        if (dimension === PivotDimensionType.Column) {
            // if columns have changed need to regenerate columns.
            this.grid.setupColumns();
        }
        this.grid.pipeTrigger++;
    }

    protected getDimensionsByType(dimension: PivotDimensionType) {
        switch (dimension) {
            case PivotDimensionType.Row:
                if (!this.grid.pivotConfiguration.rows) {
                    this.grid.pivotConfiguration.rows = [];
                }
                return this.grid.pivotConfiguration.rows;
            case PivotDimensionType.Column:
                    if (!this.grid.pivotConfiguration.columns) {
                        this.grid.pivotConfiguration.columns = [];
                    }
                  return this.grid.pivotConfiguration.columns;
            case PivotDimensionType.Filter:
                if (!this.grid.pivotConfiguration.filters) {
                    this.grid.pivotConfiguration.filters = [];
                }
                return this.grid.pivotConfiguration.filters;
            default:
                return null;
        }
    }
}
